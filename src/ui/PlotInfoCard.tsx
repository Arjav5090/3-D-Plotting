"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Plot, PlotStatus } from "@/domain/types/site";
import { useSiteData } from "@/data/loaders/useSiteData";
import { useSelectionStore } from "@/store/useSelectionStore";
import { ContactCtas } from "@/ui/ContactCtas";

const STATUS_META: Record<
  PlotStatus,
  { label: string; badge: string }
> = {
  available: { label: "Available", badge: "bg-emerald-500 text-white" },
  reserved: { label: "Reserved", badge: "bg-amber-500 text-white" },
  sold: { label: "Sold", badge: "bg-red-500 text-white" },
  "not-for-sale": { label: "Not for sale", badge: "bg-slate-400 text-white" },
};

function sqFtToSqYd(sqFt: number): string {
  return `≈ ${Math.round(sqFt / 9)} sq.yd`;
}

function formatPlotSize(plot: Plot): string {
  const dims = plot.dimensions;
  if (!dims) return "—";
  const width = dims.back ?? dims.front;
  const depth = dims.depth;
  if (width && depth) return `${width} x ${depth}`;
  if (width) return width;
  if (depth) return depth;
  return "—";
}

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
          <div className="plot-info-card__panel overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 px-5 pb-1 pt-5">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Unit Details
              </h2>
              <button
                onClick={clear}
                aria-label="Close"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            {plot && (
              <div className="px-5 pb-5 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  General Information
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <InfoField label="Name" value={`Plot ${plot.number}`} />
                  <InfoField
                    label="Status"
                    value={
                      <span
                        className={`inline-flex rounded-full px-3 py-0.5 text-sm font-semibold ${statusMeta.badge}`}
                      >
                        {statusMeta.label}
                      </span>
                    }
                  />
                  <InfoField label="Facing" value={plot.facing ?? "—"} />
                  <InfoField label="Size" value={formatPlotSize(plot)} />
                  <InfoField
                    label="Carpet Area"
                    value={plot.area ? sqFtToSqYd(plot.area) : "—"}
                    className="col-span-2"
                  />
                </div>

                <BookingSection />
              </div>
            )}

            {openSpace && (
              <div className="px-5 pb-5 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  General Information
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <InfoField label="Name" value={openSpace.label ?? "Open Space"} />
                  <InfoField label="Status" value="Open Space" />
                  <InfoField label="Facing" value="—" />
                  <InfoField label="Size" value={openSpace.size ?? "—"} />
                  <InfoField
                    label="Carpet Area"
                    value={openSpace.area ? sqFtToSqYd(openSpace.area) : "—"}
                    className="col-span-2"
                  />
                </div>

                <BookingSection />
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function BookingSection() {
  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <h3 className="text-base font-bold text-slate-900">Booking &amp; Inquiry</h3>
      <p className="mt-1 text-sm leading-snug text-slate-500">
        Contact us for booking assistance and unit inquiries
      </p>
      <ContactCtas variant="outline" className="mt-4" />
    </div>
  );
}

function InfoField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-slate-50 px-3.5 py-3 ${className}`}
    >
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-bold leading-snug text-slate-900">{value}</div>
    </div>
  );
}
