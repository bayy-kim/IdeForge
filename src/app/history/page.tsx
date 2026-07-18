"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { LoginPopover } from "@/components/login-popover";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";
import { motion } from "@/components/motion";
import type { Plan } from "@/lib/types";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const sessionLoaded = status !== "loading";
  const isLoggedIn = !!session?.user?.email;

  useEffect(() => {
    if (!sessionLoaded || !isLoggedIn) return;
    let cancelled = false;
    fetch("/api/plans")
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setPlans(d.plans || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [sessionLoaded, isLoggedIn]);

  async function handleDelete(id: string) {
    if (!confirm("Hapus rencana ini?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/plans/${id}`, { method: "DELETE" });
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Gagal menghapus.");
    } finally {
      setDeleting(null);
    }
  }

  if (status === "loading") {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-6 py-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-muted"
        >
          Memuat...
        </motion.p>
      </main>
    );
  }

  if (!session?.user?.email) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <FileText className="mb-4 h-12 w-12 text-muted mx-auto" />
          <h1 className="font-display text-xl font-bold text-paper">Riwayat Rencana</h1>
          <p className="mt-2 text-sm text-muted">Login dulu buat lihat riwayat rencana kamu.</p>
          <div className="mt-6">
            <LoginPopover />
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <Link
        href="/plan"
        className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-paper"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> buat rencana
      </Link>

      <h1 className="font-display text-2xl font-bold text-paper">Riwayat Rencana</h1>
      <p className="mt-1 text-xs text-muted">{plans.length} rencana</p>

      {plans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-12 text-center"
        >
          <FileText className="mx-auto mb-4 h-10 w-10 text-muted" />
          <p className="text-sm text-muted">Belum ada rencana. Mulai bikin dari halaman utama.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-signal px-5 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90"
          >
            Buat Rencana
          </Link>
        </motion.div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-ink-raised p-4 transition-colors hover:border-signal/30"
            >
              <Link href={`/plans/${plan.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium text-paper">{plan.ideaText}</p>
                <p className="mt-0.5 font-mono text-[10px] text-muted">
                  {new Date(plan.createdAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  <span className="ml-2 uppercase">{plan.currentStep}</span>
                  {plan.language !== "id" && <span className="ml-2">{plan.language}</span>}
                </p>
              </Link>
              <button
                onClick={() => handleDelete(plan.id)}
                disabled={deleting === plan.id}
                className="shrink-0 rounded-lg p-2 text-muted opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
