// Shapes of the data the frontend expects.
// When the backend exists, its API should return these same shapes.

export type TitleType = "anime" | "movie" | "series";

export interface Episode {
  id: string;
  number: number;
  name: string;
  description: string;
  durationSec: number;
  /** ISO date. Episodes with a future date show as locked "coming soon". */
  releaseDate: string;
  /** Episode thumbnail image. */
  thumbUrl?: string;
  introStartSec?: number;
  introEndSec?: number;
  /** Where the end credits start (seconds); they run to the end. */
  outroStartSec?: number;
  /** Missing when the episode has no playable video yet. */
  videoUrl?: string;
}

export interface Season {
  number: number;
  episodes: Episode[];
}

export interface Title {
  id: string;
  slug: string;
  type: TitleType;
  name: string;
  description: string;
  year: number;
  genres: string[];
  ageRating: string;
  /** Anime only: whether subtitled / dubbed versions exist. */
  sub?: boolean;
  dub?: boolean;
  audioLanguages: string[];
  subtitleLanguages: string[];
  /** Two colors used to paint placeholder artwork until real images exist. */
  colors: [string, string];
  posterUrl?: string;
  backdropUrl?: string;
  /** Horizontal focus (0–100) when the backdrop is cropped into a tall poster. */
  posterFocusX?: number;
  featured?: boolean;
  staffPick?: boolean;
  /** ISO date the title was added to Reelm. */
  addedAt: string;
  studio: string;
  cast: string[];
  /** Movies only */
  durationSec?: number;
  videoUrl?: string;
  introStartSec?: number;
  introEndSec?: number;
  /** Where the end credits start (seconds); they run to the end. */
  outroStartSec?: number;
  /** Anime & series only */
  seasons?: Season[];
  /** Newest playable episode. List endpoints send this instead of `seasons`. */
  latestEpisode?: { season: number; id: string; number: number; releaseDate: string };
}

/** A subtitle file (WebVTT) for a video. */
export interface SubtitleTrack {
  /** Language code, e.g. "en". */
  lang: string;
  url: string;
}

/** Points at one episode by season + episode number (what watch links use). */
export interface EpisodeRef {
  season: number;
  number: number;
}

/** A single playable thing: a movie, or one episode of a show. */
export interface Playable {
  title: Title;
  episode?: Episode;
  season?: number;
  videoUrl: string;
  /** Subtitle files for this video (empty when there are none). */
  subtitles?: SubtitleTrack[];
  durationSec: number;
  introStartSec?: number;
  introEndSec?: number;
  /** Where the end credits start (seconds); they run to the end. */
  outroStartSec?: number;
}
