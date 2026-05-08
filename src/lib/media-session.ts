/**
 * Media Session — iOS 잠금화면 / 제어센터 위젯 + 웹 브라우저 미디어 키.
 *
 * iOS 네이티브: 자체 NowPlayingPlugin (Swift) → MPNowPlayingInfoCenter 직접 호출
 * Web: navigator.mediaSession (브라우저 탭 미디어 키)
 */

import { Capacitor, registerPlugin } from "@capacitor/core";

interface NowPlayingPlugin {
  setInfo(opts: { title: string; artist: string; album: string; durationSeconds: number; elapsedSeconds: number }): Promise<void>;
  setPlaybackState(opts: { playing: boolean }): Promise<void>;
  clear(): Promise<void>;
  addListener(event: string, cb: () => void): { remove: () => Promise<void> };
}

const NowPlayingNative = registerPlugin<NowPlayingPlugin>("NowPlaying");

interface MediaMeta {
  title: string;
  artist?: string;
  album?: string;
  artwork?: string;
  /** 재생 총 시간(초) — 잠금화면 위젯에 표시. 미지정 시 12시간. */
  durationSeconds?: number;
  /** 현재 경과 시간(초) — 위젯 진행 막대용. 미지정 시 0. */
  elapsedSeconds?: number;
}

let wakeLock: WakeLockSentinel | null = null;
let nativeListenersAdded = false;
const nativeHandlers: { onPlay?: () => void; onPause?: () => void } = {};

/** 주기적 NowPlayingInfo 재설정 — iOS 가 HTMLAudioElement 길이로 덮어쓰기 막기 */
let durationRepeatTimer: number | undefined;
let sessionStart = 0;
let currentDuration = 0;
let currentMeta: MediaMeta | null = null;

/** 네이티브 NowPlaying 플러그인 (iOS 잠금화면 위젯). */
const getNativePlugin = (): NowPlayingPlugin | null => {
  if (!Capacitor.isNativePlatform()) return null;
  return NowPlayingNative;
};

export const setMediaSession = (
  meta: MediaMeta,
  handlers: {
    onPlay?: () => void;
    onPause?: () => void;
    onNext?: () => void;
    onPrev?: () => void;
  } = {}
) => {
  // 1) 네이티브 (iOS 잠금화면 위젯)
  const native = getNativePlugin();
  if (native) {
    sessionStart = Date.now();
    // durationSeconds 미지정 = 무한 재생 (정지 누를 때까지)
    const isInfinite = meta.durationSeconds == null || meta.durationSeconds <= 0;
    currentDuration = isInfinite ? 0 : meta.durationSeconds;
    currentMeta = meta;

    const formatRemaining = (sec: number): string => {
      const total = Math.max(0, currentDuration - sec);
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      if (h > 0) return `${h}시간 ${m}분 남음`;
      if (m > 0) return `${m}분 남음`;
      return "곧 종료";
    };

    const baseTitle = meta.title;
    const baseArtist = meta.artist ?? "Mint Wave";
    const push = () => {
      let artistText = baseArtist;
      if (!isInfinite) {
        const elapsed = (Date.now() - sessionStart) / 1000;
        artistText = `${baseArtist} · ${formatRemaining(elapsed)}`;
      } else {
        artistText = `${baseArtist} · 무한 재생`;
      }
      native.setInfo({
        title: baseTitle,
        artist: artistText,
        album: meta.album ?? "Therapeutic Soundscape",
        durationSeconds: currentDuration,
        elapsedSeconds: 0,
      }).catch(() => {});
    };
    push();
    // 무한 재생일 땐 텍스트 안 바뀌니까 갱신 필요 없음. 타이머만 30초 갱신.
    if (durationRepeatTimer) window.clearInterval(durationRepeatTimer);
    if (!isInfinite) durationRepeatTimer = window.setInterval(push, 30000);

    // 잠금화면 ▶/⏸ 버튼 → JS handlers 실행
    nativeHandlers.onPlay = handlers.onPlay;
    nativeHandlers.onPause = handlers.onPause;
    if (!nativeListenersAdded && native.addListener) {
      native.addListener("play", () => nativeHandlers.onPlay?.());
      native.addListener("pause", () => nativeHandlers.onPause?.());
      nativeListenersAdded = true;
    }
  }

  // 2) Web Media Session (브라우저 탭, fallback)
  if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: meta.title,
      artist: meta.artist ?? "Mint Wave",
      album: meta.album ?? "Therapeutic Soundscape",
      artwork: meta.artwork
        ? [{ src: meta.artwork, sizes: "512x512", type: "image/png" }]
        : [],
    });

    if (handlers.onPlay) navigator.mediaSession.setActionHandler("play", handlers.onPlay);
    if (handlers.onPause) navigator.mediaSession.setActionHandler("pause", handlers.onPause);
    if (handlers.onNext) {
      try { navigator.mediaSession.setActionHandler("nexttrack", handlers.onNext); } catch {}
    }
    if (handlers.onPrev) {
      try { navigator.mediaSession.setActionHandler("previoustrack", handlers.onPrev); } catch {}
    }
  }
};

export const setMediaSessionPlaying = (playing: boolean) => {
  // 네이티브
  const native = getNativePlugin();
  if (native) {
    native.setPlaybackState({ playing }).catch(() => {});
  }
  // Web
  if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }
};

export const clearMediaSession = () => {
  // 주기 갱신 타이머 해제
  if (durationRepeatTimer) {
    window.clearInterval(durationRepeatTimer);
    durationRepeatTimer = undefined;
  }
  currentMeta = null;
  // 네이티브
  const native = getNativePlugin();
  if (native) {
    native.clear().catch(() => {});
  }
  // Web
  if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.playbackState = "none";
  }
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
