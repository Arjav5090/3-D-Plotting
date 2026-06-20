"use client";

import { useEffect, useState } from "react";

export interface ViewportProfile {
  width: number;
  height: number;
  /** Phone / small touch viewport. */
  isMobile: boolean;
  /** Narrow portrait layout. */
  isPortrait: boolean;
  /** Reduced GPU settings for smooth touch interaction. */
  isLowPower: boolean;
}

function readProfile(): ViewportProfile {
  if (typeof window === "undefined") {
    return {
      width: 390,
      height: 844,
      isMobile: true,
      isPortrait: true,
      isLowPower: true,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const isMobile = width < 768 || (coarsePointer && width < 1024);
  const isPortrait = height > width;
  const isLowPower = isMobile || width < 900;

  return { width, height, isMobile, isPortrait, isLowPower };
}

/** Tracks viewport size + mobile/touch profile for layout and 3D quality tiers. */
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
