"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Captions,
  ListVideo,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { Season, SubtitleTrack } from "@/data/types";
import { getSavedProgress, isFinished, saveProgress, setPlayerPrefs, type SubtitleBackground, usePlayerPrefs } from "@/lib/user-data";
import { ProgressBar } from "./progress-bar";
import { EpisodesPanel, PlayerMenu, type MenuSection } from "./player-menus";
import { formatTime } from "./format";
import { useHls } from "./use-hls";
import { languageName, useSubtitleLines } from "./subtitles";
import { useSubtitleLayout } from "./subtitle-layout";

export interface PlayerProps {
  slug: string;
  titleName: string;
  /** e.g. "S1 · E7 · Ghost Signal". Empty for movies. */
  episodeLabel?: string;
  episodeId?: string;
  src: string;
  introStart?: number;
  introEnd?: number;
  /** Where the end credits start (seconds); they run to the end. */
  outroStart?: number;
  nextHref?: string;
  nextLabel?: string;
  season?: Season;
  audioLanguages: string[];
  /** This video's subtitle files (WebVTT). */
  subtitles: SubtitleTrack[];
}

const HIDE_AFTER_MS = 3000;
const SKIP = 10;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
/** Each subtitle line's backing pill (same size and padding for every style). */
const PILL: Record<SubtitleBackground, string> = {
  black: "bg-black",
  white: "bg-white",
  none: "bg-black/35",
};

export function Player(props: PlayerProps) {
  const { slug, episodeId, src, introStart, introEnd, outroStart, nextHref } = props;
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const prefs = usePlayerPrefs();

  // The end credits start here and run to the end (0, missing, or past the end: none).
  const creditsFrom = useCallback(
    (length: number) => (outroStart !== undefined && outroStart > 0 && length > 0 && outroStart < length ? outroStart : null),
    [outroStart],
  );

  const [startAt] = useState(() => {
    const saved = getSavedProgress(episodeId ?? slug);
    if (!saved || isFinished(saved)) return 0;
    const credits = creditsFrom(saved.duration);
    return credits !== null && saved.position >= credits ? 0 : saved.position; // stopped in the credits: watched
  });
  const { levels, setQuality, error } = useHls(video, src, startAt);

  // ── subtitles: the saved choice is a language name ("English"), or "Off" ──
  const subtitleLangs = props.subtitles.map((t) => ({ lang: t.lang, name: languageName(t.lang) }));
  const subtitleLang = subtitleLangs.find((s) => s.name === prefs.subtitles)?.lang ?? null;
  const subtitleLines = useSubtitleLines(video, props.subtitles, subtitleLang);
  const subtitleBox = useRef<HTMLParagraphElement>(null);
  const controlBar = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [menu, setMenu] = useState<null | "captions" | "settings" | "episodes">(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [flash, setFlash] = useState<null | { icon: "back" | "fwd" | "play" | "pause"; key: number }>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── controls auto-hide ──
  const poke = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), HIDE_AFTER_MS);
  }, []);
  const keepVisible = !playing || menu !== null || scrubbing;
  const showControls = controlsVisible || keepVisible;
  const subtitleLayout = useSubtitleLayout(root, video, subtitleBox, controlBar, showControls, subtitleLines);
  const subtitleBackground = prefs.subtitleBackground ?? "black";

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  // ── apply saved preferences ──
  useEffect(() => {
    if (!video) return;
    video.volume = prefs.volume;
    video.muted = prefs.muted;
    video.playbackRate = prefs.speed;
  }, [video, prefs.volume, prefs.muted, prefs.speed]);

  // ── video events ──
  useEffect(() => {
    if (!video) return;
    const on = (ev: string, fn: () => void) => {
      video.addEventListener(ev, fn);
      return () => video.removeEventListener(ev, fn);
    };
    const offs = [
      on("play", () => {
        setPlaying(true);
        poke(); // start the hide timer even if the mouse never moves
      }),
      on("pause", () => setPlaying(false)),
      on("waiting", () => setWaiting(true)),
      on("playing", () => setWaiting(false)),
      on("canplay", () => setWaiting(false)),
      on("loadedmetadata", () => setDuration(video.duration)),
      on("durationchange", () => setDuration(video.duration)),
      on("timeupdate", () => setCurrent(video.currentTime)),
      on("progress", () => {
        const b = video.buffered;
        if (b.length) setBuffered(b.end(b.length - 1));
      }),
    ];
    video.play().catch(() => setPlaying(false)); // autoplay may be blocked; user taps play
    return () => offs.forEach((off) => off());
  }, [video, poke]);

  // ── save progress every 5s and when leaving ──
  useEffect(() => {
    if (!video) return;
    const save = () => {
      if (!(video.duration > 0 && video.currentTime > 0)) return;
      const credits = creditsFrom(video.duration);
      const inCredits = credits !== null && video.currentTime >= credits;
      saveProgress({ slug, episodeId, position: inCredits ? video.duration : video.currentTime, duration: video.duration });
    };
    const id = setInterval(() => !video.paused && save(), 5000);
    video.addEventListener("pause", save);
    window.addEventListener("pagehide", save);
    return () => {
      save();
      clearInterval(id);
      video.removeEventListener("pause", save);
      window.removeEventListener("pagehide", save);
    };
  }, [video, slug, episodeId, creditsFrom]);

  // ── fullscreen ──
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const togglePlay = useCallback(() => {
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, [video]);
  const seek = useCallback(
    (t: number) => {
      if (video) video.currentTime = Math.max(0, Math.min(t, (video.duration || 0) - 0.1));
    },
    [video],
  );
  const skip = useCallback(
    (d: number) => {
      if (!video) return;
      seek(video.currentTime + d);
      setFlash({ icon: d < 0 ? "back" : "fwd", key: Date.now() });
    },
    [video, seek],
  );
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else root.current?.requestFullscreen?.().catch(() => {});
  }, []);
  const setVolume = (v: number) => setPlayerPrefs({ volume: Math.min(1, Math.max(0, v)), muted: v <= 0 });
  const toggleMute = () => setPlayerPrefs({ muted: !prefs.muted, volume: prefs.muted && prefs.volume === 0 ? 0.6 : prefs.volume });

  const inIntro = introStart !== undefined && introEnd !== undefined && introEnd > introStart && current >= introStart && current < introEnd - 1;
  const skipIntro = useCallback(() => introEnd && seek(introEnd), [introEnd, seek]);
  // credits: on to the next episode, or (last episode / movie) back to the title page;
  // leaving saves the episode as watched (see save above)
  const creditsAt = creditsFrom(duration);
  const inOutro = creditsAt !== null && current >= creditsAt && current < duration - 1;
  const skipOutro = useCallback(() => {
    router.replace(nextHref ?? `/title/${slug}`);
  }, [nextHref, router, slug]);

  // ── keyboard shortcuts ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      switch (k) {
        case " ":
        case "k":
          togglePlay();
          setFlash({ icon: video?.paused ? "pause" : "play", key: Date.now() });
          break;
        case "arrowleft":
        case "j":
          skip(-SKIP);
          break;
        case "arrowright":
        case "l":
          skip(SKIP);
          break;
        case "arrowup":
          setVolume(prefs.volume + 0.1);
          break;
        case "arrowdown":
          setVolume(prefs.volume - 0.1);
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
        case "s":
          if (inIntro) skipIntro();
          else if (inOutro) skipOutro();
          break;
        case "escape":
          if (menu) setMenu(null);
          else if (!document.fullscreenElement) router.push(`/title/${slug}`);
          break;
        default:
          return;
      }
      e.preventDefault();
      poke();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ── touch: single tap toggles controls, double tap on a side skips ──
  const lastTap = useRef<{ t: number; x: number } | null>(null);
  const onSurfacePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (menu) {
      setMenu(null);
      return;
    }
    if (e.pointerType === "mouse") {
      togglePlay();
      return;
    }
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (lastTap.current && now - lastTap.current.t < 300) {
      lastTap.current = null;
      if (x < rect.width * 0.4) skip(-SKIP);
      else if (x > rect.width * 0.6) skip(SKIP);
      else togglePlay();
      return;
    }
    lastTap.current = { t: now, x };
    setTimeout(() => {
      if (lastTap.current?.t === now) {
        lastTap.current = null;
        if (controlsVisible && playing) setControlsVisible(false);
        else poke();
      }
    }, 280);
  };

  // ── menu definitions ──
  const captionSections: MenuSection[] = [
    {
      heading: "Audio",
      options: props.audioLanguages.map((l) => ({ label: l, value: l })),
      selected: props.audioLanguages.includes(prefs.audio) ? prefs.audio : props.audioLanguages[0],
      onSelect: (v) => setPlayerPrefs({ audio: String(v) }),
    },
    {
      heading: "Subtitles",
      options: [{ label: "Off", value: "Off" }, ...subtitleLangs.map((s) => ({ label: s.name, value: s.name }))],
      selected: subtitleLang ? prefs.subtitles : "Off",
      onSelect: (v) => setPlayerPrefs({ subtitles: String(v) }),
    },
    ...(subtitleLangs.length
      ? [
          {
            heading: "Subtitle background",
            options: [
              { label: "Black", value: "black" },
              { label: "White", value: "white" },
              { label: "None", value: "none" },
            ],
            selected: subtitleBackground,
            onSelect: (v: string | number) => setPlayerPrefs({ subtitleBackground: v as SubtitleBackground }),
          },
        ]
      : []),
  ];
  const settingsSections: MenuSection[] = [
    {
      heading: "Quality",
      options: [{ label: "Auto", value: -1 }, ...levels.map((l) => ({ label: l.label, value: l.index }))],
      selected: levels.some((l) => l.index === prefs.quality) ? prefs.quality : -1,
      onSelect: (v) => {
        setQuality(Number(v));
        setPlayerPrefs({ quality: Number(v) });
      },
    },
    {
      heading: "Speed",
      options: SPEEDS.map((s) => ({ label: s === 1 ? "Normal" : `${s}×`, value: s })),
      selected: prefs.speed,
      onSelect: (v) => setPlayerPrefs({ speed: Number(v) }),
    },
  ];

  const VolumeIcon = prefs.muted || prefs.volume === 0 ? VolumeX : prefs.volume < 0.5 ? Volume1 : Volume2;
  const iconBtn = "grid size-10 place-items-center rounded-full text-fg transition-[background-color,transform] duration-150 hover:bg-white/10 active:scale-90";

  return (
    <div
      ref={root}
      className={`fixed inset-0 z-50 select-none bg-black ${showControls ? "" : "cursor-none"}`}
      onPointerMove={(e) => e.pointerType === "mouse" && poke()}
    >
      {/* crossOrigin: subtitle files come from the video host and must be readable */}
      <video ref={setVideo} className="absolute inset-0 size-full object-contain" playsInline preload="auto" crossOrigin="anonymous">
        {props.subtitles.map((t) => (
          <track key={t.url} kind="subtitles" src={t.url} srcLang={t.lang} label={languageName(t.lang)} />
        ))}
      </video>

      {/* subtitles, drawn by us: just under the picture when there's a black bar
          (so they never cover text burned into the video), and clear of the controls.
          Every style puts each line on its own pill, as wide as its text. */}
      {subtitleLines.length > 0 && (
        <div
          aria-live="polite"
          style={{ top: subtitleLayout.top, bottom: subtitleLayout.bottom, fontSize: subtitleLayout.fontPx }}
          className="pointer-events-none absolute inset-x-0 flex justify-center px-6"
        >
          {/* each line is its own box (inline-block), with a gap between: an inline
              background is taller than the line spacing and would overlap the next line */}
          <p
            ref={subtitleBox}
            className={`flex max-w-[min(92%,1100px)] flex-col items-center gap-1 text-center font-semibold leading-snug ${
              subtitleBackground === "white" ? "text-black" : "text-white"
            } ${subtitleBackground === "none" ? "[text-shadow:0_0_6px_rgba(0,0,0,.95),0_2px_3px_rgba(0,0,0,.9)]" : ""}`}
          >
            {subtitleLines.map((line, i) => (
              <span key={i} className={`inline-block max-w-full rounded-md px-2 py-0.5 ${PILL[subtitleBackground]}`}>
                {line}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* click / tap surface */}
      <div className="absolute inset-0" onPointerUp={onSurfacePointer} />

      {/* loading & errors */}
      {waiting && !error && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <Loader2 size={44} className="animate-spin text-lavender" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div>
            <p className="text-lg font-bold">Something went wrong</p>
            <p className="mt-1 text-sm text-muted">{error}</p>
            <button type="button" onClick={() => location.reload()} className="bg-brand mt-5 rounded-full px-5 py-2.5 text-sm font-bold text-bg">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* skip feedback */}
      {flash && (
        <div
          key={flash.key}
          className={`pointer-events-none absolute top-1/2 grid size-20 -translate-y-1/2 animate-[flash_600ms_ease-out_forwards] place-items-center rounded-full bg-black/40 ${
            flash.icon === "back" ? "left-[15%]" : flash.icon === "fwd" ? "right-[15%]" : "left-1/2 -translate-x-1/2"
          }`}
        >
          {flash.icon === "back" && <RotateCcw size={30} />}
          {flash.icon === "fwd" && <RotateCw size={30} />}
          {flash.icon === "play" && <Play size={30} fill="currentColor" strokeWidth={0} />}
          {flash.icon === "pause" && <Pause size={30} fill="currentColor" strokeWidth={0} />}
        </div>
      )}

      {/* Skip intro (stays visible even when controls hide) */}
      {inIntro && (
        <button
          type="button"
          onClick={skipIntro}
          className={`absolute right-4 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-bg/75 px-5 py-2.5 text-sm font-bold backdrop-blur-md transition-[bottom,background-color] duration-300 hover:bg-surface sm:right-7 ${
            showControls ? "bottom-32" : "bottom-10"
          }`}
        >
          Skip Intro <SkipForward size={16} />
        </button>
      )}

      {/* Credits: next episode (or past the credits on the last one / a movie) */}
      {inOutro && !inIntro && (
        <button
          type="button"
          onClick={skipOutro}
          className={`absolute right-4 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-bg/75 px-5 py-2.5 text-sm font-bold backdrop-blur-md transition-[bottom,background-color] duration-300 hover:bg-surface sm:right-7 ${
            showControls ? "bottom-32" : "bottom-10"
          }`}
        >
          {nextHref ? (props.nextLabel ?? "Next Episode") : "Skip Credits"} <SkipForward size={16} />
        </button>
      )}

      {/* ── controls ── */}
      <div className={`transition-opacity duration-300 ${showControls ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        {/* top bar */}
        <div className="absolute inset-x-0 top-0 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent px-3 pb-12 pt-3 sm:px-6 sm:pt-5">
          <Link href={`/title/${slug}`} aria-label="Back" className={iconBtn}>
            <ArrowLeft size={22} />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold sm:text-base">{props.titleName}</p>
            {props.episodeLabel && <p className="truncate text-xs text-soft">{props.episodeLabel}</p>}
          </div>
          <span className="ml-auto hidden font-logo text-lg font-extrabold opacity-60 sm:block">
            reel<span className="text-brand">m</span>
          </span>
        </div>

        {/* center controls */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-10 sm:gap-14">
          <button type="button" onClick={() => skip(-SKIP)} aria-label="Back 10 seconds" className="pointer-events-auto hidden opacity-85 transition-opacity hover:opacity-100 sm:block">
            <RotateCcw size={30} />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            className="pointer-events-auto grid size-16 place-items-center rounded-full border border-white/20 bg-bg/50 backdrop-blur transition-transform duration-150 active:scale-90 sm:size-[72px]"
          >
            {playing ? <Pause size={28} fill="currentColor" strokeWidth={0} /> : <Play size={28} fill="currentColor" strokeWidth={0} className="ml-1" />}
          </button>
          <button type="button" onClick={() => skip(SKIP)} aria-label="Forward 10 seconds" className="pointer-events-auto hidden opacity-85 transition-opacity hover:opacity-100 sm:block">
            <RotateCw size={30} />
          </button>
        </div>

        {/* bottom bar */}
        <div
          ref={controlBar}
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-14 sm:px-6 sm:pb-5"
        >
          <ProgressBar
            current={current}
            duration={duration}
            buffered={buffered}
            introStart={introStart}
            introEnd={introEnd}
            outroStart={creditsAt ?? undefined}
            onSeek={seek}
            onScrub={setScrubbing}
          />
          <div className="mt-1 flex items-center gap-1 sm:gap-2">
            <button type="button" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} className={iconBtn}>
              {playing ? <Pause size={22} fill="currentColor" strokeWidth={0} /> : <Play size={22} fill="currentColor" strokeWidth={0} />}
            </button>
            <button type="button" onClick={() => skip(-SKIP)} aria-label="Back 10 seconds" className={`${iconBtn} hidden sm:grid`}>
              <RotateCcw size={20} />
            </button>
            <button type="button" onClick={() => skip(SKIP)} aria-label="Forward 10 seconds" className={`${iconBtn} hidden sm:grid`}>
              <RotateCw size={20} />
            </button>
            <div className="group/vol hidden items-center sm:flex">
              <button type="button" onClick={toggleMute} aria-label={prefs.muted ? "Unmute" : "Mute"} className={iconBtn}>
                <VolumeIcon size={21} />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={prefs.muted ? 0 : prefs.volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume"
                className="h-1 w-0 cursor-pointer appearance-none rounded-full bg-white/30 opacity-0 transition-all duration-200 accent-lavender group-hover/vol:ml-1 group-hover/vol:w-20 group-hover/vol:opacity-100 focus:ml-1 focus:w-20 focus:opacity-100"
              />
            </div>
            <span className="ml-1 text-xs tabular-nums text-soft sm:text-[13px]">
              {formatTime(current)} / {formatTime(duration)}
            </span>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              {props.nextHref && (
                <Link href={props.nextHref} replace className="hidden h-10 items-center gap-2 rounded-full px-3 text-[13px] text-soft transition-colors hover:bg-white/10 hover:text-fg md:flex">
                  <SkipForward size={18} />
                  {props.nextLabel ?? "Next Episode"}
                </Link>
              )}
              {props.nextHref && (
                <Link href={props.nextHref} replace aria-label="Next episode" className={`${iconBtn} md:hidden`}>
                  <SkipForward size={20} />
                </Link>
              )}
              {props.season && (
                <button type="button" onClick={() => setMenu(menu === "episodes" ? null : "episodes")} aria-label="Episodes" className={iconBtn}>
                  <ListVideo size={21} />
                </button>
              )}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenu(menu === "captions" ? null : "captions")}
                  aria-label="Subtitles and audio"
                  aria-expanded={menu === "captions"}
                  className={`${iconBtn} ${menu === "captions" ? "bg-white/10 text-lavender" : ""}`}
                >
                  <Captions size={21} />
                </button>
                {menu === "captions" && <PlayerMenu sections={captionSections} onClose={() => setMenu(null)} />}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenu(menu === "settings" ? null : "settings")}
                  aria-label="Settings"
                  aria-expanded={menu === "settings"}
                  className={`${iconBtn} ${menu === "settings" ? "bg-white/10 text-lavender" : ""}`}
                >
                  <Settings size={20} className={`transition-transform duration-300 ${menu === "settings" ? "rotate-45" : ""}`} />
                </button>
                {menu === "settings" && <PlayerMenu sections={settingsSections} onClose={() => setMenu(null)} />}
              </div>
              <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "Exit full screen" : "Full screen"} className={iconBtn}>
                {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {menu === "episodes" && props.season && (
        <EpisodesPanel slug={slug} season={props.season} currentId={episodeId} onClose={() => setMenu(null)} />
      )}
    </div>
  );
}
