"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";

export function CtaButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleClick() {
    if (session?.user?.email) {
      router.push("/plan");
    } else {
      setOpen(true);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-xl bg-signal px-8 py-4 font-display text-base font-semibold text-ink transition-colors hover:bg-signal/90"
      >
        Mulai Bikin
        <ArrowRight className="h-5 w-5" />
      </button>
      {open && !session?.user?.email && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-44 rounded-xl border border-line bg-ink-raised p-2 shadow-xl z-50">
          <button
            onClick={() => { signIn("google"); setOpen(false); }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-paper transition-colors hover:bg-ink-raised-2"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-muted font-mono">G</span>
            Google
          </button>
          <button
            onClick={() => { signIn("github"); setOpen(false); }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-paper transition-colors hover:bg-ink-raised-2"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-muted font-mono">GH</span>
            GitHub
          </button>
        </div>
      )}
    </div>
  );
}
