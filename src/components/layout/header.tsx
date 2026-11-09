"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Search, Settings, Users } from "lucide-react";
import { Logo } from "./logo";
import { CategoryMenu } from "./category-menu";
import { usePopover } from "@/components/ui/use-popover";
import { useProfile } from "@/lib/user-data";
import type { BrowseKey } from "@/lib/catalog-utils";

export function Header({ genres }: { genres: Record<BrowseKey, string[]> }) {
  const pathname = usePathname();
  const overHero = pathname === "/" || pathname.startsWith("/title/");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !overHero || scrolled;

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* Over a hero: a tall, soft fade with no hard edge (keeps the menu readable). */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-[180px] bg-[linear-gradient(180deg,rgba(28,29,33,0.85)_0%,rgba(28,29,33,0.45)_45%,rgba(28,29,33,0)_100%)] transition-opacity duration-300 ${
          solid ? "opacity-0" : "opacity-100"
        }`}
      />
      {/* Solid bar: fades in. Its divider only shows once the page is scrolled. */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-bg/92 backdrop-blur-md transition-[opacity,box-shadow] duration-300 ${solid ? "opacity-100" : "opacity-0"} ${
          scrolled ? "shadow-[0_1px_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.25)]" : ""
        }`}
      />

      <div className="relative flex h-header items-center gap-2 px-gutter">
        <Logo className="mr-3 text-[26px] md:mr-6 md:text-[28px]" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <NavLink href="/" active={pathname === "/"}>
            Home
          </NavLink>
          <CategoryMenu browseKey="anime" genres={genres.anime} />
          <CategoryMenu browseKey="movies" genres={genres.movies} />
          <CategoryMenu browseKey="series" genres={genres.series} />
          <NavLink href="/my-list" active={pathname === "/my-list"}>
            My List
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          {pathname !== "/search" && (
            <Link
              href="/search"
              className="hidden h-10 w-64 items-center gap-2.5 rounded-full bg-surface/80 px-4 text-sm text-subtle transition-colors hover:bg-surface-hover hover:text-muted xl:flex"
            >
              <Search size={17} strokeWidth={2} />
              Search titles, genres…
            </Link>
          )}
          <Link href="/search" aria-label="Search" className="grid size-10 place-items-center rounded-full text-soft hover:bg-surface xl:hidden">
            <Search size={21} strokeWidth={1.9} />
          </Link>
          <NotificationsMenu />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative rounded-lg px-3.5 py-2 text-[15px] font-medium transition-colors duration-150 ${active ? "text-fg" : "text-muted hover:text-fg"}`}
    >
      {children}
      {active && <span className="bg-brand absolute inset-x-3.5 -bottom-1 h-0.5 rounded-full" />}
    </Link>
  );
}

const NOTIFICATIONS = [
  { href: "/title/skyward-ronin", title: "Skyward Ronin", text: "Episode 8 is out now", when: "1d" },
  { href: "/title/starlit-courier", title: "Starlit Courier", text: "Episode 3 is out now", when: "1d" },
  { href: "/title/echoes-of-the-starfall", title: "Echoes of the Starfall", text: "Season 2 · Episode 8 is out now", when: "3d" },
  { href: "/title/the-last-lighthouse", title: "The Last Lighthouse", text: "Now streaming on Reelm", when: "4d" },
];

function NotificationsMenu() {
  const pop = usePopover();
  return (
    <div ref={pop.ref} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={pop.open}
        onClick={pop.toggle}
        className={`relative grid size-10 place-items-center rounded-full text-soft transition-colors hover:bg-surface ${pop.open ? "bg-surface" : ""}`}
      >
        <Bell size={21} strokeWidth={1.9} />
        <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-mauve ring-2 ring-bg" />
      </button>
      {pop.open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-elevated shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
          <p className="border-b border-line px-4 py-3 text-sm font-semibold">Notifications</p>
          {NOTIFICATIONS.map((n) => (
            <Link key={n.title} href={n.href} onClick={pop.hide} className="flex gap-3 px-4 py-3 transition-colors hover:bg-surface">
              <span className="bg-brand mt-1.5 size-2 shrink-0 rounded-full" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{n.title}</span>
                <span className="block text-xs text-muted">{n.text}</span>
              </span>
              <span className="text-[11px] text-subtle">{n.when}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Avatar({ name, color, size = 32 }: { name: string; color: string; size?: number }) {
  return (
    <span className="bg-brand inline-grid shrink-0 rounded-full p-[2px]" style={{ width: size, height: size }}>
      <span className="grid place-items-center rounded-full text-xs font-bold text-fg" style={{ background: color }}>
        {name[0]}
      </span>
    </span>
  );
}

function ProfileMenu() {
  const pop = usePopover();
  const { profile } = useProfile();
  return (
    <div ref={pop.ref} className="relative">
      <button type="button" aria-label="Account menu" aria-expanded={pop.open} onClick={pop.toggle} className="ml-1 rounded-full">
        <Avatar name={profile.name} color={profile.color} size={36} />
      </button>
      {pop.open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-elevated p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
          <div className="flex items-center gap-3 px-2.5 py-2.5">
            <Avatar name={profile.name} color={profile.color} size={36} />
            <div>
              <p className="text-sm font-semibold">{profile.name}</p>
              <p className="text-xs text-muted">Watching now</p>
            </div>
          </div>
          <div className="my-1 h-px bg-line" />
          <MenuItem href="/profiles" icon={<Users size={16} />} onClick={pop.hide}>
            Switch profile
          </MenuItem>
          <MenuItem href="/settings" icon={<Settings size={16} />} onClick={pop.hide}>
            Settings
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({ href, icon, onClick, children }: { href: string; icon: React.ReactNode; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] text-soft transition-colors hover:bg-surface hover:text-fg">
      <span className="text-muted">{icon}</span>
      {children}
    </Link>
  );
}
