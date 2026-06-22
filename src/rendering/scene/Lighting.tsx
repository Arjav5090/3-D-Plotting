"use client";

/**
 * Natural white daylight — soft, neutral, and balanced for a real-estate masterplan.
 *
 *  - diffuse skylight from above (no harsh warmth)
 *  - single key sun with soft shadows
 *  - gentle fill so shadows stay neutral grey, not muddy or blown out
 */
interface LightingProps {
  /** Max site dimension, used to size the shadow camera frustum. */
  radius: number;
  /** Skip real-time shadows on phones/tablets — saves GPU without lowering DPR. */
  mobileGpu?: boolean;
}

export function Lighting({ radius, mobileGpu = false }: LightingProps) {
  const d = radius * 1.2;
  const shadowMap = mobileGpu ? 1024 : 2048;

  return (
    <>
      <ambientLight intensity={mobileGpu ? 0.48 : 0.52} color="#f8f9fb" />
      <hemisphereLight
        intensity={mobileGpu ? 0.58 : 0.68}
        color="#fafbfc"
        groundColor="#b8bcc2"
      />

      {/* Soft overhead skylight — even neutral fill from above. */}
      <directionalLight
        position={[radius * 0.1, radius * 2.1, radius * 0.05]}
        intensity={mobileGpu ? 0.65 : 0.82}
        color="#ffffff"
      />

      {/* Key sun — neutral white, slightly angled for depth. */}
      <directionalLight
        position={[radius * 0.7, radius * 1.55, radius * 0.65]}
        intensity={mobileGpu ? 1.75 : 2.05}
        color="#ffffff"
        castShadow={!mobileGpu}
        shadow-mapSize-width={shadowMap}
        shadow-mapSize-height={shadowMap}
        shadow-bias={-0.0002}
        shadow-normalBias={0.04}
        shadow-camera-near={1}
        shadow-camera-far={radius * 6}
        shadow-camera-left={-d}
        shadow-camera-right={d}
        shadow-camera-top={d}
        shadow-camera-bottom={-d}
      />

      {/* Subtle fill — lifts shadow sides without adding colour cast. */}
      <directionalLight
        position={[-radius * 0.5, radius * 0.95, -radius * 0.4]}
        intensity={mobileGpu ? 0.32 : 0.42}
        color="#f4f6f8"
      />
    </>
  );
}
