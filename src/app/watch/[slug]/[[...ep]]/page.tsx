import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Player } from "@/components/player/player";
import { getPlayable, nextEpisode, parseEpisodeRef, watchHref } from "@/lib/api";

// /watch/<slug>             movie, or a show's first episode
// /watch/<slug>/s4/e166     season 4, episode 166
// /watch/<slug>?ep=<id>     old links: redirected to the readable form
type Props = {
  params: Promise<{ slug: string; ep?: string[] }>;
  searchParams: Promise<{ ep?: string }>;
};

async function load({ params, searchParams }: Props) {
  const { slug, ep: parts = [] } = await params;
  if (parts.length === 0) {
    const { ep: oldId } = await searchParams;
    return { slug, playable: await getPlayable(slug, oldId), oldId };
  }
  const ref = parseEpisodeRef(parts);
  if (!ref) notFound();
  return { slug, playable: await getPlayable(slug, ref), oldId: undefined };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { playable: p } = await load(props);
  if (!p) return {};
  return { title: p.episode ? `${p.title.name} · S${p.season} E${p.episode.number}` : p.title.name };
}

export default async function WatchPage(props: Props) {
  const { slug, playable, oldId } = await load(props);
  if (!playable) notFound();

  const { title, episode, season } = playable;
  if (oldId && episode && season !== undefined) permanentRedirect(watchHref(slug, { season, number: episode.number }));

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
      nextHref={next ? watchHref(slug, { season: next.season, number: next.episode.number }) : undefined}
      nextLabel={next && next.season !== season ? `Season ${next.season}` : "Next Episode"}
      season={title.seasons?.find((s) => s.number === season)}
      audioLanguages={title.audioLanguages}
      subtitles={playable.subtitles ?? []}
    />
  );
}
