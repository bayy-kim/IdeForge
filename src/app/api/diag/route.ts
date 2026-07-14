import { NextResponse } from "next/server";

export async function GET() {
  const result: Record<string, unknown> = {
    env: {
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? "SET (" + process.env.TURSO_DATABASE_URL.slice(0, 30) + "...)" : "NOT SET",
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? "SET (" + process.env.TURSO_AUTH_TOKEN.slice(0, 20) + "...)" : "NOT SET",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "SET" : "NOT SET",
      VERCEL: process.env.VERCEL || "NOT SET",
      AUTH_URL: process.env.AUTH_URL || "NOT SET",
    },
    tests: {} as Record<string, unknown>,
  };

  // Test database connection
  try {
    const { client } = await import("@/lib/db/index");
    const rs = await client.execute("SELECT 1 as test");
    result.tests["db_basic"] = "OK: " + JSON.stringify(rs.rows[0]);
  } catch (e) {
    result.tests["db_basic"] = "FAIL: " + (e instanceof Error ? e.message : String(e));
  }

  return NextResponse.json(result);
}
