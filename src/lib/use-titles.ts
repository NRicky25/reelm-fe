"use client";
import { useEffect, useState } from "react";
import type { Title } from "@/data/types";
import { fetchTitlesBySlugs } from "./client-api";

/**
 * Load just the titles a viewer needs (their My List / Continue Watching slugs),
 * instead of shipping the whole catalogue with the page.
 */
export function useTitlesBySlugs(slugs: string[], full = false) {
  const key = [...new Set(slugs)].sort().join(",");
  const [state, setState] = useState<{ key: string; titles: Title[]; error: boolean } | null>(null);

  useEffect(() => {
    if (!key) return;
    let alive = true;
    fetchTitlesBySlugs(key.split(","), full)
      .then((titles) => alive && setState({ key, titles, error: false }))
      .catch(() => alive && setState({ key, titles: [], error: true }));
    return () => {
      alive = false;
    };
  }, [key, full]);

  if (!key) return { titles: [] as Title[], loading: false, error: false };
  const ready = state?.key === key;
  return { titles: ready ? state.titles : [], loading: !ready, error: ready && state.error };
}
