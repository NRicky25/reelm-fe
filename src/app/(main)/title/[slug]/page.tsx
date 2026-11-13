import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Artwork } from "@/components/ui/artwork";
import { MyListButton } from "@/components/cards/my-list-button";
import { PosterCard } from "@/components/cards/poster-card";
import { PosterGrid } from "@/components/cards/poster-grid";
import { PrimaryAction } from "@/components/title/primary-action";
import { ShareButton } from "@/components/title/share-button";
import { TitleTabs } from "@/components/title/title-tabs";
import { formatDuration, getMoreLikeThis, getTitle, typeLabel } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const title = await getTitle((await params).slug);
  return title ? { title: title.name, description: title.description } : {};
}

export default async function TitlePage({ params }: Props) {
  const title = await getTitle((await params).slug);
  if (!title) notFound();
  const more = await getMoreLikeThis(title);

  const seasons = title.seasons?.length ?? 0;
  const meta = [
    title.year,
    title.type === "movie" ? `Movie · ${formatDuration(title.durationSec ?? 0)}` : `${typeLabel(title)} Series · ${seasons} Season${seasons > 1 ? "s" : ""}`,
    title.ageRating,
    title.type === "anime" ? [title.sub && "Sub", title.dub && "Dub"].filter(Boolean).join(" | ") : null,
  ].filter(Boolean);

  return (
    <>
      <section className="relative min-h-[35rem] overflow-hidden pt-16">
        <Artwork title={title} variant="backdrop" className="!absolute inset-0" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/75 to-bg/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />

        <div className="relative flex flex-col gap-7 px-gutter pb-12 pt-16 sm:flex-row sm:items-end sm:pt-28">
          <Artwork
            title={title}
            variant="poster"
            className="hidden aspect-[2/3] w-[11.25rem] shrink-0 rounded-xl shadow-[0_1rem_2.5rem_rgba(0,0,0,0.5)] ring-1 ring-white/10 sm:block lg:w-[13.125rem]"
          />
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">{title.name}</h1>
            <p className="mt-3 text-[0.8125rem] text-muted">{meta.join(" · ")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {title.genres.map((g) => (
                <span key={g} className="rounded-full bg-surface/90 px-3 py-1 text-xs text-soft">
                  {g}
                </span>
              ))}
            </div>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-soft sm:text-[0.9375rem]">{title.description}</p>
            <div className="mt-6 flex flex-wrap items-start gap-3">
              <PrimaryAction title={title} />
              <MyListButton slug={title.slug} />
              <ShareButton name={title.name} />
            </div>
          </div>
        </div>
      </section>

      <TitleTabs
        title={title}
        moreLikeThis={
          <PosterGrid>
            {more.map((t) => (
              <PosterCard key={t.id} title={t} />
            ))}
          </PosterGrid>
        }
      />
    </>
  );
}
