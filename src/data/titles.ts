// ─────────────────────────────────────────────────────────────
// FAKE DATA: every title here is made up.
// Replace this file (or src/lib/api.ts) with real API calls later.
// Videos are free, openly licensed sample films (Blender Foundation).
// ─────────────────────────────────────────────────────────────
import type { Episode, Season, Title } from "./types";

const VIDEOS = [
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // HLS · Big Buck Bunny
  "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8", // HLS · Tears of Steel
  "https://download.blender.org/durian/trailer/sintel_trailer-480p.mp4", // MP4 · Sintel trailer
];
const video = (i: number) => VIDEOS[i % VIDEOS.length];

const EP_NAMES = [
  "The Runaway", "Static Hearts", "Drift Market", "Paper Moons", "Blackout Run",
  "The Quiet Between Stars", "Ghost Signal", "Orbit of Ash", "Lanterns Out", "The Long Way Round",
  "Salt and Silver", "What the River Knew", "First Light", "A Door in the Fog", "Low Tide",
  "Borrowed Time", "The Glass Garden", "Sparks", "Homeward", "The Last Bell",
];
const EP_DESCS = [
  "An unexpected passenger changes everything.",
  "Old memories surface at the worst possible moment.",
  "A quick stop turns into a chase across the city.",
  "An old friend appears on the wrong side.",
  "Twelve minutes of air, two ways out.",
  "A fragile truce is tested by a single lie.",
  "A distress call from a ship destroyed a century ago.",
  "The crew lands somewhere that shouldn't exist.",
  "The power fails, and something wakes up in the dark.",
  "A detour reveals more than anyone wanted to know.",
];

const DAY = 86_400_000;
const isoDaysFromToday = (days: number) =>
  new Date(Date.UTC(2026, 10, 8) + days * DAY).toISOString().slice(0, 10);

/**
 * Builds seasons of weekly episodes.
 * `lastReleasedInDays` is when the newest released episode came out
 * (0 = today, -7 = a week ago). `upcoming` adds locked future episodes.
 */
function seasons(
  slug: string,
  spec: { released: number; upcoming?: number; lastReleasedInDays?: number; minutes?: number }[],
  hasIntro = true,
): Season[] {
  let vid = slug.length;
  return spec.map((s, si) => {
    const total = s.released + (s.upcoming ?? 0);
    const last = s.lastReleasedInDays ?? -300 + si * 90;
    const episodes: Episode[] = Array.from({ length: total }, (_, i) => {
      const n = i + 1;
      const offset = last + (n - s.released) * 7;
      return {
        id: `${slug}-s${si + 1}e${n}`,
        number: n,
        name: EP_NAMES[(i + si * 7 + slug.length) % EP_NAMES.length],
        description: EP_DESCS[(i + si * 3 + slug.length) % EP_DESCS.length],
        durationSec: (s.minutes ?? 24) * 60,
        releaseDate: isoDaysFromToday(offset),
        ...(hasIntro ? { introStartSec: 5, introEndSec: 35 } : {}),
        videoUrl: video(vid++),
      };
    });
    return { number: si + 1, episodes };
  });
}

const ANIME_LANGS = { audioLanguages: ["Japanese", "English"], subtitleLanguages: ["English", "Español", "Bahasa Indonesia", "Français"] };
const EN_LANGS = { audioLanguages: ["English"], subtitleLanguages: ["English", "Español", "Français"] };

export const TITLES: Title[] = [
  // ───────────── ANIME ─────────────
  {
    id: "t01", slug: "echoes-of-the-starfall", type: "anime", name: "Echoes of the Starfall",
    description: "A runaway pilot and a ghost living in her ship's AI race across a collapsing star system to stop a war that only the two of them remember.",
    year: 2026, genres: ["Sci-Fi", "Action", "Drama"], ageRating: "13+", sub: true, dub: true, ...ANIME_LANGS,
    colors: ["#5a4a7a", "#2a2b40"], featured: true, staffPick: true, addedAt: isoDaysFromToday(-60),
    studio: "Lantern Works", cast: ["Aiko Tanaka", "Ren Mori", "Sora Ishida"],
    seasons: seasons("echoes-of-the-starfall", [{ released: 12, lastReleasedInDays: -120 }, { released: 8, upcoming: 4, lastReleasedInDays: -3 }]),
  },
  {
    id: "t02", slug: "skyward-ronin", type: "anime", name: "Skyward Ronin",
    description: "A masterless swordsman takes to the floating islands, hunting the sky-pirate who stole his name.",
    year: 2026, genres: ["Action", "Adventure", "Fantasy"], ageRating: "16+", sub: true, dub: true, ...ANIME_LANGS,
    colors: ["#4a3a6a", "#232436"], addedAt: isoDaysFromToday(-40), studio: "Studio Kumo", cast: ["Kenji Arata", "Yui Hoshino"],
    seasons: seasons("skyward-ronin", [{ released: 8, upcoming: 4, lastReleasedInDays: -1 }]),
  },
  {
    id: "t03", slug: "paper-kingdoms", type: "anime", name: "Paper Kingdoms",
    description: "Two rival origami artists discover that what they fold comes alive at midnight, and their creations have started a war.",
    year: 2025, genres: ["Adventure", "Fantasy", "Comedy"], ageRating: "10+", sub: true, dub: true, ...ANIME_LANGS,
    colors: ["#3a4a6a", "#22283a"], staffPick: true, addedAt: isoDaysFromToday(-90), studio: "Foldline", cast: ["Mai Sato", "Haru Kimura"],
    seasons: seasons("paper-kingdoms", [{ released: 12, lastReleasedInDays: -200 }, { released: 4, upcoming: 8, lastReleasedInDays: -2 }]),
  },
  {
    id: "t04", slug: "neon-teahouse", type: "anime", name: "Neon Teahouse",
    description: "In a rain-soaked city, a tiny teahouse serves one customer a night, and every cup holds a memory they lost.",
    year: 2026, genres: ["Slice of Life", "Fantasy", "Drama"], ageRating: "13+", sub: true, dub: false, ...ANIME_LANGS,
    colors: ["#5a3a55", "#2a2233"], addedAt: isoDaysFromToday(-30), studio: "Lantern Works", cast: ["Nana Ueda", "Taro Fujii"],
    seasons: seasons("neon-teahouse", [{ released: 12, upcoming: 1, lastReleasedInDays: -4 }]),
  },
  {
    id: "t05", slug: "hollow-tide", type: "anime", name: "Hollow Tide",
    description: "When the sea retreats overnight, a fishing village finds a sunken city, and a girl who claims she's been waiting there for 300 years.",
    year: 2026, genres: ["Fantasy", "Mystery"], ageRating: "13+", sub: true, dub: false, ...ANIME_LANGS,
    colors: ["#3a5a50", "#20302c"], staffPick: true, addedAt: isoDaysFromToday(-12), studio: "Tidewell", cast: ["Rin Aoki", "Kaito Nishi"],
    seasons: seasons("hollow-tide", [{ released: 2, upcoming: 10, lastReleasedInDays: -5 }]),
  },
  {
    id: "t06", slug: "cinder-and-salt", type: "anime", name: "Cinder & Salt",
    description: "A disgraced alchemist and a fire spirit open a seaside restaurant. The food is magical. The debts are worse.",
    year: 2025, genres: ["Drama", "Comedy", "Fantasy"], ageRating: "13+", sub: true, dub: true, ...ANIME_LANGS,
    colors: ["#5a4a3a", "#2e2722"], addedAt: isoDaysFromToday(-50), studio: "Studio Kumo", cast: ["Emi Kato", "Shin Ogawa"],
    seasons: seasons("cinder-and-salt", [{ released: 6, upcoming: 6, lastReleasedInDays: -6 }]),
  },
  {
    id: "t07", slug: "moonlit-arcade", type: "anime", name: "Moonlit Arcade",
    description: "An after-hours arcade where high scores grant small wishes. Its regulars are lonely, strange, and very competitive.",
    year: 2024, genres: ["Slice of Life", "Comedy"], ageRating: "10+", sub: true, dub: false, ...ANIME_LANGS,
    colors: ["#4a4a5a", "#26262f"], staffPick: true, addedAt: isoDaysFromToday(-150), studio: "Pixel Tea", cast: ["Kana Mizuno", "Daichi Hara"],
    seasons: seasons("moonlit-arcade", [{ released: 12, lastReleasedInDays: -160 }, { released: 9, upcoming: 3, lastReleasedInDays: -7 }]),
  },
  {
    id: "t08", slug: "little-bakery-spirits", type: "anime", name: "Little Bakery Spirits",
    description: "A new baker in a mountain town learns her oven is home to three very opinionated bread spirits.",
    year: 2025, genres: ["Slice of Life", "Fantasy", "Comedy"], ageRating: "All", sub: true, dub: true, ...ANIME_LANGS,
    colors: ["#4a5a4a", "#262e28"], addedAt: isoDaysFromToday(-20), studio: "Foldline", cast: ["Hina Sakai", "Mio Endo"],
    seasons: seasons("little-bakery-spirits", [{ released: 12, lastReleasedInDays: -21 }]),
  },
  {
    id: "t09", slug: "sunday-train", type: "anime", name: "Sunday Train",
    description: "Every Sunday, a retired conductor rides the last train of the night and listens to whoever sits beside him.",
    year: 2024, genres: ["Slice of Life", "Drama"], ageRating: "All", sub: true, dub: false, ...ANIME_LANGS,
    colors: ["#5a4f3a", "#2c2a24"], addedAt: isoDaysFromToday(-220), studio: "Tidewell", cast: ["Goro Ikeda"],
    seasons: seasons("sunday-train", [{ released: 10, lastReleasedInDays: -230 }]),
  },
  {
    id: "t10", slug: "lantern-street", type: "anime", name: "Lantern Street",
    description: "A shy lantern-maker and a festival dancer keep meeting by accident, every summer, for ten years.",
    year: 2025, genres: ["Romance", "Drama", "Slice of Life"], ageRating: "13+", sub: true, dub: true, ...ANIME_LANGS,
    colors: ["#4a3a4a", "#2a2329"], addedAt: isoDaysFromToday(-75), studio: "Lantern Works", cast: ["Sakura Ono", "Riku Tamura"],
    seasons: seasons("lantern-street", [{ released: 12, lastReleasedInDays: -80 }]),
  },
  {
    id: "t11", slug: "starlit-courier", type: "anime", name: "Starlit Courier",
    description: "The galaxy's most unreliable delivery service has one rule: the package always arrives. Eventually.",
    year: 2026, genres: ["Sci-Fi", "Adventure", "Comedy"], ageRating: "10+", sub: true, dub: true, ...ANIME_LANGS,
    colors: ["#3a4a6a", "#1f2536"], addedAt: isoDaysFromToday(-8), studio: "Studio Kumo", cast: ["Yuto Mori", "Aya Kondo"],
    seasons: seasons("starlit-courier", [{ released: 3, upcoming: 9, lastReleasedInDays: -1 }]),
  },
  {
    id: "t12", slug: "velvet-signal", type: "anime", name: "Velvet Signal",
    description: "A late-night radio host starts receiving calls from listeners who died decades ago.",
    year: 2026, genres: ["Mystery", "Horror", "Drama"], ageRating: "16+", sub: true, dub: false, ...ANIME_LANGS,
    colors: ["#5a3f4c", "#2b2228"], addedAt: isoDaysFromToday(-15), studio: "Pixel Tea", cast: ["Rei Kuroda", "Tomo Sakamoto"],
    seasons: seasons("velvet-signal", [{ released: 5, upcoming: 7, lastReleasedInDays: -2 }]),
  },
  {
    id: "t13", slug: "court-of-thunder", type: "anime", name: "Court of Thunder",
    description: "A first-year at a tiny school with no gym builds a volleyball team out of misfits and pure stubbornness.",
    year: 2025, genres: ["Sports", "Comedy", "Drama"], ageRating: "All", sub: true, dub: true, ...ANIME_LANGS,
    colors: ["#3a3f5a", "#22242f"], addedAt: isoDaysFromToday(-110), studio: "Foldline", cast: ["Sho Hayashi", "Kenta Ito"],
    seasons: seasons("court-of-thunder", [{ released: 24, lastReleasedInDays: -115 }]),
  },
  {
    id: "t14", slug: "encore-in-blue", type: "anime", name: "Encore in Blue",
    description: "Four strangers form a band to play one last show at a jazz bar that's closing forever.",
    year: 2024, genres: ["Music", "Drama", "Romance"], ageRating: "13+", sub: true, dub: false, ...ANIME_LANGS,
    colors: ["#344a6a", "#1f2733"], addedAt: isoDaysFromToday(-180), studio: "Tidewell", cast: ["Miu Nakamura", "Jun Okada"],
    seasons: seasons("encore-in-blue", [{ released: 12, lastReleasedInDays: -190 }]),
  },

  // ───────────── MOVIES ─────────────
  {
    id: "t20", slug: "the-last-lighthouse", type: "movie", name: "The Last Lighthouse",
    description: "On a forgotten island, a keeper discovers the light she guards is keeping something out.",
    year: 2026, genres: ["Mystery", "Drama", "Thriller"], ageRating: "13+", ...EN_LANGS,
    colors: ["#5a4a7a", "#2a2b40"], featured: true, staffPick: true, addedAt: isoDaysFromToday(-4),
    studio: "Northwind Pictures", cast: ["Elena Marsh", "Tomas Reyes", "Iris Hale"],
    durationSec: 112 * 60, videoUrl: video(2), introStartSec: 0, introEndSec: 0,
  },
  {
    id: "t21", slug: "mochi-detective", type: "movie", name: "Mochi Detective",
    description: "A dessert-obsessed detective has 24 hours to find a stolen recipe before the city's biggest food festival.",
    year: 2025, genres: ["Comedy", "Mystery", "Family"], ageRating: "All", ...EN_LANGS,
    colors: ["#5a3f4c", "#2b2228"], featured: true, staffPick: true, addedAt: isoDaysFromToday(-25),
    studio: "Sweetbean Films", cast: ["Lily Park", "Marcus Bell"], durationSec: 98 * 60, videoUrl: video(1),
  },
  {
    id: "t22", slug: "iron-orchard", type: "movie", name: "Iron Orchard",
    description: "In a future where trees are extinct, a farmer grows the last orchard, and an army comes to take it.",
    year: 2026, genres: ["Sci-Fi", "Action", "Drama"], ageRating: "16+", ...EN_LANGS,
    colors: ["#3a3a4a", "#22222b"], addedAt: isoDaysFromToday(-2), studio: "Northwind Pictures",
    cast: ["Daniel Okafor", "Sasha Lind"], durationSec: 124 * 60, videoUrl: video(2),
  },
  {
    id: "t23", slug: "quiet-engines", type: "movie", name: "Quiet Engines",
    description: "A retired race driver and her estranged son rebuild a car neither of them wants to drive.",
    year: 2026, genres: ["Drama", "Family"], ageRating: "10+", ...EN_LANGS,
    colors: ["#5a4a5a", "#2b252b"], addedAt: isoDaysFromToday(-9), studio: "Halfmoon", cast: ["Grace Holloway", "Ben Carter"],
    durationSec: 106 * 60, videoUrl: video(3),
  },
  {
    id: "t24", slug: "lone-star-diner", type: "movie", name: "Lone Star Diner",
    description: "One night, one roadside diner, and eleven customers who all want the same mysterious briefcase.",
    year: 2024, genres: ["Comedy", "Thriller"], ageRating: "16+", ...EN_LANGS,
    colors: ["#4a4a5a", "#26262f"], addedAt: isoDaysFromToday(-140), studio: "Halfmoon", cast: ["Ray Dawson", "June Ortiz"],
    durationSec: 95 * 60, videoUrl: video(1),
  },
  {
    id: "t25", slug: "the-weight-of-snow", type: "movie", name: "The Weight of Snow",
    description: "Snowed in at a mountain lodge, a family discovers one of them has been lying for twenty years.",
    year: 2025, genres: ["Drama", "Mystery"], ageRating: "13+", ...EN_LANGS,
    colors: ["#3f4a5a", "#232830"], addedAt: isoDaysFromToday(-55), studio: "Northwind Pictures", cast: ["Anna Voss", "Leo Grant"],
    durationSec: 118 * 60, videoUrl: video(3),
  },
  {
    id: "t26", slug: "deep-blue-hours", type: "movie", name: "Deep Blue Hours",
    description: "A documentary following three free-divers attempting depths no one has reached before.",
    year: 2025, genres: ["Documentary"], ageRating: "All", ...EN_LANGS,
    colors: ["#2f4a5a", "#1d2830"], addedAt: isoDaysFromToday(-70), studio: "Open Water", cast: ["Narrated by Clara West"],
    durationSec: 89 * 60, videoUrl: video(0),
  },
  {
    id: "t27", slug: "the-paper-crown", type: "movie", name: "The Paper Crown",
    description: "A kid who loses the school play's lead role decides to stage a rival play in her backyard.",
    year: 2024, genres: ["Family", "Comedy"], ageRating: "All", ...EN_LANGS,
    colors: ["#5a5040", "#2c2924"], addedAt: isoDaysFromToday(-200), studio: "Sweetbean Films", cast: ["Ivy Chen", "Paul Grey"],
    durationSec: 92 * 60, videoUrl: video(1),
  },
  {
    id: "t28", slug: "after-the-static", type: "movie", name: "After the Static",
    description: "Every TV in town switches on at 3:33 a.m., showing a channel no one has heard of.",
    year: 2026, genres: ["Horror", "Mystery"], ageRating: "18+", ...EN_LANGS,
    colors: ["#4a3a3f", "#272224"], addedAt: isoDaysFromToday(-18), studio: "Halfmoon", cast: ["Nora Blake", "Evan Cross"],
    durationSec: 101 * 60, videoUrl: video(2),
  },
  {
    id: "t29", slug: "letters-to-marigold", type: "movie", name: "Letters to Marigold",
    description: "A postman starts answering the unsendable letters left at a closed post office.",
    year: 2025, genres: ["Romance", "Drama"], ageRating: "10+", ...EN_LANGS,
    colors: ["#5a4a42", "#2c2624"], addedAt: isoDaysFromToday(-95), studio: "Halfmoon", cast: ["Owen Hart", "Mila Rossi"],
    durationSec: 109 * 60, videoUrl: video(3),
  },

  // ───────────── SERIES ─────────────
  {
    id: "t40", slug: "glass-harbor", type: "series", name: "Glass Harbor",
    description: "A harbor town's new police chief uncovers smuggling, secrets, and a decades-old disappearance.",
    year: 2025, genres: ["Crime", "Drama", "Mystery"], ageRating: "16+", ...EN_LANGS,
    colors: ["#35505a", "#1f2a2e"], featured: true, staffPick: true, addedAt: isoDaysFromToday(-35),
    studio: "Northwind Television", cast: ["Helen Shaw", "Adrian Cole", "Ruth Kim"],
    seasons: seasons("glass-harbor", [{ released: 8, lastReleasedInDays: -300, minutes: 52 }, { released: 6, upcoming: 2, lastReleasedInDays: -3, minutes: 52 }], false),
  },
  {
    id: "t41", slug: "north-of-nowhere", type: "series", name: "North of Nowhere",
    description: "Strangers stranded at an Arctic research station realize the rescue plane isn't coming.",
    year: 2026, genres: ["Thriller", "Sci-Fi", "Mystery"], ageRating: "16+", ...EN_LANGS,
    colors: ["#3a4a5a", "#20262e"], addedAt: isoDaysFromToday(-6), studio: "Coldfront", cast: ["Jonas Berg", "Amara Diallo"],
    seasons: seasons("north-of-nowhere", [{ released: 4, upcoming: 4, lastReleasedInDays: -6, minutes: 48 }], false),
  },
  {
    id: "t42", slug: "the-quiet-firm", type: "series", name: "The Quiet Firm",
    description: "A tiny law office takes the cases no one else will, and wins far more often than it should.",
    year: 2024, genres: ["Drama", "Crime", "Comedy"], ageRating: "13+", ...EN_LANGS,
    colors: ["#4a4a42", "#272724"], addedAt: isoDaysFromToday(-160), studio: "Halfmoon", cast: ["Victor Lane", "Priya Nair"],
    seasons: seasons("the-quiet-firm", [{ released: 10, lastReleasedInDays: -400, minutes: 44 }, { released: 10, lastReleasedInDays: -170, minutes: 44 }], false),
  },
  {
    id: "t43", slug: "kitchen-at-midnight", type: "series", name: "Kitchen at Midnight",
    description: "Home cooks compete in a pop-up restaurant that only opens between midnight and dawn.",
    year: 2026, genres: ["Reality"], ageRating: "All", ...EN_LANGS,
    colors: ["#5a453a", "#2c2522"], addedAt: isoDaysFromToday(-10), studio: "Open Water", cast: ["Hosted by Sam Rivers"],
    seasons: seasons("kitchen-at-midnight", [{ released: 5, upcoming: 3, lastReleasedInDays: -4, minutes: 45 }], false),
  },
  {
    id: "t44", slug: "small-wonders", type: "series", name: "Small Wonders",
    description: "A nature documentary series about the tiniest animals with the biggest stories.",
    year: 2025, genres: ["Documentary"], ageRating: "All", ...EN_LANGS,
    colors: ["#3f5a45", "#232e26"], addedAt: isoDaysFromToday(-85), studio: "Open Water", cast: ["Narrated by Clara West"],
    seasons: seasons("small-wonders", [{ released: 6, lastReleasedInDays: -90, minutes: 50 }], false),
  },
  {
    id: "t45", slug: "the-ninth-floor", type: "series", name: "The Ninth Floor",
    description: "An office building's elevator keeps stopping at a floor that isn't supposed to exist.",
    year: 2026, genres: ["Sci-Fi", "Mystery", "Thriller"], ageRating: "13+", ...EN_LANGS,
    colors: ["#4a3f5a", "#26222e"], addedAt: isoDaysFromToday(-28), studio: "Coldfront", cast: ["Maya Lin", "Chris Doyle"],
    seasons: seasons("the-ninth-floor", [{ released: 8, lastReleasedInDays: -28, minutes: 40 }], false),
  },
  {
    id: "t46", slug: "flatmates", type: "series", name: "Flatmates",
    description: "Five strangers, one tiny apartment, and a landlord who lives in the closet.",
    year: 2024, genres: ["Comedy"], ageRating: "13+", ...EN_LANGS,
    colors: ["#5a4a50", "#2c2527"], addedAt: isoDaysFromToday(-250), studio: "Halfmoon", cast: ["Tess Morgan", "Ali Hassan"],
    seasons: seasons("flatmates", [{ released: 10, lastReleasedInDays: -500, minutes: 24 }, { released: 10, lastReleasedInDays: -260, minutes: 24 }], false),
  },
];

/** Genres shown in each header dropdown card. */
export const GENRES: Record<string, string[]> = {
  anime: ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Music", "Horror"],
  movie: ["Action", "Comedy", "Documentary", "Drama", "Family", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"],
  series: ["Comedy", "Crime", "Documentary", "Drama", "Mystery", "Reality", "Sci-Fi", "Thriller"],
};

/** "Today" for the fake data, so release dates and NEW badges stay consistent. */
export const TODAY = isoDaysFromToday(0);
