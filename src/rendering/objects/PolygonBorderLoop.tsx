"use client";

/**
 * Straight plot dividers only — horizontal / vertical internal lines.
 * Skips slanted compound-wall edges on the back (west) side.
 */
import { useMemo } from "react";
import { Line } from "@react-three/drei";
import type { PolygonRing } from "@/domain/types/site";
import { PLOT_BORDER } from "@/rendering/materials/colors";

interface PolygonBorderLoopProps {
  polygon: PolygonRing;
  y: number;
  /** When true, slanted perimeter edges are omitted. */
  straightOnly?: boolean;
}

const noRaycast = () => null;
const AXIS_EPS = 0.35;

function isAxisAligned(dx: number, dy: number, len: number): boolean {
  if (len < 0.05) return false;
  const nx = Math.abs(dx) / len;
  const ny = Math.abs(dy) / len;
  return nx < AXIS_EPS || ny < AXIS_EPS;
}

export function PolygonBorderLoop({
  polygon,
  y,
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
      if (straightOnly && !isAxisAligned(dx, dy, len)) continue;

      out.push({
        a: [x1, y, -y1],
        b: [x2, y, -y2],
      });
    }

    return out;
  }, [polygon, y, straightOnly]);

  return (
    <group name="plot-dividers">
      {segments.map((s, i) => (
        <Line
          key={i}
          points={[s.a, s.b]}
          color={PLOT_BORDER}
          lineWidth={1.8}
          renderOrder={12}
          raycast={noRaycast}
        />
      ))}
    </group>
  );
}
