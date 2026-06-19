"use client";

/**
 * Palm avenue trees tight outside the residential compound wall only.
 * Skips the north wall (garden is directly beyond it). Does not wrap the garden.
 */
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { SiteData } from "@/domain/types/site";
import { ASSETS } from "@/rendering/models/assetPaths";
import {
  extractParts,
  moduleBounds,
  buildInstancedParts,
  disposeInstancedParts,
} from "@/rendering/objects/glbInstancing";

interface TreesProps {
  data: SiteData;
  modelUrl?: string;
  height?: number;
}

const Y_AXIS = new THREE.Vector3(0, 1, 0);

function rand(seed: number): number {
  const x = Math.sin(seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Outward offset (left of edge direction A→B for this CCW compound path). */
function outwardOffset(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  dist: number,
): [number, number] {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  return [(-dy / len) * dist, (dx / len) * dist];
}

export function Trees({
  data,
  modelUrl = ASSETS.avenueTree,
  height = 7,
}: TreesProps) {
  const { scene } = useGLTF(modelUrl);

  const parts = useMemo(() => extractParts(scene), [scene]);
  const box = useMemo(() => moduleBounds(parts), [parts]);

  const instanced = useMemo(() => {
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const uniform = height / (size.y || 1);
    const preMatrix = new THREE.Matrix4().makeTranslation(
      -center.x,
      -box.min.y,
      -center.z,
    );

    const wall = data.boundaries.find((b) => b.kind === "wall");
    if (!wall || wall.path.length < 2) return [];

    const path = wall.path;
    const OFFSET = 1.0;
    const STEP = 6.5;
    const pts: Array<[number, number, number]> = [];
    let seed = 0;

    const addSegment = (segIdx: number, skipEnds = 0) => {
      if (segIdx >= path.length - 1) return;
      const [ax, ay] = path[segIdx];
      const [bx, by] = path[segIdx + 1];
      const [ox, oy] = outwardOffset(ax, ay, bx, by, OFFSET);
      const len = Math.hypot(bx - ax, by - ay);
      const n = Math.max(1, Math.floor(len / STEP));
      for (let k = skipEnds; k <= n - skipEnds; k++) {
        const t = k / n;
        const px = ax + (bx - ax) * t + ox;
        const py = ay + (by - ay) * t + oy;
        // Skip trees blocking the residential entrance gate.
        if (py < 5 && px > -8 && px < 10) continue;
        pts.push([px, py, seed++]);
      }
    };

    // wall-perimeter path:
    // 0 gate→SW, 1 west-lower, 2 west-upper, 3 north (SKIP), 4 east, 5 south
    addSegment(1, 1);
    addSegment(2);
    addSegment(4);
    addSegment(5, 2);

    const placements = pts.map(([x, y, i]) => {
      const yaw = rand(i + 1) * Math.PI * 2;
      const s = uniform * (0.92 + rand(i + 11) * 0.15);
      const pos = new THREE.Vector3(x, 0, -y);
      const quat = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, yaw);
      const scale = new THREE.Vector3(s, s, s);
      return new THREE.Matrix4().compose(pos, quat, scale);
    });

    return buildInstancedParts(parts, placements, preMatrix, {
      castShadow: true,
      receiveShadow: false,
      raycast: false,
    });
  }, [parts, box, data, height]);

  useEffect(() => () => disposeInstancedParts(instanced), [instanced]);

  return (
    <group name="avenue-trees">
      {instanced.map((mesh, i) => (
        <primitive key={i} object={mesh} />
      ))}
    </group>
  );
}

useGLTF.preload(ASSETS.avenueTree);
