"use client";

/**
 * Daytime real-estate lighting — soft and natural, not dramatic/game-like.
 *
 *  - a single warm directional "sun" with a wide, high-res soft shadow frustum
 *  - gentle ambient + hemisphere fill so shadows never read as black
 *
 * Intensities are tuned for ACES tone mapping + an HDRI environment (added in
 * SiteRenderer), which together carry most of the realistic shading.
 */
interface LightingProps {
  /** Max site dimension, used to size the shadow camera frustum. */
  radius: number;
}

export function Lighting({ radius }: LightingProps) {
  const d = radius * 1.2;

  return (
    <>
      <ambientLight intensity={0.45} />
      <hemisphereLight
        intensity={0.55}
        color="#fdf6e3"
        groundColor="#b9b6a8"
      />
      <directionalLight
        position={[radius * 0.8, radius * 1.4, radius * 0.9]}
        intensity={2.1}
        color="#fff3e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0002}
        shadow-normalBias={0.04}
        shadow-camera-near={1}
        shadow-camera-far={radius * 6}
        shadow-camera-left={-d}
        shadow-camera-right={d}
        shadow-camera-top={d}
        shadow-camera-bottom={-d}
      />
    </>
  );
}
