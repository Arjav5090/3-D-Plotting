"use client";

/**
 * Cinematic camera presets with smooth, frame-rate-independent transitions:
 *
 *   - "master" : elevated angled overview — user keeps full orbit control after arrival
 *   - "gate"   : low approach shot of the entrance gate from the front road
 *
 * Animates only when `presetNonce` bumps (explicit preset click or Reset).
 * Once arrived, animation stops so manual pan / zoom / rotate take over.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { SiteBounds } from "@/generation/geometry";
import { useViewStore } from "@/store/useViewStore";
import { useViewportProfile } from "@/hooks/useViewportProfile";
import { fitDistance } from "@/rendering/camera/cameraFit";

const useViewStoreNonce = () => useViewStore((s) => s.presetNonce);

export interface Landmarks {
  /** Gate center in site coords. */
  gate: [number, number] | null;
}

interface CameraControllerProps {
  bounds: SiteBounds;
  landmarks: Landmarks;
}

const DAMP = 4.5;
const ARRIVE_EPSILON = 0.05;

export function CameraController({ bounds, landmarks }: CameraControllerProps) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const { isMobile, isPortrait } = useViewportProfile();

  const presetNonce = useViewStoreNonce();

  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const animating = useRef(false);

  const [cx, cy] = bounds.center;
  const toWorld = useMemo(
    () => (x: number, y: number, h = 0) =>
      new THREE.Vector3(x - cx, h, cy - y),
    [cx, cy],
  );

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const mode = useViewStore.getState().activePreset;
    const fov = (camera.fov * Math.PI) / 180;
    const [w, d] = bounds.size;
    const maxDim = Math.max(w, d, 1);
    const aspect = Math.max(size.width / Math.max(size.height, 1), 0.1);
    const fitDist = fitDistance(w, d, fov, aspect);
    const uiLift = isMobile && isPortrait ? fitDist * 0.06 : fitDist * 0.02;

    let pos: THREE.Vector3;
    let tgt: THREE.Vector3;

    if (mode === "gate" && landmarks.gate) {
      const g = toWorld(landmarks.gate[0], landmarks.gate[1]);
      const gateDist = fitDistance(20, 16, fov, aspect) * (isMobile ? 1.22 : 1.05);
      tgt = new THREE.Vector3(g.x, 2.6, g.z);
      pos = new THREE.Vector3(
        g.x + (isMobile ? 1.5 : 2.5),
        isMobile ? 10 : 8,
        g.z + gateDist,
      );
    } else {
      const zoomPad = isMobile ? (isPortrait ? 1.18 : 1.05) : 0.92;
      const dist = fitDist * zoomPad;
      tgt = new THREE.Vector3(0, 0, uiLift);
      pos = new THREE.Vector3(
        dist * 0.04,
        dist * (isMobile ? 0.82 : 0.76),
        dist * (isMobile ? 1.02 : 0.96),
      );
    }

    desiredPos.current.copy(pos);
    desiredTarget.current.copy(tgt);
    animating.current = true;

    const dist = pos.distanceTo(tgt);
    camera.near = Math.max(0.1, dist / 200);
    camera.far = dist * 20 + maxDim * 4;
    camera.updateProjectionMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate only on explicit preset request
  }, [camera, bounds, presetNonce, landmarks, toWorld]);

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
