"use client";

import { create } from "zustand";

interface CameraControlHandlers {
  zoomIn: () => void;
  zoomOut: () => void;
}

interface CameraControlState {
  handlers: CameraControlHandlers | null;
  register: (handlers: CameraControlHandlers) => void;
  unregister: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export const useCameraControlStore = create<CameraControlState>((set, get) => ({
  handlers: null,

  register: (handlers) => set({ handlers }),

  unregister: () => set({ handlers: null }),

  zoomIn: () => get().handlers?.zoomIn(),

  zoomOut: () => get().handlers?.zoomOut(),
}));
