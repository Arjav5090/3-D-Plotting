"use client";

/**
 * Royal open entrance portal — sandstone landmark with layered upper frame,
 * open arch crown, and bronze accents. Clear vehicle passage preserved.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { Boundary } from "@/domain/types/site";
import { PALETTE } from "@/rendering/materials/colors";
import { useSandstoneMaterials } from "@/rendering/materials/sandstoneMaterials";

interface EntranceGateProps {
  boundary: Boundary;
  name?: string;
}

const PILLAR_W = 0.86;
const FRAME_D = 0.4;
const PLINTH_H = 0.48;
const SHAFT_H = 3.05;
const ARCH_TUBE = 0.11;
const noRaycast = () => null;

type GateMats = ReturnType<typeof useSandstoneMaterials> & {
  nameplate: THREE.MeshStandardMaterial;
  light: THREE.MeshStandardMaterial;
  accent: THREE.MeshStandardMaterial;
};

function useGateMaterials(): GateMats {
  const base = useSandstoneMaterials();
  return useMemo(
    () => ({
      ...base,
      nameplate: new THREE.MeshStandardMaterial({
        color: PALETTE.gateNameplate,
        roughness: 0.48,
        metalness: 0.12,
      }),
      light: new THREE.MeshStandardMaterial({
        color: "#fff4e0",
        emissive: "#ffddb0",
        emissiveIntensity: 0.6,
        roughness: 0.4,
      }),
      accent: new THREE.MeshStandardMaterial({
        color: PALETTE.gateFinial,
        metalness: 0.55,
        roughness: 0.32,
        emissive: PALETTE.gateFinial,
        emissiveIntensity: 0.08,
      }),
    }),
    [base],
  );
}

function Column({
  x,
  mats,
  shaftH,
  side,
}: {
  x: number;
  mats: GateMats;
  shaftH: number;
  side: -1 | 1;
}) {
  const baseY = PLINTH_H;
  const shaftY = baseY + shaftH / 2;
  const capitalY = baseY + shaftH + 0.16;
  const innerX = side * (PILLAR_W / 2 - 0.05);

  return (
    <group position={[x, 0, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={`plinth-${i}`}
          position={[0, 0.09 + i * 0.11, 0]}
          castShadow
          receiveShadow
          material={i >= 2 ? mats.cap : mats.stone}
          raycast={noRaycast}
        >
          <boxGeometry args={[PILLAR_W + 0.28 - i * 0.05, 0.11, FRAME_D + 0.12 - i * 0.02]} />
        </mesh>
      ))}

      <mesh position={[0, shaftY, 0]} castShadow receiveShadow material={mats.stone} raycast={noRaycast}>
        <boxGeometry args={[PILLAR_W, shaftH, FRAME_D]} />
      </mesh>

      {[-0.26, 0, 0.26].map((ox) => (
        <mesh
          key={`flute-${ox}`}
          position={[ox, shaftY, FRAME_D / 2 + 0.01]}
          material={mats.trim}
          raycast={noRaycast}
        >
          <boxGeometry args={[0.05, shaftH * 0.9, 0.02]} />
        </mesh>
      ))}

      {[0.3, 0.55, 0.78].map((t) => (
        <mesh
          key={`course-${t}`}
          position={[0, baseY + shaftH * t, FRAME_D / 2 + 0.012]}
          material={mats.trim}
          raycast={noRaycast}
        >
          <boxGeometry args={[PILLAR_W - 0.1, 0.05, 0.025]} />
        </mesh>
      ))}

      <mesh position={[innerX, shaftY, FRAME_D / 2 + 0.016]} material={mats.trim} raycast={noRaycast}>
        <boxGeometry args={[0.09, shaftH * 0.92, 0.03]} />
      </mesh>

      <mesh position={[innerX, capitalY - 0.1, FRAME_D / 2 + 0.035]} castShadow material={mats.cap} raycast={noRaycast}>
        <boxGeometry args={[0.32, 0.14, 0.16]} />
      </mesh>

      <mesh position={[0, capitalY, 0]} castShadow material={mats.cap} raycast={noRaycast}>
        <boxGeometry args={[PILLAR_W + 0.2, 0.32, FRAME_D + 0.1]} />
      </mesh>

      <mesh position={[0, capitalY + 0.04, FRAME_D / 2 + 0.02]} material={mats.accent} raycast={noRaycast}>
        <boxGeometry args={[PILLAR_W + 0.12, 0.05, 0.04]} />
      </mesh>

      <mesh position={[0, capitalY + 0.26, 0.05]} castShadow material={mats.cap} raycast={noRaycast}>
        <boxGeometry args={[PILLAR_W + 0.34, 0.12, FRAME_D + 0.2]} />
      </mesh>

      <mesh position={[0, capitalY + 0.42, 0.08]} castShadow material={mats.stone} raycast={noRaycast}>
        <boxGeometry args={[PILLAR_W + 0.22, 0.1, FRAME_D + 0.14]} />
      </mesh>

      {/* Column urn finial */}
      <mesh position={[0, capitalY + 0.58, 0.1]} castShadow material={mats.accent} raycast={noRaycast}>
        <cylinderGeometry args={[0.12, 0.16, 0.14, 10]} />
      </mesh>
      <mesh position={[0, capitalY + 0.72, 0.1]} castShadow material={mats.accent} raycast={noRaycast}>
        <sphereGeometry args={[0.11, 10, 8]} />
      </mesh>

      <mesh position={[0, baseY + 0.08, FRAME_D / 2 + 0.05]} material={mats.light} raycast={noRaycast}>
        <boxGeometry args={[0.24, 0.07, 0.09]} />
      </mesh>
      <pointLight position={[0, baseY + 0.22, FRAME_D / 2 + 0.16]} color="#fff0dc" intensity={3.5} distance={7} decay={2} />
    </group>
  );
}

/** Layered royal cornice + open arch crown above the passage. */
function RoyalUpperFrame({
  width,
  clearW,
  frameBaseY,
  pillarX,
  mats,
}: {
  width: number;
  clearW: number;
  frameBaseY: number;
  pillarX: number;
  mats: GateMats;
}) {
  const archRadius = clearW * 0.52;
  const archY = frameBaseY + 0.38;
  const crestY = archY + archRadius + 0.14;
  const voussoirCount = 7;

  return (
    <group>
      {/* Side impost blocks — bridge column capitals into the arch */}
      {[-1, 1].map((side) => (
        <group key={`impost-${side}`}>
          <mesh
            position={[side * pillarX, frameBaseY + 0.04, 0.08]}
            castShadow
            material={mats.cap}
            raycast={noRaycast}
          >
            <boxGeometry args={[PILLAR_W + 0.24, 0.18, FRAME_D + 0.14]} />
          </mesh>
          <mesh
            position={[side * pillarX, frameBaseY + 0.16, FRAME_D / 2 + 0.12]}
            material={mats.accent}
            raycast={noRaycast}
          >
            <boxGeometry args={[PILLAR_W + 0.08, 0.04, 0.035]} />
          </mesh>
        </group>
      ))}

      {/* Layered entablature — matches wall cap course rhythm (0.11 m tiers) */}
      <mesh position={[0, frameBaseY + 0.1, 0.06]} castShadow receiveShadow material={mats.stone} raycast={noRaycast}>
        <boxGeometry args={[width + 0.35, 0.14, FRAME_D + 0.12]} />
      </mesh>
      <mesh position={[0, frameBaseY + 0.22, 0.1]} castShadow material={mats.cap} raycast={noRaycast}>
        <boxGeometry args={[width + 0.5, 0.11, FRAME_D + 0.18]} />
      </mesh>
      <mesh position={[0, frameBaseY + 0.31, 0.12]} castShadow material={mats.cap} raycast={noRaycast}>
        <boxGeometry args={[width + 0.38, 0.08, FRAME_D + 0.14]} />
      </mesh>
      <mesh position={[0, frameBaseY + 0.1, FRAME_D / 2 + 0.14]} material={mats.accent} raycast={noRaycast}>
        <boxGeometry args={[width * 0.88, 0.04, 0.03]} />
      </mesh>
      <mesh position={[0, frameBaseY + 0.24, FRAME_D / 2 + 0.16]} material={mats.accent} raycast={noRaycast}>
        <boxGeometry args={[width * 0.62, 0.03, 0.025]} />
      </mesh>

      {/* Open arch crown — voussoir ring with accent wedges */}
      <mesh position={[0, archY, FRAME_D / 2 + 0.03]} castShadow material={mats.stone} raycast={noRaycast}>
        <torusGeometry args={[archRadius, ARCH_TUBE, 14, 48, Math.PI]} />
      </mesh>
      {Array.from({ length: voussoirCount }, (_, i) => {
        const t = (i + 0.5) / voussoirCount;
        const angle = Math.PI * t;
        const r = archRadius;
        return (
          <mesh
            key={`voussoir-${i}`}
            position={[
              Math.cos(angle) * r,
              archY + Math.sin(angle) * r,
              FRAME_D / 2 + 0.045,
            ]}
            rotation={[0, 0, angle - Math.PI / 2]}
            castShadow
            material={i === Math.floor(voussoirCount / 2) ? mats.accent : mats.trim}
            raycast={noRaycast}
          >
            <boxGeometry args={[0.34, 0.1, 0.08]} />
          </mesh>
        );
      })}

      {/* Royal keystone + crest pedestal */}
      <mesh position={[0, crestY - 0.1, FRAME_D / 2 + 0.05]} castShadow material={mats.accent} raycast={noRaycast}>
        <boxGeometry args={[0.48, 0.62, 0.15]} />
      </mesh>
      <mesh position={[0, crestY + 0.14, 0.1]} castShadow material={mats.cap} raycast={noRaycast}>
        <boxGeometry args={[0.62, 0.2, FRAME_D + 0.24]} />
      </mesh>

      {/* Crest finial — dome + spire */}
      <mesh position={[0, crestY + 0.34, 0.1]} castShadow material={mats.accent} raycast={noRaycast}>
        <boxGeometry args={[0.34, 0.24, 0.34]} />
      </mesh>
      <mesh position={[0, crestY + 0.5, 0.1]} castShadow material={mats.accent} raycast={noRaycast}>
        <sphereGeometry args={[0.14, 12, 10]} />
      </mesh>
      <mesh position={[0, crestY + 0.68, 0.1]} castShadow material={mats.accent} raycast={noRaycast}>
        <coneGeometry args={[0.07, 0.22, 8]} />
      </mesh>

      {/* Top coping tiers — echoes wall cap */}
      <mesh position={[0, crestY + 0.54, 0.12]} castShadow material={mats.cap} raycast={noRaycast}>
        <boxGeometry args={[width + 0.68, 0.11, FRAME_D + 0.3]} />
      </mesh>
      <mesh position={[0, crestY + 0.66, 0.16]} castShadow material={mats.cap} raycast={noRaycast}>
        <boxGeometry args={[width + 0.52, 0.07, FRAME_D + 0.22]} />
      </mesh>

      {/* Corner pinnacles */}
      {[-1, 1].map((side) => (
        <group key={`pinnacle-${side}`}>
          <mesh
            position={[side * (width / 2 + 0.08), crestY + 0.48, 0.14]}
            castShadow
            material={mats.cap}
            raycast={noRaycast}
          >
            <boxGeometry args={[0.22, 0.28, 0.22]} />
          </mesh>
          <mesh
            position={[side * (width / 2 + 0.08), crestY + 0.66, 0.14]}
            castShadow
            material={mats.accent}
            raycast={noRaycast}
          >
            <sphereGeometry args={[0.08, 8, 8]} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, crestY + 0.46, 0.22]} material={mats.light} raycast={noRaycast}>
        <boxGeometry args={[width * 0.72, 0.035, 0.05]} />
      </mesh>
    </group>
  );
}

export function EntranceGate({ boundary, name }: EntranceGateProps) {
  const mats = useGateMaterials();

  const placement = useMemo(() => {
    const [a, b] = boundary.path;
    const ax = a[0];
    const az = -a[1];
    const bx = b[0];
    const bz = -b[1];
    const dx = bx - ax;
    const dz = bz - az;
    const width = Math.hypot(dx, dz) || 6.706;
    return {
      mid: [(ax + bx) / 2, 0, (az + bz) / 2] as [number, number, number],
      rotationY: -Math.atan2(dz, dx),
      width,
    };
  }, [boundary.path]);

  const { mid, rotationY, width } = placement;
  const pillarX = width / 2 - PILLAR_W / 2;
  const clearW = width - PILLAR_W * 2;
  const frameBaseY = PLINTH_H + SHAFT_H + 0.55;
  const signY = frameBaseY - 0.15;

  return (
    <group position={mid} rotation={[0, rotationY, 0]} name="entrance-gate">
      <Column x={-pillarX} mats={mats} shaftH={SHAFT_H} side={1} />
      <Column x={pillarX} mats={mats} shaftH={SHAFT_H} side={-1} />

      <RoyalUpperFrame
        width={width}
        clearW={clearW}
        frameBaseY={frameBaseY}
        pillarX={pillarX}
        mats={mats}
      />

      {name && (
        <>
          {[-1, 1].map((side) => (
            <mesh
              key={`bracket-${side}`}
              position={[side * (clearW * 0.36), signY - 0.12, FRAME_D / 2 + 0.03]}
              castShadow
              material={mats.trim}
              raycast={noRaycast}
            >
              <boxGeometry args={[0.11, 0.65, 0.07]} />
            </mesh>
          ))}
          <mesh position={[0, signY + 0.02, FRAME_D / 2 + 0.05]} material={mats.accent} raycast={noRaycast}>
            <boxGeometry args={[clearW * 0.76, 0.05, 0.04]} />
          </mesh>
          <mesh position={[0, signY, FRAME_D / 2 + 0.05]} castShadow material={mats.nameplate} raycast={noRaycast}>
            <boxGeometry args={[clearW * 0.74, 0.5, 0.06]} />
          </mesh>
          <Text
            position={[0, signY, FRAME_D / 2 + 0.09]}
            fontSize={0.25}
            color="#f8fafc"
            anchorX="center"
            anchorY="middle"
            maxWidth={clearW * 0.7}
            letterSpacing={0.12}
            raycast={noRaycast}
          >
            {name.toUpperCase()}
          </Text>
        </>
      )}

      <mesh position={[0, 0.04, 0.1]} receiveShadow material={mats.cap} raycast={noRaycast}>
        <boxGeometry args={[width + 0.65, 0.09, 0.52]} />
      </mesh>
      <mesh position={[0, 0.01, 0.15]} receiveShadow material={mats.trim} raycast={noRaycast}>
        <boxGeometry args={[width + 0.95, 0.07, 0.66]} />
      </mesh>
    </group>
  );
}
