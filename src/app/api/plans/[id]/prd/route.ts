import { NextRequest, NextResponse } from "next/server";
import { getPlan, updatePlan } from "@/lib/db/repo";
import { generateText, GeminiConfigError, GeminiRequestError } from "@/lib/ai/gemini";
import { prdPrompt, srsPrompt, folderStructurePrompt } from "@/lib/ai/prompts";
import { checkPlanOwnership, resolveAIConfig } from "@/app/api/auth-utils";
import { aiRateLimit } from "@/lib/rate-limit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const rateLimitError = await aiRateLimit(req);
  if (rateLimitError) return rateLimitError;

  const plan = await getPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan tidak ditemukan." }, { status: 404 });
  }

  const ownershipError = await checkPlanOwnership(plan);
  if (ownershipError) return ownershipError;

  const searchParams = req.nextUrl.searchParams;
  const regenerate = searchParams.get("regenerate") === "true";

  if (plan.prd && plan.srs && !regenerate) {
    return NextResponse.json({ plan });
  }

  if (!plan.structure) {
    return NextResponse.json(
      { error: "Struktur belum dibuat, selesaikan langkah sebelumnya dulu." },
      { status: 400 },
    );
  }

  try {
    const aiConfig = await resolveAIConfig(req);
    const { system, prompt } = prdPrompt(
      plan.ideaText,
      plan.techChoice,
      plan.answers || [],
      plan.structure,
      plan.language || "id",
    );
    const prd = await generateText(prompt, system, null, undefined, aiConfig);

    let srs: string | null = null;
    try {
      const { system: srsSystem, prompt: srsPromptText } = srsPrompt(
        plan.ideaText,
        plan.techChoice,
        plan.answers || [],
        plan.structure,
        plan.language || "id",
      );
      srs = await generateText(srsPromptText, srsSystem, null, undefined, aiConfig);
    } catch {
      srs = null;
    }

    let folderStructure: string | null = null;
    try {
      const { system: fsSystem, prompt: fsPrompt } = folderStructurePrompt(
        plan.structure,
        plan.techChoice,
        plan.language || "id",
      );
      folderStructure = await generateText(fsPrompt, fsSystem, null, undefined, aiConfig);
    } catch {
      folderStructure = null;
    }

    const updated = await updatePlan(id, { prd, srs, folderStructure, currentStep: "landing" });
    return NextResponse.json({ plan: updated });
  } catch (err) {
    if (err instanceof GeminiConfigError) {
      return NextResponse.json({ error: err.message }, { status: 412 });
    }
    if (err instanceof GeminiRequestError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Gagal membuat PRD dan SRS." }, { status: 500 });
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

  const ownershipError = await checkPlanOwnership(plan);
  if (ownershipError) return ownershipError;

  const body = await req.json().catch(() => null);
  const prd: string | undefined = body?.prd;
  const srs: string | undefined = body?.srs;

  const patch: Record<string, unknown> = {};
  if (typeof prd === "string") patch.prd = prd;
  if (typeof srs === "string") patch.srs = srs;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Isi data tidak valid." }, { status: 400 });
  }

  const updated = await updatePlan(id, patch);
  return NextResponse.json({ plan: updated });
}
