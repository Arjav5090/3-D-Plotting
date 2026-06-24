"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useCameraControlStore } from "@/store/useCameraControlStore";

const MIN_DISTANCE = 2;
const MAX_DISTANCE = 2500;
const ZOOM_FACTOR = 0.85;

function dolly(
  camera: THREE.Camera,
  controls: OrbitControlsImpl,
  factor: number,
) {
  const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
  const distance = offset.length();
  const next = THREE.MathUtils.clamp(distance * factor, MIN_DISTANCE, MAX_DISTANCE);
  offset.setLength(next).add(controls.target);
  camera.position.copy(offset);
  controls.update();
}

/** Registers imperative zoom handlers for the DOM zoom buttons. */
export function OrbitZoomBridge() {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const register = useCameraControlStore((s) => s.register);
  const unregister = useCameraControlStore((s) => s.unregister);

  useEffect(() => {
    if (!controls) return;

    register({
      zoomIn: () => dolly(camera, controls, ZOOM_FACTOR),
      zoomOut: () => dolly(camera, controls, 1 / ZOOM_FACTOR),
    });

    return unregister;
  }, [camera, controls, register, unregister]);

  return null;
}
