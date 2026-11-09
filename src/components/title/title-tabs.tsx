"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownUp, Check, ChevronDown, Lock, Play } from "lucide-react";
import type { Title } from "@/data/types";
import { Artwork } from "@/components/ui/artwork";
import { formatDuration, isNewEpisode, isReleased, watchHref } from "@/lib/catalog-utils";
import { continueWatching, isFinished, useProgress } from "@/lib/user-data";

type Tab = "episodes" | "more" | "details";

export function TitleTabs({ title, moreLikeThis }: { title: Title; moreLikeThis: React.ReactNode }) {
  const hasEpisodes = !!title.seasons?.length;
  const [tab, setTab] = useState<Tab>(hasEpisodes ? "episodes" : "more");
  const tabs: { id: Tab; label: string }[] = [
    ...(hasEpisodes ? [{ id: "episodes" as Tab, label: "Episodes" }] : []),
    { id: "more", label: "More Like This" },
    { id: "details", label: "Details" },
  ];

  return (
    <section className="px-gutter">
      <div role="tablist" aria-label="Title sections" className="flex gap-7 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`relative pb-3 text-sm transition-colors ${tab === t.id ? "font-bold text-fg" : "text-muted hover:text-fg"}`}
          >
            {t.label}
            {tab === t.id && <span className="bg-brand absolute inset-x-0 -bottom-px h-0.5 rounded-full" />}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="pt-5">
        {tab === "episodes" && <Episodes title={title} />}
        {tab === "more" && moreLikeThis}
        {tab === "details" && <Details title={title} />}
      </div>
    </section>
  );
}

function Episodes({ title }: { title: Title }) {
  const progress = useProgress();
  const seasons = title.seasons!;
  // open on the season the viewer is currently in
  const current = continueWatching(progress).find((p) => p.slug === title.slug)?.episodeId;
  const initialSeason = seasons.find((s) => s.episodes.some((e) => e.id === current))?.number ?? seasons[seasons.length - 1].number;
  const [seasonNo, setSeasonNo] = useState(initialSeason);
  const [newestFirst, setNewestFirst] = useState(false);

  const season = seasons.find((s) => s.number === seasonNo) ?? seasons[0];
  const episodes = useMemo(
    () => (newestFirst ? [...season.episodes].reverse() : season.episodes),
    [season, newestFirst],
  );
  const released = season.episodes.filter(isReleased).length;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={seasonNo}
            onChange={(e) => setSeasonNo(Number(e.target.value))}
            aria-label="Season"
            className="h-10 appearance-none rounded-lg border border-line bg-surface pl-4 pr-10 text-sm font-medium outline-none transition-colors hover:bg-surface-hover"
          >
            {seasons.map((s) => (
              <option key={s.number} value={s.number}>
                Season {s.number}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        </div>
        <span className="text-xs text-muted">
          {released} episode{released === 1 ? "" : "s"}
          {season.episodes.length > released && ` · ${season.episodes.length - released} coming soon`}
        </span>
        <button
          type="button"
          onClick={() => setNewestFirst((v) => !v)}
          className="ml-auto flex h-9 items-center gap-2 rounded-lg bg-surface px-3 text-xs text-soft transition-colors hover:bg-surface-hover"
        >
          <ArrowDownUp size={14} />
          {newestFirst ? "Newest first" : "Oldest first"}
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-x-3 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:gap-x-4">
        {episodes.map((ep) => {
          const p = progress[ep.id];
          const watched = isFinished(p);
          const isCurrent = ep.id === current;
          const ratio = p ? Math.min(1, p.position / p.duration) : 0;

          if (!isReleased(ep))
            return (
              <div key={ep.id} className="opacity-50">
                <div className="grid aspect-video place-items-center rounded-lg bg-surface text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <Lock size={13} />
                    {new Date(ep.releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-muted">E{ep.number} · Coming soon</p>
              </div>
            );

          return (
            <Link
              key={ep.id}
              href={watchHref(title.slug, ep.id)}
              className={`group block rounded-lg ${isCurrent ? "outline-2 outline-offset-4 outline-lavender" : ""}`}
            >
              <div className="relative overflow-hidden rounded-lg ring-1 ring-white/5">
                <Artwork
                  title={{ ...title, name: ep.name, backdropUrl: ep.thumbUrl ?? title.backdropUrl }}
                  variant="landscape"
                  className="aspect-video transition-[filter] duration-200 group-hover:brightness-115"
                />
                {isNewEpisode(ep) && !watched && (
                  <span className="absolute left-2 top-2 rounded-full bg-bg/85 px-2 py-0.5 text-[10px] font-bold">
                    <span className="text-brand">NEW</span>
                  </span>
                )}
                <span className="absolute bottom-2 right-2 rounded-md bg-bg/85 px-1.5 py-0.5 text-[10px] font-medium">
                  {isCurrent && p ? `${Math.max(1, Math.round((p.duration - p.position) / 60))}m left` : formatDuration(ep.durationSec)}
                </span>
                <span
                  className={`bg-brand absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-bg shadow-lg transition-opacity duration-150 ${
                    isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Play size={16} fill="currentColor" strokeWidth={0} className="ml-0.5" />
                </span>
                {ratio > 0 && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
                    <div className="bg-brand h-full" style={{ width: `${ratio * 100}%` }} />
                  </div>
                )}
              </div>
              <p className={`mt-2 flex items-center gap-1 text-[11px] ${isCurrent ? "font-bold" : "text-muted"}`}>
                {isCurrent ? (
                  <span className="text-brand">E{ep.number} · Continue watching</span>
                ) : (
                  <>
                    E{ep.number}
                    {watched && (
                      <>
                        {" · "}
                        <Check size={12} /> Watched
                      </>
                    )}
                  </>
                )}
              </p>
              <p className="mt-0.5 line-clamp-1 text-[13px] font-semibold">{ep.name}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{ep.description}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function Details({ title }: { title: Title }) {
  const rows: [string, string][] = [
    ["Genres", title.genres.join(", ")],
    ["Studio", title.studio],
    ["Cast", title.cast.join(", ")],
    ["Audio", title.audioLanguages.join(", ")],
    ["Subtitles", title.subtitleLanguages.join(", ")],
    ["Age rating", title.ageRating],
    ["Released", String(title.year)],
  ];
  return (
    <dl className="grid max-w-2xl grid-cols-[120px_1fr] gap-x-6 gap-y-3 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="text-soft">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
