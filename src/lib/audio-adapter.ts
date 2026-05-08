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

/** 크로스페이드 트랙 — HTMLAudioElement 두 개 번갈아가며 재생.
 *  - html5: true (백그라운드 / 재진입 안정적)
 *  - 끝나기 1.5초 전 다음 시작 + 1.5초 페이드 인/아웃
 *  - 사용자 귀로는 한 곡 무한 이어짐 (갭 0, 부드러운 전환)
 */
const FADE_MS = 1500;
const PRE_LOAD_MS = 2000;

class CrossfadeTrack {
  private a: Howl;
  private b: Howl;
  private active: 0 | 1 = 0;
  private targetVolume: number;
  private swapTimer: number | undefined;
  private destroyed = false;

  constructor(opts: PlayOpts) {
    this.targetVolume = opts.volume ?? 0.5;
    const make = (idx: 0 | 1): Howl => new Howl({
      src: [opts.url],
      html5: true,
      loop: false,
      volume: idx === 0 ? this.targetVolume : 0,
      preload: true,
      onload: () => {
        if (idx === 0 && !this.destroyed) this.startA();
      },
      onloaderror: (_id, err) => console.warn("[audio] load error:", err),
    });
    this.a = make(0);
    this.b = make(1);
  }

  private startA() {
    this.a.volume(this.targetVolume);
    this.a.play();
    this.active = 0;
    this.scheduleNext(this.a);
  }

  private scheduleNext(current: Howl) {
    if (this.destroyed) return;
    const dur = current.duration();
    if (!dur || dur <= 0) {
      // 실패 — 0.5s 후 재시도
      this.swapTimer = window.setTimeout(() => this.scheduleNext(current), 500);
      return;
    }
    // (전체 - 페이드 - 여유) 후 swap
    const startNextAt = Math.max(50, (dur * 1000) - FADE_MS - 100);
    if (this.swapTimer) window.clearTimeout(this.swapTimer);
    this.swapTimer = window.setTimeout(() => this.swap(), startNextAt);
  }

  private swap() {
    if (this.destroyed) return;
    const next = this.active === 0 ? this.b : this.a;
    const cur = this.active === 0 ? this.a : this.b;
    // next 처음부터 + 페이드 인 / cur 페이드 아웃
    next.seek(0);
    next.volume(0);
    next.play();
    next.fade(0, this.targetVolume, FADE_MS);
    cur.fade(this.targetVolume, 0, FADE_MS);
    // 페이드 끝나면 cur 정지 (다음 swap 위해 0 으로 리셋)
    window.setTimeout(() => {
      if (!this.destroyed) cur.stop();
    }, FADE_MS + 100);
    this.active = this.active === 0 ? 1 : 0;
    this.scheduleNext(next);
  }

  setVolume(v: number) {
    this.targetVolume = v;
    const cur = this.active === 0 ? this.a : this.b;
    cur.volume(v);
  }

  stop() {
    this.destroyed = true;
    if (this.swapTimer) window.clearTimeout(this.swapTimer);
    this.a.stop(); this.a.unload();
    this.b.stop(); this.b.unload();
  }
}

const tracks = new Map<string, CrossfadeTrack>();

const playWithHowler = (opts: PlayOpts) => {
  const existing = tracks.get(opts.id);
  if (existing) existing.stop();
  const t = new CrossfadeTrack(opts);
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
