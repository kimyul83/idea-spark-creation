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

/** Gapless 재생을 위한 더블 버퍼 — 한 Howl 이 끝나기 직전 다른 Howl 시작.
 *  HTMLAudioElement loop=true 의 50ms 갭 회피. */
class GaplessTrack {
  private a: Howl;
  private b: Howl;
  private active: 0 | 1 = 0;
  private id: string;
  private nextTimer: number | undefined;

  constructor(opts: PlayOpts) {
    this.id = opts.id;
    const make = (idx: 0 | 1): Howl => new Howl({
      src: [opts.url],
      html5: true,
      loop: false,            // 수동 swap → loop 비활성
      volume: opts.volume ?? 0.5,
      preload: true,
      onload: () => {
        if (idx === 0) this.startA();
      },
      onend: () => {
        // 한쪽 끝남 — 다음 swap 은 이미 schedule 돼있음
      },
    });
    this.a = make(0);
    this.b = make(1);
  }

  private startA() {
    this.a.play();
    this.active = 0;
    this.scheduleSwap(this.a);
  }

  private scheduleSwap(current: Howl) {
    const dur = current.duration();
    if (!dur || dur <= 0) return;
    // 갭 0 보장 — 200ms 전에 다음 시작 (브라우저 지연 흡수)
    const swapAt = Math.max(50, (dur - 0.2) * 1000);
    if (this.nextTimer) window.clearTimeout(this.nextTimer);
    this.nextTimer = window.setTimeout(() => this.swap(), swapAt);
  }

  private swap() {
    const next = (this.active === 0 ? this.b : this.a);
    next.play();
    next.seek(0);
    this.active = this.active === 0 ? 1 : 0;
    this.scheduleSwap(next);
  }

  setVolume(v: number) {
    this.a.volume(v);
    this.b.volume(v);
  }

  stop() {
    if (this.nextTimer) window.clearTimeout(this.nextTimer);
    this.a.stop(); this.a.unload();
    this.b.stop(); this.b.unload();
  }
}

const tracks = new Map<string, GaplessTrack>();

const playWithHowler = (opts: PlayOpts) => {
  const existing = tracks.get(opts.id);
  if (existing) existing.stop();
  const t = new GaplessTrack(opts);
  tracks.set(opts.id, t);
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
    tracks.get(id)?.stop();
    tracks.delete(id);
  },

  async stopAll(): Promise<void> {
    if (native) {
      try { await native.stopAll(); } catch {}
    }
    tracks.forEach((t) => t.stop());
    tracks.clear();
  },

  async setVolume(id: string, volume: number): Promise<void> {
    if (native) {
      try { await native.setVolume({ id, volume }); } catch {}
    }
    tracks.get(id)?.setVolume(volume);
  },

  async pauseAll(): Promise<void> {},
  async resumeAll(): Promise<void> {},

  isNative,
};
