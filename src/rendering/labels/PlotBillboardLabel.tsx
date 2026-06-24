"use client";

import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { Billboard, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

/** Float above the plot surface (edge dimensions). */
export const PLOT_LABEL_LIFT = 0.82;

/** Plot numbers sit higher so billboard text does not clip below the grass cap. */
export const PLOT_NUMBER_LIFT = 1.15;

/** Keeps billboard labels ~constant on-screen size as the camera moves away. */
const REF_DISTANCE_FACTOR = 0.018;
const MIN_SCALE = 0.9;
const MAX_SCALE = 11;

const _worldPos = new THREE.Vector3();
const noRaycast = () => null;

interface PlotBillboardLabelProps {
  position: [number, number, number];
  fontSize: number;
  color?: string;
  outlineWidth?: number;
  outlineColor?: string;
  outlineOpacity?: number;
  maxWidth?: number;
  letterSpacing?: number;
  renderOrder?: number;
  anchorY?: "top" | "middle" | "bottom";
  /** Extra multiplier on distance-based scale (plot numbers use < 1). */
  scaleFactor?: number;
  children: ReactNode;
}

/**
 * Camera-facing plot label (like SUDA GARDEN) with distance-compensated scale
 * so text stays readable from gate view and when zoomed out.
 */
export function PlotBillboardLabel({
  position,
  fontSize,
  color = "#2a2a2a",
  outlineWidth = 0.035,
  outlineColor = "#ffffff",
  outlineOpacity = 0.95,
  maxWidth,
  letterSpacing = 0.02,
  renderOrder = 20,
  anchorY = "middle",
  scaleFactor = 1,
  children,
}: PlotBillboardLabelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    group.getWorldPosition(_worldPos);
    const dist = camera.position.distanceTo(_worldPos);
    const scale = THREE.MathUtils.clamp(
      dist * REF_DISTANCE_FACTOR * scaleFactor,
      MIN_SCALE * scaleFactor,
      MAX_SCALE * scaleFactor,
    );
    group.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef} position={position} raycast={noRaycast}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          fontSize={fontSize}
          color={color}
          anchorX="center"
          anchorY={anchorY}
          maxWidth={maxWidth}
          letterSpacing={letterSpacing}
          outlineWidth={outlineWidth}
          outlineColor={outlineColor}
          outlineOpacity={outlineOpacity}
          renderOrder={renderOrder}
          material-depthTest={false}
          material-toneMapped={false}
          raycast={noRaycast}
        >
          {children}
        </Text>
      </Billboard>
    </group>
  );
}
