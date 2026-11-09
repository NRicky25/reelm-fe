// ─────────────────────────────────────────────────────────────
// Data access layer. Every page gets catalogue data ONLY through here.
//
//   NEXT_PUBLIC_API_URL set   → reelm-be (src/lib/api-remote.ts)
//   NEXT_PUBLIC_API_URL unset → built-in fake data (src/lib/api-local.ts)
// ─────────────────────────────────────────────────────────────
import type { DataSource } from "./api-types";
import { localSource } from "./api-local";
import { createRemoteSource } from "./api-remote";

export * from "./catalog-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const usingBackend = !!API_URL;

const source: DataSource = API_URL ? createRemoteSource(API_URL) : localSource;

export const getTitlesBySlugs = source.getTitlesBySlugs;
export const getTitle = source.getTitle;
export const getFeatured = source.getFeatured;
export const getStaffPicks = source.getStaffPicks;
export const getRecentlyAdded = source.getRecentlyAdded;
export const getNewEpisodes = source.getNewEpisodes;
export const getByGenre = source.getByGenre;
export const getMoreLikeThis = source.getMoreLikeThis;
export const getGenres = source.getGenres;
export const browse = source.browse;
export const search = source.search;
export const getPlayable = source.getPlayable;
