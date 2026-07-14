"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { ChevronDown } from "lucide-react";

export type RootNodeData = Node<{ appName: string; summary: string }, "root">;
export type FeatureNodeData = Node<
  { name: string; phase: number; status: string },
  "feature"
>;
export type SubPanelNodeData = Node<{ subFeatures: { id: string; name: string }[] }, "subpanel">;

export function RootNode({ data }: NodeProps<RootNodeData>) {
  return (
    <div className="w-[220px] rounded-lg border border-signal/40 bg-ink-raised px-4 py-3 shadow-[0_0_20px_-4px_var(--signal-dim)]">
      <Handle type="source" position={Position.Right} className="!opacity-0" />
      <p className="font-display text-sm font-bold text-paper">{data.appName}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-signal">
        Perencanaan
      </p>
    </div>
  );
}

export function FeatureNode({ data }: NodeProps<FeatureNodeData>) {
  return (
    <div className="w-[210px] rounded-lg border border-line bg-ink-raised px-4 py-3 transition-colors hover:border-trace/50">
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <Handle type="source" position={Position.Right} className="!opacity-0" />
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-paper">{data.name}</p>
        <span className="shrink-0 rounded-full border border-signal/30 bg-signal-dim px-2 py-0.5 font-mono text-[9px] uppercase text-signal">
          Fase {data.phase}
        </span>
      </div>
      <p className="mt-1.5 font-mono text-[10px] text-muted">{data.status}</p>
    </div>
  );
}

export function SubPanelNode({ data }: NodeProps<SubPanelNodeData>) {
  const [expanded, setExpanded] = useState(false);
  const items = data.subFeatures;
  const visible = expanded ? items : items.slice(0, 3);
  const hidden = items.length - visible.length;

  return (
    <div className="w-[240px] rounded-lg border border-line bg-ink-raised-2 px-4 py-3">
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <p className="font-mono text-[10px] uppercase tracking-wider text-trace">Sub Fitur</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {visible.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-[13px] text-paper">
            <span className="h-1 w-1 shrink-0 rounded-full bg-trace" />
            {s.name}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-2 flex items-center gap-1 font-mono text-[10px] text-muted hover:text-paper"
        >
          Lihat semua ({items.length}) <ChevronDown className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export const nodeTypes = {
  root: RootNode,
  feature: FeatureNode,
  subpanel: SubPanelNode,
};
