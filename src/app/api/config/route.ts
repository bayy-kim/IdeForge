import { NextResponse } from "next/server";
import { getTodayUsage, estimateRemainingPlans } from "@/lib/db/usage";

export async function GET() {
  try {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    const todayUsage = await getTodayUsage();
    const remaining = await estimateRemainingPlans();
    return NextResponse.json({ hasKey, todayUsage, remaining });
  } catch {
    return NextResponse.json({ hasKey: false, todayUsage: 0, remaining: 0 });
  }
}
