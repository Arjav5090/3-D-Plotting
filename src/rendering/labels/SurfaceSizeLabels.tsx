"use client";

import { Text } from "@react-three/drei";

const noRaycast = () => null;

interface SurfaceSizeLabelsProps {
  x: number;
  siteY: number;
  surfaceY: number;
  title: string;
  titleSize?: number;
  titleColor?: string;
}

/** Plot number centred on the parcel — sized to avoid edge-dimension overlap. */
export function SurfaceSizeLabels({
  x,
  siteY,
  surfaceY,
  title,
  titleSize = 2.2,
  titleColor = "#ffffff",
}: SurfaceSizeLabelsProps) {
  return (
    <Text
      position={[x, surfaceY, -siteY]}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={titleSize}
      color={titleColor}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.06}
      outlineColor="#2d4a22"
      outlineOpacity={0.9}
      renderOrder={25}
      material-depthTest={false}
      material-toneMapped={false}
      raycast={noRaycast}
    >
      {title}
    </Text>
  );
}
