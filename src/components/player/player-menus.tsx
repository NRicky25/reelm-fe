"use client";
import Link from "next/link";
import { Check, Play, X } from "lucide-react";
import type { Season } from "@/data/types";
import { isReleased, watchHref, formatDuration } from "@/lib/catalog-utils";

export interface MenuSection {
  heading: string;
  options: { label: string; value: string | number }[];
  selected: string | number;
  onSelect: (value: string | number) => void;
}

/** Floating menu above the control bar (subtitles/audio, settings). */
export function PlayerMenu({ sections, onClose }: { sections: MenuSection[]; onClose: () => void }) {
  return (
    <div
      role="menu"
      className="absolute bottom-[calc(100%+12px)] right-0 max-h-[60vh] w-60 animate-[fadeIn_120ms_ease-out] overflow-y-auto rounded-xl border border-line bg-bg/95 p-2 text-sm shadow-2xl backdrop-blur-md"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      {sections.map((s) => (
        <div key={s.heading} className="mb-1 last:mb-0">
          <p className="px-2.5 pb-1 pt-2 text-[10px] font-semibold tracking-[0.15em] text-subtle">{s.heading.toUpperCase()}</p>
          {s.options.map((o) => {
            const on = o.value === s.selected;
            return (
              <button
                key={String(o.value)}
                type="button"
                role="menuitemradio"
                aria-checked={on}
                onClick={() => s.onSelect(o.value)}
                className={`flex w-full items-center rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface ${on ? "bg-surface/70 text-fg" : "text-soft"}`}
              >
                {o.label}
                {on && <Check size={16} className="ml-auto text-lavender" />}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Slide-in list of the current season's episodes. */
export function EpisodesPanel({
  slug,
  season,
  currentId,
  onClose,
}: {
  slug: string;
  season: Season;
  currentId?: string;
  onClose: () => void;
}) {
  return (
    <aside className="absolute inset-y-0 right-0 z-30 flex w-full max-w-sm animate-[fadeIn_150ms_ease-out] flex-col border-l border-line bg-bg/95 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <p className="font-bold">Season {season.number}</p>
        <button type="button" onClick={onClose} aria-label="Close episodes" className="grid size-9 place-items-center rounded-full hover:bg-surface">
          <X size={18} />
        </button>
      </div>
      <ol className="flex-1 overflow-y-auto p-2">
        {season.episodes.map((ep) => {
          const current = ep.id === currentId;
          const released = isReleased(ep);
          const inner = (
            <>
              <span className={`w-6 shrink-0 text-center text-sm tabular-nums ${current ? "text-lavender" : "text-muted"}`}>
                {current ? <Play size={14} fill="currentColor" strokeWidth={0} className="mx-auto" /> : ep.number}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm ${current ? "font-bold" : ""}`}>{ep.name}</span>
                <span className="block text-xs text-muted">{released ? formatDuration(ep.durationSec) : "Coming soon"}</span>
              </span>
            </>
          );
          return (
            <li key={ep.id}>
              {released ? (
                <Link
                  href={watchHref(slug, { season: season.number, number: ep.number })}
                  replace
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface ${current ? "bg-surface/70" : ""}`}
                >
                  {inner}
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-3 py-2.5 opacity-45">{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
