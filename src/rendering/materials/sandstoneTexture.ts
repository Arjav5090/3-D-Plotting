import * as THREE from "three";
import { fbm, hash } from "@/rendering/materials/proceduralNoise";

const SIZE = 256;
const TILE_METRES = 1.2;

let shared: THREE.CanvasTexture | null = null;

/** Warm desert sandstone albedo tile matched to compound wall palette. */
function buildSandstoneData(): ImageData {
  const img = new ImageData(SIZE, SIZE);
  const data = img.data;
  const base = { r: 214, g: 211, b: 209 };

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const n = fbm(x * 0.9, y * 0.9, 5);
      const vein = Math.sin(x * 0.08 + n * 3) * 0.04;
      const speck = hash(x * 0.41 + y * 0.27) * 0.07;
      const course = Math.sin(y * 0.22) * 0.03;
      const v = n * 0.14 + vein + speck + course;
      const i = (y * SIZE + x) * 4;
      data[i] = Math.min(255, base.r + v * 55);
      data[i + 1] = Math.min(255, base.g + v * 50);
      data[i + 2] = Math.min(255, base.b + v * 45);
      data[i + 3] = 255;
    }
  }

  return img;
}

export function getSandstoneMap(): THREE.CanvasTexture {
  if (!shared) {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    canvas.getContext("2d")!.putImageData(buildSandstoneData(), 0, 0);
    shared = new THREE.CanvasTexture(canvas);
    shared.wrapS = THREE.RepeatWrapping;
    shared.wrapT = THREE.RepeatWrapping;
    shared.colorSpace = THREE.SRGBColorSpace;
    shared.anisotropy = 8;
  }
  return shared;
}

export function sandstoneMaterial(
  color = "#d6d3d1",
  repeat: [number, number] = [1, 1],
): THREE.MeshStandardMaterial {
  const map = getSandstoneMap().clone();
  map.repeat.set(repeat[0], repeat[1]);
  map.needsUpdate = true;
  return new THREE.MeshStandardMaterial({
    map,
    color,
    roughness: 0.88,
    metalness: 0.03,
  });
}

export const SANDSTONE_TILE = TILE_METRES;
