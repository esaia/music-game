declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: typeof YTNamespace;
  }
}

interface YTNamespace {
  Player: new (
    elementId: string | HTMLElement,
    options: {
      videoId: string;
      width?: number | string;
      height?: number | string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (event: { target: YTPlayerInstance }) => void;
        onStateChange?: (event: { data: number }) => void;
      };
    }
  ) => YTPlayerInstance;
}

interface YTPlayerInstance {
  pauseVideo: () => void;
  playVideo: () => void;
  stopVideo: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getPlayerState: () => number; // 1 playing, 2 paused, etc.
  destroy: () => void;
}

export {};
