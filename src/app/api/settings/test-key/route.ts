import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_MODEL } from "@/lib/ai/models";

const GEMINI_DEFAULT = DEFAULT_MODEL;
const CLAUDE_DEFAULT = "claude-sonnet-4-20250514";

async function testGemini(
  apiKey: string,
  model?: string,
): Promise<{ valid: boolean; error?: string; warning?: string }> {
  const m = model || GEMINI_DEFAULT;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Reply with exactly OK" }] }],
        generationConfig: { maxOutputTokens: 5 },
      }),
    },
  );
  if (res.ok) return { valid: true };
  const text = await res.text().catch(() => "");
  if (res.status === 403 || res.status === 401) {
    return { valid: false, error: "API Key tidak valid atau tidak memiliki akses." };
  }
  if (res.status === 429) {
    return { valid: true, warning: "API Key valid, tapi terkena rate limit." };
  }
  return { valid: false, error: `Error (${res.status}): ${text.slice(0, 100)}` };
}

async function testClaude(
  apiKey: string,
  apiUrl?: string,
  model?: string,
): Promise<{ valid: boolean; error?: string; warning?: string }> {
  const url = apiUrl || "https://api.anthropic.com/v1/messages";
  const m = model || CLAUDE_DEFAULT;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: m,
      max_tokens: 5,
      messages: [{ role: "user", content: "Reply OK" }],
    }),
  });
  if (res.ok) return { valid: true };
  const text = await res.text().catch(() => "");
  if (res.status === 403 || res.status === 401) {
    return { valid: false, error: "API Key tidak valid." };
  }
  if (res.status === 429) {
    return { valid: true, warning: "API Key valid, tapi terkena rate limit." };
  }
  return { valid: false, error: `Error (${res.status}): ${text.slice(0, 100)}` };
}

async function testCustom(apiKey: string, apiUrl?: string): Promise<{ valid: boolean; error?: string; warning?: string }> {
  if (!apiUrl) {
    return { valid: false, error: "URL API wajib diisi untuk provider kustom." };
  }
  try {
    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (res.ok || res.status < 500) return { valid: true };
    return { valid: false, error: `Error (${res.status})` };
  } catch {
    return { valid: false, error: "Gagal terhubung ke URL API." };
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const apiKey: string | undefined = body?.apiKey;
  const provider: string = body?.provider || "gemini";
  const apiUrl: string | undefined = body?.apiUrl;
  const model: string | undefined = body?.model;

  if (!apiKey) {
    return NextResponse.json({ valid: false, error: "API key tidak boleh kosong." });
  }

  try {
    let result;
    switch (provider) {
      case "claude":
        result = await testClaude(apiKey, apiUrl, model);
        break;
      case "custom":
        result = await testCustom(apiKey, apiUrl);
        break;
      default:
        result = await testGemini(apiKey, model);
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ valid: false, error: "Gagal melakukan test koneksi." });
  }
}
