# PRD — IdeForge

**Ubah ide aplikasi jadi tech stack, PRD, dan task breakdown yang siap dikerjakan — dibantu AI.**

---

## 1. Latar Belakang & Tujuan

Developer indie dan pelajar sering punya ide aplikasi tapi kesulitan menerjemahkannya jadi rencana teknis yang siap dikerjakan — bingung mulai dari mana, teknologi apa yang cocok, dan bagaimana memecah ide jadi task konkret. IdeForge menyelesaikan ini dengan alur terpandu: user cukup ceritakan idenya dalam satu-dua kalimat, lalu AI membantu menyusun tech stack, menajamkan detail lewat pertanyaan klarifikasi, menyusun struktur fitur, menulis PRD, membuat mockup landing page, memecah jadi task, dan akhirnya merangkum semuanya jadi satu prompt siap tempel ke AI coding assistant (Claude Code, Cursor, dll) untuk mulai membangun.

Tujuan utamanya: memangkas jarak antara "punya ide" dan "siap mulai ngoding", tanpa biaya (pakai Gemini API free tier atau provider AI lain pilihan user).

---

## 2. Target Pengguna

- Developer indie/solo yang mau validasi dan strukturkan ide sebelum mulai coding
- Pelajar/mahasiswa jurusan informatika yang mengerjakan tugas atau proyek pribadi
- Siapa pun yang familiar dengan konsep dasar software tapi butuh bantuan menyusun rencana sebelum eksekusi

---

## 3. Lingkup Fitur

### Fase 1 — Inti (Selesai & Berfungsi)

| Fitur | Detail Implementasi |
|-------|---------------------|
| **Input ide** | Halaman `/plan` dengan textarea, validasi min 8 karakter, pilihan bahasa (ID/EN) |
| **Multi-provider AI** | Halaman `/apikeys` mendukung: Google Gemini, Anthropic Claude, Custom endpoint — simpan ke DB + localStorage (API key terenkripsi AES-256-GCM). "Test All Models" untuk cek semua model Gemini. |
| **Pilihan tech stack** | Step "Tech": AI rekomendasikan (JSON structured output) atau user isi manual (frontend/backend/database) |
| **Pertanyaan klarifikasi dinamis** | Step "Questions": AI generate 3-5 pertanyaan spesifik ide (bukan template), support type `text`/`choice`, `multi` select, `allowCustom`, required/optional |
| **Struktur fitur (Mind-map)** | Step "Structure": React Flow interactive graph — root node (appName), feature nodes per phase, subpanel nodes. Edit nama/ringkasan inline. |
| **PRD otomatis** | Step "PRD": Markdown lengkap (## Background, Target, Scope, User Flows, Non-Functional, Metrics), render via `react-markdown`, inline edit dengan auto-save (debounce 2s), download `.md`, print to PDF, regenerate |
| **Struktur folder** | Dibuat bersamaan PRD: Markdown arsitektur + folder tree (30-50 lines) |
| **Mockup landing page** | Step "Landing": 3 konsep HTML self-contained (Tailwind CDN), rendered via iframe sandbox, pilih model Gemini, download HTML, fullscreen preview |
| **Task breakdown** | Step "Tasks": Setiap sub-fitur jadi task minimal 1, group by feature/phase, filter fase, mark all done, export CSV, regenerate |
| **Prompt final** | Step "Prompt": Compile tech stack + PRD + tasks + landing style → prompt terstruktur untuk AI coding assistant (urutan backend-first, fase 1 dulu, validasi input, error handling). Tab "Persiapan & Skill": daftar runtime, dependencies, VS Code extensions, env vars, setup steps. Copy per section / all, download `.md` |
| **Google OAuth** | NextAuth v5 (Google + GitHub provider), session callback, protected routes |
| **Settings persist** | API key, provider, api_url disimpan ke table `settings` (per user email atau device_id), sync ke localStorage. API key disimpan terenkripsi AES-256-GCM di database. |
| **History plan** | Halaman `/history` list plans milik user (login wajib), link ke plan, delete dengan konfirmasi |
| **Riwayat lintas perangkat** | Data plan + settings tersimpan ke Turso (production) / SQLite (local) — login di device lain = data ikut |
| **Model fallback otomatis** | Array `MODEL_CANDIDATES` di `gemini.ts`: `GEMINI_MODEL` env → `gemini-3.5-flash` → `gemini-3-flash-preview` → `gemini-3.1-flash-lite` → `gemini-2.5-flash` dst. |
| **Retry logic** | Max 3 attempt, exponential backoff (1s → 2s → 4s, max 8s) untuk status 429/503 |
| **Retry UI** | Tombol "Coba Lagi" interaktif dengan loading loader spinner pada state error AI generation (Tech step, Questions step, Structure page) |
| **Usage tracker** | Tabel `model_usage` melacak pemakaian harian per-model secara akurat. Limit harian dibedakan (flash/freeTier = 1500, pro/billing = 500) |
| **GitHub push** | POST `/api/plans/[id]/github` — membuat repo GitHub, melacak status push per-file, menampilkan error detail dari GitHub, serta mencegah duplikasi |
| **Panduan lengkap** | Halaman `/panduanpenggunaan` dengan studi kasus "Aplikasi Pencatat Pengeluaran via WhatsApp" + contoh output setiap step |
| **Animated dock** | Hero landing page: 6 ikon (Code, FileText, MessageSquare, Sparkles, BookOpen, ChevronDown) dengan Framer Motion scroll-linked animation |
| **Step indicator** | Komponen `StepNav` + `StepperHeader` visual di tiap step wizard |
| **QuantumPulseLoader** | Custom loader component untuk loading state generasi AI |

---

### Fase 2 — Belum Dikerjakan

- Kemampuan mengedit ulang struktur fitur/PRD/task secara manual setelah digenerate (saat ini PRD bisa diedit inline, struktur nama/ringkasan editable, task dicentang; struktur graph & questions read-only)
- Regenerate ulang satu bagian saja tanpa ulang step sebelumnya (misal PRD ulang tanpa ulang struktur)
- Export PRD ke format Word/PDF selain Markdown + print
- Dark/light mode toggle (saat ini single dark theme)
- Mobile-responsive optimization lebih lanjut (mind-map butuh layar lebar)

---

### Fase 3 — Lanjutan (Nice to Have)

- Kolaborasi: share plan ke orang lain untuk direview/dikomentari
- Dukungan multi-bahasa lebih luas (saat ini Indonesia + Inggris)
- Template plan publik
- API publik untuk integrasi eksternal

---

## 4. Alur Pengguna Utama (User Flow)

1. User membuka landing page `/` → melihat hero, how-it-works, FAQ
2. Login dengan Google (opsional, tapi disarankan untuk riwayat) via header
3. Buka `/plan`, menuliskan ide aplikasi, pilih bahasa (Indonesia/Inggris)
4. **Step Tech** (`/plans/[id]`): Pilih tech stack (AI rekomendasi atau manual)
5. **Step Questions** (`/plans/[id]`): Jawab pertanyaan klarifikasi yang disusun AI khusus untuk ide tersebut
6. **Step Structure** (`/plans/[id]/structure`): AI menyusun struktur fitur, ditampilkan sebagai mind-map interaktif (drag, zoom, pan). Bisa edit nama app & ringkasan.
7. **Step PRD** (`/plans/[id]/prd`): AI menulis PRD lengkap berdasarkan ide + jawaban + struktur. Bisa edit inline (auto-save), download `.md`, print PDF, regenerate.
8. **Step Landing** (`/plans/[id]/landing`): AI generate 3 konsep landing page HTML. User pilih 1, bisa regenerate dengan model berbeda.
9. **Step Tasks** (`/plans/[id]/tasks`): AI memecah struktur fitur jadi task teknis per fase. Bisa dicentang, filter fase, export CSV, regenerate.
10. **Step Prompt** (`/plans/[id]/prompt`): AI merangkum semuanya jadi satu prompt siap pakai. Tab "Prompt" (copy/download per section) + tab "Persiapan & Skill". Copy prompt ke AI coding assistant.

---

## 5. Arsitektur & Tech Stack

### Frontend
- **Next.js 15** (App Router, Server Components + Client Components)
- **Tailwind CSS v4** dengan custom design tokens (`ink`, `paper`, `signal`, `trace`, `line`, `danger`, `ink-raised`, `ink-raised-2`, `signal-dim`, `trace-dim`)
- **Framer Motion** untuk animasi (dock scroll-linked, card reveal, loader)
- **@xyflow/react** (React Flow v12) untuk mind-map struktur fitur — custom nodes: `root`, `feature`, `subpanel`; custom edge: `trace-edge`
- **Lucide React** untuk ikon
- **React Markdown + remark-gfm** untuk rendering PRD/Struktur folder/Skills
- **JSZip** untuk download ZIP project

### Backend / API
- **Next.js API Routes** (App Router route handlers di `src/app/api/`)
- **NextAuth v5** (`@/lib/auth.ts`) dengan Google & GitHub provider
- **Drizzle ORM** untuk query database type-safe

### Database
- **libSQL/Turso**: SQLite via HTTP untuk Vercel (serverless-compatible)
- **SQLite lokal** (`file:ideforge.sqlite`) untuk development tanpa setup
- Auto-migration via `dbReady()`: create tables + `ALTER TABLE` additive columns

### AI Provider
- **Google Gemini API** (default, via `generateContent` endpoint dengan `responseSchema` untuk JSON terstruktur)
- **Anthropic Claude API** (opsional, via UI settings — belum diimplementasikan di server, hanya UI)
- **Custom API endpoint** (opsional, endpoint bebas — belum diimplementasikan di server, hanya UI)

### Deployment
- **Vercel** (serverless, static + API routes)

---

## 6. Basis Data (Schema Drizzle)

### Table: `plans`
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | `pln_${timestamp}${random}` |
| `idea_text` | TEXT NOT NULL | Input user |
| `language` | TEXT DEFAULT 'id' | `id` \| `en` |
| `tech_mode` | TEXT | `ai` \| `manual` |
| `tech_choice` | TEXT (JSON) | `{frontend, backend, database, extras?, reasoning?}` |
| `questions` | TEXT (JSON) | `ClarifyingQuestion[]` |
| `answers` | TEXT (JSON) | `ClarifyingAnswer[]` |
| `structure` | TEXT (JSON) | `PlanStructure` (appName, summary, features[]) |
| `prd` | TEXT | Markdown |
| `folder_structure` | TEXT | Markdown |
| `tasks` | TEXT (JSON) | `PlanTask[]` (id, featureId, featureName, phase, title, description, done) |
| `landing_options` | TEXT (JSON) | `LandingOption[]` (id, styleName, styleDescription, html) |
| `selected_landing_id` | TEXT | FK ke landing_options |
| `final_prompt` | TEXT | Prompt gabungan |
| `required_skills` | TEXT | Markdown skill checklist |
| `current_step` | TEXT | Enum PlanStep (`idea`→`tech`→`questions`→`structure`→`prd`→`landing`→`tasks`→`prompt`) |
| `user_email` | TEXT NULLABLE | FK ke user (NextAuth) |
| `created_at` | TEXT | ISO string |
| `updated_at` | TEXT | ISO string |

### Table: `model_usage`
| Column | Type | Notes |
|--------|------|-------|
| `date` | TEXT PK | `YYYY-MM-DD` (composite) |
| `model` | TEXT PK | Nama model AI (composite) |
| `count` | INTEGER DEFAULT 0 | Increment per successful AI call per model |

### Table: `settings`
| Column | Type | Notes |
|--------|------|-------|
| `device_id` | TEXT | PK (composite) |
| `key` | TEXT | PK (composite) — `ai_api_key`, `ai_provider`, `ai_api_url` |
| `value` | TEXT | Nilai pengaturan (terenkripsi AES-256-GCM untuk `ai_api_key`) |
| `created_at` | TEXT | `datetime('now')` |
| `updated_at` | TEXT | `datetime('now')` |

---

## 7. Kebutuhan Non-Fungsional

| Requirement | Implementasi |
|-------------|--------------|
| **Biaya gratis** | Gemini API free tier (1500 req/hari), SQLite/Turso free tier |
| **Skala personal** | Dirancang single-user / small team; Turso untuk serverless production |
| **Ketahanan model AI** | Fallback model otomatis (4 kandidat), retry logic |
| **Idempotensi step** | Setiap step generate hanya jalan sekali (check `if (plan.xxx) return existing`), refresh = load dari DB |
| **Portabilitas** | Lokal: SQLite file. Production: Turso (env `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`) |
| **Keamanan data** | API key simpan server-side (table `settings`), plan milik user filter by `user_email`, NextAuth session validation di API |
| **Type safety** | TypeScript strict, Drizzle schema → types, Zod untuk validasi input API (manual) |
| **Error handling** | Custom error classes (`GeminiConfigError`, `GeminiRequestError`), HTTP status mapping (412 config, 502 upstream, 500 internal) |

---

## 8. Metrik Keberhasilan

- User bisa menyelesaikan satu putaran penuh (ide → prompt final) dalam satu sesi tanpa error
- Prompt final yang dihasilkan cukup jelas dan spesifik sehingga AI coding assistant bisa langsung mulai membangun tanpa banyak pertanyaan balik
- Sistem tetap berfungsi normal meskipun Google menghentikan salah satu model Gemini yang jadi default (fallback otomatis terbukti kerja)
- User bisa login, data plan mengikuti akun, dan riwayat bisa diakses lintas perangkat
- Usage tracker akurat: counter harian update real-time, estimasi sisa prompt tampil di halaman input ide

---

## 9. Catatan Implementasi Khusus

### AI Prompt Engineering (`src/lib/ai/prompts.ts`)
- Setiap step punya `system` + `prompt` terpisah, bilingual (ID/EN)
- Prompt dirancang **spesifik untuk ide** — bukan template generik
- `clarifyingQuestionsPrompt`: AI tentukan sendiri 3-5 pertanyaan paling relevan, tentukan type/options/required/multi
- `structurePrompt`: Output fase 1/2/3, sub-fitur konkret (2-5 per fitur)
- `finalPromptCompilePrompt`: Instruksi eksplisit urutan pengerjaan (backend-first), jangan kerjakan fase 2/3 dulu

### Structured Output (`src/lib/ai/schemas.ts`)
- Schema OpenAPI-subset untuk Gemini `responseSchema`
- Memastikan JSON valid tanpa parsing error
- Fallback strip markdown fences kalau model tetap kasih ```json```

### React Flow Mind-map (`src/components/structure/`)
- `buildGraph.ts`: convert `PlanStructure` → nodes/edges (root → feature → subpanel)
- Custom nodes: `RootNode` (appName), `FeatureNode` (name, phase, status), `SubPanelNode` (expandable sub-features)
- Custom edge: `TraceEdge` (animated dashed line)
- Controls: zoom/pan, fitView, background dots

### Usage Tracking (`src/lib/db/usage.ts`)
- `incrementUpdate()` fire-and-forget (catch silent)
- `estimateRemainingPlans()`: `(1500 - used) / 7` calls per plan

---

## 10. File Kunci Referensi Cepat

| Path | Fungsi |
|------|--------|
| `src/lib/ai/gemini.ts` | Client Gemini: fallback model, retry, structured output, usage increment |
| `src/lib/ai/models.ts` | Registri model Gemini (free tier tagging & priority fallback chain) |
| `src/lib/ai/prompts.ts` | Semua prompt template (tech, questions, structure, PRD, landing, tasks, final, skills) |
| `src/lib/ai/schemas.ts` | JSON schema untuk Gemini structured output |
| `src/lib/db/schema.ts` | Drizzle schema `plans`, `settings` |
| `src/lib/db/repo.ts` | CRUD plan (create, get, listByUser, update, delete) |
| `src/lib/db/usage.ts` | Usage counter harian per-model + estimasi sisa |
| `src/lib/crypto.ts` | Pengenkripsi/dekripsi kunci sensitif (AES-256-GCM) dengan SETTINGS_ENCRYPTION_KEY |
| `src/lib/auth.ts` | NextAuth v5 config (Google, GitHub) |
| `src/lib/types.ts` | Semua type domain (Plan, TechChoice, ClarifyingQuestion, PlanStructure, PlanTask, LandingOption) |
| `src/app/api/plans/[id]/tech/route.ts` | Step Tech: AI rekomendasi / manual save |
| `src/app/api/plans/[id]/questions/route.ts` | Step Questions: generate + save answers |
| `src/app/api/plans/[id]/structure/route.ts` | Step Structure: generate mind-map data |
| `src/app/api/plans/[id]/prd/route.ts` | Step PRD: generate PRD + folder structure |
| `src/app/api/plans/[id]/landing/route.ts` | Step Landing: generate 3 konsep HTML |
| `src/app/api/plans/[id]/tasks/route.ts` | Step Tasks: generate breakdown + PATCH toggle done |
| `src/app/api/plans/[id]/prompt/route.ts` | Step Prompt: compile final prompt + required skills |
| `src/app/api/plans/[id]/github/route.ts` | Push ke GitHub repo |
| `src/components/structure/build-graph.ts` | PlanStructure → React Flow nodes/edges |
| `src/components/structure/nodes.tsx` | Custom node components (Root, Feature, SubPanel) |
| `src/components/steps/tech-step.tsx` | Client component step Tech |
| `src/components/steps/questions-step.tsx` | Client component step Questions |