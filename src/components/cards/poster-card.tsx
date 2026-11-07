import Link from "next/link";
import { Play } from "lucide-react";
import type { Title } from "@/data/types";
import { Artwork } from "@/components/ui/artwork";
import { MyListButton } from "./my-list-button";
import { typeLabel, watchHref } from "@/lib/api";

export interface PosterCardProps {
  title: Title;
  /** Small text under the name. Defaults to "Type · first genre". */
  meta?: string;
  /** Badge in the top-left corner, e.g. "NEW · E8". */
  badge?: string;
  /** Extra overlay control in the top-right corner (e.g. a remove button). */
  corner?: React.ReactNode;
  /** Highlight part of the name (search results). */
  highlight?: string;
}

export function PosterCard({ title, meta, badge, corner, highlight }: PosterCardProps) {
  return (
    <div className="group relative">
      <div className="relative transition-transform duration-200 ease-out-soft group-hover:-translate-y-1">
        <Link href={`/title/${title.slug}`} className="block rounded-lg" aria-label={title.name}>
          <Artwork
            title={title}
            variant="poster"
            className="aspect-[2/3] rounded-lg ring-1 ring-white/5 transition-[filter,box-shadow] duration-200 group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)] group-hover:brightness-110"
          />
        </Link>

        {badge && (
          <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-bg/85 px-2 py-0.5 text-[10px] font-bold backdrop-blur">
            <span className="text-brand">{badge}</span>
          </span>
        )}

        {corner && <div className="absolute right-2 top-2">{corner}</div>}

        {/* Hover actions (mouse only; touch just taps through to the detail page) */}
        <div className="absolute inset-x-2 bottom-2 flex items-center gap-2 opacity-0 transition-opacity duration-150 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
          <Link
            href={watchHref(title.slug)}
            aria-label={`Play ${title.name}`}
            className="bg-brand grid size-8 place-items-center rounded-full text-bg shadow-lg transition-transform duration-150 active:scale-90"
          >
            <Play size={14} fill="currentColor" strokeWidth={0} className="ml-0.5" />
          </Link>
          <MyListButton slug={title.slug} variant="icon" />
        </div>
      </div>

      <Link href={`/title/${title.slug}`} className="mt-2 block" tabIndex={-1}>
        <p className="line-clamp-1 text-[13px] font-semibold">
          <Highlighted text={title.name} query={highlight} />
        </p>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">{meta ?? `${typeLabel(title)} · ${title.genres[0]}`}</p>
      </Link>
    </div>
  );
}

function Highlighted({ text, query }: { text: string; query?: string }) {
  const q = query?.trim();
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="text-brand">{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </>
  );
}
