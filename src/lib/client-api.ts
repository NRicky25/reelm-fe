// Catalogue calls made from the BROWSER (search, Continue Watching, My List).
// Talks to reelm-be when configured; otherwise lazy-loads the local fake
// catalogue only when it's actually needed, so it isn't in the page bundle.
import type { Title } from "@/data/types";
import { createRemoteSource } from "./api-remote";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function source() {
  if (API_URL) return createRemoteSource(API_URL);
  return (await import("./api-local")).localSource;
}

export async function searchCatalog(query: string, signal?: AbortSignal): Promise<Title[]> {
  return (await source()).search(query, signal);
}

/** Titles by slug. `full` includes seasons + episodes (needed by Continue Watching). */
export async function fetchTitlesBySlugs(slugs: string[], full = false): Promise<Title[]> {
  if (slugs.length === 0) return [];
  return (await source()).getTitlesBySlugs(slugs, full);
}
