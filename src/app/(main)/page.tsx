import { Hero } from "@/components/home/hero";
import { ContinueWatching } from "@/components/home/continue-watching";
import { Row } from "@/components/cards/row";
import { PosterCard } from "@/components/cards/poster-card";
import {
  genreSlug,
  getByGenre,
  getFeatured,
  getNewEpisodes,
  getRecentlyAdded,
  getStaffPicks,
  isRecent,
  latestEpisodeInfo,
  typeLabel,
} from "@/lib/api";

export default async function HomePage() {
  const [featured, newEpisodes, recent, picks, cozy, mystery] = await Promise.all([
    getFeatured(),
    getNewEpisodes("anime"),
    getRecentlyAdded(),
    getStaffPicks(),
    getByGenre("Slice of Life", "anime"),
    getByGenre("Mystery"),
  ]);

  return (
    <>
      <Hero titles={featured} />

      <div className="relative z-10 -mt-8 sm:-mt-12">
        <ContinueWatching />

        <Row heading="New Episodes" sub="Anime" seeAll="/browse/anime?list=new">
          {newEpisodes.map((t) => {
            const latest = latestEpisodeInfo(t);
            return (
              <PosterCard
                key={t.id}
                title={t}
                badge={latest && isRecent(latest.releaseDate) ? `NEW · E${latest.number}` : undefined}
                meta={[t.sub && "Sub", t.dub && "Dub"].filter(Boolean).join(" | ")}
              />
            );
          })}
        </Row>

        <Row heading="Recently Added" seeAll="/browse/anime?list=recent">
          {recent.map((t) => (
            <PosterCard key={t.id} title={t} meta={`${typeLabel(t)} · ${t.year}`} />
          ))}
        </Row>

        <Row heading="Staff Picks" sub="Hand-picked by the Reelm team">
          {picks.map((t) => (
            <PosterCard key={t.id} title={t} />
          ))}
        </Row>

        <Row heading="Cozy Anime" seeAll={`/browse/anime?genre=${genreSlug("Slice of Life")}`}>
          {cozy.map((t) => (
            <PosterCard key={t.id} title={t} meta={`Anime · ${t.genres.join(", ")}`} />
          ))}
        </Row>

        <Row heading="Mystery & Thriller" seeAll="/browse/movies?genre=mystery">
          {mystery.map((t) => (
            <PosterCard key={t.id} title={t} />
          ))}
        </Row>
      </div>
    </>
  );
}
