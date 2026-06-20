"use client";

import { create } from "zustand";

interface CompassState {
  /** Degrees — rotates the compass rose so N tracks site north on screen. */
  headingDeg: number;
  setHeadingDeg: (deg: number) => void;
}

export const useCompassStore = create<CompassState>((set) => ({
  headingDeg: 0,
  setHeadingDeg: (headingDeg) => set({ headingDeg }),
}));
