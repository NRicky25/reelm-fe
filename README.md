# Reelm: Frontend

Streaming site frontend for anime, movies and series. Built with Next.js 15, TypeScript, Tailwind CSS v4 and Lucide icons.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + type check + lint
```

## Pages

| Route | What it is |
|---|---|
| `/` | Home: hero, Continue Watching, New Episodes, Recently Added, Staff Picks, genre rows |
| `/title/[slug]` | Title detail: Play/Continue, My List, episodes, More Like This, details |
| `/watch/[slug]?ep=<id>` | Video player (HLS + MP4) |
| `/browse/[anime\|movies\|series]?genre=&list=` | Browse grid (opened from the header dropdowns) |
| `/browse` | Browse menu for phones |
| `/search?q=` | Live search |
| `/my-list` | Saved titles |
| `/profiles`, `/settings` | Profile picker + playback settings (saved on this device) |
| `/login`, `/signup` | **Not linked anywhere yet.** The site is open to everyone with no login. Kept for when accounts are added. |

## Where things live

```
src/
├── app/                 routes ((main) = pages with header, (auth) = login/profiles)
├── components/          layout, cards, home, title, player, ui
├── data/
│   ├── types.ts         data shapes the backend should return
│   └── titles.ts        FAKE catalogue (all titles are made up)
└── lib/
    ├── api.ts           ← the only place pages get catalogue data from
    └── user-data.ts     My List, watch progress, profile, player prefs (localStorage for now)
```

## Data source: backend or built-in fake data

`src/lib/api.ts` picks the data source:

| `NEXT_PUBLIC_API_URL` | Data comes from |
|---|---|
| set (e.g. in `.env.local`) | **reelm-be** (`src/lib/api-remote.ts`) |
| not set | the built-in fake catalogue (`src/lib/api-local.ts`) |

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
# optional: pin "today" for release dates (keep equal to the backend's CATALOG_TODAY)
# NEXT_PUBLIC_CATALOG_TODAY=2026-11-08
```

Use `127.0.0.1` rather than `localhost`: Node may resolve `localhost` to IPv6 while uvicorn listens on IPv4.
Restart `npm run dev` after changing env files. My List, watch progress and settings still live in the
browser (`src/lib/user-data.ts`) until accounts exist.

## Placeholder artwork & sample videos

Posters, backdrops and episode thumbnails are stills from Blender Foundation open movies (Big Buck Bunny, Cosmos Laundromat, Spring, Tears of Steel), saved in `public/images/stills/` and mapped to titles in `src/data/images.ts`. Sample videos are the same open movies, served from public test streams. Both are Creative Commons licensed; attribution is shown on `/credits` and in the site footer. **Keep the credits while you use them**, and remove both when you switch to real artwork.
