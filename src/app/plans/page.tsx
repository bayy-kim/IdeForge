"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Trash2, Download, Upload } from "lucide-react";
import type { Plan } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "@/components/motion";

export default function PlansListPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((d) => setPlans(d.plans || []))
      .catch(() => setPlans([]));
  }, []);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus plan ini?")) return;
    
    try {
      const res = await fetch(`/api/plans/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      setPlans((prev) => (prev ? prev.filter((p) => p.id !== id) : null));
    } catch {
      alert("Gagal menghapus plan.");
    }
  }

  async function handleExport(plan: Plan) {
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan.structure?.appName || plan.ideaText.slice(0, 30)}.plan.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await fetch("/api/plans/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengimpor plan.");
      }
      const result = await res.json();
      router.push(`/plans/${result.plan.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal mengimpor plan.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/plan"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-paper"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          buat rencana
        </Link>
        <Button variant="outline" size="sm" onClick={handleImportClick} disabled={importing}>
          <Upload className="h-3.5 w-3.5" />
          {importing ? "Mengimpor..." : "Impor"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>

      <h1 className="font-display text-2xl font-bold text-paper">Daftar Rencana</h1>

      {plans === null && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-6 text-sm text-muted"
        >
          Memuat...
        </motion.p>
      )}

      {plans?.length === 0 && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 text-sm text-muted"
        >
          Belum ada rencana. Mulai buat rencana pertamamu.
        </motion.p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {plans?.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="group flex items-center justify-between gap-3 rounded-lg border border-line bg-ink-raised p-4 transition-colors hover:border-signal/40"
          >
            <Link
              href={
                plan.currentStep === "structure"
                  ? `/plans/${plan.id}/structure`
                  : plan.currentStep === "prd"
                    ? `/plans/${plan.id}/prd`
                    : plan.currentStep === "landing"
                      ? `/plans/${plan.id}/landing`
                      : plan.currentStep === "tasks"
                        ? `/plans/${plan.id}/tasks`
                        : plan.currentStep === "prompt"
                          ? `/plans/${plan.id}/prompt`
                          : `/plans/${plan.id}`
              }
              className="flex min-w-0 flex-1 items-start gap-3"
            >
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-trace" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-paper">
                  {plan.structure?.appName || plan.ideaText}
                </p>
                <p className="mt-1 truncate text-xs text-muted">{plan.ideaText}</p>
              </div>
              <Badge variant="neutral" className="ml-2 shrink-0">{plan.currentStep}</Badge>
            </Link>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleExport(plan); }}
                className="rounded p-1 text-muted transition-colors hover:bg-ink hover:text-trace"
                title="Export plan"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => handleDelete(e, plan.id)}
                className="rounded p-1 text-muted transition-colors hover:bg-ink hover:text-danger"
                title="Hapus plan"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
