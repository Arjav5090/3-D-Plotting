"use client";

/**
 * Selection + hover state for plots.
 *
 * Why Zustand (not React Context): plot meshes subscribe with equality-checked
 * selectors (e.g. `s.selectedPlotId === plot.id`), so changing the selection
 * re-renders ONLY the two affected plots — never the whole canvas tree. This
 * is the key to keeping interaction cheap as plot count grows.
 *
 * Selection lives outside the R3F render loop, so it naturally persists across
 * camera movement, data reloads, and UI panel mounts.
 */
import { create } from "zustand";

export interface SelectionState {
  selectedPlotId: string | null;
  hoveredPlotId: string | null;

  /** Select a plot (or pass null to clear). */
  select: (id: string | null) => void;
  /** Select if different, deselect if it's already selected. */
  toggle: (id: string) => void;
  /** Set/clear the hovered plot. */
  setHovered: (id: string | null) => void;
  /** Clear the current selection (e.g. clicking empty space). */
  clear: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedPlotId: null,
  hoveredPlotId: null,

  select: (id) => set({ selectedPlotId: id }),
  toggle: (id) =>
    set((s) => ({ selectedPlotId: s.selectedPlotId === id ? null : id })),
  setHovered: (id) => set({ hoveredPlotId: id }),
  clear: () => set({ selectedPlotId: null }),
}));
