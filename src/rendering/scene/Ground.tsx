"use client";

/**
 * Invisible shadow catcher.
 *
 * There is intentionally NO visible base plane — the scene reads as a clean
 * masterplan board (the gradient page background shows through). This plane is
 * fully transparent except where shadows fall, so trees / gate / cars stay
 * grounded without an artificial platform.
 */
interface ShadowCatcherProps {
  /** [width, depth] of the site; the catcher is padded a little beyond it. */
  size: [number, number];
}

export function ShadowCatcher({ size }: ShadowCatcherProps) {
  const extent = Math.max(size[0], size[1]) + 40;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
      raycast={() => null}
    >
      <planeGeometry args={[extent, extent]} />
      <shadowMaterial transparent opacity={0.15} />
    </mesh>
  );
}
