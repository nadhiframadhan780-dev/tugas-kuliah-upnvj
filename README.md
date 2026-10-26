# Planner Akuntansi UPNVJ

> **Aplikasi Web & Progressive Web App (PWA) Manajemen Jadwal Kuliah & List Tugas untuk Mahasiswa S1 Akuntansi UPN "Veteran" Jakarta.**

Aplikasi ini dirancang khusus untuk mempermudah mahasiswa S1 Akuntansi FEB UPNVJ mengelola perkuliahan, mengekstrak dokumen soal tugas secara otomatis (PDF, Word, Excel), menghitung mundur tenggat secara realtime dengan presisi zona waktu Indonesia (WIB/WITA/WIT), serta menandai tugas selesai dalam satu klik dengan persistensi data lokal di peramban (IndexedDB).

---

## 🚀 Fitur Utama

1. **Identitas & Branding Mahasiswa S1 Akuntansi UPNVJ**
   - Wadah bulat logo dengan ring tipis dan fallback bertingkat: URL resmi FEB UPNVJ → Berkas lokal `assets/logo-akuntansi.png` → Monogram "SA".
   - Kalimat wajib *"Mahasiswa S1 Akuntansi UPNVJ"* selalu tersemat di bawah nama aplikasi.
   - Sentuhan halus nuansa akuntansi: motif garis tipis buku besar (*ledger*) dan tipografi digit tetap (*tabular-nums*).

2. **Ekstraksi Dokumen Otomatis (PDF, Word DOCX, Excel XLSX/CSV, TXT)**
   - Pembacaan client-side 100% offline & gratis (pdf.js, mammoth.js, SheetJS xlsx).
   - Penentuan judul cerdas (mengabaikan kop institusi UPNVJ, fakultas, dosen, nama, NIM).
   - Penjelasan soal 3 bagian terstruktur:
     - **Ringkasan**: 2-4 kalimat intisari berbobot istilah akuntansi (*jurnal, neraca, audit, pajak, laporan keuangan*).
     - **Yang Harus Dikerjakan**: 3-8 butir instruksi & butir soal bernomor.
     - **Ketentuan**: format pengumpulan, font, jumlah halaman, dan larangan plagiarisme.
   - Saran tenggat dari dokumen disajikan sebagai **Chip Saran** (tidak pernah mengisi tenggat otomatis).

3. **Tenggat Manual & Waktu Realtime Presisi**
   - Input manual tanggal & jam (default 23.59) dengan chip cepat: *Hari ini, Besok, Lusa, +3 hari, Minggu depan*.
   - **Pratinjau langsung**: *"Rabu, 28 Oktober 2026, pukul 23.59 WIB (3 hari 9 jam lagi)"*.
   - Status urgensi dinamis: Aman (hijau), Waspada (amber), Mendesak (oranye), Kritis (merah berdenyut), Terlambat (merah).
   - Tombol simpan terkunci sampai judul dan tenggat terisi. Konfirmasi bila tenggat sudah lewat.

4. **Tombol Selesai Cepat & Undo Toast**
   - Lingkaran besar di kiri kartu tugas: satu klik menandai selesai dengan animasi centang dan judul dicoret.
   - Toast "Batalkan" aktif selama 6 detik.
   - Mencatat waktu selesai dan ketepatan waktu (*onTime* vs *terlambat*).

5. **Jadwal Kuliah & Deteksi Bentrok**
   - Grid mingguan (Senin - Sabtu) dan status realtime kelas hari ini (*"Sedang berlangsung, sisa 45 menit"* / *"Berikutnya: Auditing 1 pukul 13.00"*).
   - Deteksi bentrok jadwal otomatis antar-mata kuliah.
   - Ekspor kalender `.ics` dan cetak/simpan PDF jadwal (*print stylesheet*).

6. **Kalender Akademik Terpadu**
   - Tampilan kalender bulanan yang menyatukan jadwal kuliah rutin, tenggat tugas, dan acara khusus/ujian (UTS, UAS, seminar).

7. **Pencatat Nilai & Estimasi IPK (Fitur Bonus)**
   - Kelola bobot persentase nilai per mata kuliah (Tugas, Kuis, UTS, UAS, Praktikum).
   - Perhitungan otomatis nilai akhir, huruf mutu (A, A-, B+ ...), dan estimasi Indeks Prestasi Semester (IPS).

8. **Fokus Pomodoro & Quick Add Bahasa Alami**
   - Timer fokus 25/50 menit yang dapat ditautkan ke tugas akuntansi tertentu.
   - *Quick Add* bahasa alami: contoh `"Laporan Auditing besok 23.59"`.

9. **PWA Siap Pasang & Offline-Ready**
   - Web App Manifest (`manifest.webmanifest`) dengan shortcut *Tambah Tugas* dan *Jadwal Hari Ini*.
   - Service worker precaching untuk fungsionalitas penuh tanpa internet.
   - Penyimpanan data lokal aman di perangkat via IndexedDB (`navigator.storage.persist()`).

---

## 📁 Struktur Folder Proyek

```
planner-akuntansi-upnvj/
├── index.html                   # HTML entry point dengan meta SEO & Plus Jakarta Sans
├── package.json                 # Skrip build, test, dan generate-icons
├── metadata.json                # Metadata aplikasi AI Studio
├── tsconfig.json                # Konfigurasi TypeScript
├── vite.config.ts               # Konfigurasi bundler Vite + Tailwind 4
├── public/
│   ├── manifest.webmanifest     # Manifest PWA (name, icons, shortcuts)
│   ├── sw.js                    # Service Worker precache & CDN runtime cache
│   ├── offline.html             # Halaman fallback saat offline
│   └── assets/
│       ├── logo-akuntansi.png   # Fallback lokal logo S1 Akuntansi UPNVJ
│       ├── icons/
│       │   ├── source-logo.png  # Sumber logo utama (1024x1024)
│       │   └── ...              # Hasil generasi ikon PWA
│       └── aistudio/
│           └── Jadwal_dan_Daftar_Tugas_Akuntansi_68173d24.png
├── scripts/
│   └── generate-icons.mjs       # Skrip Node.js otomatisasi generate semua ukuran ikon PWA
├── src/
│   ├── config.ts                # Pusat konfigurasi: nama, tagline, logo, timezone, warna
│   ├── types/
│   │   └── index.ts             # Definisi antarmuka TypeScript lengkap
│   ├── services/
│   │   └── db.ts                # Lapisan data IndexedDB (Repository Pattern) & data sampel
│   ├── utils/
│   │   ├── time.ts              # Perhitungan UTC epoch, zona waktu, hitung mundur & pratinjau
│   │   ├── time.test.ts         # Unit test waktu (node:test)
│   │   ├── extractor.ts         # Heuristik ekstraksi dokumen (PDF, DOCX, XLSX, TXT)
│   │   ├── extractor.test.ts    # Unit test ekstraksi (node:test)
│   │   ├── naturalLanguage.ts   # Parser bahasa alami Quick Add
│   │   ├── naturalLanguage.test.ts # Unit test NLP (node:test)
│   │   ├── stats.ts             # Statistik, heatmap 28 hari, bobot nilai & IPK
│   │   ├── stats.test.ts        # Unit test statistik (node:test)
│   │   ├── ics.ts               # Ekspor kalender .ics & integrasi WhatsApp
│   │   └── confetti.ts          # Efek confetti tugas selesai
│   ├── components/
│   │   ├── Sidebar.tsx          # Sidebar desktop dengan logo bundar & identitas UPNVJ
│   │   ├── Topbar.tsx           # Topbar sticky dengan jam realtime Indonesia detik
│   │   ├── BottomNav.tsx        # Navigasi bawah ponsel dengan tombol + mengapung
│   │   ├── TaskCard.tsx         # Kartu tugas: tombol selesai besar, hitung mundur, aksi cepat
│   │   ├── TaskModal.tsx        # Modal tambah/edit: drag-drop, auto-ekstrak, tenggat manual
│   │   ├── KanbanView.tsx       # Tampilan Kanban Board (Belum, Dikerjakan, Selesai)
│   │   ├── ScheduleView.tsx     # Jadwal kuliah mingguan, status realtime, deteksi bentrok
│   │   ├── CalendarView.tsx     # Kalender bulanan terpadu (jadwal, tenggat, ujian)
│   │   ├── StatsView.tsx        # Statistik produktivitas & heatmap kesibukan 4 minggu
│   │   ├── GradesView.tsx       # Pencatat nilai mata kuliah & estimasi IPK
│   │   ├── PomodoroModal.tsx    # Timer fokus 25/50 menit terkait tugas
│   │   ├── QuickAddModal.tsx    # Modal quick add bahasa alami dengan konfirmasi
│   │   ├── SettingsModal.tsx    # Pengaturan: zona waktu, tema, logo, backup JSON, mode AI
│   │   ├── OnboardingModal.tsx  # Panduan awal 3 langkah & muat data sampel
│   │   └── CommandPalette.tsx   # Pencarian global & pintasan keyboard (Ctrl+K / /)
│   ├── App.tsx                  # Komponen induk koordinator seluruh fitur
│   ├── main.tsx                 # Entry point React 19
│   └── index.css                # Tailwind CSS 4, gaya ledger, dan print stylesheet
└── README.md                    # Dokumentasi lengkap berbahasa Indonesia
```

---

## 💻 Cara Menjalankan Secara Lokal

1. Pastikan Node.js (versi 18 ke atas) telah terpasang.
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembang:
   ```bash
   npm run dev
   ```
4. Buka peramban pada alamat `http://localhost:3000`.
5. Untuk menjalankan unit test logika inti:
   ```bash
   npm test
   ```

---

## 🎨 Cara Mengganti Logo & Menghasilkan Ikon PWA

### Opsi 1: Otomatis Menggunakan Skrip Node.js (Rekomendasi)
1. Siapkan 1 file gambar PNG logo Anda (persegi, resolusi minimal 512x512, ideal 1024x1024).
2. Simpan atau timpa file tersebut ke:
   ```
   public/assets/icons/source-logo.png
   ```
3. Jalankan perintah otomatisasi:
   ```bash
   npm run icons
   ```
   Skrip akan secara otomatis menghasilkan:
   - `favicon-16.png` & `favicon-32.png`
   - `apple-touch-icon.png` (180x180 latar solid)
   - `icon-192.png` & `icon-512.png` (standar PWA)
   - `maskable-512.png` (logo ~65% di tengah dengan bantalan solid #0D9488)

### Opsi 2: Tanpa Node.js (Layanan Online)
1. Unggah logo Anda ke [PWABuilder Image Generator](https://www.pwabuilder.com/imageGenerator) atau [RealFaviconGenerator](https://realfavicongenerator.net/).
2. Unduh berkas ZIP hasil generator.
3. Salin ikon-ikon tersebut ke dalam folder `public/assets/icons/`.

### Opsi 3: Kustomisasi Langsung dari Dalam Aplikasi
Buka menu **Pengaturan** (ikon gerigi) → Tab **Tampilan & Logo** → Ketuk **Pilih Gambar Logo**. Logo pada header aplikasi dan favicon tab peramban akan langsung berganti secara dinamis.

---

## 🌐 Cara Deploy Gratis Langkah demi Langkah

### 1. Netlify (Drag & Drop / Netlify Drop)
1. Jalankan `npm run build` di terminal Anda. Folder `dist/` akan terbentuk.
2. Buka [app.netlify.com/drop](https://app.netlify.com/drop).
3. Seret dan letakkan (*drag & drop*) folder `dist/` ke halaman peramban tersebut.
4. Situs Anda langsung tayang dengan HTTPS gratis dalam beberapa detik!

### 2. Vercel
1. Pasang Vercel CLI atau hubungkan repositori GitHub Anda di [vercel.com](https://vercel.com).
2. Klik **Add New Project** → pilih repositori ini.
3. Framework preset akan terdeteksi otomatis sebagai **Vite**. Klik **Deploy**.

### 3. GitHub Pages
1. Ubah `base: './'` pada `vite.config.ts`.
2. Jalankan `npm run build`.
3. Dorong folder `dist` ke branch `gh-pages` atau gunakan GitHub Actions standar untuk Vite.

---

## 📱 Cara Memasang di Handphone (PWA)

### Android (Google Chrome / Brave / Edge)
1. Buka tautan web aplikasi di peramban Chrome HP Anda.
2. Ketuk tombol **"Pasang Aplikasi (PWA)"** di sidebar aplikasi atau ketuk menu titik tiga (⋮) di Chrome.
3. Pilih **"Tambahkan ke Layar Utama" / "Install App"**.
4. Ikon *Planner Akuntansi* akan muncul di daftar aplikasi HP Anda dan dapat dibuka layaknya aplikasi native tanpa bilah alamat peramban.

### iOS (iPhone / iPad - Safari)
1. Buka tautan web aplikasi menggunakan peramban **Safari**.
2. Ketuk ikon **Bagikan (Share)** berupa kotak dengan panah ke atas di bilah bawah.
3. Gulir ke bawah dan pilih **"Tambahkan ke Layar Utama" (Add to Home Screen)**.
4. Ketuk **Tambah** di pojok kanan atas.

---

## 📦 Cara Menjadikannya Berkas APK Android

Bila Anda ingin membagikan aplikasi ini sebagai file instalasi `.apk` kepada teman mahasiswa:

### Metode 1: Menggunakan PWABuilder (Paling Mudah, Tanpa Install Android Studio)
1. Pastikan aplikasi Anda sudah dideploy ke URL online dengan HTTPS (mis. di Netlify atau Vercel).
2. Buka [pwabuilder.com](https://www.pwabuilder.com).
3. Masukkan URL web aplikasi Anda, lalu klik **Start**.
4. PWABuilder akan memvalidasi *Manifest* dan *Service Worker*.
5. Klik **Package for Stores** → pilih **Android**.
6. Unduh berkas ZIP yang berisi file `.apk` (debug/release) dan Google Play Store bundle (`.aab`).

### Metode 2: Menggunakan Bubblewrap CLI (Resmi dari Google Chrome Team)
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest="https://nama-app-anda.netlify.app/manifest.webmanifest"
bubblewrap build
```

---

## 📋 Daftar Fitur yang Diselesaikan & Keterbatasan yang Jujur

### Fitur yang Berfungsi Penuh (100% Selesai):
- [x] Ekstraksi otomatis berkas soal PDF, DOCX, XLSX/CSV, dan TXT di sisi peramban.
- [x] Heuristik pembersihan judul (mengabaikan kop UPNVJ, fakultas, NIM, nama, dosen).
- [x] Penjelasan soal 3 bagian (Ringkasan berbobot akuntansi, Yang harus dikerjakan, Ketentuan).
- [x] Input tenggat manual wajib dengan chip cepat dan pratinjau hari/jam Indonesia ("Rabu, 28 Oktober 2026, 23.59 WIB").
- [x] Ticker jam header detik dan hitung mundur realtime multi-level (Aman, Waspada, Mendesak, Kritis, Terlambat).
- [x] Tombol Selesai lingkaran besar + Toast Batalkan 6 detik + Status tepat waktu vs terlambat.
- [x] Jadwal kuliah mingguan dengan status kelas realtime hari ini dan deteksi bentrok jadwal.
- [x] Kalender terpadu menggabungkan jadwal kuliah, tenggat tugas, dan ujian (UTS/UAS).
- [x] Pencatat nilai mata kuliah dengan persentase bobot dan estimasi IPK (IPS).
- [x] Timer fokus Pomodoro 25/50 menit tertaut tugas.
- [x] Quick Add bahasa alami (*"Laporan Auditing besok 23.59"*).
- [x] Ekspor kalender `.ics` dan tombol *Tambah ke Google Calendar*.
- [x] Bagikan rincian tugas ke WhatsApp dengan format teks rapi.
- [x] Mode PWA lengkap (manifest, service worker precache, install banner, offline page).
- [x] Cadangan & pemulihan data JSON di perangkat (IndexedDB).
- [x] Mode Terang, Gelap, Sistem, dan Kontras Tinggi.
- [x] Pintasan keyboard global (`N`, `/`, `Ctrl+K`, `Esc`).

### Keterbatasan yang Jujur:
1. **Notifikasi saat Aplikasi Benar-Benar Ditutup (Background Push)**:
   Web Notification API dan Service Worker bawaan peramban dapat mengirimkan notifikasi pengingat selama aplikasi sedang terbuka, diminimalkan, atau dipasang sebagai PWA aktif. Namun, notifikasi saat peramban dimatikan total (*closed background state*) memerlukan infrastruktur server Web Push (seperti Firebase Cloud Messaging atau VAPID server) yang memerlukan backend berbayar/terpisah.
2. **PDF Hasil Pindaian Gambar Murni (Scanned PDF)**:
   PDF hasil scan foto tanpa lapisan OCR teks asli akan dideteksi oleh aplikasi dan memunculkan peringatan ramah agar mahasiswa memasukkan judul/penjelasan secara manual.
3. **Format Dokumen Word .doc Lama**:
   Format biner `.doc` lawas (Word 97-2003) tidak didukung oleh pustaka peramban modern. Mahasiswa diarahkan untuk menyimpan ulang sebagai `.docx` atau `.pdf` sebelum mengunggah.
