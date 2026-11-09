// REMOTE data source: calls reelm-be (NEXT_PUBLIC_API_URL).
import type { Episode, Playable, Title } from "@/data/types";
import type { DataSource } from "./api-types";
import { BROWSE_TYPES, genreSlug, listHeading } from "./catalog-utils";

/** How long server-rendered pages may reuse a response before refetching (seconds). */
const REVALIDATE = 60;

export class ApiError extends Error {
  constructor(
    public status: number,
    public path: string,
  ) {
    super(`Reelm API ${status} for ${path}`);
  }
}

type Query = Record<string, string | number | boolean | undefined>;

export function createRemoteSource(baseUrl: string): DataSource {
  const base = baseUrl.replace(/\/+$/, "");

  async function get<T>(path: string, query: Query = {}, opts: { allow404?: boolean } = {}): Promise<T | undefined> {
    const qs = new URLSearchParams(Object.entries(query).flatMap(([k, v]) => (v === undefined ? [] : [[k, String(v)]]))).toString();
    const url = `${base}${path}${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (res.status === 404 && opts.allow404) return undefined;
    if (!res.ok) throw new ApiError(res.status, path);
    return (await res.json()) as T;
  }
  const list = async (path: string, query: Query = {}) => (await get<Title[]>(path, query)) ?? [];

  return {
    getTitles: () => list("/titles"),
    getTitle: (slug) => get<Title>(`/titles/${encodeURIComponent(slug)}`, {}, { allow404: true }),
    getFeatured: () => list("/titles", { featured: true }),
    getStaffPicks: () => list("/titles", { staffPick: true }),
    getRecentlyAdded: (limit = 18) => list("/titles", { list: "recent", limit }),
    getNewEpisodes: (type = "anime", limit = 18) => list("/titles", { type, list: "new", limit }),
    getByGenre: (genre, type, limit = 18) => list("/titles", { genre, type, limit }),
    getMoreLikeThis: async (title, limit = 12) =>
      (await get<Title[]>(`/titles/${encodeURIComponent(title.slug)}/related`, { limit }, { allow404: true })) ?? [],
    getGenres: async (type) => (await get<string[]>("/genres", { type })) ?? [],

    browse: async (key, opts) => {
      const { type, label } = BROWSE_TYPES[key];
      if (opts.genre) {
        const name = (await get<string[]>("/genres", { type }))?.find((g) => genreSlug(g) === opts.genre);
        if (!name) return { heading: "Unknown genre", titles: [] };
        return { heading: name, titles: await list("/titles", { type, genre: opts.genre }) };
      }
      const heading = listHeading(key, opts.list);
      if (!heading) return { heading: `All ${label}`, titles: await list("/titles", { type }) };
      return { heading, titles: await list("/titles", { type, list: opts.list }) };
    },

    search: async (query) => {
      const q = query.trim();
      if (!q) return [];
      // called from the browser while typing: always fresh
      const res = await fetch(`${base}/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
      if (!res.ok) throw new ApiError(res.status, "/search");
      return (await res.json()) as Title[];
    },

    getPlayable: async (slug, episodeId) => {
      const p = await get<{ title: Title; episode?: Episode; season?: number; videoUrl: string; durationSec: number; introStartSec?: number; introEndSec?: number }>(
        `/playback/${encodeURIComponent(slug)}`,
        { ep: episodeId },
        { allow404: true },
      );
      if (!p) return undefined;
      const playable: Playable = {
        title: p.title,
        episode: p.episode,
        season: p.season,
        videoUrl: p.videoUrl,
        durationSec: p.durationSec,
        introStartSec: p.introStartSec,
        introEndSec: p.introEndSec,
      };
      return playable;
    },
  };
}
