import { NextRequest, NextResponse } from "next/server";
import { getPlan, updatePlan } from "@/lib/db/repo";
import { generateJSON, GeminiConfigError, GeminiRequestError } from "@/lib/ai/gemini";
import { tasksSchema } from "@/lib/ai/schemas";
import { tasksPrompt } from "@/lib/ai/prompts";
import type { PlanTask } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan tidak ditemukan." }, { status: 404 });
  }

  const searchParams = req.nextUrl.searchParams;
  const regenerate = searchParams.get("regenerate") === "true";

  if (plan.tasks && plan.tasks.length > 0 && !regenerate) {
    return NextResponse.json({ plan });
  }

  if (!plan.structure) {
    return NextResponse.json(
      { error: "Struktur belum dibuat, selesaikan langkah sebelumnya dulu." },
      { status: 400 },
    );
  }

  try {
    const apiKey = req.headers.get("x-gemini-api-key") || null;
    const { system, prompt } = tasksPrompt(plan.structure, plan.techChoice, plan.language || "id");
    const result = await generateJSON<{ tasks: Omit<PlanTask, "done">[] }>(
      prompt,
      tasksSchema,
      system,
      apiKey,
    );
    const tasks: PlanTask[] = result.tasks.map((t) => ({ ...t, done: false }));
    const updated = await updatePlan(id, { tasks, currentStep: "prompt" });
    return NextResponse.json({ plan: updated });
  } catch (err) {
    if (err instanceof GeminiConfigError) {
      return NextResponse.json({ error: err.message }, { status: 412 });
    }
    if (err instanceof GeminiRequestError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Gagal membuat task." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan || !plan.tasks) {
    return NextResponse.json({ error: "Plan atau task tidak ditemukan." }, { status: 404 });
  }
  const body = await req.json().catch(() => null);
  const taskId: string | undefined = body?.taskId;
  const done: boolean | undefined = body?.done;
  if (!taskId || typeof done !== "boolean") {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }
  const tasks = plan.tasks.map((t) => (t.id === taskId ? { ...t, done } : t));
  const updated = await updatePlan(id, { tasks });
  return NextResponse.json({ plan: updated });
}
