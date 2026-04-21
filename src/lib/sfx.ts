/**
 * One-shot Web Audio sound effects (no external files).
 * - ding: soft sine bell for task completion
 * - shatter: filtered burst of white noise for glass-breaking taps
 * - slice: blade swoosh + glass clink (slicing category)
 * - smash: deep bass thud + heavy shatter (destruction category)
 * - bubble: soft droplet + chime (asmr category)
 */

let ctx: AudioContext | null = null;
const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

export function playDing(volume = 0.25) {
  const c = getCtx();
  const now = c.currentTime;
  [
    { freq: 1320, start: 0, dur: 0.45 },
    { freq: 1760, start: 0.05, dur: 0.5 },
  ].forEach(({ freq, start, dur }) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(volume, now + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.05);
  });
}

/** Quick noise buffer helper. */
function noiseBuffer(c: AudioContext, dur: number, decay = 2.2) {
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length;
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
  }
  return buf;
}

export function playShatter(volume = 0.4) {
  const c = getCtx();
  const now = c.currentTime;
  const dur = 0.8;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, dur, 2.2);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1800;
  const gain = c.createGain();
  gain.gain.value = volume;
  src.connect(hp).connect(gain).connect(c.destination);
  src.start(now);

  const osc = c.createOscillator();
  const og = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(2400, now);
  osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);
  og.gain.setValueAtTime(volume * 0.6, now);
  og.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
  osc.connect(og).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.32);
}

/** Slicing: airy "swoosh" then a high glass clink. */
export function playSlice(volume = 0.45) {
  const c = getCtx();
  const now = c.currentTime;

  // Swoosh — bandpassed noise sweeping up
  const swoosh = c.createBufferSource();
  swoosh.buffer = noiseBuffer(c, 0.35, 1.6);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(800, now);
  bp.frequency.exponentialRampToValueAtTime(4500, now + 0.18);
  bp.Q.value = 1.2;
  const sg = c.createGain();
  sg.gain.setValueAtTime(volume * 0.6, now);
  sg.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  swoosh.connect(bp).connect(sg).connect(c.destination);
  swoosh.start(now);

  // Clink — two stacked sines, very short
  [3200, 4400].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = f;
    const start = now + 0.08 + i * 0.015;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(volume * 0.45, start + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    o.connect(g).connect(c.destination);
    o.start(start);
    o.stop(start + 0.2);
  });
}

/** Smash: low boom + dense shatter for destruction clips. */
export function playSmash(volume = 0.5) {
  const c = getCtx();
  const now = c.currentTime;

  // Sub-bass thud
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(120, now);
  o.frequency.exponentialRampToValueAtTime(40, now + 0.25);
  g.gain.setValueAtTime(volume * 0.9, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  o.connect(g).connect(c.destination);
  o.start(now);
  o.stop(now + 0.4);

  // Dense shatter noise burst
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.9, 1.8);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1400;
  const sg = c.createGain();
  sg.gain.setValueAtTime(volume * 0.7, now);
  sg.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
  src.connect(hp).connect(sg).connect(c.destination);
  src.start(now);

  // Metallic ring tail
  const ring = c.createOscillator();
  const rg = c.createGain();
  ring.type = "triangle";
  ring.frequency.setValueAtTime(1800, now + 0.05);
  ring.frequency.exponentialRampToValueAtTime(700, now + 0.45);
  rg.gain.setValueAtTime(volume * 0.4, now + 0.05);
  rg.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
  ring.connect(rg).connect(c.destination);
  ring.start(now + 0.05);
  ring.stop(now + 0.55);
}

/** Bubble/droplet: soft pitch-bent sine for ASMR taps. */
export function playBubble(volume = 0.35) {
  const c = getCtx();
  const now = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  // Quick upward then downward warble — droplet feel
  o.frequency.setValueAtTime(900, now);
  o.frequency.exponentialRampToValueAtTime(1600, now + 0.04);
  o.frequency.exponentialRampToValueAtTime(450, now + 0.28);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(volume, now + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
  o.connect(g).connect(c.destination);
  o.start(now);
  o.stop(now + 0.34);

  // Tiny shimmer harmonic
  const o2 = c.createOscillator();
  const g2 = c.createGain();
  o2.type = "sine";
  o2.frequency.value = 2400;
  g2.gain.setValueAtTime(0, now + 0.02);
  g2.gain.linearRampToValueAtTime(volume * 0.25, now + 0.04);
  g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  o2.connect(g2).connect(c.destination);
  o2.start(now + 0.02);
  o2.stop(now + 0.2);
}

export type GlassCategory = "slice" | "smash" | "asmr";

export function playGlassFx(category: GlassCategory, volume = 0.5) {
  switch (category) {
    case "slice": return playSlice(volume);
    case "smash": return playSmash(volume);
    case "asmr":  return playBubble(volume);
  }
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(pattern); } catch { /* noop */ }
  }
}
