"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Check, RotateCw, Download, CheckCheck } from "lucide-react";
import { QuantumPulseLoader } from "@/components/ui/quantum-pulse-loader";
import { Button } from "@/components/ui/button";
import { StepNav } from "@/components/step-nav";
import { Badge } from "@/components/ui/badge";
import { cn, apiFetch } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { Plan, PlanTask } from "@/lib/types";

export default function TasksPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/plans/${id}/tasks`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else setPlan(data.plan);
      })
      .catch(() => !cancelled && setError("Gagal memuat task."));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const grouped = useMemo(() => {
    const tasks = plan?.tasks;
    if (!tasks) return [];
    const byFeature = new Map<string, { featureName: string; phase: number; tasks: PlanTask[] }>();
    for (const t of tasks) {
      if (!byFeature.has(t.featureId)) {
        byFeature.set(t.featureId, { featureName: t.featureName, phase: t.phase, tasks: [] });
      }
      byFeature.get(t.featureId)!.tasks.push(t);
    }
    return [...byFeature.values()].sort((a, b) => a.phase - b.phase);
  }, [plan?.tasks]);

  const phases = useMemo(() => {
    if (!plan?.tasks) return [];
    return [...new Set(plan.tasks.map((t) => t.phase))].sort((a, b) => a - b);
  }, [plan]);

  const filteredGrouped = useMemo(() => {
    if (phaseFilter === null) return grouped;
    return grouped.filter((g) => g.phase === phaseFilter);
  }, [grouped, phaseFilter]);

  async function markAllDone(phase: number, done: boolean) {
    if (!plan?.tasks) return;
    const tasksInPhase = plan.tasks.filter((t) => t.phase === phase);
    setPlan({
      ...plan,
      tasks: plan.tasks.map((t) => (t.phase === phase ? { ...t, done } : t)),
    });
    for (const t of tasksInPhase) {
      await apiFetch(`/api/plans/${id}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: t.id, done }),
      });
    }
  }

  function exportCsv() {
    if (!plan?.tasks) return;
    const rows = [["Feature", "Phase", "Task", "Description", "Status"]];
    for (const t of plan.tasks) {
      rows.push([t.featureName, String(t.phase), t.title, t.description, t.done ? "Selesai" : "Belum"]);
    }
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan.structure?.appName || "tasks"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function toggleTask(taskId: string, done: boolean) {
    if (!plan) return;
    setPlan({
      ...plan,
      tasks: plan.tasks!.map((t) => (t.id === taskId ? { ...t, done } : t)),
    });
    await apiFetch(`/api/plans/${id}/tasks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, done }),
    });
  }

  async function handleRegenerate() {
    if (!confirm("Apakah Anda yakin ingin men-generate ulang task? Semua centang akan direset.")) return;
    setRegenerating(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/plans/${id}/tasks?regenerate=true`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal melakukan regenerasi.");
      setPlan(data.plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal melakukan regenerasi.");
    } finally {
      setRegenerating(false);
    }
  }

  async function goToPrompt() {
    setAdvancing(true);
    router.push(`/plans/${id}/prompt`);
  }

  if (error && !plan) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  if (!plan?.tasks || regenerating) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24">
        <QuantumPulseLoader />
      </div>
    );
  }

  const doneCount = plan.tasks.filter((t) => t.done).length;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-paper">Task breakdown</h1>
          <span className="font-mono text-xs text-trace mt-1 block">
            {doneCount}/{plan.tasks.length} selesai
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleRegenerate}>
            <RotateCw className="h-3.5 w-3.5 mr-1" /> Regenerate
          </Button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="no-print mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setPhaseFilter(null)}
          className={cn(
            "rounded-full border px-3 py-1.5 font-mono text-xs transition-colors",
            phaseFilter === null ? "border-signal bg-signal-dim text-signal" : "border-line text-muted hover:text-paper",
          )}
        >
          Semua
        </button>
        {phases.map((p) => (
          <button
            key={p}
            onClick={() => setPhaseFilter(p)}
            className={cn(
              "rounded-full border px-3 py-1.5 font-mono text-xs transition-colors",
              phaseFilter === p ? "border-signal bg-signal-dim text-signal" : "border-line text-muted hover:text-paper",
            )}
          >
            Fase {p}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {filteredGrouped.map((group, gi) => (
          <motion.div
            key={group.featureName}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: gi * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl border border-line bg-ink-raised p-5"
          >
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="signal">Fase {group.phase}</Badge>
              <h2 className="font-display font-semibold text-paper">{group.featureName}</h2>
              <button
                onClick={() => markAllDone(group.phase, true)}
                className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-[10px] text-trace transition-colors hover:bg-ink-raised-2 hover:text-paper"
                title="Tandai semua selesai"
              >
                <CheckCheck className="h-3 w-3" /> semua
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {group.tasks.map((t, ti) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: gi * 0.08 + ti * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-3"
                >
                  <button
                    onClick={() => toggleTask(t.id, !t.done)}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                      t.done ? "border-trace bg-trace text-ink" : "border-line hover:border-trace/50",
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {t.done && (
                        <motion.span
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  <div>
                    <p className={cn("text-sm text-paper", t.done && "text-muted line-through")}>
                      {t.title}
                    </p>
                    <p className="text-xs text-muted">{t.description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <StepNav
        prevLabel="Kembali ke landing"
        prevHref={`/plans/${id}/landing`}
        nextLabel="Generate Prompt"
        nextLoading={advancing}
        onNext={goToPrompt}
      />
    </div>
  );
}
