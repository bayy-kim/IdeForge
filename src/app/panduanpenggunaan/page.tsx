import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function PanduanPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-paper"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> beranda
      </Link>

      <div className="mb-10 text-center">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-trace">Panduan</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-paper">Cara Pakai IdeForge</h1>
        <p className="mt-2 text-sm text-muted">Studi kasus: aplikasi pencatat pengeluaran harian via WhatsApp + dashboard bulanan.</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* 1 */}
        <div className="rounded-xl border border-line bg-ink-raised p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-signal-dim font-mono text-sm font-bold text-signal">1</span>
            <h3 className="font-display font-semibold text-paper">Login dengan Google</h3>
          </div>
          <p className="mt-3 text-xs text-muted leading-relaxed">
            Klik tombol <strong className="text-paper">Mulai Buat Ide</strong> atau <strong className="text-paper">Login</strong> di pojok kanan atas. Login cukup sekali &mdash; data dan riwayat tersimpan otomatis ke akun kamu.
          </p>
        </div>

        {/* 2 */}
        <div className="rounded-xl border border-line bg-ink-raised p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-signal-dim font-mono text-sm font-bold text-signal">2</span>
            <h3 className="font-display font-semibold text-paper">Masukkan API Key</h3>
          </div>
          <p className="mt-3 text-xs text-muted leading-relaxed">
            Buka halaman <Link href="/apikeys" className="text-signal underline">Pengaturan</Link>, pilih provider AI (Gemini/Claude/Kustom), masukkan API key, lalu klik <strong className="text-paper">Test</strong> untuk memastikan koneksi berhasil. API key bisa diambil gratis di Google AI Studio.
          </p>
        </div>

        {/* 3 */}
        <div className="rounded-xl border border-line bg-ink-raised p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-signal-dim font-mono text-sm font-bold text-signal">3</span>
            <h3 className="font-display font-semibold text-paper">Tulis Ide Aplikasi</h3>
          </div>
          <p className="mt-3 text-xs text-muted leading-relaxed">
            Di halaman utama, ceritakan ide kamu dalam 1-2 kalimat. Pilih bahasa (Indonesia/Inggris).
          </p>
          <div className="mt-3 rounded-lg border border-line bg-ink p-3">
            <p className="font-mono text-xs text-muted">
              <span className="text-trace">Input:</span>
            </p>
            <p className="mt-1 text-sm text-paper">
              &ldquo;Aplikasi pencatat pengeluaran harian, bisa input lewat WhatsApp, ada dashboard ringkasan bulanan.&rdquo;
            </p>
          </div>
        </div>

        {/* 4 */}
        <div className="rounded-xl border border-line bg-ink-raised p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-signal-dim font-mono text-sm font-bold text-signal">4</span>
            <h3 className="font-display font-semibold text-paper">Pilih Tech Stack</h3>
          </div>
          <p className="mt-3 text-xs text-muted leading-relaxed">
            AI rekomendasi tech stack yang cocok. Kamu bisa pilih salah satu atau custom.
          </p>
          <div className="mt-3 rounded-lg border border-line bg-ink p-3">
            <p className="font-mono text-xs text-muted">
              <span className="text-trace">Rekomendasi AI:</span>
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {[
                { label: "Opsi A", value: "Next.js 15 + Tailwind CSS v4 + Turso + Twilio" },
                { label: "Opsi B", value: "React Native + Firebase + WhatsApp Business API" },
                { label: "Opsi C", value: "Python (FastAPI) + React + PostgreSQL + Twilio" },
              ].map((o) => (
                <div key={o.label} className="flex items-center gap-2 rounded border border-line px-3 py-2">
                  <span className="font-mono text-[10px] font-medium text-signal">{o.label}</span>
                  <span className="text-xs text-paper">{o.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5 */}
        <div className="rounded-xl border border-line bg-ink-raised p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-signal-dim font-mono text-sm font-bold text-signal">5</span>
            <h3 className="font-display font-semibold text-paper">Jawab Pertanyaan Klarifikasi</h3>
          </div>
          <p className="mt-3 text-xs text-muted leading-relaxed">
            AI ngajuin pertanyaan buat memperjelas ide. Wajib dijawab biar hasil lebih akurat.
          </p>
          <div className="mt-3 rounded-lg border border-line bg-ink p-3">
            <p className="font-mono text-xs text-muted">
              <span className="text-trace">Contoh pertanyaan &amp; jawaban:</span>
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              <li className="text-xs">
                <span className="text-paper">❓ Mau pakai mata uang apa saja?</span>
                <span className="ml-2 text-trace">→ IDR (Rupiah) aja</span>
              </li>
              <li className="text-xs">
                <span className="text-paper">❓ Kategori pengeluaran default apa aja?</span>
                <span className="ml-2 text-trace">→ Makanan, Transport, Belanja, Tagihan, Hiburan, Lainnya</span>
              </li>
              <li className="text-xs">
                <span className="text-paper">❓ Perlu fitur export laporan?</span>
                <span className="ml-2 text-trace">→ Iya, CSV sama PDF</span>
              </li>
              <li className="text-xs">
                <span className="text-paper">❓ Mau pake budget planning per bulan?</span>
                <span className="ml-2 text-trace">→ Engga dulu, cukup catatan aja</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 6 */}
        <div className="rounded-xl border border-line bg-ink-raised p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-signal-dim font-mono text-sm font-bold text-signal">6</span>
            <h3 className="font-display font-semibold text-paper">Dapatkan Prompt Final</h3>
          </div>
          <p className="mt-3 text-xs text-muted leading-relaxed">
            Prompt siap pakai buat coding. Copy langsung atau download file .md. Tinggal paste ke Claude Code, Cursor, atau coding assistant manapun.
          </p>
          <div className="mt-3 rounded-xl border border-line bg-ink-raised">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-signal-dim font-mono text-[10px] font-bold text-signal">MD</span>
              <span className="font-mono text-[10px] text-muted uppercase tracking-wider">final-prompt.md</span>
            </div>
            <pre className="overflow-x-auto p-4 text-xs text-muted leading-relaxed"><code>{`## Tech Stack
- Frontend: Next.js 15 + Tailwind CSS v4 + TypeScript
- Database: Turso (SQLite via libsql/client)
- Integrasi: Twilio (WhatsApp webhook)
- Chart: Recharts
- Auth: NextAuth.js (Google OAuth)
- Deployment: Vercel

## Arsitektur
- App Router (/dashboard, /api/transactions, /api/webhook/twilio)
- Server Components untuk dashboard
- API Route Handlers di /api/
- Webhook endpoint untuk WhatsApp

## Database Schema
\`\`\`sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TEXT NOT NULL
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  budget REAL
);
\`\`\`

## API Endpoints
- POST /api/webhook/twilio — terima pesan WhatsApp
- GET /api/transactions?month=2026-07 — list
- POST /api/transactions — tambah manual
- DELETE /api/transactions/:id
- GET /api/transactions/summary?month=2026-07
- GET /api/categories
- POST /api/categories

## Halaman
- /dashboard — chart + ringkasan bulanan
- /transactions — tabel + filter
- /settings — atur kategori

## Prioritas Task
1. Setup project + database schema + migrasi
2. CRUD transaksi + kategori
3. Webhook Twilio + parser WhatsApp
4. Dashboard chart + summary
5. Export CSV / PDF
6. Filter & search`}</code></pre>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/plan"
          className="inline-flex items-center gap-2 rounded-xl bg-signal px-6 py-3 font-display text-sm font-semibold text-ink transition-colors hover:bg-[#bef264]"
        >
          <BookOpen className="h-4 w-4" /> Mulai Buat Rencana
        </Link>
      </div>
    </main>
  );
}
