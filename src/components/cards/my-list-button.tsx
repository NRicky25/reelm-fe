"use client";
import { Check, Plus } from "lucide-react";
import { useMyList } from "@/lib/user-data";

export function MyListButton({ slug, variant = "pill" }: { slug: string; variant?: "pill" | "icon" }) {
  const { has, toggle } = useMyList();
  const saved = has(slug);
  const Icon = saved ? Check : Plus;

  if (variant === "icon")
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle(slug);
        }}
        aria-label={saved ? "Remove from My List" : "Add to My List"}
        aria-pressed={saved}
        className="grid size-8 place-items-center rounded-full border border-white/25 bg-bg/80 text-fg backdrop-blur transition-[background-color,transform] duration-150 hover:bg-surface-hover active:scale-90"
      >
        <Icon size={16} strokeWidth={2.2} />
      </button>
    );

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      className="flex h-11 items-center gap-2 rounded-full bg-surface/90 px-5 text-sm font-medium backdrop-blur transition-[background-color,transform] duration-150 hover:bg-surface-hover active:scale-[0.97]"
    >
      <Icon size={18} strokeWidth={2.2} className={saved ? "text-lavender" : ""} />
      {saved ? "In My List" : "My List"}
    </button>
  );
}
