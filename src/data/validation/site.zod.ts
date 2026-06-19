/**
 * Runtime validation for SiteData using Zod.
 *
 * This mirrors src/domain/types/site.ts and enforces the structural +
 * semantic rules documented in VALIDATION_RULES below. Parse untrusted data
 * (the authored site.json) through `SiteDataSchema` at the data-layer boundary;
 * the result is typed as `SiteData`.
 *
 * Requires: `zod` (add with your package manager).
 */
import { z } from "zod";
import type { SiteData } from "../../domain/types/site";

// ── primitives ────────────────────────────────────────────────────────────

const finite = z.number().finite();

export const Point2DSchema = z.tuple([finite, finite]);

/** Closed ring: >= 3 vertices, first point not duplicated at the end. */
export const PolygonRingSchema = z
  .array(Point2DSchema)
  .min(3, "A polygon ring needs at least 3 vertices")
  .refine(
    (ring) => {
      const [fx, fy] = ring[0];
      const [lx, ly] = ring[ring.length - 1];
      return fx !== lx || fy !== ly;
    },
    { message: "Do not repeat the first vertex; rings are implicitly closed" },
  )
  .refine((ring) => !hasZeroAreaRing(ring), {
    message: "Polygon ring is degenerate (zero area)",
  });

export const PolylineSchema = z
  .array(Point2DSchema)
  .min(2, "A polyline needs at least 2 vertices");

export const BBox2DSchema = z.tuple([finite, finite, finite, finite]);

const positive = z.number().positive();

// ── enums ─────────────────────────────────────────────────────────────────

const LengthUnit = z.enum(["m", "ft"]);
const PlotStatus = z.enum(["available", "reserved", "sold", "not-for-sale"]);
const CardinalFacing = z.enum(["N", "S", "E", "W", "NE", "NW", "SE", "SW"]);
const RoadKind = z.enum(["main", "internal", "approach"]);
const SurfaceKind = z.enum(["asphalt", "paved", "gravel"]);
const BoundaryKind = z.enum(["wall", "fence", "gate"]);
const FoliageKind = z.enum(["tree", "shrub", "palm", "hedge"]);
const OpenSpaceUsage = z.enum(["garden", "park", "utility", "unspecified"]);
const LabelKind = z.enum([
  "plot-number",
  "dimension",
  "road-name",
  "area",
  "open-space",
  "custom",
]);
const TextAnchor = z.enum(["center", "left", "right"]);

// ── measurement ─────────────────────────────────────────────────────────--

const MeasurementSchema = z
  .object({ value: positive, raw: z.string().optional() })
  .strict();

// ── entities ────────────────────────────────────────────────────────────--

const IdSchema = z.string().min(1);

const PlotSchema = z
  .object({
    id: IdSchema,
    number: z.number().int().positive(),
    polygon: PolygonRingSchema,
    centroid: Point2DSchema.optional(),
    area: positive.optional(),
    status: PlotStatus.optional(),
    facing: CardinalFacing.optional(),
    price: positive.optional(),
    frontage: MeasurementSchema.optional(),
    depth: MeasurementSchema.optional(),
    dimensions: z
      .object({
        front: z.string().optional(),
        back: z.string().optional(),
        depth: z.string().optional(),
      })
      .strict()
      .optional(),
    edgeLabels: z.array(z.string().nullable()).optional(),
    building: z
      .object({
        heightOverride: positive.optional(),
        setback: z.number().nonnegative().optional(),
        modelRef: z.string().optional(),
      })
      .strict()
      .optional(),
    colorOverride: z.string().optional(),
    meta: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  })
  .strict();

const RoadSchema = z
  .object({
    id: IdSchema,
    name: z.string().optional(),
    kind: RoadKind,
    polygon: PolygonRingSchema,
    width: MeasurementSchema.optional(),
    surface: SurfaceKind.optional(),
  })
  .strict();

const BoundarySchema = z
  .object({
    id: IdSchema,
    kind: BoundaryKind,
    path: PolylineSchema,
    closed: z.boolean().optional(),
    height: positive.optional(),
    thickness: positive.optional(),
    material: z.string().optional(),
  })
  .strict();

const TreeSchema = z
  .object({
    id: IdSchema,
    kind: FoliageKind,
    position: Point2DSchema,
    species: z.string().optional(),
    height: positive.optional(),
    canopyRadius: positive.optional(),
    modelRef: z.string().optional(),
  })
  .strict();

const OpenSpaceSchema = z
  .object({
    id: IdSchema,
    label: z.string().optional(),
    polygon: PolygonRingSchema,
    area: positive.optional(),
    usage: OpenSpaceUsage.optional(),
    size: z.string().optional(),
    edgeLabels: z.array(z.string().nullable()).optional(),
    selectable: z.boolean().optional(),
  })
  .strict();

const LabelSchema = z
  .object({
    id: IdSchema,
    kind: LabelKind,
    text: z.string(),
    at: Point2DSchema,
    rotation: finite.optional(),
    anchor: TextAnchor.optional(),
    refId: z.string().optional(),
  })
  .strict();

// ── site config ─────────────────────────────────────────────────────────--

const SiteMetadataSchema = z
  .object({
    projectName: z.string().min(1),
    projectCode: z.string().optional(),
    locality: z.string().optional(),
    drawingTitle: z.string().optional(),
    unit: LengthUnit,
    currency: z.string().optional(),
    northRotation: finite.optional(),
    bounds: BBox2DSchema.optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .strict();

const SiteDefaultsSchema = z
  .object({
    plotExtrudeHeight: positive.optional(),
    wallHeight: positive.optional(),
    wallThickness: positive.optional(),
    roadSurface: SurfaceKind.optional(),
    treeHeight: positive.optional(),
    treeCanopyRadius: positive.optional(),
    statusColors: z.record(PlotStatus, z.string()).optional(),
  })
  .strict();

// ── root ────────────────────────────────────────────────────────────────--

export const SiteDataSchema = z
  .object({
    schemaVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
    metadata: SiteMetadataSchema,
    defaults: SiteDefaultsSchema.optional(),
    plots: z.array(PlotSchema),
    roads: z.array(RoadSchema),
    boundaries: z.array(BoundarySchema),
    trees: z.array(TreeSchema),
    openSpaces: z.array(OpenSpaceSchema),
    labels: z.array(LabelSchema),
  })
  .strict()
  // Cross-entity rules ----------------------------------------------------
  .superRefine((data, ctx) => {
    assertUniqueIds(data.plots, "plots", ctx);
    assertUniqueIds(data.roads, "roads", ctx);
    assertUniqueIds(data.boundaries, "boundaries", ctx);
    assertUniqueIds(data.trees, "trees", ctx);
    assertUniqueIds(data.openSpaces, "openSpaces", ctx);
    assertUniqueIds(data.labels, "labels", ctx);

    // Plot numbers must be unique.
    const numbers = new Set<number>();
    data.plots.forEach((p, i) => {
      if (numbers.has(p.number)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["plots", i, "number"],
          message: `Duplicate plot number: ${p.number}`,
        });
      }
      numbers.add(p.number);
    });

    // Label.refId must point at a known entity when present.
    const ids = new Set<string>([
      ...data.plots.map((e) => e.id),
      ...data.roads.map((e) => e.id),
      ...data.openSpaces.map((e) => e.id),
    ]);
    data.labels.forEach((l, i) => {
      if (l.refId && !ids.has(l.refId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["labels", i, "refId"],
          message: `Label refId "${l.refId}" does not match any entity id`,
        });
      }
    });
  });

// Compile-time guarantee that the schema stays in sync with the interface.
export type SiteDataParsed = z.infer<typeof SiteDataSchema>;
const _typecheck: SiteData = {} as SiteDataParsed;
void _typecheck;

// ── helpers ───────────────────────────────────────────────────────────────

function assertUniqueIds(
  items: { id: string }[],
  field: string,
  ctx: z.RefinementCtx,
): void {
  const seen = new Set<string>();
  items.forEach((item, i) => {
    if (seen.has(item.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field, i, "id"],
        message: `Duplicate id: ${item.id}`,
      });
    }
    seen.add(item.id);
  });
}

/** Shoelace area; ~0 means the ring is degenerate. */
function hasZeroAreaRing(ring: ReadonlyArray<readonly [number, number]>): boolean {
  let twiceArea = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    twiceArea += x1 * y2 - x2 * y1;
  }
  return Math.abs(twiceArea) < 1e-9;
}

/**
 * Convenience wrapper used by the data loader.
 * Throws a ZodError with a readable path on the first structural failure set.
 */
export function parseSiteData(input: unknown): SiteData {
  return SiteDataSchema.parse(input);
}
