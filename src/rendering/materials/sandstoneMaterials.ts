import { useMemo } from "react";
import * as THREE from "three";
import { PALETTE } from "@/rendering/materials/colors";
import { sandstoneMaterial } from "@/rendering/materials/sandstoneTexture";

export type SandstoneMats = {
  stone: THREE.MeshStandardMaterial;
  cap: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
};

/** Shared PBR sandstone materials for gate + compound wall. */
export function useSandstoneMaterials(): SandstoneMats {
  return useMemo(
    () => ({
      stone: sandstoneMaterial(PALETTE.wall, [2.4, 2.4]),
      cap: sandstoneMaterial(PALETTE.wallCap, [2, 2]),
      trim: sandstoneMaterial("#c4bfb6", [3, 1.2]),
    }),
    [],
  );
}
