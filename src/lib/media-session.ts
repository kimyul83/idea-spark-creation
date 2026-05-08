/**
 * Media Session — iOS 잠금화면 / 제어센터 위젯 + 웹 브라우저 미디어 키.
 *
 * iOS 네이티브: 자체 NowPlayingPlugin (Swift) → MPNowPlayingInfoCenter 직접 호출
 * Web: navigator.mediaSession (브라우저 탭 미디어 키)
 */

import { Capacitor } from "@capacitor/core";

interface MediaMeta {
  title: string;
  artist?: string;
  album?: string;
  artwork?: string;
}

let wakeLock: WakeLockSentinel | null = null;
let nativeListenersAdded = false;
const nativeHandlers: { onPlay?: () => void; onPause?: () => void } = {};

/** 네이티브 NowPlaying 플러그인 (iOS 잠금화면 위젯). */
const getNativePlugin = (): any => {
  if (!Capacitor.isNativePlatform()) return null;
  return (Capacitor as any).Plugins?.NowPlaying;
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
    native.setInfo({
      title: meta.title,
      artist: meta.artist ?? "Mint Wave",
      album: meta.album ?? "Therapeutic Soundscape",
    }).catch(() => {});

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
