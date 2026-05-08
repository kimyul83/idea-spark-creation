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

// Howler 폴백 (native 실패 또는 웹)
const playWithHowler = (opts: PlayOpts) => {
  const existing = howls.get(opts.id);
  if (existing) {
    existing.stop();
    existing.unload();
  }
  const howl = new Howl({
    src: [opts.url],
    html5: true,
    loop: opts.loop ?? true,
    volume: opts.volume ?? 0.5,
    preload: true,
    onend: function () { if (!this.playing()) this.play(); },
  });
  howl.play();
  howls.set(opts.id, howl);
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
    const h = howls.get(id);
    if (h) {
      h.stop();
      h.unload();
      howls.delete(id);
    }
  },

  async stopAll(): Promise<void> {
    if (native) {
      try { await native.stopAll(); } catch {}
    }
    howls.forEach((h) => { h.stop(); h.unload(); });
    howls.clear();
  },

  async setVolume(id: string, volume: number): Promise<void> {
    if (native) {
      try { await native.setVolume({ id, volume }); } catch {}
    }
    howls.get(id)?.volume(volume);
  },

  async pauseAll(): Promise<void> {
    if (native) {
      // AVAudioPlayer 의 pause 는 네이티브 플러그인에 없음 → stopAll 로 대체 (다시 play 하면 처음부터)
      // 잠금화면 ⏸ 가 stop 처럼 동작 — 사용자가 ▶ 누르면 같은 트랙 재생
      return;
    }
    howls.forEach((h) => h.pause());
  },

  async resumeAll(): Promise<void> {
    if (!native) {
      howls.forEach((h) => { if (!h.playing()) h.play(); });
    }
  },

  isNative,
};
