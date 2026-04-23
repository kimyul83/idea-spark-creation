import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, Pause, Shuffle, Timer, Info } from "lucide-react";
import { Howl, Howler } from "howler";
import { Moodie } from "@/components/Moodie";
import { getSituationById } from "@/lib/modes";
import { SITUATION_TRACK_MAP, pickRandom, toCdnUrl } from "@/lib/situation-tracks";
import { SITUATION_DETAILS } from "@/lib/situation-details";
import { audioEngine } from "@/lib/audio-engine";
import { cn } from "@/lib/utils";

/**
 * Endel 스타일 재생 화면.
 * 트랙 제목·번호 X. 뇌파 주파수 기반 variant switcher.
 */

type VariantId = "delta" | "theta" | "alpha" | "beta" | "gamma";

const VARIANTS: { id: VariantId; label: string; hz: string; symbol: string }[] = [
  { id: "delta", label: "Delta", hz: "0.5–4 Hz", symbol: "δ" },
  { id: "theta", label: "Theta", hz: "4–8 Hz",   symbol: "θ" },
  { id: "alpha", label: "Alpha", hz: "8–13 Hz",  symbol: "α" },
  { id: "beta",  label: "Beta",  hz: "13–30 Hz", symbol: "β" },
  { id: "gamma", label: "Gamma", hz: "40 Hz",    symbol: "γ" },
];

const variantMatches = (url: string, v: VariantId): boolean => {
  const u = url.toLowerCase();
  if (v === "delta") return /drone|cosmic|space|night|underground|havsdrommar|nattdrommar|sweet.dreams|shadowed|winter/.test(u);
  if (v === "theta") return /meditation|ethereal|dream|mystical|wonder|tibetan|celestial|mysterious|head.in.the.clouds/.test(u);
  if (v === "alpha") return /ocean|wave|water|stream|forest|birdsong|boundless|softest|solace|quiet|home|movements|green/.test(u);
  if (v === "beta")  return /sunrise|morning|carefree|happy|sunny|leap|bright|glorious|momentum|now.or.never|kerfuffle/.test(u);
  if (v === "gamma") return /motion|redline|clarity|focus|principle|velvet|jazz|saxophone/.test(u);
  return false;
};

const MusicPlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const situation = id ? getSituationById(id) : undefined;
  const tracks = id ? SITUATION_TRACK_MAP[id] : undefined;
  const detail = id ? SITUATION_DETAILS[id] : undefined;

  const [variant, setVariant] = useState<VariantId>("alpha");
  const [playing, setPlaying] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const howlRef = useRef<Howl | null>(null);

  useEffect(() => {
    return () => {
      howlRef.current?.stop();
      howlRef.current?.unload();
      audioEngine.stopAll();
    };
  }, []);

  if (!situation || !tracks || !detail) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-black">
        <p className="text-white/60">상황을 찾을 수 없어요</p>
      </div>
    );
  }

  const allTracks = useMemo(
    () => [...tracks.music, ...tracks.nature],
    [tracks]
  );

  const pickForVariant = (v: VariantId): string | undefined => {
    const preferred = allTracks.filter((t) => variantMatches(t, v));
    const pool = preferred.length > 0 ? preferred : allTracks;
    return pickRandom(pool);
  };

  const playVariant = (v: VariantId) => {
    setVariant(v);
    const url = pickForVariant(v);
    if (!url) {
      setErrorMsg("재생 가능한 트랙이 없어요");
      return;
    }
    setErrorMsg(null);

    howlRef.current?.stop();
    howlRef.current?.unload();
    audioEngine.stopAll();

    // iOS Safari 오디오 컨텍스트 언락 (사용자 제스처 필요)
    try {
      const ctx = (Howler as any).ctx;
      if (ctx && ctx.state === "suspended") {
        ctx.resume();
      }
    } catch { /* ignore */ }

    // CDN URL 변환 (jsDelivr — GitHub public repo 서빙)
    const cdnUrl = toCdnUrl(url);
    console.log("[MusicPlay] Loading:", cdnUrl);

    const howl = new Howl({
      src: [cdnUrl],
      html5: true,
      loop: true,
      volume: 0.75,
      onplay: () => {
        console.log("[MusicPlay] Playing OK");
        setPlaying(true); setErrorMsg(null);
      },
      onpause: () => setPlaying(false),
      onstop: () => setPlaying(false),
      onload: () => console.log("[MusicPlay] Loaded"),
      onloaderror: (id, err) => {
        console.error("[MusicPlay] Load error:", err, cdnUrl);
        setErrorMsg(`로딩 실패: ${err}`);
        setPlaying(false);
      },
      onplayerror: (id, err) => {
        console.error("[MusicPlay] Play error:", err);
        setErrorMsg(`재생 실패: ${err} — 화면을 다시 탭해주세요`);
        // iOS 자동 재시도
        howl.once("unlock", () => howl.play());
      },
    });
    howl.play();
    howlRef.current = howl;

    const hzMap: Record<VariantId, number> = { delta: 2, theta: 5, alpha: 10, beta: 15, gamma: 40 };
    audioEngine.playTone("freq-layer", hzMap[v], 0.03);
  };

  const togglePlay = () => {
    if (!howlRef.current) { playVariant(variant); return; }
    if (playing) howlRef.current.pause();
    else howlRef.current.play();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col relative bg-[#050505]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative px-5 pt-12 flex items-center justify-between z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-white/80" />
        </button>
        <button onClick={() => setInfoOpen((o) => !o)} className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
          <Info className="w-4 h-4 text-white/80" />
        </button>
      </div>

      <div className="relative px-5 mt-10 text-center z-10">
        <h1 className="text-[48px] font-serif font-bold text-white leading-none tracking-tight">
          {detail.mood}
        </h1>
        <p className="mt-3 text-sm text-white/60 tracking-wider">
          {detail.scene}
        </p>
      </div>

      <div className="relative flex-1 flex items-center justify-center z-10">
        <div className="relative">
          <div className={cn("absolute inset-0 rounded-full bg-primary/30 blur-[60px] scale-125", playing && "animate-pulse")} />
          <Moodie size="large" emotion={playing ? "happy" : "calm"} />
        </div>
      </div>

      {infoOpen && (
        <div className="relative mx-5 mb-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl z-10">
          <p className="text-[10px] tracking-widest uppercase text-primary font-serif">{detail.frequencyLabel}</p>
          <p className="text-xs text-white/70 mt-1 leading-relaxed">{detail.frequencyScience}</p>
          <p className="text-[11px] text-white/50 mt-2 leading-snug">{detail.effect}</p>
        </div>
      )}

      {errorMsg && (
        <div className="relative mx-5 mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 z-10 text-center">
          <p className="text-xs text-red-300">{errorMsg}</p>
        </div>
      )}

      <div className="relative px-3 pb-4 flex items-center justify-center gap-2 z-10">
        {VARIANTS.map((v) => {
          const isActive = variant === v.id;
          return (
            <button
              key={v.id}
              onClick={() => playVariant(v.id)}
              className={cn(
                "flex-1 max-w-[72px] h-[64px] rounded-2xl flex flex-col items-center justify-center transition-all",
                isActive ? "bg-white text-black" : "bg-white/[0.04] border border-white/10 text-white/60 active:scale-95"
              )}
              aria-label={`${v.label} ${v.hz}`}
            >
              <span className="text-xl font-serif leading-none">{v.symbol}</span>
              <span className={cn("text-[10px] mt-1 tracking-wider", isActive ? "text-black/70 font-semibold" : "text-white/50")}>
                {v.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative px-5 pb-10 flex items-center justify-center gap-5 z-10">
        <button onClick={() => playVariant(variant)} className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center active:scale-95">
          <Shuffle className="w-4 h-4 text-white/70" />
        </button>
        <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl active:scale-95 transition">
          {playing ? <Pause className="w-7 h-7 text-black" /> : <Play className="w-7 h-7 text-black ml-0.5" />}
        </button>
        <button className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center active:scale-95">
          <Timer className="w-4 h-4 text-white/70" />
        </button>
      </div>
    </div>
  );
};

export default MusicPlay;
