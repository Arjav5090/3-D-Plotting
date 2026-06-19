import * as THREE from "three";
import { fbm, hash } from "@/rendering/materials/proceduralNoise";

const SIZE = 1024;
const TILE_METRES = 2.4;

let sharedColor: THREE.CanvasTexture | null = null;
let sharedNormal: THREE.CanvasTexture | null = null;
let sharedColorData: ImageData | null = null;

function getColorData(): ImageData {
  if (!sharedColorData) sharedColorData = buildGrassColorData();
  return sharedColorData;
}

export function getGrassColorMap(): THREE.CanvasTexture {
  if (!sharedColor) {
    sharedColor = makeTexture(canvasFromImageData(getColorData()));
  }
  return sharedColor;
}

export function getGrassNormalMap(): THREE.CanvasTexture {
  if (!sharedNormal) {
    sharedNormal = makeTexture(canvasFromImageData(buildGrassNormalData(getColorData())));
    (sharedNormal as THREE.CanvasTexture).colorSpace = THREE.LinearSRGBColorSpace;
  }
  return sharedNormal;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mixColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}

/** Photo-realistic lawn albedo with olive / lime mottling. */
function buildGrassColorData(): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new ImageData(SIZE, SIZE);

  const img = ctx.createImageData(SIZE, SIZE);
  const data = img.data;

  // Reference palette: yellow-green lawn with darker olive patches.
  const light: [number, number, number] = [154, 186, 88];
  const mid: [number, number, number] = [118, 154, 62];
  const dark: [number, number, number] = [74, 112, 44];
  const shadow: [number, number, number] = [58, 92, 36];

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const n1 = fbm(x, y, 5);
      const n2 = fbm(x + 400, y + 220, 4);
      const n3 = fbm(x * 2.3, y * 2.3, 3);
      const patch = n1 * 0.55 + n2 * 0.3 + n3 * 0.15;

      let rgb: [number, number, number];
      if (patch < 0.28) rgb = mixColor(shadow, dark, patch / 0.28);
      else if (patch < 0.52) rgb = mixColor(dark, mid, (patch - 0.28) / 0.24);
      else if (patch < 0.78) rgb = mixColor(mid, light, (patch - 0.52) / 0.26);
      else rgb = mixColor(light, [176, 204, 108], (patch - 0.78) / 0.22);

      // Fine blade grain.
      const blade = hash(x * 0.17 + y * 0.31) * 0.18;
      const i = (y * SIZE + x) * 4;
      data[i] = Math.min(255, rgb[0] + blade * 28);
      data[i + 1] = Math.min(255, rgb[1] + blade * 18);
      data[i + 2] = Math.min(255, rgb[2] + blade * 8);
      data[i + 3] = 255;
    }
  }

  // Sparse bright highlights (sun catching blades).
  for (let k = 0; k < 9000; k++) {
    const x = Math.floor(hash(k * 3.1) * SIZE);
    const y = Math.floor(hash(k * 7.3) * SIZE);
    const i = (y * SIZE + x) * 4;
    data[i] = Math.min(255, data[i] + 12);
    data[i + 1] = Math.min(255, data[i + 1] + 10);
    data[i + 2] = Math.min(255, data[i + 2] + 4);
  }

  return img;
}

/** Normal map derived from the colour height field. */
function buildGrassNormalData(color: ImageData): ImageData {
  const img = new ImageData(SIZE, SIZE);
  const src = color.data;
  const dst = img.data;
  const strength = 2.4;

  const lum = (idx: number) =>
    src[idx] * 0.299 + src[idx + 1] * 0.587 + src[idx + 2] * 0.114;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const xl = ((x - 1 + SIZE) % SIZE);
      const xr = ((x + 1) % SIZE);
      const yu = ((y - 1 + SIZE) % SIZE);
      const yd = ((y + 1) % SIZE);

      const hL = lum((yu * SIZE + xl) * 4);
      const hR = lum((yu * SIZE + xr) * 4);
      const hU = lum((yu * SIZE + x) * 4);
      const hD = lum((yd * SIZE + x) * 4);

      const nx = (hL - hR) / 255;
      const ny = (hU - hD) / 255;
      const nz = 1 / strength;
      const len = Math.hypot(nx, ny, nz);

      const i = (y * SIZE + x) * 4;
      dst[i] = Math.round((nx / len) * 0.5 * 255 + 128);
      dst[i + 1] = Math.round((ny / len) * 0.5 * 255 + 128);
      dst[i + 2] = Math.round((nz / len) * 0.5 * 255 + 128);
      dst[i + 3] = 255;
    }
  }

  return img;
}

function canvasFromImageData(img: ImageData): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  canvas.getContext("2d")!.putImageData(img, 0, 0);
  return canvas;
}

function makeTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

export interface GrassMaps {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
}

/** Clone maps with repeat scaled to footprint (world metres). */
export function grassMapsForArea(width: number, depth: number): GrassMaps {
  const map = getGrassColorMap().clone();
  const normalMap = getGrassNormalMap().clone();
  const rx = Math.max(width / TILE_METRES, 1);
  const ry = Math.max(depth / TILE_METRES, 1);
  map.repeat.set(rx, ry);
  normalMap.repeat.set(rx, ry);
  map.needsUpdate = true;
  normalMap.needsUpdate = true;
  return { map, normalMap };
}

/** World-aligned UVs so irregular plot shapes tile evenly. */
export function applyWorldGrassUVs(
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
