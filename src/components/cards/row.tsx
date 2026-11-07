"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** A titled, horizontally scrolling row of cards with arrow buttons on desktop. */
export function Row({
  heading,
  sub,
  seeAll,
  itemWidth = "w-[150px] sm:w-[170px]",
  children,
}: {
  heading: string;
  sub?: string;
  seeAll?: string;
  /** Tailwind width classes for each item. */
  itemWidth?: string;
  children: React.ReactNode[];
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (children.length === 0) return null;

  return (
    <section className="group/row mt-9 first:mt-0">
      <div className="mb-3 flex items-baseline gap-3 px-gutter">
        <h2 className="text-base font-bold sm:text-lg">{heading}</h2>
        {sub && <span className="text-xs text-muted">{sub}</span>}
        {seeAll && (
          <Link href={seeAll} className="ml-auto flex items-center text-xs font-medium text-lavender hover:text-mauve">
            See all <ChevronRight size={14} />
          </Link>
        )}
      </div>

      <div className="relative">
        <div
          ref={scroller}
          onScroll={update}
          className="scrollbar-none flex snap-x snap-mandatory scroll-px-gutter gap-3 overflow-x-auto overscroll-x-contain px-gutter pb-2 pt-1 sm:gap-4"
        >
          {children.map((child, i) => (
            <div key={i} className={`shrink-0 snap-start ${itemWidth}`}>
              {child}
            </div>
          ))}
        </div>

        <ArrowButton side="left" hidden={edges.start} onClick={() => scrollBy(-1)} />
        <ArrowButton side="right" hidden={edges.end} onClick={() => scrollBy(1)} />
      </div>
    </section>
  );
}

function ArrowButton({ side, hidden, onClick }: { side: "left" | "right"; hidden: boolean; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Scroll left" : "Scroll right"}
      onClick={onClick}
      tabIndex={-1}
      className={`absolute top-1/3 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-elevated/90 text-fg shadow-lg backdrop-blur transition-opacity duration-150 hover:bg-surface md:grid ${
        side === "left" ? "left-2" : "right-2"
      } ${hidden ? "pointer-events-none opacity-0" : "opacity-0 group-hover/row:opacity-100"}`}
    >
      <Icon size={20} />
    </button>
  );
}
