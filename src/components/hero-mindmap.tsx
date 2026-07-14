"use client";

import { useEffect, useState } from "react";

const demoData = [
  { id: "f1", name: "Dashboard", phase: 1, subs: ["Ringkasan bulanan", "Chart pengeluaran", "Filter tanggal"] },
  { id: "f2", name: "Catat Transaksi", phase: 2, subs: ["Input manual", "Kategori", "Scan nota"] },
  { id: "f3", name: "WhatsApp Integration", phase: 3, subs: ["Webhook Twilio", "Parser pesan", "Konfirmasi"] },
];

export function HeroMindmap() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((p) => (p >= 5 ? 0 : p + 1));
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <svg viewBox="0 0 600 180" className="w-full h-auto" fill="none">
        {/* Root node */}
        <g className={phase >= 0 ? "animate-fade-in" : "opacity-0"} style={{ animationDelay: "0ms" }}>
          <rect x="4" y="68" width="140" height="44" rx="8" className="fill-ink-raised stroke-signal/40" strokeWidth="1" />
          <text x="74" y="92" textAnchor="middle" className="fill-paper font-display text-xs font-bold">
            ExpenseApp
          </text>
          <circle cx="144" cy="90" r="4" className="fill-signal">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Feature nodes */}
        {demoData.map((f, i) => {
          const fx = 240;
          const fy = 10 + i * 55;
          const lineVisible = phase >= 1 + i * 2;
          const nodeVisible = phase >= 2 + i * 2;

          return (
            <g key={f.id}>
              <line
                x1="148" y1="90" x2={fx - 30} y2={fy + 25}
                stroke="var(--trace)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                className={lineVisible ? "animate-dash-flow" : "opacity-0"}
                opacity="0.6"
              />
              {nodeVisible && (
                <>
                  <rect x={fx - 110} y={fy} width="220" height="44" rx="8" className="fill-ink-raised stroke-line" strokeWidth="1">
                    <animate attributeName="opacity" from="0" to="1" dur="0.4s" fill="freeze" />
                    <animate attributeName="y" from={fy + 10} to={fy} dur="0.4s" fill="freeze" />
                  </rect>
                  <text x={fx - 70} y={fy + 20} className="fill-paper text-xs font-semibold">
                    {f.name}
                  </text>
                  <rect x={fx + 28} y={fy + 8} width="46" height="16" rx="99" className="fill-signal-dim stroke-signal/30" strokeWidth="1" />
                  <text x={fx + 51} y={fy + 20} textAnchor="middle" className="fill-signal text-[8px] font-mono font-medium uppercase tracking-wider">
                    Phase {f.phase}
                  </text>
                  <circle cx={fx + 110} cy={fy + 22} r="3" className="fill-trace">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
            </g>
          );
        })}
      </svg>

      <style>{`
        @keyframes dash-flow {
          to { stroke-dashoffset: -20; }
        }
        .animate-dash-flow {
          animation: dash-flow 1s linear infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out both;
        }
      `}</style>
    </div>
  );
}
