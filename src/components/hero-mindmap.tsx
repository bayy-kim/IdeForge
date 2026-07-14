"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const demoData = [
  { id: "f1", name: "Dashboard", phase: 1, color: "var(--signal)", subs: ["Ringkasan bulanan", "Chart pengeluaran", "Filter tanggal"] },
  { id: "f2", name: "Catat Transaksi", phase: 2, color: "var(--trace)", subs: ["Input manual", "Kategori", "Scan nota"] },
  { id: "f3", name: "WhatsApp Integration", phase: 3, color: "var(--paper)", subs: ["Webhook Twilio", "Parser pesan", "Konfirmasi"] },
];

const ROOT_X = 20;
const CHILD_X = 340;
const CHILD_GAP = 90;
const ROOT_Y = 100;

const colors = {
  signal: "#a3e635",
  signalDim: "#a3e6351a",
  trace: "#7dd3fc",
  paper: "#e2e8f0",
  inkRaised: "#1e293b",
  line: "#334155",
};

function buildPath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

export function HeroMindmap() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const childYs = demoData.map((_, i) => {
    const offset = (demoData.length - 1) * CHILD_GAP / 2;
    return ROOT_Y - offset + i * CHILD_GAP;
  });

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 px-4">
      <svg
        viewBox="0 0 580 220"
        className="w-full h-auto overflow-visible"
        fill="none"
      >
        {/* Connecting lines — drawn behind nodes */}
        {demoData.map((f, i) => {
          const cy = childYs[i];
          const path = buildPath(ROOT_X + 120, ROOT_Y, CHILD_X - 16, cy);
          const isHovered = hoveredId === f.id;

          return (
            <g key={f.id}>
              <motion.path
                d={path}
                stroke={f.color}
                strokeWidth={isHovered ? 3 : 2}
                strokeOpacity={isHovered ? 0.9 : 0.5}
                strokeDasharray="7 9"
                fill="none"
                className={isHovered ? "animate-dash-flow" : "animate-dash-flow"}
                style={{ filter: isHovered ? `drop-shadow(0 0 8px ${f.color})` : "none" }}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.25, ease: "easeInOut" }}
              />
              {/* Pulse dot at end of line */}
              <motion.circle
                cx={CHILD_X - 16}
                cy={cy}
                r={isHovered ? 5 : 3}
                fill={f.color}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + i * 0.25, type: "spring", stiffness: 300 }}
              />
            </g>
          );
        })}

        {/* Root node */}
        <motion.g
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onMouseEnter={() => setHoveredId("root")}
          onMouseLeave={() => setHoveredId(null)}
          className="cursor-pointer"
        >
          <defs>
            <filter id="rootGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={colors.signal} floodOpacity="0.35" />
            </filter>
            <filter id="childGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={colors.signal} floodOpacity="0.2" />
            </filter>
            <linearGradient id="rootBorder" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colors.signal} stopOpacity="0.6" />
              <stop offset="100%" stopColor={colors.signal} stopOpacity="0.1" />
            </linearGradient>
          </defs>

          <foreignObject x={ROOT_X} y={ROOT_Y - 22} width="120" height="44">
            <motion.div
              className="flex h-full w-full items-center justify-center rounded-xl backdrop-blur-md border"
              style={{
                backgroundColor: "rgba(30, 41, 59, 0.85)",
                borderColor: hoveredId === "root" ? "var(--signal)" : "rgba(163, 231, 53, 0.3)",
                filter: hoveredId === "root" ? "drop-shadow(0 0 12px rgba(163, 231, 53, 0.4))" : "none",
              }}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0 }}
            >
              <span className="font-display text-sm font-bold" style={{ color: "var(--paper)" }}>ExpenseApp</span>
            </motion.div>
          </foreignObject>
        </motion.g>

        {/* Child nodes */}
        {demoData.map((f, i) => {
          const cy = childYs[i];
          const isChildHovered = hoveredId === f.id;

          return (
            <motion.g
              key={f.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.25, type: "spring", stiffness: 200, damping: 14 }}
              onMouseEnter={() => setHoveredId(f.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer"
            >
              <foreignObject x={CHILD_X} y={cy - 30} width="200" height="60">
                <motion.div
                  className="flex flex-col justify-center rounded-xl backdrop-blur-md border px-4 py-2 h-full"
                  style={{
                    backgroundColor: "rgba(30, 41, 59, 0.85)",
                    borderColor: isChildHovered ? f.color : "rgba(51, 65, 85, 0.6)",
                    boxShadow: isChildHovered ? `0 0 20px -4px ${f.color}40` : "none",
                  }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 * (i + 1) }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold" style={{ color: "var(--paper)" }}>{f.name}</span>
                    <span
                      className="shrink-0 rounded-full border px-2 py-0.5 font-mono text-[8px] font-medium uppercase tracking-wider animate-pulse-soft"
                      style={{
                        backgroundColor: `${f.color}1a`,
                        borderColor: `${f.color}40`,
                        color: f.color,
                      }}
                    >
                      Ph {f.phase}
                    </span>
                  </div>
                </motion.div>
              </foreignObject>
            </motion.g>
          );
        })}
      </svg>

      <style>{`
        @keyframes dash-flow {
          to { stroke-dashoffset: -32; }
        }
        .animate-dash-flow {
          animation: dash-flow 1.2s linear infinite;
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
