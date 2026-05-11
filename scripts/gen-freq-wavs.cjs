// 노이즈/톤 WAV 파일 정적 생성 — ffmpeg 대체.
// 6개 트랙(30초 mono 44.1kHz 16bit ≈ 2.5MB/트랙) public/sounds/frequencies/ 에 출력.
const fs = require("fs");
const path = require("path");

const SR = 44100;
const SECONDS = 30;
const OUT = path.resolve(__dirname, "../public/sounds/frequencies");
fs.mkdirSync(OUT, { recursive: true });

function genNoise(type, n) {
  const s = new Float32Array(n);
  if (type === "white") {
    for (let i = 0; i < n; i++) s[i] = Math.random() * 2 - 1;
  } else if (type === "pink") {
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
      b2=0.969*b2+w*0.153852;    b3=0.8665*b3+w*0.3104856;
      b4=0.55*b4+w*0.5329522;    b5=-0.7616*b5-w*0.016898;
      s[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
    }
  } else {
    let last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      s[i] = (last + 0.02 * w) / 1.02;
      last = s[i];
      s[i] *= 3.5;
    }
  }
  return s;
}

function genSine(freq, n) {
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = Math.sin(2 * Math.PI * freq * i / SR) * 0.5;
  return s;
}

// One-pole lowpass — 거친 고주파 깎기
function lowpass(s, cutoff) {
  const rc = 1.0 / (2 * Math.PI * cutoff);
  const dt = 1.0 / SR;
  const a = dt / (rc + dt);
  const out = new Float32Array(s.length);
  out[0] = s[0] * a;
  for (let i = 1; i < s.length; i++) out[i] = out[i-1] + a * (s[i] - out[i-1]);
  return out;
}

// loop 경계 클릭 방지 — 양 끝 0.05초 페이드. 시작=0→1, 끝=1→0 cross-fade.
// 단순 fade-out 대신 cross-fade: 처음/끝 각 0.05초가 매끄럽게 이어지도록 끝을 처음에 더해줌.
function crossfadeLoop(s, fadeSeconds = 0.05) {
  const fadeN = Math.floor(fadeSeconds * SR);
  const out = new Float32Array(s.length);
  out.set(s);
  for (let i = 0; i < fadeN; i++) {
    const t = i / fadeN; // 0..1
    // 시작 부분 = (1-t)*end + t*start  ← 끝 부분이 fade-in 되며 시작과 자연 연결
    out[i] = (1 - t) * s[s.length - fadeN + i] + t * s[i];
    // 끝 부분 = (1-t)*end + t*start  ← 끝이 시작으로 자연 fade
    out[s.length - fadeN + i] = (1 - t) * s[s.length - fadeN + i] + t * s[i];
  }
  return out;
}

function writeWav(filename, samples) {
  const numCh = 1, bps = 2;
  const dataSize = samples.length * bps;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(numCh, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * numCh * bps, 28);
  buf.writeUInt16LE(numCh * bps, 32);
  buf.writeUInt16LE(bps * 8, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  let off = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s < 0 ? s * 0x8000 : s * 0x7fff), off);
    off += 2;
  }
  fs.writeFileSync(filename, buf);
  console.log(`✓ ${path.basename(filename)} — ${(buf.length / 1024).toFixed(0)}KB`);
}

const N = SR * SECONDS;

writeWav(path.join(OUT, "white-noise.wav"), crossfadeLoop(lowpass(genNoise("white", N), 6000).map(x => x * 0.7)));
writeWav(path.join(OUT, "pink-noise.wav"), crossfadeLoop(lowpass(genNoise("pink", N), 8000).map(x => x * 0.7)));
writeWav(path.join(OUT, "brown-noise.wav"), crossfadeLoop(lowpass(genNoise("brown", N), 4000).map(x => x * 0.9)));
// Tones — sine 은 phase-aligned 라 crossfade 불필요 (정확히 정수 cycle 끝남)
writeWav(path.join(OUT, "tone-432.wav"), genSine(432, N).map(x => x * 0.5));
writeWav(path.join(OUT, "tone-528.wav"), genSine(528, N).map(x => x * 0.5));
writeWav(path.join(OUT, "tone-40.wav"), genSine(40, N).map(x => x * 0.7));
