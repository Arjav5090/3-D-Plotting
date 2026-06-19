import { create } from "zustand";

interface LoadingStore {
  siteLoading: boolean;
  viewerReady: boolean;
  glbActive: boolean;
  glbProgress: number;
  setSiteLoading: (v: boolean) => void;
  setViewerReady: (v: boolean) => void;
  setGlbState: (active: boolean, progress: number) => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  siteLoading: true,
  viewerReady: false,
  glbActive: true,
  glbProgress: 0,
  setSiteLoading: (siteLoading) => set({ siteLoading }),
  setViewerReady: (viewerReady) => set({ viewerReady }),
  setGlbState: (glbActive, glbProgress) => set({ glbActive, glbProgress }),
}));

export function selectIsAppLoading(s: LoadingStore): boolean {
  return s.siteLoading || !s.viewerReady || s.glbActive;
}

export function computeLoadingProgress(s: LoadingStore): number {
  if (s.siteLoading) return 8;
  if (!s.viewerReady) return 18;
  if (s.glbActive) return 22 + s.glbProgress * 0.78;
  return 100;
}
