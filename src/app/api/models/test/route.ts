import { NextRequest, NextResponse } from "next/server";
import { SELECTABLE_MODELS } from "@/lib/ai/models";

interface ModelTestResult {
  id: string;
  label: string;
  freeTier: boolean;
  ok: boolean;
  error?: string;
}

/**
 * Tests all selectable Gemini models against the provided API key.
 * Makes a single lightweight call per model to check availability.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const apiKey: string | undefined = body?.apiKey;

  if (!apiKey) {
    return NextResponse.json({ error: "API key tidak boleh kosong." }, { status: 400 });
  }

  const results: ModelTestResult[] = await Promise.all(
    SELECTABLE_MODELS.map(async (m): Promise<ModelTestResult> => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${m.id}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: "Reply 1" }] }],
              generationConfig: { maxOutputTokens: 1 },
            }),
            signal: controller.signal,
          },
        );
        clearTimeout(timeout);

        if (res.ok) return { ...m, ok: true };

        const errText = await res.text().catch(() => "");
        let error = `${res.status}`;
        if (res.status === 429) error = "Rate limit";
        else if (res.status === 403 || res.status === 401) error = "Key tidak valid";
        else if (res.status === 404) error = "Model retired";
        else if (/requires billing/i.test(errText)) error = "Perlu billing account";
        else error = errText.slice(0, 60) || `${res.status}`;

        return { ...m, ok: false, error };
      } catch {
        return { ...m, ok: false, error: "Timeout / gagal" };
      }
    }),
  );

  const workingFree = results.filter((r) => r.ok && r.freeTier);
  const workingPaid = results.filter((r) => r.ok && !r.freeTier);

  return NextResponse.json({
    results,
    summary: {
      total: results.length,
      working: workingFree.length + workingPaid.length,
      workingFree: workingFree.length,
      workingPaid: workingPaid.length,
    },
  });
}