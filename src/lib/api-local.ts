// LOCAL data source: the built-in fake catalogue (src/data/titles.ts).
// Used when NEXT_PUBLIC_API_URL isn't set, so the frontend still runs alone.
import { GENRES, TITLES } from "@/data/titles";
import type { Playable, Title, TitleType } from "@/data/types";
import type { DataSource } from "./api-types";
import { BROWSE_TYPES, NEW_MOVIE_DAYS, genreSlug, isNewEpisode, isReleased, latestEpisode, listHeading, today, type BrowseKey } from "./catalog-utils";

const byNewestAdded = (a: Title, b: Title) => b.addedAt.localeCompare(a.addedAt);
const byName = (a: Title, b: Title) => a.name.localeCompare(b.name);

async function getNewEpisodes(type: TitleType = "anime", limit = 18) {
  return TITLES.filter((t) => t.type === type)
    .map((t) => ({ t, latest: latestEpisode(t) }))
    .filter((x) => x.latest && isNewEpisode(x.latest.episode))
    .sort((a, b) => b.latest!.episode.releaseDate.localeCompare(a.latest!.episode.releaseDate))
    .slice(0, limit)
    .map((x) => x.t);
}

const isNewMovie = (t: Title) => (Date.parse(today()) - Date.parse(t.addedAt)) / 86_400_000 <= NEW_MOVIE_DAYS;

export const localSource: DataSource = {
  getTitlesBySlugs: async (slugs) => TITLES.filter((t) => slugs.includes(t.slug)),
  getTitle: async (slug) => TITLES.find((t) => t.slug === slug),
  getFeatured: async () => TITLES.filter((t) => t.featured),
  getStaffPicks: async () => TITLES.filter((t) => t.staffPick),
  getRecentlyAdded: async (limit = 18) => [...TITLES].sort(byNewestAdded).slice(0, limit),
  getNewEpisodes,
  getByGenre: async (genre, type, limit = 18) =>
    TITLES.filter((t) => t.genres.includes(genre) && (!type || t.type === type))
      .sort(byNewestAdded)
      .slice(0, limit),

  getMoreLikeThis: async (title, limit = 12) =>
    TITLES.filter((t) => t.id !== title.id)
      .map((t) => ({ t, shared: t.genres.filter((g) => title.genres.includes(g)).length + (t.type === title.type ? 0.5 : 0) }))
      .filter((x) => x.shared >= 1)
      .sort((a, b) => b.shared - a.shared)
      .slice(0, limit)
      .map((x) => x.t),

  getGenres: async (type) => GENRES[type],

  browse: async (key: BrowseKey, opts) => {
    const { type, label } = BROWSE_TYPES[key];
    const titles = TITLES.filter((t) => t.type === type).sort(byNewestAdded);
    if (opts.genre) {
      const genre = GENRES[type].find((g) => genreSlug(g) === opts.genre);
      if (!genre) return { heading: "Unknown genre", titles: [] };
      return { heading: genre, titles: titles.filter((t) => t.genres.includes(genre)) };
    }
    const heading = listHeading(key, opts.list);
    switch (opts.list) {
      case "new":
        return { heading: heading!, titles: type === "movie" ? titles.filter(isNewMovie) : await getNewEpisodes(type, 100) };
      case "recent":
        return { heading: heading!, titles };
      case "az":
        return { heading: heading!, titles: [...titles].sort(byName) };
      case "sub":
        return { heading: heading!, titles: titles.filter((t) => t.sub) };
      case "dub":
        return { heading: heading!, titles: titles.filter((t) => t.dub) };
    }
    return { heading: `All ${label}`, titles };
  },

  search: async (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return TITLES.filter((t) => t.name.toLowerCase().includes(q) || t.genres.some((g) => g.toLowerCase().includes(q))).sort((a, b) => {
      const as = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bs = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return as - bs || byName(a, b);
    });
  },

  getPlayable: async (slug, episodeId): Promise<Playable | undefined> => {
    const title = TITLES.find((t) => t.slug === slug);
    if (!title) return undefined;
    if (title.type === "movie") {
      if (!title.videoUrl) return undefined;
      return { title, videoUrl: title.videoUrl, durationSec: title.durationSec ?? 0, introStartSec: title.introStartSec, introEndSec: title.introEndSec };
    }
    for (const s of title.seasons ?? []) {
      const ep = episodeId ? s.episodes.find((e) => e.id === episodeId) : s.episodes.find(isReleased);
      if (ep && isReleased(ep))
        return { title, episode: ep, season: s.number, videoUrl: ep.videoUrl!, durationSec: ep.durationSec, introStartSec: ep.introStartSec, introEndSec: ep.introEndSec };
    }
    return undefined;
  },
};
