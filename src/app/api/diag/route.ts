import { NextResponse } from "next/server";

export async function GET() {
  const env = {
    TURSO_URL: process.env.TURSO_DATABASE_URL ? "SET" : "NOT SET",
    TURSO_TOKEN: process.env.TURSO_AUTH_TOKEN ? "SET" : "NOT SET",
    GEMINI_KEY: process.env.GEMINI_API_KEY ? "SET" : "NOT SET",
    VERCEL: process.env.VERCEL || "NOT SET",
    AUTH_URL: process.env.AUTH_URL || "NOT SET",
  };

  let dbTest = "";
  try {
    const { client } = await import("@/lib/db/index");
    const rs = await client.execute("SELECT 1 as test");
    dbTest = "OK: " + JSON.stringify(rs.rows[0]);
  } catch (e) {
    dbTest = "FAIL: " + (e instanceof Error ? e.message : String(e));
  }

  return NextResponse.json({ env, dbTest });
}
