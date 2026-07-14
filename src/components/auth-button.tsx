"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogIn, LogOut, History, Settings } from "lucide-react";
import Link from "next/link";

export function AuthButton() {
  const { data: session } = useSession();

  if (session?.user?.email) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          href="/history"
          className="flex items-center gap-1.5 rounded-full border border-line px-2 py-1.5 font-mono text-xs text-muted transition-colors hover:border-signal/40 hover:text-paper sm:px-3"
        >
          <History className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Riwayat</span>
        </Link>
        <Link
          href="/apikeys"
          className="flex items-center gap-1.5 rounded-full border border-line px-2 py-1.5 font-mono text-xs text-muted transition-colors hover:border-signal/40 hover:text-paper sm:px-3"
        >
          <Settings className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Pengaturan</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-1.5 rounded-full border border-line px-2 py-1.5 font-mono text-xs text-muted transition-colors hover:border-danger/40 hover:text-danger sm:px-3"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center gap-1.5 rounded-full border border-signal/40 bg-signal-dim px-3 py-1.5 font-mono text-xs text-signal transition-colors hover:bg-signal-dim/80"
    >
      <LogIn className="h-3.5 w-3.5" /> Login
    </button>
  );
}
