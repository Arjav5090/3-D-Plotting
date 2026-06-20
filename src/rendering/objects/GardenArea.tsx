"use client";

/**
 * SUDA Garden — L-shaped lawn (north plaza + east boulevard to main road).
 * Fountain plaza, winding paths, lamps, pots, bushes, palms, and flower beds.
 */
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { PolygonRing } from "@/domain/types/site";
import { createGroundCapGeometryWithHoles } from "@/generation/geometry";
import { buildGardenLayout, type PathSlab } from "@/generation/gardenLayout";
import { PALETTE, PLOT_COLORS } from "@/rendering/materials/colors";
import { applyWorldGrassUVs, grassMapsWorldAligned } from "@/rendering/materials/grassTexture";
import { ASSETS } from "@/rendering/models/assetPaths";
import { GlbProp, InstancedGlb } from "@/rendering/objects/GlbModel";

interface GardenAreaProps {
  polygon: PolygonRing;
}

const noRaycast = () => null;
const GRASS_Y = 0.11;
const PATH_Y = 0.15;
const PLAZA_Y = 0.13;

function PathSlabMesh({ slab }: { slab: PathSlab }) {
  return (
    <mesh position={[slab.cx, PATH_Y, -slab.cy]} receiveShadow raycast={noRaycast}>
      <boxGeometry args={[slab.w, 0.06, slab.d]} />
      <meshStandardMaterial color={PALETTE.gardenPath} roughness={1} />
    </mesh>
  );
}

export function GardenArea({ polygon }: GardenAreaProps) {
  const layout = useMemo(() => buildGardenLayout(polygon), [polygon]);
  const { north, east } = layout;

  const grassGeometry = useMemo(() => {
    const geo = createGroundCapGeometryWithHoles(
      polygon,
      [{ cx: north.cx, cy: north.cy, r: north.fountainPadR }],
      applyWorldGrassUVs,
    );
    return geo;
  }, [polygon, north.cx, north.cy, north.fountainPadR]);

  const grassMaps = useMemo(() => grassMapsWorldAligned(), []);

  useEffect(() => () => grassGeometry.dispose(), [grassGeometry]);
  useEffect(
    () => () => {
      grassMaps.map.dispose();
      grassMaps.normalMap.dispose();
    },
    [grassMaps],
  );

  const allLamps = useMemo(
    () => [...north.lamps, ...east.lamps],
    [north.lamps, east.lamps],
  );
  const allPots = useMemo(
    () => [...north.pots, ...east.pots],
    [north.pots, east.pots],
  );
  const allBushes = useMemo(
    () => [...north.bushes, ...east.bushes],
    [north.bushes, east.bushes],
  );
  const allBenches = useMemo(
    () => [...north.benches, ...east.benches],
    [north.benches, east.benches],
  );
  const allTrees = useMemo(
    () => [...north.trees, ...east.trees],
    [north.trees, east.trees],
  );
  const allFlowerBeds = useMemo(
    () => [...north.flowerBeds, ...east.flowerBeds],
    [north.flowerBeds, east.flowerBeds],
  );

  const entrancePlazaCx = (east.wallX + east.eastX) / 2;
  const entrancePlazaCy = east.roadY + 2.1;
  const junctionY = north.cy - north.loopHalfD;
  const junctionCx = east.pathCx;

  return (
    <group name="suda-garden">
      <mesh geometry={grassGeometry} position={[0, GRASS_Y, 0]} receiveShadow raycast={noRaycast}>
        <meshStandardMaterial
          map={grassMaps.map}
          normalMap={grassMaps.normalMap}
          normalScale={new THREE.Vector2(0.25, 0.25)}
          color={PLOT_COLORS.base}
          roughness={0.92}
        />
      </mesh>

      {/* Fountain plaza — grass cut-out so the model is not clipped */}
      <mesh
        position={[north.cx, PLAZA_Y, -north.cy]}
        receiveShadow
        raycast={noRaycast}
      >
        <cylinderGeometry args={[north.fountainPadR, north.fountainPadR, 0.05, 40]} />
        <meshStandardMaterial color={PALETTE.gardenPlaza} roughness={0.95} />
      </mesh>

      {/* East boulevard welcome plaza at the main road */}
      <mesh
        position={[entrancePlazaCx, PLAZA_Y, -entrancePlazaCy]}
        receiveShadow
        raycast={noRaycast}
      >
        <cylinderGeometry args={[2.8, 2.8, 0.05, 32]} />
        <meshStandardMaterial color={PALETTE.gardenPlaza} roughness={0.95} />
      </mesh>

      {/* Junction plaza where east boulevard meets the north garden */}
      <mesh
        position={[junctionCx, PLAZA_Y, -junctionY]}
        receiveShadow
        raycast={noRaycast}
      >
        <cylinderGeometry args={[2.2, 2.2, 0.05, 32]} />
        <meshStandardMaterial color={PALETTE.gardenPlaza} roughness={0.95} />
      </mesh>

      {north.paths.map((s, i) => (
        <PathSlabMesh key={`np${i}`} slab={s} />
      ))}
      {east.paths.map((s, i) => (
        <PathSlabMesh key={`ep${i}`} slab={s} />
      ))}

      <GlbProp
        url={ASSETS.fountain}
        position={[north.cx, PLAZA_Y + 0.06, -north.cy]}
        targetHeight={north.fountainR * 2.2}
      />

      <InstancedGlb url={ASSETS.lowPolyPot} placements={allPots} targetFootprint={0.95} />
      <InstancedGlb url={ASSETS.greenBush} placements={allBushes} targetFootprint={1.45} />
      <InstancedGlb url={ASSETS.bench} placements={allBenches} targetFootprint={1.5} />
      <InstancedGlb url={ASSETS.lampPost} placements={allLamps} targetHeight={3.0} />
      <InstancedGlb url={ASSETS.gardenTree} placements={allTrees} targetHeight={5.5} />
      <InstancedGlb url={ASSETS.flowerBed} placements={allFlowerBeds} targetFootprint={2.2} />
    </group>
  );
}
