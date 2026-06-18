/**
 * 오디오 어댑터 — iOS 네이티브 (AVAudioPlayer) ↔ 웹 (Howler) 통합 인터페이스.
 *
 * iOS 네이티브: NativeAudio 플러그인 (AVAudioPlayer) — 잠금화면 자동 메타 충돌 0
 * 웹: Howler.js (HTMLAudioElement)
 *
 * 같은 API 로 양쪽 처리 → Music.tsx, Sleep.tsx 가 분기 안 함.
 */

import { Capacitor, registerPlugin } from "@capacitor/core";
import { Howl } from "howler";

interface PlayOpts {
  id: string;
  url: string;
  volume?: number;
  loop?: boolean;
}

interface NativeAudioPlugin {
  play(opts: { id: string; url: string; volume: number; loop: boolean }): Promise<void>;
  stop(opts: { id: string }): Promise<void>;
  stopAll(): Promise<void>;
  setVolume(opts: { id: string; volume: number }): Promise<void>;
  isPlaying(opts: { id: string }): Promise<{ playing: boolean }>;
}

// NativeAudio plugin 영구 비활성 — URLSession.dataTask 가 capacitor:// 스킴 로컬 파일 못 다운로드 →
// 깨진 데이터로 AVAudioPlayer 만들어서 "기계음" 출력. Howler html5 만 사용 (HTMLAudioElement = WebKit 직접 디코드).
const native: NativeAudioPlugin | null = null;
void registerPlugin;
void Capacitor;
const isNative = Capacitor.isNativePlatform();

// iOS WKWebView: 백그라운드 진입 시 HTMLAudioElement 가 paused 상태로 변하고,
// 복귀 시 자동 resume 안 함. visibilitychange 에 howl.play() 호출만 (ctx 건드리지 않음).
// 안전: stop 트리거 0, ctx 공유 0 — 단순 재생 명령만.
if (typeof window !== "undefined") {
  const resumeAllTracks = () => {
    tracks.forEach((howl) => {
      try {
        if (!howl.playing()) howl.play();
      } catch {}
    });
  };
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) resumeAllTracks();
  });
  window.addEventListener("pageshow", resumeAllTracks);
  window.addEventListener("focus", resumeAllTracks);
}

// 웹 폴백용 Howl 인스턴스
const howls = new Map<string, Howl>();

/** html5:true (HTMLAudioElement) — iOS 백그라운드 안정 우선.
 *  - 다른 앱으로 가도 / 화면 꺼도 / 복귀해도 음악 살아있음
 *  - loop 경계에 50-100ms 갭 (자연 사운드라 거의 안 거슬림)
 *  - 진짜 갭 0 은 v1.1 에서 native AVAudioPlayer 플러그인으로 해결
 */
const tracks = new Map<string, Howl>();

const playWithHowler = (opts: PlayOpts) => {
  const existing = tracks.get(opts.id);
  if (existing) {
    existing.stop();
    existing.unload();
  }
  const howl = new Howl({
    src: [opts.url],
    html5: true,                   // ← HTMLAudioElement (백그라운드 안정)
    loop: opts.loop ?? true,       // ← iOS native 가 직접 loop 처리
    volume: opts.volume ?? 0.5,
    preload: true,
    onloaderror: (_id, err) => console.warn("[audio] load error:", err),
    onplayerror: (_id, err) => console.warn("[audio] play error:", err),
    // 안전망 — loop:true 인데도 끝나면 재시작
    onend: function () { if (!this.playing()) this.play(); },
  });
  howl.play();
  tracks.set(opts.id, howl);
};

export const audioAdapter = {
  async play(opts: PlayOpts): Promise<void> {
    // iOS: native plugin 우선 시도 → 실패하면 Howler 폴백
    if (native) {
      try {
        await native.play({
          id: opts.id,
          url: opts.url,
          volume: opts.volume ?? 0.5,
          loop: opts.loop ?? true,
        });
        return;
      } catch (err) {
        console.warn("[audio] native 실패 → Howler 폴백:", err);
      }
    }
    playWithHowler(opts);
  },

  async stop(id: string): Promise<void> {
    if (native) {
      try { await native.stop({ id }); } catch {}
    }
    const h = tracks.get(id);
    if (h) { h.stop(); h.unload(); tracks.delete(id); }
  },

  async stopAll(): Promise<void> {
    if (native) {
      try { await native.stopAll(); } catch {}
    }
    tracks.forEach((h) => { h.stop(); h.unload(); });
    tracks.clear();
  },

  async setVolume(id: string, volume: number): Promise<void> {
    if (native) {
      try { await native.setVolume({ id, volume }); } catch {}
    }
    tracks.get(id)?.volume(volume);
  },

  async pauseAll(): Promise<void> {},
  async resumeAll(): Promise<void> {},

  isNative,
};
