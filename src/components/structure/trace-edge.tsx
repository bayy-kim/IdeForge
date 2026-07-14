"use client";

import { getBezierPath, type EdgeProps } from "@xyflow/react";

export function TraceEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <path
      d={path}
      className="trace-line"
      fill="none"
      stroke="var(--trace)"
      strokeWidth={1.5}
      strokeOpacity={0.6}
    />
  );
}

export const edgeTypes = {
  trace: TraceEdge,
};
