"use client";

import { Text } from "@react-three/drei";
import type { EdgeLabelPlacement } from "@/rendering/labels/edgeDimensions";

const noRaycast = () => null;

interface EdgeDimensionLabelsProps {
  placements: EdgeLabelPlacement[];
  surfaceY: number;
  color?: string;
}

/** Dimension strings along parcel edges — tidy, top-down readable. */
export function EdgeDimensionLabels({
  placements,
  surfaceY,
  color = "#2a2a2a",
}: EdgeDimensionLabelsProps) {
  return (
    <group raycast={noRaycast}>
      {placements.map((p, i) => (
        <group
          key={i}
          position={[p.x, surfaceY, -p.y]}
          rotation={[0, p.spin, 0]}
        >
          <Text
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={p.fontSize}
            color={color}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.02}
            outlineWidth={0.035}
            outlineColor="#ffffff"
            outlineOpacity={0.95}
            renderOrder={20}
            material-depthTest={false}
            material-toneMapped={false}
            raycast={noRaycast}
          >
            {p.text}
          </Text>
        </group>
      ))}
    </group>
  );
}
