"use client";

/**
 * Compact info popup for a selected plot or open space.
 *
 * - Floats near the bottom-right corner (max 350px), never covering the scene.
 * - Glassmorphism card with rounded corners + a close button.
 * - Framer Motion fade + slide-up on enter/exit via AnimatePresence.
 * - Hidden entirely when nothing is selected.
 */
import { AnimatePresence, motion } from "framer-motion";
import type { PlotStatus } from "@/domain/types/site";
import { useSiteData } from "@/data/loaders/useSiteData";
import { useSelectionStore } from "@/store/useSelectionStore";

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
          className="pointer-events-auto fixed bottom-5 right-5 z-30 w-[88vw] max-w-[350px]"
        >
          <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/70 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 pt-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  {data?.metadata.projectName ?? "Site"}
                </p>
                <h2 className="mt-0.5 text-2xl font-bold leading-none text-slate-900">
                  {plot ? `Plot ${plot.number}` : "Open Space"}
                </h2>
              </div>
              <button
                onClick={clear}
                aria-label="Close"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900/5 text-slate-500 transition hover:bg-slate-900/10 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            {plot && (
              <div className="px-5 pb-5 pt-3">
                <Row label="Area" value={`${plot.area ?? "—"} sq ft`} />

                {dims && (dims.front || dims.back || dims.depth) && (
                  <div className="mt-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Dimensions
                    </p>
                    <div className="mt-1.5 grid grid-cols-3 gap-2">
                      <Stat label="Front" value={dims.front ?? "—"} />
                      <Stat label="Back" value={dims.back ?? "—"} />
                      <Stat label="Depth" value={dims.depth ?? "—"} />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold ${statusMeta.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                    {statusMeta.label}
                  </span>
                </div>

                <button
                  disabled={status === "sold"}
                  className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {status === "sold" ? "Sold Out" : "Schedule Site Visit"}
                </button>
              </div>
            )}

            {openSpace && (
              <div className="px-5 pb-5 pt-3">
                <Row label="Size" value={openSpace.size ?? "—"} />
                <div className="mt-2">
                  <Row label="Area" value={`${openSpace.area ?? "—"} sq ft`} />
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
    <div className="flex items-center justify-between border-b border-slate-900/5 pb-2">
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="text-base font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/60 px-2.5 py-2 text-center ring-1 ring-slate-900/5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
