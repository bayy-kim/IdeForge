"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, apiFetch } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Key, GitBranch, X, Loader2, Check, ExternalLink, Download } from "lucide-react";

const STAGES = [
  { key: "plan", label: "Plan" },
  { key: "tech", label: "Tech" },
  { key: "questions", label: "Q&A" },
  { key: "struktur", label: "Struktur" },
  { key: "prd", label: "PRD" },
  { key: "landing", label: "Landing" },
  { key: "task", label: "Task" },
  { key: "prompt", label: "Prompt" },
] as const;

function activeStageFromPath(pathname: string): (typeof STAGES)[number]["key"] {
  if (pathname.includes("/structure")) return "struktur";
  if (pathname.includes("/prd")) return "prd";
  if (pathname.includes("/landing")) return "landing";
  if (pathname.includes("/tasks")) return "task";
  if (pathname.includes("/prompt")) return "prompt";
  if (pathname.match(/\/plans\/[^/]+$/)) return "tech";
  return "tech";
}

export function StepperHeader({ planId }: { planId?: string }) {
  const pathname = usePathname();
  const active = activeStageFromPath(pathname);
  const activeIndex = STAGES.findIndex((s) => s.key === active);

  const [hasServerKey, setHasServerKey] = useState(true);
  const [localKey, setLocalKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ai_api_key") || "";
    }
    return "";
  });
  const [showInput, setShowInput] = useState(false);
  const [tempKey, setTempKey] = useState(localKey);

  const [showGithub, setShowGithub] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubDesc, setGithubDesc] = useState("");
  const [githubPrivate, setGithubPrivate] = useState(false);
  const [githubPushing, setGithubPushing] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [githubSuccess, setGithubSuccess] = useState<string | null>(null);

  async function handleGithubPush() {
    if (!planId || !githubToken.trim() || !githubRepo.trim()) {
      setGithubError("Token dan nama repo wajib diisi.");
      return;
    }
    setGithubPushing(true);
    setGithubError(null);
    setGithubSuccess(null);
    try {
      const res = await apiFetch(`/api/plans/${planId}/github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: githubToken.trim(),
          repo: githubRepo.trim(),
          description: githubDesc.trim(),
          private: githubPrivate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal push ke GitHub.");
      setGithubSuccess(data.repo);
    } catch (e) {
      setGithubError(e instanceof Error ? e.message : "Gagal push ke GitHub.");
    } finally {
      setGithubPushing(false);
    }
  }

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setHasServerKey(d.hasKey));
  }, []);

  function saveKey() {
    if (tempKey.trim()) {
      localStorage.setItem("ai_api_key", tempKey.trim());
      setLocalKey(tempKey.trim());
    } else {
      localStorage.removeItem("ai_api_key");
      setLocalKey("");
    }
    setShowInput(false);
    window.location.reload(); // Reload to apply key changes
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/plan" className="font-display text-lg font-bold tracking-tight text-paper">
          idē<span className="text-signal">forge</span>
        </Link>

        <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
          {STAGES.map((stage, i) => {
            const done = i < activeIndex;
            const isActive = i === activeIndex;
            return (
              <div key={stage.key} className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full border",
                      done && "border-trace bg-trace",
                      isActive && "border-signal bg-signal",
                      !done && !isActive && "border-line bg-transparent",
                    )}
                  />
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-wider",
                      isActive ? "text-signal" : done ? "text-trace" : "text-muted",
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
                {i < STAGES.length - 1 && (
                  <svg width="16" height="2" className="shrink-0">
                    <line
                      x1="0"
                      y1="1"
                      x2="16"
                      y2="1"
                      stroke={done ? "var(--trace)" : "var(--line)"}
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowInput(!showInput)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono transition-colors",
                hasServerKey
                  ? "border-line text-muted hover:text-paper"
                  : localKey
                    ? "border-trace/35 text-trace bg-trace-dim hover:bg-trace/20"
                    : "border-danger/30 text-danger bg-danger/10 hover:bg-danger/20 animate-pulse"
              )}
            >
              <Key className="h-3 w-3" />
              {hasServerKey ? "API Key (Server)" : localKey ? "API Key (Custom)" : "Set API Key"}
            </button>

            {showInput && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-line bg-ink-raised p-4 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-paper font-display">Gemini API Key Setup</p>
                  <button onClick={() => setShowInput(false)} className="text-muted hover:text-paper">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-muted mb-3 leading-normal">
                  {hasServerKey 
                    ? "Server sudah dikonfigurasi dengan API Key. Anda bisa mengisi custom API Key di bawah untuk menimpa key server."
                    : "Server belum dikonfigurasi API Key. Silakan masukkan Gemini API Key gratis dari Google AI Studio."}
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    className="flex-1 rounded border border-line bg-ink px-2 py-1 text-xs text-paper focus:border-signal focus:outline-none"
                  />
                  <button
                    onClick={saveKey}
                    className="rounded bg-signal px-3 text-xs font-semibold text-ink hover:bg-[#bef264]"
                  >
                    Simpan
                  </button>
                </div>
                <Link
                  href="/apikeys"
                  className="mt-3 block text-center text-[11px] text-signal hover:underline"
                >
                  Pengaturan lengkap →
                </Link>
              </div>
            )}
          </div>

          {planId && (
            <>
              <a
                href={`/api/plans/${planId}/download`}
                className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs font-mono text-muted transition-colors hover:text-paper"
                title="Download ZIP Project"
              >
                <Download className="h-3 w-3" />
                <span className="hidden sm:inline">Download</span>
              </a>
              <div className="relative">
                <button
                  onClick={() => setShowGithub(!showGithub)}
                  className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs font-mono text-muted transition-colors hover:text-paper"
                  title="Push to GitHub"
                >
                  <GitBranch className="h-3 w-3" />
                  GitHub
                </button>

                {showGithub && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-line bg-ink-raised p-4 shadow-xl z-50">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-paper font-display">Push to GitHub</p>
                      <button onClick={() => setShowGithub(false)} className="text-muted hover:text-paper">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {githubSuccess ? (
                      <div className="text-center py-3">
                        <Check className="h-6 w-6 text-trace mx-auto mb-2" />
                        <p className="text-xs text-paper mb-2">Berhasil dipush ke GitHub!</p>
                        <a
                          href={githubSuccess}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-signal hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> {githubSuccess}
                        </a>
                        <button
                          onClick={() => { setShowGithub(false); setGithubSuccess(null); }}
                          className="block mt-3 mx-auto text-xs text-muted hover:text-paper"
                        >
                          Tutup
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-2.5">
                          <input
                            type="password"
                            placeholder="GitHub Personal Access Token"
                            value={githubToken}
                            onChange={(e) => setGithubToken(e.target.value)}
                            className="rounded border border-line bg-ink px-2.5 py-1.5 text-xs text-paper focus:border-signal focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Nama repo (contoh: my-app)"
                            value={githubRepo}
                            onChange={(e) => setGithubRepo(e.target.value)}
                            className="rounded border border-line bg-ink px-2.5 py-1.5 text-xs text-paper focus:border-signal focus:outline-none"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Deskripsi (opsional)"
                              value={githubDesc}
                              onChange={(e) => setGithubDesc(e.target.value)}
                              className="flex-1 rounded border border-line bg-ink px-2.5 py-1.5 text-xs text-paper focus:border-signal focus:outline-none"
                            />
                            <label className="flex items-center gap-1.5 shrink-0">
                              <input
                                type="checkbox"
                                checked={githubPrivate}
                                onChange={(e) => setGithubPrivate(e.target.checked)}
                                className="accent-signal"
                              />
                              <span className="text-[11px] text-muted">Private</span>
                            </label>
                          </div>
                          {githubError && (
                            <p className="text-[11px] text-danger">{githubError}</p>
                          )}
                          <button
                            onClick={handleGithubPush}
                            disabled={githubPushing}
                            className="flex items-center justify-center gap-1.5 rounded bg-signal px-3 py-1.5 text-xs font-semibold text-ink hover:bg-[#bef264] disabled:opacity-40"
                          >
                            {githubPushing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <GitBranch className="h-3.5 w-3.5" />
                            )}
                            {githubPushing ? "Pushing..." : "Push Project"}
                          </button>
                        </div>
                        <p className="mt-2 text-[10px] text-muted leading-relaxed">
                          Akan membuat repo dan push: README, PRD, struktur fitur, tech stack, dan prompt final.
                          Pastikan token memiliki scope <strong className="text-paper">repo</strong>.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Link
                href="/plan"
                className="font-mono text-xs text-muted transition-colors hover:text-paper shrink-0"
              >
                + new plan
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


