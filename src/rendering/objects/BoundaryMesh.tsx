"use client";

/**
 * Renders a boundary (wall / fence / gate) as a chain of extruded box
 * segments along its path. Each segment is a box sized to the wall thickness
 * and height, positioned at the segment midpoint and rotated to align.
 */
import { useMemo } from "react";
import type { Boundary, SiteDefaults } from "@/domain/types/site";
import { PALETTE } from "@/rendering/materials/colors";

interface BoundaryMeshProps {
  boundary: Boundary;
  defaults?: SiteDefaults;
}

interface Segment {
  /** World-space midpoint. */
  position: [number, number, number];
  /** Y-axis rotation aligning the box length with the segment. */
  rotationY: number;
  length: number;
}

const noRaycast = () => null;

export function BoundaryMesh({ boundary, defaults }: BoundaryMeshProps) {
  const height = boundary.height ?? defaults?.wallHeight ?? 2.4;
  const thickness = boundary.thickness ?? defaults?.wallThickness ?? 0.2;
  /** Square pilaster at every vertex so joints close with zero gaps. */
  const postSize = thickness * 1.9;

  const segments = useMemo<Segment[]>(() => {
    const pts = boundary.path;
    const out: Segment[] = [];
    const count = boundary.closed ? pts.length : pts.length - 1;

    for (let i = 0; i < count; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % pts.length];

      // site (x, y) -> world (x, _, -y)
      const dx = bx - ax;
      const dz = -by - -ay; // = ay - by
      const length = Math.hypot(dx, dz);
      if (length < 1e-6) continue;

      out.push({
        // Overlap each end into the corner post so there is never a sliver gap.
        position: [(ax + bx) / 2, height / 2, (-ay + -by) / 2],
        rotationY: -Math.atan2(dz, dx),
        length: length + postSize,
      });
    }
    return out;
  }, [boundary.path, boundary.closed, height, postSize]);

  // A pilaster post at each vertex covers the mitre and reads as a premium wall.
  const posts = useMemo(
    () =>
      boundary.path.map(([x, y]) => [x, -y] as [number, number]),
    [boundary.path],
  );

  return (
    <group name={boundary.id}>
      {segments.map((seg, i) => (
        <mesh
          key={`seg-${i}`}
          position={seg.position}
          rotation={[0, seg.rotationY, 0]}
          castShadow
          receiveShadow
          raycast={noRaycast}
        >
          {/* length along local X, height along Y, thickness along Z */}
          <boxGeometry args={[seg.length, height, thickness]} />
          <meshStandardMaterial color={PALETTE.wall} roughness={0.9} />
        </mesh>
      ))}

      {posts.map(([wx, wz], i) => (
        <group key={`post-${i}`} position={[wx, 0, wz]}>
          <mesh position={[0, height / 2, 0]} castShadow receiveShadow raycast={noRaycast}>
            <boxGeometry args={[postSize, height + 0.15, postSize]} />
            <meshStandardMaterial color={PALETTE.wall} roughness={0.9} />
          </mesh>
          {/* Cap for a finished, premium look */}
          <mesh position={[0, height + 0.2, 0]} castShadow raycast={noRaycast}>
            <boxGeometry args={[postSize + 0.12, 0.12, postSize + 0.12]} />
            <meshStandardMaterial color={PALETTE.wallCap} roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
