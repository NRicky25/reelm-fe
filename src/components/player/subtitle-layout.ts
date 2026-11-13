"use client";
import { type RefObject, useLayoutEffect, useState } from "react";

const GAP = 6; // px between the picture's edge (or the controls) and the subtitles
const FALLBACK = 0.07; // in the picture: this share of the height above the bottom
const LINE_HEIGHT = 1.375; // Tailwind "leading-snug"
const PADDING_Y = 12; // per line py-0.5 (2 × 4px) + the 4px gap between two lines (gap-1)
const MAX_LINES = 2; // the Subtitle Maker never makes more
const MIN_FONT = 15; // never shrink below this to fit the black bar

export interface SubtitleLayout {
  /** Distance from the player's top (in the bar) or bottom (elsewhere), in px. */
  top?: number;
  bottom?: number;
  fontPx: number;
  /** True when the box covers part of the picture (it then widens to hide burned-in text). */
  overPicture: boolean;
}

/**
 * Where subtitles go. Decided from the window and video size only, NOT from the
 * current line, so one- and two-line subtitles never jump between places:
 *
 * - If the black bar under a wide picture can hold two lines (text shrunk a bit if
 *   needed, but not below MIN_FONT), every subtitle goes there, top-aligned just
 *   under the picture: it can't cover text burned into the video.
 * - Otherwise every subtitle sits near the bottom of the picture.
 * - While the controls show, the box moves up just enough to clear them.
 */
export function subtitleLayout(opts: {
  playerWidth: number;
  playerHeight: number;
  videoWidth: number;
  videoHeight: number;
  /** Height of the current box (only used to clear the controls). */
  boxHeight: number;
  /** Height of the control bar from the player's bottom; 0 when hidden. */
  controlsHeight: number;
}): SubtitleLayout {
  const { playerWidth: W, playerHeight: H, videoWidth: vw, videoHeight: vh, boxHeight, controlsHeight } = opts;
  const baseFont = Math.min(32, Math.max(16, W * 0.022)); // same as clamp(16px, 2.2vw, 32px)
  let bar = 0;
  if (vw > 0 && vh > 0 && W > 0 && H > 0) {
    const shownHeight = Math.min(H, W * (vh / vw)); // "object-contain"
    bar = (H - shownHeight) / 2;
  }
  const fontToFitBar = (bar - GAP * 2 - PADDING_Y) / (MAX_LINES * LINE_HEIGHT);
  const clearOfControls = controlsHeight > 0 ? controlsHeight + GAP : 0;

  if (fontToFitBar >= MIN_FONT) {
    const fontPx = Math.floor(Math.min(baseFont, fontToFitBar));
    const top = Math.round(H - bar + GAP);
    // the controls cover the bar: lift the box just above them instead
    if (clearOfControls > 0 && top + boxHeight > H - clearOfControls) {
      return { bottom: Math.round(clearOfControls), fontPx, overPicture: H - clearOfControls - boxHeight < H - bar };
    }
    return { top, fontPx, overPicture: false };
  }
  const bottom = Math.round(Math.max(bar + H * FALLBACK, clearOfControls));
  return { bottom, fontPx: Math.round(baseFont), overPicture: true };
}

/** Keeps subtitleLayout() up to date as the window, video or controls change. */
export function useSubtitleLayout(
  root: RefObject<HTMLElement | null>,
  video: HTMLVideoElement | null,
  box: RefObject<HTMLElement | null>,
  controls: RefObject<HTMLElement | null>,
  showControls: boolean,
  lines: string[],
): SubtitleLayout {
  const [layout, setLayout] = useState<SubtitleLayout>({ bottom: 40, fontPx: 20, overPicture: true });

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const rootRect = el.getBoundingClientRect();
      let controlsHeight = 0;
      const bar = controls.current;
      if (showControls && bar) {
        // the bar's top padding is only its fade-out gradient: skip it
        const top = bar.getBoundingClientRect().top + parseFloat(getComputedStyle(bar).paddingTop || "0");
        controlsHeight = rootRect.bottom - top;
      }
      const next = subtitleLayout({
        playerWidth: rootRect.width,
        playerHeight: rootRect.height,
        videoWidth: video?.videoWidth ?? 0,
        videoHeight: video?.videoHeight ?? 0,
        boxHeight: box.current?.offsetHeight ?? 0,
        controlsHeight,
      });
      setLayout((prev) =>
        prev.top === next.top && prev.bottom === next.bottom && prev.fontPx === next.fontPx && prev.overPicture === next.overPicture
          ? prev
          : next,
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    video?.addEventListener("loadedmetadata", measure);
    video?.addEventListener("resize", measure); // the picture's size can change mid-stream
    return () => {
      ro.disconnect();
      video?.removeEventListener("loadedmetadata", measure);
      video?.removeEventListener("resize", measure);
    };
  }, [root, video, box, controls, showControls, lines]);

  return layout;
}
