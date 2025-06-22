# Proyek API Sederhana untuk Google Gemini

Proyek ini adalah server backend sederhana yang dibuat dengan Node.js dan Express. Server ini menyediakan beberapa endpoint API untuk berinteraksi dengan model AI **Google Gemini 1.5 Flash**. Anda bisa menggunakannya untuk menghasilkan teks, menganalisis gambar, dokumen, dan audio.

## Fitur
- Generate teks dari prompt teks.
- Generate teks dari gambar.
- Generate teks dari dokumen.
- Generate teks dari file audio.

## Prasyarat

Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (v12 atau lebih baru)
- npm (biasanya terinstal bersama Node.js)

## Cara Menjalankan

1.  **Clone Repositori**
    ```bash
    git clone <URL_REPOSITORI_ANDA>
    cd gemini-flash-api
    ```

2.  **Install Dependensi**
    Jalankan perintah berikut untuk menginstal semua paket yang dibutuhkan.
    ```bash
    npm install
    ```

3.  **Konfigurasi API Key**
    - Buat file baru bernama `.env` di direktori utama proyek.
    - Dapatkan API Key Anda dari Google AI Studio.
    - Tambahkan API Key Anda ke dalam file `.env` seperti ini:
      ```
      GEMINI_API_KEY="MASUKKAN_API_KEY_ANDA_DI_SINI"
      ```

4.  **Jalankan Server**
    ```bash
    node index.js
    ```
    Server akan berjalan di `http://localhost:3000`.

## Cara Menggunakan API

Berikut adalah contoh cara memanggil setiap endpoint menggunakan `curl`.

### 1. Generate Teks dari Teks
Mengirimkan prompt teks dan mendapatkan balasan teks.
```bash
curl -X POST -H "Content-Type: application/json" -d '{"prompt": "Ceritakan sebuah lelucon singkat tentang programmer"}' http://localhost:3000/generate-text
```

### 2. Generate Teks dari Gambar
Mengirimkan file gambar dan mendapatkan deskripsi atau analisis dari gambar tersebut.
```bash
curl -X POST -F "image=@/path/to/your/image.jpg" -F "prompt=Jelaskan apa yang ada di gambar ini" http://localhost:3000/generate-from-image
```

### 3. Generate Teks dari Dokumen
Mengirimkan file dokumen untuk dianalisis atau diringkas.
```bash
curl -X POST -F "document=@/path/to/your/document.txt" -F "prompt=Buat ringkasan dari dokumen ini" http://localhost:3000/generate-from-document
```

### 4. Generate Teks dari Audio
Mengirimkan file audio untuk ditranskripsi.
```bash
curl -X POST -F "audio=@/path/to/your/audio.mp3" http://localhost:3000/generate-from-audio
```


