"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Hls from "hls.js";
import {
  CheckIcon,
  ChevronRightIcon,
  CloseIcon,
  FullscreenIcon,
  ImdbBadge,
  PauseIcon,
  PipIcon,
  PlayIcon,
  SeekBackIcon,
  SeekForwardIcon,
  SettingsIcon,
  SubtitlesIcon,
  VolumeIcon,
} from "./icons";
import type { Title } from "@/types/catalog";

/**
 * Custom Prime Video player overlay.
 *
 * Fetches a direct stream URL from our own Next.js API route (/api/stream),
 * which runs server-side and tries multiple providers to find a working
 * HLS (.m3u8) or MP4 link. That URL is fed into hls.js (or the native
 * <video> element for Safari) so our custom player UI stays in full control.
 *
 * Layout matches the reference capture:
 *   • Top-left  — X-Ray, IMDb badge, All ›, Cast (n) ›
 *   • Top-centre— title, bold
 *   • Top-right — subtitles, settings, volume, PiP, fullscreen | close
 *   • Centre    — seek-back, play/pause, seek-forward
 *   • Bottom    — scrubber + chapter markers + time readout
 */

type PlayerPanel = "subtitles" | "settings" | "volume" | null;

const HIDE_CONTROLS_MS = 3000;
const CHAPTER_MARKS = [0.555, 0.702, 0.848];

function formatTime(total: number): string {
  const s = Math.max(0, Math.floor(total));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function VideoPlayer({
  title,
  season = "1",
  episode = "1",
}: {
  title: Title;
  season?: string;
  episode?: string;
}) {
  const router = useRouter();
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [panel, setPanel] = useState<PlayerPanel>(null);
  const [volume, setVolume] = useState(0.85);
  const [loading, setLoading] = useState(true);

  const hideTimer = useRef<number | undefined>(undefined);
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const togglePanel = (next: Exclude<PlayerPanel, null>) => {
    setPanel((cur) => (cur === next ? null : next));
    setControlsVisible(true);
    window.clearTimeout(hideTimer.current);
  };

  const close = useCallback(
    () => router.push(`/detail/${title.id}`),
    [router, title.id]
  );

  const nudge = useCallback(() => {
    setControlsVisible(true);
    window.clearTimeout(hideTimer.current);
    if (panel !== null) return;
    hideTimer.current = window.setTimeout(
      () => setControlsVisible(false),
      HIDE_CONTROLS_MS
    );
  }, [panel]);

  useEffect(() => {
    hideTimer.current = window.setTimeout(
      () => setControlsVisible(false),
      HIDE_CONTROLS_MS
    );
    return () => window.clearTimeout(hideTimer.current);
  }, []);

  // ── Fetch stream from our server-side API route ──────────────────────────
  useEffect(() => {
    if (!title.tmdbId) return;

    const type = title.isSeries ? "tv" : "movie";
    const url = `/api/stream?tmdb=${title.tmdbId}&type=${type}&season=${season}&episode=${episode}`;

    let cancelled = false;
    let hls: Hls | null = null;

    async function loadStream() {
      try {
        // 12-second hard timeout so the spinner never hangs forever
        const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
        const data = await res.json() as {
          url?: string;
          type?: string;
          error?: string;
          fallbackUrls?: string[];
        };

        if (!res.ok || data.error) {
          throw new Error(data.error || `API error ${res.status}`);
        }

        if (cancelled) return;

        const player = videoRef.current;
        if (!player || !data.url || !data.type) return;

        // Handle torrent streams via bridge services
        if (data.type === "torrent") {
          // Try fallback URLs (torrent-to-HTTP bridge services)
          const bridgeUrls = data.fallbackUrls || [];

          for (const bridgeUrl of bridgeUrls) {
            try {
              const bridgeRes = await fetch(bridgeUrl, {
                signal: AbortSignal.timeout(5000),
              });
              if (bridgeRes.ok) {
                const streamUrl = bridgeUrl; // Use bridge URL directly
                player.src = streamUrl;
                player.play().catch(() => {});
                setLoading(false);
                setPlaying(true);
                return;
              }
            } catch {}
          }

          // Fallback to test stream if bridges fail
          player.src =
            "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
          player.play().catch(() => {});
          setLoading(false);
          setPlaying(true);
          return;
        }

        if (data.type === "m3u8") {
          if (Hls.isSupported()) {
            hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(data.url);
            hls.attachMedia(player);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (!cancelled) {
                setLoading(false);
                player.play().catch(() => setPlaying(false));
                setPlaying(true);
              }
            });
            // Stop spinning on error
            hls.on(Hls.Events.ERROR, (_evt, errData) => {
              if (errData.fatal) setLoading(false);
            });
          } else {
            // Safari native HLS
            player.src = data.url;
            player.play().catch(() => {});
            setLoading(false);
            setPlaying(true);
          }
        } else {
          // MP4
          player.src = data.url;
          player.play().catch(() => {});
          setLoading(false);
          setPlaying(true);
        }
      } catch (e) {
        console.error("Stream load failed:", e);
        setLoading(false);
      }
    }

    loadStream();

    return () => {
      cancelled = true;
      hls?.destroy();
      hlsRef.current = null;
    };
  }, [title.tmdbId, title.isSeries, season, episode]);

  // ── Sync play/pause ──────────────────────────────────────────────────────
  useEffect(() => {
    const player = videoRef.current;
    if (!player) return;
    if (playing) {
      player.play().catch(() => setPlaying(false));
    } else {
      player.pause();
    }
  }, [playing]);

  // ── Sync volume ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (panel) setPanel(null);
        else close();
      }
      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        setPlaying((p) => !p);
        nudge();
      }
      if (e.key === "ArrowLeft") {
        const t = Math.max(0, elapsed - 10);
        setElapsed(t);
        if (videoRef.current) videoRef.current.currentTime = t;
        nudge();
      }
      if (e.key === "ArrowRight") {
        const t = Math.min(duration, elapsed + 10);
        setElapsed(t);
        if (videoRef.current) videoRef.current.currentTime = t;
        nudge();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, nudge, panel, elapsed, duration]);

  const progress = duration > 0 ? (elapsed / duration) * 100 : 0;

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const t = Math.round(((e.clientX - r.left) / r.width) * duration);
    setElapsed(t);
    if (videoRef.current) videoRef.current.currentTime = t;
    nudge();
  };

  return (
    <div
      ref={shellRef}
      className="atvwebplayersdk-player-container fixed inset-0 z-[300] select-none bg-black"
      onMouseMove={nudge}
      onClick={() => {
        setPanel(null);
        nudge();
      }}
    >
      {/* ── Video surface ── */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          poster={title.heroImage ?? title.cardImage}
          onTimeUpdate={() => {
            if (videoRef.current) setElapsed(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
          onEnded={() => setPlaying(false)}
          onClick={(e) => {
            e.stopPropagation();
            setPlaying((p) => !p);
            nudge();
          }}
        />

        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            <p className="text-sm text-white/60">Loading stream…</p>
          </div>
        )}
      </div>

      {/* ── Controls overlay ── */}
      <div
        className={cn(
          "atvwebplayersdk-overlay-container absolute inset-0 transition-opacity duration-300",
          controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        {/* ─── Top bar ─── */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-5 pb-20 pt-4">
          <div className="relative flex items-start">
            {/* X-Ray strip, left */}
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <span className="text-[30px] font-bold leading-none text-white">
                  X-Ray
                </span>
                <ImdbBadge />
                <button
                  type="button"
                  className="flex items-center gap-1 text-[24px] leading-none text-white/55 transition-colors hover:text-white"
                >
                  All
                  <ChevronRightIcon className="size-5" />
                </button>
              </div>
              <button
                type="button"
                className="mt-[34px] ml-[24px] flex w-[278px] items-center justify-between text-left text-[24px] leading-none text-white/55 transition-colors hover:text-white"
              >
                <span>
                  <span className="font-bold text-white">Cast</span> (20)
                </span>
                <ChevronRightIcon className="size-5" />
              </button>
            </div>

            {/* Title, centred */}
            <p className="pointer-events-none absolute inset-x-0 top-0 text-center text-[30px] font-bold leading-none text-white">
              {title.name}
            </p>

            {/* Icon cluster, right */}
            <div className="ml-auto flex items-center gap-6 text-white/85">
              <div className="relative">
                <PlayerIconButton
                  label="Subtitles and audio"
                  active={panel === "subtitles"}
                  onClick={() => togglePanel("subtitles")}
                >
                  <SubtitlesIcon className="size-[26px]" />
                </PlayerIconButton>
                {panel === "subtitles" && <SubtitlesPanel />}
              </div>
              <div className="relative">
                <PlayerIconButton
                  label="Settings"
                  active={panel === "settings"}
                  onClick={() => togglePanel("settings")}
                >
                  <SettingsIcon className="size-[26px]" />
                </PlayerIconButton>
                {panel === "settings" && <SettingsPanel />}
              </div>
              <div className="relative">
                <PlayerIconButton
                  label="Volume"
                  active={panel === "volume"}
                  onClick={() => togglePanel("volume")}
                >
                  <VolumeIcon className="size-[26px]" />
                </PlayerIconButton>
                {panel === "volume" && (
                  <VolumePanel value={volume} onChange={setVolume} />
                )}
              </div>
              <PlayerIconButton label="Picture in picture">
                <PipIcon className="size-[26px]" />
              </PlayerIconButton>
              <PlayerIconButton
                label="Full screen"
                onClick={() => {
                  if (document.fullscreenElement)
                    document.exitFullscreen();
                  else shellRef.current?.requestFullscreen?.();
                }}
              >
                <FullscreenIcon className="size-[26px]" />
              </PlayerIconButton>
              <span aria-hidden="true" className="h-8 w-px bg-white/35" />
              <PlayerIconButton label="Close player" onClick={close}>
                <CloseIcon className="size-[26px]" />
              </PlayerIconButton>
            </div>
          </div>
        </div>

        {/* ─── Transport (centre) ─── */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-[185px] [&>button]:pointer-events-auto">
          <button
            type="button"
            aria-label="Rewind 10 seconds"
            onClick={() => {
              const t = Math.max(0, elapsed - 10);
              setElapsed(t);
              if (videoRef.current) videoRef.current.currentTime = t;
              nudge();
            }}
            className="text-white/75 transition-colors hover:text-white"
          >
            <SeekBackIcon className="size-[78px]" />
          </button>
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => {
              setPlaying((p) => !p);
              nudge();
            }}
            className="text-white/75 transition-colors hover:text-white"
          >
            {playing ? (
              <PauseIcon className="size-[68px]" />
            ) : (
              <PlayIcon className="size-[68px]" />
            )}
          </button>
          <button
            type="button"
            aria-label="Forward 10 seconds"
            onClick={() => {
              const t = Math.min(duration, elapsed + 10);
              setElapsed(t);
              if (videoRef.current) videoRef.current.currentTime = t;
              nudge();
            }}
            className="text-white/75 transition-colors hover:text-white"
          >
            <SeekForwardIcon className="size-[78px]" />
          </button>
        </div>

        {/* ─── Bottom scrubber ─── */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-[80px] pb-6 pt-16">
          <div
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={elapsed}
            onClick={seekTo}
            className="group cursor-pointer py-3"
          >
            <div className="relative h-[3px] w-full bg-white/30">
              <div
                className="absolute inset-y-0 left-0 bg-white"
                style={{ width: `${progress}%` }}
              />
              {CHAPTER_MARKS.map((m) => (
                <span
                  key={m}
                  aria-hidden="true"
                  className="absolute top-1/2 size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                  style={{ left: `${m * 100}%` }}
                />
              ))}
              <span
                aria-hidden="true"
                className="absolute top-1/2 size-[13px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100"
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>

          <p className="mt-1 text-[21px] leading-none">
            <span className="font-bold text-white">{formatTime(elapsed)}</span>
            <span className="text-white/55"> / {formatTime(duration)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function PlayerIconButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={active}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "transition-colors",
        active ? "text-white" : "text-white/85 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function Popover({
  children,
  className,
  caretClass = "left-1/2 -translate-x-1/2",
}: {
  children: React.ReactNode;
  className?: string;
  caretClass?: string;
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "absolute top-[calc(100%+14px)] z-10 rounded-md bg-[#3b3b3b] shadow-lg",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute -top-[7px] size-0 border-x-[8px] border-b-[8px] border-x-transparent border-b-[#3b3b3b]",
          caretClass
        )}
      />
      {children}
    </div>
  );
}

const SUBTITLE_TRACKS = [
  { label: "Off", selected: true },
  { label: "English", selected: false },
];
const AUDIO_TRACKS = [{ label: "हिन्दी", selected: true }];

function SubtitlesPanel() {
  return (
    <Popover
      className="right-[-96px] flex w-[600px] cursor-default text-left"
      caretClass="right-[100px]"
    >
      <section className="w-1/2 px-6 py-5">
        <h3 className="mb-4 text-[17px] font-bold leading-none text-white">
          Subtitles
        </h3>
        <ul>
          {SUBTITLE_TRACKS.map((t) => (
            <li key={t.label}>
              <TrackOption {...t} />
            </li>
          ))}
        </ul>
        <hr className="my-4 border-white/25" />
        <button
          type="button"
          className="text-[16px] leading-none text-[#2f9fef] hover:underline"
        >
          Subtitles Settings
        </button>
      </section>
      <span aria-hidden="true" className="w-px self-stretch bg-white/25" />
      <section className="w-1/2 px-6 py-5">
        <h3 className="mb-4 text-[17px] font-bold leading-none text-white">
          Audio
        </h3>
        <ul>
          {AUDIO_TRACKS.map((t) => (
            <li key={t.label}>
              <TrackOption {...t} />
            </li>
          ))}
        </ul>
      </section>
    </Popover>
  );
}

function TrackOption({
  label,
  selected,
}: {
  label: string;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 py-[8px] text-left text-[17px] leading-none"
    >
      <span className="w-6 shrink-0 text-white">
        {selected && <CheckIcon className="size-[17px]" />}
      </span>
      <span className={selected ? "font-bold text-white" : "text-[#8f8f8f]"}>
        {label}
      </span>
    </button>
  );
}

const QUALITY_OPTIONS = [
  { label: "Good", detail: "Uses about 0.38 GB per hour", selected: true },
  { label: "Better", detail: "Uses about 1.40 GB per hour", selected: false },
  { label: "Best", detail: "Uses about 6.84 GB per hour", selected: false },
];

function SettingsPanel() {
  return (
    <Popover
      className="right-[-48px] w-[380px] cursor-default text-left"
      caretClass="right-[52px]"
    >
      <div className="px-6 py-5">
        <h3 className="mb-4 text-[19px] font-bold leading-none text-white">
          Video Quality
        </h3>
        <ul>
          {QUALITY_OPTIONS.map((o) => (
            <li key={o.label}>
              <button
                type="button"
                className="flex w-full items-start gap-3 py-[9px] text-left"
              >
                <span className="mt-1 w-7 shrink-0 text-white">
                  {o.selected && <CheckIcon className="size-[19px]" />}
                </span>
                <span>
                  <span
                    className={cn(
                      "block text-[17px] leading-tight",
                      o.selected
                        ? "font-bold text-white"
                        : "text-[#8f8f8f]"
                    )}
                  >
                    {o.label}
                  </span>
                  <span
                    className={cn(
                      "block text-[13px] font-bold leading-tight",
                      o.selected ? "text-white" : "text-[#8f8f8f]"
                    )}
                  >
                    {o.detail}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Popover>
  );
}

function VolumePanel({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const setFromPointer = (clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    onChange(Math.min(1, Math.max(0, 1 - (clientY - r.top) / r.height)));
  };

  return (
    <Popover className="left-1/2 w-[52px] -translate-x-1/2 cursor-default">
      <div
        className="flex h-[180px] items-center justify-center py-3"
        onMouseDown={(e) => setFromPointer(e.clientY)}
      >
        <div
          ref={trackRef}
          className="relative h-full w-[3px] cursor-pointer bg-white/45"
        >
          <div
            className="absolute inset-x-0 bottom-0 bg-white"
            style={{ height: `${value * 100}%` }}
          />
          <span
            className="absolute size-[13px] -translate-x-1/2 translate-y-1/2 rounded-full bg-white"
            style={{ left: "50%", bottom: `${value * 100}%` }}
          />
        </div>
      </div>
    </Popover>
  );
}
