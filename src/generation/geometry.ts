/**
 * Pure geometry helpers: 2D site coordinates -> Three.js shapes + site extent.
 *
 * Coordinate mapping used across the renderer:
 *   site (x, y)  ->  world (x, height, -y)
 * Shapes are authored in the XY plane and the meshes rotate -90deg about X,
 * which turns the shape plane into the ground (XZ) and the extrude axis into
 * world up (+Y). This module stays framework-free except for `three`.
 */
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Point2D, PolygonRing, SiteData } from "@/domain/types/site";

/** Build a closed THREE.Shape from a 2D polygon ring (implicitly closed). */
export function shapeFromPolygon(ring: PolygonRing): THREE.Shape {
  const shape = new THREE.Shape();
  ring.forEach(([x, y], i) => {
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  return shape;
}

/** Circular hole for grass cut-outs (clockwise winding for THREE.Shape holes). */
export function circleHolePath(
  cx: number,
  cy: number,
  radius: number,
  segments = 40,
): THREE.Path {
  const path = new THREE.Path();
  for (let i = 0; i <= segments; i++) {
    const theta = (-i / segments) * Math.PI * 2;
    const x = cx + Math.cos(theta) * radius;
    const y = cy + Math.sin(theta) * radius;
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  return path;
}

/**
 * Flat ground cap with optional circular holes (e.g. fountain plaza cut-outs).
 */
export function createGroundCapGeometryWithHoles(
  ring: PolygonRing,
  holes: Array<{ cx: number; cy: number; r: number }>,
  uv?: (geo: THREE.BufferGeometry) => void,
): THREE.BufferGeometry {
  const shape = shapeFromPolygon(ring);
  for (const hole of holes) {
    shape.holes.push(circleHolePath(hole.cx, hole.cy, hole.r));
  }
  const shaped = new THREE.ShapeGeometry(shape);
  shaped.rotateX(-Math.PI / 2);
  const geo = mergeVertices(shaped);
  geo.computeVertexNormals();
  uv?.(geo);
  return geo;
}

/**
 * Flat ground-facing cap geometry with welded vertices so internal
 * triangulation edges do not show as shading seams on the surface.
 */
export function createGroundCapGeometry(
  ring: PolygonRing,
  uv?: (geo: THREE.BufferGeometry) => void,
): THREE.BufferGeometry {
  const shaped = new THREE.ShapeGeometry(shapeFromPolygon(ring));
  shaped.rotateX(-Math.PI / 2);
  const geo = mergeVertices(shaped);
  geo.computeVertexNormals();
  uv?.(geo);
  return geo;
}

/** Closed perimeter polyline for parcel borders (no internal diagonals). */
export function polygonBorderGeometry(
  ring: PolygonRing,
  y: number,
): THREE.BufferGeometry {
  const pts = ring.map(([x, sy]) => new THREE.Vector3(x, y, -sy));
  return new THREE.BufferGeometry().setFromPoints(pts);
}

export interface SiteBounds {
  min: Point2D;
  max: Point2D;
  /** Geometric center of the extent, in site units. */
  center: Point2D;
  /** [width, depth] of the extent, in site units. */
  size: [number, number];
}

/**
 * Compute the axis-aligned extent of every piece of geometry in the site.
 * Used to center the layout at the origin and to fit the camera.
 */
export function getSiteBounds(site: SiteData): SiteBounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const visit = ([x, y]: Point2D) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };

  site.plots.forEach((p) => p.polygon.forEach(visit));
  site.roads.forEach((r) => r.polygon.forEach(visit));
  site.openSpaces.forEach((o) => o.polygon.forEach(visit));
  site.boundaries.forEach((b) => b.path.forEach(visit));
  site.trees.forEach((t) => visit(t.position));

  // Fall back to authored bounds (or a unit box) if there is no geometry.
  if (!Number.isFinite(minX)) {
    if (site.metadata.bounds) {
      [minX, minY, maxX, maxY] = site.metadata.bounds;
    } else {
      minX = minY = 0;
      maxX = maxY = 1;
    }
  }

  return {
    min: [minX, minY],
    max: [maxX, maxY],
    center: [(minX + maxX) / 2, (minY + maxY) / 2],
    size: [maxX - minX, maxY - minY],
  };
}

/** Polygon centroid (shoelace) in site units; used when not precomputed. */
export function polygonCentroid(ring: PolygonRing): Point2D {
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  if (Math.abs(twiceArea) < 1e-9) return ring[0];
  const f = 1 / (3 * twiceArea);
  return [cx * f, cy * f];
}

const EDGE_KEY_SCALE = 1000;

/** Canonical undirected edge id for 2D parcel rings (1 mm site precision). */
export function polygonEdgeKey(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const r = (n: number) => Math.round(n * EDGE_KEY_SCALE) / EDGE_KEY_SCALE;
  const a = `${r(x1)},${r(y1)}`;
  const b = `${r(x2)},${r(y2)}`;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * Plot-to-plot divider edges only — each shared internal edge is owned by one
 * plot so the black strip is not drawn on road / wall / O.S. perimeters.
 */
export function buildPlotDividerEdges(
  plots: { id: string; polygon: PolygonRing }[],
): Map<string, Set<string>> {
  const edgePlots = new Map<string, string[]>();

  for (const plot of plots) {
    const ring = plot.polygon;
    for (let i = 0; i < ring.length; i++) {
      const [x1, y1] = ring[i];
      const [x2, y2] = ring[(i + 1) % ring.length];
      const key = polygonEdgeKey(x1, y1, x2, y2);
      const list = edgePlots.get(key);
      if (list) list.push(plot.id);
      else edgePlots.set(key, [plot.id]);
    }
  }

  const perPlot = new Map<string, Set<string>>();
  for (const plot of plots) perPlot.set(plot.id, new Set());

  for (const [key, ids] of edgePlots) {
    if (ids.length < 2) continue;
    const owner = [...ids].sort()[0];
    perPlot.get(owner)!.add(key);
  }

  return perPlot;
}
