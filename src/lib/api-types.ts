import type { Playable, Title, TitleType } from "@/data/types";
import type { BrowseKey } from "./catalog-utils";

/** Everything the pages need from a catalogue source (local fake data or reelm-be). */
export interface DataSource {
  getTitles(): Promise<Title[]>;
  getTitle(slug: string): Promise<Title | undefined>;
  getFeatured(): Promise<Title[]>;
  getStaffPicks(): Promise<Title[]>;
  getRecentlyAdded(limit?: number): Promise<Title[]>;
  getNewEpisodes(type?: TitleType, limit?: number): Promise<Title[]>;
  getByGenre(genre: string, type?: TitleType, limit?: number): Promise<Title[]>;
  getMoreLikeThis(title: Title, limit?: number): Promise<Title[]>;
  getGenres(type: TitleType): Promise<string[]>;
  browse(key: BrowseKey, opts: { genre?: string; list?: string }): Promise<{ heading: string; titles: Title[] }>;
  search(query: string): Promise<Title[]>;
  getPlayable(slug: string, episodeId?: string): Promise<Playable | undefined>;
}
