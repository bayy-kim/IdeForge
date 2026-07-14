# IdeForge

Ubah ide aplikasi jadi tech stack, PRD (Product Requirement Document), dan task breakdown yang siap dikerjakan — dibantu AI.

**Alur:**
1. **Mau bikin apa?** — ceritain ide aplikasimu dalam 1-2 kalimat
2. **Preferensi teknologi** — biarkan AI rekomendasiin stack, atau pilih sendiri
3. **Beberapa pertanyaan** — AI nanya hal spesifik (target user, skala, monetisasi, dll) biar rencananya akurat
4. **Struktur** — mind-map interaktif fitur, dikelompokkan per fase pengembangan
5. **PRD** — dokumen requirement lengkap, bisa didownload sebagai `.md`
6. **Mockup landing page** — pilih salah satu dari 3 konsep tampilan yang di-generate AI
7. **Task** — breakdown kerja teknis per fitur, bisa dicentang
8. **Prompt** — semuanya dirangkum jadi satu prompt siap tempel ke Claude Code / Cursor / AI coding assistant lain

## Tech stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** + komponen ala shadcn/ui (ditulis manual, tanpa CLI)
- **Drizzle ORM** + **libSQL/Turso** — SQLite untuk lokal, Turso untuk production (serverless)
- **@xyflow/react** (React Flow) — mind-map interaktif di halaman Struktur
- **Google Gemini API / Anthropic Claude / Custom** — AI generation (multi-provider)
- **NextAuth v5** — Google OAuth login
- **Framer Motion** — animasi dock & loader

## Fitur

- **Multi-provider AI**: pake Gemini, Claude, atau API kustom — diatur dari halaman `/apikeys`
- **Google OAuth**: login biar data dan riwayat tersimpan per akun, bukan cuma di browser
- **Settings persist**: API key, provider, dan konfigurasi database tersimpan di database + localStorage
- **History page**: lihat dan hapus rencana sebelumnya (perlu login)
- **Usage tracker**: counter pemakaian Gemini per hari, estimasi sisa prompt
- **GitHub push**: push PRD, struktur, tech stack, dan prompt final langsung ke repo GitHub dari dalam app
- **Model fallback**: otomatis coba beberapa model Gemini berurutan (`GEMINI_MODEL` → `gemini-3-flash-preview` → `gemini-2.0-flash` → `gemini-2.5-flash`)
- **Retry logic**: 3 percobaan dengan exponential backoff kalau kena rate limit (429/503)
- **Download prompt**: hasil akhir bisa di-copy atau di-download sebagai `.md`
- **Animated dock**: Apple-style dock di landing page hero

## Setup Lokal

### 1. Install dependencies

```bash
npm install
```

### 2. Buat file `.env.local`

```bash
cp .env.local.example .env.local
```

Isi minimal:
```env
GEMINI_API_KEY=AIzaSy...          # ambil gratis di https://aistudio.google.com/apikey
AUTH_SECRET=...                    # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_GOOGLE_ID=...                 # dari Google Cloud Console
AUTH_GOOGLE_SECRET=...             # dari Google Cloud Console
AUTH_URL=http://localhost:3000     # ganti port sesuai jalan
```

### 3. Jalankan

```bash
npm run dev
```

Buka http://localhost:3000 — database SQLite (`ideforge.sqlite`) otomatis dibuat di root project.

## Deploy ke Vercel + Turso

### 1. Setup Turso (gratis)

```bash
npm install -g turso
turso auth login
turso db create ideforge
turso db show ideforge --url          # ambil URL
turso db tokens create ideforge       # ambil token
```

Atau lewat dashboard web https://turso.tech

### 2. Set Environment Variables di Vercel

```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=eyJ...
GEMINI_API_KEY=AIzaSy...
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_URL=https://[app-mu].vercel.app
```

### 3. Google OAuth Redirect URI

Tambah di Google Cloud Console:
```
https://[app-mu].vercel.app/api/auth/callback/google
```

## Struktur project

```
src/
  app/
    plan/                    # halaman input ide
    plans/[id]/              # wizard: tech → questions → structure → prd → landing → tasks → prompt
    apikeys/                 # pengaturan API key, provider, database
    history/                 # riwayat rencana (perlu login)
    panduanpenggunaan/       # panduan lengkap dengan studi kasus
    api/
      plans/...              # CRUD plans + tiap step wizard
      settings/              # settings CRUD + test key/test db
      config/                # usage counter
      auth/                  # NextAuth route handler
  components/
    ui/                      # primitives ala shadcn (button, card, input, dock, loader, dll)
    steps/                   # tech-step, questions-step
    structure/               # React Flow custom nodes/edges untuk mind-map
  lib/
    ai/                      # Gemini client, prompt templates, response schemas
    db/                      # Drizzle schema + Turso client + repo functions + usage tracker
    auth.ts                  # NextAuth config
    types.ts                 # semua tipe domain
```

## Lingkungan

| Variable | Wajib | Fungsi |
|----------|-------|--------|
| `GEMINI_API_KEY` | Ya* | API key Gemini (opsional kalau pake Claude/kustom via UI) |
| `AUTH_SECRET` | Ya | NextAuth encryption key |
| `AUTH_GOOGLE_ID` | Ya | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Ya | Google OAuth Client Secret |
| `AUTH_URL` | Ya | Base URL (http://localhost:3000 lokal / https://... production) |
| `TURSO_DATABASE_URL` | Untuk Vercel | URL database Turso |
| `TURSO_AUTH_TOKEN` | Untuk Vercel | Token autentikasi Turso |
| `GEMINI_MODEL` | Tidak | Paksa model Gemini tertentu |
