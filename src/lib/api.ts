// ─────────────────────────────────────────────────────────────
// Data access layer. Every page gets its data ONLY through these
// functions. When the backend (reelm-be) is ready, replace the
// bodies with fetch() calls and keep the same signatures.
// ─────────────────────────────────────────────────────────────
import { GENRES, TITLES, TODAY } from "@/data/titles";
import type { Episode, Playable, Title, TitleType } from "@/data/types";

const byNewestAdded = (a: Title, b: Title) => b.addedAt.localeCompare(a.addedAt);
const byName = (a: Title, b: Title) => a.name.localeCompare(b.name);

export const isReleased = (ep: Episode) => ep.releaseDate <= TODAY;

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

export async function getTitles(): Promise<Title[]> {
  return TITLES;
}

export async function getTitle(slug: string): Promise<Title | undefined> {
  return TITLES.find((t) => t.slug === slug);
}

export async function getFeatured(): Promise<Title[]> {
  return TITLES.filter((t) => t.featured);
}

export async function getStaffPicks(): Promise<Title[]> {
  return TITLES.filter((t) => t.staffPick);
}

export async function getRecentlyAdded(limit = 18): Promise<Title[]> {
  return [...TITLES].sort(byNewestAdded).slice(0, limit);
}

/** Shows with an episode released in the last 14 days, newest first. */
export async function getNewEpisodes(type: TitleType = "anime", limit = 18): Promise<Title[]> {
  return TITLES.filter((t) => t.type === type)
    .map((t) => ({ t, latest: latestEpisode(t) }))
    .filter((x) => x.latest && isNewEpisode(x.latest.episode))
    .sort((a, b) => b.latest!.episode.releaseDate.localeCompare(a.latest!.episode.releaseDate))
    .slice(0, limit)
    .map((x) => x.t);
}

export async function getByGenre(genre: string, type?: TitleType, limit = 18): Promise<Title[]> {
  return TITLES.filter((t) => t.genres.includes(genre) && (!type || t.type === type)).slice(0, limit);
}

export async function getMoreLikeThis(title: Title, limit = 12): Promise<Title[]> {
  return TITLES.filter((t) => t.id !== title.id)
    .map((t) => ({ t, shared: t.genres.filter((g) => title.genres.includes(g)).length + (t.type === title.type ? 0.5 : 0) }))
    .filter((x) => x.shared >= 1)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, limit)
    .map((x) => x.t);
}

// ───────── Browse ─────────
export const BROWSE_TYPES = {
  anime: { type: "anime" as TitleType, label: "Anime" },
  movies: { type: "movie" as TitleType, label: "Movies" },
  series: { type: "series" as TitleType, label: "Series" },
};
export type BrowseKey = keyof typeof BROWSE_TYPES;

export const BROWSE_LISTS: Record<string, string> = {
  new: "New Episodes",
  recent: "Recently Added",
  az: "A – Z",
  sub: "Subtitled",
  dub: "Dubbed",
};

export function genresFor(key: BrowseKey) {
  return GENRES[BROWSE_TYPES[key].type];
}

export const genreSlug = (g: string) => g.toLowerCase().replace(/\s+/g, "-");

export async function browse(
  key: BrowseKey,
  opts: { genre?: string; list?: string },
): Promise<{ heading: string; titles: Title[] }> {
  const { type, label } = BROWSE_TYPES[key];
  const titles = TITLES.filter((t) => t.type === type).sort(byNewestAdded);

  if (opts.genre) {
    const genre = genresFor(key).find((g) => genreSlug(g) === opts.genre);
    if (!genre) return { heading: "Unknown genre", titles: [] };
    return { heading: genre, titles: titles.filter((t) => t.genres.includes(genre)) };
  }
  switch (opts.list) {
    case "new":
      return { heading: type === "movie" ? "New Releases" : "New Episodes", titles: type === "movie" ? titles.filter((t) => t.year >= 2026) : await getNewEpisodes(type, 100) };
    case "recent":
      return { heading: "Recently Added", titles };
    case "az":
      return { heading: "A – Z", titles: [...titles].sort(byName) };
    case "sub":
      return { heading: "Subtitled", titles: titles.filter((t) => t.sub) };
    case "dub":
      return { heading: "Dubbed", titles: titles.filter((t) => t.dub) };
  }
  return { heading: `All ${label}`, titles };
}

// ───────── Search ─────────
export async function search(query: string): Promise<Title[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return TITLES.filter(
    (t) => t.name.toLowerCase().includes(q) || t.genres.some((g) => g.toLowerCase().includes(q)),
  ).sort((a, b) => {
    // titles whose name starts with the query come first
    const as = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bs = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    return as - bs || byName(a, b);
  });
}

// ───────── Playback ─────────
export async function getPlayable(slug: string, episodeId?: string): Promise<Playable | undefined> {
  const title = await getTitle(slug);
  if (!title) return undefined;
  if (title.type === "movie") {
    return {
      title,
      videoUrl: title.videoUrl!,
      durationSec: title.durationSec!,
      introStartSec: title.introStartSec,
      introEndSec: title.introEndSec,
    };
  }
  for (const s of title.seasons ?? []) {
    const ep = episodeId ? s.episodes.find((e) => e.id === episodeId) : s.episodes[0];
    if (ep && isReleased(ep))
      return { title, episode: ep, season: s.number, videoUrl: ep.videoUrl, durationSec: ep.durationSec, introStartSec: ep.introStartSec, introEndSec: ep.introEndSec };
  }
  return undefined;
}

/** The released episode after this one (crossing into the next season), if any. */
export function nextEpisode(title: Title, episodeId: string): { season: number; episode: Episode } | undefined {
  const flat = (title.seasons ?? []).flatMap((s) => s.episodes.map((e) => ({ season: s.number, episode: e })));
  const i = flat.findIndex((x) => x.episode.id === episodeId);
  const next = i >= 0 ? flat[i + 1] : undefined;
  return next && isReleased(next.episode) ? next : undefined;
}

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
