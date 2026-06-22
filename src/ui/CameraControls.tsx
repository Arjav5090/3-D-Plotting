"use client";

/**
 * DOM control bar — camera modes, status overlay, locate, and info modal.
 */
import { useState, type ReactNode } from "react";
import {
  Info,
  LayoutGrid,
  MapPin,
  RotateCcw,
  ScanEye,
  DoorOpen,
} from "lucide-react";
import type { ViewMode } from "@/store/useViewStore";
import { useViewStore } from "@/store/useViewStore";
import { useStatusViewStore } from "@/store/useStatusViewStore";
import { MAPS_URL } from "@/config/siteContact";
import { SiteInfoModal } from "@/ui/SiteInfoModal";

interface ModeButton {
  mode: ViewMode;
  label: string;
  icon: ReactNode;
}

const MODES: ModeButton[] = [
  { mode: "master", label: "Master Plan", icon: <LayoutGrid className="h-4 w-4" strokeWidth={2} /> },
  { mode: "gate", label: "Gate", icon: <DoorOpen className="h-4 w-4" strokeWidth={2} /> },
];

const ICON_CLASS = "h-4 w-4 shrink-0";

export function CameraControls() {
  const mode = useViewStore((s) => s.mode);
  const setMode = useViewStore((s) => s.setMode);
  const reset = useViewStore((s) => s.reset);
  const statusActive = useStatusViewStore((s) => s.active);
  const toggleStatus = useStatusViewStore((s) => s.toggle);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <div className="pointer-events-auto fixed bottom-3 left-1/2 z-20 -translate-x-1/2 safe-bottom sm:bottom-4">
        <div className="flex max-w-[calc(100vw-1rem)] items-center gap-0.5 overflow-x-auto rounded-full border border-slate-200 bg-white/95 p-1 shadow-lg md:max-w-none md:gap-1 md:bg-white/90 md:backdrop-blur">
          {MODES.map(({ mode: m, label, icon }) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={active}
                aria-label={label}
                className={toolbarBtn(active)}
              >
                <span aria-hidden>{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}

          <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden />

          <button
            type="button"
            onClick={toggleStatus}
            aria-pressed={statusActive}
            aria-label="Plot status colors"
            title="Show sold vs available"
            className={toolbarBtn(statusActive)}
          >
            <ScanEye className={ICON_CLASS} strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">Status</span>
          </button>

          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Locate on Google Maps"
            title="Open location in Google Maps"
            className={toolbarBtn(false)}
          >
            <MapPin className={ICON_CLASS} strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">Locate</span>
          </a>

          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            aria-label="Project information"
            className={toolbarBtn(false)}
          >
            <Info className={ICON_CLASS} strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">Info</span>
          </button>

          <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden />

          <button
            type="button"
            onClick={reset}
            aria-label="Reset camera"
            title="Reset camera"
            className={toolbarBtn(false, "text-slate-600")}
          >
            <RotateCcw className={ICON_CLASS} strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      <SiteInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}

function toolbarBtn(active: boolean, extra = "") {
  return [
    "flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-medium transition sm:min-h-0 sm:min-w-0 sm:px-4 sm:py-2",
    active
      ? "bg-slate-900 text-white shadow"
      : `text-slate-600 hover:bg-slate-100 ${extra}`,
  ].join(" ");
}
