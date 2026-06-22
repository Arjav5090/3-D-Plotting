"use client";

/**
 * Straight plot dividers only — internal plot-to-plot lines, never perimeter
 * edges along roads, walls, or open spaces.
 */
import { useMemo } from "react";
import { Line } from "@react-three/drei";
import type { PolygonRing } from "@/domain/types/site";
import { polygonEdgeKey } from "@/generation/geometry";
import { PLOT_BORDER } from "@/rendering/materials/colors";

interface PolygonBorderLoopProps {
  polygon: PolygonRing;
  y: number;
  /** When set, only these shared divider edges are drawn. */
  dividerEdges?: Set<string>;
  /** When true, slanted perimeter edges are omitted. */
  straightOnly?: boolean;
}

const noRaycast = () => null;
const AXIS_EPS = 0.35;
/** Shorten line caps so screen-space width does not bleed past parcel corners. */
const END_TRIM = 0.07;

function isAxisAligned(dx: number, dy: number, len: number): boolean {
  if (len < 0.05) return false;
  const nx = Math.abs(dx) / len;
  const ny = Math.abs(dy) / len;
  return nx < AXIS_EPS || ny < AXIS_EPS;
}

export function PolygonBorderLoop({
  polygon,
  y,
  dividerEdges,
  straightOnly = true,
}: PolygonBorderLoopProps) {
  const segments = useMemo(() => {
    const out: { a: [number, number, number]; b: [number, number, number] }[] =
      [];

    for (let i = 0; i < polygon.length; i++) {
      const [x1, y1] = polygon[i];
      const [x2, y2] = polygon[(i + 1) % polygon.length];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      if (len < 0.05) continue;
      if (straightOnly && !isAxisAligned(dx, dy, len)) continue;

      const key = polygonEdgeKey(x1, y1, x2, y2);
      if (dividerEdges && !dividerEdges.has(key)) continue;

      const trim = Math.min(END_TRIM, len * 0.12);
      const ux = dx / len;
      const uy = dy / len;
      const sx1 = x1 + ux * trim;
      const sy1 = y1 + uy * trim;
      const sx2 = x2 - ux * trim;
      const sy2 = y2 - uy * trim;

      out.push({
        a: [sx1, y, -sy1],
        b: [sx2, y, -sy2],
      });
    }

    return out;
  }, [polygon, y, dividerEdges, straightOnly]);

  if (segments.length === 0) return null;

  return (
    <group name="plot-dividers">
      {segments.map((s, i) => (
        <Line
          key={i}
          points={[s.a, s.b]}
          color={PLOT_BORDER}
          lineWidth={1.6}
          renderOrder={12}
          raycast={noRaycast}
        />
      ))}
    </group>
  );
}
