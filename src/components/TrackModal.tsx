import { useState, useEffect, useRef } from "react";
import type { Track } from "../data/tracks";
import { getCategoryByTrackId } from "../data/tracks";

type BuzzInEntry = { teamId: string; teamName: string; timestamp?: number };

function formatBuzzTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

type TrackModalProps = {
  track: Track;
  onClose: () => void;
  buzzIns?: BuzzInEntry[];
  onRemoveBuzzIn?: (teamId: string) => void;
  onAwardScore?: (teamKey: string, teamName: string) => void;
  revealed?: boolean;
  onReveal?: () => void;
  onPlayerStateChange?: (state: {
    isPlaying: boolean;
    seekTime: number;
  }) => void;
  syncedIsPlaying?: boolean;
  syncedSeekTime?: number;
  alwaysShowTitleAndPreview?: boolean;
};

const PLAYER_CONTAINER_ID = "youtube-player-container";
const YT_PLAYING = 1;
const YT_BUFFERING = 3;

function loadYouTubeAPI(onReady: () => void): void {
  if (window.YT?.Player) {
    onReady();
    return;
  }
  window.onYouTubeIframeAPIReady = onReady;
  if (
    document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
  )
    return;
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const first = document.getElementsByTagName("script")[0];
  first?.parentNode?.insertBefore(tag, first);
}

export default function TrackModal({
  track,
  onClose,
  buzzIns = [],
  onRemoveBuzzIn,
  onAwardScore,
  revealed: revealedProp = false,
  onReveal,
  onPlayerStateChange,
  syncedIsPlaying,
  syncedSeekTime,
  alwaysShowTitleAndPreview = false,
}: TrackModalProps) {
  const [localRevealed, setLocalRevealed] = useState(false);
  const [apiReady, setApiReady] = useState(Boolean(window.YT?.Player));
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [waitingForPlay, setWaitingForPlay] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const playerRef = useRef<{
    pauseVideo: () => void;
    playVideo: () => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    seekTo: (s: number, allow: boolean) => void;
    getPlayerState: () => number;
    destroy?: () => void;
  } | null>(null);
  const isSeekingRef = useRef(false);
  const timeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  isSeekingRef.current = isSeeking;

  const revealed = revealedProp ?? localRevealed;
  const isSlave = syncedIsPlaying !== undefined;
  const category = getCategoryByTrackId(track.id);

  useEffect(() => {
    loadYouTubeAPI(() => setApiReady(true));
  }, []);

  useEffect(() => {
    if (!isSlave || !playerRef.current) return;
    const p = playerRef.current;
    if (
      typeof syncedSeekTime === "number" &&
      syncedSeekTime >= 0 &&
      typeof p.seekTo === "function"
    ) {
      p.seekTo(syncedSeekTime, true);
    }
    if (syncedIsPlaying && typeof p.playVideo === "function") {
      p.playVideo();
    } else if (typeof p.pauseVideo === "function") {
      p.pauseVideo();
    }
  }, [isSlave, syncedSeekTime, syncedIsPlaying]);

  useEffect(() => {
    if (!apiReady || !track) return;
    const el = document.getElementById(PLAYER_CONTAINER_ID);
    if (!el) return;
    const player = new window.YT!.Player(PLAYER_CONTAINER_ID, {
      videoId: track.youtubeVideoId,
      width: "1",
      height: "1",
      playerVars: {
        enablejsapi: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: () => {
          playerRef.current = player;
          if (typeof player.getDuration === "function") {
            const d = player.getDuration();
            if (d && !Number.isNaN(d)) setDuration(d);
          }
          timeIntervalRef.current = setInterval(() => {
            const p = playerRef.current;
            if (!p || isSeekingRef.current) return;
            if (typeof p.getCurrentTime === "function") {
              const t = p.getCurrentTime();
              if (typeof t === "number" && !Number.isNaN(t)) setCurrentTime(t);
            }
            if (typeof p.getDuration === "function") {
              const dur = p.getDuration();
              if (typeof dur === "number" && !Number.isNaN(dur) && dur > 0)
                setDuration(dur);
            }
          }, 200);
        },
        onStateChange: (event: { data: number }) => {
          const state = event.data;
          setIsPlaying(state === YT_PLAYING);
          setIsBuffering(state === YT_BUFFERING);
          if (state === YT_PLAYING) setWaitingForPlay(false);
        },
      },
    });
    return () => {
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
      if (typeof player.destroy === "function") player.destroy();
      playerRef.current = null;
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setWaitingForPlay(false);
      setIsBuffering(false);
    };
  }, [apiReady, track.id, track.youtubeVideoId]);

  useEffect(() => {
    const p = playerRef.current;
    if (buzzIns.length > 0 && p && typeof p.pauseVideo === "function") {
      p.pauseVideo();
    }
  }, [buzzIns.length]);

  const handleRemoveBuzzIn = (teamId: string) => {
    onRemoveBuzzIn?.(teamId);
  };

  const handleRevealToggle = () => {
    if (onReveal) onReveal();
    else setLocalRevealed((prev) => !prev);
  };

  const handlePlayPause = () => {
    const p = playerRef.current;
    if (!p) return;
    const nextPlaying = !isPlaying;
    if (isPlaying) {
      if (typeof p.pauseVideo === "function") p.pauseVideo();
    } else {
      setWaitingForPlay(true);
      if (typeof p.playVideo === "function") p.playVideo();
    }
    const t =
      typeof p.getCurrentTime === "function" ? p.getCurrentTime() : currentTime;
    onPlayerStateChange?.({ isPlaying: nextPlaying, seekTime: t });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const p = playerRef.current;
    if (!p || typeof p.seekTo !== "function") return;
    const sec = parseFloat(e.target.value);
    setCurrentTime(sec);
    p.seekTo(sec, true);
    onPlayerStateChange?.({ isPlaying, seekTime: sec });
  };

  const handleSeekStart = () => setIsSeeking(true);
  const handleSeekEnd = () => setIsSeeking(false);

  const displayPlaying = isSlave ? syncedIsPlaying : isPlaying;
  const showPlayLoading = isSlave ? false : waitingForPlay || isBuffering;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[1000] flex h-screen items-center justify-center bg-black/80 "
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-screen w-full max-w-2xl flex-col overflow-hidden rounded-2xl pt-8 p-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {!isSlave && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2 top-2 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-0 bg-white/20 text-3xl leading-none text-white"
          >
            ×
          </button>
        )}

        {category && (
          <div className="animate-fade-down mb-3 mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-white/15 px-4 py-2 text-base font-semibold text-white backdrop-blur-sm md:text-lg">
              {category.name}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-kahoot-purple px-4 py-2 text-base font-bold text-white shadow-lg md:text-lg">
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z" />
              </svg>
              {track.points} pts
            </span>
          </div>
        )}

        <div className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
          <div id={PLAYER_CONTAINER_ID} className="h-full w-full" />
        </div>

        <div className="animate-fade-down mb-3 mt-2 shrink-0 rounded-2xl bg-black/20 p-4">
          <div className="flex items-center gap-4">
            {!isSlave && (
              <button
                type="button"
                onClick={handlePlayPause}
                disabled={showPlayLoading}
                aria-label={
                  showPlayLoading
                    ? "Loading"
                    : displayPlaying
                      ? "Pause"
                      : "Play"
                }
                className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-kahoot-purple disabled:cursor-wait disabled:opacity-90"
              >
                {showPlayLoading ? (
                  <svg
                    className="h-8 w-8 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="32 24"
                    />
                  </svg>
                ) : displayPlaying ? (
                  <svg
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="ml-0.5 h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                )}
              </button>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xl text-white/90">
                <span>{formatSeconds(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  onMouseDown={handleSeekStart}
                  onTouchStart={handleSeekStart}
                  onMouseUp={handleSeekEnd}
                  onTouchEnd={handleSeekEnd}
                  className="h-3 w-full cursor-pointer appearance-none rounded-full bg-white/30 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
                <span>{formatSeconds(duration || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {!isSlave && (
          <div className="mb-3 shrink-0">
            <button
              type="button"
              onClick={handleRevealToggle}
              className="cursor-pointer rounded-2xl bg-white px-6 py-3 text-xl font-bold text-kahoot-purple"
            >
              {revealed ? "Hide title & photo" : "Reveal title & photo"}
            </button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {(revealed || alwaysShowTitleAndPreview) && (
            <div className="animate-scale-in mb-3">
              <h3 className="mb-2 text-2xl font-bold md:text-3xl">
                {track.title}
              </h3>
              <img
                src={track.photoUrl}
                alt=""
                className="max-h-52 w-full rounded-2xl object-cover"
              />
            </div>
          )}

          {buzzIns.length > 0 && (
            <div>
              <h4 className="mb-2 text-xl font-bold md:text-2xl">
                Teams with answer
              </h4>
              <ul className="space-y-2">
                {[...buzzIns]
                  .sort(
                    (a, b) =>
                      (a.timestamp ?? Infinity) - (b.timestamp ?? Infinity),
                  )
                  .map(({ teamId, teamName, timestamp }, index) => (
                    <li
                      key={teamId}
                      className={`flex items-center justify-between gap-2 rounded-2xl py-3 pl-4 pr-3 ${
                        index === 0
                          ? "border-2 border-white bg-white/25"
                          : "bg-white/25"
                      }`}
                    >
                      <span className="min-w-0 flex-1 text-xl">
                        {index === 0 && (
                          <span className="mr-2 rounded bg-white px-2 py-0.5 text-sm font-bold text-kahoot-purple">
                            First
                          </span>
                        )}
                        <span>{teamName}</span>
                        {timestamp != null && (
                          <span className="ml-2 text-lg text-white/70">
                            {formatBuzzTime(timestamp)}
                          </span>
                        )}
                      </span>
                      {!isSlave && (
                        <div className="flex shrink-0 items-center gap-1">
                          {onAwardScore && (
                            <button
                              type="button"
                              onClick={() => {
                                onAwardScore(teamId, teamName);
                                onClose();
                              }}
                              className="cursor-pointer rounded-xl bg-white px-4 py-2 text-base font-bold text-kahoot-purple"
                              title="Team guessed correctly (+points)"
                            >
                              Correct
                            </button>
                          )}
                          {onRemoveBuzzIn && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBuzzIn(teamId)}
                              className="cursor-pointer rounded-full p-2 text-xl text-white/80"
                              aria-label={`Remove ${teamName}`}
                              title="Remove (accidental buzz)"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
