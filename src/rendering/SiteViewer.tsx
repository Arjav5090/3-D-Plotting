"use client";

/**
 * The R3F entry point: sets up the <Canvas>, background, controls and Suspense,
 * then mounts the SiteRenderer. This is the only file that touches the WebGL
 * canvas lifecycle; everything else is scene content.
 */
import { Suspense } from "react";
import { ACESFilmicToneMapping, MOUSE, TOUCH } from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SiteRenderer } from "@/rendering/scene/SiteRenderer";
import { LoadingBridge } from "@/rendering/LoadingBridge";
import { AdaptiveQuality } from "@/rendering/quality/AdaptiveQuality";
import { OrbitZoomBridge } from "@/rendering/camera/OrbitZoomBridge";
import { canvasDprRange } from "@/rendering/quality/renderQuality";
import "@/rendering/models/assetPaths";
import { useSelectionStore } from "@/store/useSelectionStore";
import { useViewportProfile } from "@/hooks/useViewportProfile";

/** Empty click: deselect plot without moving the camera. */
function handleMissed() {
  useSelectionStore.getState().clear();
}

export function SiteViewer() {
  const { isMobile } = useViewportProfile();

  return (
    <Canvas
      className="absolute inset-0 touch-none"
      shadows={!isMobile}
      dpr={canvasDprRange()}
      performance={{ min: 0.5, max: 1 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: isMobile ? 1.02 : 1.06,
      }}
      camera={{ fov: isMobile ? 48 : 45, position: [60, 60, 60], near: 0.1, far: 5000 }}
      onPointerMissed={handleMissed}
    >
      <AdaptiveQuality />
      <OrbitZoomBridge />
      <LoadingBridge />
      <Suspense fallback={null}>
        <SiteRenderer />
      </Suspense>
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        enablePan
        enableZoom
        enableRotate
        screenSpacePanning
        rotateSpeed={isMobile ? 0.85 : 1.1}
        zoomSpeed={isMobile ? 1 : 1.15}
        panSpeed={isMobile ? 0.85 : 1.1}
        touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
        mouseButtons={{
          LEFT: MOUSE.ROTATE,
          MIDDLE: MOUSE.DOLLY,
          RIGHT: MOUSE.PAN,
        }}
        minPolarAngle={0.12}
        maxPolarAngle={Math.PI / 2 - 0.02}
        minDistance={2}
        maxDistance={2500}
      />
    </Canvas>
  );
}
