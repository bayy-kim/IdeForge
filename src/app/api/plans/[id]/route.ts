import { NextRequest, NextResponse } from "next/server";
import { getPlan, updatePlan, deletePlan } from "@/lib/db/repo";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const plan = await getPlan(id);
    if (!plan) {
      return NextResponse.json({ error: "Plan tidak ditemukan." }, { status: 404 });
    }

    const session = await auth();
    const userEmail = session?.user?.email;

    if (plan.userEmail && plan.userEmail !== userEmail) {
      return NextResponse.json({ error: "Plan tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ error: "Gagal memuat plan." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const plan = await getPlan(id);
    if (!plan) {
      return NextResponse.json({ error: "Plan tidak ditemukan." }, { status: 404 });
    }

    const session = await auth();
    const userEmail = session?.user?.email;
    if (plan.userEmail && plan.userEmail !== userEmail) {
      return NextResponse.json({ error: "Plan tidak ditemukan." }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};

    if (body.appName || body.summary) {
      const current = plan.structure || { appName: "", summary: "", features: [] };
      patch.structure = {
        ...current,
        appName: body.appName ?? current.appName,
        summary: body.summary ?? current.summary,
      };
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Tidak ada data yang diupdate." }, { status: 400 });
    }

    const updated = await updatePlan(id, patch);
    return NextResponse.json({ plan: updated });
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate plan." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const plan = await getPlan(id);
    if (!plan) {
      return NextResponse.json({ error: "Plan tidak ditemukan." }, { status: 404 });
    }

    const session = await auth();
    const userEmail = session?.user?.email;

    if (plan.userEmail && plan.userEmail !== userEmail) {
      return NextResponse.json({ error: "Plan tidak ditemukan." }, { status: 404 });
    }

    if (plan.userEmail && !userEmail) {
      return NextResponse.json({ error: "Login dulu untuk menghapus plan ini." }, { status: 401 });
    }

    const deleted = await deletePlan(id);
    if (!deleted) {
      return NextResponse.json({ error: "Gagal menghapus plan." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus plan." }, { status: 500 });
  }
}
