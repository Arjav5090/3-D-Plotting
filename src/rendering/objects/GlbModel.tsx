"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import {
  extractParts,
  moduleBounds,
  buildInstancedParts,
  disposeInstancedParts,
} from "@/rendering/objects/glbInstancing";

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const noRaycast = () => null;

export interface Placement2D {
  x: number;
  y: number;
  rotationY?: number;
  scale?: number;
}

interface GlbPropProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** Uniform scale after grounding. */
  scale?: number;
  /** Scale so the model's height matches this value (metres). */
  targetHeight?: number;
  /** Scale so max(XZ) footprint matches this value (metres). */
  targetFootprint?: number;
}

/** Ground a cloned GLB scene: centre XZ, sit on Y=0, optional scale. */
function prepareClone(
  scene: THREE.Object3D,
  opts: { targetHeight?: number; targetFootprint?: number; scale?: number },
): THREE.Object3D {
  const clone = scene.clone(true);
  clone.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(clone);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  clone.position.x -= center.x;
  clone.position.z -= center.z;
  clone.position.y -= box.min.y;

  let s = opts.scale ?? 1;
  if (opts.targetHeight && size.y > 0) s = opts.targetHeight / size.y;
  if (opts.targetFootprint) {
    const fp = Math.max(size.x, size.z) || 1;
    s = opts.targetFootprint / fp;
  }
  if (s !== 1) clone.scale.setScalar(s);

  clone.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.raycast = noRaycast;
    }
  });
  return clone;
}

/** Single placed GLB prop. site (x,y) -> pass world position (x, h, -y). */
export function GlbProp({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale,
  targetHeight,
  targetFootprint,
}: GlbPropProps) {
  const { scene } = useGLTF(url);
  const object = useMemo(
    () => prepareClone(scene, { scale, targetHeight, targetFootprint }),
    [scene, scale, targetHeight, targetFootprint],
  );
  return (
    <primitive
      object={object}
      position={position}
      rotation={rotation}
      raycast={noRaycast}
    />
  );
}

interface InstancedGlbProps {
  url: string;
  placements: Placement2D[];
  targetHeight?: number;
  targetFootprint?: number;
}

/**
 * Many copies of one GLB via InstancedMesh (merged geometry per material).
 * Each placement uses site (x, y) mapped to world (x, 0, -y).
 */
export function InstancedGlb({
  url,
  placements,
  targetHeight,
  targetFootprint,
}: InstancedGlbProps) {
  const { scene } = useGLTF(url);
  const parts = useMemo(() => extractParts(scene), [scene]);
  const box = useMemo(() => moduleBounds(parts), [parts]);

  const instanced = useMemo(() => {
    if (placements.length === 0) return [];
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    let uniform = 1;
    if (targetHeight && size.y > 0) uniform = targetHeight / size.y;
    if (targetFootprint) {
      const fp = Math.max(size.x, size.z) || 1;
      uniform = targetFootprint / fp;
    }

    const preMatrix = new THREE.Matrix4().makeTranslation(
      -center.x,
      -box.min.y,
      -center.z,
    );

    const matrices: THREE.Matrix4[] = placements.map((p) => {
      const s = uniform * (p.scale ?? 1);
      const pos = new THREE.Vector3(p.x, 0, -p.y);
      const quat = new THREE.Quaternion().setFromAxisAngle(
        Y_AXIS,
        p.rotationY ?? 0,
      );
      const scale = new THREE.Vector3(s, s, s);
      return new THREE.Matrix4().compose(pos, quat, scale);
    });

    return buildInstancedParts(parts, matrices, preMatrix, {
      castShadow: true,
      receiveShadow: true,
      raycast: false,
    });
  }, [parts, box, placements, targetHeight, targetFootprint]);

  useEffect(() => () => disposeInstancedParts(instanced), [instanced]);

  return (
    <group>
      {instanced.map((mesh, i) => (
        <primitive key={i} object={mesh} />
      ))}
    </group>
  );
}
