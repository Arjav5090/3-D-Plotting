"use client";

/**
 * Indian residential-society entrance gate — the project's main landmark.
 * Built from primitives only (no imported models), in a local "gate space":
 * width along local +X, outward (road side) along +Z, compound side along -Z.
 * It is then rotated + placed at the gate opening.
 *
 * Composition:
 *  - two grand main pillars (plinth + shaft + cornice + golden finial)
 *  - a tall crowning arch with a keystone over the large central entry
 *  - a society name board beneath the arch
 *  - decorative shorter side pillars that sit on the boundary wall (integration)
 *  - a security cabin beside the entry
 *  - warm decorative lamps
 */
import { useMemo } from "react";
import { Text } from "@react-three/drei";
import type { Boundary } from "@/domain/types/site";
import { PALETTE } from "@/rendering/materials/colors";

interface EntranceGateProps {
  boundary: Boundary;
  name?: string;
}

// Main pillar
const PILLAR_W = 1.2;
const PLINTH_H = 0.55;
const SHAFT_H = 4.2;
const CAP_H = 0.5;
const PILLAR_TOP = PLINTH_H + SHAFT_H + CAP_H; // 5.25
const ARCH_TUBE = 0.5;

// Side (decorative) pillar
const SIDE_W = 0.85;
const SIDE_H = 3.2;

const noRaycast = () => null;

export function EntranceGate({ boundary, name }: EntranceGateProps) {
  const placement = useMemo(() => {
    const [a, b] = boundary.path;
    const ax = a[0];
    const az = -a[1];
    const bx = b[0];
    const bz = -b[1];
    const dx = bx - ax;
    const dz = bz - az;
    const width = Math.hypot(dx, dz) || 8;
    return {
      mid: [(ax + bx) / 2, 0, (az + bz) / 2] as [number, number, number],
      rotationY: -Math.atan2(dz, dx),
      width,
    };
  }, [boundary.path]);

  const { mid, rotationY, width } = placement;
  const half = width / 2;

  const archRadius = half;
  const archPeak = PILLAR_TOP + archRadius;
  const lintelY = PILLAR_TOP - 0.25;
  const nameplateY = PILLAR_TOP + archRadius * 0.4;
  const sideOffset = half + 1.6;

  return (
    <group position={mid} rotation={[0, rotationY, 0]}>
      {/* ── Main pillars ─────────────────────────────────────────────── */}
      {[-half, half].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, PLINTH_H / 2, 0]} castShadow raycast={noRaycast}>
            <boxGeometry args={[PILLAR_W + 0.5, PLINTH_H, PILLAR_W + 0.5]} />
            <meshStandardMaterial color={PALETTE.gatePlinth} roughness={0.9} />
          </mesh>
          <mesh
            position={[0, PLINTH_H + SHAFT_H / 2, 0]}
            castShadow
            raycast={noRaycast}
          >
            <boxGeometry args={[PILLAR_W, SHAFT_H, PILLAR_W]} />
            <meshStandardMaterial color={PALETTE.gatePillar} roughness={0.9} />
          </mesh>
          <mesh
            position={[0, PLINTH_H + SHAFT_H + CAP_H / 2, 0]}
            castShadow
            raycast={noRaycast}
          >
            <boxGeometry args={[PILLAR_W + 0.4, CAP_H, PILLAR_W + 0.4]} />
            <meshStandardMaterial color={PALETTE.gatePlinth} roughness={0.85} />
          </mesh>
          <mesh position={[0, PILLAR_TOP + 0.18, 0]} castShadow raycast={noRaycast}>
            <boxGeometry args={[0.4, 0.36, 0.4]} />
            <meshStandardMaterial color={PALETTE.gateFinial} metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, PILLAR_TOP + 0.55, 0]} raycast={noRaycast}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial
              color={PALETTE.gateFinial}
              metalness={0.6}
              roughness={0.3}
              emissive={PALETTE.gateFinial}
              emissiveIntensity={0.15}
            />
          </mesh>
          <mesh
            position={[i === 0 ? -PILLAR_W / 2 - 0.12 : PILLAR_W / 2 + 0.12, 3.2, PILLAR_W / 2]}
            raycast={noRaycast}
          >
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshStandardMaterial
              color={PALETTE.lamp}
              emissive={PALETTE.lamp}
              emissiveIntensity={1.5}
            />
          </mesh>
          <pointLight
            position={[0, 3.4, PILLAR_W]}
            color={PALETTE.lamp}
            intensity={5}
            distance={9}
            decay={2}
          />
        </group>
      ))}

      {/* ── Decorative side pillars (sit on the boundary wall) ──────────── */}
      {[-sideOffset, sideOffset].map((x, i) => (
        <group key={`side-${i}`} position={[x, 0, 0]}>
          <mesh position={[0, SIDE_H / 2, 0]} castShadow raycast={noRaycast}>
            <boxGeometry args={[SIDE_W, SIDE_H, SIDE_W]} />
            <meshStandardMaterial color={PALETTE.gatePillar} roughness={0.9} />
          </mesh>
          <mesh position={[0, SIDE_H + 0.12, 0]} castShadow raycast={noRaycast}>
            <boxGeometry args={[SIDE_W + 0.25, 0.24, SIDE_W + 0.25]} />
            <meshStandardMaterial color={PALETTE.gatePlinth} roughness={0.85} />
          </mesh>
          <mesh position={[0, SIDE_H + 0.42, 0]} raycast={noRaycast}>
            <sphereGeometry args={[0.16, 14, 14]} />
            <meshStandardMaterial color={PALETTE.gateFinial} metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* ── Lintel + crowning arch + keystone (the large central entry) ── */}
      <mesh position={[0, lintelY, 0]} castShadow raycast={noRaycast}>
        <boxGeometry args={[width + PILLAR_W + 0.4, 0.7, 0.9]} />
        <meshStandardMaterial color={PALETTE.gateBeam} roughness={0.8} />
      </mesh>
      <mesh position={[0, PILLAR_TOP, 0]} castShadow raycast={noRaycast}>
        <torusGeometry args={[archRadius, ARCH_TUBE, 14, 40, Math.PI]} />
        <meshStandardMaterial color={PALETTE.gateArch} roughness={0.8} />
      </mesh>
      <mesh position={[0, archPeak - 0.1, 0]} castShadow raycast={noRaycast}>
        <boxGeometry args={[0.6, 0.8, 1.0]} />
        <meshStandardMaterial color={PALETTE.gatePlinth} roughness={0.85} />
      </mesh>

      {/* ── Society name board ─────────────────────────────────────────── */}
      <mesh position={[0, nameplateY, 0.46]} castShadow raycast={noRaycast}>
        <boxGeometry args={[width * 0.82, 1.0, 0.12]} />
        <meshStandardMaterial color={PALETTE.gateNameplate} roughness={0.5} />
      </mesh>
      {name && (
        <Text
          position={[0, nameplateY, 0.54]}
          fontSize={0.42}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          maxWidth={width * 0.78}
          letterSpacing={0.08}
          raycast={noRaycast}
        >
          {name.toUpperCase()}
        </Text>
      )}

    </group>
  );
}
