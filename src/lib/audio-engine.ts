import { Howl } from "howler";

/**
 * Multi-track audio engine.
 *
 * Strategy:
 *   - Frequency tones (40/432/528 Hz...) → OscillatorNode
 *   - Noise (white/pink/brown)           → BufferSource + filter
 *   - Nature ambience (rain/ocean/wind/forest/stream/cave/sun/birds)
 *                                         → Synthesized via filtered noise + LFOs
 *   - ASMR (typing, page-turn, brushing) → Synthesized clicks/pops
 *   - Optional URL-based playback (Howler) — kept for future real-file uploads
 *
 * Result: zero external audio dependencies, no 403s, works offline.
 */

type ActiveTrack =
  | { kind: "howl"; howl: Howl; volume: number }
  | { kind: "synth"; nodes: AudioNode[]; gain: GainNode; volume: number; cleanup?: () => void };

export type NatureSoundId =
  | "rain" | "ocean" | "wind" | "forest" | "stream" | "cave" | "sun" | "birds";
export type AsmrSoundId = "typing" | "page" | "brush" | "cafe";
export type SleepSoundId =
  | "deep_waves"      // 40Hz delta + ocean
  | "calm_rain"       // rain + 432Hz
  | "forest_night"    // crickets + soft chirps
  | "sleep_asmr"      // lofi-ish + white noise
  | "delta_meditation" // binaural 0.5–4Hz
  | "lullaby"         // soft piano (sine pad) + 528Hz
  | "cosmic_drone"    // deep ambient drone
  | "meadow_breeze";  // wind + crickets

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

  // ─── URL playback (kept for future real-file support) ──────────────
  playUrl(
    id: string,
    url: string,
    volume = 0.6,
    onError?: (msg: string) => void,
  ) {
    if (this.tracks.has(id)) return;
    const howl = new Howl({
      src: [url],
      loop: true,
      volume,
      html5: true,
      onloaderror: (_, err) => {
        this.tracks.delete(id);
        onError?.(`사운드를 불러올 수 없어요 (${err})`);
      },
      onplayerror: (_, err) => {
        this.tracks.delete(id);
        onError?.(`재생할 수 없어요 (${err})`);
      },
    });
    howl.play();
    this.tracks.set(id, { kind: "howl", howl, volume });
  }

  // ─── Pure tone (sine osc) ─────────────────────────────────────────
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
    this.tracks.set(id, {
      kind: "synth", nodes: [osc, gain], gain, volume,
      cleanup: () => { try { osc.stop(); osc.disconnect(); } catch {} },
    });
  }

  // ─── Noise generators ─────────────────────────────────────────────
  private makeNoiseBuffer(seconds = 2, type: "white" | "pink" | "brown" = "white"): AudioBuffer {
    const ctx = this.getCtx();
    const len = seconds * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "white") {
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === "pink") {
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
        b2=0.969*b2+w*0.153852;    b3=0.8665*b3+w*0.3104856;
        b4=0.55*b4+w*0.5329522;    b5=-0.7616*b5-w*0.016898;
        data[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
      }
    } else { // brown
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * w) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
    }
    return buffer;
  }

  playNoise(id: string, type: "white" | "pink" | "brown", volume = 0.2) {
    if (this.tracks.has(id)) return;
    const ctx = this.getCtx();
    const source = ctx.createBufferSource();
    source.buffer = this.makeNoiseBuffer(2, type);
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(ctx.destination);
    source.start();
    this.tracks.set(id, {
      kind: "synth", nodes: [source, gain], gain, volume,
      cleanup: () => { try { source.stop(); source.disconnect(); } catch {} },
    });
  }

  // ─── Nature ambience (synthesized) ────────────────────────────────
  /**
   * Synthesizes nature ambience from filtered noise + LFO modulation.
   * No external audio files required.
   */
  playNature(id: string, kind: NatureSoundId, volume = 0.25) {
    if (this.tracks.has(id)) return;
    const ctx = this.getCtx();
    const source = ctx.createBufferSource();
    const noiseType: "white" | "pink" | "brown" =
      kind === "ocean" || kind === "cave" || kind === "wind" ? "brown"
      : kind === "rain" || kind === "stream" ? "white"
      : "pink";
    source.buffer = this.makeNoiseBuffer(4, noiseType);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    gain.gain.value = volume;

    // Per-sound voicing
    const extras: AudioNode[] = [];
    let cleanupExtras: (() => void) | undefined;

    switch (kind) {
      case "rain": {
        filter.type = "highpass";
        filter.frequency.value = 1200;
        filter.Q.value = 0.7;
        // subtle dynamic shimmer on top
        const shimmer = ctx.createBiquadFilter();
        shimmer.type = "bandpass";
        shimmer.frequency.value = 4500;
        shimmer.Q.value = 1.2;
        source.connect(filter);
        const wet = ctx.createGain(); wet.gain.value = 0.4;
        source.connect(shimmer).connect(wet);
        filter.connect(gain);
        wet.connect(gain);
        extras.push(shimmer, wet);
        break;
      }
      case "ocean": {
        // Brown noise with slow LFO on lowpass cutoff = wave wash
        filter.type = "lowpass";
        filter.frequency.value = 800;
        filter.Q.value = 1.2;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.12; // ~8s wave
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 500;
        lfo.connect(lfoGain).connect(filter.frequency);
        lfo.start();
        source.connect(filter).connect(gain);
        extras.push(lfo, lfoGain);
        cleanupExtras = () => { try { lfo.stop(); lfo.disconnect(); } catch {} };
        break;
      }
      case "wind": {
        filter.type = "lowpass";
        filter.frequency.value = 600;
        filter.Q.value = 0.5;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.18;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 350;
        lfo.connect(lfoGain).connect(filter.frequency);
        lfo.start();
        source.connect(filter).connect(gain);
        extras.push(lfo, lfoGain);
        cleanupExtras = () => { try { lfo.stop(); lfo.disconnect(); } catch {} };
        break;
      }
      case "forest": {
        // pink noise + bandpass + occasional bird chirps via short osc bursts
        filter.type = "bandpass";
        filter.frequency.value = 2400;
        filter.Q.value = 0.8;
        source.connect(filter).connect(gain);
        // chirp scheduler
        const chirpId = window.setInterval(() => {
          if (!this.tracks.has(id)) return;
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine";
          o.frequency.value = 1800 + Math.random() * 1800;
          o.frequency.exponentialRampToValueAtTime(o.frequency.value * 1.6, ctx.currentTime + 0.12);
          g.gain.value = 0;
          g.gain.linearRampToValueAtTime(0.06 * volume, ctx.currentTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
          o.connect(g).connect(ctx.destination);
          o.start();
          o.stop(ctx.currentTime + 0.2);
        }, 1700);
        cleanupExtras = () => window.clearInterval(chirpId);
        break;
      }
      case "stream": {
        filter.type = "bandpass";
        filter.frequency.value = 2200;
        filter.Q.value = 0.9;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.6;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 800;
        lfo.connect(lfoGain).connect(filter.frequency);
        lfo.start();
        source.connect(filter).connect(gain);
        extras.push(lfo, lfoGain);
        cleanupExtras = () => { try { lfo.stop(); lfo.disconnect(); } catch {} };
        break;
      }
      case "cave": {
        filter.type = "lowpass";
        filter.frequency.value = 320;
        filter.Q.value = 2;
        // long convolver-like reverb feel via delay + feedback
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.25;
        const fb = ctx.createGain();
        fb.gain.value = 0.4;
        source.connect(filter);
        filter.connect(delay).connect(fb).connect(delay);
        filter.connect(gain);
        delay.connect(gain);
        extras.push(delay, fb);
        break;
      }
      case "sun": {
        // warm hum: pink noise + gentle 220Hz pad
        filter.type = "lowpass";
        filter.frequency.value = 1100;
        const pad = ctx.createOscillator();
        pad.type = "sine";
        pad.frequency.value = 220;
        const padGain = ctx.createGain();
        padGain.gain.value = 0.04;
        pad.connect(padGain).connect(gain);
        pad.start();
        source.connect(filter).connect(gain);
        extras.push(pad, padGain);
        cleanupExtras = () => { try { pad.stop(); pad.disconnect(); } catch {} };
        break;
      }
      case "birds": {
        // very quiet bg + frequent chirps
        filter.type = "highpass";
        filter.frequency.value = 1500;
        const bgGain = ctx.createGain();
        bgGain.gain.value = 0.3;
        source.connect(filter).connect(bgGain).connect(gain);
        extras.push(bgGain);
        const chirpId = window.setInterval(() => {
          if (!this.tracks.has(id)) return;
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "triangle";
          o.frequency.value = 2200 + Math.random() * 2400;
          o.frequency.linearRampToValueAtTime(o.frequency.value * 1.4, ctx.currentTime + 0.08);
          o.frequency.linearRampToValueAtTime(o.frequency.value * 0.9, ctx.currentTime + 0.16);
          g.gain.value = 0;
          g.gain.linearRampToValueAtTime(0.08 * volume, ctx.currentTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
          o.connect(g).connect(ctx.destination);
          o.start();
          o.stop(ctx.currentTime + 0.2);
        }, 1100);
        cleanupExtras = () => window.clearInterval(chirpId);
        break;
      }
    }

    gain.connect(ctx.destination);
    source.start();
    this.tracks.set(id, {
      kind: "synth",
      nodes: [source, filter, gain, ...extras],
      gain,
      volume,
      cleanup: () => {
        try { source.stop(); source.disconnect(); } catch {}
        cleanupExtras?.();
      },
    });
  }

  // ─── ASMR (synthesized) ──────────────────────────────────────────
  playAsmr(id: string, kind: AsmrSoundId, volume = 0.3) {
    if (this.tracks.has(id)) return;
    const ctx = this.getCtx();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);

    let timer: number;
    const schedule = () => {
      const now = ctx.currentTime;
      const burst = ctx.createBufferSource();
      burst.buffer = this.makeNoiseBuffer(0.05, "white");
      const f = ctx.createBiquadFilter();
      const g = ctx.createGain();

      if (kind === "typing") {
        f.type = "bandpass"; f.frequency.value = 3500; f.Q.value = 4;
        g.gain.setValueAtTime(0.6, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      } else if (kind === "page") {
        f.type = "highpass"; f.frequency.value = 2500;
        g.gain.setValueAtTime(0.4, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      } else if (kind === "brush") {
        f.type = "bandpass"; f.frequency.value = 6000; f.Q.value = 1.5;
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      } else { // cafe — low murmur with occasional clinks
        f.type = "lowpass"; f.frequency.value = 800;
        g.gain.setValueAtTime(0.5, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      }
      burst.connect(f).connect(g).connect(gain);
      burst.start(now);
      burst.stop(now + 0.5);

      const interval =
        kind === "typing" ? 90 + Math.random() * 220 :
        kind === "page"   ? 1800 + Math.random() * 1500 :
        kind === "brush"  ? 380 + Math.random() * 240 :
                            220 + Math.random() * 240;
      timer = window.setTimeout(schedule, interval);
    };
    schedule();

    this.tracks.set(id, {
      kind: "synth",
      nodes: [gain],
      gain,
      volume,
      cleanup: () => window.clearTimeout(timer),
    });
  }

  // ─── Sleep ambient (rich layered synthesis) ──────────────────────
  /**
   * Sleep recipes layer multiple synth voices for cinematic ambience.
   * All voices share one master gain so volume / fade-out is unified.
   */
  playSleep(id: string, kind: SleepSoundId, volume = 0.22) {
    if (this.tracks.has(id)) return;
    const ctx = this.getCtx();
    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);

    const cleanups: (() => void)[] = [];

    const addNoise = (
      type: "white" | "pink" | "brown",
      filterType: BiquadFilterType,
      freq: number,
      q: number,
      gainAmt: number,
    ) => {
      const src = ctx.createBufferSource();
      src.buffer = this.makeNoiseBuffer(4, type);
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = filterType; f.frequency.value = freq; f.Q.value = q;
      const g = ctx.createGain(); g.gain.value = gainAmt;
      src.connect(f).connect(g).connect(master);
      src.start();
      cleanups.push(() => { try { src.stop(); src.disconnect(); } catch {} });
    };

    const addOsc = (
      type: OscillatorType,
      freq: number,
      gainAmt: number,
      detune = 0,
    ) => {
      const o = ctx.createOscillator();
      o.type = type; o.frequency.value = freq; o.detune.value = detune;
      const g = ctx.createGain(); g.gain.value = gainAmt;
      o.connect(g).connect(master);
      o.start();
      cleanups.push(() => { try { o.stop(); o.disconnect(); } catch {} });
    };

    const addLfoOnFilterFreq = (
      filter: BiquadFilterNode,
      rate: number,
      depth: number,
    ) => {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = rate;
      const lg = ctx.createGain(); lg.gain.value = depth;
      lfo.connect(lg).connect(filter.frequency);
      lfo.start();
      cleanups.push(() => { try { lfo.stop(); lfo.disconnect(); } catch {} });
    };

    const addCricketChirps = () => {
      const t = window.setInterval(() => {
        if (!this.tracks.has(id)) return;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 4500 + Math.random() * 800;
        g.gain.value = 0;
        const now = ctx.currentTime;
        for (let i = 0; i < 3; i++) {
          g.gain.setValueAtTime(0.04, now + i * 0.07);
          g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.05);
        }
        o.connect(g).connect(master);
        o.start(now);
        o.stop(now + 0.25);
      }, 800 + Math.random() * 600);
      cleanups.push(() => window.clearInterval(t));
    };

    switch (kind) {
      case "deep_waves": {
        // Brown noise wash + 40Hz delta tone
        const src = ctx.createBufferSource();
        src.buffer = this.makeNoiseBuffer(4, "brown");
        src.loop = true;
        const f = ctx.createBiquadFilter();
        f.type = "lowpass"; f.frequency.value = 700; f.Q.value = 1.2;
        const g = ctx.createGain(); g.gain.value = 0.9;
        src.connect(f).connect(g).connect(master);
        src.start();
        addLfoOnFilterFreq(f, 0.1, 400);
        addOsc("sine", 40, 0.08);
        cleanups.push(() => { try { src.stop(); src.disconnect(); } catch {} });
        break;
      }
      case "calm_rain": {
        addNoise("white", "highpass", 1100, 0.7, 0.5);
        addNoise("white", "bandpass", 4500, 1.2, 0.2);
        addOsc("sine", 432, 0.05);
        break;
      }
      case "forest_night": {
        addNoise("pink", "lowpass", 1200, 0.5, 0.25);
        addCricketChirps();
        // distant low hum
        addOsc("sine", 110, 0.04);
        break;
      }
      case "sleep_asmr": {
        addNoise("white", "lowpass", 3000, 0.5, 0.35);
        // lofi vinyl crackle = sparse white pops
        const t = window.setInterval(() => {
          if (!this.tracks.has(id)) return;
          const src = ctx.createBufferSource();
          src.buffer = this.makeNoiseBuffer(0.04, "white");
          const g = ctx.createGain();
          g.gain.value = 0.15;
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
          src.connect(g).connect(master);
          src.start();
          src.stop(ctx.currentTime + 0.05);
        }, 180 + Math.random() * 240);
        cleanups.push(() => window.clearInterval(t));
        addOsc("sine", 220, 0.03);
        addOsc("sine", 330, 0.025);
        break;
      }
      case "delta_meditation": {
        // Binaural beat: 200Hz left, 202.5Hz right ⇒ 2.5Hz delta perception.
        // We don't have stereo-split noise; use two slightly detuned sines instead.
        addOsc("sine", 200, 0.06);
        addOsc("sine", 202.5, 0.06);
        addNoise("brown", "lowpass", 200, 1, 0.3);
        break;
      }
      case "lullaby": {
        // gentle pad chord + 528Hz halo
        addOsc("sine", 261.6, 0.05);     // C
        addOsc("sine", 329.6, 0.04, 5);  // E
        addOsc("sine", 392.0, 0.035, -5);// G
        addOsc("sine", 528, 0.04);
        addNoise("pink", "lowpass", 1500, 0.4, 0.1);
        break;
      }
      case "cosmic_drone": {
        addOsc("sine", 55, 0.08);
        addOsc("sine", 82.5, 0.05, 7);
        addOsc("triangle", 110, 0.03, -7);
        addNoise("brown", "lowpass", 250, 1.5, 0.4);
        // slow shimmer
        const f = ctx.createBiquadFilter();
        f.type = "highpass"; f.frequency.value = 2000;
        const src = ctx.createBufferSource();
        src.buffer = this.makeNoiseBuffer(4, "white");
        src.loop = true;
        const g = ctx.createGain(); g.gain.value = 0.04;
        src.connect(f).connect(g).connect(master);
        src.start();
        addLfoOnFilterFreq(f, 0.05, 1500);
        cleanups.push(() => { try { src.stop(); src.disconnect(); } catch {} });
        break;
      }
      case "meadow_breeze": {
        const src = ctx.createBufferSource();
        src.buffer = this.makeNoiseBuffer(4, "brown");
        src.loop = true;
        const f = ctx.createBiquadFilter();
        f.type = "lowpass"; f.frequency.value = 600; f.Q.value = 0.5;
        const g = ctx.createGain(); g.gain.value = 0.6;
        src.connect(f).connect(g).connect(master);
        src.start();
        addLfoOnFilterFreq(f, 0.18, 350);
        addCricketChirps();
        cleanups.push(() => { try { src.stop(); src.disconnect(); } catch {} });
        break;
      }
    }

    this.tracks.set(id, {
      kind: "synth",
      nodes: [master],
      gain: master,
      volume,
      cleanup: () => cleanups.forEach((c) => c()),
    });
  }

  /**
   * Smoothly fade a track's volume to `to` over `seconds`.
   * Used by sleep mode for the 20-min-before-end taper.
   */
  fadeTo(id: string, to: number, seconds: number) {
    const t = this.tracks.get(id);
    if (!t) return;
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    if (t.kind === "howl") {
      t.howl.fade(t.volume, to, seconds * 1000);
    } else {
      try {
        t.gain.gain.cancelScheduledValues(now);
        t.gain.gain.setValueAtTime(t.gain.gain.value, now);
        t.gain.gain.linearRampToValueAtTime(to, now + seconds);
      } catch {}
    }
    t.volume = to;
  }

  // ─── Volume / lifecycle ──────────────────────────────────────────
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
    const ctx = this.getCtx();
    if (t.kind === "howl") {
      t.howl.fade(t.volume, 0, 600);
      setTimeout(() => t.howl.unload(), 700);
    } else {
      try { t.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5); } catch {}
      setTimeout(() => t.cleanup?.(), 600);
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
