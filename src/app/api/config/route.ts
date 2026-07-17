import { NextRequest, NextResponse } from "next/server";
import { getTodayUsage, estimateRemainingPlans } from "@/lib/db/usage";
import { DEFAULT_MODEL } from "@/lib/ai/models";

export async function GET(req: NextRequest) {
  try {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    const model = req.nextUrl.searchParams.get("model") || DEFAULT_MODEL;
    const todayUsage = await getTodayUsage(model);
    const remaining = await estimateRemainingPlans(model);
    return NextResponse.json({ hasKey, todayUsage, remaining });
  } catch {
    return NextResponse.json({ hasKey: false, todayUsage: 0, remaining: 0 });
  }
}
