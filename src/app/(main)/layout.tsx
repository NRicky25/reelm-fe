import Link from "next/link";
import { Header } from "@/components/layout/header";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { getGenres } from "@/lib/api";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  // The layout can't use this folder's error.tsx, so a failed genre fetch must not
  // throw here: fall back to empty menus and let the page show its own error.
  const [anime, movies, series] = await Promise.all(
    (["anime", "movie", "series"] as const).map((t) => getGenres(t).catch(() => [] as string[])),
  );
  return (
    <>
      <Header genres={{ anime, movies, series }} />
      <main className="min-h-dvh pb-16">{children}</main>
      <footer className="px-gutter pb-28 text-xs text-subtle md:pb-10">
        <div className="border-t border-line pt-6">
          Demo catalogue. Artwork and sample videos from Blender Foundation open movies (Creative Commons).{" "}
          <Link href="/credits" className="font-medium text-muted underline-offset-2 hover:text-fg hover:underline">
            Credits
          </Link>
        </div>
      </footer>
      <MobileTabBar />
    </>
  );
}
