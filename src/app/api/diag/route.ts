import { NextResponse } from "next/server";

export async function GET() {
  const env = {
    TURSO_URL: process.env.TURSO_DATABASE_URL ? "SET" : "NOT SET",
    TURSO_TOKEN: process.env.TURSO_AUTH_TOKEN ? "SET" : "NOT SET",
    GEMINI_KEY: process.env.GEMINI_API_KEY ? "SET" : "NOT SET",
    VERCEL: process.env.VERCEL || "NOT SET",
    AUTH_URL: process.env.AUTH_URL || "NOT SET",
  };

  const results: Record<string, string> = {};

  // 1. Basic connection
  try {
    const { client } = await import("@/lib/db/index");
    const rs = await client.execute("SELECT 1 as test");
    results.connection = "OK: " + JSON.stringify(rs.rows[0]);
  } catch (e) {
    results.connection = "FAIL: " + (e instanceof Error ? e.message : String(e));
  }

  // 2. Table creation via dbReady
  try {
    const { dbReady } = await import("@/lib/db/index");
    await dbReady();
    results.dbReady = "OK";
  } catch (e) {
    results.dbReady = "FAIL: " + (e instanceof Error ? e.message : String(e));
  }

  // 3. Test createPlan + immediate cleanup to avoid DB pollution
  try {
    const { createPlan, deletePlan } = await import("@/lib/db/repo");
    const plan = await createPlan("Test plan diag [auto-cleanup]", "id");
    await deletePlan(plan.id);
    results.createPlan = "OK (plan auto-deleted after test)";
  } catch (e) {
    results.createPlan = "FAIL: " + (e instanceof Error ? e.message : String(e));
  }

  return NextResponse.json({ env, results });
}
