"use client";

/**
 * Green bush GLB instances lining plot–road edges and main-road outer borders.
 */
import type { SiteData } from "@/domain/types/site";
import { bushPlacements } from "@/generation/bushPlacements";
import { ASSETS } from "@/rendering/models/assetPaths";
import { InstancedGlb } from "@/rendering/objects/GlbModel";
import { useMemo } from "react";

interface BushesProps {
  data: SiteData;
}

export function Bushes({ data }: BushesProps) {
  const placements = useMemo(() => bushPlacements(data), [data]);

  return (
    <InstancedGlb
      url={ASSETS.greenBush}
      placements={placements}
      targetFootprint={1.05}
    />
  );
}
