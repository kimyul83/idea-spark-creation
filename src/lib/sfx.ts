/**
 * One-shot Web Audio sound effects (no external files).
 * - ding: soft sine bell for task completion
 * - shatter: filtered burst of white noise for glass-breaking taps
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
  // Two-tone bell: 1320Hz then 1760Hz
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

export function playShatter(volume = 0.4) {
  const c = getCtx();
  const now = c.currentTime;
  const dur = 0.8;
  // Noise burst
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length;
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.2);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1800;
  const gain = c.createGain();
  gain.gain.value = volume;
  src.connect(hp).connect(gain).connect(c.destination);
  src.start(now);

  // Add a metallic chirp
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

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(pattern); } catch { /* noop */ }
  }
}
