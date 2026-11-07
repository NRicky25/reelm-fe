"use client";
// Tiny localStorage-backed store. Stands in for the backend until it exists:
// My List, watch progress, and the chosen profile all live here for now.
import { useSyncExternalStore } from "react";

export function createLocalStore<T>(key: string, initial: () => T) {
  let cache: T | undefined;
  const listeners = new Set<() => void>();

  const read = (): T => {
    if (cache !== undefined) return cache;
    try {
      const raw = localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : initial();
    } catch {
      cache = initial();
    }
    return cache;
  };

  const write = (next: T) => {
    cache = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* storage blocked: keep in memory only */
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = undefined;
        l();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  };

  const serverValue = initial();

  return {
    get: read,
    set: (fn: (prev: T) => T) => write(fn(read())),
    /** Returns `fallback` during server render / first paint, then the stored value. */
    use: () => useSyncExternalStore(subscribe, read, () => serverValue),
  };
}
