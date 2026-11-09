// Search from the browser (Search page). Talks to reelm-be when configured;
// otherwise lazy-loads the local fake catalogue only when it's actually needed.
import type { Title } from "@/data/types";
import { createRemoteSource } from "./api-remote";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function searchCatalog(query: string): Promise<Title[]> {
  if (API_URL) return createRemoteSource(API_URL).search(query);
  const { localSource } = await import("./api-local");
  return localSource.search(query);
}
