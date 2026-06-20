"use client";

/**
 * Asphalt apron bridging the 18 M front road to the compound wall / gate.
 * Rendered after plots and gate so it covers south facades at the boundary.
 */
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Boundary } from "@/domain/types/site";
import { shapeFromPolygon } from "@/generation/geometry";
import { gateApronPolygon } from "@/generation/roadGeometry";
import {
  applyWorldAsphaltUVs,
  asphaltMapForArea,
} from "@/rendering/materials/asphaltTexture";
import { PALETTE } from "@/rendering/materials/colors";

interface RoadGateApronProps {
  wall?: Boundary;
  gate?: Boundary;
}

const noRaycast = () => null;

export function RoadGateApron({ wall, gate }: RoadGateApronProps) {
  const apron = useMemo(() => gateApronPolygon(wall, gate), [wall, gate]);

  const footprint = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const [x, y] of apron) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    return { w: maxX - minX, d: maxY - minY };
  }, [apron]);

  const geometry = useMemo(() => {
    const geo = new THREE.ShapeGeometry(shapeFromPolygon(apron));
    geo.rotateX(-Math.PI / 2);
    applyWorldAsphaltUVs(geo);
    return geo;
  }, [apron]);

  const asphaltMap = useMemo(
    () => asphaltMapForArea(footprint.w, footprint.d),
    [footprint.w, footprint.d],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => asphaltMap.dispose(), [asphaltMap]);

  return (
    <mesh
      geometry={geometry}
      position={[0, 0.042, 0]}
      receiveShadow
      raycast={noRaycast}
      renderOrder={5}
    >
      <meshStandardMaterial
        map={asphaltMap}
        color={PALETTE.road}
        roughness={0.95}
        metalness={0}
        polygonOffset
        polygonOffsetFactor={-3}
        polygonOffsetUnits={-3}
      />
    </mesh>
  );
}
