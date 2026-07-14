"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Loader2, History, BarChart3, Key } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

const PLACEHOLDER =
  'Contoh: "Aplikasi pencatat pengeluaran harian, bisa input lewat WhatsApp, ada dashboard ringkasan bulanan..."';

export default function PlanLandingPage() {
  const router = useRouter();
  const [ideaText, setIdeaText] = useState("");
  const [language, setLanguage] = useState("id");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ todayUsage: number; remaining: number } | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setUsage({ todayUsage: d.todayUsage ?? 0, remaining: d.remaining ?? 0 }))
      .catch(() => {});
  }, []);

  async function handleSubmit() {
    if (ideaText.trim().length < 8) {
      setError(language === "id" 
        ? "Ceritain sedikit lebih detail ya, minimal satu kalimat."
        : "Please describe it with a bit more detail, at least one sentence."
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaText, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat plan.");
      router.push(`/plans/${data.plan.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <div className="blueprint-grid pointer-events-none absolute inset-0" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-10 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-trace">
            ideforge
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-paper sm:text-5xl">
            {language === "id" ? "Mau bikin apa?" : "What do you want to build?"}
          </h1>
          <p className="mt-3 text-muted">
            {language === "id"
              ? "Ceritain idemu, biar AI bantu susun jadi tech stack, PRD, dan task yang siap dikerjakan."
              : "Tell us your idea, and AI will map it into a tech stack, PRD, and actionable tasks."}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-ink-raised p-2 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]">
          <Textarea
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            placeholder={language === "id" ? PLACEHOLDER : 'Example: "Daily expense tracker app, can input via WhatsApp, with monthly dashboard..."'}
            rows={5}
            className="border-none bg-transparent px-4 py-4 text-base focus-visible:ring-0"
            disabled={loading}
          />
          <div className="flex items-center justify-between px-3 pb-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLanguage("id")}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono border ${
                  language === "id"
                    ? "border-signal text-signal bg-signal-dim"
                    : "border-line text-muted hover:text-paper"
                }`}
              >
                Bahasa Indonesia
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono border ${
                  language === "en"
                    ? "border-signal text-signal bg-signal-dim"
                    : "border-line text-muted hover:text-paper"
                }`}
              >
                English
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-signal text-ink transition-colors hover:bg-[#ff7d54] disabled:opacity-50"
              aria-label="Buat plan"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-center text-sm text-danger">{error}</p>}

        {usage && (
          <div className="mt-6 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-wider text-trace">
            <BarChart3 className="h-3 w-3" />
            <span>Hari ini: {usage.todayUsage} request AI &middot; Sisa ~{usage.remaining} prompt</span>
          </div>
        )}

          <div className="mt-8 flex justify-center">
          <Link
            href="/apikeys"
            className="flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-paper"
          >
            <Key className="h-3.5 w-3.5" />
            Pengaturan API & Database
          </Link>
        </div>

        <div className="mt-4 flex justify-center">
          <Link
            href="/history"
            className="flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-paper"
          >
            <History className="h-3.5 w-3.5" />
            Riwayat rencana
          </Link>
        </div>
      </div>
    </main>
  );
}
