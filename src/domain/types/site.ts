/**
 * Site data format for the 3D plotting viewer.
 *
 * Coordinate system:
 *  - All geometry is authored in 2D using [x, y] tuples ("site units", meters).
 *  - The rendering engine maps the 2D plane to the ground plane (y -> z in
 *    Three.js) and extrudes height along the up axis (Y). Nothing in this file
 *    encodes 3D — heights are scalar properties the engine uses to extrude.
 *
 * Scalability:
 *  - Coordinates use compact numeric tuples instead of {x,y} objects.
 *  - Shared values live in `defaults`; entities override only when they differ.
 *  - Every collection is a flat array of id-keyed records, so the format can be
 *    paginated / streamed / spatially indexed for hundreds of plots.
 */

// ──────────────────────────────────────────────────────────────────────────
// Geometry primitives
// ──────────────────────────────────────────────────────────────────────────

/** A single 2D point in site units. `[x, y]`. */
export type Point2D = [number, number];

/**
 * A closed polygon ring. The ring is implicitly closed: the last point is
 * connected back to the first. Do NOT repeat the first point at the end.
 * Minimum 3 vertices. Authoring convention: counter-clockwise (CCW) winding.
 */
export type PolygonRing = Point2D[];

/** An open polyline (e.g. a boundary wall path). Minimum 2 vertices. */
export type Polyline = Point2D[];

/** Axis-aligned bounding box `[minX, minY, maxX, maxY]` in site units. */
export type BBox2D = [number, number, number, number];

// ──────────────────────────────────────────────────────────────────────────
// Enums / unions
// ──────────────────────────────────────────────────────────────────────────

export type LengthUnit = "m" | "ft";

export type PlotStatus = "available" | "reserved" | "sold" | "not-for-sale";

export type CardinalFacing =
  | "N" | "S" | "E" | "W"
  | "NE" | "NW" | "SE" | "SW";

export type RoadKind = "main" | "internal" | "approach";

export type SurfaceKind = "asphalt" | "paved" | "gravel";

export type BoundaryKind = "wall" | "fence" | "gate";

export type FoliageKind = "tree" | "shrub" | "palm" | "hedge";

export type OpenSpaceUsage = "garden" | "park" | "utility" | "unspecified";

/** Drives styling, anchoring, and which layer toggle a label belongs to. */
export type LabelKind =
  | "plot-number"
  | "dimension"
  | "road-name"
  | "area"
  | "open-space"
  | "custom";

export type TextAnchor = "center" | "left" | "right";

// ──────────────────────────────────────────────────────────────────────────
// Entities
// ──────────────────────────────────────────────────────────────────────────

export interface Plot {
  /** Stable unique id, e.g. "plot-01". */
  id: string;
  /** Human-facing number from the layout (1..N). */
  number: number;
  /** Closed footprint polygon in site units. */
  polygon: PolygonRing;

  /** Optional precomputed values (engine can derive if omitted). */
  centroid?: Point2D;
  /** Plot area in square site units. */
  area?: number;

  status?: PlotStatus;
  facing?: CardinalFacing;

  /** Listing price in the currency declared on SiteMetadata. */
  price?: number;

  /** Display dimensions, preserving the original label (e.g. "13'-6\""). */
  frontage?: Measurement;
  depth?: Measurement;

  /** Surveyed plot dimensions for the popup (raw display strings). */
  dimensions?: {
    front?: string;
    back?: string;
    depth?: string;
  };

  /** Optional per-edge labels (one per polygon segment, same order as vertices). */
  edgeLabels?: (string | null)[];

  /** Extruded massing for 3D presentation; falls back to defaults. */
  building?: {
    /** Override extrude height for any structure on this plot. */
    heightOverride?: number;
    setback?: number;
    /** Key into a model registry (e.g. a .glb in /public/models). */
    modelRef?: string;
  };

  /** Override the status-derived color. */
  colorOverride?: string;
  /** Arbitrary extension data (price, owner, phase, etc.). */
  meta?: Record<string, string | number | boolean>;
}

export interface Road {
  id: string;
  name?: string;
  kind: RoadKind;
  /** Road surface as a closed polygon (as requested). */
  polygon: PolygonRing;
  /** Optional nominal width for labeling / future centerline tooling. */
  width?: Measurement;
  surface?: SurfaceKind;
}

export interface Boundary {
  id: string;
  kind: BoundaryKind;
  /** The path the wall/fence follows. */
  path: Polyline;
  /** If true, the path is a closed loop (perimeter wall). */
  closed?: boolean;
  /** Override default wall height. */
  height?: number;
  /** Override default wall thickness. */
  thickness?: number;
  material?: string;
}

export interface Tree {
  id: string;
  kind: FoliageKind;
  position: Point2D;
  species?: string;
  /** Override default foliage height. */
  height?: number;
  /** Canopy radius in site units. */
  canopyRadius?: number;
  modelRef?: string;
}

export interface OpenSpace {
  id: string;
  label?: string;
  polygon: PolygonRing;
  area?: number;
  usage?: OpenSpaceUsage;
  /** Display size string for the popup, e.g. "6' x 10'". */
  size?: string;
  /** Optional per-edge labels (one per polygon segment). */
  edgeLabels?: (string | null)[];
  /** If true, the open space is clickable and shows a popup. */
  selectable?: boolean;
}

export interface Label {
  id: string;
  kind: LabelKind;
  text: string;
  /** Where the label is anchored in site units. */
  at: Point2D;
  /** In-plane rotation in degrees (for dimension lines along an edge). */
  rotation?: number;
  anchor?: TextAnchor;
  /** Id of the entity this label describes (plot, road, etc.). */
  refId?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// Measurement (keeps source label alongside normalized value)
// ──────────────────────────────────────────────────────────────────────────

export interface Measurement {
  /** Normalized numeric value in site units. */
  value: number;
  /** Original authored label, e.g. "13'-6\"" or "18 M". */
  raw?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// Site-level config
// ──────────────────────────────────────────────────────────────────────────

export interface SiteMetadata {
  projectName: string;
  projectCode?: string;
  locality?: string;
  drawingTitle?: string;
  /** Unit that all numeric coordinates/lengths are expressed in. */
  unit: LengthUnit;
  /** ISO 4217 currency code for plot prices (e.g. "INR", "USD"). */
  currency?: string;
  /**
   * Clockwise rotation (degrees) of true north relative to +Y of the site
   * plane. Lets the renderer orient a compass without re-projecting geometry.
   */
  northRotation?: number;
  /** Precomputed extent of all geometry; used to frame the camera. */
  bounds?: BBox2D;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Shared values applied when an entity omits them. This is the primary lever
 * for keeping files small as plot count grows into the hundreds.
 */
export interface SiteDefaults {
  plotExtrudeHeight?: number;
  wallHeight?: number;
  wallThickness?: number;
  roadSurface?: SurfaceKind;
  treeHeight?: number;
  treeCanopyRadius?: number;
  /** Status -> hex color map for plots. */
  statusColors?: Partial<Record<PlotStatus, string>>;
}

// ──────────────────────────────────────────────────────────────────────────
// Root document
// ──────────────────────────────────────────────────────────────────────────

export interface SiteData {
  /** Semantic version of THIS data format. */
  schemaVersion: string;
  metadata: SiteMetadata;
  defaults?: SiteDefaults;

  plots: Plot[];
  roads: Road[];
  boundaries: Boundary[];
  trees: Tree[];
  openSpaces: OpenSpace[];
  labels: Label[];
}
