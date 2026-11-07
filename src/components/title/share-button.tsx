"use client";
import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) return await navigator.share({ title: name, url });
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* user cancelled */
    }
  };
  return (
    <button
      type="button"
      onClick={share}
      className="flex h-11 items-center gap-2 rounded-full bg-surface/90 px-5 text-sm font-medium backdrop-blur transition-[background-color,transform] duration-150 hover:bg-surface-hover active:scale-[0.97]"
    >
      {copied ? <Check size={18} className="text-lavender" /> : <Share2 size={18} />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
