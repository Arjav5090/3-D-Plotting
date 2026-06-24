"use client";

import {
  PLOT_NUMBER_LIFT,
  PlotBillboardLabel,
} from "@/rendering/labels/PlotBillboardLabel";

/** Plot numbers render smaller than edge dimensions. */
const NUMBER_SIZE_FACTOR = 0.68;
const NUMBER_SCALE_FACTOR = 0.72;

interface SurfaceSizeLabelsProps {
  x: number;
  siteY: number;
  surfaceY: number;
  title: string;
  titleSize?: number;
  titleColor?: string;
}

/** Plot number centred on the parcel — billboarded for all viewing angles. */
export function SurfaceSizeLabels({
  x,
  siteY,
  surfaceY,
  title,
  titleSize = 2.2,
  titleColor = "#ffffff",
}: SurfaceSizeLabelsProps) {
  return (
    <PlotBillboardLabel
      position={[x, surfaceY + PLOT_NUMBER_LIFT, -siteY]}
      fontSize={titleSize * NUMBER_SIZE_FACTOR}
      color={titleColor}
      outlineWidth={0.05}
      outlineColor="#2d4a22"
      outlineOpacity={0.9}
      renderOrder={25}
      anchorY="bottom"
      scaleFactor={NUMBER_SCALE_FACTOR}
    >
      {title}
    </PlotBillboardLabel>
  );
}
