"use client";

/**
 * Cinematic camera presets with smooth, frame-rate-independent transitions:
 *
 *   - "master" : elevated angled overview of the whole master plan
 *   - "gate"   : low approach shot of the entrance gate from the front road
 *   - "garden" : framed view over the SUDA Garden
 *   - "focus"  : zoom to the selected plot
 *
 * Each preset is a desired {position, target} pose derived from site geometry
 * + landmarks. On a mode/selection/reset change the pose is recomputed and the
 * camera + OrbitControls target lerp toward it; once arrived it stops so the
 * user keeps full manual control.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Plot } from "@/domain/types/site";
import type { SiteBounds } from "@/generation/geometry";
import { useViewStore } from "@/store/useViewStore";
import { useSelectionStore } from "@/store/useSelectionStore";

const useViewStoreMode = () => useViewStore((s) => s.mode);
const useViewStoreNonce = () => useViewStore((s) => s.resetNonce);
const useSelectedPlotId = () => useSelectionStore((s) => s.selectedPlotId);

export interface Landmarks {
  /** Gate center in site coords. */
  gate: [number, number] | null;
  /** Garden center + size in site coords. */
  garden: { cx: number; cy: number; w: number; d: number } | null;
}

interface CameraControllerProps {
  bounds: SiteBounds;
  plots: Plot[];
  landmarks: Landmarks;
}

const DAMP = 4.5;
const ARRIVE_EPSILON = 0.05;

export function CameraController({
  bounds,
  plots,
  landmarks,
}: CameraControllerProps) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  const mode = useViewStoreMode();
  const resetNonce = useViewStoreNonce();
  const selectedPlotId = useSelectedPlotId();

  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const animating = useRef(false);

  const [cx, cy] = bounds.center;
  // site (x, y) -> world (x - cx, h, cy - y)
  const toWorld = useMemo(
    () => (x: number, y: number, h = 0) =>
      new THREE.Vector3(x - cx, h, cy - y),
    [cx, cy],
  );

  const plotIndex = useMemo(() => {
    const map = new Map<string, { world: THREE.Vector3; size: number }>();
    for (const p of plots) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const [x, y] of p.polygon) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      map.set(p.id, {
        world: toWorld((minX + maxX) / 2, (minY + maxY) / 2),
        size: Math.max(maxX - minX, maxY - minY, 1),
      });
    }
    return map;
  }, [plots, toWorld]);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const fov = (camera.fov * Math.PI) / 180;
    const [w, d] = bounds.size;
    const maxDim = Math.max(w, d, 1);
    const fitDist = maxDim / 2 / Math.tan(fov / 2);

    let pos: THREE.Vector3;
    let tgt: THREE.Vector3;

    if (mode === "focus" && selectedPlotId && plotIndex.has(selectedPlotId)) {
      const { world, size } = plotIndex.get(selectedPlotId)!;
      const dist = (size / 2 / Math.tan(fov / 2)) * 2.6;
      tgt = world.clone();
      pos = new THREE.Vector3(
        world.x + dist * 0.55,
        dist * 0.7,
        world.z + dist * 0.55,
      );
    } else if (mode === "gate" && landmarks.gate) {
      const g = toWorld(landmarks.gate[0], landmarks.gate[1]);
      // Front road is on the +Z (south) side; approach from there, low + close.
      tgt = new THREE.Vector3(g.x, 2.6, g.z);
      pos = new THREE.Vector3(g.x + 3, 7, g.z + 24);
    } else if (mode === "garden" && landmarks.garden) {
      const gc = toWorld(landmarks.garden.cx, landmarks.garden.cy);
      const gMax = Math.max(landmarks.garden.w, landmarks.garden.d, 1);
      const gDist = gMax / 2 / Math.tan(fov / 2);
      tgt = gc.clone();
      pos = new THREE.Vector3(gc.x, gDist * 0.7, gc.z + gDist * 0.95);
    } else {
      // master plan: elevated, angled overview
      const dist = fitDist * 1.25;
      tgt = new THREE.Vector3(0, 0, 0);
      pos = new THREE.Vector3(dist * 0.12, dist * 0.95, dist * 0.78);
    }

    desiredPos.current.copy(pos);
    desiredTarget.current.copy(tgt);
    animating.current = true;

    const dist = pos.distanceTo(tgt);
    camera.near = Math.max(0.1, dist / 200);
    camera.far = dist * 20 + maxDim * 4;
    camera.updateProjectionMatrix();
  }, [
    camera,
    controls,
    bounds,
    mode,
    selectedPlotId,
    resetNonce,
    plotIndex,
    landmarks,
    toWorld,
  ]);

  useFrame((_, delta) => {
    if (!animating.current || !controls) return;

    const t = 1 - Math.exp(-DAMP * delta);
    camera.position.lerp(desiredPos.current, t);
    controls.target.lerp(desiredTarget.current, t);
    controls.update();

    if (
      camera.position.distanceTo(desiredPos.current) < ARRIVE_EPSILON &&
      controls.target.distanceTo(desiredTarget.current) < ARRIVE_EPSILON
    ) {
      camera.position.copy(desiredPos.current);
      controls.target.copy(desiredTarget.current);
      controls.update();
      animating.current = false;
    }
  });

  return null;
}
