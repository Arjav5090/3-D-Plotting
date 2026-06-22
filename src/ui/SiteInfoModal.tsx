"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, X } from "lucide-react";
import {
  CALL_URL,
  COMPANY_NAME,
  INSTAGRAM_URL,
  PROJECT_NAME,
  SITE_TAGLINE,
  WHATSAPP_URL,
} from "@/config/siteContact";
import { WhatsAppIcon } from "@/ui/icons/WhatsAppIcon";
import { InstagramIcon } from "@/ui/icons/InstagramIcon";

interface SiteInfoModalProps {
  open: boolean;
  onClose: () => void;
}

export function SiteInfoModal({ open, onClose }: SiteInfoModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-info-title"
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#141414] text-white shadow-2xl"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/90 transition hover:bg-white/20"
            >
              <X className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>

            <div className="px-6 pb-7 pt-8 text-center">
              <div className="mx-auto mb-5 flex max-w-[240px] flex-col items-center">
                <Image
                  src="/branding/sahaj-group.png"
                  alt={COMPANY_NAME}
                  width={280}
                  height={120}
                  className="h-auto w-full object-contain"
                  priority
                />
                <p
                  id="site-info-title"
                  className="mt-3 text-[11px] font-medium uppercase tracking-[0.28em] text-white/55"
                >
                  {PROJECT_NAME} · SUDA Garden
                </p>
              </div>

              <div className="mx-auto mb-5 h-px w-24 bg-white/15" />

              <p className="mx-auto max-w-xs text-sm leading-relaxed text-white/75">
                {SITE_TAGLINE}
              </p>

              <div className="mx-auto mb-5 mt-6 h-px w-full max-w-xs bg-white/10" />

              <p className="mb-4 text-sm font-medium text-white/90">
                Connect With Us
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <SocialIconLink href={CALL_URL} label="Call us">
                  <Phone className="h-5 w-5" strokeWidth={2} aria-hidden />
                </SocialIconLink>
                <SocialIconLink href={WHATSAPP_URL} label="WhatsApp" external>
                  <WhatsAppIcon className="h-5 w-5" />
                </SocialIconLink>
                <SocialIconLink href={INSTAGRAM_URL} label="Instagram" external>
                  <InstagramIcon className="h-5 w-5" />
                </SocialIconLink>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SocialIconLink({
  href,
  label,
  children,
  external,
}: {
  href: string;
  label: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-[#1f1f1f] text-white/90 transition hover:border-white/30 hover:bg-[#2a2a2a] active:scale-95"
    >
      {children}
    </a>
  );
}
