"use client";

/**
 * Standard road markings laid just above a road surface, following the road's
 * actual geometry (axis-aligned rectangles in this layout).
 *
 *  - Main roads: broken white centre lane + solid edge lines.
 *  - Internal roads: a clean broken centre guide line.
 *
 * Markings disable raycast so they never interfere with plot selection.
 * site (x, y) -> world (x, h, -y).
 */
import { useMemo } from "react";
import type { Road } from "@/domain/types/site";
import { PALETTE } from "@/rendering/materials/colors";

interface RoadMarkingsProps {
  road: Road;
}

const Y = 0.035; // just above the road fill (0.02)
const MARK_W = 0.28;
const DASH_LEN = 2.4;
const DASH_GAP = 2.6;
const noRaycast = () => null;

interface Mark {
  position: [number, number, number];
  size: [number, number]; // [along-X, along-Z] footprint
}

export function RoadMarkings({ road }: RoadMarkingsProps) {
  const marks = useMemo<Mark[]>(() => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const [x, y] of road.polygon) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    const w = maxX - minX;
    const d = maxY - minY;
    const horizontal = w >= d;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const out: Mark[] = [];

    // Broken centre line along the long axis.
    const span = horizontal ? w : d;
    const start = horizontal ? minX : minY;
    const step = DASH_LEN + DASH_GAP;
    for (let p = start + DASH_GAP; p + DASH_LEN <= start + span; p += step) {
      const c = p + DASH_LEN / 2;
      if (horizontal) {
        out.push({ position: [c, Y, -cy], size: [DASH_LEN, MARK_W] });
      } else {
        out.push({ position: [cx, Y, -c], size: [MARK_W, DASH_LEN] });
      }
    }

    // Solid edge lines for main roads only.
    if (road.kind === "main") {
      const inset = 0.8;
      if (horizontal) {
        const e1 = -(minY + inset);
        out.push({ position: [cx, Y, e1], size: [w - 1.0, MARK_W] });
        // North edge meets the compound wall — skip edge line there.
        if (road.id !== "road-main-1") {
          const e2 = -(maxY - inset);
          out.push({ position: [cx, Y, e2], size: [w - 1.0, MARK_W] });
        }
      } else {
        const e1 = minX + inset;
        const e2 = maxX - inset;
        out.push({ position: [e1, Y, -cy], size: [MARK_W, d - 1.0] });
        out.push({ position: [e2, Y, -cy], size: [MARK_W, d - 1.0] });
      }
    }

    return out;
  }, [road.polygon, road.kind]);

  return (
    <group>
      {marks.map((m, i) => (
        <mesh
          key={i}
          position={m.position}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          raycast={noRaycast}
        >
          <planeGeometry args={[m.size[0], m.size[1]]} />
          <meshStandardMaterial
            color={PALETTE.roadMarking}
            roughness={0.6}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>
      ))}
    </group>
  );
}
