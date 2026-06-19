"use client";

/**
 * Renders a single plot as an extruded pad with a world-tiled grass cap,
 * perimeter border, and presentation-style numbering + area on the surface.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import type { Plot, SiteDefaults } from "@/domain/types/site";
import {
  createGroundCapGeometry,
  polygonCentroid,
  shapeFromPolygon,
} from "@/generation/geometry";
import {
  PLOT_COLORS,
  ACCENT,
  HOVER_OUTLINE,
} from "@/rendering/materials/colors";
import {
  applyWorldGrassUVs,
  grassMapsForArea,
} from "@/rendering/materials/grassTexture";
import { SurfaceSizeLabels } from "@/rendering/labels/SurfaceSizeLabels";
import { EdgeDimensionLabels } from "@/rendering/labels/EdgeDimensionLabels";
import { plotEdgePlacements, plotNumberSize } from "@/rendering/labels/edgeDimensions";
import { PolygonBorderLoop } from "@/rendering/objects/PolygonBorderLoop";
import { useSelectionStore } from "@/store/useSelectionStore";
import { useViewStore } from "@/store/useViewStore";

interface PlotMeshProps {
  plot: Plot;
  defaults?: SiteDefaults;
}

const LERP_SPEED = 9;
const EMISSIVE_BASE = new THREE.Color(ACCENT);

const COLOR_BASE = new THREE.Color(PLOT_COLORS.base);
const COLOR_HOVER = new THREE.Color(PLOT_COLORS.hover);
const COLOR_SELECTED = new THREE.Color(PLOT_COLORS.selected);

export function PlotMesh({ plot, defaults }: PlotMeshProps) {
  const depth =
    plot.building?.heightOverride ?? defaults?.plotExtrudeHeight ?? 0.15;

  const footprint = useMemo(() => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const [x, y] of plot.polygon) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    return { minX, minY, maxX, maxY, w: maxX - minX, d: maxY - minY };
  }, [plot.polygon]);

  const bodyGeometry = useMemo(() => {
    const shape = shapeFromPolygon(plot.polygon);
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, [plot.polygon, depth]);

  const topGeometry = useMemo(
    () => createGroundCapGeometry(plot.polygon, applyWorldGrassUVs),
    [plot.polygon],
  );

  const grassMaps = useMemo(
    () => grassMapsForArea(footprint.w, footprint.d),
    [footprint.w, footprint.d],
  );

  const numberSize = useMemo(
    () => plotNumberSize(footprint.w, footprint.d),
    [footprint.w, footprint.d],
  );

  const edgeLabels = useMemo(() => plotEdgePlacements(plot), [plot]);

  useEffect(() => () => bodyGeometry.dispose(), [bodyGeometry]);
  useEffect(() => () => topGeometry.dispose(), [topGeometry]);
  useEffect(
    () => () => {
      grassMaps.map.dispose();
      grassMaps.normalMap.dispose();
    },
    [grassMaps],
  );

  const [labelX, labelY] = plot.centroid ?? polygonCentroid(plot.polygon);

  const isSelected = useSelectionStore((s) => s.selectedPlotId === plot.id);
  const isHovered = useSelectionStore((s) => s.hoveredPlotId === plot.id);
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
    select(plot.id);
    useViewStore.getState().focusSelected();
  };

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(plot.id);
    document.body.style.cursor = "pointer";
  };

  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (useSelectionStore.getState().hoveredPlotId === plot.id) {
      setHovered(null);
    }
    document.body.style.cursor = "auto";
  };

  useEffect(() => {
    return () => {
      if (useSelectionStore.getState().hoveredPlotId === plot.id) {
        useSelectionStore.getState().setHovered(null);
        document.body.style.cursor = "auto";
      }
    };
  }, [plot.id]);

  const capY = depth + 0.003;
  const borderY = depth + 0.052;
  const labelY3 = depth + 0.12;

  return (
    <group
      onClick={handleClick}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      <mesh
        geometry={bodyGeometry}
        name={plot.id}
        userData={{ plotId: plot.id, plotNumber: plot.number }}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#5a7a3e" roughness={0.98} metalness={0} />
      </mesh>

      <mesh geometry={topGeometry} position={[0, capY, 0]} receiveShadow>
        <meshStandardMaterial
          ref={matRef}
          map={grassMaps.map}
          normalMap={grassMaps.normalMap}
          normalScale={new THREE.Vector2(0.18, 0.18)}
          color={COLOR_BASE}
          emissive={EMISSIVE_BASE}
          emissiveIntensity={0}
          roughness={0.9}
          metalness={0}
          polygonOffset
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
        />
        {(isHovered || isSelected) && (
          <Outlines
            thickness={isSelected ? 0.28 : 0.14}
            color={isSelected ? ACCENT : HOVER_OUTLINE}
            transparent
            opacity={isSelected ? 1 : 0.9}
          />
        )}
      </mesh>

      <PolygonBorderLoop polygon={plot.polygon} y={borderY} />

      <EdgeDimensionLabels placements={edgeLabels} surfaceY={labelY3} />

      <SurfaceSizeLabels
        x={labelX}
        siteY={labelY}
        surfaceY={labelY3 + 0.01}
        title={`${plot.number}`}
        titleSize={numberSize}
      />
    </group>
  );
}
