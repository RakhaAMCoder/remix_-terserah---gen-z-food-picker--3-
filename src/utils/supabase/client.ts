import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const createClient = () => {
  try {
    if (!supabaseUrl || !supabaseKey || !isValidUrl(supabaseUrl)) {
      const missing: string[] = [];
      if (!supabaseUrl) missing.push("URL");
      if (!supabaseKey) missing.push("Key");
      if (supabaseUrl && !isValidUrl(supabaseUrl)) missing.push("Format URL (gunakan https://)");
      
      console.warn(`Supabase belum dikonfigurasi: ${missing.join(", ")}`);
      return null; 
    }
    
    return createBrowserClient(
      supabaseUrl,
      supabaseKey,
    );
  } catch (error) {
    console.error("Gagal membuat client Supabase:", error);
    return null;
  }
};
