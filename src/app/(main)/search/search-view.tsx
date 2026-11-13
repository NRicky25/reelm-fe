"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Clock, Search, X } from "lucide-react";
import type { Title, TitleType } from "@/data/types";
import { PosterCard } from "@/components/cards/poster-card";
import { PosterGrid } from "@/components/cards/poster-grid";
import { genreSlug } from "@/lib/catalog-utils";
import { searchCatalog } from "@/lib/client-api";
import { addRecentSearch, clearRecentSearches, useRecentSearches } from "@/lib/user-data";

type TabId = "all" | TitleType;
const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "anime", label: "Anime" },
  { id: "movie", label: "Movies" },
  { id: "series", label: "Series" },
];

export function SearchView({ animeGenres }: { animeGenres: string[] }) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [tab, setTab] = useState<TabId>("all");
  const [results, setResults] = useState<Title[]>([]);
  const [failed, setFailed] = useState(false);
  const recent = useRecentSearches();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => input.current?.focus(), []);

  // Live results, and keep ?q= in the URL (debounced) so back/share works.
  // Uses history.replaceState, NOT router.replace: router.replace is a full
  // Next.js navigation (server round-trip + transition) and a pending one
  // blocks / overrides other navigations, e.g. clicking the logo to go Home.
  useEffect(() => {
    const q = query.trim();
    // Wait for a short pause in typing, and cancel the previous request when
    // the query changes, so we don't fire one request per keystroke.
    const controller = new AbortController();
    const fetchTimer = setTimeout(() => {
      searchCatalog(q, controller.signal)
        .then((r) => {
          setResults(r);
          setFailed(false);
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return; // superseded by a newer query
          console.error("Search failed", err);
          setResults([]);
          setFailed(true);
        });
    }, q ? 200 : 0);
    const id = setTimeout(() => {
      if (window.location.pathname !== "/search") return; // already navigating away
      const next = q ? `/search?q=${encodeURIComponent(q)}` : "/search";
      if (window.location.pathname + window.location.search !== next) window.history.replaceState(null, "", next);
      if (q.length >= 2) addRecentSearch(q);
    }, 600);
    return () => {
      controller.abort();
      clearTimeout(fetchTimer);
      clearTimeout(id);
    };
  }, [query]);

  const count = (id: TabId) => (id === "all" ? results.length : results.filter((r) => r.type === id).length);
  const shown = tab === "all" ? results : results.filter((r) => r.type === tab);
  const q = query.trim();

  return (
    <div className="px-gutter pt-20 sm:pt-24">
      <div className="relative mx-auto max-w-3xl">
        <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted flex"><Search size={22} /></span>
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles, genres…"
          aria-label="Search"
          enterKeyHint="search"
          className="h-14 w-full rounded-2xl border border-line bg-surface pl-14 pr-14 text-base outline-none focus-visible:outline-none transition-[border-color,box-shadow] placeholder:text-subtle focus:border-lavender/60 focus:shadow-[0_0_0_0.25rem_rgba(169,156,240,0.15)] sm:h-16 sm:text-lg [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              input.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-hover hover:text-fg"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {!q ? (
        <div className="mx-auto mt-10 max-w-3xl space-y-10">
          {recent.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold">Recent searches</h2>
                <button type="button" onClick={clearRecentSearches} className="text-xs text-muted hover:text-fg">
                  Clear
                </button>
              </div>
              <ul className="space-y-1">
                {recent.map((r) => (
                  <li key={r}>
                    <button
                      type="button"
                      onClick={() => setQuery(r)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-soft hover:bg-surface"
                    >
                      <Clock size={16} className="text-subtle" />
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="mb-3 text-sm font-bold">Browse anime by genre</h2>
            <div className="flex flex-wrap gap-2">
              {animeGenres.map((g) => (
                <Link
                  key={g}
                  href={`/browse/anime?genre=${genreSlug(g)}`}
                  className="rounded-full border border-line px-3.5 py-2 text-[0.8125rem] text-soft transition-colors hover:bg-surface"
                >
                  {g}
                </Link>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <>
          <div role="tablist" className="scrollbar-none mx-auto mt-6 flex w-fit max-w-full overflow-x-auto rounded-xl bg-surface p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm transition-colors ${
                  tab === t.id ? "bg-surface-hover text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {t.label} <span className="text-subtle">· {count(t.id)}</span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            {failed ? (
              <div className="py-20 text-center">
                <p className="font-semibold">Search isn&rsquo;t available right now</p>
                <p className="mt-1 text-sm text-muted">Please try again in a moment.</p>
              </div>
            ) : shown.length > 0 ? (
              <PosterGrid>
                {shown.map((t) => (
                  <PosterCard key={t.id} title={t} highlight={q} />
                ))}
              </PosterGrid>
            ) : (
              <div className="py-20 text-center">
                <p className="font-semibold">Nothing found for &ldquo;{q}&rdquo;</p>
                <p className="mt-1 text-sm text-muted">Try another title or genre.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
