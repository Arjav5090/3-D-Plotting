import * as THREE from "three";
import { fbm, hash } from "@/rendering/materials/proceduralNoise";

const SIZE = 512;
const TILE_METRES = 3;

let shared: THREE.CanvasTexture | null = null;

function buildAsphaltData(): ImageData {
  const img = new ImageData(SIZE, SIZE);
  const data = img.data;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const n = fbm(x, y, 4);
      const grain = hash(x * 0.73 + y * 0.19) * 0.12;
      const v = 132 + n * 20 + grain * 14;
      const i = (y * SIZE + x) * 4;
      data[i] = v;
      data[i + 1] = v + 1;
      data[i + 2] = v + 3;
      data[i + 3] = 255;
    }
  }

  return img;
}

export function getAsphaltMap(): THREE.CanvasTexture {
  if (!shared) {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    canvas.getContext("2d")!.putImageData(buildAsphaltData(), 0, 0);
    shared = new THREE.CanvasTexture(canvas);
    shared.wrapS = THREE.RepeatWrapping;
    shared.wrapT = THREE.RepeatWrapping;
    shared.colorSpace = THREE.SRGBColorSpace;
    shared.anisotropy = 8;
  }
  return shared;
}

export function asphaltMapForArea(width: number, depth: number): THREE.CanvasTexture {
  const tex = getAsphaltMap().clone();
  tex.repeat.set(Math.max(width / TILE_METRES, 1), Math.max(depth / TILE_METRES, 1));
  tex.needsUpdate = true;
  return tex;
}

export function applyWorldAsphaltUVs(
  geometry: THREE.BufferGeometry,
  tileMetres = TILE_METRES,
): void {
  const pos = geometry.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = pos.getX(i) / tileMetres;
    uvs[i * 2 + 1] = -pos.getZ(i) / tileMetres;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
}
