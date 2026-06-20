import type { PolygonRing } from "@/domain/types/site";
import type { Placement2D } from "@/rendering/objects/GlbModel";

/** Axis-aligned path slab in site coords (mapped to world in GardenArea). */
export interface PathSlab {
  cx: number;
  cy: number;
  w: number;
  d: number;
}

export interface GardenNorthLayout {
  cx: number;
  cy: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  W: number;
  D: number;
  pathW: number;
  fountainR: number;
  /** Grass cut-out + plaza disc around the central fountain. */
  fountainPadR: number;
  inset: number;
  loopHalfW: number;
  loopHalfD: number;
  paths: PathSlab[];
  benches: Placement2D[];
  lamps: Placement2D[];
  pots: Placement2D[];
  bushes: Placement2D[];
  trees: Placement2D[];
  flowerBeds: Placement2D[];
}

export interface GardenEastLayout {
  wallX: number;
  eastX: number;
  roadY: number;
  joinY: number;
  pathCx: number;
  pathW: number;
  paths: PathSlab[];
  benches: Placement2D[];
  lamps: Placement2D[];
  pots: Placement2D[];
  bushes: Placement2D[];
  palms: Placement2D[];
  trees: Placement2D[];
  flowerBeds: Placement2D[];
}

export interface GardenLayout {
  north: GardenNorthLayout;
  east: GardenEastLayout;
  footprintW: number;
  footprintD: number;
}

const NORTH = {
  minX: -11.278,
  maxX: 20.117,
  lawnEastX: 27.4,
  minY: 34.265,
  maxY: 58.265,
} as const;

const EAST = {
  wallX: 20.117,
  eastX: 27.4,
  roadY: 0.96,
  joinY: 34.265,
} as const;

function offset(x: number, y: number, dx: number, dy: number, rot?: number): Placement2D {
  return { x: x + dx, y: y + dy, rotationY: rot ?? Math.atan2(dx, dy) };
}

/** Mirror a placement across both axes through (cx, cy) — 4-way symmetry. */
function quad(
  cx: number,
  cy: number,
  ox: number,
  oy: number,
  rot = 0,
  scale = 1,
): Placement2D[] {
  const mk = (x: number, y: number, r: number): Placement2D => ({
    x,
    y,
    rotationY: r,
    scale,
  });
  return [
    mk(cx + ox, cy + oy, rot),
    mk(cx - ox, cy + oy, Math.PI - rot),
    mk(cx + ox, cy - oy, -rot),
    mk(cx - ox, cy - oy, Math.PI + rot),
  ];
}

/** Mirror across the vertical axis through cx. */
function pairX(cx: number, ox: number, y: number, rot = 0, scale = 1): Placement2D[] {
  return [
    { x: cx + ox, y, rotationY: rot, scale },
    { x: cx - ox, y, rotationY: Math.PI - rot, scale },
  ];
}

function buildNorthLayout(pathCx: number, pathW: number): GardenNorthLayout {
  const { minX, maxX, lawnEastX, minY, maxY } = NORTH;
  const W = maxX - minX;
  const D = maxY - minY;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const pw = Math.min(W, D) * 0.085;
  const fountainR = Math.min(W, D) * 0.095;
  const fountainPadR = fountainR * 1.55 + pw * 0.35;
  const inset = Math.min(W, D) * 0.1;
  const loopHalfW = W / 2 - inset;
  const loopHalfD = D / 2 - inset;
  const southLoopY = cy - loopHalfD;
  const innerMinX = minX + inset / 2;
  const innerMaxX = maxX - inset / 2;
  const innerMinY = minY + inset / 2;
  const innerMaxY = maxY - inset / 2;

  // Clearances from fountain plaza and path slabs (metres).
  const benchDist = fountainPadR + pw * 0.5 + 1.35;
  const bushInnerX = 5.4;
  const bushInnerY = 4.4;
  const flowerX = 7.6;
  const flowerY = 5.9;
  const loopCornerX = loopHalfW - 1.85;
  const loopCornerY = loopHalfD - 1.75;
  const edgeInset = 2.6;
  const edgeX = W / 2 - edgeInset;
  const treeX = W / 2 - 3.5;
  const potSpread = (W - inset * 2) / 6;

  return {
    cx,
    cy,
    minX,
    minY,
    maxX,
    maxY,
    W,
    D,
    pathW: pw,
    fountainR,
    fountainPadR,
    inset,
    loopHalfW,
    loopHalfD,
    paths: [
      // Main cross — split around the central fountain plaza.
      { cx: (innerMinX + cx - fountainPadR) / 2, cy, w: cx - fountainPadR - innerMinX, d: pw },
      { cx: (innerMaxX + cx + fountainPadR) / 2, cy, w: innerMaxX - (cx + fountainPadR), d: pw },
      { cx, cy: (innerMinY + cy - fountainPadR) / 2, w: pw, d: cy - fountainPadR - innerMinY },
      { cx, cy: (innerMaxY + cy + fountainPadR) / 2, w: pw, d: innerMaxY - (cy + fountainPadR) },
      { cx, cy: southLoopY, w: loopHalfW * 2, d: pw },
      { cx, cy: cy + loopHalfD, w: loopHalfW * 2, d: pw },
      { cx: cx - loopHalfW, cy, w: pw, d: loopHalfD * 2 },
      { cx: cx + loopHalfW, cy, w: pw, d: loopHalfD * 2 },
      // Bridge east loop to the boulevard spine (joins the two gardens).
      {
        cx: (maxX + pathCx) / 2,
        cy: southLoopY,
        w: pathCx - maxX - 0.35,
        d: pw,
      },
      // Northeast lawn wing — path along east edge up to the north boundary.
      {
        cx: pathCx,
        cy: (southLoopY + maxY) / 2,
        w: pw,
        d: maxY - southLoopY - inset,
      },
    ],
    benches: [
      { x: cx, y: cy - benchDist, rotationY: 0, scale: 1 },
      { x: cx, y: cy + benchDist, rotationY: Math.PI, scale: 1 },
      { x: cx - benchDist, y: cy, rotationY: Math.PI / 2, scale: 1 },
      { x: cx + benchDist, y: cy, rotationY: -Math.PI / 2, scale: 1 },
    ],
    lamps: [
      ...quad(cx, cy, loopHalfW + 0.55, loopHalfD + 0.45, 0, 1),
      ...pairX(cx, loopHalfW + 0.55, cy, Math.PI / 2, 1),
      { x: cx, y: cy - loopHalfD - 0.55, rotationY: 0, scale: 1 },
      { x: cx, y: cy + loopHalfD + 0.55, rotationY: Math.PI, scale: 1 },
    ],
    pots: [
      ...quad(cx, cy, loopCornerX, loopCornerY, Math.PI / 4, 1),
      ...pairX(cx, potSpread, minY + edgeInset, 0, 0.96),
      { x: cx, y: minY + edgeInset, rotationY: Math.PI / 2, scale: 1.0 },
    ],
    bushes: [
      ...quad(cx, cy, bushInnerX, bushInnerY, 0.4, 1.35),
      ...quad(cx, cy, loopCornerX - 0.9, loopCornerY - 0.85, 0.8, 1.3),
      ...pairX(cx, edgeX, minY + edgeInset, 0.5, 1.28),
      ...pairX(cx, edgeX, maxY - edgeInset, 2.1, 1.28),
    ],
    trees: [
      ...pairX(cx, treeX, maxY - 3, 0.5, 1.0),
      ...pairX(cx, treeX, minY + 5.5, 1.1, 0.92),
    ],
    flowerBeds: quad(cx, cy, flowerX, flowerY, 0.2, 1.0),
  };
}

function buildEastLayout(
  north: GardenNorthLayout,
  pathCx: number,
  pathW: number,
): GardenEastLayout {
  const { wallX, eastX, roadY, joinY } = EAST;
  const { maxY } = NORTH;
  const southLoopY = north.cy - north.loopHalfD;
  const spineLen = maxY - roadY - 2.5;
  const spineCy = roadY + 1.2 + spineLen / 2;
  const stripHalf = (eastX - wallX) / 2 - 1.1;
  const benchOffset = pathW * 0.5 + 1.45;

  const lamps: Placement2D[] = [];
  const pots: Placement2D[] = [];
  const bushes: Placement2D[] = [];
  const benches: Placement2D[] = [];
  const crossPaths: PathSlab[] = [];
  const step = 7.5;
  let n = 0;
  for (let y = roadY + 4.5; y <= maxY - 3; y += step) {
    lamps.push(
      { x: wallX + 1.35, y, rotationY: Math.PI / 2, scale: 1 },
      { x: eastX - 1.35, y, rotationY: -Math.PI / 2, scale: 1 },
    );
    if (y < maxY - 5) {
      pots.push(
        { x: pathCx - stripHalf * 0.55, y: y + 0.6, rotationY: n * 0.5, scale: 0.98 },
        { x: pathCx + stripHalf * 0.55, y: y + 0.6, rotationY: n * 0.5 + Math.PI, scale: 0.98 },
      );
    }
    if (y <= joinY + 6 && y < southLoopY - 4) {
      bushes.push(
        { x: pathCx - stripHalf * 0.62, y, rotationY: n * 0.4, scale: 1.3 },
        { x: pathCx + stripHalf * 0.62, y, rotationY: n * 0.4 + Math.PI, scale: 1.3 },
      );
    }
    if (y >= roadY + 10 && y <= roadY + 28) {
      benches.push(
        { x: pathCx - benchOffset, y, rotationY: Math.PI / 2, scale: 1 },
        { x: pathCx + benchOffset, y, rotationY: -Math.PI / 2, scale: 1 },
      );
    }
    n++;
  }

  // Cross paths divide the east strip into lawn panels like the north plaza.
  const stripW = eastX - wallX;
  for (let y = roadY + 8; y < maxY - 4; y += 8.5) {
    crossPaths.push({
      cx: (wallX + eastX) / 2,
      cy: y,
      w: stripW - 1.35,
      d: pathW,
    });
  }

  return {
    wallX,
    eastX,
    roadY,
    joinY,
    pathCx,
    pathW,
    paths: [
      // One continuous boulevard spine from main road to north garden.
      { cx: pathCx, cy: spineCy, w: pathW, d: spineLen },
      { cx: (wallX + eastX) / 2, cy: roadY + 2.4, w: eastX - wallX - 1.2, d: pathW * 1.35 },
      // Junction plaza slab where boulevard meets the north loop bridge.
      { cx: pathCx, cy: southLoopY, w: pathW * 2.6, d: pathW * 1.8 },
      ...crossPaths,
    ],
    benches,
    lamps,
    pots,
    bushes: [
      ...bushes,
      offset(wallX + 1.8, roadY + 2.2, 0, 0.9, 0),
      offset(eastX - 1.8, roadY + 2.2, 0, 0.9, Math.PI),
    ],
    palms: [],
    trees: pairX(pathCx, stripHalf * 0.55, southLoopY + 3, 2.5, 1.0),
    flowerBeds: [
      offset(wallX + 2.8, roadY + 2.6, 0, 0, 0.3),
      offset(eastX - 2.8, roadY + 2.6, 0, 0, -0.3),
      { x: pathCx, y: roadY + 14, rotationY: 0, scale: 1.05 },
      { x: pathCx, y: roadY + 23, rotationY: Math.PI / 2, scale: 1.0 },
    ],
  };
}

export function buildGardenLayout(_polygon: PolygonRing): GardenLayout {
  const pathCx = EAST.wallX + (EAST.eastX - EAST.wallX) * 0.52;
  const pathW = 1.55;
  const north = buildNorthLayout(pathCx, pathW);
  const east = buildEastLayout(north, pathCx, pathW);
  const footprintW = NORTH.lawnEastX - NORTH.minX;
  const footprintD = NORTH.maxY - EAST.roadY;
  return { north, east, footprintW, footprintD };
}
