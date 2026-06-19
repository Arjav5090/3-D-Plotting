/** Deterministic pseudo-random in [0, 1). */
export function hash(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Value noise on a 2D grid, bilinearly interpolated. */
export function valueNoise(x: number, y: number, cell = 8): number {
  const ix = Math.floor(x / cell);
  const iy = Math.floor(y / cell);
  const fx = (x / cell) - ix;
  const fy = (y / cell) - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const a = hash(ix * 57 + iy * 131);
  const b = hash((ix + 1) * 57 + iy * 131);
  const c = hash(ix * 57 + (iy + 1) * 131);
  const d = hash((ix + 1) * 57 + (iy + 1) * 131);

  return a * (1 - sx) * (1 - sy) + b * sx * (1 - sy) + c * (1 - sx) * sy + d * sx * sy;
}

/** Fractal Brownian motion — layered organic variation. */
export function fbm(x: number, y: number, octaves = 5): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, y * freq, 6);
    norm += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return sum / norm;
}
