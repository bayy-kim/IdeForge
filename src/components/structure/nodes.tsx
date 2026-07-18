"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type RootNodeData = Node<{ appName: string; summary: string }, "root">;
export type FeatureNodeData = Node<
  { name: string; phase: number; status: string },
  "feature"
>;
export type SubPanelNodeData = Node<{ subFeatures: { id: string; name: string }[] }, "subpanel">;

export function RootNode({ data }: NodeProps<RootNodeData>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-[220px] rounded-lg border border-signal/40 bg-ink-raised px-4 py-3 shadow-[0_0_20px_-4px_var(--signal-dim)]"
    >
      <Handle type="source" position={Position.Right} className="!opacity-0" />
      <p className="font-display text-sm font-bold text-paper">{data.appName}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-signal">
        Perencanaan
      </p>
    </motion.div>
  );
}

export function FeatureNode({ data }: NodeProps<FeatureNodeData>) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      whileHover={{ scale: 1.02, borderColor: "var(--trace)" }}
      className="w-[210px] rounded-lg border border-line bg-ink-raised px-4 py-3 transition-shadow hover:shadow-lg hover:shadow-trace/10"
    >
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <Handle type="source" position={Position.Right} className="!opacity-0" />
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-paper">{data.name}</p>
        <span className="shrink-0 rounded-full border border-signal/30 bg-signal-dim px-2 py-0.5 font-mono text-[9px] uppercase text-signal">
          Fase {data.phase}
        </span>
      </div>
      <p className="mt-1.5 font-mono text-[10px] text-muted">{data.status}</p>
    </motion.div>
  );
}

export function SubPanelNode({ data }: NodeProps<SubPanelNodeData>) {
  const [expanded, setExpanded] = useState(false);
  const items = data.subFeatures;
  const visible = expanded ? items : items.slice(0, 3);
  const hidden = items.length - visible.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
      className="w-[240px] rounded-lg border border-line bg-ink-raised-2 px-4 py-3"
    >
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <p className="font-mono text-[10px] uppercase tracking-wider text-trace">Sub Fitur</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        <AnimatePresence>
          {visible.map((s, i) => (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className="flex items-center gap-2 text-[13px] text-paper"
            >
              <span className="h-1 w-1 shrink-0 rounded-full bg-trace" />
              {s.name}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {hidden > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-2 flex items-center gap-1 font-mono text-[10px] text-muted hover:text-paper"
        >
          Lihat semua ({items.length}) <ChevronDown className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
}

export const nodeTypes = {
  root: RootNode,
  feature: FeatureNode,
  subpanel: SubPanelNode,
};
