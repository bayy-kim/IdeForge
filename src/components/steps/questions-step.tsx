"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, apiFetch } from "@/lib/utils";
import type { ClarifyingQuestion } from "@/lib/types";

interface AnswerState {
  answer: string;
  skipped: boolean;
  customMode: boolean;
}

export function QuestionsStep({
  planId,
  onDone,
}: {
  planId: string;
  onDone: () => void;
}) {
  const [questions, setQuestions] = useState<ClarifyingQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/plans/${planId}/questions`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
        } else {
          const qs: ClarifyingQuestion[] = data.plan.questions || [];
          setQuestions(qs);
          setAnswers(
            Object.fromEntries(
              qs.map((q) => [q.id, { answer: "", skipped: false, customMode: false }]),
            ),
          );
        }
        setLoadingQuestions(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Gagal memuat pertanyaan.");
          setLoadingQuestions(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [planId]);

  function setAnswer(id: string, patch: Partial<AnswerState>) {
    setAnswers((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    setValidationErrors([]);
  }

  function validate(): boolean {
    if (!questions) return false;
    const errors: string[] = [];
    for (const q of questions) {
      if (!q.required) continue;
      const state = answers[q.id];
      if (!state || state.skipped) {
        errors.push(q.question);
        continue;
      }
      const raw = state.answer.trim();
      // FIXED: For multi-select choice questions, the answer is a JSON array string like "[]"
      // We check if type is "choice" and q.multi is true, then parse and check selected count
      if (q.type === "choice" && q.multi) {
        try {
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed) || parsed.length === 0) {
            errors.push(q.question);
          }
        } catch {
          errors.push(q.question);
        }
      } else if (!raw) {
        errors.push(q.question);
      }
    }
    setValidationErrors(errors);
    return errors.length === 0;
  }

  async function submit() {
    if (!questions) return;
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    const payload = questions.map((q) => {
      let answer = answers[q.id]?.answer || "";
      try {
        const parsed = JSON.parse(answer);
        if (Array.isArray(parsed)) {
          answer = parsed.join(", ");
        }
      } catch {}
      return {
        questionId: q.id,
        question: q.question,
        answer,
        skipped: answers[q.id]?.skipped || false,
      };
    });

    try {
      const saveRes = await apiFetch(`/api/plans/${planId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || "Gagal menyimpan jawaban.");

      const structRes = await apiFetch(`/api/plans/${planId}/structure`);
      const structData = await structRes.json();
      if (!structRes.ok) throw new Error(structData.error || "Gagal membuat struktur.");

      setSubmitting(false);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      setSubmitting(false);
    }
  }

  if (loadingQuestions) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-muted">
        <Loader2 className="h-6 w-6 animate-spin text-signal" />
        <p className="mt-3 text-sm">AI lagi nyusun pertanyaan buat mempertajam ide kamu...</p>
      </div>
    );
  }

  if (error && !questions) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl font-bold text-paper">Beberapa pertanyaan</h1>
        <span className="font-mono text-xs text-trace">{Object.values(answers).filter((a) => a.answer?.trim()).length}/{questions?.length ?? 0}</span>
      </div>
      <p className="mt-2 text-muted">
        Biar rencananya lebih akurat. Jawab pertanyaan di bawah.
        <span className="text-danger ml-1">*</span> = wajib dijawab.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {questions?.map((q, i) => {
          const state = answers[q.id] || { answer: "", skipped: false, customMode: false };
          const hasError = validationErrors.includes(q.question);
          return (
            <div key={q.id} className={cn("border-b border-line pb-8", state.skipped && "opacity-50")}>
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-paper">
                  <span className="mr-2 font-mono text-muted">{i + 1}.</span>
                  {q.question}
                  {q.required && <span className="ml-1 text-danger">*</span>}
                  {!q.required && (
                    <span className="ml-2 font-mono text-[10px] text-muted uppercase tracking-wider">(opsional)</span>
                  )}
                </p>
                {!q.required && (
                  <button
                    onClick={() =>
                      setAnswer(q.id, { skipped: !state.skipped, answer: "" })
                    }
                    className="shrink-0 font-mono text-xs text-muted transition-colors hover:text-paper"
                  >
                    {state.skipped ? "Batal lewati" : "Lewati"}
                  </button>
                )}
              </div>

              {hasError && (
                <p className="mt-2 text-xs text-danger">Jawaban wajib diisi sebelum lanjut.</p>
              )}

              {!state.skipped && (
                <div className="mt-4">
                  {q.type === "text" ? (
                    <Textarea
                      rows={2}
                      placeholder="Ketik jawabanmu..."
                      value={state.answer}
                      onChange={(e) => setAnswer(q.id, { answer: e.target.value })}
                      className={cn(hasError && "border-danger")}
                    />
                  ) : (
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {(q.options || []).map((opt) => {
                          const selectedOpts: string[] = (() => {
                            if (!state.answer) return [];
                            try { return JSON.parse(state.answer); }
                            catch { return state.answer.split(", "); }
                          })();
                          const isSelected = selectedOpts.includes(opt);
                          return (
                            <button
                              key={opt}
                              onClick={() => {
                                if (q.multi) {
                                  const current = new Set(selectedOpts);
                                  if (isSelected) current.delete(opt);
                                  else current.add(opt);
                                  setAnswer(q.id, { answer: JSON.stringify([...current]), customMode: false });
                                } else {
                                  setAnswer(q.id, { answer: opt, customMode: false });
                                }
                              }}
                              className={cn(
                                "rounded-full border px-4 py-2 text-sm transition-colors",
                                isSelected && !state.customMode
                                  ? "border-signal bg-signal-dim text-signal"
                                  : "border-line text-paper hover:border-signal/40",
                              )}
                            >
                              {opt}
                            </button>
                          );
                        })}
                        {q.allowCustom && (
                          <button
                            onClick={() => {
                              let custom = state.answer || "";
                              try {
                                const parsed = JSON.parse(custom);
                                if (Array.isArray(parsed)) custom = parsed.join(", ");
                              } catch {}
                              setAnswer(q.id, { customMode: true, answer: custom });
                            }}
                            className={cn(
                              "rounded-full border px-4 py-2 text-sm transition-colors",
                              state.customMode
                                ? "border-signal bg-signal-dim text-signal"
                                : "border-dashed border-line text-muted hover:border-signal/40",
                            )}
                          >
                            + Lainnya
                          </button>
                        )}
                      </div>
                      {q.multi && !state.customMode && (
                        <p className="mt-2 text-[11px] text-trace font-mono">
                          {(() => {
                            if (!state.answer) return "Pilih satu atau lebih";
                            try {
                              const arr = JSON.parse(state.answer);
                              return Array.isArray(arr) && arr.length ? `Dipilih: ${arr.join(", ")}` : "Pilih satu atau lebih";
                            } catch {
                              return `Dipilih: ${state.answer}`;
                            }
                          })()}
                        </p>
                      )}
                      {state.customMode && (
                        <div className="relative mt-3">
                          <Input
                            autoFocus
                            placeholder="Tulis jawaban lain..."
                            value={state.answer}
                            onChange={(e) => setAnswer(q.id, { answer: e.target.value })}
                            className={cn("pr-9", hasError && "border-danger")}
                          />
                          <button
                            onClick={() => setAnswer(q.id, { customMode: false, answer: "" })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-paper"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <div className="mt-8 flex justify-end">
        <Button onClick={submit} disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buat struktur"}
        </Button>
      </div>
    </div>
  );
}
