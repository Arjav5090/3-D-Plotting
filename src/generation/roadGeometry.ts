import type { Boundary, PolygonRing, Road } from "@/domain/types/site";

export const MAIN_ROAD_WEST = -32;
export const MAIN_ROAD_EAST = 34;
export const MAIN_ROAD_SOUTH = -26;
const LEGACY_MAIN_ROAD_NORTH = -1.5;
const WALL_OVERLAP = 0.15;
const CAR_HALF = 2.2;

/** Inner cruise limits — cars stay fully on asphalt when looping. */
export const MAIN_ROAD_DRIVE_WEST = MAIN_ROAD_WEST + CAR_HALF;
export const MAIN_ROAD_DRIVE_EAST = MAIN_ROAD_EAST - CAR_HALF;
export const MAIN_ROAD_LANE_A_Y = -8;
export const MAIN_ROAD_LANE_B_Y = -16;

/** Full 18 M road footprint flush to the compound south wall / gate. */
export function extendedMainRoadPolygon(
  road: Road,
  wall?: Boundary,
  gate?: Boundary,
): PolygonRing {
  if (road.id !== "road-main-1") return road.polygon;

  let gateWest: [number, number] = [0, 0];
  let gateEast: [number, number] = [6.706, 0];
  let wallEast: [number, number] = [20.117, 0.813];

  if (gate && gate.path.length >= 2) {
    const [a, b] = gate.path;
    gateWest = a[0] < b[0] ? a : b;
    gateEast = a[0] < b[0] ? b : a;
  }

  if (wall) {
    for (let i = 0; i < wall.path.length - 1; i++) {
      const a = wall.path[i];
      const b = wall.path[i + 1];
      const hasGateEast =
        (Math.abs(a[0] - gateEast[0]) < 0.01 && b[0] > gateEast[0]) ||
        (Math.abs(b[0] - gateEast[0]) < 0.01 && a[0] > gateEast[0]);
      if (hasGateEast) wallEast = a[0] > b[0] ? a : b;
    }
  }

  let westX = MAIN_ROAD_WEST;
  let eastX = MAIN_ROAD_EAST;
  for (const [x] of road.polygon) {
    if (x < westX) westX = x;
    if (x > eastX) eastX = x;
  }

  let southY = MAIN_ROAD_SOUTH;
  for (const [, y] of road.polygon) {
    if (y < southY) southY = y;
  }

  const [gwx] = gateWest;
  const [gex] = gateEast;
  const [wex, wey] = wallEast;

  return [
    [westX, southY],
    [eastX, southY],
    [eastX, wey + WALL_OVERLAP],
    [wex, wey + WALL_OVERLAP],
    [gex, WALL_OVERLAP],
    [gwx, WALL_OVERLAP],
    [westX, WALL_OVERLAP],
  ];
}

/** Apron strip covering the legacy 1.5 m setback up to the wall line. */
export function gateApronPolygon(
  wall?: Boundary,
  gate?: Boundary,
): PolygonRing {
  let gateWest: [number, number] = [0, 0];
  let gateEast: [number, number] = [6.706, 0];
  let wallEast: [number, number] = [20.117, 0.813];

  if (gate && gate.path.length >= 2) {
    const [a, b] = gate.path;
    gateWest = a[0] < b[0] ? a : b;
    gateEast = a[0] < b[0] ? b : a;
  }

  if (wall) {
    for (let i = 0; i < wall.path.length - 1; i++) {
      const a = wall.path[i];
      const b = wall.path[i + 1];
      const hasGateEast =
        (Math.abs(a[0] - gateEast[0]) < 0.01 && b[0] > gateEast[0]) ||
        (Math.abs(b[0] - gateEast[0]) < 0.01 && a[0] > gateEast[0]);
      if (hasGateEast) wallEast = a[0] > b[0] ? a : b;
    }
  }

  const [gwx] = gateWest;
  const [gex] = gateEast;
  const [wex, wey] = wallEast;

  return [
    [MAIN_ROAD_WEST, LEGACY_MAIN_ROAD_NORTH],
    [MAIN_ROAD_EAST, LEGACY_MAIN_ROAD_NORTH],
    [MAIN_ROAD_EAST, wey + WALL_OVERLAP],
    [wex, wey + WALL_OVERLAP],
    [gex, WALL_OVERLAP],
    [gwx, WALL_OVERLAP],
    [MAIN_ROAD_WEST, WALL_OVERLAP],
  ];
}
