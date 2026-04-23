import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, Pause, SkipForward, Music as MusicIcon, Leaf } from "lucide-react";
import { Howl } from "howler";
import { MonetBackground } from "@/components/MonetBackground";
import { getSituationById } from "@/lib/modes";
import { SITUATION_TRACK_MAP, pickRandom } from "@/lib/situation-tracks";
import { audioEngine } from "@/lib/audio-engine";
import { cn } from "@/lib/utils";

/**
 * 상황별 음악 재생 — 감정 중심 UX.
 *
 * 영어 파일명은 숨기고, 사용자에겐:
 * - 번호 (Track 1, 2, 3...)
 * - 종류 (음악 vs 자연)
 * - 감정적 설명
 * 만 노출.
 */

// 상황별 감정 한국어 설명
const SITUATION_FEELINGS: Record<string, { feeling: string; description: string; emoji: string }> = {
  relax:    { feeling: "지친 날", description: "긴장을 풀고 숨을 고르는 시간", emoji: "🌊" },
  meditate: { feeling: "마음이 흐릴 때", description: "고요 속에서 나를 바라봐요", emoji: "🧘" },
  focus:    { feeling: "집중하고 싶을 때", description: "흐트러진 마음을 한 곳으로", emoji: "🎯" },
  nap:      { feeling: "잠깐 쉬고 싶은 날", description: "15~20분 낮잠으로 리프레시", emoji: "☕" },
  wake:     { feeling: "상쾌한 아침", description: "부드럽게 하루를 열어요", emoji: "☀️" },
  sleep:    { feeling: "깊이 자고 싶은 밤", description: "내려놓고 잠에 빠져요", emoji: "🌙" },
  reading:  { feeling: "독서의 시간", description: "조용한 카페처럼 잔잔하게", emoji: "📖" },
  wine:     { feeling: "와인 한 잔", description: "은은한 저녁의 여유", emoji: "🍷" },
  date:     { feeling: "둘만의 시간", description: "로맨틱한 분위기를 만들어요", emoji: "💕" },
  candle:   { feeling: "캔들 라이트", description: "불빛처럼 흔들리는 앰비언트", emoji: "🕯️" },
  tropical: { feeling: "트로피컬 해변", description: "야자수 그늘 아래 파도 소리", emoji: "🌴" },
  resort:   { feeling: "리조트 수영장", description: "칵테일과 풀사이드 라운지", emoji: "🏝️" },
  sunset:   { feeling: "노을 지는 바닷가", description: "해 질 녘의 여유", emoji: "🌇" },
  mountain: { feeling: "산장의 밤", description: "벽난로와 침엽수 숲의 고요", emoji: "🏔️" },
  tokyo:    { feeling: "도쿄의 밤", description: "네온 사인과 시티팝 라운지", emoji: "🌃" },
};

const MusicPlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const situation = id ? getSituationById(id) : undefined;
  const tracks = id ? SITUATION_TRACK_MAP[id] : undefined;
  const feeling = id ? SITUATION_FEELINGS[id] : undefined;

  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [howl, setHowl] = useState<Howl | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      howl?.stop();
      howl?.unload();
      audioEngine.stopAll();
    };
  }, [howl]);

  if (!situation || !tracks || !feeling) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-foreground/60">상황을 찾을 수 없어요</p>
      </div>
    );
  }

  const allTracks = useMemo(
    () => [
      ...tracks.music.map((url) => ({ url, kind: "music" as const })),
      ...tracks.nature.map((url) => ({ url, kind: "nature" as const })),
    ],
    [tracks]
  );

  const playTrack = (url: string) => {
    howl?.stop();
    howl?.unload();
    audioEngine.stopAll();

    // 공백·쉼표 URL 인코딩 필수
    const encodedUrl = url.split("/").map((part, i) =>
      i === 0 ? part : encodeURIComponent(part)
    ).join("/");

    const newHowl = new Howl({
      src: [encodedUrl],
      html5: true,
      loop: true,
      volume: 0.75,
      onplay: () => setPlaying(true),
      onpause: () => setPlaying(false),
      onstop: () => setPlaying(false),
      onloaderror: (_, err) => console.error("Audio load error:", err, encodedUrl),
    });
    newHowl.play();
    setHowl(newHowl);
    setCurrentUrl(url);

    // 주파수 레이어 자동 (거의 안 들리지만 효과 있음)
    const freq = situation.recommendedFrequency;
    if (freq.hz < 50) {
      audioEngine.playTone("freq-layer", freq.hz, 0.04);
    } else if (freq.hz < 500) {
      audioEngine.playTone("freq-layer", freq.hz, 0.06);
    }
  };

  const togglePlay = () => {
    if (!howl) {
      const random = pickRandom(allTracks.map((t) => t.url));
      if (random) playTrack(random);
      return;
    }
    if (playing) howl.pause();
    else howl.play();
  };

  const skipNext = () => {
    const random = pickRandom(allTracks.map((t) => t.url));
    if (random) playTrack(random);
  };

  const currentIdx = allTracks.findIndex((t) => t.url === currentUrl);

  return (
    <div className="min-h-[100dvh] flex flex-col relative">
      <MonetBackground intensity="strong" />

      {/* Hero */}
      <div
        className="relative px-5 pt-12 pb-10 text-white"
        style={{
          background: `linear-gradient(160deg, ${situation.gradient.from} 0%, ${situation.gradient.to} 100%)`,
          borderRadius: "0 0 32px 32px",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="mt-6">
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/70 font-serif">
            For this moment
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl">{feeling.emoji}</span>
            <h1 className="text-[32px] font-bold leading-tight">
              {feeling.feeling}
            </h1>
          </div>
          <p className="mt-2 text-[15px] text-white/90 leading-snug">
            {feeling.description}
          </p>
        </div>

        {/* 재생 컨트롤 */}
        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white text-foreground flex items-center justify-center shadow-xl active:scale-95 transition"
          >
            {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
          </button>
          <button
            onClick={skipNext}
            className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center active:scale-95"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            {currentIdx >= 0 ? (
              <>
                <p className="text-[10px] text-white/60 uppercase tracking-wider">
                  {allTracks[currentIdx].kind === "music" ? "음악" : "자연 소리"}
                </p>
                <p className="text-base font-bold">
                  {currentIdx + 1} / {allTracks.length}
                </p>
              </>
            ) : (
              <p className="text-sm text-white/80">재생 버튼을 눌러 시작</p>
            )}
          </div>
        </div>
      </div>

      {/* 트랙 선택 - 번호 카드 */}
      <div className="flex-1 px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground/80">
            다른 버전 선택
          </h2>
          <span className="text-xs text-foreground/50">
            총 {allTracks.length}개
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {allTracks.map((track, i) => {
            const isActive = currentUrl === track.url;
            const isMusic = track.kind === "music";
            return (
              <button
                key={track.url}
                onClick={() => playTrack(track.url)}
                className={cn(
                  "aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-foreground/[0.04] hover:bg-foreground/[0.08] text-foreground"
                )}
              >
                {isMusic ? (
                  <MusicIcon className="w-4 h-4" strokeWidth={1.8} />
                ) : (
                  <Leaf className="w-4 h-4" strokeWidth={1.8} />
                )}
                <span className="text-xs font-bold">{i + 1}</span>
                <span className="text-[9px] opacity-70">
                  {isMusic ? "음악" : "자연"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-foreground/[0.04]">
          <p className="text-[11px] tracking-wider uppercase text-foreground/50 font-serif">
            Tip
          </p>
          <p className="text-sm text-foreground/70 mt-1 leading-relaxed">
            마음에 드는 버전 찾을 때까지 ▶️ 스킵하거나,
            아래 번호 중 원하는 것 직접 선택해보세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MusicPlay;
