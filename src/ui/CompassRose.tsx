"use client";

import { useCompassStore } from "@/store/useCompassStore";

/** Site-orientation compass — N/E/S/W track geographic directions on the plan. */
export function CompassRose() {
  const headingDeg = useCompassStore((s) => s.headingDeg);

  return (
    <div
      className="pointer-events-none fixed bottom-[5.25rem] left-3 z-20 safe-bottom sm:bottom-[4.75rem] md:bottom-5 md:left-5"
      aria-label="Site orientation compass"
      role="img"
    >
      <div className="relative flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-white/60 bg-white/95 shadow-md sm:h-14 sm:w-14 md:bg-white/85 md:backdrop-blur">
        <div
          className="absolute inset-0 transition-transform duration-150 ease-out will-change-transform"
          style={{ transform: `rotate(${headingDeg}deg)` }}
        >
          <span className="absolute left-1/2 top-0.5 -translate-x-1/2 text-[10px] font-bold leading-none text-rose-600">
            N
          </span>
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-semibold leading-none text-slate-500">
            E
          </span>
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] font-semibold leading-none text-slate-500">
            S
          </span>
          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-semibold leading-none text-slate-500">
            W
          </span>
          <span
            className="absolute left-1/2 top-[0.4rem] block h-0 w-0 -translate-x-1/2 border-x-[4px] border-b-[7px] border-x-transparent border-b-rose-600"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
