import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const url: string | undefined = body?.url;
  const authToken: string | undefined = body?.authToken;

  if (!url) {
    return NextResponse.json({ valid: false, error: "URL database tidak boleh kosong." });
  }

  try {
    const client = createClient({
      url,
      authToken: authToken || undefined,
    });
    const rs = await client.execute("SELECT 1 as test");
    const ok = rs.rows[0]?.test === 1;
    if (ok) {
      return NextResponse.json({ valid: true, info: `Terhubung (${rs.rows.length} row)` });
    }
    return NextResponse.json({ valid: false, error: "Koneksi berhasil tapi respons tidak sesuai." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ valid: false, error: msg.slice(0, 200) });
  }
}
