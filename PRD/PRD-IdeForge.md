# PRD — IdeForge

**Ubah ide aplikasi jadi tech stack, PRD, dan task breakdown yang siap dikerjakan — dibantu AI.**

---

## 1. Latar Belakang & Tujuan

Developer indie dan pelajar sering punya ide aplikasi tapi kesulitan menerjemahkannya jadi rencana teknis yang siap dikerjakan — bingung mulai dari mana, teknologi apa yang cocok, dan bagaimana memecah ide jadi task konkret. IdeForge menyelesaikan ini dengan alur terpandu: user cukup ceritakan idenya dalam satu-dua kalimat, lalu AI membantu menyusun tech stack, menajamkan detail lewat pertanyaan klarifikasi, menyusun struktur fitur, menulis PRD, membuat mockup landing page, memecah jadi task, dan akhirnya merangkum semuanya jadi satu prompt siap tempel ke AI coding assistant (Claude Code, Cursor, dll) untuk mulai membangun.

Tujuan utamanya: memangkas jarak antara "punya ide" dan "siap mulai ngoding", tanpa biaya (pakai Gemini API free tier).

## 2. Target Pengguna

- Developer indie/solo yang mau validasi dan strukturkan ide sebelum mulai coding
- Pelajar/mahasiswa jurusan informatika yang mengerjakan tugas atau proyek pribadi
- Siapa pun yang familiar dengan konsep dasar software tapi butuh bantuan menyusun rencana sebelum eksekusi

## 3. Lingkup Fitur

### Fase 1 — Inti (sudah selesai dibangun)
- **Input ide**: halaman landing untuk menuliskan ide aplikasi secara bebas
- **Pilihan tech stack**: AI merekomendasikan stack yang paling praktis, atau user tentukan sendiri (frontend/backend/database)
- **Pertanyaan klarifikasi dinamis**: AI menentukan sendiri 3-5 pertanyaan paling relevan berdasarkan ide spesifik user (bukan template tetap), jenis jawaban teks bebas atau pilihan dengan opsi kustom
- **Struktur fitur**: AI menyusun daftar fitur dikelompokkan per fase pengembangan (fase 1/2/3), ditampilkan sebagai mind-map interaktif (drag, zoom, pan)
- **PRD otomatis**: dokumen requirement lengkap dalam format Markdown, bisa diunduh
- **Mockup landing page**: 3 konsep visual berbeda (gaya disesuaikan karakter aplikasi), dirender langsung sebagai halaman HTML hidup, user memilih satu sebagai arah desain
- **Task breakdown**: setiap fitur dipecah jadi task teknis konkret, dikelompokkan per fase/fitur, bisa dicentang selesai
- **Prompt final**: rangkuman seluruh hasil (tech stack, PRD, arah desain) jadi satu prompt siap tempel ke AI coding assistant, lengkap dengan urutan pengerjaan yang eksplisit (schema → backend → frontend → testing)
- **Riwayat plan**: daftar semua plan yang pernah dibuat, bisa dilanjutkan kapan saja
- **Model fallback otomatis**: mencoba beberapa model Gemini berurutan supaya tidak terganggu deprecation model oleh Google

### Fase 2 — Penting, belum dikerjakan
- Autentikasi user (saat ini semua plan tersimpan tanpa login, siapa saja yang akses server bisa lihat riwayat plan)
- Kemampuan mengedit ulang struktur fitur/PRD/task secara manual setelah digenerate (saat ini bersifat sekali-jadi per step)
- Regenerate ulang satu bagian saja (misal PRD ulang tanpa harus ulang struktur)
- Export PRD ke format Word/PDF selain Markdown

### Fase 3 — Lanjutan
- Kolaborasi: share plan ke orang lain untuk direview/dikomentari
- Integrasi langsung ke GitHub (push struktur project awal otomatis)
- Dukungan multi-bahasa (saat ini seluruh UI dan output AI berbahasa Indonesia)

## 4. Alur Pengguna Utama

1. User membuka `/plan`, menuliskan ide aplikasi
2. Pilih tech stack (AI rekomendasi atau manual)
3. Jawab pertanyaan klarifikasi yang disusun AI khusus untuk ide tersebut
4. AI menyusun struktur fitur, ditampilkan sebagai mind-map interaktif
5. AI menulis PRD lengkap berdasarkan ide + jawaban + struktur
6. User memilih salah satu dari 3 konsep landing page yang di-generate AI
7. AI memecah struktur fitur jadi task teknis per fase
8. AI merangkum semuanya jadi satu prompt siap pakai
9. User menyalin prompt tersebut dan menempelkannya ke AI coding assistant pilihannya untuk mulai membangun

## 5. Kebutuhan Non-Fungsional

- **Biaya**: harus bisa jalan sepenuhnya gratis — pakai Gemini API free tier, database SQLite lokal (tanpa biaya hosting database)
- **Skala**: dirancang untuk pemakaian personal/skala kecil (single instance, SQLite cukup); belum dioptimalkan untuk banyak pengguna bersamaan
- **Ketahanan terhadap perubahan model AI**: karena Google sering menghentikan model Gemini tanpa banyak notice, sistem harus otomatis mencoba model alternatif tanpa mengharuskan user mengubah kode
- **Idempotensi**: setiap step generate AI hanya dijalankan sekali dan tersimpan — refresh halaman tidak memicu generate ulang (hemat kuota API)
- **Portabilitas**: tidak boleh bergantung pada layanan berbayar atau infrastruktur kompleks (Postgres server, dsb) di setup default

## 6. Metrik Keberhasilan

- User bisa menyelesaikan satu putaran penuh (ide → prompt final) dalam satu sesi tanpa error
- Prompt final yang dihasilkan cukup jelas dan spesifik sehingga AI coding assistant bisa langsung mulai membangun tanpa banyak pertanyaan balik
- Sistem tetap berfungsi normal meskipun Google menghentikan salah satu model Gemini yang jadi default
