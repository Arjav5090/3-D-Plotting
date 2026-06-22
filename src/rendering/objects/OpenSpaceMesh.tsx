"use client";

/**
 * Renders a selectable open-space (O.S.) parcel with edge dimensions on the surface.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import type { OpenSpace } from "@/domain/types/site";
import { shapeFromPolygon } from "@/generation/geometry";
import {
  OPEN_SPACE_COLORS,
  ACCENT,
  HOVER_OUTLINE,
} from "@/rendering/materials/colors";
import { EdgeDimensionLabels } from "@/rendering/labels/EdgeDimensionLabels";
import { openSpaceEdgePlacements } from "@/rendering/labels/edgeDimensions";
import { useSelectionStore } from "@/store/useSelectionStore";

interface OpenSpaceMeshProps {
  openSpace: OpenSpace;
}

const LERP_SPEED = 9;
const DEPTH = 0.12;
const EMISSIVE_BASE = new THREE.Color(ACCENT);

const COLOR_BASE = new THREE.Color(OPEN_SPACE_COLORS.base);
const COLOR_HOVER = new THREE.Color(OPEN_SPACE_COLORS.hover);
const COLOR_SELECTED = new THREE.Color(OPEN_SPACE_COLORS.selected);

export function OpenSpaceMesh({ openSpace }: OpenSpaceMeshProps) {
  const geometry = useMemo(() => {
    const shape = shapeFromPolygon(openSpace.polygon);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: DEPTH,
      bevelEnabled: false,
    });
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, [openSpace.polygon]);

  const edgeLabels = useMemo(
    () => openSpaceEdgePlacements(openSpace),
    [openSpace],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  const isSelected = useSelectionStore((s) => s.selectedPlotId === openSpace.id);
  const isHovered = useSelectionStore((s) => s.hoveredPlotId === openSpace.id);
  const select = useSelectionStore((s) => s.select);
  const setHovered = useSelectionStore((s) => s.setHovered);

  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  const targetColor = isSelected
    ? COLOR_SELECTED
    : isHovered
      ? COLOR_HOVER
      : COLOR_BASE;
  const targetEmissive = isSelected ? 0.35 : isHovered ? 0.08 : 0;

  useFrame((_, delta) => {
    const m = matRef.current;
    if (!m) return;
    const t = 1 - Math.exp(-LERP_SPEED * delta);
    m.color.lerp(targetColor, t);
    m.emissiveIntensity = THREE.MathUtils.lerp(
      m.emissiveIntensity,
      targetEmissive,
      t,
    );
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    select(openSpace.id);
  };

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(openSpace.id);
    document.body.style.cursor = "pointer";
  };

  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (useSelectionStore.getState().hoveredPlotId === openSpace.id) {
      setHovered(null);
    }
    document.body.style.cursor = "auto";
  };

  useEffect(() => {
    return () => {
      if (useSelectionStore.getState().hoveredPlotId === openSpace.id) {
        useSelectionStore.getState().setHovered(null);
        document.body.style.cursor = "auto";
      }
    };
  }, [openSpace.id]);

  const labelY3 = DEPTH + 0.1;

  return (
    <group>
      <mesh
        geometry={geometry}
        name={openSpace.id}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      >
        <meshStandardMaterial
          ref={matRef}
          color={COLOR_BASE}
          emissive={EMISSIVE_BASE}
          emissiveIntensity={0}
          roughness={0.9}
          metalness={0}
        />
        {(isHovered || isSelected) && (
          <Outlines
            thickness={isSelected ? 0.32 : 0.16}
            color={isSelected ? ACCENT : HOVER_OUTLINE}
            transparent
            opacity={isSelected ? 1 : 0.9}
          />
        )}
      </mesh>

      <EdgeDimensionLabels
        placements={edgeLabels}
        surfaceY={labelY3}
        color="#1a4a3f"
      />
    </group>
  );
}
