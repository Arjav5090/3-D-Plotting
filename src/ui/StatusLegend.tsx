"use client";

import { useStatusViewStore } from "@/store/useStatusViewStore";

const ITEMS = [
  { key: "available", label: "Available", color: "#22c55e" },
  { key: "sold", label: "Sold", color: "#ef4444" },
] as const;

export function StatusLegend() {
  const active = useStatusViewStore((s) => s.active);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed bottom-[calc(var(--bottom-chrome)+env(safe-area-inset-bottom,0px)+3.25rem)] left-1/2 z-20 -translate-x-1/2 sm:bottom-[calc(var(--bottom-chrome)+env(safe-area-inset-bottom,0px)+3.5rem)]">
      <div className="flex items-center gap-4 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-medium text-slate-700 shadow-md sm:text-sm">
        {ITEMS.map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-sm ring-1 ring-black/10"
              style={{ backgroundColor: color }}
              aria-hidden
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
