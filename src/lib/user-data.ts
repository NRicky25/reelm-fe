"use client";
// Per-user data (My List, watch progress, profile). Backed by localStorage
// for now; later these become calls to reelm-be.
import { createLocalStore } from "./local-store";

// ───────── My List ─────────
interface ListEntry {
  slug: string;
  addedAt: number;
}
const DEMO_LIST: ListEntry[] = [
  { slug: "echoes-of-the-starfall", addedAt: 6 },
  { slug: "the-last-lighthouse", addedAt: 5 },
  { slug: "hollow-tide", addedAt: 4 },
  { slug: "glass-harbor", addedAt: 3 },
  { slug: "little-bakery-spirits", addedAt: 2 },
  { slug: "mochi-detective", addedAt: 1 },
];
const myListStore = createLocalStore<ListEntry[]>("reelm:my-list", () => DEMO_LIST);

export function useMyList() {
  const list = myListStore.use();
  return {
    list,
    has: (slug: string) => list.some((e) => e.slug === slug),
    toggle: (slug: string) =>
      myListStore.set((prev) =>
        prev.some((e) => e.slug === slug) ? prev.filter((e) => e.slug !== slug) : [{ slug, addedAt: Date.now() }, ...prev],
      ),
    remove: (slug: string) => myListStore.set((prev) => prev.filter((e) => e.slug !== slug)),
  };
}

// ───────── Watch progress ─────────
export interface Progress {
  slug: string;
  episodeId?: string;
  position: number; // seconds
  duration: number; // seconds
  updatedAt: number;
}
type ProgressMap = Record<string, Progress>; // key = episodeId ?? slug

/** Demo progress so "Continue Watching" has something to show on first visit. */
const DEMO_PROGRESS: ProgressMap = Object.fromEntries(
  ([
    ...[1, 2, 3, 4, 5, 6].map((n) => ({ slug: "echoes-of-the-starfall", episodeId: `echoes-of-the-starfall-s2e${n}`, position: 1440, duration: 1440, updatedAt: 10 + n })),
    { slug: "echoes-of-the-starfall", episodeId: "echoes-of-the-starfall-s2e7", position: 1010, duration: 1440, updatedAt: 40 },
    { slug: "paper-kingdoms", episodeId: "paper-kingdoms-s2e1", position: 1440, duration: 1440, updatedAt: 20 },
    { slug: "paper-kingdoms", episodeId: "paper-kingdoms-s2e2", position: 360, duration: 1440, updatedAt: 38 },
    { slug: "mochi-detective", position: 2040, duration: 5880, updatedAt: 36 },
    { slug: "glass-harbor", episodeId: "glass-harbor-s2e3", position: 2900, duration: 3120, updatedAt: 34 },
  ] as Progress[]).map((p) => [p.episodeId ?? p.slug, p]),
);
const progressStore = createLocalStore<ProgressMap>("reelm:progress", () => DEMO_PROGRESS);

export const FINISHED_RATIO = 0.95;
export const isFinished = (p?: Progress) => !!p && p.duration > 0 && p.position / p.duration >= FINISHED_RATIO;

export function useProgress() {
  return progressStore.use();
}

export function saveProgress(p: Omit<Progress, "updatedAt">) {
  progressStore.set((prev) => ({ ...prev, [p.episodeId ?? p.slug]: { ...p, updatedAt: Date.now() } }));
}

export function getSavedProgress(key: string): Progress | undefined {
  return progressStore.get()[key];
}

/** Most recent unfinished item per title, newest first. */
export function continueWatching(map: ProgressMap): Progress[] {
  const latestPerTitle = new Map<string, Progress>();
  for (const p of Object.values(map)) {
    const cur = latestPerTitle.get(p.slug);
    if (!cur || p.updatedAt > cur.updatedAt) latestPerTitle.set(p.slug, p);
  }
  return [...latestPerTitle.values()].filter((p) => !isFinished(p) && p.position > 5).sort((a, b) => b.updatedAt - a.updatedAt);
}

// ───────── Profile (dummy) ─────────
export interface Profile {
  id: string;
  name: string;
  color: string;
}
export const PROFILES: Profile[] = [
  { id: "p1", name: "Ricky", color: "#5b4f80" },
  { id: "p2", name: "Mei", color: "#6a4a5e" },
  { id: "p3", name: "Guest", color: "#3f5a55" },
  { id: "p4", name: "Kids", color: "#5e5540" },
];
const profileStore = createLocalStore<string>("reelm:profile", () => "p1");

export function useProfile() {
  const id = profileStore.use();
  return { profile: PROFILES.find((p) => p.id === id) ?? PROFILES[0], select: (pid: string) => profileStore.set(() => pid) };
}

// ───────── Player preferences ─────────
export interface PlayerPrefs {
  audio: string;
  subtitles: string; // "Off" or a language
  quality: number; // -1 = Auto, otherwise HLS level index
  speed: number;
  volume: number;
  muted: boolean;
}
const prefsStore = createLocalStore<PlayerPrefs>("reelm:player", () => ({
  audio: "Japanese",
  subtitles: "English",
  quality: -1,
  speed: 1,
  volume: 1,
  muted: false,
}));
export const usePlayerPrefs = () => prefsStore.use();
export const setPlayerPrefs = (patch: Partial<PlayerPrefs>) => prefsStore.set((p) => ({ ...p, ...patch }));

// ───────── Recent searches ─────────
const recentStore = createLocalStore<string[]>("reelm:recent-searches", () => []);
export const useRecentSearches = () => recentStore.use();
export const addRecentSearch = (q: string) =>
  recentStore.set((prev) => [q, ...prev.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6));
export const clearRecentSearches = () => recentStore.set(() => []);
