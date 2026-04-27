/**
 * Media Session API + Wake Lock.
 *
 * 브라우저(iOS Safari 특히)가 백그라운드 탭의 오디오를 끄지 않도록:
 * 1. Media Session metadata 등록 → OS에 "재생 중인 미디어" 알림 → 잠금 화면 컨트롤
 * 2. Wake Lock → 화면 꺼짐 방지 (가능한 환경에서만)
 *
 * 이거 없이 단순 Howler로 재생하면 iOS는 5~15분 후 탭 suspend.
 */

interface MediaMeta {
  title: string;
  artist?: string;
  album?: string;
  artwork?: string;
}

let wakeLock: WakeLockSentinel | null = null;

export const setMediaSession = (
  meta: MediaMeta,
  handlers: {
    onPlay?: () => void;
    onPause?: () => void;
    onNext?: () => void;
    onPrev?: () => void;
  } = {}
) => {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: meta.title,
    artist: meta.artist ?? "Yunseul",
    album: meta.album ?? "Therapeutic Soundscape",
    artwork: meta.artwork
      ? [{ src: meta.artwork, sizes: "512x512", type: "image/png" }]
      : [],
  });

  if (handlers.onPlay) {
    navigator.mediaSession.setActionHandler("play", handlers.onPlay);
  }
  if (handlers.onPause) {
    navigator.mediaSession.setActionHandler("pause", handlers.onPause);
  }
  if (handlers.onNext) {
    try {
      navigator.mediaSession.setActionHandler("nexttrack", handlers.onNext);
    } catch { /* not supported */ }
  }
  if (handlers.onPrev) {
    try {
      navigator.mediaSession.setActionHandler("previoustrack", handlers.onPrev);
    } catch { /* not supported */ }
  }
};

export const setMediaSessionPlaying = (playing: boolean) => {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  navigator.mediaSession.playbackState = playing ? "playing" : "paused";
};

export const clearMediaSession = () => {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = null;
  navigator.mediaSession.playbackState = "none";
};

/**
 * 화면 꺼짐 방지 (재생 중에만 활성화).
 * 안 되는 환경 많아 silent fail.
 */
export const requestWakeLock = async (): Promise<void> => {
  if (typeof navigator === "undefined") return;
  if (!("wakeLock" in navigator)) return;
  try {
    wakeLock = await (navigator as any).wakeLock.request("screen");
  } catch { /* ignore */ }
};

export const releaseWakeLock = async (): Promise<void> => {
  try {
    await wakeLock?.release();
  } catch { /* ignore */ }
  wakeLock = null;
};

interface WakeLockSentinel {
  release: () => Promise<void>;
}
