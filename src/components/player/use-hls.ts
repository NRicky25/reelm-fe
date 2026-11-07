"use client";
import { useEffect, useState } from "react";
import type Hls from "hls.js";

export interface QualityLevel {
  index: number;
  height: number;
}

/**
 * Attaches a video URL to a <video>. HLS (.m3u8) goes through hls.js unless the
 * browser plays it natively (Safari); MP4 etc. are set directly.
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

    const isHls = src.includes(".m3u8");
    if (isHls && !video.canPlayType("application/vnd.apple.mpegurl")) {
      import("hls.js").then(({ default: HlsCtor }) => {
        if (cancelled) return;
        if (!HlsCtor.isSupported()) {
          setError("This browser can't play this video.");
          return;
        }
        instance = new HlsCtor({ capLevelToPlayerSize: true });
        instance.loadSource(src);
        instance.attachMedia(video);
        instance.on(HlsCtor.Events.MANIFEST_PARSED, (_e, data) => {
          setLevels(
            data.levels
              .map((l, index) => ({ index, height: l.height }))
              .filter((l) => l.height > 0)
              .sort((a, b) => b.height - a.height),
          );
        });
        instance.on(HlsCtor.Events.ERROR, (_e, data) => {
          if (data.fatal) setError("Playback failed. Check your connection and try again.");
        });
        setHls(instance);
      });
    } else {
      video.src = src;
    }

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", seekToStart);
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
