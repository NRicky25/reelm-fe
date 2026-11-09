"use client";
import { RotateCw } from "lucide-react";

/** Shown when a page fails to load, e.g. the Reelm API is down or unreachable. */
export default function MainError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center px-gutter text-center">
      <div className="max-w-sm">
        <p className="text-brand text-5xl font-extrabold">Oops</p>
        <h1 className="mt-3 text-xl font-bold">Reelm can&rsquo;t load this right now</h1>
        <p className="mt-2 text-sm text-muted">We couldn&rsquo;t reach the catalogue. Check your connection and try again in a moment.</p>
        <button
          type="button"
          onClick={reset}
          className="bg-brand mt-7 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-bg transition-transform active:scale-[0.97]"
        >
          <RotateCw size={16} />
          Try again
        </button>
      </div>
    </div>
  );
}
