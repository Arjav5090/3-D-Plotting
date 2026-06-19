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

/** Empty click: deselect and return the camera to the master plan view. */
function handleMissed() {
  useSelectionStore.getState().clear();
  if (useViewStore.getState().mode === "focus") {
    useViewStore.getState().setMode("master");
  }
}

export function SiteViewer() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      // Transparent canvas so the page's grey-blue gradient shows through as a
      // clean architectural presentation board (no skybox / HDRI sky).
      camera={{ fov: 45, position: [60, 60, 60], near: 0.1, far: 5000 }}
      // Fires on a genuine click that hit no interactive object (plots only),
      // NOT on orbit drags — so selection persists during camera movement.
      onPointerMissed={handleMissed}
    >
      <LoadingBridge />
      <Suspense fallback={null}>
        <SiteRenderer />
      </Suspense>
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        // Mobile: one finger orbits, two fingers dolly + pan.
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
