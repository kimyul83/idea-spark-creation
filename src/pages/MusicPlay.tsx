import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, Pause, SkipForward, Heart } from "lucide-react";
import { Howl } from "howler";
import { MonetBackground } from "@/components/MonetBackground";
import { getSituationById } from "@/lib/modes";
import { SITUATION_TRACK_MAP, pickRandom } from "@/lib/situation-tracks";
import { audioEngine } from "@/lib/audio-engine";
import { cn } from "@/lib/utils";

/**
 * 상황별 음악 재생 화면 (/music/:id).
 *
 * - 해당 상황의 음악·자연 소리 리스트 표시
 * - 사용자가 트랙 선택 or 랜덤 재생
 * - 추천 주파수 Web Audio로 자동 레이어링
 */
const MusicPlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const situation = id ? getSituationById(id) : undefined;
  const tracks = id ? SITUATION_TRACK_MAP[id] : undefined;

  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [howl, setHowl] = useState<Howl | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      howl?.stop();
      howl?.unload();
      audioEngine.stopAll();
    };
  }, [howl]);

  if (!situation || !tracks) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-foreground/60">상황을 찾을 수 없어요</p>
      </div>
    );
  }

  const allTracks = useMemo(
    () => [...tracks.music, ...tracks.nature],
    [tracks]
  );

  const playTrack = (url: string) => {
    howl?.stop();
    howl?.unload();
    audioEngine.stopAll();

    const newHowl = new Howl({
      src: [url],
      html5: true,
      loop: true,
      volume: 0.7,
      onplay: () => setPlaying(true),
      onpause: () => setPlaying(false),
      onstop: () => setPlaying(false),
    });
    newHowl.play();
    setHowl(newHowl);
    setCurrentTrack(url);

    // 주파수 레이어 자동 추가
    const freq = situation.recommendedFrequency;
    if (freq.hz < 50) {
      // 저주파는 바이노럴 비트로
      audioEngine.playTone("freq-layer", freq.hz, 0.05);
    } else {
      audioEngine.playTone("freq-layer", freq.hz, 0.08);
    }
  };

  const togglePlay = () => {
    if (!howl) {
      const random = pickRandom(allTracks);
      if (random) playTrack(random);
      return;
    }
    if (playing) howl.pause();
    else howl.play();
  };

  const skipNext = () => {
    const random = pickRandom(allTracks);
    if (random) playTrack(random);
  };

  const getTrackName = (url: string): string => {
    const filename = url.split("/").pop() ?? "";
    return filename
      .replace("ES_", "")
      .replace(" - Epidemic Sound.mp3", "")
      .replace(".mp3", "");
  };

  const Icon = situation.icon;

  return (
    <div className="min-h-[100dvh] flex flex-col relative">
      <MonetBackground intensity="strong" />

      {/* Hero */}
      <div
        className="relative px-5 pt-12 pb-8 text-white"
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

        <div className="mt-6 flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Icon className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-white/70 font-serif">
              {situation.recommendedFrequency.label}
            </p>
            <h1 className="text-[26px] font-bold leading-tight">{situation.title}</h1>
            <p className="text-xs text-white/80 mt-0.5">{situation.subtitle}</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-white/75 leading-relaxed">
          {situation.recommendedFrequency.science}
        </p>

        {/* Main play control */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white text-foreground flex items-center justify-center shadow-lg active:scale-95 transition"
          >
            {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>
          <button
            onClick={skipNext}
            className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center active:scale-95"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            {currentTrack ? (
              <>
                <p className="text-[10px] text-white/60 uppercase tracking-wider">재생 중</p>
                <p className="text-sm font-semibold truncate">{getTrackName(currentTrack)}</p>
              </>
            ) : (
              <p className="text-sm text-white/70">재생 버튼을 눌러 시작</p>
            )}
          </div>
        </div>
      </div>

      {/* Track list */}
      <div className="flex-1 px-5 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-foreground/55 font-serif">
            Tracks · {allTracks.length}
          </h2>
          <span className="text-xs text-foreground/50">
            음악 {tracks.music.length} · 자연 {tracks.nature.length}
          </span>
        </div>

        <ul className="space-y-1.5">
          {allTracks.map((url, i) => {
            const isMusic = tracks.music.includes(url);
            const isActive = currentTrack === url;
            return (
              <li key={url}>
                <button
                  onClick={() => playTrack(url)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
                    isActive
                      ? "bg-primary/15 border border-primary/30"
                      : "hover:bg-foreground/5 border border-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      isActive ? "bg-primary text-primary-foreground" : "bg-foreground/5"
                    )}
                  >
                    {isActive && playing ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-primary" : "text-foreground"
                      )}
                    >
                      {getTrackName(url)}
                    </p>
                    <p className="text-[10px] text-foreground/50 mt-0.5 uppercase tracking-wider">
                      {isMusic ? "Music" : "Nature"}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default MusicPlay;
