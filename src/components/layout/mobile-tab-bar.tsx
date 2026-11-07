"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, House, Search } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: House, match: (p: string) => p === "/" },
  { href: "/browse", label: "Browse", icon: Compass, match: (p: string) => p.startsWith("/browse") },
  { href: "/search", label: "Search", icon: Search, match: (p: string) => p === "/search" },
  { href: "/my-list", label: "My List", icon: Bookmark, match: (p: string) => p === "/my-list" },
];

/** Bottom tab bar shown only on phones / small tablets. */
export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const on = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${on ? "text-fg" : "text-muted"}`}
            >
              <Icon size={21} strokeWidth={on ? 2.2 : 1.8} className={on ? "text-lavender" : ""} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
