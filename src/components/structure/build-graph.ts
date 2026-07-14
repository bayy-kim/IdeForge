import { Position, type Node, type Edge } from "@xyflow/react";
import type { PlanStructure } from "@/lib/types";

const V_SPACE = 150;
const X_ROOT = 40;
const X_FEATURE = 340;
const X_SUBPANEL = 640;

export function buildGraph(structure: PlanStructure): { nodes: Node[]; edges: Edge[] } {
  const features = [...structure.features].sort((a, b) => a.phase - b.phase);
  const totalHeight = (features.length - 1) * V_SPACE;
  const rootY = totalHeight / 2;

  const nodes: Node[] = [
    {
      id: "root",
      type: "root",
      position: { x: X_ROOT, y: rootY },
      data: { appName: structure.appName, summary: structure.summary },
      draggable: true,
    },
  ];

  const edges: Edge[] = [];

  features.forEach((f, i) => {
    const y = i * V_SPACE;

    nodes.push({
      id: f.id,
      type: "feature",
      position: { x: X_FEATURE, y },
      data: { name: f.name, phase: f.phase, status: f.status },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      draggable: true,
    });

    nodes.push({
      id: `${f.id}-sub`,
      type: "subpanel",
      position: { x: X_SUBPANEL, y },
      data: { subFeatures: f.subFeatures },
      targetPosition: Position.Left,
      draggable: true,
    });

    edges.push({
      id: `e-root-${f.id}`,
      source: "root",
      target: f.id,
      type: "trace",
    });

    edges.push({
      id: `e-sub-${f.id}`,
      source: f.id,
      target: `${f.id}-sub`,
      type: "trace",
    });
  });

  return { nodes, edges };
}
