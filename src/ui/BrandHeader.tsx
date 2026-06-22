"use client";

import Image from "next/image";

interface BrandHeaderProps {
  className?: string;
}

/** Top bar: Sahaj Group (left), Vaishnav Villa (centre), Powered by (right). */
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

        <div
          className="justify-self-end flex flex-col items-end gap-0.5"
          aria-label="Powered by Aarjav Infotech"
        >
          <p className="text-[9px] font-medium tracking-wide text-slate-600/90 sm:text-[10px]">
            Powered by
          </p>
          <div className="flex items-center gap-1.5">
            <Image
              src="/branding/AarjavInfotech.svg"
              alt=""
              width={383}
              height={316}
              unoptimized
              className="h-6 w-auto drop-shadow-sm sm:h-7"
            />
            <span className="text-[10px] font-semibold leading-tight text-slate-800 sm:text-xs">
              Aarjav Infotech
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
