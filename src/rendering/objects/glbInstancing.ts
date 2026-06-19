/**
 * Shared helpers for instancing loaded GLB models.
 *
 * A GLB "module" (a wall segment, a grass patch, …) is usually a small node
 * tree containing one or more meshes, each with its own local transform and
 * material. To render many copies efficiently we:
 *
 *   1. flatten the module into a list of { geometry, material, matrix } parts,
 *   2. compute the module's combined bounding box (in module-root space),
 *   3. build one THREE.InstancedMesh PER part, sharing the same set of
 *      per-instance placement matrices.
 *
 * The final matrix for instance `i` of a part is:
 *      placement[i] · preMatrix · partMatrix
 * where `partMatrix` lifts the part into module-root space, `preMatrix`
 * normalizes the module (recenter + sit-on-ground + axis align) and
 * `placement[i]` positions/rotates/scales the normalized module in the world.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export interface ModulePart {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  /** Mesh transform relative to the module root (gltf scene). */
  matrix: THREE.Matrix4;
}

const KEEP_ATTRS = ["position", "normal", "uv"];

/**
 * Normalize a geometry so a batch of them can be merged: keep only
 * position/normal/uv, fill in any missing normal/uv, and drop the index so
 * every geometry in a group is non-indexed (a requirement of mergeGeometries).
 */
function normalizeForMerge(geo: THREE.BufferGeometry): THREE.BufferGeometry | null {
  if (!geo.attributes.position) return null;
  let g = geo;
  if (!g.attributes.normal) g.computeVertexNormals();
  if (!g.attributes.uv) {
    const n = g.attributes.position.count;
    g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  }
  for (const name of Object.keys(g.attributes)) {
    if (!KEEP_ATTRS.includes(name)) g.deleteAttribute(name);
  }
  if (g.index) g = g.toNonIndexed();
  return g;
}

/**
 * Flatten a loaded gltf scene into a SMALL number of instanceable parts by
 * baking each mesh's world transform into its geometry and merging all
 * geometries that share a material into one. This is essential for models
 * authored as thousands of tiny meshes (e.g. a grass patch = one mesh/blade):
 * without merging we'd create thousands of InstancedMeshes and stall the GPU.
 *
 * Returned parts carry an identity matrix (transforms are already baked).
 */
export function extractParts(root: THREE.Object3D): ModulePart[] {
  root.updateMatrixWorld(true);

  const groups = new Map<
    string,
    { material: THREE.Material | THREE.Material[]; geoms: THREE.BufferGeometry[] }
  >();

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const baked = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
    const norm = normalizeForMerge(baked);
    if (!norm) return;
    const key = (material as THREE.Material).uuid ?? "default";
    let group = groups.get(key);
    if (!group) {
      group = { material, geoms: [] };
      groups.set(key, group);
    }
    group.geoms.push(norm);
  });

  const parts: ModulePart[] = [];
  for (const { material, geoms } of groups.values()) {
    const merged =
      geoms.length === 1 ? geoms[0] : mergeGeometries(geoms, false);
    if (!merged) continue;
    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    parts.push({ geometry: merged, material, matrix: new THREE.Matrix4() });
    if (geoms.length > 1) geoms.forEach((g) => g.dispose());
  }
  return parts;
}

/** Union bounding box of every part, expressed in module-root space. */
export function moduleBounds(parts: ModulePart[]): THREE.Box3 {
  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  for (const part of parts) {
    if (!part.geometry.boundingBox) part.geometry.computeBoundingBox();
    tmp.copy(part.geometry.boundingBox!).applyMatrix4(part.matrix);
    box.union(tmp);
  }
  if (box.isEmpty()) box.set(new THREE.Vector3(-0.5, 0, -0.5), new THREE.Vector3(0.5, 1, 0.5));
  return box;
}

/**
 * Build one InstancedMesh per part. `placements` are world-space matrices for
 * the normalized module; `preMatrix` normalizes the raw module first.
 */
export function buildInstancedParts(
  parts: ModulePart[],
  placements: THREE.Matrix4[],
  preMatrix: THREE.Matrix4,
  opts: { castShadow?: boolean; receiveShadow?: boolean; raycast?: boolean } = {},
): THREE.InstancedMesh[] {
  const meshes: THREE.InstancedMesh[] = [];
  const m = new THREE.Matrix4();
  for (const part of parts) {
    const inst = new THREE.InstancedMesh(
      part.geometry,
      part.material,
      placements.length,
    );
    const base = preMatrix.clone().multiply(part.matrix); // preMatrix · partMatrix
    for (let i = 0; i < placements.length; i++) {
      m.multiplyMatrices(placements[i], base);
      inst.setMatrixAt(i, m);
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.castShadow = opts.castShadow ?? true;
    inst.receiveShadow = opts.receiveShadow ?? true;
    inst.frustumCulled = false;
    inst.computeBoundingSphere();
    if (opts.raycast === false) inst.raycast = () => null;
    meshes.push(inst);
  }
  return meshes;
}

/** Free GPU resources for instanced meshes (geometry/material are shared). */
export function disposeInstancedParts(meshes: THREE.InstancedMesh[]): void {
  for (const mesh of meshes) mesh.dispose();
}
