"use client";
import Link from "next/link";
import { useState } from "react";
import { Bookmark, ChevronDown, X } from "lucide-react";
import type { Title } from "@/data/types";
import { PosterCard } from "@/components/cards/poster-card";
import { PosterGrid } from "@/components/cards/poster-grid";
import { useMyList } from "@/lib/user-data";

type Sort = "added" | "az";

export function MyListView({ titles }: { titles: Title[] }) {
  const { list, remove } = useMyList();
  const [sort, setSort] = useState<Sort>("added");

  const items = list
    .flatMap((entry) => {
      const t = titles.find((x) => x.slug === entry.slug);
      return t ? [{ entry, t }] : [];
    })
    .sort((a, b) => (sort === "az" ? a.t.name.localeCompare(b.t.name) : b.entry.addedAt - a.entry.addedAt));

  return (
    <div className="px-gutter pt-24 sm:pt-28">
      <header className="mb-7 flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">My List</h1>
          <p className="mt-1 text-xs text-muted">
            {items.length} title{items.length === 1 ? "" : "s"}
          </p>
        </div>
        {items.length > 1 && (
          <div className="relative ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort"
              className="h-10 appearance-none rounded-lg border border-line bg-surface pl-4 pr-10 text-sm outline-none hover:bg-surface-hover"
            >
              <option value="added">Date added</option>
              <option value="az">A – Z</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        )}
      </header>

      {items.length > 0 ? (
        <PosterGrid>
          {items.map(({ t }) => (
            <PosterCard
              key={t.id}
              title={t}
              corner={
                <button
                  type="button"
                  onClick={() => remove(t.slug)}
                  aria-label={`Remove ${t.name} from My List`}
                  className="grid size-7 place-items-center rounded-full bg-bg/85 text-fg backdrop-blur transition-[opacity,background-color] hover:bg-surface-hover [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
                >
                  <X size={14} strokeWidth={2.4} />
                </button>
              }
            />
          ))}
        </PosterGrid>
      ) : (
        <div className="mx-auto grid max-w-md place-items-center py-20 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-surface text-lavender">
            <Bookmark size={24} />
          </span>
          <p className="mt-5 text-lg font-bold">Your list is empty</p>
          <p className="mt-1 text-sm text-muted">Tap &ldquo;My List&rdquo; on anything you want to watch later.</p>
          <Link href="/browse/anime" className="bg-brand mt-6 rounded-full px-6 py-2.5 text-sm font-bold text-bg">
            Browse Anime
          </Link>
        </div>
      )}
    </div>
  );
}
