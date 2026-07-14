"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCw } from "lucide-react";
import { QuantumPulseLoader } from "@/components/ui/quantum-pulse-loader";
import { Button } from "@/components/ui/button";
import { StepNav } from "@/components/step-nav";
import { Badge } from "@/components/ui/badge";
import { cn, apiFetch } from "@/lib/utils";
import type { Plan, PlanTask } from "@/lib/types";

export default function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

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
          <Button variant="outline" size="sm" onClick={handleRegenerate}>
            <RotateCw className="h-3.5 w-3.5 mr-1" /> Regenerate
          </Button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="flex flex-col gap-6">
        {grouped.map((group) => (
          <div key={group.featureName} className="rounded-xl border border-line bg-ink-raised p-5">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="signal">Fase {group.phase}</Badge>
              <h2 className="font-display font-semibold text-paper">{group.featureName}</h2>
            </div>
            <ul className="flex flex-col gap-2">
              {group.tasks.map((t) => (
                <li key={t.id} className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(t.id, !t.done)}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                      t.done ? "border-trace bg-trace text-ink" : "border-line hover:border-trace/50",
                    )}
                  >
                    {t.done && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <div>
                    <p className={cn("text-sm text-paper", t.done && "text-muted line-through")}>
                      {t.title}
                    </p>
                    <p className="text-xs text-muted">{t.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
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
