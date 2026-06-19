import type { CardinalFacing, Plot, PolygonRing, OpenSpace } from "@/domain/types/site";
import { polygonCentroid } from "@/generation/geometry";

export interface EdgeLabelPlacement {
  text: string;
  x: number;
  y: number;
  /** Y-axis rotation (radians), already normalised for top-down readability. */
  spin: number;
  fontSize: number;
}

function bounds(ring: PolygonRing) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of ring) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, d: maxY - minY };
}

/** Keep dimension text upright when viewed from above. */
export function readableSpin(spin: number): number {
  let s = spin;
  while (s > Math.PI) s -= Math.PI * 2;
  while (s < -Math.PI) s += Math.PI * 2;
  if (s > Math.PI / 2) s -= Math.PI;
  if (s < -Math.PI / 2) s += Math.PI;
  return s;
}

function edgeSpin(x1: number, y1: number, x2: number, y2: number): number {
  return readableSpin(Math.atan2(x2 - x1, -(y2 - y1)));
}

function fontForSpan(span: number): number {
  return Math.min(0.72, Math.max(0.52, span * 0.085));
}

function insetInsideEdge(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  amount: number,
): [number, number] {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const edx = x2 - x1;
  const edy = y2 - y1;
  const len = Math.hypot(edx, edy) || 1;
  let nx = -edy / len;
  let ny = edx / len;
  if (nx * (cx - mx) + ny * (cy - my) < 0) {
    nx = -nx;
    ny = -ny;
  }
  return [mx + nx * amount, my + ny * amount];
}

/** Three clean slots — road depth + north/south frontage (presentation layout). */
function rectangularPlotSlots(plot: Plot): EdgeLabelPlacement[] {
  const dim = plot.dimensions;
  if (!dim) return [];

  const box = bounds(plot.polygon);
  const [cx, cy] = plot.centroid ?? polygonCentroid(plot.polygon);
  const margin = Math.min(1.0, Math.min(box.w, box.d) * 0.14);
  const fs = fontForSpan(Math.min(box.w, box.d));
  const facing = plot.facing ?? "E";

  const out: EdgeLabelPlacement[] = [];

  if (facing === "E") {
    if (dim.depth) {
      out.push({
        text: dim.depth,
        x: box.maxX - margin,
        y: cy,
        spin: readableSpin(Math.PI / 2),
        fontSize: fs,
      });
    }
    if (dim.back) {
      out.push({
        text: dim.back,
        x: cx,
        y: box.minY + margin,
        spin: 0,
        fontSize: fs,
      });
    }
    if (dim.front) {
      out.push({
        text: dim.front,
        x: cx,
        y: box.maxY - margin,
        spin: 0,
        fontSize: fs,
      });
    }
  } else {
    if (dim.depth) {
      out.push({
        text: dim.depth,
        x: box.minX + margin,
        y: cy,
        spin: readableSpin(Math.PI / 2),
        fontSize: fs,
      });
    }
    if (dim.front) {
      out.push({
        text: dim.front,
        x: cx,
        y: box.minY + margin,
        spin: 0,
        fontSize: fs,
      });
    }
    if (dim.back) {
      out.push({
        text: dim.back,
        x: cx,
        y: box.maxY - margin,
        spin: 0,
        fontSize: fs,
      });
    }
  }

  return out;
}

function irregularPlotEdges(plot: Plot): EdgeLabelPlacement[] {
  const ring = plot.polygon;
  const [cx, cy] = plot.centroid ?? polygonCentroid(ring);
  const box = bounds(ring);
  const out: EdgeLabelPlacement[] = [];
  const inset = Math.min(0.85, Math.min(box.w, box.d) * 0.1);

  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    const length = Math.hypot(x2 - x1, y2 - y1);
    if (length < 1.0) continue;

    const authored = plot.edgeLabels?.[i];
    if (authored === null || authored === undefined) continue;

    const [x, y] = insetInsideEdge(x1, y1, x2, y2, cx, cy, inset);

    out.push({
      text: authored,
      x,
      y,
      spin: edgeSpin(x1, y1, x2, y2),
      fontSize: fontForSpan(length),
    });
  }

  return out;
}

/** Build tidy edge-dimension placements for a plot. */
export function plotEdgePlacements(plot: Plot): EdgeLabelPlacement[] {
  if (plot.polygon.length === 4 && plot.id !== "plot-14") {
    return rectangularPlotSlots(plot);
  }
  if (plot.edgeLabels?.length) {
    return irregularPlotEdges(plot);
  }
  return rectangularPlotSlots(plot);
}

/** O.S. — two edge labels only, tucked into the notch. */
export function openSpaceEdgePlacements(openSpace: OpenSpace): EdgeLabelPlacement[] {
  const ring = openSpace.polygon;
  if (ring.length < 3) return [];

  const box = bounds(ring);
  const [cx, cy] = polygonCentroid(ring);
  const inset = 0.22;
  const fs = 0.52;
  const out: EdgeLabelPlacement[] = [];

  if (openSpace.edgeLabels?.length) {
    for (let i = 0; i < ring.length; i++) {
      const text = openSpace.edgeLabels[i];
      if (!text) continue;
      const [x1, y1] = ring[i];
      const [x2, y2] = ring[(i + 1) % ring.length];
      const [x, y] = insetInsideEdge(x1, y1, x2, y2, cx, cy, inset);
      out.push({
        text,
        x,
        y,
        spin: edgeSpin(x1, y1, x2, y2),
        fontSize: fs,
      });
    }
    return out;
  }

  const parts = openSpace.size?.split(/\s*x\s*/i).map((s) => s.trim()) ?? [];
  if (parts.length === 2) {
    out.push({
      text: parts[0],
      x: cx,
      y: box.minY + inset,
      spin: 0,
      fontSize: fs,
    });
    out.push({
      text: parts[1],
      x: box.maxX - inset,
      y: cy,
      spin: readableSpin(Math.PI / 2),
      fontSize: fs,
    });
  }

  return out;
}

/** Centre plot number size — smaller on narrow parcels so edges stay clear. */
export function plotNumberSize(width: number, depth: number): number {
  const span = Math.min(width, depth);
  if (span < 4) return 0.95;
  if (span < 6) return 1.45;
  if (span < 10) return 1.85;
  if (span < 14) return 2.15;
  return 2.45;
}
