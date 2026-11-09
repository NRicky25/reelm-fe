// Pure helpers shared by pages, components and both data sources.
import type { Episode, Title, TitleType } from "@/data/types";

/**
 * "Today" for release-date logic. NEXT_PUBLIC_CATALOG_TODAY (YYYY-MM-DD) pins it
 * (keep it the same as the backend's CATALOG_TODAY); otherwise the real date.
 */
export const TODAY: string = process.env.NEXT_PUBLIC_CATALOG_TODAY || new Date().toISOString().slice(0, 10);

/** Released AND has a video to play. Anything else shows as "coming soon". */
export const isReleased = (ep: Episode) => ep.releaseDate <= TODAY && !!ep.videoUrl;

/** Newest released episode of a show, if any. */
export function latestEpisode(t: Title): { season: number; episode: Episode } | undefined {
  let best: { season: number; episode: Episode } | undefined;
  for (const s of t.seasons ?? [])
    for (const e of s.episodes)
      if (isReleased(e) && (!best || e.releaseDate >= best.episode.releaseDate)) best = { season: s.number, episode: e };
  return best;
}

/** True if the episode was released in the last 14 days. */
export function isNewEpisode(ep: Episode) {
  if (!isReleased(ep)) return false;
  const days = (Date.parse(TODAY) - Date.parse(ep.releaseDate)) / 86_400_000;
  return days <= 14;
}

/** The released episode after this one (crossing into the next season), if any. */
export function nextEpisode(title: Title, episodeId: string): { season: number; episode: Episode } | undefined {
  const flat = (title.seasons ?? []).flatMap((s) => s.episodes.map((e) => ({ season: s.number, episode: e })));
  const i = flat.findIndex((x) => x.episode.id === episodeId);
  const next = i >= 0 ? flat[i + 1] : undefined;
  return next && isReleased(next.episode) ? next : undefined;
}

// ───────── Browse ─────────
export const BROWSE_TYPES = {
  anime: { type: "anime" as TitleType, label: "Anime" },
  movies: { type: "movie" as TitleType, label: "Movies" },
  series: { type: "series" as TitleType, label: "Series" },
};
export type BrowseKey = keyof typeof BROWSE_TYPES;
export const isBrowseKey = (k: string): k is BrowseKey => k in BROWSE_TYPES;

export const genreSlug = (g: string) => g.toLowerCase().replace(/\s+/g, "-");

/** Heading for a Browse page from its ?list= value. */
export function listHeading(key: BrowseKey, list?: string): string | undefined {
  switch (list) {
    case "new":
      return key === "movies" ? "New Releases" : "New Episodes";
    case "recent":
      return "Recently Added";
    case "az":
      return "A – Z";
    case "sub":
      return "Subtitled";
    case "dub":
      return "Dubbed";
  }
  return undefined;
}

// ───────── Formatting & links ─────────
export function watchHref(slug: string, episodeId?: string) {
  return episodeId ? `/watch/${slug}?ep=${episodeId}` : `/watch/${slug}`;
}

export function typeLabel(t: Title) {
  return t.type === "anime" ? "Anime" : t.type === "movie" ? "Movie" : "Series";
}

export function formatDuration(sec: number) {
  const m = Math.round(sec / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m` : `${m}m`;
}
