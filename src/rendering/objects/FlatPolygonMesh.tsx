"use client";

/**
 * Reusable flat (non-extruded) filled polygon laid on the ground plane.
 * Shared by RoadMesh and open spaces — anything that is a colored surface.
 */
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { PolygonRing } from "@/domain/types/site";
import { shapeFromPolygon } from "@/generation/geometry";

interface FlatPolygonMeshProps {
  polygon: PolygonRing;
  color: string;
  /** Small lift above ground to avoid z-fighting with the ground plane. */
  y?: number;
  opacity?: number;
}

export function FlatPolygonMesh({
  polygon,
  color,
  y = 0.01,
  opacity = 1,
}: FlatPolygonMeshProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.ShapeGeometry(shapeFromPolygon(polygon));
    // Shape XY plane -> ground XZ plane. (x, y) -> (x, 0, -y)
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [polygon]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      geometry={geometry}
      position={[0, y, 0]}
      receiveShadow
      raycast={() => null}
    >
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
