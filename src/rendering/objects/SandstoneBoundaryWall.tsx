"use client";

/**
 * Procedural sandstone compound wall — matches the entrance gate style.
 * Tiled segments, course bands, corner pilasters, and cap course.
 */
import { useMemo } from "react";
import type { Boundary, SiteDefaults } from "@/domain/types/site";
import { useSandstoneMaterials } from "@/rendering/materials/sandstoneMaterials";

interface SandstoneBoundaryWallProps {
  boundary: Boundary;
  defaults?: SiteDefaults;
}

interface Segment {
  position: [number, number, number];
  rotationY: number;
  length: number;
}

const noRaycast = () => null;
const MODULE = 2.0;
const COURSE_H = 0.05;

export function SandstoneBoundaryWall({
  boundary,
  defaults,
}: SandstoneBoundaryWallProps) {
  const mats = useSandstoneMaterials();
  const height = boundary.height ?? defaults?.wallHeight ?? 2.4;
  const thickness = boundary.thickness ?? defaults?.wallThickness ?? 0.23;
  const postSize = thickness * 1.85;
  const capH = 0.11;

  const segments = useMemo<Segment[]>(() => {
    const pts = boundary.path;
    const out: Segment[] = [];
    const count = boundary.closed ? pts.length : pts.length - 1;

    for (let i = 0; i < count; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % pts.length];
      const dx = bx - ax;
      const dz = -by - -ay;
      const length = Math.hypot(dx, dz);
      if (length < 1e-6) continue;

      out.push({
        position: [(ax + bx) / 2, height / 2, (-ay + -by) / 2],
        rotationY: -Math.atan2(dz, dx),
        length: length + postSize,
      });
    }
    return out;
  }, [boundary.path, boundary.closed, height, postSize]);

  const posts = useMemo(() => {
    const pts = boundary.path;
    const n = pts.length;
    const start = boundary.closed ? 0 : 1;
    const end = boundary.closed ? n : n - 1;
    return pts.slice(start, end).map(([x, y]) => [x, -y] as [number, number]);
  }, [boundary.path, boundary.closed]);

  const courseCount = Math.max(2, Math.floor(height / 0.55));

  return (
    <group name={`${boundary.id}-sandstone-wall`}>
      {segments.map((seg, i) => {
        const slots = Math.max(1, Math.round(seg.length / MODULE));
        const slotLen = seg.length / slots;
        return (
          <group
            key={`seg-${i}`}
            position={seg.position}
            rotation={[0, seg.rotationY, 0]}
          >
            {Array.from({ length: slots }, (_, k) => {
              const x = -seg.length / 2 + slotLen * (k + 0.5);
              return (
                <group key={k} position={[x, 0, 0]}>
                  <mesh castShadow receiveShadow material={mats.stone} raycast={noRaycast}>
                    <boxGeometry args={[slotLen + 0.02, height, thickness]} />
                  </mesh>
                  {Array.from({ length: courseCount }, (_, c) => (
                    <mesh
                      key={`c-${c}`}
                      position={[0, -height / 2 + (height / (courseCount + 1)) * (c + 1), thickness / 2 + 0.008]}
                      material={mats.trim}
                      raycast={noRaycast}
                    >
                      <boxGeometry args={[slotLen - 0.06, COURSE_H, 0.02]} />
                    </mesh>
                  ))}
                </group>
              );
            })}
            <mesh position={[0, height / 2 + capH / 2, 0]} castShadow material={mats.cap} raycast={noRaycast}>
              <boxGeometry args={[seg.length, capH, thickness + 0.04]} />
            </mesh>
          </group>
        );
      })}

      {posts.map(([wx, wz], i) => (
        <group key={`post-${i}`} position={[wx, 0, wz]}>
          <mesh position={[0, height / 2, 0]} castShadow receiveShadow material={mats.stone} raycast={noRaycast}>
            <boxGeometry args={[postSize, height, postSize]} />
          </mesh>
          <mesh position={[0, height + capH / 2 + 0.04, 0]} castShadow material={mats.cap} raycast={noRaycast}>
            <boxGeometry args={[postSize + 0.1, capH + 0.04, postSize + 0.1]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
