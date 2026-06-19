"use client";

/**
 * SUDA Garden — follows the slanted compound north wall, extended northward.
 */
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { PolygonRing } from "@/domain/types/site";
import { createGroundCapGeometry } from "@/generation/geometry";
import { PALETTE } from "@/rendering/materials/colors";
import { applyWorldGrassUVs, grassMapsForArea } from "@/rendering/materials/grassTexture";
import { ASSETS } from "@/rendering/models/assetPaths";
import { GlbProp, InstancedGlb, type Placement2D } from "@/rendering/objects/GlbModel";

interface GardenAreaProps {
  polygon: PolygonRing;
}

const noRaycast = () => null;
const GRASS_Y = 0.11;
const PATH_Y = 0.15;

export function GardenArea({ polygon }: GardenAreaProps) {
  const box = useMemo(() => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const [x, y] of polygon) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    return {
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
      minX,
      minY,
      maxX,
      maxY,
      W: maxX - minX,
      D: maxY - minY,
    };
  }, [polygon]);

  const { cx, cy, minX, minY, maxX, maxY, W, D } = box;
  const pathW = Math.min(W, D) * 0.09;
  const fountainR = Math.min(W, D) * 0.1;
  const inset = Math.min(W, D) * 0.1;
  const loopHalfW = W / 2 - inset;
  const loopHalfD = D / 2 - inset;

  const grassGeometry = useMemo(() => {
    const geo = createGroundCapGeometry(polygon, applyWorldGrassUVs);
    return geo;
  }, [polygon]);

  const grassMaps = useMemo(() => grassMapsForArea(W, D), [W, D]);

  useEffect(() => () => grassGeometry.dispose(), [grassGeometry]);
  useEffect(
    () => () => {
      grassMaps.map.dispose();
      grassMaps.normalMap.dispose();
    },
    [grassMaps],
  );

  const benches = useMemo<Placement2D[]>(
    () => [
      { x: cx, y: cy - fountainR - pathW - 1.2, rotationY: 0 },
      { x: cx, y: cy + fountainR + pathW + 1.2, rotationY: Math.PI },
    ],
    [cx, cy, fountainR, pathW],
  );

  const lamps = useMemo<Placement2D[]>(
    () => [
      { x: cx - loopHalfW, y: cy - loopHalfD, rotationY: 0 },
      { x: cx + loopHalfW, y: cy - loopHalfD, rotationY: 0 },
      { x: cx - loopHalfW, y: cy + loopHalfD, rotationY: 0 },
      { x: cx + loopHalfW, y: cy + loopHalfD, rotationY: 0 },
    ],
    [cx, cy, loopHalfW, loopHalfD],
  );

  const flowerBeds = useMemo<Placement2D[]>(() => {
    const qx = W * 0.3;
    const qz = D * 0.28;
    return [
      { x: cx - qx, y: cy - qz, rotationY: Math.PI / 6 },
      { x: cx + qx, y: cy - qz, rotationY: -Math.PI / 6 },
      { x: cx - qx, y: cy + qz, rotationY: -Math.PI / 6 },
      { x: cx + qx, y: cy + qz, rotationY: Math.PI / 6 },
    ];
  }, [cx, cy, W, D]);

  const gardenTrees = useMemo<Placement2D[]>(() => {
    const mx = W * 0.42;
    return [
      { x: minX + 2.5, y: minY + 3, rotationY: 0.4, scale: 1.0 },
      { x: maxX - 2.5, y: minY + 3, rotationY: 1.2, scale: 0.95 },
      { x: minX + 2.5, y: maxY - 2.5, rotationY: 2.1, scale: 1.05 },
      { x: maxX - 2.5, y: maxY - 2.5, rotationY: 2.8, scale: 1.0 },
      { x: cx - mx, y: cy, rotationY: 0.8, scale: 0.9 },
      { x: cx + mx, y: cy, rotationY: 1.9, scale: 0.9 },
    ];
  }, [cx, cy, minX, minY, maxX, maxY, W, D]);

  return (
    <group name="suda-garden">
      <mesh geometry={grassGeometry} position={[0, GRASS_Y, 0]} receiveShadow raycast={noRaycast}>
        <meshStandardMaterial
          map={grassMaps.map}
          normalMap={grassMaps.normalMap}
          normalScale={new THREE.Vector2(0.25, 0.25)}
          color={PALETTE.grass}
          roughness={0.92}
        />
      </mesh>

      <mesh position={[cx, PATH_Y, -cy]} receiveShadow raycast={noRaycast}>
        <boxGeometry args={[W - inset, 0.06, pathW]} />
        <meshStandardMaterial color={PALETTE.gardenPath} roughness={1} />
      </mesh>
      <mesh position={[cx, PATH_Y, -cy]} receiveShadow raycast={noRaycast}>
        <boxGeometry args={[pathW, 0.06, D - inset]} />
        <meshStandardMaterial color={PALETTE.gardenPath} roughness={1} />
      </mesh>
      {[
        { x: 0, z: -loopHalfD, w: loopHalfW * 2, d: pathW },
        { x: 0, z: loopHalfD, w: loopHalfW * 2, d: pathW },
        { x: -loopHalfW, z: 0, w: pathW, d: loopHalfD * 2 },
        { x: loopHalfW, z: 0, w: pathW, d: loopHalfD * 2 },
      ].map((s, i) => (
        <mesh
          key={`loop${i}`}
          position={[cx + s.x, PATH_Y, -(cy + s.z)]}
          receiveShadow
          raycast={noRaycast}
        >
          <boxGeometry args={[s.w, 0.06, s.d]} />
          <meshStandardMaterial color={PALETTE.gardenPath} roughness={1} />
        </mesh>
      ))}

      <GlbProp
        url={ASSETS.fountain}
        position={[cx, 0.18, -cy]}
        targetHeight={fountainR * 2.2}
      />

      <InstancedGlb url={ASSETS.flowerBed} placements={flowerBeds} targetFootprint={W * 0.14} />
      <InstancedGlb url={ASSETS.bench} placements={benches} targetFootprint={1.5} />
      <InstancedGlb url={ASSETS.lampPost} placements={lamps} targetHeight={3.0} />
      <InstancedGlb url={ASSETS.gardenTree} placements={gardenTrees} targetHeight={6} />
    </group>
  );
};
