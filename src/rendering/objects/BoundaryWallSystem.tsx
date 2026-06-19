"use client";

/**
 * BoundaryWallSystem
 * ------------------
 * Builds a continuous compound wall around the site by tiling a GLB wall
 * module along every edge of a boundary polygon.
 *
 *  - Loads the wall segment with `useGLTF` (any number of meshes / materials).
 *  - Reads the boundary path (open or closed, regular or irregular).
 *  - Splits each edge into a whole number of slots and tiles the module so
 *    edges fill exactly end-to-end (no gaps, no overhang).
 *  - Rotates every module to face along its edge direction.
 *  - Drops a square pilaster at each interior corner so mitres close cleanly.
 *  - Renders with InstancedMesh (one per source mesh) for performance.
 *  - Height + spacing (and thickness) are configurable; spacing defaults to the
 *    module's natural length so copies are never distorted.
 *
 * Coordinate mapping (shared across the renderer): site (x, y) -> world (x, h, -y).
 */
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { Boundary } from "@/domain/types/site";
import { ASSETS } from "@/rendering/models/assetPaths";
import {
  extractParts,
  moduleBounds,
  buildInstancedParts,
  disposeInstancedParts,
} from "@/rendering/objects/glbInstancing";

interface BoundaryWallSystemProps {
  boundary: Boundary;
  modelUrl?: string;
  /** Target wall height in world units (defaults to boundary.height ?? 2.4). */
  height?: number;
  /** Target module length in world units (defaults to the model's natural length). */
  spacing?: number;
  /** Target wall thickness in world units (defaults to proportional scaling). */
  thickness?: number;
}

const DEFAULT_MODEL = ASSETS.wall;
const X_AXIS = new THREE.Vector3(1, 0, 0);

export function BoundaryWallSystem({
  boundary,
  modelUrl = DEFAULT_MODEL,
  height,
  spacing,
  thickness,
}: BoundaryWallSystemProps) {
  const { scene } = useGLTF(modelUrl);

  const parts = useMemo(() => extractParts(scene), [scene]);
  const box = useMemo(() => moduleBounds(parts), [parts]);

  const instanced = useMemo(() => {
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const longAxisIsX = size.x >= size.z;
    const moduleLength = Math.max(size.x, size.z) || 1;
    const moduleThickness = Math.min(size.x, size.z) || 0.2;
    const moduleHeight = size.y || 1;

    const targetHeight = height ?? boundary.height ?? 2.4;
    const uniformScale = targetHeight / moduleHeight;
    const slotTarget = spacing ?? moduleLength * uniformScale;
    const zScale = thickness != null ? thickness / moduleThickness : uniformScale;

    // Normalize the module: recenter horizontally, sit base on the ground,
    // and rotate so its long axis runs along +X.
    const recenter = new THREE.Matrix4().makeTranslation(
      -center.x,
      -box.min.y,
      -center.z,
    );
    const align = longAxisIsX
      ? new THREE.Matrix4()
      : new THREE.Matrix4().makeRotationY(Math.PI / 2);
    const preMatrix = new THREE.Matrix4().multiplyMatrices(align, recenter);

    const placements: THREE.Matrix4[] = [];
    const pts = boundary.path;
    const n = pts.length;
    const edgeCount = boundary.closed ? n : n - 1;

    // --- Tile each edge -----------------------------------------------------
    for (let i = 0; i < edgeCount; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % n];

      const a = new THREE.Vector3(ax, 0, -ay);
      const b = new THREE.Vector3(bx, 0, -by);
      const edge = new THREE.Vector3().subVectors(b, a);
      const edgeLen = edge.length();
      if (edgeLen < 1e-6) continue;

      const dir = edge.clone().normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(X_AXIS, dir);

      const slots = Math.max(1, Math.round(edgeLen / slotTarget));
      const slotLen = edgeLen / slots;
      const scale = new THREE.Vector3(slotLen / moduleLength, uniformScale, zScale);

      for (let k = 0; k < slots; k++) {
        const t = (k + 0.5) * slotLen;
        const pos = a.clone().addScaledVector(dir, t);
        placements.push(new THREE.Matrix4().compose(pos, quat, scale));
      }
    }

    // --- Corner pilasters ---------------------------------------------------
    // Closed paths: every vertex. Open paths: only the interior vertices
    // (the two end points are the gate opening, left free).
    const wallThickness = moduleThickness * zScale;
    const cornerScale = new THREE.Vector3(
      (wallThickness * 1.06) / moduleLength,
      uniformScale,
      zScale * 1.06,
    );
    const identity = new THREE.Quaternion();
    const cornerStart = boundary.closed ? 0 : 1;
    const cornerEnd = boundary.closed ? n : n - 1;
    for (let i = cornerStart; i < cornerEnd; i++) {
      const [vx, vy] = pts[i];
      const pos = new THREE.Vector3(vx, 0, -vy);
      placements.push(new THREE.Matrix4().compose(pos, identity, cornerScale));
    }

    return buildInstancedParts(parts, placements, preMatrix, {
      castShadow: true,
      receiveShadow: true,
      raycast: false,
    });
  }, [parts, box, boundary, height, spacing, thickness]);

  useEffect(() => () => disposeInstancedParts(instanced), [instanced]);

  return (
    <group name={`${boundary.id}-wall`}>
      {instanced.map((mesh, i) => (
        <primitive key={i} object={mesh} />
      ))}
    </group>
  );
}

useGLTF.preload(DEFAULT_MODEL);
