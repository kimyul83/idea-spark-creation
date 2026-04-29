import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Pause, Play, Sparkles, Waves, CloudRain, Trees, Droplets, Flame, Moon, type LucideIcon } from "lucide-react";
import { Howl } from "howler";
import { MonetBackground } from "@/components/MonetBackground";
import { Moody } from "@/components/Moody";
import { toCdnUrl } from "@/lib/situation-tracks";
import {
  setMediaSession,
  setMediaSessionPlaying,
  clearMediaSession,
  requestWakeLock,
  releaseWakeLock,
} from "@/lib/media-session";
import { usePremium } from "@/hooks/usePremium";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Variant {
  name: string;
  file: string;
}

interface SleepTrack {
  id: string;
  Icon: LucideIcon;
  name: string;
  premium: boolean;
  variants: Variant[];
}

const TRACKS: SleepTrack[] = [
  {
    id: "deep_waves",
    Icon: Waves,
    name: "깊은 파도",
    premium: false,
    variants: [
      { name: "스칸디나비아 군도", file: "/sounds/ES_Water, Wave, Waves Sweeping Over Rocks, Calm, Lapping, Scandinavian Archipelago - Epidemic Sound.mp3" },
      { name: "호수의 잔물결", file: "/sounds/ES_Water, Lap, Lake, Small Waves Lapping, Detailed, 1m, Loop 01 - Epidemic Sound.mp3" },
      { name: "바위에 부서지는 잔파도", file: "/sounds/ES_Water, Lap, Gentle Waves, Splashing Against Rocks, Calm, Light Water Fizz - Epidemic Sound.mp3" },
      { name: "해변의 작은 파도", file: "/sounds/ES_Water, Wave, Ocean, Beach Waves, Small, Lapping - Epidemic Sound.mp3" },
      { name: "망그로브 해안", file: "/sounds/ES_Water, Wave, Seaside, Waves, Inside, Mangroves, South Andaman - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "calm_rain",
    Icon: CloudRain,
    name: "잔잔한 빗소리",
    premium: false,
    variants: [
      { name: "잎새 위 빗방울", file: "/sounds/ES_Rain, Vegetation, Medium Leaves, Drop, Tropical, Jungle - Epidemic Sound.mp3" },
      { name: "낮의 거센 빗줄기", file: "/sounds/ES_Rain, Vegetation, Rain, Daytime, Incoming Hard Rain, Baratang Island - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "forest_night",
    Icon: Trees,
    name: "숲의 밤",
    premium: false,
    variants: [
      { name: "맑은 밤의 귀뚜라미", file: "/sounds/ES_Ambience, Insect, Cricket, Night, Clean - Epidemic Sound.mp3" },
      { name: "밤 풀밭 귀뚜라미 1", file: "/sounds/ES_Ambience, Insect, Cricket, Night, Meadow, Jungle 01 - Epidemic Sound.mp3" },
      { name: "밤 풀밭 귀뚜라미 2", file: "/sounds/ES_Ambience, Insect, Cricket, Night, Meadow, Jungle 02 - Epidemic Sound.mp3" },
      { name: "아마존 강가의 밤", file: "/sounds/ES_Ambience, Tropical, Amazonas, Night Close, River Crickets, Frogs Bird Sometimes - Epidemic Sound.mp3" },
      { name: "열대우림의 밤", file: "/sounds/ES_Ambience, Tropical, Rainforest, Night, Insects, Boobook, Middle Jarawa, Edge 02 - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "stream",
    Icon: Droplets,
    name: "물 흐르는 소리",
    premium: false,
    variants: [
      { name: "고요한 숲의 시내", file: "/sounds/ES_Water, Flow, Creek, Light, Flowing, Foam Details, Calm Forest 01 - Epidemic Sound.mp3" },
      { name: "돌 사이 흐르는 강", file: "/sounds/ES_Water, Flow, River, Small, Soft, Burbling Between Stones - Epidemic Sound.mp3" },
      { name: "꾸준히 흐르는 작은 강", file: "/sounds/ES_Water, Movement, Small River, Continuous, Calm, Happy, Steady Stream 01 Schoeps (MS) - Epidemic Sound.mp3" },
      { name: "안정적인 폭포", file: "/sounds/ES_Water, Waterfall, Steady, Perspective - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "fire_asmr",
    Icon: Flame,
    name: "모닥불 ASMR",
    premium: true,
    variants: [
      { name: "잔잔한 장작 모닥불", file: "/sounds/ES_Fire, Burning, Burning Wood, Bonfire, Crispy, Soft Intensity, Loop - Epidemic Sound.mp3" },
      { name: "타닥거리는 모닥불", file: "/sounds/ES_Fire, Burning, Bonfire, Moderate Size, Close, Crackling - Epidemic Sound.mp3" },
      { name: "중간 세기의 장작불", file: "/sounds/ES_Fire, Burning, Wood, Crispy, Medium Intensity - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "deep_ambience",
    Icon: Moon,
    name: "깊은 밤 명상",
    premium: true,
    variants: [
      { name: "동굴 물방울 흐름", file: "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 02 - Epidemic Sound.mp3" },
      { name: "동굴 깊은 물방울", file: "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 03 - Epidemic Sound.mp3" },
      { name: "히말라야 천둥번개", file: "/sounds/ES_Weather, Storm, Strong, Storm 2, Lightning, High Mountains, Bhaleydhunga, Himalaya 04 - Epidemic Sound.mp3" },
    ],
  },
];

const MIN_HOURS = 1;
const MAX_HOURS = 10;
const STEP_HOURS = 0.5;
const FADE_BEFORE_END_SECONDS = 20 * 60;
const FADE_DURATION_SECONDS = 5 * 60;
const TRACK_VOLUME = 0.55;

const formatHours = (h: number) =>
  Number.isInteger(h) ? `${h}시간` : `${Math.floor(h)}시간 30분`;

const formatClock = (d: Date) =>
  d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });

const Sleep = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { resolvedVariant } = useTheme();

  const [hours, setHours] = useState(8);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [endsAt, setEndsAt] = useState<Date | null>(null);
  const startedAt = useRef<number>(0);
  const endTimer = useRef<number>();
  const fadeTimer = useRef<number>();
  const howlRef = useRef<Howl | null>(null);

  const wakeAt = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + Math.round(hours * 60));
    return d;
  }, [hours]);

  const greeting =
    resolvedVariant === "light"
      ? "오늘 밤 좋은 꿈 꾸세요 🌙"
      : "푹 주무실 준비 되셨나요 🌙";

  const cleanup = () => {
    howlRef.current?.stop();
    howlRef.current?.unload();
    howlRef.current = null;
    if (endTimer.current) window.clearTimeout(endTimer.current);
    if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    clearMediaSession();
    releaseWakeLock();
  };

  useEffect(() => {
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopActive = async () => {
    if (!activeId) return;
    const elapsedSec = Math.round((Date.now() - startedAt.current) / 1000);
    cleanup();
    if (user && elapsedSec > 30) {
      try {
        await supabase.from("sessions").insert({
          user_id: user.id,
          session_type: "sleep",
          duration_seconds: elapsedSec,
          completed: true,
        });
      } catch { /* silent */ }
    }
    setActiveId(null);
    setEndsAt(null);
  };

  const playVariant = (track: SleepTrack, variantIdx: number) => {
    if (track.premium && !isPremium) {
      navigate("/subscribe");
      return;
    }
    cleanup();

    const v = track.variants[variantIdx];
    const howl = new Howl({
      src: [toCdnUrl(v.file)],
      html5: true,
      loop: true,
      volume: TRACK_VOLUME,
      onplay: () => {
        setMediaSessionPlaying(true);
        requestWakeLock();
      },
      onpause: () => setMediaSessionPlaying(false),
      onstop: () => setMediaSessionPlaying(false),
    });
    howl.play();
    howlRef.current = howl;

    setMediaSession(
      { title: `${track.name} · ${v.name}`, artist: "MintMoody · Sleep", album: formatHours(hours) },
      { onPause: () => stopActive() },
    );

    const totalSec = Math.round(hours * 3600);
    const fadeStartIn = Math.max(0, totalSec - FADE_BEFORE_END_SECONDS) * 1000;

    fadeTimer.current = window.setTimeout(() => {
      howlRef.current?.fade(TRACK_VOLUME, 0, FADE_DURATION_SECONDS * 1000);
    }, fadeStartIn);

    endTimer.current = window.setTimeout(() => {
      stopActive();
      toast.success("좋은 아침이에요 ☀️");
    }, totalSec * 1000);

    startedAt.current = Date.now();
    setActiveId(track.id);
    setActiveVariantIdx(variantIdx);
    setEndsAt(new Date(Date.now() + totalSec * 1000));
    toast(`${track.name} ${variantIdx + 1} · ${formatHours(hours)} 재생`);
  };

  const handleTrackClick = (track: SleepTrack) => {
    if (activeId === track.id) {
      stopActive();
      return;
    }
    playVariant(track, 0);
  };

  return (
    <div className="px-5 pt-10 pb-6 relative flex-1 flex flex-col gap-5">
      <MonetBackground intensity="soft" emotion="sleepy" />

      <header className="flex items-start justify-between">
        <div>
          <p className="text-[13px] tracking-[0.3em] uppercase text-primary font-serif">
            Sleep
          </p>
          <h1 className="text-[30px] font-bold text-foreground mt-1 leading-tight">
            편안한 수면
          </h1>
          <p className="text-base text-foreground/65 mt-1.5">{greeting}</p>
        </div>
        <Moody size={140} emotion="calm" />
      </header>

      <section className="liquid-card p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary/80 font-serif">
            수면 시간
          </p>
          <p className="text-[11px] text-foreground/55">
            지금 시작 → <span className="text-primary font-semibold">{formatClock(wakeAt)}</span> 종료
          </p>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-[32px] font-bold leading-none text-foreground">
            {Math.floor(hours)}
          </span>
          <span className="text-foreground/65 text-sm">
            {hours % 1 === 0.5 ? "시간 30분" : "시간"}
          </span>
        </div>
        <input
          type="range"
          min={MIN_HOURS}
          max={MAX_HOURS}
          step={STEP_HOURS}
          value={hours}
          onChange={(e) => setHours(parseFloat(e.target.value))}
          className="w-full mt-4 accent-primary"
          aria-label="수면 시간"
        />
        <div className="flex justify-between text-[10px] text-foreground/40 mt-1">
          <span>1시간</span>
          <span>5시간</span>
          <span>10시간</span>
        </div>
        {activeId && endsAt && (
          <div className="mt-4 flex items-center justify-between bg-primary/10 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-foreground/80">
                {formatClock(endsAt)} 자동 종료 · 20분 전부터 페이드
              </span>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-primary/80 font-serif mb-1 px-1">
          수면 사운드
        </p>
        <div className="grid gap-2">
          {TRACKS.map((t) => {
            const locked = t.premium && !isPremium;
            const isActive = activeId === t.id;
            return (
              <div
                key={t.id}
                className={cn(
                  "liquid-card w-full p-4",
                  isActive && "ring-2 ring-primary/60",
                )}
              >
                <button
                  onClick={() => handleTrackClick(t)}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                    <t.Icon className="w-6 h-6 text-primary" strokeWidth={1.7} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-foreground text-[15px] truncate">
                        {t.name}
                      </p>
                      {locked && <Lock className="w-3 h-3 text-foreground/40" />}
                    </div>
                    <p className="text-[11px] text-foreground/55 mt-0.5 truncate">
                      {isActive
                        ? t.variants[activeVariantIdx].name
                        : `${t.variants.length}종 · 번호로 선택`}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/5 text-foreground/70",
                    )}
                    aria-label={isActive ? "정지" : "재생"}
                  >
                    {isActive ? (
                      <Pause className="w-4 h-4" strokeWidth={2.4} />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" strokeWidth={2.4} />
                    )}
                  </div>
                </button>
                {!locked && t.variants.length > 1 && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    {t.variants.map((v, i) => {
                      const isCurrent = isActive && activeVariantIdx === i;
                      return (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            playVariant(t, i);
                          }}
                          title={v.name}
                          className={cn(
                            "min-w-[28px] h-7 px-2 rounded-full text-[11px] font-semibold transition",
                            isCurrent
                              ? "bg-primary text-primary-foreground"
                              : "bg-foreground/8 text-foreground/65 hover:bg-foreground/15",
                          )}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-[11px] text-foreground/45 leading-relaxed text-center px-4 pt-2">
        화면을 꺼도 재생은 유지돼요. 알람 대신 부드러운 페이드 아웃으로 깨워드려요.
      </p>
    </div>
  );
};

export default Sleep;
