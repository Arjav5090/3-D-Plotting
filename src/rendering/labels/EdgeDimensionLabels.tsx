"use client";

import type { EdgeLabelPlacement } from "@/rendering/labels/edgeDimensions";
import {
  PLOT_LABEL_LIFT,
  PlotBillboardLabel,
} from "@/rendering/labels/PlotBillboardLabel";

const noRaycast = () => null;

interface EdgeDimensionLabelsProps {
  placements: EdgeLabelPlacement[];
  surfaceY: number;
  color?: string;
  outlineWidth?: number;
}

/** Dimension strings along parcel edges — billboarded for all viewing angles. */
export function EdgeDimensionLabels({
  placements,
  surfaceY,
  color = "#2a2a2a",
  outlineWidth = 0.035,
}: EdgeDimensionLabelsProps) {
  const labelY = surfaceY + PLOT_LABEL_LIFT;

  return (
    <group raycast={noRaycast}>
      {placements.map((p, i) => (
        <PlotBillboardLabel
          key={i}
          position={[p.x, labelY, -p.y]}
          fontSize={p.fontSize}
          color={color}
          outlineWidth={outlineWidth}
          maxWidth={p.maxWidth}
        >
          {p.text}
        </PlotBillboardLabel>
      ))}
    </group>
  );
}
