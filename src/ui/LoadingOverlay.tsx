"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrandHeader } from "@/ui/BrandHeader";
import { PoweredBy } from "@/ui/PoweredBy";
import {
  computeLoadingProgress,
  selectIsAppLoading,
  useLoadingStore,
} from "@/store/useLoadingStore";
import { APP_BACKGROUND_CLASS } from "@/ui/appTheme";

function statusMessage(progress: number): string {
  if (progress < 15) return "Loading site layout…";
  if (progress < 30) return "Initializing 3D viewer…";
  if (progress < 70) return "Loading models and textures…";
  if (progress < 95) return "Finishing touches…";
  return "Almost ready…";
}

export function LoadingOverlay() {
  const loading = useLoadingStore(selectIsAppLoading);
  const progress = useLoadingStore(computeLoadingProgress);
  const [dismissed, setDismissed] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const visible = loading && !dismissed;

  useEffect(() => {
    if (loading) {
      setDismissed(false);
      return;
    }

    const elapsed = Date.now() - startedAt;
    const minMs = 1200;
    const wait = Math.max(0, minMs - elapsed);

    const timer = window.setTimeout(() => setDismissed(true), wait + 350);
    return () => window.clearTimeout(timer);
  }, [loading, startedAt]);

  const message = useMemo(() => statusMessage(progress), [progress]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading-overlay"
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${APP_BACKGROUND_CLASS}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <BrandHeader />
          <PoweredBy />

          <div className="flex max-w-md flex-col items-center gap-5 px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mt-24 space-y-2 sm:mt-28"
            >
              <h2 className="text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">
                Preparing the experience
              </h2>
              <p className="text-sm text-slate-500 sm:text-base">{message}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.45 }}
              className="w-full max-w-xs space-y-2"
            >
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-300/70">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-slate-600 to-slate-800"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ ease: "easeOut", duration: 0.35 }}
                />
              </div>
              <p className="text-xs tabular-nums text-slate-400">
                {Math.round(Math.min(progress, 100))}%
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
