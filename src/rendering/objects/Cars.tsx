"use client";

/**
 * Decorative GLB vehicles — parked on the internal road and cruising the front road.
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  MAIN_ROAD_DRIVE_EAST,
  MAIN_ROAD_DRIVE_WEST,
  MAIN_ROAD_LANE_A_Y,
  MAIN_ROAD_LANE_B_Y,
} from "@/generation/roadGeometry";
import { ASSETS } from "@/rendering/models/assetPaths";

const noRaycast = () => null;
const CAR_URLS = [ASSETS.carSedan, ASSETS.carSuv, ASSETS.carHatch] as const;
const CAR_LENGTH = 4.4;
const ROAD_SURFACE_Y = 0.025;

function useAlignedCar(url: string, length = CAR_LENGTH) {
  const { scene } = useGLTF(url);
  return useMemo(() => {
    const g = new THREE.Group();
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    let box = new THREE.Box3().setFromObject(clone);
    let size = new THREE.Vector3();
    box.getSize(size);
    if (size.z > size.x) {
      clone.rotation.y = Math.PI / 2;
      clone.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(clone);
      box.getSize(size);
    }

    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.x -= center.x;
    clone.position.z -= center.z;
    clone.position.y -= box.min.y;

    const s = length / (size.x || 1);
    clone.scale.setScalar(s);

    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.raycast = noRaycast;
      }
    });

    g.add(clone);
    return g;
  }, [scene, length]);
}

function GlbCar({ url }: { url: string }) {
  const car = useAlignedCar(url);
  return (
    <group raycast={noRaycast}>
      <primitive object={car} />
    </group>
  );
}

interface Parked {
  x: number;
  y: number;
  rotationY: number;
  variant: number;
  key: string;
}

interface Mover {
  startX: number;
  siteY: number;
  speed: number;
  dir: 1 | -1;
  variant: number;
}

export function Cars() {
  const parked = useMemo<Parked[]>(
    () => [
      { x: 4.7, y: 13, rotationY: Math.PI / 2, variant: 0, key: "e0" },
      { x: 1.3, y: 26, rotationY: -Math.PI / 2, variant: 1, key: "w0" },
    ],
    [],
  );

  const movers = useMemo<Mover[]>(
    () => [
      {
        startX: MAIN_ROAD_DRIVE_WEST,
        siteY: MAIN_ROAD_LANE_A_Y,
        speed: 7,
        dir: 1,
        variant: 0,
      },
      {
        startX: MAIN_ROAD_DRIVE_EAST,
        siteY: MAIN_ROAD_LANE_B_Y,
        speed: 6.5,
        dir: -1,
        variant: 2,
      },
    ],
    [],
  );

  const moverRefs = useRef<(THREE.Group | null)[]>([]);
  const moverX = useRef(movers.map((m) => m.startX));

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05);
    movers.forEach((m, i) => {
      let x = moverX.current[i] + m.speed * step * m.dir;
      if (x > MAIN_ROAD_DRIVE_EAST) x = MAIN_ROAD_DRIVE_WEST;
      if (x < MAIN_ROAD_DRIVE_WEST) x = MAIN_ROAD_DRIVE_EAST;
      moverX.current[i] = x;
      const g = moverRefs.current[i];
      if (g) {
        g.position.x = x;
        g.position.y = ROAD_SURFACE_Y;
      }
    });
  });

  return (
    <group name="cars">
      {parked.map((p) => (
        <group
          key={p.key}
          position={[p.x, 0, -p.y]}
          rotation={[0, p.rotationY, 0]}
        >
          <GlbCar url={CAR_URLS[p.variant % 3]} />
        </group>
      ))}

      {movers.map((m, i) => (
        <group
          key={`m${i}`}
          ref={(el) => {
            moverRefs.current[i] = el;
          }}
          position={[m.startX, ROAD_SURFACE_Y, -m.siteY]}
          rotation={[0, m.dir === 1 ? 0 : Math.PI, 0]}
        >
          <GlbCar url={CAR_URLS[m.variant % 3]} />
        </group>
      ))}
    </group>
  );
}
