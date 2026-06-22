"use client";

import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { useQualityStore } from "@/store/useQualityStore";

/** Scales DPR down only when frame rate drops; keeps full resolution when FPS is healthy. */
export function AdaptiveQuality() {
  const setFactor = useQualityStore((s) => s.setFactor);

  return (
    <>
      <PerformanceMonitor
        bounds={() => [30, 58]}
        flipflops={3}
        onChange={({ factor }) => setFactor(factor)}
      />
      <AdaptiveDpr pixelated />
    </>
  );
}
