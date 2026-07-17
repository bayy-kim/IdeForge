"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LoginPopover } from "@/components/login-popover";
import { ArrowLeft, Check, Cpu, LogOut, FlaskConical, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AI_PROVIDERS = [
  { id: "gemini", label: "Google Gemini", defaultUrl: "https://generativelanguage.googleapis.com/v1beta/models/" },
  { id: "claude", label: "Anthropic Claude", defaultUrl: "https://api.anthropic.com/v1/" },
  { id: "custom", label: "Kustom", defaultUrl: "" },
];

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = `dev_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("device_id", id);
  }
  return id;
}

type Settings = Record<string, string>;

export default function ApiKeysPage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<Settings>({});
  const [deviceId] = useState(getDeviceId);
  const [aiProvider, setAiProvider] = useState("gemini");
  const [aiKey, setAiKey] = useState("");
  const [aiUrl, setAiUrl] = useState(AI_PROVIDERS[0].defaultUrl);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testKeyResult, setTestKeyResult] = useState<{ valid: boolean; error?: string; warning?: string } | null>(null);
  const [hasServerKey, setHasServerKey] = useState(false);

  // Test all models
  const [testingAll, setTestingAll] = useState(false);
  const [testAllResult, setTestAllResult] = useState<{
    results: { id: string; label: string; freeTier: boolean; ok: boolean; error?: string }[];
    summary: { total: number; working: number; workingFree: number; workingPaid: number };
  } | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setHasServerKey(d.hasKey))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = session?.user?.email || deviceId;
    fetch(`/api/settings?device_id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings || {};
        setSettings(s);
        const provider = s.ai_provider || "gemini";
        setAiProvider(provider);
        setAiKey(s.ai_api_key || "");
        setAiUrl(s.ai_api_url || AI_PROVIDERS.find((p) => p.id === provider)?.defaultUrl || "");
      })
      .catch(() => {});
  }, [session, deviceId]);

  function handleProviderChange(id: string) {
    setAiProvider(id);
    const p = AI_PROVIDERS.find((x) => x.id === id);
    if (p && p.defaultUrl) setAiUrl(p.defaultUrl);
  }

  async function saveSetting(key: string, value: string) {
    setSaving(key);
    setSaved(null);
    try {
      const body: Record<string, string> = { key, value };
      if (!session?.user?.email) body.device_id = deviceId;
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      // FIXED: sync ALL AI config keys to localStorage so apiFetch can read them immediately
      if (key === "ai_api_key") localStorage.setItem("ai_api_key", value);
      if (key === "ai_provider") localStorage.setItem("ai_provider", value);
      if (key === "ai_api_url") localStorage.setItem("ai_api_url", value);
      setSettings((prev) => ({ ...prev, [key]: value }));
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      alert("Gagal menyimpan.");
    } finally {
      setSaving(null);
    }
  }

  /** Atomically save provider + key + url all at once */
  async function saveAllAiSettings() {
    setSaving("all");
    setSaved(null);
    try {
      const deviceIdHeader = !session?.user?.email ? { device_id: deviceId } : {};
      await Promise.all([
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "ai_provider", value: aiProvider, ...deviceIdHeader }),
        }),
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "ai_api_key", value: aiKey, ...deviceIdHeader }),
        }),
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "ai_api_url", value: aiUrl, ...deviceIdHeader }),
        }),
      ]);
      // Sync all to localStorage immediately
      localStorage.setItem("ai_provider", aiProvider);
      if (aiKey) localStorage.setItem("ai_api_key", aiKey);
      if (aiUrl) localStorage.setItem("ai_api_url", aiUrl);
      if (settings.ai_model) localStorage.setItem("ai_model", settings.ai_model);
      setSettings((prev) => ({ ...prev, ai_provider: aiProvider, ai_api_key: aiKey, ai_api_url: aiUrl }));
      setSaved("all");
      setTimeout(() => setSaved(null), 2000);
    } catch {
      alert("Gagal menyimpan.");
    } finally {
      setSaving(null);
    }
  }

  async function testAiKey() {
    if (!aiKey.trim()) return;
    setTestingKey("ai");
    setTestKeyResult(null);
    try {
      const res = await fetch("/api/settings/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: aiProvider,
          apiKey: aiKey.trim(),
          apiUrl: aiUrl.trim() || undefined,
          model: settings.ai_model || undefined,
        }),
      });
      const data = await res.json();
      setTestKeyResult(data);
    } catch {
      setTestKeyResult({ valid: false, error: "Gagal melakukan test." });
    } finally {
      setTestingKey(null);
    }
  }

  async function testAllModels() {
    if (!aiKey.trim()) return;
    setTestingAll(true);
    setTestAllResult(null);
    try {
      const res = await fetch("/api/models/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: aiKey.trim() }),
      });
      const data = await res.json();
      setTestAllResult(data);
    } catch {
      setTestAllResult(null);
    } finally {
      setTestingAll(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/plan"
            className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-paper"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> kembali
          </Link>
          <h1 className="font-display text-2xl font-bold text-paper">Pengaturan</h1>
        </div>

        <div className="flex items-center gap-2">
          {session?.user?.email ? (
            <>
              <span className="hidden text-xs text-muted sm:inline">{session.user.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-mono text-muted transition-colors hover:border-danger/40 hover:text-danger"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </>
          ) : (
            <LoginPopover />
          )}
        </div>
      </div>

      {status === "loading" && (
        <p className="mt-4 text-xs text-muted">Memuat sesi...</p>
      )}

      {session?.user?.email && (
        <div className="mt-4 rounded-xl border border-trace/20 bg-trace/5 p-4 text-xs text-trace leading-relaxed">
          ✅ Data tersimpan otomatis ke akun <strong>{session.user.email}</strong> — riwayat dan pengaturan
          bisa diakses dari perangkat mana pun.
        </div>
      )}

      <div className="mt-4 rounded-xl border border-line bg-ink-raised p-5 text-xs text-muted leading-relaxed">
        <p className="font-semibold text-paper mb-2">Cara pakai:</p>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>Pilih provider AI (Gemini, Claude, atau kustom)</li>
          <li>Masukkan API key dari provider yang dipilih (kosongkan kalau mau pake key default server)</li>
          <li>Klik <strong className="text-paper">Test</strong> buat ngecek valid atau engga</li>
          <li>Data tersimpan otomatis — gak perlu masukin ulang</li>
        </ol>
      </div>

      <div className="mt-8 flex flex-col gap-8">
        {/* AI Provider */}
          <div className="rounded-xl border border-line bg-ink-raised p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-signal" />
              <h2 className="font-display font-semibold text-paper">AI Provider</h2>
            </div>
            <div className="flex items-center gap-2">
              {hasServerKey && (
                <span className="flex items-center gap-1 rounded-full border border-trace/30 bg-trace-dim px-2.5 py-0.5 font-mono text-[10px] text-trace">
                  <Check className="h-3 w-3" /> Default Server
                </span>
              )}
              {settings.ai_provider && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-trace uppercase tracking-wider">
                  <Check className="h-3 w-3" /> Tersimpan
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {AI_PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProviderChange(p.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  aiProvider === p.id
                    ? "border-signal bg-signal-dim text-signal"
                    : "border-line text-paper hover:border-signal/40",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* AI API URL */}
          <div className="mt-4">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted">API URL</label>
            <div className="mt-1 flex gap-2">
              <input
                type="url"
                placeholder={AI_PROVIDERS.find((p) => p.id === aiProvider)?.defaultUrl || "https://api.example.com/v1/"}
                value={aiUrl}
                onChange={(e) => setAiUrl(e.target.value)}
                className="flex-1 rounded border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-signal focus:outline-none"
              />
              <Button
                size="sm"
                onClick={() => saveSetting("ai_api_url", aiUrl)}
                disabled={saving === "ai_api_url" || !aiUrl.trim()}
              >
                {saving === "ai_api_url" ? "..." : saved === "ai_api_url" ? <><Check className="h-3.5 w-3.5" /> Tersimpan</> : "Simpan"}
              </Button>
            </div>
          </div>

          {/* AI API Key */}
          <div className="mt-4">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted">API Key</label>
            <div className="mt-1 flex gap-2">
              <input
                type="password"
                placeholder={
                  aiProvider === "gemini" ? "AIzaSy..." :
                  aiProvider === "claude" ? "sk-ant-..." :
                  "Masukkan API key..."
                }
                value={aiKey}
                onChange={(e) => setAiKey(e.target.value)}
                className="flex-1 rounded border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-signal focus:outline-none"
              />
              <Button
                size="sm"
                onClick={() => saveSetting("ai_api_key", aiKey)}
                disabled={saving === "ai_api_key" || !aiKey.trim()}
              >
                {saving === "ai_api_key" ? "..." : saved === "ai_api_key" ? <><Check className="h-3.5 w-3.5" /> Tersimpan</> : "Simpan"}
              </Button>
            </div>
          </div>

          {/* Save All AI Settings */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={saveAllAiSettings}
              disabled={saving === "all"}
            >
              {saving === "all" ? "..." : saved === "all" ? <><Check className="h-3.5 w-3.5" /> Tersimpan</> : "Simpan Semua"}
            </Button>

            <button
              onClick={testAiKey}
              disabled={testingKey === "ai" || !aiKey.trim()}
              className="flex items-center gap-1 rounded border border-line px-3 py-1.5 text-xs font-mono text-muted transition-colors hover:border-signal/40 hover:text-paper disabled:opacity-40"
            >
              {testingKey === "ai" ? "Memeriksa..." : "Test Koneksi"}
            </button>
            {testKeyResult && (
              <span className={cn(
                "flex items-center gap-1 text-xs font-mono",
                testKeyResult.valid ? "text-trace" : "text-danger",
              )}>
                {testKeyResult.valid ? <><Check className="h-3 w-3" /> Valid</> : <>✗ {testKeyResult.error}</>}
                {testKeyResult.warning && <span className="text-muted">({testKeyResult.warning})</span>}
              </span>
            )}
          </div>
        </div>

        {/* Test All Models */}
        {aiProvider === "gemini" && (
          <div className="mt-6 rounded-xl border border-line bg-ink-raised p-5">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-signal" />
              <h3 className="font-display font-semibold text-paper">Cek Semua Model</h3>
            </div>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Tes semua model Gemini sekaligus — biar tau mana yg bisa dipake gratis & mana yg perlu billing.
            </p>

            {!testAllResult && (
              <button
                onClick={testAllModels}
                disabled={testingAll || !aiKey.trim()}
                className="mt-3 flex items-center gap-1.5 rounded border border-line px-3 py-2 text-xs font-mono text-paper transition-colors hover:border-signal/40 hover:text-signal disabled:opacity-40"
              >
                {testingAll ? "Mengetes 9 model..." : "Test Semua Model"}
              </button>
            )}

            {testingAll && (
              <p className="mt-3 text-xs text-muted animate-pulse">Mengetes semua model Gemini... (~10 detik)</p>
            )}

            {testAllResult && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-3 text-xs font-mono">
                  <span className="text-trace">{testAllResult.summary.workingFree} gratis work</span>
                  <span className="text-muted">&middot;</span>
                  <span className="text-paper">{testAllResult.summary.workingPaid} billing work</span>
                  <span className="text-muted">&middot;</span>
                  <span className="text-danger">{testAllResult.summary.total - testAllResult.summary.working} fail</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {testAllResult.results.map((r) => (
                    <div
                      key={r.id}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-mono border",
                        r.ok ? "border-trace/30 bg-trace/5" : "border-danger/20 bg-danger/5",
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("shrink-0", r.ok ? "text-trace" : "text-danger")}>
                          {r.ok ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        </span>
                        <span className={cn("truncate", r.ok ? "text-trace" : "text-muted")}>
                          {r.label}
                        </span>
                        <span className={cn(
                          "shrink-0 rounded-full px-1.5 py-0 text-[9px] uppercase tracking-wider",
                          r.freeTier ? "bg-trace/10 text-trace" : "bg-amber-500/10 text-amber-500",
                        )}>
                          {r.freeTier ? "gratis" : "billing"}
                        </span>
                      </div>
                      <span className="text-muted shrink-0">{r.ok ? "OK" : r.error}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setTestAllResult(null)}
                  className="mt-3 text-xs text-muted hover:text-paper font-mono"
                >
                  Sembunyikan
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      <div className="mt-8 rounded-xl border border-line bg-ink-raised p-5 text-xs text-muted">
        <p className="font-semibold text-paper mb-1">💡 Catatan:</p>
        <p>Semua pengaturan disimpan di database dan akan tetap ada meskipun kamu ganti perangkat. Provider dan API key juga disalin ke browser biar langsung dipakai aplikasi.</p>
        <p className="mt-2">Konfigurasi database (Turso) cuma bisa diatur lewat environment variable server — tidak ditampilkan di sini untuk keamanan.</p>
      </div>
    </main>
  );
}
