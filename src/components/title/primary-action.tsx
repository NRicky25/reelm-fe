"use client";
import Link from "next/link";
import { Play } from "lucide-react";
import type { Title } from "@/data/types";
import { isFinished, useProgress } from "@/lib/user-data";
import { isReleased, nextEpisode, watchHref } from "@/lib/api";

/**
 * "Play S1 · E1" for new viewers, "Continue S1 · E7" (with a progress bar)
 * once they've started. Movies just say Play / Continue.
 */
export function PrimaryAction({ title }: { title: Title }) {
  const progress = useProgress();
  const entries = Object.values(progress).filter((p) => p.slug === title.slug);
  const last = entries.sort((a, b) => b.updatedAt - a.updatedAt)[0];

  let href = watchHref(title.slug);
  let label = "Play";
  let ratio = 0;
  let left = 0;
  let caption = "";

  if (title.type === "movie") {
    if (last && !isFinished(last) && last.position > 5) {
      label = "Continue";
      ratio = last.position / last.duration;
      left = Math.round((last.duration - last.position) / 60);
      caption = `${left}m left`;
    }
  } else {
    const flat = (title.seasons ?? []).flatMap((s) => s.episodes.map((e) => ({ s: s.number, e })));
    const first = flat.find((x) => isReleased(x.e));
    let target = first;
    if (last?.episodeId) {
      const cur = flat.find((x) => x.e.id === last.episodeId);
      if (cur && !isFinished(last)) {
        target = cur;
        ratio = last.position / last.duration;
        left = Math.round((last.duration - last.position) / 60);
        caption = `${left}m left in Episode ${cur.e.number}`;
      } else if (cur) {
        const nxt = nextEpisode(title, cur.e.id);
        if (nxt) target = { s: nxt.season, e: nxt.episode };
      }
    }
    if (target) {
      href = watchHref(title.slug, target.e.id);
      label = `${ratio > 0 ? "Continue" : "Play"} S${target.s} · E${target.e.number}`;
    }
  }

  return (
    <div>
      <Link
        href={href}
        className="bg-brand inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-bold text-bg transition-transform duration-150 hover:brightness-105 active:scale-[0.97]"
      >
        <Play size={18} fill="currentColor" strokeWidth={0} />
        {label}
      </Link>
      {ratio > 0 && (
        <div className="mt-3 w-56">
          <div className="h-1 overflow-hidden rounded-full bg-white/15">
            <div className="bg-brand h-full rounded-full" style={{ width: `${ratio * 100}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-muted">{caption}</p>
        </div>
      )}
    </div>
  );
}
