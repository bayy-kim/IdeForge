import Link from "next/link";
import { Code, FileText, MessageSquare, ChevronDown, Sparkles, BookOpen } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { AuthButton } from "@/components/auth-button";
import { HeroMindmap } from "@/components/hero-mindmap";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-ink/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-display text-lg font-bold tracking-tight text-paper">
            idē<span className="text-signal">forge</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/panduanpenggunaan"
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-signal/40 hover:text-paper"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Guide</span>
            </Link>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pb-64 pt-24 sm:pb-72 sm:pt-32">
          <div className="blueprint-grid pointer-events-none absolute inset-0" />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full border border-signal/30 bg-signal-dim px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-signal">
              From idea to technical plan
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-paper sm:text-6xl">
              Your app idea,{" "}
              <span className="text-signal">AI-broken down</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
              Just tell us your idea, AI will map it into a tech stack, PRD, task breakdown, and a ready-to-use prompt for coding.
            </p>
            <div className="mt-10 flex justify-center">
              <CtaButton />
            </div>
            <HeroMindmap />
          </div>
        </section>

        <section className="border-t border-line px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-display text-2xl font-bold text-paper">How it works</h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: MessageSquare, title: "Tell your idea", desc: "Write your app idea in your own words." },
                { icon: Sparkles, title: "AI recommends", desc: "Get tech stack recommendations + clarifying questions." },
                { icon: FileText, title: "PRD & structure", desc: "AI generates PRD, feature structure, and task breakdown." },
                { icon: Code, title: "Ready-to-use prompt", desc: "Get a final prompt for Claude Code / Cursor." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-line bg-ink-raised p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-signal-dim">
                    <item.icon className="h-6 w-6 text-signal" />
                  </div>
                  <h3 className="mt-4 font-display font-semibold text-paper">{item.title}</h3>
                  <p className="mt-2 text-xs text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-2xl font-bold text-paper">FAQ</h2>
            <div className="mt-10 flex flex-col gap-4">
              {[
                { q: "What is IdeForge?", a: "IdeForge is a free tool that helps you turn your app idea into a complete technical plan: tech stack, PRD, feature structure, task breakdown, and a ready-to-use coding prompt — all powered by AI." },
                { q: "Is it free?", a: "Yes, it's free. You just need a Google Gemini API key (free tier) to generate the AI content." },
                { q: "What languages are supported?", a: "Indonesian and English. PRD, tasks, and prompt results follow the language you choose." },
                { q: "Can I use the results directly?", a: "Yes. The final prompt can be copied directly to Claude Code, Cursor, or any other AI coding assistant to start building." },
              ].map((faq) => (
                <details key={faq.q} className="group rounded-xl border border-line bg-ink-raised">
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-paper">
                    {faq.q}
                    <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="border-t border-line px-6 py-4 text-xs text-muted leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted">
            <a href="https://wa.me/6285217126862" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-paper">WA: 085217126862</a>
            <a href="mailto:muhamadaibayu@gmail.com" className="transition-colors hover:text-paper">muhamadaibayu@gmail.com</a>
          </div>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-trace">
            abny project 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
