"use client";

import { Phone } from "lucide-react";
import {
  CALL_URL,
  PHONE_DISPLAY,
  WHATSAPP_URL,
} from "@/config/siteContact";
import { WhatsAppIcon } from "@/ui/icons/WhatsAppIcon";

interface ContactCtasProps {
  layout?: "row" | "stack";
  size?: "sm" | "md";
  variant?: "filled" | "outline";
  className?: string;
}

export function ContactCtas({
  layout = "row",
  size = "md",
  variant = "filled",
  className = "",
}: ContactCtasProps) {
  const stack = layout === "stack";
  const compact = size === "sm";
  const outline = variant === "outline";
  const iconClass = compact ? "h-4 w-4" : "h-5 w-5";

  const base =
    "inline-flex flex-1 items-center justify-center gap-2 font-semibold transition active:scale-[0.98]";
  const sizing = compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm";
  const callClass = outline
    ? `${base} ${sizing} rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50`
    : `${base} ${sizing} rounded-xl bg-slate-900 text-white shadow-sm hover:bg-slate-800`;
  const waClass = outline
    ? `${base} ${sizing} rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50`
    : `${base} ${sizing} rounded-xl bg-[#25D366] text-white shadow-sm hover:bg-[#1fb855]`;

  return (
    <div
      className={`flex gap-2 ${stack ? "flex-col" : "flex-row"} ${className}`}
      role="group"
      aria-label="Contact options"
    >
      <a href={CALL_URL} className={callClass}>
        <Phone className={iconClass} strokeWidth={2} aria-hidden />
        Call
      </a>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={waClass}
      >
        <WhatsAppIcon className={iconClass} />
        WhatsApp
      </a>
    </div>
  );
}

/** Always-visible floating contact shortcuts. */
export function FloatingContactCtas() {
  return (
    <div className="pointer-events-auto fixed right-3 z-30 flex flex-col gap-2 top-[calc(var(--header-h)+env(safe-area-inset-top,0px)+0.5rem)] sm:top-1/2 sm:-translate-y-1/2">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/80 transition hover:bg-[#1fb855] active:scale-95 sm:h-14 sm:w-14"
      >
        <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7" />
      </a>
      <a
        href={CALL_URL}
        aria-label={`Call ${PHONE_DISPLAY}`}
        className="grid h-12 w-12 place-items-center rounded-full bg-slate-900 text-white shadow-lg ring-2 ring-white/80 transition hover:bg-slate-800 active:scale-95 sm:h-14 sm:w-14"
      >
        <Phone className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} aria-hidden />
      </a>
    </div>
  );
}
