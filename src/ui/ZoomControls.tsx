"use client";

import { Minus, Plus } from "lucide-react";
import { useCameraControlStore } from "@/store/useCameraControlStore";

const ICON_CLASS = "h-5 w-5 shrink-0";

export function ZoomControls() {
  const zoomIn = useCameraControlStore((s) => s.zoomIn);
  const zoomOut = useCameraControlStore((s) => s.zoomOut);

  return (
    <div
      className="pointer-events-auto fixed right-3 top-[calc(50%+4.5rem)] z-30 -translate-y-1/2 sm:top-1/2 sm:translate-y-[4.5rem]"
      role="group"
      aria-label="Zoom controls"
    >
      <div className="flex flex-col overflow-hidden rounded-full border border-slate-200 bg-white/95 shadow-lg md:bg-white/90 md:backdrop-blur">
        <button
          type="button"
          onClick={zoomIn}
          aria-label="Zoom in"
          title="Zoom in"
          className="grid min-h-11 min-w-11 place-items-center text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 sm:min-h-10 sm:min-w-10"
        >
          <Plus className={ICON_CLASS} strokeWidth={2} aria-hidden />
        </button>
        <span className="h-px bg-slate-200" aria-hidden />
        <button
          type="button"
          onClick={zoomOut}
          aria-label="Zoom out"
          title="Zoom out"
          className="grid min-h-11 min-w-11 place-items-center text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 sm:min-h-10 sm:min-w-10"
        >
          <Minus className={ICON_CLASS} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
