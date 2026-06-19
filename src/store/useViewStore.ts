"use client";

/**
 * Camera preset state.
 *
 * The CameraController reads `mode` (and a `resetNonce`) and smoothly animates
 * the camera toward the matching cinematic pose. Keeping this in a store lets
 * the DOM control bar and the in-canvas controller stay in sync.
 */
import { create } from "zustand";

export type ViewMode = "master" | "gate" | "garden" | "focus";

export interface ViewState {
  mode: ViewMode;
  /** Bumping this re-triggers a move even if the mode is unchanged (Reset). */
  resetNonce: number;

  setMode: (mode: ViewMode) => void;
  /** Switch to the plot-focus preset (used when a plot is selected). */
  focusSelected: () => void;
  /** Return to the master plan view and force a re-fit. */
  reset: () => void;
}

export const useViewStore = create<ViewState>((set) => ({
  mode: "master",
  resetNonce: 0,

  setMode: (mode) => set({ mode }),
  focusSelected: () => set({ mode: "focus" }),
  reset: () => set((s) => ({ mode: "master", resetNonce: s.resetNonce + 1 })),
}));
