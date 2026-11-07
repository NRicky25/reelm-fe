// ─────────────────────────────────────────────────────────────
// PLACEHOLDER ARTWORK: stills from Blender Foundation open movies
// (the same films used as sample videos). Creative Commons licensed:
// credit is shown on /credits. Replace with real artwork later by
// setting posterUrl / backdropUrl on each title.
// ─────────────────────────────────────────────────────────────

export interface Still {
  src: string;
  film: "Big Buck Bunny" | "Cosmos Laundromat" | "Spring" | "Tears of Steel";
  credit: string;
  license: string;
  source: string;
  /** Horizontal focus (0–100%) used when cropping to a tall poster. */
  focusX: number;
}

const s = (
  name: string,
  film: Still["film"],
  license: string,
  file: string,
  focusX = 50,
  credit = "Blender Foundation",
): Still => ({
  src: `/images/stills/${name}.jpg`,
  film,
  credit,
  license,
  source: `https://commons.wikimedia.org/wiki/File:${file}`,
  focusX,
});

export const STILLS = {
  "meadow-yawn": s("meadow-yawn", "Big Buck Bunny", "CC BY 3.0", "BBB_sbadiglia.png", 30),
  "meadow-bunny": s("meadow-bunny", "Big Buck Bunny", "CC BY 3.0", "BBB-Bunny.png", 50),
  "forest-bow": s("forest-bow", "Big Buck Bunny", "CC BY 3.0", "Big.Buck.Bunny.-.Bunny.with.Bow.png", 45),
  "forest-friends": s("forest-friends", "Big Buck Bunny", "CC BY 3.0", "Big.Buck.Bunny.-.Frank.Bunny.png", 40),
  "squirrel-grin": s("squirrel-grin", "Big Buck Bunny", "CC BY 3.0", "Big.Buck.Bunny.-.Frank.png", 60),
  "open-meadow": s("open-meadow", "Big Buck Bunny", "CC BY 3.0", "Big.Buck.Bunny.-.Landscape.png", 30),
  "red-squirrel": s("red-squirrel", "Big Buck Bunny", "CC BY 3.0", "Big.Buck.Bunny.-.Ricky.png", 50),
  "bow-closeup": s("bow-closeup", "Big Buck Bunny", "CC BY 3.0", "Bunny-bow.png", 40),
  "little-bird": s("little-bird", "Big Buck Bunny", "CC BY 3.0", "Chirp1_-_BBB_-_reduced_snapshot.png", 55),
  laundromat: s("laundromat", "Cosmos Laundromat", "CC BY-SA 4.0", "CosmosLaundromat-final-scene.jpg", 50),
  "blue-sheep": s("blue-sheep", "Cosmos Laundromat", "CC BY 3.0", "CosmosLaundromatFranck.jpg", 40),
  "pink-caterpillar": s("pink-caterpillar", "Cosmos Laundromat", "CC BY 4.0", "Franck_the_caterpillar.jpg", 45),
  "rainbow-tornado": s("rainbow-tornado", "Cosmos Laundromat", "CC BY 3.0", "Tornado_deevad_01.jpg", 45, "David Revoy / Blender Foundation"),
  "deep-cave": s("deep-cave", "Spring", "CC BY-SA 4.0", "SpringOpenMovie-aplha.jpg", 65, "Blender Studio"),
  "above-clouds": s("above-clouds", "Spring", "CC BY-SA 4.0", "SpringOpenMovie-desend.jpg", 42, "Blender Studio"),
  "mountain-village": s("mountain-village", "Spring", "CC BY-SA 4.0", "SpringOpenMovie-final_scene.jpg", 35, "Blender Studio"),
  "steel-city": s("steel-city", "Tears of Steel", "CC BY 3.0", "Blendertof3.jpg", 50, "Blender Foundation, Michael Williamson"),
} satisfies Record<string, Still>;

export type StillName = keyof typeof STILLS;

/** Which still each title uses as its poster + backdrop. */
export const TITLE_ART: Record<string, StillName> = {
  // anime
  "echoes-of-the-starfall": "steel-city",
  "skyward-ronin": "above-clouds",
  "paper-kingdoms": "rainbow-tornado",
  "neon-teahouse": "pink-caterpillar",
  "hollow-tide": "deep-cave",
  "cinder-and-salt": "red-squirrel",
  "moonlit-arcade": "little-bird",
  "little-bakery-spirits": "meadow-bunny",
  "sunday-train": "open-meadow",
  "lantern-street": "forest-friends",
  "starlit-courier": "mountain-village",
  "velvet-signal": "blue-sheep",
  "court-of-thunder": "bow-closeup",
  "encore-in-blue": "meadow-yawn",
  // movies
  "the-last-lighthouse": "forest-bow",
  "mochi-detective": "squirrel-grin",
  "iron-orchard": "mountain-village",
  "quiet-engines": "meadow-yawn",
  "lone-star-diner": "red-squirrel",
  "the-weight-of-snow": "above-clouds",
  "deep-blue-hours": "deep-cave",
  "the-paper-crown": "meadow-bunny",
  "after-the-static": "blue-sheep",
  "letters-to-marigold": "pink-caterpillar",
  // series
  "glass-harbor": "laundromat",
  "north-of-nowhere": "steel-city",
  "the-quiet-firm": "forest-friends",
  "kitchen-at-midnight": "rainbow-tornado",
  "small-wonders": "little-bird",
  "the-ninth-floor": "laundromat",
  flatmates: "squirrel-grin",
};

/** Episode thumbnails: rotate through stills from the same film (or all, if that film has few). */
export function episodeStill(titleStill: StillName, episodeIndex: number): Still {
  const film = STILLS[titleStill].film;
  let pool = (Object.values(STILLS) as Still[]).filter((x) => x.film === film);
  if (pool.length < 3) pool = Object.values(STILLS);
  const start = pool.indexOf(STILLS[titleStill]);
  return pool[(Math.max(0, start) + episodeIndex) % pool.length];
}
