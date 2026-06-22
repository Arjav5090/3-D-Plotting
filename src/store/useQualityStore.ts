"use client";

import { create } from "zustand";

interface QualityState {
  /** 1 = full quality; lower when PerformanceMonitor requests regression. */
  factor: number;
  setFactor: (factor: number) => void;
}

export const useQualityStore = create<QualityState>((set) => ({
  factor: 1,
  setFactor: (factor) => set({ factor }),
}));

/** True when adaptive monitor has scaled quality below full. */
export function selectIsDegraded(state: QualityState): boolean {
  return state.factor < 0.85;
}
