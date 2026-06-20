"use client";

interface PoweredByProps {
  className?: string;
}

export function PoweredBy({ className = "" }: PoweredByProps) {
  return (
    <div
      className={`pointer-events-none fixed right-3 top-14 z-30 safe-top sm:bottom-5 sm:left-5 sm:right-auto sm:top-auto ${className}`}
    >
      <p className="text-[11px] font-medium tracking-wide text-slate-600/90 sm:text-xs">
        Powered by{" "}
        <span className="font-semibold text-slate-800">Aarjav Infotech</span>
      </p>
    </div>
  );
}
