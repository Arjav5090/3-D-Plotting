"use client";

/**
 * Decorative low-poly people for scale + life in the marketing render.
 *
 * Each figure is a handful of primitives (head, torso, two legs, two arms).
 * Placement is organized (garden, entrance, internal road) — not scattered —
 * and everything disables raycast so people never affect plot selection.
 *
 * Rendered inside the centered site group: site (x, y) -> local (x, h, -y).
 */
import { useMemo } from "react";
import { PEOPLE_SHIRTS, SKIN_TONES, PANTS_COLOR } from "@/rendering/materials/colors";

const noRaycast = () => null;

function Person({ shirt, skin }: { shirt: string; skin: string }) {
  return (
    <group>
      {/* Legs */}
      <mesh position={[-0.12, 0.4, 0]} castShadow raycast={noRaycast}>
        <boxGeometry args={[0.18, 0.8, 0.22]} />
        <meshStandardMaterial color={PANTS_COLOR} roughness={0.9} />
      </mesh>
      <mesh position={[0.12, 0.4, 0]} castShadow raycast={noRaycast}>
        <boxGeometry args={[0.18, 0.8, 0.22]} />
        <meshStandardMaterial color={PANTS_COLOR} roughness={0.9} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.12, 0]} castShadow raycast={noRaycast}>
        <boxGeometry args={[0.46, 0.66, 0.26]} />
        <meshStandardMaterial color={shirt} roughness={0.85} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.31, 1.1, 0]} castShadow raycast={noRaycast}>
        <boxGeometry args={[0.14, 0.6, 0.18]} />
        <meshStandardMaterial color={shirt} roughness={0.85} />
      </mesh>
      <mesh position={[0.31, 1.1, 0]} castShadow raycast={noRaycast}>
        <boxGeometry args={[0.14, 0.6, 0.18]} />
        <meshStandardMaterial color={shirt} roughness={0.85} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.62, 0]} castShadow raycast={noRaycast}>
        <sphereGeometry args={[0.17, 12, 12]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
    </group>
  );
}

interface Spot {
  x: number;
  y: number;
  rot: number;
}

export function People() {
  // Organized placement: garden strollers, folks near the gate, residents
  // walking the internal road.
  const spots = useMemo<Spot[]>(
    () => [
      // Garden (north, outside the wall)
      { x: -6, y: 50, rot: 0.4 },
      { x: 8, y: 53, rot: -0.8 },
      { x: 3, y: 47, rot: 2.4 },
      // Near the entrance gate
      { x: 1.5, y: -3, rot: 0.2 },
      { x: 4.5, y: -3.5, rot: -0.3 },
      // Inside the society, along the internal road
      { x: 2.5, y: 18, rot: 1.6 },
      { x: 3.4, y: 31, rot: -1.4 },
    ],
    [],
  );

  return (
    <group>
      {spots.map((s, i) => (
        <group key={i} position={[s.x, 0, -s.y]} rotation={[0, s.rot, 0]}>
          <Person
            shirt={PEOPLE_SHIRTS[i % PEOPLE_SHIRTS.length]}
            skin={SKIN_TONES[i % SKIN_TONES.length]}
          />
        </group>
      ))}
    </group>
  );
}
