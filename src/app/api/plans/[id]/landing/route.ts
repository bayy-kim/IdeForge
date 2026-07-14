import { NextRequest, NextResponse } from "next/server";
import { getPlan, updatePlan } from "@/lib/db/repo";
import { generateJSON, GeminiConfigError, GeminiRequestError } from "@/lib/ai/gemini";
import { landingOptionsSchema } from "@/lib/ai/schemas";
import { landingPagePrompt } from "@/lib/ai/prompts";
import type { LandingOption } from "@/lib/types";

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

  if (plan.landingOptions && plan.landingOptions.length > 0 && !regenerate) {
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
    const model = searchParams.get("model") || undefined;
    const { system, prompt } = landingPagePrompt(plan.structure, plan.language || "id");
    const result = await generateJSON<{ options: LandingOption[] }>(
      prompt,
      landingOptionsSchema,
      system,
      apiKey,
      model,
    );
    const updated = await updatePlan(id, { landingOptions: result.options });
    return NextResponse.json({ plan: updated });
  } catch (err) {
    if (err instanceof GeminiConfigError) {
      return NextResponse.json({ error: err.message }, { status: 412 });
    }
    if (err instanceof GeminiRequestError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Gagal membuat contoh landing page." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan tidak ditemukan." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const selectedLandingId: string | undefined = body?.selectedLandingId;
  if (!selectedLandingId) {
    return NextResponse.json({ error: "Pilih salah satu konsep dulu." }, { status: 400 });
  }

  const updated = await updatePlan(id, { selectedLandingId, currentStep: "tasks" });
  return NextResponse.json({ plan: updated });
}
