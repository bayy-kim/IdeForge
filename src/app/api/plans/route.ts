import { NextRequest, NextResponse } from "next/server";
import { createPlan, listPlansByUser } from "@/lib/db/repo";
import { auth } from "@/lib/auth";
import { createPlanRateLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ plans: [] });
    }

    const plans = await listPlansByUser(userEmail);
    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json({ plans: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitError = await createPlanRateLimit(req);
    if (rateLimitError) return rateLimitError;

    const body = await req.json().catch(() => null);
    const ideaText: string | undefined = body?.ideaText?.trim();
    const language: string = body?.language || "id";

    if (!ideaText || ideaText.length < 8) {
      return NextResponse.json(
        { error: "Ceritain dulu ide aplikasinya, minimal beberapa kata ya." },
        { status: 400 },
      );
    }

    const session = await auth();
    const userEmail = session?.user?.email;
    const plan = await createPlan(ideaText, language, userEmail);
    return NextResponse.json({ plan });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[plans/POST]", msg);
    return NextResponse.json({ error: "Gagal membuat plan.", detail: msg.slice(0, 200) }, { status: 500 });
  }
}
