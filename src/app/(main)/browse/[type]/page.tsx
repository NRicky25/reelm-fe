import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PosterCard } from "@/components/cards/poster-card";
import { PosterGrid } from "@/components/cards/poster-grid";
import { BROWSE_TYPES, browse, type BrowseKey } from "@/lib/api";

type Props = {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ genre?: string; list?: string }>;
};

const isKey = (k: string): k is BrowseKey => k in BROWSE_TYPES;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { type } = await params;
  if (!isKey(type)) return {};
  const { heading } = await browse(type, await searchParams);
  return { title: heading.startsWith("All") ? heading : `${heading} ${BROWSE_TYPES[type].label}` };
}

export default async function BrowsePage({ params, searchParams }: Props) {
  const { type } = await params;
  if (!isKey(type)) notFound();
  const { heading, titles } = await browse(type, await searchParams);
  const label = BROWSE_TYPES[type].label;

  return (
    <div className="px-gutter pt-24 sm:pt-28">
      <header className="mb-7">
        <p className="text-xs font-medium text-muted">{label}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{heading}</h1>
      </header>

      {titles.length > 0 ? (
        <PosterGrid>
          {titles.map((t) => (
            <PosterCard key={t.id} title={t} meta={`${t.year} · ${t.genres.slice(0, 2).join(", ")}`} />
          ))}
        </PosterGrid>
      ) : (
        <div className="grid place-items-center rounded-2xl border border-dashed border-line px-6 py-20 text-center">
          <p className="font-semibold">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted">New titles are added every week.</p>
          <Link href={`/browse/${type}`} className="mt-5 text-sm font-semibold text-lavender hover:text-mauve">
            See all {label}
          </Link>
        </div>
      )}
    </div>
  );
}
