"use client";
import { useRef, useState } from "react";
import { formatTime } from "./format";

/** Seek bar with buffered range, marked intro and credits sections, and a hover time preview. */
export function ProgressBar({
  current,
  duration,
  buffered,
  introStart,
  introEnd,
  outroStart,
  onSeek,
  onScrub,
}: {
  current: number;
  duration: number;
  buffered: number;
  introStart?: number;
  introEnd?: number;
  /** Where the end credits start; marked to the end. */
  outroStart?: number;
  onSeek: (t: number) => void;
  /** Called while dragging, so controls stay visible. */
  onScrub?: (active: boolean) => void;
}) {
  const bar = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null);

  const timeAt = (clientX: number) => {
    const r = bar.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * duration;
  };

  const pct = (t: number) => (duration > 0 ? `${(t / duration) * 100}%` : "0%");
  const shown = drag ?? current;
  const hasIntro = introStart !== undefined && introEnd !== undefined && introEnd > introStart && duration > 0;
  const hasOutro = outroStart !== undefined && outroStart > 0 && duration > 0 && outroStart < duration;

  return (
    <div
      ref={bar}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(current)}
      aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
      className="group/bar relative flex h-5 cursor-pointer touch-none items-center"
      onPointerMove={(e) => {
        if (!duration) return;
        const t = timeAt(e.clientX);
        setHover(t);
        if (drag !== null) setDrag(t);
      }}
      onPointerLeave={() => drag === null && setHover(null)}
      onPointerDown={(e) => {
        if (!duration) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setDrag(timeAt(e.clientX));
        onScrub?.(true);
      }}
      onPointerUp={(e) => {
        if (drag === null) return;
        onSeek(timeAt(e.clientX));
        setDrag(null);
        setHover(null);
        onScrub?.(false);
      }}
      onKeyDown={(e) => {
        // arrow keys are handled by the player's global shortcuts
        if (e.key === "Home") onSeek(0);
        if (e.key === "End") onSeek(duration);
      }}
    >
      <div className="relative h-1 w-full rounded-full bg-white/20 transition-[height] duration-150 group-hover/bar:h-1.5">
        <div className="absolute inset-y-0 left-0 rounded-full bg-white/25" style={{ width: pct(buffered) }} />
        {hasIntro && (
          <div
            className="absolute inset-y-0 bg-mauve/45"
            style={{ left: pct(introStart!), width: `${((introEnd! - introStart!) / duration) * 100}%` }}
            title="Intro"
          />
        )}
        {hasOutro && (
          <div
            className="absolute inset-y-0 rounded-r-full bg-mauve/45"
            style={{ left: pct(outroStart!), right: 0 }}
            title="Credits"
          />
        )}
        <div className="bg-brand absolute inset-y-0 left-0 rounded-full" style={{ width: pct(shown) }} />
        <div
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-fg shadow transition-transform duration-150 group-hover/bar:scale-100"
          style={{ left: pct(shown), ...(drag !== null ? { transform: "translate(-50%,-50%) scale(1)" } : {}) }}
        />
      </div>

      {hover !== null && (
        <div
          className="pointer-events-none absolute bottom-6 -translate-x-1/2 rounded-md bg-elevated/95 px-2 py-1 text-xs font-semibold tabular-nums shadow-lg ring-1 ring-line"
          style={{ left: `clamp(24px, ${pct(hover)}, calc(100% - 24px))` }}
        >
          {formatTime(hover)}
        </div>
      )}
    </div>
  );
}
