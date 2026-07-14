import { NextRequest, NextResponse } from "next/server";
import { getPlan, updatePlan } from "@/lib/db/repo";
import { generateText, GeminiConfigError, GeminiRequestError } from "@/lib/ai/gemini";
import { finalPromptCompilePrompt } from "@/lib/ai/prompts";

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

  if (plan.finalPrompt && !regenerate) {
    return NextResponse.json({ plan });
  }

  if (!plan.structure || !plan.prd) {
    return NextResponse.json(
      { error: "PRD belum lengkap, selesaikan langkah sebelumnya dulu." },
      { status: 400 },
    );
  }

  try {
    const apiKey = req.headers.get("x-gemini-api-key") || null;
    const selectedLanding = plan.landingOptions?.find((o) => o.id === plan.selectedLandingId) ?? null;
    const landingStyle = selectedLanding
      ? { styleName: selectedLanding.styleName, styleDescription: selectedLanding.styleDescription }
      : null;
    const { system, prompt } = finalPromptCompilePrompt(
      plan.structure,
      plan.techChoice,
      plan.prd,
      plan.tasks?.length || 0,
      landingStyle,
    );
    const finalPrompt = await generateText(prompt, system, apiKey);
    const updated = await updatePlan(id, { finalPrompt });
    return NextResponse.json({ plan: updated });
  } catch (err) {
    if (err instanceof GeminiConfigError) {
      return NextResponse.json({ error: err.message }, { status: 412 });
    }
    if (err instanceof GeminiRequestError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Gagal membuat prompt akhir." }, { status: 500 });
  }
}
