# Terserah - Malang Food Picker 🍜

Aplikasi rekomendasi kuliner Malang berbasis AI (Gemini) dan Google Maps.

## Cara Menjalankan di Visual Studio Code

Ikuti langkah-langkah berikut untuk menjalankan aplikasi ini di komputer lokal Anda:

### 1. Prasyarat
Pastikan Anda sudah menginstal:
*   **Node.js** (Versi 18 atau lebih baru) - [Download di sini](https://nodejs.org/)
*   **Visual Studio Code** - [Download di sini](https://code.visualstudio.com/)

### 2. Persiapan Proyek
1.  Download atau salin semua file proyek ini ke dalam satu folder di komputer Anda.
2.  Buka folder tersebut di Visual Studio Code (**File > Open Folder...**).

### 3. Instalasi Dependensi
Buka terminal di VS Code (**Terminal > New Terminal**) dan jalankan perintah berikut:
```bash
npm install
```

### 4. Konfigurasi Environment Variables
1.  Buat file baru bernama `.env` di root direktori (sejajar dengan `package.json`).
2.  Salin isi dari `.env.example` ke dalam `.env`.
3.  Isi API Key Anda:
    *   `GEMINI_API_KEY`: Dapatkan di [Google AI Studio](https://aistudio.google.com/app/apikey).

### 5. Menjalankan Aplikasi
Di terminal VS Code, jalankan:
```bash
npm run dev
```
Setelah itu, buka browser dan akses `http://localhost:3000`.

## Fitur Utama
*   **AI ChatBot**: Tanya rekomendasi makanan ke "Terserah AI" (Gemini).
*   **Google Maps Integration**: Navigasi akurat menggunakan Place ID.
*   **Battery & Real-time Info**: Menampilkan status baterai dan jam secara realtime.
*   **Randomizer**: Fitur "Terserah" untuk memilih makanan secara acak.
*   **Dark Mode**: Tampilan modern yang nyaman di mata.

## Cara Membuat APK (Android) dengan Capacitor

Jika Anda ingin mengubah aplikasi ini menjadi APK Android tanpa mengubah kode desain, gunakan **Capacitor**. Ikuti langkah-langkah ini di komputer lokal Anda:

### 1. Instalasi Capacitor
Di terminal VS Code, jalankan perintah ini untuk menambahkan Capacitor ke proyek:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 2. Inisialisasi Capacitor
Jalankan perintah berikut untuk mengatur identitas aplikasi Anda:
```bash
npx cap init
```
*   **App name**: Terserah
*   **Package ID**: com.terserah.app (atau sesuai keinginan Anda)

### 3. Build Proyek React
Pastikan proyek sudah di-build menjadi file statis:
```bash
npm run build
```

### 4. Tambahkan Platform Android
```bash
npx cap add android
```

### 5. Sinkronisasi Kode
Setiap kali Anda mengubah kode di folder `src`, jalankan perintah ini:
```bash
npm run build
npx cap copy
```

### 6. Buka di Android Studio
Untuk membuat file APK, Anda perlu membuka proyek Android di Android Studio:
```bash
npx cap open android
```
Di Android Studio:
1. Tunggu proses Gradle selesai.
2. Pilih menu **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. File APK Anda akan muncul di folder `android/app/build/outputs/apk/debug/`.

---

## Struktur Folder
*   `src/components`: Komponen UI (Dashboard, ChatBot, dll).

*   `src/data`: Basis data kuliner Malang (`foods.ts`).
*   `src/services`: Logika lokasi dan baterai.
*   `src/types.ts`: Definisi tipe data TypeScript.
