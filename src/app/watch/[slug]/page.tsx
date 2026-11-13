import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Player } from "@/components/player/player";
import { getPlayable, nextEpisode, watchHref } from "@/lib/api";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ ep?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const p = await getPlayable((await params).slug, (await searchParams).ep);
  if (!p) return {};
  return { title: p.episode ? `${p.title.name} · E${p.episode.number}` : p.title.name };
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { ep } = await searchParams;
  const playable = await getPlayable(slug, ep);
  if (!playable) notFound();

  const { title, episode, season } = playable;
  const next = episode ? nextEpisode(title, episode.id) : undefined;

  return (
    <Player
      key={episode?.id ?? slug}
      slug={slug}
      titleName={title.name}
      episodeLabel={episode ? `S${season} · E${episode.number} · ${episode.name}` : undefined}
      episodeId={episode?.id}
      src={playable.videoUrl}
      introStart={playable.introStartSec}
      introEnd={playable.introEndSec}
      outroStart={playable.outroStartSec}
      nextHref={next ? watchHref(slug, next.episode.id) : undefined}
      nextLabel={next && next.season !== season ? `Season ${next.season}` : "Next Episode"}
      season={title.seasons?.find((s) => s.number === season)}
      audioLanguages={title.audioLanguages}
      subtitles={playable.subtitles ?? []}
    />
  );
}
