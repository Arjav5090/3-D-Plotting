"use client";

/**
 * React hook that loads + validates the site document.
 *
 * It fetches the static JSON, runs it through the Zod schema (so the rest of
 * the app can trust the shape), and exposes a simple {data, loading, error}
 * state. Validation lives at this boundary so no component downstream ever
 * touches unvalidated data.
 */
import { useEffect, useState } from "react";
import type { SiteData } from "@/domain/types/site";
import { parseSiteData } from "@/data/validation/site.zod";

export interface SiteDataState {
  data: SiteData | null;
  loading: boolean;
  error: string | null;
}

export function useSiteData(url = "/data/site.json"): SiteDataState {
  const [state, setState] = useState<SiteDataState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
        const json = await res.json();
        const data = parseSiteData(json);
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (err) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
