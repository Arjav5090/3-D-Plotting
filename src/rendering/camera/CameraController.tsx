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
import { useViewportProfile } from "@/hooks/useViewportProfile";
import { fitDistance } from "@/rendering/camera/cameraFit";

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
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const { isMobile, isPortrait } = useViewportProfile();

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
    const aspect = Math.max(size.width / Math.max(size.height, 1), 0.1);
    const fitDist = fitDistance(w, d, fov, aspect);
    const mobilePad = isMobile ? (isPortrait ? 1.62 : 1.38) : 1.22;
    const uiLift = isMobile && isPortrait ? fitDist * 0.08 : fitDist * 0.03;

    let pos: THREE.Vector3;
    let tgt: THREE.Vector3;

    if (mode === "focus" && selectedPlotId && plotIndex.has(selectedPlotId)) {
      const { world, size: plotSize } = plotIndex.get(selectedPlotId)!;
      const dist = fitDistance(plotSize, plotSize, fov, aspect) * (isMobile ? 3.1 : 2.6);
      tgt = world.clone();
      pos = new THREE.Vector3(
        world.x + dist * 0.45,
        dist * 0.75,
        world.z + dist * 1.0,
      );
    } else if (mode === "gate" && landmarks.gate) {
      const g = toWorld(landmarks.gate[0], landmarks.gate[1]);
      const gateDist = fitDistance(20, 16, fov, aspect) * (isMobile ? 1.22 : 1.05);
      tgt = new THREE.Vector3(g.x, 2.6, g.z);
      pos = new THREE.Vector3(
        g.x + (isMobile ? 1.5 : 2.5),
        isMobile ? 10 : 8,
        g.z + gateDist,
      );
    } else if (mode === "garden" && landmarks.garden) {
      const gc = toWorld(landmarks.garden.cx, landmarks.garden.cy);
      const gDist =
        fitDistance(landmarks.garden.w, landmarks.garden.d, fov, aspect) *
        (isMobile ? 1.42 : 1.18);
      tgt = new THREE.Vector3(gc.x, 0, gc.z + uiLift * 0.35);
      pos = new THREE.Vector3(gc.x + gDist * 0.04, gDist * 0.78, gc.z + gDist);
    } else {
      const dist = fitDist * mobilePad;
      tgt = new THREE.Vector3(0, 0, uiLift);
      // Site north = world -Z — camera sits south (+Z) for north-up orientation.
      pos = new THREE.Vector3(
        dist * 0.04,
        dist * (isMobile ? 0.86 : 0.8),
        dist * (isMobile ? 1.1 : 1.04),
      );
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
    size.width,
    size.height,
    isMobile,
    isPortrait,
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
