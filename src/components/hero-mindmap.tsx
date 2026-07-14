"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const demoData = [
  { id: "f1", name: "Dashboard", phase: 1, color: "var(--signal)", subs: ["Monthly summary", "Expense chart", "Date filter"] },
  { id: "f2", name: "Record Transaction", phase: 2, color: "var(--trace)", subs: ["Manual input", "Categories", "Receipt scan"] },
  { id: "f3", name: "WhatsApp Integration", phase: 3, color: "var(--paper)", subs: ["Twilio webhook", "Message parser", "Confirmation"] },
];

const ROOT_X = 40;
const ROOT_W = 130;
const CHILD_X = 380;
const CHILD_W = 210;
const CHILD_GAP = 75;
const ROOT_Y = 120;

const SVG_W = 640;

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
    <div className="w-full mt-24 flex justify-center">
      <div className="w-full max-w-2xl">
        <svg
          viewBox={`0 0 ${SVG_W} 240`}
          className="w-full h-auto overflow-visible"
          fill="none"
        >
          {/* Entire diagram entrance */}
          <motion.g
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Connecting lines */}
            {demoData.map((f, i) => {
              const cy = childYs[i];
              const rightEdge = ROOT_X + ROOT_W;
              const leftEdge = CHILD_X - 8;
              const path = buildPath(rightEdge, ROOT_Y, leftEdge, cy);
              const isHovered = hoveredId === f.id;

              return (
                <g key={f.id}>
                  <motion.path
                    d={path}
                    fill="none"
                    stroke={isHovered ? f.color : "rgb(71 85 105)"}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    strokeOpacity={isHovered ? 0.9 : 0.3}
                    style={isHovered ? { filter: `drop-shadow(0 0 6px ${f.color})` } : {}}
                    className="transition-all duration-300 ease-out"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.25, ease: "easeInOut" }}
                  />

                  <motion.circle
                    cx={leftEdge}
                    cy={cy}
                    r={isHovered ? 5 : 3}
                    fill={isHovered ? f.color : "rgb(71 85 105)"}
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}

            {/* Root node */}
            <motion.g
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              onMouseEnter={() => setHoveredId("root")}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer"
            >
              <foreignObject x={ROOT_X} y={ROOT_Y - 22} width={ROOT_W} height="44">
                <motion.div
                  className="flex h-full w-full items-center justify-center rounded-xl backdrop-blur-md border"
                  style={{
                    backgroundColor: "rgba(30, 41, 59, 0.85)",
                    borderColor: hoveredId === "root" ? "var(--signal)" : "rgba(163, 231, 53, 0.25)",
                    filter: hoveredId === "root" ? "drop-shadow(0 0 14px rgba(163, 231, 53, 0.35))" : "none",
                  }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                  whileHover={{ scale: 1.04 }}
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
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.15, type: "spring", stiffness: 180, damping: 15 }}
                  onMouseEnter={() => setHoveredId(f.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="cursor-pointer"
                >
                  <foreignObject x={CHILD_X} y={cy - 28} width={CHILD_W} height="56">
                    <motion.div
                      className="flex flex-col justify-center rounded-xl backdrop-blur-md border px-4 py-2 h-full"
                      style={{
                        backgroundColor: "rgba(30, 41, 59, 0.85)",
                        borderColor: isChildHovered ? f.color : "rgba(51, 65, 85, 0.5)",
                        boxShadow: isChildHovered ? `0 0 24px -8px ${f.color}50` : "none",
                      }}
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 * (i + 1) }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold" style={{ color: "var(--paper)" }}>{f.name}</span>
                        <span
                          className="shrink-0 rounded-full border px-2 py-0.5 font-mono text-[8px] font-medium uppercase tracking-wider"
                          style={{
                            backgroundColor: `${f.color}14`,
                            borderColor: `${f.color}35`,
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
          </motion.g>
        </svg>
      </div>
    </div>
  );
}
