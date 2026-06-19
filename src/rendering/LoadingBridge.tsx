"use client";

import { useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { useLoadingStore } from "@/store/useLoadingStore";

/** Reports GLB / Suspense asset progress to the DOM loading overlay. */
export function LoadingBridge() {
  const { active, progress, loaded, total } = useProgress();
  const setGlbState = useLoadingStore((s) => s.setGlbState);

  useEffect(() => {
    // `total === 0` means assets haven't registered yet — keep waiting.
    const pending = total === 0 || active || loaded < total;
    const pct = total > 0 ? (loaded / total) * 100 : progress;
    setGlbState(pending, pct);
  }, [active, progress, loaded, total, setGlbState]);

  return null;
}
