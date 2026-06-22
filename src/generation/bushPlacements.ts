import type { Plot, Point2D, Road, SiteData } from "@/domain/types/site";
import { polygonCentroid } from "@/generation/geometry";
import type { Placement2D } from "@/rendering/objects/GlbModel";

const ROAD_WEST = 0;
const ROAD_EAST = 6.706;
const ROAD_TOL = 0.08;
const INSET = 0.52;

function rand(seed: number): number {
  const x = Math.sin(seed * 91.17) * 43758.5453;
  return x - Math.floor(x);
}

function isInternalRoadVertex(x: number, y: number, roads: Road[]): boolean {
  for (const road of roads) {
    if (road.id !== "road-internal-1") continue;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const [rx, ry] of road.polygon) {
      if (rx < minX) minX = rx;
      if (rx > maxX) maxX = rx;
      if (ry < minY) minY = ry;
      if (ry > maxY) maxY = ry;
    }
    const onWest = Math.abs(x - ROAD_WEST) < ROAD_TOL;
    const onEast = Math.abs(x - ROAD_EAST) < ROAD_TOL;
    if (!onWest && !onEast) continue;
    if (y < minY - ROAD_TOL || y > maxY + ROAD_TOL) continue;
    return true;
  }
  return false;
}

/** True when two edges meeting at the vertex are axis-aligned (plot divider ∩ road line). */
function isDividerRoadCorner(
  prev: Point2D,
  vertex: Point2D,
  next: Point2D,
): boolean {
  const [vx, vy] = vertex;
  const [px, py] = prev;
  const [nx, ny] = next;

  const onRoadX =
    Math.abs(vx - ROAD_WEST) < ROAD_TOL || Math.abs(vx - ROAD_EAST) < ROAD_TOL;
  if (!onRoadX) return false;

  const e1h = Math.abs(px - vx) > Math.abs(py - vy);
  const e2h = Math.abs(nx - vx) > Math.abs(ny - vy);
  return e1h !== e2h;
}

function insetFromCorner(
  vertex: Point2D,
  plot: Plot,
): Point2D {
  const [vx, vy] = vertex;
  const [cx] = plot.centroid ?? polygonCentroid(plot.polygon);

  if (Math.abs(vx - ROAD_WEST) < ROAD_TOL) {
    return [vx - (cx < vx ? INSET : -INSET), vy];
  }
  return [vx + (cx > vx ? INSET : -INSET), vy];
}

/**
 * One bush per plot corner where a straight divider meets the internal road.
 * Nothing is placed on the asphalt itself.
 */
export function bushPlacements(data: SiteData): Placement2D[] {
  const out: Placement2D[] = [];
  const seen = new Set<string>();
  let seed = 0;

  for (const plot of data.plots) {
    const ring = plot.polygon;
    for (let i = 0; i < ring.length; i++) {
      const prev = ring[(i - 1 + ring.length) % ring.length];
      const vertex = ring[i];
      const next = ring[(i + 1) % ring.length];
      const [vx, vy] = vertex;

      if (!isInternalRoadVertex(vx, vy, data.roads)) continue;
      if (!isDividerRoadCorner(prev, vertex, next)) continue;
      if (vy < 1.2) continue;
      // No bushes at the north wall junction (plots 7 & 8).
      if (
        (plot.id === "plot-07" || plot.id === "plot-08") &&
        vy > 33.5
      ) {
        continue;
      }

      const key = `${vx.toFixed(2)},${vy.toFixed(2)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const [x, y] = insetFromCorner(vertex, plot);
      out.push({
        x,
        y,
        rotationY: rand(seed + 1) * Math.PI * 2,
        scale: 0.88 + rand(seed + 2) * 0.18,
      });
      seed += 3;
    }
  }

  return out;
}
