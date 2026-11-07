"use client";
import Link from "next/link";
import { Play } from "lucide-react";
import type { Title } from "@/data/types";
import { Artwork } from "@/components/ui/artwork";
import { Row } from "@/components/cards/row";
import { continueWatching, useProgress } from "@/lib/user-data";
import { watchHref } from "@/lib/api";

/** Hidden entirely for viewers who haven't started anything yet. */
export function ContinueWatching({ titles }: { titles: Title[] }) {
  const progress = useProgress();
  const items = continueWatching(progress)
    .map((p) => {
      const title = titles.find((t) => t.slug === p.slug);
      if (!title) return null;
      let label = "";
      let thumb = title.backdropUrl;
      if (p.episodeId) {
        for (const s of title.seasons ?? []) {
          const ep = s.episodes.find((e) => e.id === p.episodeId);
          if (ep) {
            label = `S${s.number} · E${ep.number}`;
            thumb = ep.thumbUrl ?? thumb;
          }
        }
      }
      const left = Math.max(1, Math.round((p.duration - p.position) / 60));
      return { p, title, label, left, thumb };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (items.length === 0) return null;

  return (
    <Row heading="Continue Watching" itemWidth="w-[260px] sm:w-[300px]">
      {items.map(({ p, title, label, left, thumb }) => (
        <Link key={title.slug} href={watchHref(title.slug, p.episodeId)} className="group block">
          <div className="relative overflow-hidden rounded-lg ring-1 ring-white/5">
            <Artwork title={{ ...title, backdropUrl: thumb }} variant="landscape" className="aspect-video transition-[filter] duration-200 group-hover:brightness-110" />
            <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <span className="bg-brand grid size-11 place-items-center rounded-full text-bg shadow-lg">
                <Play size={18} fill="currentColor" strokeWidth={0} className="ml-0.5" />
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
              <div className="bg-brand h-full" style={{ width: `${Math.min(100, (p.position / p.duration) * 100)}%` }} />
            </div>
          </div>
          <p className="mt-2 line-clamp-1 text-[13px] font-semibold">{title.name}</p>
          <p className="text-[11px] text-muted">
            {label && `${label} · `}
            {left}m left
          </p>
        </Link>
      ))}
    </Row>
  );
}
