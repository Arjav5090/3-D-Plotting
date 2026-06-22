"use client";

/**
 * Compact info popup for a selected plot or open space.
 * Mobile: scrollable bottom sheet above camera controls.
 * Desktop: floating card at bottom-right.
 */
import { AnimatePresence, motion } from "framer-motion";
import type { PlotStatus } from "@/domain/types/site";
import { useSiteData } from "@/data/loaders/useSiteData";
import { useSelectionStore } from "@/store/useSelectionStore";
import { ContactCtas } from "@/ui/ContactCtas";

const STATUS_META: Record<PlotStatus, { label: string; dot: string; text: string }> = {
  available: { label: "Available", dot: "bg-emerald-500", text: "text-emerald-700" },
  reserved: { label: "Reserved", dot: "bg-amber-500", text: "text-amber-700" },
  sold: { label: "Sold", dot: "bg-rose-500", text: "text-rose-700" },
  "not-for-sale": { label: "Not for sale", dot: "bg-slate-400", text: "text-slate-600" },
};

export function PlotInfoCard() {
  const { data } = useSiteData();
  const selectedId = useSelectionStore((s) => s.selectedPlotId);
  const clear = useSelectionStore((s) => s.clear);

  const plot = data?.plots.find((p) => p.id === selectedId) ?? null;
  const openSpace =
    !plot && data
      ? data.openSpaces.find((o) => o.id === selectedId && o.selectable) ?? null
      : null;

  const isOpen = Boolean(plot || openSpace);
  const cardKey = plot?.id ?? openSpace?.id ?? "none";

  const status = plot?.status ?? "available";
  const statusMeta = STATUS_META[status];
  const dims = plot?.dimensions;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key={cardKey}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 28 }}
          transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
          className="plot-info-card pointer-events-auto fixed z-40"
        >
          <div className="plot-info-card__panel overflow-hidden rounded-2xl border border-white/50 bg-white/95 shadow-2xl ring-1 ring-black/5 md:bg-white/70 md:backdrop-blur-xl">
            <div className="flex items-start justify-between gap-2 px-4 pt-3 sm:gap-3 sm:px-5 sm:pt-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">
                  {data?.metadata.projectName ?? "Site"}
                </p>
                <h2 className="mt-0.5 text-xl font-bold leading-tight text-slate-900 sm:text-2xl sm:leading-none">
                  {plot ? `Plot ${plot.number}` : "Open Space"}
                </h2>
              </div>
              <button
                onClick={clear}
                aria-label="Close"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-900/5 text-slate-500 transition hover:bg-slate-900/10 hover:text-slate-800 sm:h-8 sm:w-8"
              >
                ✕
              </button>
            </div>

            {plot && (
              <div className="px-4 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
                <Row label="Area" value={`${plot.area ?? "—"} sq ft`} />

                {dims && (dims.front || dims.back || dims.depth) && (
                  <div className="mt-2.5 sm:mt-3">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-[11px]">
                      Dimensions
                    </p>
                    <div className="mt-1.5 grid grid-cols-3 gap-1.5 sm:gap-2">
                      <Stat label="Front" value={dims.front ?? "—"} />
                      <Stat label="Back" value={dims.back ?? "—"} />
                      <Stat label="Depth" value={dims.depth ?? "—"} />
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between sm:mt-4">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-[11px]">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold sm:text-sm ${statusMeta.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                    {statusMeta.label}
                  </span>
                </div>

                <div className="mt-3 sm:mt-4">
                  <ContactCtas />
                </div>
              </div>
            )}

            {openSpace && (
              <div className="px-4 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
                <Row label="Size" value={openSpace.size ?? "—"} />
                <div className="mt-2">
                  <Row label="Area" value={`${openSpace.area ?? "—"} sq ft`} />
                </div>
                <div className="mt-3 sm:mt-4">
                  <ContactCtas />
                </div>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-900/5 pb-2">
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-[11px]">
        {label}
      </span>
      <span className="text-right text-sm font-semibold leading-snug text-slate-900 sm:text-base">
        {value}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-white/60 px-1.5 py-1.5 text-center ring-1 ring-slate-900/5 sm:px-2.5 sm:py-2">
      <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400 sm:text-[10px]">
        {label}
      </p>
      <p className="mt-0.5 break-words text-[11px] font-semibold leading-tight text-slate-900 sm:text-sm">
        {value}
      </p>
    </div>
  );
}
