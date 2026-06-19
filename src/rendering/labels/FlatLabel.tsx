"use client";

/**
 * A label painted flat onto a surface (road / open space) rather than floating.
 *
 * The text lies in the ground plane (rotated -90° about X) and an outer group
 * spins it about the up axis (`label.rotation`, degrees) so road names follow
 * the road direction. Sits a couple of cm above the surface.
 */
import { Text } from "@react-three/drei";
import type { Label } from "@/domain/types/site";

interface FlatLabelProps {
  label: Label;
  color: string;
  fontSize: number;
  /** Height above the surface (world up). */
  y?: number;
}

export function FlatLabel({ label, color, fontSize, y = 0.05 }: FlatLabelProps) {
  const [x, sy] = label.at;
  const spin = ((label.rotation ?? 0) * Math.PI) / 180;

  return (
    <group position={[x, y, -sy]} rotation={[0, spin, 0]}>
      <Text
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
        outlineWidth={fontSize * 0.04}
        outlineColor="#ffffff"
        outlineOpacity={0.55}
        renderOrder={15}
        material-depthTest={false}
        material-toneMapped={false}
        raycast={() => null}
      >
        {label.text}
      </Text>
    </group>
  );
}
