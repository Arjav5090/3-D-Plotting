"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useCompassStore } from "@/store/useCompassStore";

/** Publishes camera azimuth so the DOM compass rose tracks site north. */
export function CompassSync() {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  useFrame(() => {
    if (!controls) return;
    const dx = camera.position.x - controls.target.x;
    const dz = camera.position.z - controls.target.z;
    const heading = Math.atan2(dx, dz);
    useCompassStore.getState().setHeadingDeg(THREE.MathUtils.radToDeg(heading));
  });

  return null;
}
