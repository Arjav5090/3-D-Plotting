"use client";

import { useEffect } from "react";
import { useSiteData } from "@/data/loaders/useSiteData";
import { useLoadingStore } from "@/store/useLoadingStore";

/** Syncs site JSON fetch state into the global loading store. */
export function SiteDataBridge() {
  const { loading } = useSiteData();
  const setSiteLoading = useLoadingStore((s) => s.setSiteLoading);

  useEffect(() => {
    setSiteLoading(loading);
  }, [loading, setSiteLoading]);

  return null;
}
