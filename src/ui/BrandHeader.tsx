"use client";

import Image from "next/image";

interface BrandHeaderProps {
  className?: string;
}

/** Sahaj Group (top-left) + Vaishnav Villa (top-centre) — shared by loader and main view. */
export function BrandHeader({ className = "" }: BrandHeaderProps) {
  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-30 ${className}`}
      aria-label="Project branding"
    >
      <div className="absolute left-3 top-3 sm:left-5 sm:top-4">
        <Image
          src="/branding/sahaj-group.png"
          alt="Sahaj Group"
          width={240}
          height={108}
          priority
          className="h-16 w-auto object-contain drop-shadow-md sm:h-20 md:h-24"
        />
      </div>

      <div className="absolute left-1/2 top-2 -translate-x-1/2 sm:top-3">
        <Image
          src="/branding/vishvanv-villa.png"
          alt="Vaishnav Villa"
          width={360}
          height={120}
          priority
          className="h-14 w-auto object-contain drop-shadow-md sm:h-20 md:h-[5.5rem]"
        />
      </div>
    </header>
  );
}
