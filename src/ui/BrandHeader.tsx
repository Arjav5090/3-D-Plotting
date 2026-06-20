"use client";

import Image from "next/image";

interface BrandHeaderProps {
  className?: string;
}

/** Top bar: Sahaj Group (left), Vaishnav Villa (centre), credit (right). */
export function BrandHeader({ className = "" }: BrandHeaderProps) {
  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-30 safe-top ${className}`}
      aria-label="Project branding"
    >
      <div className="mx-auto grid max-w-[100rem] grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 pb-2 pt-2 sm:gap-4 sm:px-5 sm:pb-3 sm:pt-3">
        <div className="justify-self-start">
          <Image
            src="/branding/sahaj-group.png"
            alt="Sahaj Group"
            width={240}
            height={108}
            priority
            className="h-10 w-auto max-w-[38vw] object-contain object-left drop-shadow-md sm:h-16 md:h-20"
          />
        </div>

        <div className="justify-self-center px-1">
          <Image
            src="/branding/vishvanv-villa.png"
            alt="Vaishnav Villa"
            width={360}
            height={120}
            priority
            className="h-9 w-auto max-w-[46vw] object-contain drop-shadow-md sm:h-14 md:h-[4.5rem]"
          />
        </div>

        <p className="justify-self-end text-right text-[9px] font-medium leading-tight tracking-wide text-slate-600/90 sm:text-[11px] md:text-xs">
          Powered by
          <br className="sm:hidden" />
          <span className="font-semibold text-slate-800"> Aarjav Infotech</span>
        </p>
      </div>
    </header>
  );
}
