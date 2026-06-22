"use client";

import { create } from "zustand";

interface StatusViewState {
  active: boolean;
  toggle: () => void;
  setActive: (active: boolean) => void;
}

export const useStatusViewStore = create<StatusViewState>((set) => ({
  active: false,
  toggle: () => set((s) => ({ active: !s.active })),
  setActive: (active) => set({ active }),
}));
