"use client";

/**
 * Orchestrates the whole scene from a loaded SiteData document:
 *  - centers the layout at the world origin (group offset by -center)
 *  - renders every entity through its dedicated component
 *  - drives ground/lighting/camera sizing from the computed bounds
 *
 * It is intentionally "dumb": all data is pre-validated by the loader and all
 * geometry math lives in the components / geometry helpers.
 */
import { useMemo } from "react";
import { Environment } from "@react-three/drei";
import { getSiteBounds } from "@/generation/geometry";
import { extendedMainRoadPolygon } from "@/generation/roadGeometry";
import { useSiteData } from "@/data/loaders/useSiteData";
import { PlotMesh } from "@/rendering/objects/PlotMesh";
import { OpenSpaceMesh } from "@/rendering/objects/OpenSpaceMesh";
import { RoadMesh } from "@/rendering/objects/RoadMesh";
import { RoadGateApron } from "@/rendering/objects/RoadGateApron";
import { RoadMarkings } from "@/rendering/objects/RoadMarkings";
import { Curbs } from "@/rendering/objects/Curbs";
import { BoundaryMesh } from "@/rendering/objects/BoundaryMesh";
import { BoundaryWallSystem } from "@/rendering/objects/BoundaryWallSystem";
import { EntranceGate } from "@/rendering/objects/EntranceGate";
import { GardenArea } from "@/rendering/objects/GardenArea";
import { Trees } from "@/rendering/objects/Trees";
import { Bushes } from "@/rendering/objects/Bushes";
import { Cars } from "@/rendering/objects/Cars";
import { FlatPolygonMesh } from "@/rendering/objects/FlatPolygonMesh";
import { FlatLabel } from "@/rendering/labels/FlatLabel";
import { ShadowCatcher } from "@/rendering/scene/Ground";
import { Lighting } from "@/rendering/scene/Lighting";
import { CameraController, type Landmarks } from "@/rendering/camera/CameraController";
import { CompassSync } from "@/rendering/camera/CompassSync";
import { PALETTE } from "@/rendering/materials/colors";
import { useViewportProfile } from "@/hooks/useViewportProfile";

export function SiteRenderer({ lowPower = false }: { lowPower?: boolean }) {
  const { data } = useSiteData();
  const { isMobile } = useViewportProfile();

  const bounds = useMemo(() => (data ? getSiteBounds(data) : null), [data]);

  const landmarks = useMemo<Landmarks>(() => {
    if (!data) return { gate: null, garden: null };

    const gateB = data.boundaries.find((b) => b.kind === "gate");
    let gate: Landmarks["gate"] = null;
    if (gateB && gateB.path.length > 0) {
      const sx = gateB.path.reduce((s, p) => s + p[0], 0) / gateB.path.length;
      const sy = gateB.path.reduce((s, p) => s + p[1], 0) / gateB.path.length;
      gate = [sx, sy];
    }

    const gardenO = data.openSpaces.find((o) => o.id === "os-suda");
    let garden: Landmarks["garden"] = null;
    if (gardenO) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const [x, y] of gardenO.polygon) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      garden = {
        cx: (minX + maxX) / 2,
        cy: (minY + maxY) / 2,
        w: maxX - minX,
        d: maxY - minY,
      };
    }

    return { gate, garden };
  }, [data]);

  if (!data || !bounds) return null;

  const [cx, cy] = bounds.center;
  const radius = Math.max(bounds.size[0], bounds.size[1]);
  const wall = data.boundaries.find((b) => b.id === "wall-perimeter");
  const gate = data.boundaries.find((b) => b.kind === "gate");

  return (
    <>
      <Lighting radius={radius} lowPower={lowPower} />
      {/* HDRI used for soft reflections/IBL only — never shown as a sky. */}
      <Environment preset="park" background={false} />
      <ShadowCatcher size={bounds.size} />
      <CameraController
        bounds={bounds}
        plots={data.plots}
        landmarks={landmarks}
      />
      <CompassSync />

      {/* Center the whole site at the origin. world z = -y, so add +cy. */}
      <group position={[-cx, 0, cy]}>
        {data.openSpaces.map((o) =>
          o.id === "os-suda" ? (
            <GardenArea key={o.id} polygon={o.polygon} />
          ) : o.selectable ? (
            <OpenSpaceMesh key={o.id} openSpace={o} />
          ) : (
            <FlatPolygonMesh
              key={o.id}
              polygon={o.polygon}
              color={PALETTE.openSpace}
              y={0.015}
            />
          ),
        )}

        {data.roads.map((road) => (
          <RoadMesh
            key={road.id}
            road={road}
            polygon={
              road.id === "road-main-1"
                ? extendedMainRoadPolygon(road, wall, gate)
                : undefined
            }
          />
        ))}

        {data.roads.map((road) => (
          <RoadMarkings key={`mark-${road.id}`} road={road} />
        ))}

        {data.roads.map((road) => (
          <Curbs key={`curb-${road.id}`} road={road} />
        ))}

        {data.plots.map((plot) => (
          <PlotMesh
            key={plot.id}
            plot={plot}
            defaults={data.defaults}
            labelScale={isMobile ? 1.22 : 1}
          />
        ))}

        {data.boundaries
          .filter((b) => b.kind !== "gate")
          .map((b) =>
            b.kind === "wall" ? (
              <BoundaryWallSystem key={b.id} boundary={b} />
            ) : (
              <BoundaryMesh key={b.id} boundary={b} defaults={data.defaults} />
            ),
          )}

        {data.boundaries
          .filter((b) => b.kind === "gate")
          .map((b) => (
            <EntranceGate
              key={b.id}
              boundary={b}
              name={data.metadata.projectName}
            />
          ))}

        <RoadGateApron wall={wall} gate={gate} />

        <Trees data={data} />

        <Bushes data={data} />

        <Cars />

        {/* Plot labels are painted on the plot surface (see PlotMesh).
            Road + open-space labels are painted flat on their surfaces. */}
        {data.labels
          .filter(
            (label) =>
              label.kind === "road-name" ||
              (label.kind === "open-space" &&
                label.refId !== "os-01" &&
                label.refId !== "os-suda"),
          )
          .map((label) => (
            <FlatLabel
              key={label.id}
              label={label}
              color={label.kind === "road-name" ? PALETTE.roadMarking : "#1f3d2a"}
              fontSize={
                label.kind === "road-name"
                  ? isMobile
                    ? 1.85
                    : 1.6
                  : isMobile
                    ? 2.1
                    : 1.9
              }
              y={label.id === "lbl-road-22" ? 0.058 : 0.05}
            />
          ))}
      </group>
    </>
  );
}
