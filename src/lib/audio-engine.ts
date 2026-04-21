import { Howl } from "howler";

/**
 * Multi-track audio engine. Manages URL-based sounds (Howler) and
 * synthesized frequencies / noise (Web Audio API) simultaneously.
 */

type ActiveTrack =
  | { kind: "howl"; howl: Howl; volume: number }
  | { kind: "tone"; oscillator: OscillatorNode; gain: GainNode; volume: number }
  | { kind: "noise"; source: AudioBufferSourceNode; gain: GainNode; volume: number };

class AudioEngine {
  private tracks = new Map<string, ActiveTrack>();
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  isPlaying(id: string) {
    return this.tracks.has(id);
  }

  playUrl(id: string, url: string, volume = 0.6) {
    if (this.tracks.has(id)) return;
    const howl = new Howl({ src: [url], loop: true, volume, html5: true });
    howl.play();
    this.tracks.set(id, { kind: "howl", howl, volume });
  }

  playTone(id: string, frequencyHz: number, volume = 0.15) {
    if (this.tracks.has(id)) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequencyHz;
    gain.gain.value = volume;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    this.tracks.set(id, { kind: "tone", oscillator: osc, gain, volume });
  }

  /** Pink/Brown/White noise via filtered random buffer */
  playNoise(id: string, type: "white" | "pink" | "brown", volume = 0.2) {
    if (this.tracks.has(id)) return;
    const ctx = this.getCtx();
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "white") {
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === "pink") {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else {
      // brown
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(ctx.destination);
    source.start();
    this.tracks.set(id, { kind: "noise", source, gain, volume });
  }

  setVolume(id: string, volume: number) {
    const t = this.tracks.get(id);
    if (!t) return;
    t.volume = volume;
    if (t.kind === "howl") t.howl.volume(volume);
    else t.gain.gain.value = volume;
  }

  stop(id: string) {
    const t = this.tracks.get(id);
    if (!t) return;
    if (t.kind === "howl") {
      t.howl.fade(t.volume, 0, 600);
      setTimeout(() => t.howl.unload(), 700);
    } else if (t.kind === "tone") {
      t.gain.gain.linearRampToValueAtTime(0, this.getCtx().currentTime + 0.5);
      setTimeout(() => { t.oscillator.stop(); t.oscillator.disconnect(); }, 600);
    } else {
      t.gain.gain.linearRampToValueAtTime(0, this.getCtx().currentTime + 0.5);
      setTimeout(() => { t.source.stop(); t.source.disconnect(); }, 600);
    }
    this.tracks.delete(id);
  }

  stopAll() {
    Array.from(this.tracks.keys()).forEach((id) => this.stop(id));
  }

  getActiveIds(): string[] {
    return Array.from(this.tracks.keys());
  }
}

export const audioEngine = new AudioEngine();
