"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Controls, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./nodes";
import { edgeTypes } from "./trace-edge";
import { buildGraph } from "./build-graph";
import type { PlanStructure } from "@/lib/types";

export function StructureFlow({ structure }: { structure: PlanStructure }) {
  const { nodes, edges } = useMemo(() => buildGraph(structure), [structure]);

  return (
    <div className="h-[70vh] w-full overflow-hidden rounded-xl border border-line bg-ink">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.4}
        maxZoom={1.5}
      >
        <Background variant={BackgroundVariant.Dots} color="var(--line)" gap={24} size={1} />
        <Controls
          showInteractive={false}
          className="!border-line !bg-ink-raised [&>button]:!border-line [&>button]:!bg-ink-raised [&>button]:!text-paper"
        />
      </ReactFlow>
    </div>
  );
}
