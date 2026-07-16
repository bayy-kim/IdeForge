"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { cn, apiFetch } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Key, GitBranch, X, Loader2, Check, ExternalLink, Download, MoreHorizontal } from "lucide-react";

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

function activeStageFromPath(pathname: string, stepQuery?: string | null): (typeof STAGES)[number]["key"] {
  if (pathname.includes("/structure")) return "struktur";
  if (pathname.includes("/prd")) return "prd";
  if (pathname.includes("/landing")) return "landing";
  if (pathname.includes("/tasks")) return "task";
  if (pathname.includes("/prompt")) return "prompt";
  if (stepQuery === "questions") return "questions";
  if (pathname.match(/\/plans\/[^/]+$/)) return "tech";
  return "tech";
}

export function StepperHeader({ planId }: { planId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const active = activeStageFromPath(pathname, searchParams.get("step"));
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
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const [showGithub, setShowGithub] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubDesc, setGithubDesc] = useState("");
  const [githubPrivate, setGithubPrivate] = useState(false);
  const [githubPushing, setGithubPushing] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [githubSuccess, setGithubSuccess] = useState<string | null>(null);

  const isLoggedIn = !!session?.user?.email;

  // Close More dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    }
    if (showMore) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showMore]);

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
      .then((d) => setHasServerKey(d.hasKey))
      .catch(() => setHasServerKey(false));
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
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/plan" className="font-display text-base font-bold tracking-tight text-paper sm:text-lg shrink-0">
          idē<span className="text-signal">forge</span>
        </Link>

        {/* Desktop stages nav */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none mx-2 [-ms-overflow-style:none] [scrollbar-width:none]">
          {STAGES.map((stage, i) => {
            const done = i < activeIndex;
            const isActive = i === activeIndex;
            return (
              <div key={stage.key} className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full border transition-colors",
                      done && "border-trace bg-trace",
                      isActive && "border-signal bg-signal",
                      !done && !isActive && "border-line bg-transparent",
                    )}
                  />
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors",
                      isActive ? "text-signal" : done ? "text-trace" : "text-muted",
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
                {i < STAGES.length - 1 && (
                  <svg width="12" height="2" className="shrink-0">
                    <line
                      x1="0"
                      y1="1"
                      x2="12"
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

        {/* Mobile stage indicator */}
        <div className="md:hidden flex items-center gap-2">
          {(() => {
            const stage = STAGES[activeIndex];
            if (!stage) return null;
            return (
              <span key={stage.key} className="font-mono text-[10px] uppercase tracking-wider text-signal font-medium">
                {stage.label}
                <span className="text-muted ml-1">
                  {activeIndex + 1}/{STAGES.length}
                </span>
              </span>
            );
          })()}
        </div>

        {/* Desktop right actions */}
        <div className="hidden sm:flex items-center gap-3">
          <ApiKeyButton
            hasServerKey={hasServerKey}
            localKey={localKey}
            showInput={showInput}
            setShowInput={setShowInput}
            tempKey={tempKey}
            setTempKey={setTempKey}
            saveKey={saveKey}
          />

          {planId && (
            <>
              <a
                href={`/api/plans/${planId}/download`}
                className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs font-mono text-muted transition-colors hover:text-paper"
                title="Download ZIP Project"
              >
                <Download className="h-3 w-3" />
                <span>Download</span>
              </a>

              <GithubButton
                isLoggedIn={isLoggedIn}
                showGithub={showGithub}
                setShowGithub={setShowGithub}
              />

              <Link
                href="/plan"
                className="font-mono text-xs text-muted transition-colors hover:text-paper shrink-0"
              >
                + new plan
              </Link>
            </>
          )}
        </div>

        {/* Mobile "More" dropdown */}
        <div className="sm:hidden" ref={moreRef}>
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-muted hover:text-paper transition-colors"
            aria-label="Menu lainnya"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {showMore && (
            <div className="absolute right-2 top-full mt-1 w-56 rounded-xl border border-line bg-ink-raised p-2 shadow-xl z-50">
              <div className="flex flex-col gap-1">
                {/* API Key */}
                <button
                  onClick={() => { setShowInput(!showInput); setShowMore(false); }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono transition-colors w-full text-left",
                    hasServerKey || localKey ? "text-muted hover:text-paper hover:bg-ink-raised-2" : "text-danger"
                  )}
                >
                  <Key className="h-3.5 w-3.5 shrink-0" />
                  {hasServerKey ? "API Key (Server)" : localKey ? "API Key (Custom)" : "Set API Key"}
                </button>

                {planId && (
                  <>
                    <a
                      href={`/api/plans/${planId}/download`}
                      onClick={() => setShowMore(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono text-muted hover:text-paper hover:bg-ink-raised-2 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 shrink-0" />
                      Download ZIP
                    </a>

                    <button
                      onClick={() => {
                        setShowMore(false);
                        if (isLoggedIn) {
                          setShowGithub(true);
                        } else {
                          signIn("google", { callbackUrl: window.location.href });
                        }
                      }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono text-muted hover:text-paper hover:bg-ink-raised-2 transition-colors w-full text-left"
                      title="Push PRD, struktur, dan prompt ke GitHub"
                    >
                      <GitBranch className="h-3.5 w-3.5 shrink-0" />
                      Push ke GitHub
                    </button>

                    <Link
                      href="/plan"
                      onClick={() => setShowMore(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono text-muted hover:text-paper hover:bg-ink-raised-2 transition-colors border-t border-line mt-1 pt-2"
                    >
                      + new plan
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Mobile API Key popover */}
          {showInput && (
            <div className="absolute right-2 top-full mt-1 w-72 rounded-xl border border-line bg-ink-raised p-4 shadow-xl z-50">
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
                onClick={() => setShowInput(false)}
                className="mt-3 block text-center text-[11px] text-signal hover:underline"
              >
                Pengaturan lengkap →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* GitHub modal (shared desktop + mobile) */}
      {showGithub && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowGithub(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-line bg-ink-raised p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-signal" />
                <p className="text-sm font-bold text-paper font-display">Push ke GitHub</p>
              </div>
              <button onClick={() => setShowGithub(false)} className="text-muted hover:text-paper">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted mb-3 leading-relaxed border-b border-line pb-3">
              Akan membuat repo baru dan push: README, PRD, struktur fitur, tech stack, dan prompt final.
            </p>

            {githubSuccess ? (
              <div className="text-center py-4">
                <Check className="h-8 w-8 text-trace mx-auto mb-2" />
                <p className="text-sm text-paper mb-2">Berhasil dipush ke GitHub!</p>
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
                  className="block mt-4 mx-auto text-xs text-muted hover:text-paper font-mono"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  type="password"
                  placeholder="GitHub Personal Access Token"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="rounded border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-signal focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Nama repo (contoh: my-app)"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  className="rounded border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-signal focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Deskripsi (opsional)"
                    value={githubDesc}
                    onChange={(e) => setGithubDesc(e.target.value)}
                    className="flex-1 rounded border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-signal focus:outline-none"
                  />
                  <label className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={githubPrivate}
                      onChange={(e) => setGithubPrivate(e.target.checked)}
                      className="accent-signal"
                    />
                    <span className="text-xs text-muted">Private</span>
                  </label>
                </div>
                {githubError && (
                  <p className="text-xs text-danger bg-danger/10 rounded px-3 py-2">{githubError}</p>
                )}
                <button
                  onClick={handleGithubPush}
                  disabled={githubPushing}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-ink hover:bg-[#bef264] disabled:opacity-40 transition-colors"
                >
                  {githubPushing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <GitBranch className="h-4 w-4" />
                  )}
                  {githubPushing ? "Pushing..." : "Push Project"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Sub-components ─── */

function ApiKeyButton({
  hasServerKey, localKey, showInput, setShowInput, tempKey, setTempKey, saveKey,
}: {
  hasServerKey: boolean;
  localKey: string;
  showInput: boolean;
  setShowInput: (v: boolean) => void;
  tempKey: string;
  setTempKey: (v: string) => void;
  saveKey: () => void;
}) {
  return (
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
  );
}

function GithubButton({
  isLoggedIn, showGithub, setShowGithub,
}: {
  isLoggedIn: boolean;
  showGithub: boolean;
  setShowGithub: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => {
        if (!isLoggedIn) {
          signIn("google", { callbackUrl: window.location.href });
          return;
        }
        setShowGithub(!showGithub);
      }}
      className="group relative flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs font-mono text-muted transition-colors hover:text-paper"
    >
      <GitBranch className="h-3 w-3" />
      GitHub
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-raised-2 border border-line px-2.5 py-1 text-[10px] text-paper opacity-0 group-hover:opacity-100 transition-opacity">
        Push ke GitHub
      </span>
    </button>
  );
}


