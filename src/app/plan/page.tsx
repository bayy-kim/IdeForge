"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Loader2, History, BarChart3, Key, MoreHorizontal, LogOut } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";
import { LoginPopover } from "@/components/login-popover";
import { BgOrbs } from "@/components/bg-orbs";

const PLACEHOLDER =
  'Contoh: "Aplikasi pencatat pengeluaran harian, bisa input lewat WhatsApp, ada dashboard ringkasan bulanan..."';

export default function PlanLandingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [ideaText, setIdeaText] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ todayUsage: number; remaining: number } | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false);
      }
    }
    if (showMobileMenu) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showMobileMenu]);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setUsage({ todayUsage: d.todayUsage ?? 0, remaining: d.remaining ?? 0 }))
      .catch(() => {});
  }, []);

  async function handleSubmit() {
    if (ideaText.trim().length < 8) {
      setError(
        language === "en"
          ? "Please describe it with a bit more detail, at least one sentence."
          : "Ceritain sedikit lebih detail ya, minimal satu kalimat.",
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-line bg-ink/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="font-display text-base font-bold tracking-tight text-paper sm:text-lg">
            idē<span className="text-signal">forge</span>
          </Link>
          <div className="flex items-center gap-2">
            {session?.user?.email ? (
              <>
                {/* Desktop nav */}
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/history"
                    className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-signal/40 hover:text-paper"
                  >
                    <History className="h-3.5 w-3.5 shrink-0" />
                    <span>Riwayat</span>
                  </Link>
                  <Link
                    href="/apikeys"
                    className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-signal/40 hover:text-paper"
                  >
                    <Key className="h-3.5 w-3.5 shrink-0" />
                    <span>Pengaturan</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-danger/40 hover:text-danger"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout</span>
                  </button>
                </div>

                {/* Mobile menu */}
                <div className="relative sm:hidden" ref={mobileRef}>
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-muted hover:text-paper transition-colors"
                    aria-label="Menu"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  {showMobileMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-line bg-ink-raised p-2 shadow-xl z-50">
                      <Link
                        href="/history"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono text-muted hover:text-paper hover:bg-ink-raised-2 transition-colors"
                      >
                        <History className="h-3.5 w-3.5 shrink-0" />
                        Riwayat
                      </Link>
                      <Link
                        href="/apikeys"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono text-muted hover:text-paper hover:bg-ink-raised-2 transition-colors"
                      >
                        <Key className="h-3.5 w-3.5 shrink-0" />
                        Pengaturan
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono text-danger hover:bg-danger/10 transition-colors w-full text-left"
                      >
                        <LogOut className="h-3.5 w-3.5 shrink-0" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <LoginPopover />
            )}
          </div>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-6">
        <div className="blueprint-grid pointer-events-none absolute inset-0" />
        <BgOrbs />

        <div className="relative z-10 w-full max-w-2xl">
          <div className="mb-10 text-center">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-trace">
              ideforge
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-paper sm:text-5xl">
              {language === "en" ? "What do you want to build?" : "Mau bikin apa?"}
            </h1>
            <p className="mt-3 text-muted">
              {language === "en"
                ? "Tell us your idea, and AI will map it into a tech stack, PRD, and actionable tasks."
                : "Ceritain idemu, biar AI bantu susun jadi tech stack, PRD, dan task yang siap dikerjakan."}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-ink-raised p-2 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]">
            <Textarea
              value={ideaText}
              id="idea-text"
              name="idea-text"
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder={language === "en" ? 'Example: "Daily expense tracker app, can input via WhatsApp, with monthly dashboard..."' : PLACEHOLDER}
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
                  Indonesia
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
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-signal text-ink transition-colors hover:bg-[#bef264] disabled:opacity-50"
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
              href="/history"
              className="flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-paper"
            >
              <History className="h-3.5 w-3.5" />
              Riwayat rencana
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
