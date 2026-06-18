// public/sounds/*.mp3 (자연 음악) 을 1시간 mp3 로 변환 + loop 경계 크로스페이드.
//
// v1: -stream_loop -1 단순 반복 → 매 2~3분마다 loop 경계가 하드 컷으로 들림 (사용자 불만)
// v2 (이 파일): acrossfade=3 으로 loop 경계 매끄럽게.
//   - 원본 duration 측정
//   - 끝 3초 와 시작 3초 를 삼각함수 곡선으로 크로스페이드 → "seamless 원본" 생성
//   - 그 seamless 원본을 aloop 으로 무한 반복, atrim 으로 1시간 자름
//   - 결과: 1시간 안에 loop 경계가 ~30번 있어도 귀로 인식 불가
//
// 32kbps mono — 1.5GB+ 앱 용량 trade-off. 사용자 명시적 요청.
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const ffmpegPath = require("ffmpeg-static");

const SRC_DIR = path.resolve(__dirname, "../public/sounds");
const TARGET_SECONDS = 3600;
const BITRATE = "32k";
const XFADE = 3;
const TMP_SUFFIX = ".xfade-tmp.mp3";

const files = fs.readdirSync(SRC_DIR)
  .filter((f) => f.endsWith(".mp3") && !f.endsWith(TMP_SUFFIX) && !f.endsWith(".loop-tmp.mp3"))
  .map((f) => path.join(SRC_DIR, f));

console.log(`Found ${files.length} mp3 files. Crossfade-looping to 1-hour @ ${BITRATE} mono...`);

const PARALLEL = 4;

function getDuration(src) {
  return new Promise((resolve, reject) => {
    // ffmpeg-static 은 ffprobe 가 없으니 ffmpeg 로 stderr 파싱
    execFile(ffmpegPath, ["-i", src, "-hide_banner", "-f", "null", "-"], { maxBuffer: 4 * 1024 * 1024 }, (_err, _stdout, stderr) => {
      const m = stderr.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
      if (!m) return reject(new Error("no duration in ffmpeg stderr"));
      const sec = parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseFloat(m[3]);
      resolve(sec);
    });
  });
}

async function convertOne(src) {
  const dur = await getDuration(src);
  // 원본이 이미 1시간 근처면 (이전 변환 잔여) — 변환 skip
  if (dur >= TARGET_SECONDS - 5) {
    return `${path.basename(src).slice(0, 50)}... already ${dur.toFixed(0)}s, skipped`;
  }
  // 너무 짧아서 (< 2 * XFADE) crossfade 불가능한 경우 — 단순 loop
  if (dur < XFADE * 2 + 1) {
    return convertSimple(src);
  }
  const tmp = src + TMP_SUFFIX;
  const headEnd = (dur - XFADE).toFixed(3);
  const filter =
    `[0:a]atrim=0:${headEnd}[a1];` +
    `[1:a]atrim=0:${XFADE}[a2];` +
    `[a1][a2]acrossfade=d=${XFADE}:c1=tri:c2=tri[seamless];` +
    // size — 충분히 큰 버퍼 (5분 = 13M samples @ 44.1kHz). 어차피 한번 채워지면 반복.
    `[seamless]aloop=loop=-1:size=20000000,atrim=duration=${TARGET_SECONDS}[out]`;

  const args = [
    "-y",
    "-i", src,
    "-i", src,
    "-filter_complex", filter,
    "-map", "[out]",
    "-c:a", "libmp3lame",
    "-b:a", BITRATE,
    "-ac", "1",
    "-loglevel", "error",
    tmp,
  ];

  return new Promise((resolve, reject) => {
    execFile(ffmpegPath, args, { maxBuffer: 64 * 1024 * 1024 }, (err, _stdout, stderr) => {
      if (err) {
        if (fs.existsSync(tmp)) try { fs.unlinkSync(tmp); } catch {}
        return reject(new Error(`${path.basename(src)}: ${stderr.slice(0, 200) || err.message}`));
      }
      try {
        fs.renameSync(tmp, src);
        const stats = fs.statSync(src);
        resolve(`${path.basename(src).slice(0, 50)}... ${(stats.size / 1024 / 1024).toFixed(1)}MB (xfade)`);
      } catch (e) {
        reject(e);
      }
    });
  });
}

function convertSimple(src) {
  // 짧은 클립 (< 7s) — 그냥 stream_loop. 어차피 cycle 너무 빨라서 fade 의미 없음.
  const tmp = src + TMP_SUFFIX;
  const args = [
    "-y",
    "-stream_loop", "-1",
    "-i", src,
    "-t", String(TARGET_SECONDS),
    "-c:a", "libmp3lame",
    "-b:a", BITRATE,
    "-ac", "1",
    "-loglevel", "error",
    tmp,
  ];
  return new Promise((resolve, reject) => {
    execFile(ffmpegPath, args, { maxBuffer: 64 * 1024 * 1024 }, (err, _stdout, stderr) => {
      if (err) {
        if (fs.existsSync(tmp)) try { fs.unlinkSync(tmp); } catch {}
        return reject(new Error(`${path.basename(src)}: ${stderr.slice(0, 200) || err.message}`));
      }
      fs.renameSync(tmp, src);
      const stats = fs.statSync(src);
      resolve(`${path.basename(src).slice(0, 50)}... ${(stats.size / 1024 / 1024).toFixed(1)}MB (simple)`);
    });
  });
}

async function runBatch(queue) {
  let done = 0, failed = 0;
  const startedAt = Date.now();
  async function worker() {
    while (queue.length > 0) {
      const src = queue.shift();
      try {
        const msg = await convertOne(src);
        done++;
        const elapsed = ((Date.now() - startedAt) / 1000).toFixed(0);
        console.log(`[${done + failed}/${files.length}] ✓ ${msg}  (${elapsed}s)`);
      } catch (e) {
        failed++;
        console.error(`[${done + failed}/${files.length}] ✗ ${e.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, () => worker()));
  console.log(`\nDone — ${done} success, ${failed} failed.`);
}

runBatch([...files]).catch((e) => { console.error(e); process.exit(1); });
