import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BROWSE_TYPES, genreSlug, genresFor, type BrowseKey } from "@/lib/api";

export const metadata = { title: "Browse" };

/** Phone-friendly browse menu (the header dropdowns cover this on desktop). */
export default function BrowseIndex() {
  return (
    <div className="px-gutter pt-24">
      <h1 className="text-3xl font-extrabold tracking-tight">Browse</h1>
      <div className="mt-6 space-y-8">
        {(Object.keys(BROWSE_TYPES) as BrowseKey[]).map((key) => {
          const { label } = BROWSE_TYPES[key];
          return (
            <section key={key}>
              <Link href={`/browse/${key}`} className="flex items-center justify-between rounded-xl bg-surface px-4 py-3.5 font-bold">
                All {label}
                <ChevronRight size={18} className="text-muted" />
              </Link>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill href={`/browse/${key}?list=new`}>{key === "movies" ? "New Releases" : "New Episodes"}</Pill>
                <Pill href={`/browse/${key}?list=recent`}>Recently Added</Pill>
                <Pill href={`/browse/${key}?list=az`}>A – Z</Pill>
                {genresFor(key).map((g) => (
                  <Pill key={g} href={`/browse/${key}?genre=${genreSlug(g)}`}>
                    {g}
                  </Pill>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Pill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-full border border-line px-3.5 py-2 text-[13px] text-soft transition-colors hover:bg-surface">
      {children}
    </Link>
  );
}
