"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { LogIn, Bug, X } from "lucide-react";

const providers = [
  { id: "google", label: "Google", icon: "G" },
  { id: "github", label: "GitHub", icon: "GH" },
];

export function LoginPopover() {
  const [open, setOpen] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [devError, setDevError] = useState<string | null>(null);
  const [devLoading, setDevLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowDev(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleDevLogin() {
    if (!devCode.trim()) {
      setDevError("Masukkan kode dev login.");
      return;
    }
    setDevLoading(true);
    setDevError(null);
    try {
      const result = await signIn("dev", {
        code: devCode.trim(),
        redirect: false,
      });
      if (result?.error) {
        setDevError("Kode salah. Coba lagi.");
      } else {
        setOpen(false);
        setShowDev(false);
        window.location.reload();
      }
    } catch {
      setDevError("Gagal login. Coba lagi.");
    } finally {
      setDevLoading(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-signal/40 bg-signal-dim px-3 py-1.5 font-mono text-xs text-signal transition-colors hover:bg-signal-dim/80"
      >
        <LogIn className="h-3.5 w-3.5" /> Login
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-line bg-ink-raised p-2 shadow-xl z-50">
          {showDev ? (
            <div className="p-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-paper font-display">Dev Login</p>
                <button
                  onClick={() => { setShowDev(false); setDevError(null); }}
                  className="text-muted hover:text-paper"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                type="password"
                placeholder="Kode dev..."
                value={devCode}
                onChange={(e) => setDevCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDevLogin()}
                className="w-full rounded border border-line bg-ink px-2.5 py-1.5 text-xs text-paper placeholder:text-muted focus:border-signal focus:outline-none"
                autoFocus
              />
              {devError && <p className="mt-1 text-[10px] text-danger">{devError}</p>}
              <button
                onClick={handleDevLogin}
                disabled={devLoading}
                className="mt-2 w-full rounded bg-signal px-3 py-1.5 text-xs font-semibold text-ink hover:bg-[#bef264] disabled:opacity-40 transition-colors"
              >
                {devLoading ? "..." : "Masuk"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { signIn(p.id); setOpen(false); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-paper transition-colors hover:bg-ink-raised-2"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-muted font-mono">
                    {p.icon}
                  </span>
                  {p.label}
                </button>
              ))}
              <div className="border-t border-line mt-1 pt-1">
                <button
                  onClick={() => setShowDev(true)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-ink-raised-2"
                >
                  <Bug className="h-3.5 w-3.5" />
                  Dev Login
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
