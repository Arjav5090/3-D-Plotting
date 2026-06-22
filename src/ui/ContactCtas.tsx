"use client";

const PHONE_DISPLAY = "9913309434";
const PHONE_E164 = `91${PHONE_DISPLAY}`;

const WHATSAPP_URL = `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(
  "Hi, I'm interested in Vaishnav Villa. Please share more details.",
)}`;

const CALL_URL = `tel:+${PHONE_E164}`;

interface ContactCtasProps {
  layout?: "row" | "stack";
  size?: "sm" | "md";
  className?: string;
}

export function ContactCtas({
  layout = "row",
  size = "md",
  className = "",
}: ContactCtasProps) {
  const stack = layout === "stack";
  const compact = size === "sm";

  return (
    <div
      className={`flex gap-2 ${stack ? "flex-col" : "flex-row"} ${className}`}
      role="group"
      aria-label="Contact options"
    >
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] font-semibold text-white shadow-sm transition hover:bg-[#1fb855] active:scale-[0.98] ${
          compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
        }`}
      >
        <WhatsAppIcon className={compact ? "h-4 w-4" : "h-5 w-5"} />
        WhatsApp
      </a>
      <a
        href={CALL_URL}
        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] ${
          compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
        }`}
      >
        <PhoneIcon className={compact ? "h-4 w-4" : "h-5 w-5"} />
        Call
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
        <PhoneIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </a>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.12 3.358a1 1 0 01-.502 1.21l-1.4.84a11.04 11.04 0 005.516 5.516l.84-1.4a1 1 0 011.21-.502l3.358 1.12a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}
