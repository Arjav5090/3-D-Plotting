/** Centralized palette so colors are tweakable in one place. */

export const PALETTE = {
  road: "#aeb4bc",
  roadMarking: "#f5f7fa",
  curb: "#f2f0ec",
  curbTop: "#ffffff",
  lawn: "#c6d2b3",
  openSpace: "#86efac",
  wall: "#d6d3d1",
  wallCap: "#bcb8b2",
  treeTrunk: "#7c4a1e",
  treeCanopy: "#2f9e44",
  ground: "#e7e5e4",
  background: "#8fa3b0",
  // Entrance gate
  gatePillar: "#d8cfbd",
  gatePillarCap: "#b9ad95",
  gateBeam: "#7d7263",
  gateNameplate: "#1f2937",
  cabinWall: "#ece5d6",
  cabinRoof: "#7c4a1e",
  cabinDoor: "#5b4636",
  cabinGlass: "#bfe3ff",
  lamp: "#ffd27a",
  gateFinial: "#d4af37",
  gateArch: "#efe7d4",
  gatePlinth: "#b9ad95",
  // Landscaped garden
  grass: "#6cbf6c",
  gardenPath: "#decba6",
  gardenPlaza: "#cdbb96",
  hedge: "#3f8f3f",
  bench: "#7a4f2a",
  benchMetal: "#374151",
  lampPost: "#2f2f33",
  fountainStone: "#cfd8dc",
  water: "#79c2e6",
} as const;

/** Organized flower-bed colors, cycled deterministically (no randomness). */
export const FLOWER_COLORS = ["#ef476f", "#ffd166", "#f78fb3", "#9b5de5"] as const;

/** Canopy colors for the 3 instanced tree variants. */
export const TREE_CANOPIES = ["#3f9d4f", "#57b15b", "#2f8f57"] as const;

/** Low-poly car body colors, cycled deterministically. */
export const CAR_COLORS = [
  "#b23b3b",
  "#2c3e50",
  "#dfe3e8",
  "#2f6f9f",
  "#6b7280",
  "#c9a227",
] as const;

export const CAR_GLASS = "#1b2733";
export const CAR_TIRE = "#1a1a1a";

/** Low-poly people: shirt + skin tones, cycled deterministically. */
export const PEOPLE_SHIRTS = [
  "#e76f51",
  "#2a9d8f",
  "#457b9d",
  "#e9c46a",
  "#9d4edd",
  "#ef476f",
] as const;
export const SKIN_TONES = ["#e8b48f", "#c68642", "#f1c9a5", "#8d5524"] as const;
export const PANTS_COLOR = "#34404a";

/**
 * Uniform plot colors. The plot surface uses a tiled grass texture; `color` tints
 * that texture for hover / selection states.
 */
export const PLOT_COLORS = {
  /** Warm white — lets the grass albedo read naturally. */
  base: "#f4f8ee",
  /** Hover: soft green wash. */
  hover: "#d4ecc0",
  /** Selected: presentation blue. */
  selected: "#4f8cff",
} as const;

/** Distinct fill for the open-space (O.S.) parcel — soft teal. */
export const OPEN_SPACE_COLORS = {
  base: "#7fc8b6",
  hover: "#9bdcca",
  selected: "#4f8cff",
} as const;

/** Thin dark edge strips between adjacent plots. */
export const PLOT_EDGE = "#1c1c1c";

/** Legacy line colour (kept for any line-based dividers). */
export const PLOT_BORDER = "#111111";

/** Plot number painted on the grass surface. */
export const PLOT_LABEL = "#ffffff";

/** Selection accent (outline + emissive of the selected plot). */
export const ACCENT = "#4f8cff";
/** Hover outline color. */
export const HOVER_OUTLINE = "#ffffff";
/** Default plot status tints when the status overlay is active. */
export const STATUS_PLOT_COLORS = {
  available: "#4ade80",
  reserved: "#fbbf24",
  sold: "#f87171",
  "not-for-sale": "#9ca3af",
} as const;
