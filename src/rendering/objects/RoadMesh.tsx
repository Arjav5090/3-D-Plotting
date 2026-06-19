"use client";

/**
 * Renders a road as a textured asphalt surface with world-aligned tiling.
 */
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Road } from "@/domain/types/site";
import { shapeFromPolygon } from "@/generation/geometry";
import {
  applyWorldAsphaltUVs,
  asphaltMapForArea,
} from "@/rendering/materials/asphaltTexture";
import { PALETTE } from "@/rendering/materials/colors";

interface RoadMeshProps {
  road: Road;
}

const noRaycast = () => null;

export function RoadMesh({ road }: RoadMeshProps) {
  const footprint = useMemo(() => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const [x, y] of road.polygon) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    return { w: maxX - minX, d: maxY - minY };
  }, [road.polygon]);

  const geometry = useMemo(() => {
    const geo = new THREE.ShapeGeometry(shapeFromPolygon(road.polygon));
    geo.rotateX(-Math.PI / 2);
    applyWorldAsphaltUVs(geo);
    return geo;
  }, [road.polygon]);

  const asphaltMap = useMemo(
    () => asphaltMapForArea(footprint.w, footprint.d),
    [footprint.w, footprint.d],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => asphaltMap.dispose(), [asphaltMap]);

  return (
    <mesh
      geometry={geometry}
      position={[0, 0.025, 0]}
      receiveShadow
      raycast={noRaycast}
    >
      <meshStandardMaterial
        map={asphaltMap}
        color={PALETTE.road}
        roughness={0.95}
        metalness={0}
      />
    </mesh>
  );
}
