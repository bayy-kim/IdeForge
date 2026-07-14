"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

const providers = [
  { id: "google", label: "Google", icon: "G" },
  { id: "github", label: "GitHub", icon: "GH" },
];

export function LoginPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-signal/40 bg-signal-dim px-3 py-1.5 font-mono text-xs text-signal transition-colors hover:bg-signal-dim/80"
      >
        <LogIn className="h-3.5 w-3.5" /> Login
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-line bg-ink-raised p-2 shadow-xl z-50">
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
        </div>
      )}
    </div>
  );
}
