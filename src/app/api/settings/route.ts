import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db/index";
import { auth } from "@/lib/auth";

/** Returns the lookup ID: email when logged in, device_id otherwise. */
async function resolveId(bodyDeviceId?: string | null): Promise<string | null> {
  const session = await auth();
  if (session?.user?.email) return session.user.email;
  return bodyDeviceId || null;
}

export async function GET(req: NextRequest) {
  const id = await resolveId();
  const deviceId = id || req.nextUrl.searchParams.get("device_id");
  if (!deviceId) {
    return NextResponse.json({ settings: {} });
  }
  try {
    const rs = await client.execute({
      sql: "SELECT key, value FROM settings WHERE device_id = ?",
      args: [deviceId],
    });
    const settings: Record<string, string> = {};
    for (const row of rs.rows) {
      settings[String(row.key)] = String(row.value);
    }
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ settings: {} });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const key: string | undefined = body?.key;
  const value: string | undefined = body?.value;
  if (!key || value == null) {
    return NextResponse.json({ error: "key dan value wajib diisi." }, { status: 400 });
  }
  const deviceId = await resolveId(body?.device_id);
  if (!deviceId) {
    return NextResponse.json({ error: "Login dulu atau kirim device_id." }, { status: 400 });
  }
  try {
    await client.execute({
      sql: `INSERT INTO settings (device_id, key, value) VALUES (?, ?, ?)
            ON CONFLICT (device_id, key) DO UPDATE SET value = ?, updated_at = datetime('now')`,
      args: [deviceId, key, value, value],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan pengaturan." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const key: string | undefined = body?.key;
  if (!key) {
    return NextResponse.json({ error: "key wajib diisi." }, { status: 400 });
  }
  const deviceId = await resolveId(body?.device_id);
  if (!deviceId) {
    return NextResponse.json({ error: "Login dulu atau kirim device_id." }, { status: 400 });
  }
  try {
    await client.execute({
      sql: "DELETE FROM settings WHERE device_id = ? AND key = ?",
      args: [deviceId, key],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus pengaturan." }, { status: 500 });
  }
}
