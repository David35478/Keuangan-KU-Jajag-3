# keuangan Jajag 3

**Keuangan Jajag 3** adalah aplikasi dasbor administrasi keuangan modern yang dirancang untuk memudahkan pencatatan, pengelolaan, dan analisis data keuangan secara real-time. Aplikasi ini mengintegrasikan kecerdasan buatan (AI) untuk membantu pembuatan data simulasi dan visualisasi yang interaktif.

## ðŸš€ Fitur Utama

- **Pencatatan Keuangan Real-time**: Tambah pemasukan dan pengeluaran dengan sinkronisasi langsung ke database cloud (Supabase).
- **Generator Data AI**: Gunakan kekuatan Google Gemini AI untuk membuat data dummy atau simulasi skenario keuangan secara otomatis hanya dengan deskripsi teks bahasa Indonesia.
- **Visualisasi Data Interaktif**: Grafik batang dinamis untuk melihat distribusi keuangan dan statistik ringkasan (Saldo Bersih, Rata-rata, Nilai Tertinggi).
- **Manajemen Data Lengkap**: 
  - Filter berdasarkan kategori (Umum, Keuangan, Inventaris, Penjualan).
  - Pencarian data instan.
  - Hapus data per item atau massal.
- **Ekspor Laporan**: Unduh data keuangan yang difilter ke dalam format CSV untuk analisis lebih lanjut di Excel atau Spreadsheet.
- **Format Rupiah Otomatis**: Semua nilai mata uang diformat secara otomatis ke dalam Rupiah (IDR).
- **Desain Responsif**: Tampilan antarmuka yang bersih dan responsif, cocok untuk desktop maupun perangkat seluler.

## ðŸ› ï¸ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan teknologi web modern:

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Database & Real-time**: Supabase
- **Artificial Intelligence**: Google Gemini API (`@google/genai`)
- **Icons**: Lucide React
- **Charting**: Recharts

## ðŸ“¦ Cara Menjalankan

1. **Clone repositori ini**
   ```bash
   git clone https://github.com/username/adminsum-pro.git
   cd adminsum-pro
   ```

2. **Instal dependensi**
   ```bash
   npm install
   ```

3. **Jalankan server pengembangan**
   ```bash
   npm run dev
   ```

## ðŸ“ Catatan Penggunaan

- **API Key**: Aplikasi ini menggunakan API Key untuk layanan Supabase dan Google Gemini. Pastikan konfigurasi di `services/supabase.ts` dan `services/geminiService.ts` sudah sesuai jika Anda ingin menggunakan kredensial Anda sendiri.
- **AI Prompt**: Fitur "Isi Otomatis AI" dioptimalkan untuk menerima perintah dalam Bahasa Indonesia (contoh: "Daftar belanja bulanan", "Gaji karyawan IT").

## ðŸ“„ Lisensi
