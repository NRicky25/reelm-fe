"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { BROWSE_TYPES, genreSlug, type BrowseKey } from "@/lib/api";
import { GENRES } from "@/data/titles";
import { usePopover } from "@/components/ui/use-popover";

function quickLinks(key: BrowseKey) {
  const label = BROWSE_TYPES[key].label;
  const links = [
    { href: `/browse/${key}`, label: `All ${label}` },
    { href: `/browse/${key}?list=new`, label: key === "movies" ? "New Releases" : "New Episodes" },
    { href: `/browse/${key}?list=recent`, label: "Recently Added" },
    { href: `/browse/${key}?list=az`, label: "A – Z" },
  ];
  const extra =
    key === "anime"
      ? [
          { href: `/browse/${key}?list=sub`, label: "Subtitled" },
          { href: `/browse/${key}?list=dub`, label: "Dubbed" },
        ]
      : [];
  return { links, extra };
}

export function CategoryMenu({ browseKey }: { browseKey: BrowseKey }) {
  const pop = usePopover();
  const pathname = usePathname();
  const active = pathname.startsWith(`/browse/${browseKey}`);
  const { label, type } = BROWSE_TYPES[browseKey];
  const { links, extra } = quickLinks(browseKey);
  const menuId = `menu-${browseKey}`;

  return (
    <div ref={pop.ref} className="relative" {...pop.hoverProps}>
      <button
        type="button"
        aria-expanded={pop.open}
        aria-controls={menuId}
        onClick={pop.toggle}
        className={`flex items-center gap-1 rounded-lg px-3.5 py-2 text-[15px] font-medium transition-colors duration-150 ${
          pop.open ? "bg-surface text-fg" : active ? "text-fg" : "text-muted hover:text-fg"
        }`}
      >
        {label}
        <ChevronDown size={15} strokeWidth={2} className={`transition-transform duration-200 ${pop.open ? "rotate-180" : ""}`} />
      </button>

      <div
        id={menuId}
        className={`absolute left-0 top-full z-50 pt-2 transition-[opacity,transform] duration-150 ease-out-soft ${
          pop.open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
        }`}
      >
        <div className="flex w-140 overflow-hidden rounded-2xl border border-line bg-elevated shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
          <nav className="w-45 shrink-0 border-r border-line bg-[#212227] p-4" aria-label={`Browse ${label}`}>
            <p className="mb-2.5 text-[10px] font-semibold tracking-[0.15em] text-subtle">BROWSE {label.toUpperCase()}</p>
            {links.map((l) => (
              <MenuLink key={l.href} href={l.href} onClick={pop.hide}>
                {l.label}
              </MenuLink>
            ))}
            {extra.length > 0 && <div className="my-2.5 h-px bg-line" />}
            {extra.map((l) => (
              <MenuLink key={l.href} href={l.href} onClick={pop.hide}>
                {l.label}
              </MenuLink>
            ))}
          </nav>
          <div className="flex-1 p-4">
            <p className="mb-2.5 text-[10px] font-semibold tracking-[0.15em] text-subtle">GENRES</p>
            <div className="grid grid-cols-3 gap-1">
              {GENRES[type].map((g) => (
                <MenuLink key={g} href={`/browse/${browseKey}?genre=${genreSlug(g)}`} onClick={pop.hide}>
                  {g}
                </MenuLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-lg px-2.5 py-2 text-[13px] text-soft transition-colors duration-100 hover:bg-[#2e2f36] hover:text-fg"
    >
      {children}
    </Link>
  );
}
