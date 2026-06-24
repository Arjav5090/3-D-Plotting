"use client";

/**
 * Camera preset state.
 *
 * The CameraController animates only when `presetNonce` bumps (explicit preset
 * click or Reset). `activePreset` drives toolbar highlighting only.
 */
import { create } from "zustand";

export type ViewMode = "master" | "gate";

export interface ViewState {
  /** Highlights the last-selected preset in the toolbar. */
  activePreset: ViewMode;
  /** Bumping this triggers a one-shot camera animation. */
  presetNonce: number;

  goToPreset: (mode: ViewMode) => void;
  /** Return to the master plan view and force a re-fit. */
  reset: () => void;
}

export const useViewStore = create<ViewState>((set) => ({
  activePreset: "master",
  presetNonce: 0,

  goToPreset: (mode) =>
    set((s) => ({
      activePreset: mode,
      presetNonce: s.presetNonce + 1,
    })),
  reset: () =>
    set((s) => ({
      activePreset: "master",
      presetNonce: s.presetNonce + 1,
    })),
}));
