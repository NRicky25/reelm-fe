"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Info, Play } from "lucide-react";
import type { Title } from "@/data/types";
import { Artwork } from "@/components/ui/artwork";
import { MyListButton } from "@/components/cards/my-list-button";
import { formatDuration, typeLabel, watchHref } from "@/lib/api";

const ROTATE_MS = 8000;

export function Hero({ titles }: { titles: Title[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || titles.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % titles.length), ROTATE_MS);
    return () => clearTimeout(id);
  }, [index, paused, titles.length]);

  if (titles.length === 0) return null;
  const t = titles[index];
  const meta = [
    t.year,
    t.type === "movie" ? formatDuration(t.durationSec ?? 0) : `${t.seasons?.length ?? 1} Season${(t.seasons?.length ?? 1) > 1 ? "s" : ""}`,
    t.genres.slice(0, 2).join(", "),
    t.ageRating,
  ];

  return (
    <section
      className="relative h-[78vh] min-h-[520px] max-h-[820px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured titles"
    >
      {/* Backdrops cross-fade */}
      {titles.map((ft, i) => (
        <div
          key={ft.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-out-soft ${i === index ? "opacity-100" : "opacity-0"}`}
          aria-hidden={i !== index}
        >
          <Artwork title={ft} variant="backdrop" className="size-full" priority={i === 0} />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent sm:via-bg/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />

      <div key={t.id} className="absolute inset-x-4 bottom-14 max-w-xl animate-[heroIn_500ms_cubic-bezier(0.22,1,0.36,1)] sm:inset-x-7 sm:bottom-20">
        <p className="text-brand text-[11px] font-bold tracking-[0.18em]">FEATURED · {typeLabel(t).toUpperCase()}</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">{t.name}</h1>
        <p className="mt-3 text-[13px] text-muted">{meta.join(" · ")}</p>
        <p className="mt-3 line-clamp-3 max-w-lg text-sm leading-relaxed text-soft sm:text-[15px]">{t.description}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={watchHref(t.slug)}
            className="bg-brand flex h-11 items-center gap-2 rounded-full px-6 text-sm font-bold text-bg transition-transform duration-150 hover:brightness-105 active:scale-[0.97]"
          >
            <Play size={18} fill="currentColor" strokeWidth={0} />
            Play
          </Link>
          <MyListButton slug={t.slug} />
          <Link
            href={`/title/${t.slug}`}
            className="flex h-11 items-center gap-2 rounded-full bg-surface/90 px-5 text-sm font-medium backdrop-blur transition-[background-color,transform] duration-150 hover:bg-surface-hover active:scale-[0.97]"
          >
            <Info size={18} />
            More info
          </Link>
        </div>
      </div>

      {titles.length > 1 && (
        <div className="absolute bottom-8 right-4 flex gap-1.5 sm:bottom-20 sm:right-7">
          {titles.map((ft, i) => (
            <button
              key={ft.id}
              type="button"
              aria-label={`Show ${ft.name}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className="grid h-6 place-items-center"
            >
              <span className={`block h-1 rounded-full transition-all duration-300 ${i === index ? "bg-brand w-6" : "w-2 bg-white/25 hover:bg-white/40"}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
