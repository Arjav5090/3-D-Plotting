"use client";

/**
 * Crisp white kerb stones along road edges — clean separation between asphalt
 * and plot grass, matching architectural presentation style.
 */
import { useMemo } from "react";
import type { Road } from "@/domain/types/site";
import { PALETTE } from "@/rendering/materials/colors";

interface CurbsProps {
  road: Road;
}

const CURB_W = 0.22;
const CURB_H = 0.14;
const noRaycast = () => null;

interface Curb {
  position: [number, number, number];
  size: [number, number, number];
}

export function Curbs({ road }: CurbsProps) {
  const curbs = useMemo<Curb[]>(() => {
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
    const y = CURB_H / 2 + 0.01;
    const out: Curb[] = [];

    if (horizontal) {
      out.push({
        position: [cx, y, -(minY + CURB_W / 2)],
        size: [w, CURB_H, CURB_W],
      });
      // Main road north edge meets the compound wall/gate — no kerb there.
      if (road.id !== "road-main-1") {
        out.push({
          position: [cx, y, -(maxY - CURB_W / 2)],
          size: [w, CURB_H, CURB_W],
        });
      }
    } else {
      out.push({
        position: [minX + CURB_W / 2, y, -cy],
        size: [CURB_W, CURB_H, d],
      });
      out.push({
        position: [maxX - CURB_W / 2, y, -cy],
        size: [CURB_W, CURB_H, d],
      });
    }

    return out;
  }, [road.polygon]);

  return (
    <group>
      {curbs.map((c, i) => (
        <mesh
          key={i}
          position={c.position}
          castShadow
          receiveShadow
          raycast={noRaycast}
        >
          <boxGeometry args={c.size} />
          <meshStandardMaterial
            color={PALETTE.curb}
            roughness={0.55}
            metalness={0.02}
          />
        </mesh>
      ))}
    </group>
  );
}
