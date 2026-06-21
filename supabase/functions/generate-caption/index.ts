import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "npm:@google/genai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, message: 'Hanya menerima request POST' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: 'Body request harus berupa JSON valid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { imageBase64, mimeType, menuName, category, price, notes } = body

    if (!imageBase64 || !mimeType) {
      return new Response(
        JSON.stringify({ success: false, message: 'Foto makanan (imageBase64 & mimeType) wajib dikirim.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // tapi untuk sekarang kita ikuti sistem array manual seperti di server.ts sesuai request user.
    const apiKeys = [
      "AIzaSyBdXOTd9jS6N3wYAELp4JvhobscIgbgaog",
      "AIzaSyCzQGzuVqhzDGIwqroyYn75HDoz_Yeit5o",
      "AIzaSyDufEM6w39HCPC3X-rEMWoMhbyBjsN3c14",
      Deno.env.get("GEMINI_API_KEY")
    ].filter(Boolean) as string[]

    if (apiKeys.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'API Key Gemini tidak dikonfigurasi di Edge Function.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const promptText = `
      Tugas: Analisis gambar makanan ini dan buatlah caption/deskripsi yang natural, singkat, padat, menarik, dan asik untuk menu makanan Terserah App (konteks kuliner di Malang, santai ala Gen Z).
      
      Aturan Tambahan:
      1. Jangan terlalu lebay.
      2. Jangan mengarang bahan makanan yang tidak terlihat jelas.
      3. Jika gambar kurang jelas, tetap buat caption umum yang aman.
      
      Informasi Tambahan:
      - Nama Menu: ${menuName || 'Tidak diketahui'}
      - Kategori: ${category || 'Makanan/Minuman'}
      - Harga: ${price ? `Rp ${price}` : '-'}
      - Catatan Tambahan: ${notes || '-'}

      Kamu HARUS mengembalikan response dalam format JSON utuh sesuai skema ini:
      {
        "caption": "Caption makanan yang menarik bagi pembeli",
        "description": "Deskripsi singkat mengenai rasa, tekstur, atau penyajian makanan",
        "suggested_tags": ["pedas", "gurih", "murah", "manis", "segar"],
        "detected_food": "nama makanan asli yang kamu deteksi dari gambar",
        "confidence": "high" | "medium" | "low"
      }
    `

    let lastError: any = null
    let resultText = ""

    // Implement Key Rotation
    for (const key of apiKeys) {
      try {
        const ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        })

        const reqContent = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64
              }
            },
            promptText
          ],
          config: {
            responseMimeType: "application/json"
          }
        })

        if (reqContent && reqContent.text) {
          resultText = reqContent.text
          lastError = null
          break // Success, skip remaining keys!
        } else {
          throw new Error('AI Response did not return text content')
        }
      } catch (err: any) {
        lastError = err
        console.warn(`[Edge Function Key Rotation] Key failed, trying next key... Error: ${err.message}`)
      }
    }

    if (lastError || !resultText) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: lastError ? `AI sedang sibuk atau limit: ${lastError.message}` : "Gagal membuat auto caption. Coba lagi nanti." 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    try {
      // Parse the JSON representation returned by Gemini
      const cleanJsonStr = resultText.trim()
      const parsedData = JSON.parse(cleanJsonStr)

      return new Response(
        JSON.stringify({
          success: true,
          caption: parsedData.caption || "",
          description: parsedData.description || "",
          suggested_tags: parsedData.suggested_tags || parsedData.tags || [],
          detected_food: parsedData.detected_food || parsedData.detectedFood || "",
          confidence: parsedData.confidence || "medium"
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (parseErr: any) {
      console.error("Gagal parse JSON hasil Gemini:", parseErr, "Raw output:", resultText)
      // Fallback in case response is not clean JSON
      return new Response(
        JSON.stringify({
          success: true,
          caption: resultText.slice(0, 100) + "...",
          description: resultText,
          suggested_tags: ["kuliner", "lezat"],
          detected_food: menuName || "",
          confidence: "low"
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (globalError: any) {
    console.error("Global Edge Function Error:", globalError)
    return new Response(
      JSON.stringify({ success: false, message: globalError.message || "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
