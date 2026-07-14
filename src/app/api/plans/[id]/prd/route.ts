import { NextRequest, NextResponse } from "next/server";
import { getPlan, updatePlan } from "@/lib/db/repo";
import { generateText, GeminiConfigError, GeminiRequestError } from "@/lib/ai/gemini";
import { prdPrompt, folderStructurePrompt } from "@/lib/ai/prompts";

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

  if (plan.prd && !regenerate) {
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
    const { system, prompt } = prdPrompt(
      plan.ideaText,
      plan.techChoice,
      plan.answers || [],
      plan.structure,
      plan.language || "id",
    );
    const prd = await generateText(prompt, system, apiKey);

    let folderStructure: string | null = null;
    try {
      const { system: fsSystem, prompt: fsPrompt } = folderStructurePrompt(
        plan.structure,
        plan.techChoice,
        plan.language || "id",
      );
      folderStructure = await generateText(fsPrompt, fsSystem, apiKey);
    } catch {
      folderStructure = null;
    }

    const updated = await updatePlan(id, { prd, folderStructure, currentStep: "landing" });
    return NextResponse.json({ plan: updated });
  } catch (err) {
    if (err instanceof GeminiConfigError) {
      return NextResponse.json({ error: err.message }, { status: 412 });
    }
    if (err instanceof GeminiRequestError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Gagal membuat PRD." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan tidak ditemukan." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const prd: string | undefined = body?.prd;
  if (typeof prd !== "string") {
    return NextResponse.json({ error: "Isi PRD tidak valid." }, { status: 400 });
  }

  const updated = await updatePlan(id, { prd });
  return NextResponse.json({ plan: updated });
}
