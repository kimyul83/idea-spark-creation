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

// Capacitor 8 플러그인 등록 — 네이티브 클래스 안 잡혔을 때 throw 안 하도록 try/catch
let native: NativeAudioPlugin | null = null;
try {
  if (Capacitor.isNativePlatform()) {
    native = registerPlugin<NativeAudioPlugin>("NativeAudio");
  }
} catch {
  native = null;
}
const isNative = Capacitor.isNativePlatform();

// 웹 폴백용 Howl 인스턴스
const howls = new Map<string, Howl>();

/** 가장 단순+안정 — html5:true + loop:true.
 *  - iOS 백그라운드 / 다른 앱 사용 / 재진입 모두 안정
 *  - loop 경계에 50ms 미세 갭 (자연 사운드라 거의 인식 안 됨)
 *  - 진짜 갭 0 은 native AVAudioPlayer 만 가능 (별도 작업)
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
    loop: opts.loop ?? true,       // ← iOS 가 직접 loop 처리
    volume: opts.volume ?? 0.5,
    preload: true,
    onloaderror: (_id, err) => console.warn("[audio] load error:", err),
    onplayerror: (_id, err) => console.warn("[audio] play error:", err),
    // iOS HTMLAudioElement 가 어쩌다 loop=true 인데도 끝나면 안전망
    onend: function () { if (!this.playing()) this.play(); },
  });
  howl.play();
  tracks.set(opts.id, howl);
};

export const audioAdapter = {
  async play(opts: PlayOpts): Promise<void> {
    // 네이티브 시도 → 실패하면 즉시 Howler 폴백 (음악은 무조건 재생되게)
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
        // fall through
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
