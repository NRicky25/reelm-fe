"use client";
import { useEffect, useState } from "react";
import type Hls from "hls.js";
import { qualityLabel } from "./quality-label";

export interface QualityLevel {
  index: number;
  /** e.g. "1080p" (also for wide 1920x800 cinema encodes) */
  label: string;
  pixels: number;
}

/**
 * Attaches a video URL to a <video>. HLS (.m3u8) goes through hls.js, or the
 * browser's own HLS support where hls.js can't run (iPhone); MP4 etc. are set directly.
 */
export function useHls(video: HTMLVideoElement | null, src: string, startAt: number) {
  const [hls, setHls] = useState<Hls | null>(null);
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!video) return;
    let instance: Hls | null = null;
    let cancelled = false;
    setError(null);
    setLevels([]);

    const seekToStart = () => {
      if (startAt > 0 && Number.isFinite(video.duration) && startAt < video.duration - 5) video.currentTime = startAt;
    };
    video.addEventListener("loadedmetadata", seekToStart, { once: true });
    const onNativeError = () => setError("Playback failed. Check your connection and try again.");

    const playNatively = () => {
      video.addEventListener("error", onNativeError);
      video.src = src;
    };

    const isHls = src.includes(".m3u8");
    if (isHls) {
      // Prefer hls.js wherever it works: some browsers (e.g. recent Chrome) say
      // they "maybe" play HLS natively but then fail. Native playback is the
      // fallback for browsers without MediaSource, mainly Safari on iPhone.
      import("hls.js").then(({ default: HlsCtor }) => {
        if (cancelled) return;
        if (!HlsCtor.isSupported()) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) playNatively();
          else setError("This browser can't play this video.");
          return;
        }
        instance = new HlsCtor({ capLevelToPlayerSize: true });
        instance.loadSource(src);
        instance.attachMedia(video);
        instance.on(HlsCtor.Events.MANIFEST_PARSED, (_e, data) => {
          setLevels(
            data.levels
              .filter((l) => l.height > 0)
              .map((l) => ({
                index: data.levels.indexOf(l),
                label: qualityLabel(l.width, l.height),
                pixels: (l.width || l.height) * l.height,
              }))
              .sort((a, b) => b.pixels - a.pixels),
          );
        });
        instance.on(HlsCtor.Events.ERROR, (_e, data) => {
          if (data.fatal) setError("Playback failed. Check your connection and try again.");
        });
        setHls(instance);
      });
    } else {
      playNatively();
    }

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", seekToStart);
      video.removeEventListener("error", onNativeError);
      instance?.destroy();
      setHls(null);
    };
    // startAt intentionally read only when the source changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, src]);

  const setQuality = (index: number) => {
    if (hls) hls.currentLevel = index; // -1 = auto
  };

  return { levels, setQuality, error, setError };
}
