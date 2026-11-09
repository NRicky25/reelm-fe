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
  /** Anime & series only */
  seasons?: Season[];
}

/** A single playable thing: a movie, or one episode of a show. */
export interface Playable {
  title: Title;
  episode?: Episode;
  season?: number;
  videoUrl: string;
  durationSec: number;
  introStartSec?: number;
  introEndSec?: number;
}
