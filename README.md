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

## Connecting a backend later

1. Keep the shapes in `src/data/types.ts`.
2. Replace the function bodies in `src/lib/api.ts` with `fetch()` calls to your API. The pages don't need to change.
3. Replace the localStorage stores in `src/lib/user-data.ts` with API calls (My List, progress, profile).
4. Put real video stream URLs (from Bunny Stream, Mux, Cloudflare Stream, etc.) in `videoUrl`. The player handles `.m3u8` (HLS) and `.mp4`.
5. Add `posterUrl` / `backdropUrl` to titles. Real images replace the gradient placeholders automatically (add the image host to `images.remotePatterns` in `next.config.ts`).

## Placeholder artwork & sample videos

Posters, backdrops and episode thumbnails are stills from Blender Foundation open movies (Big Buck Bunny, Cosmos Laundromat, Spring, Tears of Steel), saved in `public/images/stills/` and mapped to titles in `src/data/images.ts`. Sample videos are the same open movies, served from public test streams. Both are Creative Commons licensed; attribution is shown on `/credits` and in the site footer. **Keep the credits while you use them**, and remove both when you switch to real artwork.
