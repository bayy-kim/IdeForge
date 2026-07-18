"use client";

import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col bg-ink text-paper">
      {/* Blueprint Grid Background */}
      <div className="blueprint-grid pointer-events-none absolute inset-0 z-0" />

      {/* Header */}
      <header className="relative z-10 border-b border-line bg-ink/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/plan" className="font-display text-lg font-bold tracking-tight text-paper">
            idē<span className="text-signal">forge</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10 text-danger border border-danger/20 mb-6">
          <FileQuestion className="h-8 w-8" />
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-paper sm:text-4xl">
          Halaman Tidak Ditemukan (404)
        </h1>

        <p className="mt-4 max-w-md text-sm text-muted leading-relaxed sm:text-base">
          Halaman ini gak ketemu — mungkin plan-nya udah dihapus, diprivat, atau link-nya salah ketik.
        </p>

        <div className="mt-8 flex justify-center">
          <Button asChild>
            <Link href="/plan" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Kembali ke Plan
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
