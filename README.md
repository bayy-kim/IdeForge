# IdeForge

Ubah ide aplikasi jadi tech stack, PRD (Product Requirement Document), dan task breakdown yang siap dikerjakan — dibantu AI. Terinspirasi dari alur ngodingpakeai.com.

**Alur:**
1. **Mau bikin apa?** — ceritain ide aplikasimu dalam 1-2 kalimat
2. **Preferensi teknologi** — biarkan AI rekomendasiin stack, atau pilih sendiri
3. **Beberapa pertanyaan** — AI nanya hal spesifik (target user, skala, monetisasi, dll) biar rencananya akurat
4. **Struktur** — mind-map interaktif fitur, dikelompokkan per fase pengembangan
5. **PRD** — dokumen requirement lengkap, bisa didownload sebagai `.md`
6. **Task** — breakdown kerja teknis per fitur, bisa dicentang
7. **Prompt** — semuanya dirangkum jadi satu prompt siap tempel ke Claude Code / Cursor / AI coding assistant lain

## Tech stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** + komponen ala shadcn/ui (ditulis manual, tanpa CLI)
- **Drizzle ORM** + **better-sqlite3** — database lokal, tanpa perlu setup server terpisah
- **@xyflow/react** (React Flow) — mind-map interaktif di halaman Struktur
- **Google Gemini API** — AI generation (gratis)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Ambil Gemini API key (gratis)

1. Buka https://aistudio.google.com/apikey
2. Login pakai akun Google, klik "Create API Key"
3. Copy API key-nya

### 3. Buat file `.env.local`

```bash
cp .env.local.example .env.local
```

Lalu isi `GEMINI_API_KEY` di dalamnya dengan key yang tadi kamu ambil.

### 4. Jalankan

```bash
npm run dev
```

Buka http://localhost:3000 — database SQLite (`ideforge.sqlite`) otomatis dibuat di root project saat pertama kali jalan, tidak perlu migration manual.

## Struktur project

```
src/
  app/
    plan/                    # halaman input ide (landing)
    plans/[id]/              # wizard: tech -> questions -> structure -> prd -> tasks -> prompt
    api/plans/[id]/...       # route handler untuk tiap step (panggil Gemini)
  components/
    ui/                      # primitives ala shadcn (button, card, input, dll)
    steps/                   # form untuk tiap step wizard
    structure/                # React Flow custom nodes/edges untuk mind-map
  lib/
    ai/                      # Gemini client, prompt templates, response schemas
    db/                      # Drizzle schema + repository functions
    types.ts                # semua tipe domain (Plan, TechChoice, dll)
```

## Ganti ke PostgreSQL (opsional)

Project ini pakai SQLite biar langsung jalan tanpa setup. Kalau mau deploy dan butuh Postgres:
1. Install `pg` dan ganti `drizzle-orm/better-sqlite3` jadi `drizzle-orm/node-postgres` di `src/lib/db/index.ts`
2. Sesuaikan tipe kolom di `src/lib/db/schema.ts` (SQLite `text` dengan `mode: "json"` bisa langsung dipetakan ke tipe `jsonb` di Postgres)
3. Tambahkan `DATABASE_URL` di `.env.local`

## Catatan

- Model default: `gemini-2.5-flash` (bisa diganti lewat env `GEMINI_MODEL`)
- Free tier Gemini API punya limit request per menit — kalau kena rate limit, tunggu sebentar lalu refresh halaman (setiap step generate-nya idempotent, tidak akan generate ulang kalau datanya sudah ada)
