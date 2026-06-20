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
import "@/rendering/models/assetPaths";
import { useSelectionStore } from "@/store/useSelectionStore";
import { useViewStore } from "@/store/useViewStore";
import { useViewportProfile } from "@/hooks/useViewportProfile";

/** Empty click: deselect and return the camera to the master plan view. */
function handleMissed() {
  useSelectionStore.getState().clear();
  if (useViewStore.getState().mode === "focus") {
    useViewStore.getState().setMode("master");
  }
}

export function SiteViewer() {
  const { isMobile, isLowPower } = useViewportProfile();

  return (
    <Canvas
      className="absolute inset-0 touch-none"
      shadows={!isLowPower}
      dpr={isLowPower ? [1, 1.25] : [1, 2]}
      gl={{
        antialias: !isLowPower,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      camera={{ fov: isMobile ? 48 : 45, position: [60, 60, 60], near: 0.1, far: 5000 }}
      onPointerMissed={handleMissed}
    >
      <LoadingBridge />
      <Suspense fallback={null}>
        <SiteRenderer lowPower={isLowPower} />
      </Suspense>
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={isMobile ? 0.65 : 1}
        zoomSpeed={isMobile ? 0.75 : 1}
        panSpeed={isMobile ? 0.65 : 1}
        touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
        mouseButtons={{
          LEFT: MOUSE.ROTATE,
          MIDDLE: MOUSE.DOLLY,
          RIGHT: MOUSE.PAN,
        }}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={3}
        maxDistance={2000}
      />
    </Canvas>
  );
}
