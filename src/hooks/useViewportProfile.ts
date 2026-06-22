"use client";

import { useEffect, useState } from "react";

export interface ViewportProfile {
  width: number;
  height: number;
  /** Phone / small touch viewport — layout and touch controls only. */
  isMobile: boolean;
  /** Narrow portrait layout. */
  isPortrait: boolean;
}

function readProfile(): ViewportProfile {
  if (typeof window === "undefined") {
    return {
      width: 390,
      height: 844,
      isMobile: true,
      isPortrait: true,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const isMobile = width < 768 || (coarsePointer && width < 1024);
  const isPortrait = height > width;

  return { width, height, isMobile, isPortrait };
}

/** Tracks viewport size for responsive layout (not render quality). */
export function useViewportProfile(): ViewportProfile {
  const [profile, setProfile] = useState<ViewportProfile>(readProfile);

  useEffect(() => {
    const update = () => setProfile(readProfile());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return profile;
}
