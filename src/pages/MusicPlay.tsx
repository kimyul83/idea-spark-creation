import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Play, Pause, Shuffle, Timer, Info } from "lucide-react";
import { Howl, Howler } from "howler";
import { Moody } from "@/components/Moody";
import { getSituationById } from "@/lib/modes";
import { SITUATION_TRACK_MAP, pickRandom, toCdnUrl } from "@/lib/situation-tracks";
import { SITUATION_DETAILS } from "@/lib/situation-details";
import { audioEngine } from "@/lib/audio-engine";
import {
  setMediaSession,
  setMediaSessionPlaying,
  clearMediaSession,
  requestWakeLock,
  releaseWakeLock,
} from "@/lib/media-session";
import { cn } from "@/lib/utils";

/**
 * 미니멀 풀스크린 재생 화면.
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

// variant → 자연 사운드 키워드 매칭. (음악 트랙은 더 이상 사용하지 않음)
const variantMatches = (url: string, v: VariantId): boolean => {
  const u = url.toLowerCase();
  if (v === "delta") return /night|cricket|underground|cave|wave|lap|gentle|peaceful|calm/.test(u);
  if (v === "theta") return /cave|wind|forest|swamp|mangrove|underground|deep|howling/.test(u);
  if (v === "alpha") return /water|stream|creek|river|wave|lap|gentle|birdsong|forest|peaceful|quiet/.test(u);
  if (v === "beta")  return /morning|dawn|chirping|songbird|meadow|afternoon|daytime|light.wind|light.rain/.test(u);
  if (v === "gamma") return /rain|waterfall|rainforest|insects|hard.rain|tropical/.test(u);
  return false;
};

const MusicPlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const situation = id ? getSituationById(id) : undefined;
  const tracks = id ? SITUATION_TRACK_MAP[id] : undefined;
  const detail = id ? SITUATION_DETAILS[id] : undefined;

  // 상황별 초기 뇌파 매칭
  const defaultVariant: VariantId = (() => {
    if (!id) return "alpha";
    if (id === "sleep") return "delta";
    if (id === "focus") return "gamma";
    if (id === "tropical") return "beta";
    if (id === "mountain") return "theta";
    return "alpha";
  })();
  const [variant, setVariant] = useState<VariantId>(defaultVariant);
  const [playing, setPlaying] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timerHours, setTimerHours] = useState<number | null>(null); // null = 무한 재생, 숫자 = N시간 후 자동정지
  const [timerOpen, setTimerOpen] = useState(false);
  const howlRef = useRef<Howl | null>(null);
  const timerRef = useRef<number | undefined>();

  const TIMER_OPTIONS = [
    { hours: null as number | null, label: t("timer.off") },
    { hours: 0.5, label: t("timer.minutes30") },
    { hours: 1, label: t("timer.hour1") },
    { hours: 3, label: t("timer.hour3") },
    { hours: 6, label: t("timer.hour6") },
    { hours: 8, label: t("timer.hour8") },
    { hours: 12, label: t("timer.hour12") },
  ];

  const applyTimer = (hours: number | null) => {
    setTimerHours(hours);
    setTimerOpen(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (hours == null) return;
    timerRef.current = window.setTimeout(() => {
      howlRef.current?.stop();
      setPlaying(false);
    }, hours * 3600 * 1000);
  };

  useEffect(() => {
    return () => {
      howlRef.current?.stop();
      howlRef.current?.unload();
      if (timerRef.current) window.clearTimeout(timerRef.current);
      audioEngine.stopAll();
      clearMediaSession();
      releaseWakeLock();
    };
  }, []);

  if (!situation || !tracks || !detail) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-black">
        <p className="text-white/60">{t("musicPlay.noSituation")}</p>
      </div>
    );
  }

  const allTracks = useMemo(
    () => [...tracks.music, ...tracks.nature],
    [tracks]
  );

  // 5개 변주가 절대 같은 트랙 받지 않도록 인덱스 분배.
  // 키워드 매칭은 보조용 — 인덱스 기반이 우선 (안정성 + 비겹침 보장).
  const VARIANT_INDEX: Record<VariantId, number> = {
    delta: 0, theta: 1, alpha: 2, beta: 3, gamma: 4,
  };
  const pickForVariant = (v: VariantId): string | undefined => {
    const pool = allTracks;
    if (pool.length === 0) return undefined;
    if (pool.length === 1) return pool[0];

    // 변주 인덱스 기반 확정 선택. 풀을 5개 슬롯으로 균등 분할 → 절대 겹치지 않음.
    // 풀이 5개 미만이면 (theta·alpha 등이) 같은 트랙 공유 — 어쩔 수 없음.
    const idx = Math.floor((VARIANT_INDEX[v] / 5) * pool.length) % pool.length;
    return pool[idx];
  };

  const playVariant = (v: VariantId) => {
    setVariant(v);
    const url = pickForVariant(v);
    if (!url) {
      setErrorMsg(t("musicPlay.noTrack"));
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
        setMediaSessionPlaying(true);
        requestWakeLock();
      },
      onpause: () => {
        setPlaying(false);
        setMediaSessionPlaying(false);
      },
      onstop: () => {
        setPlaying(false);
        setMediaSessionPlaying(false);
      },
      onload: () => console.log("[MusicPlay] Loaded"),
      onloaderror: (id, err) => {
        console.error("[MusicPlay] Load error:", err, cdnUrl);
        setErrorMsg(t("musicPlay.loadError", { err: String(err) }));
        setPlaying(false);
      },
      onplayerror: (id, err) => {
        console.error("[MusicPlay] Play error:", err);
        setErrorMsg(t("musicPlay.playError", { err: String(err) }));
        // iOS 자동 재시도
        howl.once("unlock", () => howl.play());
      },
    });
    howl.play();
    howlRef.current = howl;

    setMediaSession(
      {
        title: t(`situations.${id}.mood`, { defaultValue: detail.mood }),
        artist: "MintMoody",
        album: t(`situations.${id}.scene`, { defaultValue: detail.scene }),
      },
      {
        onPlay: () => howl.play(),
        onPause: () => howl.pause(),
      }
    );

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
          {t(`situations.${id}.mood`, { defaultValue: detail.mood })}
        </h1>
        <p className="mt-3 text-sm text-white/60 tracking-wider">
          {t(`situations.${id}.scene`, { defaultValue: detail.scene })}
        </p>
      </div>

      <div className="relative flex-1 flex items-center justify-center z-10">
        <div className="relative">
          <div className={cn("absolute inset-0 rounded-full bg-primary/30 blur-[60px] scale-125", playing && "animate-pulse")} />
          <Moody size="large" emotion={playing ? "happy" : "calm"} />
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
        <button
          onClick={() => setTimerOpen(true)}
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center active:scale-95 relative",
            timerHours != null
              ? "bg-primary text-primary-foreground"
              : "bg-white/[0.06] border border-white/10",
          )}
          aria-label={t("timer.title")}
        >
          <Timer className={cn("w-4 h-4", timerHours != null ? "" : "text-white/70")} />
          {timerHours != null && (
            <span className="absolute -bottom-1 -right-1 text-[9px] bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center font-bold border border-black">
              {timerHours < 1 ? "30" : `${timerHours}h`}
            </span>
          )}
        </button>
      </div>

      {/* 타이머 모달 */}
      {timerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-5"
          onClick={() => setTimerOpen(false)}
        >
          <div
            className="liquid-card w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="section-title mb-3">{t("timer.title")}</p>
            <div className="grid gap-2">
              {TIMER_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => applyTimer(opt.hours)}
                  className={cn(
                    "w-full px-4 py-3 rounded-2xl text-left transition flex items-center justify-between",
                    timerHours === opt.hours
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/[0.06] text-white/80 hover:bg-white/[0.10]",
                  )}
                >
                  <span className="font-semibold">{opt.label}</span>
                  {timerHours === opt.hours && <span className="text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlay;
