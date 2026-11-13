"use client";
import { useEffect, useState } from "react";
import type { SubtitleTrack } from "@/data/types";

/** "en" -> "English", "pt-br" -> "Portuguese (Brazil)"; unknown codes are shown as-is. */
export function languageName(code: string): string {
  try {
    const name = new Intl.DisplayNames(["en"], { type: "language" }).of(code);
    if (name && name.toLowerCase() !== code.toLowerCase()) return name;
  } catch {
    // not a code Intl understands
  }
  return code.toUpperCase();
}

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&nbsp;": " ", "&lrm;": "", "&rlm;": "" };

/** A cue's text without WebVTT markup (<i>, <b>, <c.color>, <v Speaker>, timestamps…). */
export function cueText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/&(amp|lt|gt|nbsp|lrm|rlm);/g, (m) => ENTITIES[m])
    .trim();
}

/**
 * Follows the selected subtitle track of a <video> and returns the lines to show now.
 * Tracks are kept "hidden" (loaded, but drawn by us), so we control position and style.
 */
export function useSubtitleLines(video: HTMLVideoElement | null, tracks: SubtitleTrack[], selected: string | null): string[] {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    setLines([]);
    if (!video) return;
    const list = video.textTracks;
    let active: TextTrack | null = null;

    const apply = () => {
      let chosen: TextTrack | null = null;
      for (let i = 0; i < list.length; i++) {
        const t = list[i];
        const want = selected !== null && t.language === selected;
        t.mode = want ? "hidden" : "disabled";
        if (want) chosen = t;
      }
      if (chosen !== active) {
        active?.removeEventListener("cuechange", update);
        chosen?.addEventListener("cuechange", update);
        active = chosen;
      }
      update();
    };
    const update = () => {
      const cues = active?.activeCues;
      const next: string[] = [];
      for (let i = 0; cues && i < cues.length; i++) {
        const text = cueText((cues[i] as VTTCue).text ?? "");
        if (text) next.push(...text.split("\n"));
      }
      setLines((prev) => (prev.join("\n") === next.join("\n") ? prev : next));
    };

    apply();
    // <track> elements may attach after this effect; re-apply when they do
    list.addEventListener("addtrack", apply);
    video.addEventListener("seeked", update);
    return () => {
      list.removeEventListener("addtrack", apply);
      video.removeEventListener("seeked", update);
      active?.removeEventListener("cuechange", update);
    };
  }, [video, tracks, selected]);

  return lines;
}
