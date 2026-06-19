"use client";

/**
 * Instanced avenue/boundary trees for the marketing render.
 *
 * - 3 tree variants (broadleaf sphere, conical, dense round), each drawn with
 *   two InstancedMesh draw calls (trunk + canopy) sharing one transform set.
 * - Placement is ORGANIZED, not scattered: even rows down both plot-column
 *   edges plus a street avenue flanking the entrance road (gate gap skipped).
 * - Consistent scale; only a deterministic Y-rotation varies per instance.
 *
 * Rendered inside the centered site group, so a site point (x, y) maps to the
 * local position (x, height, -y).
 */
import { useMemo } from "react";
import * as THREE from "three";
import type { SiteData } from "@/domain/types/site";
import { PALETTE, TREE_CANOPIES } from "@/rendering/materials/colors";

interface InstancedTreesProps {
  data: SiteData;
}

interface Placement {
  x: number;
  y: number;
  variant: number;
}

interface Variant {
  trunk: THREE.BufferGeometry;
  canopy: THREE.BufferGeometry;
  color: string;
}

function makeVariant(spec: {
  trunkH: number;
  trunkR: number;
  kind: "sphere" | "cone";
  canR: number;
  canH?: number;
  canScaleY?: number;
  color: string;
}): Variant {
  const trunk = new THREE.CylinderGeometry(
    spec.trunkR * 0.75,
    spec.trunkR,
    spec.trunkH,
    6,
  );
  trunk.translate(0, spec.trunkH / 2, 0);

  let canopy: THREE.BufferGeometry;
  if (spec.kind === "cone") {
    const h = spec.canH ?? 3.4;
    canopy = new THREE.ConeGeometry(spec.canR, h, 8);
    canopy.translate(0, spec.trunkH + h / 2, 0);
  } else {
    const sy = spec.canScaleY ?? 1;
    canopy = new THREE.SphereGeometry(spec.canR, 10, 9);
    canopy.scale(1, sy, 1);
    canopy.translate(0, spec.trunkH + spec.canR * sy * 0.85, 0);
  }
  return { trunk, canopy, color: spec.color };
}

export function InstancedTrees({ data }: InstancedTreesProps) {
  const variants = useMemo<Variant[]>(
    () => [
      { trunkH: 2.0, trunkR: 0.2, kind: "sphere" as const, canR: 2.0, canScaleY: 1.1, color: TREE_CANOPIES[0] },
      { trunkH: 2.6, trunkR: 0.16, kind: "cone" as const, canR: 1.7, canH: 3.8, color: TREE_CANOPIES[1] },
      { trunkH: 1.8, trunkR: 0.22, kind: "sphere" as const, canR: 2.3, canScaleY: 0.95, color: TREE_CANOPIES[2] },
    ].map(makeVariant),
    [],
  );

  const trunkMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: PALETTE.treeTrunk, roughness: 1 }),
    [],
  );
  const canopyMaterials = useMemo(
    () =>
      variants.map(
        (v) => new THREE.MeshStandardMaterial({ color: v.color, roughness: 1 }),
      ),
    [variants],
  );

  const placements = useMemo<Placement[]>(() => {
    // Perimeter wall extent — trees live strictly OUTSIDE this box.
    let wMinX = Infinity;
    let wMaxX = -Infinity;
    let wMinY = Infinity;
    let wMaxY = -Infinity;
    for (const b of data.boundaries) {
      if (b.kind !== "wall") continue;
      for (const [x, y] of b.path) {
        if (x < wMinX) wMinX = x;
        if (x > wMaxX) wMaxX = x;
        if (y < wMinY) wMinY = y;
        if (y > wMaxY) wMaxY = y;
      }
    }
    if (!Number.isFinite(wMinX)) return [];

    // Garden extent (north, outside the compound) so we can frame it too.
    const garden = data.openSpaces.find((o) => o.id === "os-suda");
    let gMinX = wMinX;
    let gMaxX = wMaxX;
    let gMaxY = wMaxY;
    if (garden) {
      let mnX = Infinity;
      let mxX = -Infinity;
      let mxY = -Infinity;
      for (const [x, y] of garden.polygon) {
        if (x < mnX) mnX = x;
        if (x > mxX) mxX = x;
        if (y > mxY) mxY = y;
      }
      gMinX = mnX;
      gMaxX = mxX;
      gMaxY = mxY;
    }

    // Southernmost road edge (the external approach road).
    let roadMinY = wMinY;
    for (const r of data.roads) {
      for (const [, y] of r.polygon) if (y < roadMinY) roadMinY = y;
    }

    const list: Placement[] = [];
    const GAP = 2.6; // clear spacing outside the wall
    const STEP = 4.5;
    const westX = Math.min(wMinX, gMinX) - GAP;
    const eastX = Math.max(wMaxX, gMaxX) + GAP;

    // Outer side rows — run the full height of the layout (compound + garden),
    // entirely outside the east/west walls.
    let row = 0;
    for (let y = wMinY; y <= gMaxY; y += STEP) {
      list.push({ x: westX, y, variant: row % 3 });
      list.push({ x: eastX, y, variant: (row + 1) % 3 });
      row++;
    }

    // North row framing the SUDA garden.
    let n = 0;
    for (let x = gMinX + 2; x <= gMaxX - 2; x += STEP) {
      list.push({ x, y: gMaxY + GAP, variant: n % 3 });
      n++;
    }

    // Boulevard lining the far (south) edge of the external approach road.
    let s = 0;
    for (let x = westX; x <= eastX; x += STEP) {
      list.push({ x, y: roadMinY - 1.6, variant: (s + 2) % 3 });
      s++;
    }

    return list;
  }, [data]);

  return (
    <>
      {variants.map((v, vi) => {
        const items = placements.filter((p) => p.variant === vi);
        if (items.length === 0) return null;
        return (
          <TreeInstanceSet
            key={vi}
            trunkGeometry={v.trunk}
            canopyGeometry={v.canopy}
            trunkMaterial={trunkMaterial}
            canopyMaterial={canopyMaterials[vi]}
            items={items}
          />
        );
      })}
    </>
  );
}

function TreeInstanceSet({
  trunkGeometry,
  canopyGeometry,
  trunkMaterial,
  canopyMaterial,
  items,
}: {
  trunkGeometry: THREE.BufferGeometry;
  canopyGeometry: THREE.BufferGeometry;
  trunkMaterial: THREE.Material;
  canopyMaterial: THREE.Material;
  items: Placement[];
}) {
  const matrices = useMemo(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    const e = new THREE.Euler();
    return items.map((it) => {
      // Deterministic rotation (no randomness), unique per position.
      e.set(0, (it.x * 0.7 + it.y * 0.3) % (Math.PI * 2), 0);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(it.x, 0, -it.y), q, s);
      return m.clone();
    });
  }, [items]);

  const setRef = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    matrices.forEach((mat, i) => mesh.setMatrixAt(i, mat));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  };

  return (
    <group>
      <instancedMesh
        ref={setRef}
        args={[trunkGeometry, trunkMaterial, items.length]}
        castShadow
        receiveShadow
        raycast={() => null}
      />
      <instancedMesh
        ref={setRef}
        args={[canopyGeometry, canopyMaterial, items.length]}
        castShadow
        receiveShadow
        raycast={() => null}
      />
    </group>
  );
}
