"use client";

/**
 * DOM control bar for camera modes. Syncs with the view + selection stores.
 *
 * Responsive: a floating pill at the bottom-center on mobile, moving to the
 * top-center on larger screens. Buttons are large tap targets for touch.
 */
import type { ViewMode } from "@/store/useViewStore";
import { useViewStore } from "@/store/useViewStore";
import { useSelectionStore } from "@/store/useSelectionStore";

interface ModeButton {
  mode: ViewMode;
  label: string;
  icon: string;
}

const MODES: ModeButton[] = [
  { mode: "master", label: "Master Plan", icon: "▦" },
  { mode: "gate", label: "Gate", icon: "⛩" },
  { mode: "garden", label: "Garden", icon: "❀" },
  { mode: "focus", label: "Plot", icon: "◎" },
];

export function CameraControls() {
  const mode = useViewStore((s) => s.mode);
  const setMode = useViewStore((s) => s.setMode);
  const reset = useViewStore((s) => s.reset);
  const focusSelected = useViewStore((s) => s.focusSelected);
  const selectedPlotId = useSelectionStore((s) => s.selectedPlotId);

  const hasSelection = Boolean(selectedPlotId);

  const handleMode = (m: ViewMode) => {
    if (m === "focus") {
      if (!hasSelection) return;
      focusSelected();
    } else {
      setMode(m);
    }
  };

  return (
    <div className="pointer-events-auto fixed bottom-4 left-1/2 z-20 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 p-1 shadow-lg backdrop-blur">
        {MODES.map(({ mode: m, label, icon }) => {
          const active = mode === m;
          const disabled = m === "focus" && !hasSelection;
          return (
            <button
              key={m}
              onClick={() => handleMode(m)}
              disabled={disabled}
              aria-pressed={active}
              className={[
                "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition sm:px-4",
                active
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100",
                disabled ? "cursor-not-allowed opacity-40 hover:bg-transparent" : "",
              ].join(" ")}
            >
              <span aria-hidden className="text-base leading-none">
                {icon}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}

        <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden />

        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 sm:px-4"
          title="Reset camera"
        >
          <span aria-hidden className="text-base leading-none">
            ⟳
          </span>
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </div>
  );
}
