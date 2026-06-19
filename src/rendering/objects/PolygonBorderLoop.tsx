"use client";

/**
 * Raised dark strips along every plot edge — visible plot separators (WebGL
 * lineLoop linewidth is ignored on most GPUs).
 */
import { useMemo } from "react";
import type { PolygonRing } from "@/domain/types/site";
import { PLOT_BORDER } from "@/rendering/materials/colors";

interface PolygonBorderLoopProps {
  polygon: PolygonRing;
  y: number;
  width?: number;
  height?: number;
}

const noRaycast = () => null;

export function PolygonBorderLoop({
  polygon,
  y,
  width = 0.09,
  height = 0.04,
}: PolygonBorderLoopProps) {
  const meshes = useMemo(() => {
    const items: {
      position: [number, number, number];
      size: [number, number, number];
      angle: number;
    }[] = [];

    for (let i = 0; i < polygon.length; i++) {
      const [x1, y1] = polygon[i];
      const [x2, y2] = polygon[(i + 1) % polygon.length];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      if (len < 0.05) continue;

      items.push({
        position: [(x1 + x2) / 2, y + height / 2, -(y1 + y2) / 2],
        size: [len, height, width],
        angle: Math.atan2(dy, dx),
      });
    }

    return items;
  }, [polygon, y, width, height]);

  return (
    <group name="plot-border">
      {meshes.map((m, i) => (
        <mesh
          key={i}
          position={m.position}
          rotation={[0, -m.angle, 0]}
          raycast={noRaycast}
        >
          <boxGeometry args={m.size} />
          <meshStandardMaterial
            color={PLOT_BORDER}
            roughness={0.85}
            metalness={0}
            polygonOffset
            polygonOffsetFactor={-4}
            polygonOffsetUnits={-4}
          />
        </mesh>
      ))}
    </group>
  );
};
