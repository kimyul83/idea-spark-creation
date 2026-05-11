// 노이즈/톤 1시간 mp3 생성 — lamejs (ffmpeg 대체).
// 64kbps mono 1시간 ≈ 28MB / 트랙. × 6 = 170MB. 그래도 1시간 loop = 사용자 거의 인식 0.
const fs = require("fs");
const path = require("path");
// ESM 패키지 — dynamic import 로 로드 (CJS 안에서 사용 가능)
let Mp3Encoder;

const SR = 44100;
const SECONDS = 3600;        // 1시간
const BITRATE = 64;          // kbps mono — 노이즈도 충분
const TONE_BITRATE = 48;     // sine wave 는 더 압축
const OUT = path.resolve(__dirname, "../public/sounds/frequencies");
fs.mkdirSync(OUT, { recursive: true });

// Pink noise state (Voss-McCartney)
function pinkNoiseGen() {
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  return () => {
    const w = Math.random() * 2 - 1;
    b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
    b2=0.969*b2+w*0.153852;    b3=0.8665*b3+w*0.3104856;
    b4=0.55*b4+w*0.5329522;    b5=-0.7616*b5-w*0.016898;
    const s = (b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;
    b6=w*0.115926;
    return s;
  };
}

// Brown noise state
function brownNoiseGen() {
  let last = 0;
  return () => {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    return last * 3.5;
  };
}

// One-pole lowpass — chunk 간 state 유지
function lowpassFactory(cutoff) {
  const rc = 1.0 / (2 * Math.PI * cutoff);
  const dt = 1.0 / SR;
  const a = dt / (rc + dt);
  let prev = 0;
  return (sample) => {
    prev = prev + a * (sample - prev);
    return prev;
  };
}

function encodeChunked(filename, sampleFn, bitrate, scale = 0.7) {
  const encoder = new Mp3Encoder(1, SR, bitrate);
  const chunkSize = 1152;  // lame 의 표준 mp3 frame size
  const chunks = [];
  let written = 0;
  const total = SR * SECONDS;

  while (written < total) {
    const remain = Math.min(chunkSize, total - written);
    const pcm = new Int16Array(remain);
    for (let i = 0; i < remain; i++) {
      const s = Math.max(-1, Math.min(1, sampleFn() * scale));
      pcm[i] = Math.round(s < 0 ? s * 0x8000 : s * 0x7fff);
    }
    const buf = encoder.encodeBuffer(pcm);
    if (buf.length) chunks.push(Buffer.from(buf));
    written += remain;
  }
  const tail = encoder.flush();
  if (tail.length) chunks.push(Buffer.from(tail));
  const out = Buffer.concat(chunks);
  fs.writeFileSync(filename, out);
  console.log(`✓ ${path.basename(filename)} — ${(out.length / 1024 / 1024).toFixed(2)}MB`);
}

async function main() {
  const mod = await import("@breezystack/lamejs");
  Mp3Encoder = mod.Mp3Encoder;
  console.log("Generating 1-hour mp3s — 6 tracks. 약 1-2분 소요됩니다...");

// White noise — random uniform + lowpass 6000Hz
{
  const lp = lowpassFactory(6000);
  encodeChunked(path.join(OUT, "white-noise.mp3"),
    () => lp(Math.random() * 2 - 1), BITRATE, 0.7);
}

// Pink noise — Voss + lowpass 8000Hz
{
  const pink = pinkNoiseGen();
  const lp = lowpassFactory(8000);
  encodeChunked(path.join(OUT, "pink-noise.mp3"),
    () => lp(pink()), BITRATE, 0.8);
}

// Brown noise — Random walk + lowpass 4000Hz
{
  const brown = brownNoiseGen();
  const lp = lowpassFactory(4000);
  encodeChunked(path.join(OUT, "brown-noise.mp3"),
    () => lp(brown()), BITRATE, 0.9);
}

// Tones — sine wave (phase aligned, mp3 압축 잘 됨)
function sineGen(freq) {
  let phase = 0;
  const inc = 2 * Math.PI * freq / SR;
  return () => {
    const s = Math.sin(phase);
    phase += inc;
    if (phase > 2 * Math.PI) phase -= 2 * Math.PI;
    return s;
  };
}

encodeChunked(path.join(OUT, "tone-432.mp3"), sineGen(432), TONE_BITRATE, 0.5);
encodeChunked(path.join(OUT, "tone-528.mp3"), sineGen(528), TONE_BITRATE, 0.5);
encodeChunked(path.join(OUT, "tone-40.mp3"), sineGen(40), TONE_BITRATE, 0.7);

// 이전 WAV 정리
const oldWavs = ["white-noise.wav", "pink-noise.wav", "brown-noise.wav", "tone-432.wav", "tone-528.wav", "tone-40.wav"];
for (const name of oldWavs) {
  const p = path.join(OUT, name);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log(`  (removed ${name})`);
  }
}

  console.log("Done!");
}

main().catch((e) => { console.error(e); process.exit(1); });
