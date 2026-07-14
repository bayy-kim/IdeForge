"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Code, FileText, MessageSquare, ChevronDown, Sparkles, BookOpen } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { AuthButton } from "@/components/auth-button";
import { HeroMindmap } from "@/components/hero-mindmap";

const howItWorks = [
  { icon: MessageSquare, title: "Tell your idea", desc: "Write your app idea in your own words." },
  { icon: Sparkles, title: "AI recommends", desc: "Get tech stack recommendations + clarifying questions." },
  { icon: FileText, title: "PRD & structure", desc: "AI generates PRD, feature structure, and task breakdown." },
  { icon: Code, title: "Ready-to-use prompt", desc: "Get a final prompt for Claude Code / Cursor." },
];

const faqs = [
  { q: "What is IdeForge?", a: "IdeForge is a free tool that helps you turn your app idea into a complete technical plan: tech stack, PRD, feature structure, task breakdown, and a ready-to-use coding prompt — all powered by AI." },
  { q: "Is it free?", a: "Yes, it's free. You just need a Google Gemini API key (free tier) to generate the AI content." },
  { q: "What languages are supported?", a: "Indonesian and English. PRD, tasks, and prompt results follow the language you choose." },
  { q: "Can I use the results directly?", a: "Yes. The final prompt can be copied directly to Claude Code, Cursor, or any other AI coding assistant to start building." },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const { scrollYProgress: howProgress } = useScroll({
    target: howRef,
    offset: ["start end", "start start"],
  });

  const { scrollYProgress: faqProgress } = useScroll({
    target: faqRef,
    offset: ["start end", "start start"],
  });

  const heroRotateX = useTransform(heroProgress, [0, 1], [0, 10]);
  const badgeY = useTransform(heroProgress, [0, 1], [0, -120]);
  const titleY = useTransform(heroProgress, [0, 1], [0, -60]);
  const descY = useTransform(heroProgress, [0, 1], [0, -30]);
  const mindmapScale = useTransform(heroProgress, [0, 1], [1, 0.9]);
  const mindmapOpacity = useTransform(heroProgress, [0.2, 0.7], [1, 0]);

  const howTitleO = useTransform(howProgress, [0, 0.25], [0, 1]);
  const howTitleY = useTransform(howProgress, [0, 0.25], [20, 0]);

  const c0o = useTransform(howProgress, [0, 0.45], [0, 1]);
  const c0y = useTransform(howProgress, [0, 0.45], [40, 0]);
  const c0r = useTransform(howProgress, [0, 0.45], [45, 0]);
  const c1o = useTransform(howProgress, [0.1, 0.55], [0, 1]);
  const c1y = useTransform(howProgress, [0.1, 0.55], [40, 0]);
  const c1r = useTransform(howProgress, [0.1, 0.55], [45, 0]);
  const c2o = useTransform(howProgress, [0.2, 0.65], [0, 1]);
  const c2y = useTransform(howProgress, [0.2, 0.65], [40, 0]);
  const c2r = useTransform(howProgress, [0.2, 0.65], [45, 0]);
  const c3o = useTransform(howProgress, [0.3, 0.75], [0, 1]);
  const c3y = useTransform(howProgress, [0.3, 0.75], [40, 0]);
  const c3r = useTransform(howProgress, [0.3, 0.75], [45, 0]);

  const cardAnims = [
    { opacity: c0o, y: c0y, rotateX: c0r },
    { opacity: c1o, y: c1y, rotateX: c1r },
    { opacity: c2o, y: c2y, rotateX: c2r },
    { opacity: c3o, y: c3y, rotateX: c3r },
  ];

  const faqTitleO = useTransform(faqProgress, [0, 0.25], [0, 1]);
  const faqTitleY = useTransform(faqProgress, [0, 0.25], [20, 0]);

  const f0o = useTransform(faqProgress, [0, 0.45], [0, 1]);
  const f0x = useTransform(faqProgress, [0, 0.45], [-30, 0]);
  const f0r = useTransform(faqProgress, [0, 0.45], [5, 0]);
  const f1o = useTransform(faqProgress, [0.1, 0.55], [0, 1]);
  const f1x = useTransform(faqProgress, [0.1, 0.55], [-30, 0]);
  const f1r = useTransform(faqProgress, [0.1, 0.55], [5, 0]);
  const f2o = useTransform(faqProgress, [0.2, 0.65], [0, 1]);
  const f2x = useTransform(faqProgress, [0.2, 0.65], [-30, 0]);
  const f2r = useTransform(faqProgress, [0.2, 0.65], [5, 0]);
  const f3o = useTransform(faqProgress, [0.3, 0.75], [0, 1]);
  const f3x = useTransform(faqProgress, [0.3, 0.75], [-30, 0]);
  const f3r = useTransform(faqProgress, [0.3, 0.75], [5, 0]);

  const faqAnims = [
    { opacity: f0o, x: f0x, rotateY: f0r },
    { opacity: f1o, x: f1x, rotateY: f1r },
    { opacity: f2o, x: f2x, rotateY: f2r },
    { opacity: f3o, x: f3x, rotateY: f3r },
  ];

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
        <section
          ref={heroRef}
          className="relative overflow-hidden px-6 pb-64 pt-24 sm:pb-72 sm:pt-32"
        >
          <div className="blueprint-grid pointer-events-none absolute inset-0" />

          <motion.div
            className="relative z-10 mx-auto max-w-3xl text-center"
            style={{ perspective: 1200, rotateX: heroRotateX }}
          >
            <motion.div style={{ y: badgeY }}>
              <span className="inline-block rounded-full border border-signal/30 bg-signal-dim px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-signal">
                From idea to technical plan
              </span>
            </motion.div>

            <motion.h1
              style={{ y: titleY }}
              className="mt-6 font-display text-4xl font-bold tracking-tight text-paper sm:text-6xl"
            >
              Your app idea,{" "}
              <span className="text-signal">AI-broken down</span>
            </motion.h1>

            <motion.p
              style={{ y: descY }}
              className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg"
            >
              Just tell us your idea, AI will map it into a tech stack, PRD, task breakdown, and a ready-to-use prompt for coding.
            </motion.p>

            <div className="mt-10 flex justify-center">
              <CtaButton />
            </div>

            <motion.div
              style={{ scale: mindmapScale, opacity: mindmapOpacity }}
            >
              <HeroMindmap />
            </motion.div>
          </motion.div>
        </section>

        <section ref={howRef} className="border-t border-line px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <motion.h2
              style={{ opacity: howTitleO, y: howTitleY }}
              className="text-center font-display text-2xl font-bold text-paper"
            >
              How it works
            </motion.h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((item, i) => {
                const anim = cardAnims[i];
                return (
                  <motion.div
                    key={item.title}
                    style={{ opacity: anim.opacity, y: anim.y, rotateX: anim.rotateX }}
                    whileHover={{ scale: 1.04 }}
                    className="rounded-xl border border-line bg-ink-raised p-6 text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-signal-dim">
                      <item.icon className="h-6 w-6 text-signal" />
                    </div>
                    <h3 className="mt-4 font-display font-semibold text-paper">{item.title}</h3>
                    <p className="mt-2 text-xs text-muted">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section ref={faqRef} className="border-t border-line px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <motion.h2
              style={{ opacity: faqTitleO, y: faqTitleY }}
              className="text-center font-display text-2xl font-bold text-paper"
            >
              FAQ
            </motion.h2>
            <div className="mt-10 flex flex-col gap-4">
              {faqs.map((faq, i) => {
                const anim = faqAnims[i];
                return (
                  <motion.div
                    key={faq.q}
                    style={{ opacity: anim.opacity, x: anim.x, rotateY: anim.rotateY }}
                  >
                    <details className="group rounded-xl border border-line bg-ink-raised">
                      <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-paper">
                        {faq.q}
                        <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="border-t border-line px-6 py-4 text-xs text-muted leading-relaxed">{faq.a}</p>
                    </details>
                  </motion.div>
                );
              })}
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
