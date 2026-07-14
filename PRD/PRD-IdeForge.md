# PRD — IdeForge

**Ubah ide aplikasi jadi tech stack, PRD, dan task breakdown yang siap dikerjakan — dibantu AI.**

---

## 1. Latar Belakang & Tujuan

Developer indie dan pelajar sering punya ide aplikasi tapi kesulitan menerjemahkannya jadi rencana teknis yang siap dikerjakan — bingung mulai dari mana, teknologi apa yang cocok, dan bagaimana memecah ide jadi task konkret. IdeForge menyelesaikan ini dengan alur terpandu: user cukup ceritakan idenya dalam satu-dua kalimat, lalu AI membantu menyusun tech stack, menajamkan detail lewat pertanyaan klarifikasi, menyusun struktur fitur, menulis PRD, membuat mockup landing page, memecah jadi task, dan akhirnya merangkum semuanya jadi satu prompt siap tempel ke AI coding assistant (Claude Code, Cursor, dll) untuk mulai membangun.

Tujuan utamanya: memangkas jarak antara "punya ide" dan "siap mulai ngoding", tanpa biaya (pakai Gemini API free tier atau provider AI lain pilihan user).

## 2. Target Pengguna

- Developer indie/solo yang mau validasi dan strukturkan ide sebelum mulai coding
- Pelajar/mahasiswa jurusan informatika yang mengerjakan tugas atau proyek pribadi
- Siapa pun yang familiar dengan konsep dasar software tapi butuh bantuan menyusun rencana sebelum eksekusi

## 3. Lingkup Fitur

### Fase 1 — Inti (selesai)
- **Input ide**: halaman landing untuk menuliskan ide aplikasi secara bebas
- **Multi-provider AI**: dukungan Google Gemini, Anthropic Claude, dan endpoint API kustom — diatur dari halaman pengaturan
- **Pilihan tech stack**: AI merekomendasikan stack yang paling praktis, atau user tentukan sendiri (frontend/backend/database)
- **Pertanyaan klarifikasi dinamis**: AI menentukan sendiri 3-5 pertanyaan paling relevan berdasarkan ide spesifik user (bukan template tetap), jenis jawaban teks bebas atau pilihan dengan opsi kustom, tiap pertanyaan bisa ditandai wajib/opsional
- **Struktur fitur**: AI menyusun daftar fitur dikelompokkan per fase pengembangan (fase 1/2/3), ditampilkan sebagai mind-map interaktif (drag, zoom, pan)
- **PRD otomatis**: dokumen requirement lengkap dalam format Markdown, bisa diedit inline, di-download, atau di-regenarate
- **Mockup landing page**: 3 konsep visual berbeda (gaya disesuaikan karakter aplikasi), dirender langsung sebagai halaman HTML hidup, user memilih satu sebagai arah desain, bisa pilih model Gemini dan regenerate
- **Task breakdown**: setiap fitur dipecah jadi task teknis konkret, dikelompokkan per fase/fitur, bisa dicentang selesai
- **Prompt final**: rangkuman seluruh hasil (tech stack, PRD, arah desain) jadi satu prompt siap tempel ke AI coding assistant, lengkap dengan urutan pengerjaan yang eksplisit — bisa di-copy atau di-download sebagai `.md`
- **Google OAuth login**: autentikasi via Google, session via NextAuth v5
- **Settings persist**: API key, provider AI, dan konfigurasi database tersimpan per akun (email) atau per device (device_id fallback) — bisa diakses dari halaman `/apikeys`
- **History plan**: daftar semua plan milik user (terkait akun), bisa dilanjutkan atau dihapus
- **Riwayat lintas perangkat**: data tersimpan ke database (Turso) — login di perangkat lain, data tetap ada
- **Model fallback otomatis**: mencoba beberapa model Gemini berurutan supaya tidak terganggu deprecation model oleh Google
- **Retry otomatis**: 3 percobaan dengan exponential backoff (1s → 2s → 4s) untuk rate limit (429) dan server overload (503)
- **Usage tracker**: counter pemakaian API per hari, estimasi sisa prompt gratis — ditampilkan di halaman `/plan`
- **GitHub push**: push PRD, struktur, tech stack, dan prompt final langsung ke repo GitHub dari dalam app
- **Panduan lengkap**: halaman `/panduanpenggunaan` dengan studi kasus (aplikasi pencatat pengeluaran) + contoh output
- **Animated dock**: Apple-style dock di hero landing page (6 ikon)
- **Step indicator**: stepper visual di wizard (Tech → Q&A → Struktur → PRD → Landing → Task → Prompt)
- **QuantumPulseLoader**: animasi kustom untuk loading state generasi AI

### Fase 2 — Belum dikerjakan
- Kemampuan mengedit ulang struktur fitur/PRD/task secara manual setelah digenerate (saat ini bersifat sekali-jadi per step, kecuali PRD yang bisa diedit inline)
- Regenerate ulang satu bagian saja (misal PRD ulang tanpa harus ulang struktur)
- Export PRD ke format Word/PDF selain Markdown
- Dark/light mode toggle
- Mobile-responsive optimization lebih lanjut

### Fase 3 — Lanjutan
- Kolaborasi: share plan ke orang lain untuk direview/dikomentari
- Dukungan multi-bahasa lebih luas (saat ini Indonesia + Inggris)
- Template plan publik
- API publik untuk integrasi eksternal

## 4. Alur Pengguna Utama

1. User membuka landing page → melihat hero, how-it-works, FAQ
2. Login dengan Google (opsional, tapi disarankan untuk riwayat)
3. Buka `/plan`, menuliskan ide aplikasi, pilih bahasa (Indonesia/Inggris)
4. Pilih tech stack (AI rekomendasi atau manual)
5. Jawab pertanyaan klarifikasi yang disusun AI khusus untuk ide tersebut
6. AI menyusun struktur fitur, ditampilkan sebagai mind-map interaktif
7. AI menulis PRD lengkap berdasarkan ide + jawaban + struktur
8. User memilih salah satu dari 3 konsep landing page yang di-generate AI
9. AI memecah struktur fitur jadi task teknis per fase (dicentang)
10. AI merangkum semuanya jadi satu prompt siap pakai (copy atau download `.md`)
11. User menyalin prompt dan menempelkannya ke AI coding assistant pilihannya

## 5. Arsitektur & Tech Stack

### Frontend
- **Next.js 15** (App Router, server components + client components)
- **Tailwind CSS v4** dengan custom design tokens (ink, paper, signal, trace, line, danger)
- **Framer Motion** untuk animasi (dock, loader)
- **@xyflow/react** (React Flow) untuk mind-map struktur fitur
- **Lucide React** untuk ikon
- **React Markdown + remark-gfm** untuk rendering PRD

### Backend / API
- **Next.js API routes** (App Router route handlers)
- **NextAuth v5** dengan Google provider
- **Drizzle ORM** untuk query database

### Database
- **libSQL/Turso**: SQLite via HTTP untuk Vercel (serverless-compatible)
- **SQLite lokal** (`file:ideforge.sqlite`) untuk development tanpa setup

### AI Provider
- **Google Gemini API** (default)
- **Anthropic Claude API** (opsional)
- **Custom API endpoint** (opsional, endpoint bebas)

### Deployment
- **Vercel** (serverless)

## 6. Basis Data

### Tables
- **plans**: id, idea_text, language, tech_mode, tech_choice (json), questions (json), answers (json), structure (json), prd, tasks (json), landing_options (json), selected_landing_id, final_prompt, current_step, user_email, created_at, updated_at
- **gemini_usage**: date (PK), count — counter harian pemakaian API
- **settings**: device_id + key (composite PK), value, created_at, updated_at — persist pengaturan user

## 7. Kebutuhan Non-Fungsional

- **Biaya**: harus bisa jalan sepenuhnya gratis — pakai Gemini API free tier, SQLite/Turso tier gratis
- **Skala**: dirancang untuk pemakaian personal/skala kecil; Turso untuk serverless production
- **Ketahanan terhadap perubahan model AI**: karena Google sering menghentikan model Gemini tanpa banyak notice, sistem otomatis mencoba model alternatif
- **Idempotensi**: setiap step generate AI hanya dijalankan sekali dan tersimpan — refresh halaman tidak memicu generate ulang (hemat kuota API)
- **Portabilitas**: bisa jalan lokal dengan SQLite tanpa setup server; Turso untuk deployment
- **Keamanan data**: API key tersimpan di database server-side; plan milik user tidak bisa diakses user lain

## 8. Metrik Keberhasilan

- User bisa menyelesaikan satu putaran penuh (ide → prompt final) dalam satu sesi tanpa error
- Prompt final yang dihasilkan cukup jelas dan spesifik sehingga AI coding assistant bisa langsung mulai membangun tanpa banyak pertanyaan balik
- Sistem tetap berfungsi normal meskipun Google menghentikan salah satu model Gemini yang jadi default
- User bisa login, data plan mengikuti akun, dan riwayat bisa diakses lintas perangkat
