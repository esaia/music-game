import { useState, useEffect, useRef } from "react";
import type { Track } from "../data/tracks";

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

  useEffect(() => {
    loadYouTubeAPI(() => setApiReady(true));
  }, []);

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
    if (isPlaying) {
      if (typeof p.pauseVideo === "function") p.pauseVideo();
    } else {
      setWaitingForPlay(true);
      if (typeof p.playVideo === "function") p.playVideo();
    }
  };

  const showPlayLoading = waitingForPlay || isBuffering;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const p = playerRef.current;
    if (!p || typeof p.seekTo !== "function") return;
    const sec = parseFloat(e.target.value);
    setCurrentTime(sec);
    p.seekTo(sec, true);
  };

  const handleSeekStart = () => setIsSeeking(true);
  const handleSeekEnd = () => setIsSeeking(false);

  return (
    <div
      className="fixed inset-0 z-[1000] flex h-screen items-center justify-center bg-black/80 p-3"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[100vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl  p-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full border-0 bg-white/20 text-2xl leading-none text-white"
        >
          ×
        </button>

        {/* Hidden YouTube player (audio only) */}
        <div className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
          <div id={PLAYER_CONTAINER_ID} className="h-full w-full" />
        </div>

        {/* Custom audio control */}
        <div className="mb-3 shrink-0 rounded-2xl bg-black/20 mt-20 p-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePlayPause}
              disabled={showPlayLoading}
              aria-label={
                showPlayLoading ? "Loading" : isPlaying ? "Pause" : "Play"
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#46178f] disabled:opacity-90 disabled:cursor-wait"
            >
              {showPlayLoading ? (
                <svg
                  className="h-6 w-6 animate-spin"
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
              ) : isPlaying ? (
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg
                  className="ml-0.5 h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              )}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-lg text-white/90">
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

        <div className="mb-3 shrink-0">
          <button
            type="button"
            onClick={handleRevealToggle}
            className="rounded-2xl bg-white px-6 py-3 text-lg font-bold text-[#46178f]"
          >
            {revealed ? "Hide title & photo" : "Reveal title & photo"}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {revealed && (
            <div className="mb-3">
              <h3 className="mb-2 text-xl font-bold md:text-2xl">
                {track.title}
              </h3>
              <img
                src={track.photoUrl}
                alt=""
                className="max-h-40 w-full rounded-2xl object-cover"
              />
            </div>
          )}

          {buzzIns.length > 0 && (
            <div>
              <h4 className="mb-2 text-lg font-bold">Teams with answer</h4>
              <ul className="space-y-1">
                {[...buzzIns]
                  .sort(
                    (a, b) =>
                      (a.timestamp ?? Infinity) - (b.timestamp ?? Infinity),
                  )
                  .map(({ teamId, teamName, timestamp }, index) => (
                    <li
                      key={teamId}
                      className={`flex items-center justify-between gap-2 rounded-2xl py-2 pl-3 pr-2 ${
                        index === 0
                          ? "border-2 border-white bg-white/25"
                          : "bg-black/20"
                      }`}
                    >
                      <span className="min-w-0 flex-1 text-lg">
                        {index === 0 && (
                          <span className="mr-2 rounded bg-white px-1.5 py-0.5 text-xs font-bold text-[#46178f]">
                            First
                          </span>
                        )}
                        <span>{teamName}</span>
                        {timestamp != null && (
                          <span className="ml-2 text-base text-white/70">
                            {formatBuzzTime(timestamp)}
                          </span>
                        )}
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        {onAwardScore && (
                          <button
                            type="button"
                            onClick={() => {
                              onAwardScore(teamId, teamName);
                              onClose();
                            }}
                            className="rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-[#46178f]"
                            title="Team guessed correctly (+points)"
                          >
                            Correct
                          </button>
                        )}
                        {onRemoveBuzzIn && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBuzzIn(teamId)}
                            className="rounded-full p-1.5 text-white/80"
                            aria-label={`Remove ${teamName}`}
                            title="Remove (accidental buzz)"
                          >
                            ×
                          </button>
                        )}
                      </div>
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
