import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Lock, Pause, Play, Sparkles, Waves, CloudRain, Trees, Droplets,
  Flame, Moon, Wind, Bird, Coffee, Mountain, Zap, Music2, Volume2,
  type LucideIcon,
} from "lucide-react";
import { Howl } from "howler";
import { MonetBackground } from "@/components/MonetBackground";
import { Moody } from "@/components/Moody";
import { audioEngine } from "@/lib/audio-engine";
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
      { name: "넓은 바다 중간 파도", file: "/sounds/ES_Water, Wave, Ocean, Medium Waves, Wind - Epidemic Sound.mp3" },
      { name: "잔잔한 작은 파도", file: "/sounds/ES_Water, Wave, Small Waves, Movements - Epidemic Sound.mp3" },
      { name: "호수 밝은 물결 (가까이)", file: "/sounds/ES_Water, Lap, Waves, Lake, Small, Bright, Lapping, Close - Epidemic Sound.mp3" },
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
      { name: "오후의 강한 비", file: "/sounds/ES_Rain, Vegetation, Rain, Afternoon, Strong Rain, Baratang Island 02 - Epidemic Sound.mp3" },
      { name: "오후의 잔잔한 비와 새소리", file: "/sounds/ES_Rain, Vegetation, Rain, Afternoon, Gentle Rain, Birds, Baratang Island 02 - Epidemic Sound.mp3" },
      { name: "낮 중간 빗줄기", file: "/sounds/ES_Rain, Vegetation, Rain, Daytime, Mid To Hard Rainfall, Havelock Island, Second 01 - Epidemic Sound.mp3" },
      { name: "야자 잎에 떨어지는 비", file: "/sounds/ES_Rain, Vegetation, Rain, Daytime, Rain Drops Hitting Hard Palm Leaves, Havelock Island 02 - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "forest_night",
    Icon: Moon,
    name: "숲의 밤",
    premium: false,
    variants: [
      { name: "맑은 밤의 귀뚜라미", file: "/sounds/ES_Ambience, Insect, Cricket, Night, Clean - Epidemic Sound.mp3" },
      { name: "밤 풀밭 귀뚜라미 1", file: "/sounds/ES_Ambience, Insect, Cricket, Night, Meadow, Jungle 01 - Epidemic Sound.mp3" },
      { name: "밤 풀밭 귀뚜라미 2", file: "/sounds/ES_Ambience, Insect, Cricket, Night, Meadow, Jungle 02 - Epidemic Sound.mp3" },
      { name: "아마존 강가의 밤", file: "/sounds/ES_Ambience, Tropical, Amazonas, Night Close, River Crickets, Frogs Bird Sometimes - Epidemic Sound.mp3" },
      { name: "열대우림의 밤 (Boobook)", file: "/sounds/ES_Ambience, Tropical, Rainforest, Night, Insects, Boobook, Middle Jarawa, Edge 02 - Epidemic Sound.mp3" },
      { name: "신비한 열대의 밤", file: "/sounds/ES_Ambience, Tropical, Mysterious Night, Cricket - Epidemic Sound.mp3" },
      { name: "열대우림 밤 (벌·야행성)", file: "/sounds/ES_Ambience, Tropical, Rainforest, Night, Nocturnal Animals, Bees, Background, Little Andaman 02 - Epidemic Sound.mp3" },
      { name: "밤바다 (멀리 거친 파도)", file: "/sounds/ES_Water, Surf, Seaside, Night, Distant Rough Sea, Crickets, Middle Andaman - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "stream",
    Icon: Droplets,
    name: "물 흐르는 소리",
    premium: false,
    variants: [
      { name: "고요한 숲의 작은 시내", file: "/sounds/ES_Water, Flow, Creek, Light, Flowing, Foam Details, Calm Forest 01 - Epidemic Sound.mp3" },
      { name: "중간 크기 시냇물", file: "/sounds/ES_Water, Flow, Creek, Medium Stream, 2m - Epidemic Sound.mp3" },
      { name: "돌 사이 졸졸 흐르는 강", file: "/sounds/ES_Water, Flow, River, Small, Soft, Burbling Between Stones - Epidemic Sound.mp3" },
      { name: "조용한 작은 시내", file: "/sounds/ES_Water, Flow, Water Flowing, Small Stream 01 - Epidemic Sound.mp3" },
      { name: "꾸준한 작은 강", file: "/sounds/ES_Water, Movement, Small River, Continuous, Calm, Happy, Steady Stream 01 Schoeps (MS) - Epidemic Sound.mp3" },
      { name: "폭포 위 흐르는 물", file: "/sounds/ES_Water, Waterfall, Top, Deep, Water Flowing Before Falling - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "forest_day",
    Icon: Trees,
    name: "숲의 하루",
    premium: false,
    variants: [
      { name: "약한 비와 바람 부는 숲", file: "/sounds/ES_Ambience, Forest, Birds Chirping, Light Rain, Light Wind - Epidemic Sound.mp3" },
      { name: "낮 바람에 삐걱이는 나무", file: "/sounds/ES_Ambience, Forest, Wind, Daytime, Creaking Tree In Wind, Little Andaman - Epidemic Sound.mp3" },
      { name: "발트 해안 숲 낮바람", file: "/sounds/ES_Ambience, Forest, Day, Wind In Trees, Birds Chirping, Calm, Baltic - Epidemic Sound.mp3" },
      { name: "약한 비 내리는 열대 숲", file: "/sounds/ES_Ambience, Tropical, Slightly Raining, Forest - Epidemic Sound.mp3" },
      { name: "산속 숲, 멀고 가까운 강", file: "/sounds/ES_Ambience, Rural, Mountain Forest, Distant & Close River, Water Flow, Light Wind, Calm - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "mountain",
    Icon: Mountain,
    name: "산속 자연",
    premium: false,
    variants: [
      { name: "산의 고요, 먼 강물", file: "/sounds/ES_Ambience, Rural, Mountain, Quiet, Distant River, Light Wind, Calm - Epidemic Sound.mp3" },
      { name: "동굴의 물방울 흐름", file: "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 02 - Epidemic Sound.mp3" },
      { name: "동굴 깊은 물방울", file: "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 06 - Epidemic Sound.mp3" },
      { name: "동굴 강물과 바람구멍", file: "/sounds/ES_Ambience, Underground, Cave, Water, River, Wind Hole - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "wind",
    Icon: Wind,
    name: "바람의 노래",
    premium: false,
    variants: [
      { name: "겨울 활엽수 사이 바람", file: "/sounds/ES_Wind, Vegetation, Blowing Through Deciduous Trees, Leaves Rustling, Moderate Intensity, Winter, Afternoon - Epidemic Sound.mp3" },
      { name: "눈과 잎사귀 사이 휘파람 바람", file: "/sounds/ES_Wind, General, Gusts, Snow, Leaves, Howling - Epidemic Sound.mp3" },
      { name: "눈바람의 휘몰아침", file: "/sounds/ES_Wind, General, Gusts, Snow, Rustling, Howling 01 - Epidemic Sound.mp3" },
      { name: "극지 눈보라", file: "/sounds/ES_Wind, Gust, Designed, Polar, Snow Storm 05 - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "fire_asmr",
    Icon: Flame,
    name: "모닥불 ASMR",
    premium: false,
    variants: [
      { name: "타닥거리는 모닥불", file: "/sounds/ES_Fire, Burning, Bonfire, Moderate Size, Close, Crackling - Epidemic Sound.mp3" },
      { name: "잔잔한 장작 모닥불", file: "/sounds/ES_Fire, Burning, Burning Wood, Bonfire, Crispy, Soft Intensity, Loop - Epidemic Sound.mp3" },
      { name: "유리벽 안 장작불", file: "/sounds/ES_Fire, Burning, Fireplace, Glass Walls, Wood Burning Calm, Close Up - Epidemic Sound.mp3" },
      { name: "사우나의 작은 장작불", file: "/sounds/ES_Fire, Crackle, Fireplace In Sauna, Small, Thin, Bright - Epidemic Sound.mp3" },
      { name: "실내 벽난로", file: "/sounds/ES_Fire, Crackle, Fireplace, Indoor, Open, Crackling, Transient, Low Intensity - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "cafe",
    Icon: Coffee,
    name: "카페 ASMR",
    premium: true,
    variants: [
      { name: "밴쿠버 카페", file: "/sounds/ES_Ambience, Restaurant & Bar, Coffee Shop, Spacious, Hum, Coffee Machines, Walla, Vancouver 01 - Epidemic Sound.mp3" },
      { name: "카페 카운터 곁", file: "/sounds/ES_Ambience, Restaurant & Bar, Coffee Shop, Walla, By Counter, Cash Register - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "deep_ambience",
    Icon: Sparkles,
    name: "깊은 밤 명상",
    premium: true,
    variants: [
      { name: "고요한 동굴", file: "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 03 - Epidemic Sound.mp3" },
      { name: "꾸준한 시냇물", file: "/sounds/ES_Water, Movement, Small River, Continuous, Calm, Happy, Steady Stream 01 Schoeps (MS) - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "storm",
    Icon: Zap,
    name: "히말라야 폭풍우",
    premium: true,
    variants: [
      { name: "천둥번개 04", file: "/sounds/ES_Weather, Storm, Strong, Storm 2, Lightning, High Mountains, Bhaleydhunga, Himalaya 04 - Epidemic Sound.mp3" },
      { name: "천둥번개 01", file: "/sounds/ES_Weather, Storm, Strong, Storm 2, Lightning, High Mountains, Bhaleydhunga, Himalaya 01 - Epidemic Sound.mp3" },
      { name: "천둥번개 03", file: "/sounds/ES_Weather, Storm, Strong, Storm 2, Lightning, High Mountains, Bhaleydhunga, Himalaya 03 - Epidemic Sound.mp3" },
      { name: "강한 폭풍 01", file: "/sounds/ES_Weather, Storm, Strong, Storm 3, Lightning, High Mountains, Bhaleydhunga, Himalaya 01 - Epidemic Sound.mp3" },
      { name: "강한 폭풍 03", file: "/sounds/ES_Weather, Storm, Strong, Storm 3, Lightning, High Mountains, Bhaleydhunga, Himalaya 03 - Epidemic Sound.mp3" },
    ],
  },
];

/**
 * 수면 전용 주파수 — Delta·Theta 만 (수면에 좋음).
 * 베타·감마는 의도적으로 제외 (각성 주파수, 수면 ❌).
 */
interface SleepFreq {
  id: string;
  label: string;
  tag: string;
  Icon: LucideIcon;
  hz: number;
  type: "tone" | "noise";
  noiseType?: "white" | "pink" | "brown";
}

const SLEEP_FREQUENCIES: SleepFreq[] = [
  { id: "brown",  label: "브라운 노이즈",  tag: "δ파 · 멜라토닌 · 깊은수면", Icon: Music2, hz: 0,    type: "noise", noiseType: "brown" },
  { id: "pink",   label: "핑크 노이즈",    tag: "θ파 · 코르티솔 ↓ · 임상",   Icon: Music2, hz: 0,    type: "noise", noiseType: "pink" },
  { id: "delta1", label: "1Hz 델타파",     tag: "δ파 유도 · 깊은수면",      Icon: Moon,   hz: 1,    type: "tone" },
  { id: "528",    label: "528Hz",          tag: "옥시토신 · 사랑 · 안정",   Icon: Sparkles, hz: 528, type: "tone" },
];

const MIN_HOURS = 1;
const MAX_HOURS = 12;
const STEP_HOURS = 0.5;
const FADE_BEFORE_END_SECONDS = 20 * 60;
const FADE_DURATION_SECONDS = 5 * 60;

// 자연 0.45 / 노이즈 0.13 / 톤 0.09 — Music 탭과 같은 기본값
const DEFAULT_NATURE_VOL = 0.45;
const DEFAULT_NOISE_VOL = 0.13;
const DEFAULT_TONE_VOL = 0.09;

const formatHours = (h: number) =>
  Number.isInteger(h) ? `${h}시간` : `${Math.floor(h)}시간 30분`;

const formatClock = (d: Date) =>
  d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });

const Sleep = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { resolvedVariant } = useTheme();

  const [hours, setHours] = useState(8);
  // 멀티 트랙 — 활성 트랙 ID 집합 (자연 + 주파수 모두 포함)
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  // 자연 트랙별 변주 인덱스
  const [variantIdx, setVariantIdx] = useState<Record<string, number>>({});
  // 타일별 볼륨 슬라이더
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [editingVolume, setEditingVolume] = useState<string | null>(null);
  const [endsAt, setEndsAt] = useState<Date | null>(null);

  // 자연 트랙 Howl 들 — id → Howl
  const howlsRef = useRef<Map<string, Howl>>(new Map());
  const startedAt = useRef<number>(0);
  const endTimer = useRef<number>();
  const fadeTimer = useRef<number>();

  const wakeAt = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + Math.round(hours * 60));
    return d;
  }, [hours]);

  const greeting =
    resolvedVariant === "light"
      ? t("sleep.greetingLight")
      : t("sleep.greetingDark");

  // 모든 트랙 정지 + cleanup
  const stopAll = async () => {
    const elapsedSec = Math.round((Date.now() - startedAt.current) / 1000);

    howlsRef.current.forEach((h) => { h.stop(); h.unload(); });
    howlsRef.current.clear();
    audioEngine.stopAll();

    if (endTimer.current) window.clearTimeout(endTimer.current);
    if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    clearMediaSession();
    releaseWakeLock();

    if (user && elapsedSec > 30 && activeIds.size > 0) {
      try {
        await supabase.from("sessions").insert({
          user_id: user.id,
          session_type: "sleep",
          duration_seconds: elapsedSec,
          completed: true,
        });
      } catch { /* silent */ }
    }
    setActiveIds(new Set());
    setEndsAt(null);
  };

  useEffect(() => {
    return () => {
      howlsRef.current.forEach((h) => { h.stop(); h.unload(); });
      howlsRef.current.clear();
      audioEngine.stopAll();
      if (endTimer.current) window.clearTimeout(endTimer.current);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
      clearMediaSession();
      releaseWakeLock();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 첫 트랙 추가 시 글로벌 fade + end timer 설정
  const ensureGlobalTimers = (firstTrackName: string) => {
    if (activeIds.size > 0) return; // 이미 활성 상태 — 타이머 그대로

    const totalSec = Math.round(hours * 3600);
    const fadeStartIn = Math.max(0, totalSec - FADE_BEFORE_END_SECONDS) * 1000;

    fadeTimer.current = window.setTimeout(() => {
      // 모든 자연 트랙 fade
      howlsRef.current.forEach((h) => h.fade(h.volume(), 0, FADE_DURATION_SECONDS * 1000));
    }, fadeStartIn);

    endTimer.current = window.setTimeout(() => {
      stopAll();
      toast.success(t("sleep.morningToast"));
    }, totalSec * 1000);

    startedAt.current = Date.now();
    setEndsAt(new Date(Date.now() + totalSec * 1000));
    setMediaSession(
      { title: `${firstTrackName} · 수면 믹스`, artist: "Mint Wave · Sleep", album: formatHours(hours) },
      { onPause: () => stopAll() },
    );
  };

  const playTrack = (track: SleepTrack, idx?: number) => {
    if (track.premium && !isPremium) {
      navigate("/subscribe");
      return;
    }

    const useIdx = idx ?? variantIdx[track.id] ?? 0;
    const v = track.variants[useIdx];
    if (!v) return;

    // 이미 재생 중이면 정지 후 새 변주
    const existing = howlsRef.current.get(track.id);
    if (existing) {
      existing.stop();
      existing.unload();
      howlsRef.current.delete(track.id);
    }

    const howl = new Howl({
      src: [toCdnUrl(v.file)],
      html5: true, // HTMLAudioElement — iOS 백그라운드/재진입 정상
      loop: true,
      volume: volumes[track.id] ?? DEFAULT_NATURE_VOL,
      preload: true,
      onplay: () => {
        setMediaSessionPlaying(true);
        requestWakeLock();
      },
    });
    howl.play();
    howlsRef.current.set(track.id, howl);

    ensureGlobalTimers(track.name);
    setActiveIds((prev) => new Set(prev).add(track.id));
    setVariantIdx((prev) => ({ ...prev, [track.id]: useIdx }));

    if (activeIds.size === 0) {
      toast(t("sleep.playToast", { name: track.name, n: useIdx + 1, duration: formatHours(hours) }));
    }
  };

  const stopTrack = (id: string) => {
    const howl = howlsRef.current.get(id);
    if (howl) {
      howl.stop();
      howl.unload();
      howlsRef.current.delete(id);
    }
    audioEngine.stop(id);

    setActiveIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      // 마지막 트랙 정지 시 stopAll 호출
      if (next.size === 0) {
        if (endTimer.current) window.clearTimeout(endTimer.current);
        if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
        clearMediaSession();
        releaseWakeLock();
        setEndsAt(null);
      }
      return next;
    });
  };

  const toggleTrack = (track: SleepTrack) => {
    if (activeIds.has(track.id)) {
      stopTrack(track.id);
    } else {
      playTrack(track);
    }
  };

  const cycleVariant = (track: SleepTrack) => {
    if (track.premium && !isPremium) return;
    const cur = variantIdx[track.id] ?? 0;
    const nextIdx = (cur + 1) % track.variants.length;
    if (activeIds.has(track.id)) {
      playTrack(track, nextIdx);
    } else {
      setVariantIdx((prev) => ({ ...prev, [track.id]: nextIdx }));
    }
  };

  const toggleFreq = (freq: SleepFreq) => {
    if (activeIds.has(freq.id)) {
      audioEngine.stop(freq.id);
      setActiveIds((prev) => {
        const next = new Set(prev);
        next.delete(freq.id);
        if (next.size === 0) {
          if (endTimer.current) window.clearTimeout(endTimer.current);
          if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
          clearMediaSession();
          releaseWakeLock();
          setEndsAt(null);
        }
        return next;
      });
      return;
    }
    if (freq.type === "noise" && freq.noiseType) {
      audioEngine.playNoise(freq.id, freq.noiseType, volumes[freq.id] ?? DEFAULT_NOISE_VOL);
    } else {
      audioEngine.playTone(freq.id, freq.hz, volumes[freq.id] ?? DEFAULT_TONE_VOL);
    }
    ensureGlobalTimers(freq.label);
    setActiveIds((prev) => new Set(prev).add(freq.id));
  };

  const updateVolume = (id: string, vol: number) => {
    setVolumes((prev) => ({ ...prev, [id]: vol }));
    const howl = howlsRef.current.get(id);
    if (howl) howl.volume(vol);
    audioEngine.setVolume(id, vol);
  };

  return (
    <div className="px-5 pt-16 pb-8 relative flex-1 flex flex-col gap-5">
      <MonetBackground intensity="soft" emotion="sleepy" />

      <header className="flex items-start justify-between">
        <div>
          <p className="chip-primary text-[13px] tracking-[0.3em] uppercase font-serif">
            {t("sleep.label")}
          </p>
          <h1 className="text-[26px] font-bold text-foreground mt-0.5 leading-tight">
            {t("sleep.title")}
          </h1>
          <p className="text-sm text-foreground/65 mt-1">{greeting}</p>
        </div>
        <Moody size={120} emotion="calm" />
      </header>

      {/* duration */}
      <section className="liquid-card p-4">
        <div className="flex items-baseline justify-between">
          <p className="section-title text-[11px]">{t("sleep.duration")}</p>
          <p className="text-[10px] text-foreground/55">
            {t("sleep.startsToEnds", { time: formatClock(wakeAt) })}
          </p>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="num-display text-[34px] leading-none text-foreground">
            {Math.floor(hours)}
          </span>
          <span className="text-foreground/65 text-sm font-medium">
            {hours % 1 === 0.5 ? t("sleep.hoursHalf") : t("sleep.hours")}
          </span>
        </div>
        <input
          type="range"
          min={MIN_HOURS}
          max={MAX_HOURS}
          step={STEP_HOURS}
          value={hours}
          onChange={(e) => setHours(parseFloat(e.target.value))}
          className="w-full mt-3 accent-primary"
          aria-label={t("sleep.duration")}
        />
        <div className="flex justify-between text-[10px] text-foreground/40 mt-0.5">
          <span>1{t("sleep.hours")}</span>
          <span>6{t("sleep.hours")}</span>
          <span>12{t("sleep.hours")}</span>
        </div>
        {activeIds.size > 0 && endsAt && (
          <div className="mt-3 flex items-center justify-between bg-primary/10 rounded-2xl px-3 py-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[11px] text-foreground/80">
                {t("sleep.autoStop", { time: formatClock(endsAt) })}
              </span>
            </div>
            <span className="text-[11px] text-primary font-semibold">{activeIds.size}개 믹스</span>
          </div>
        )}
      </section>

      {/* nature tracks — 멀티 믹스 */}
      <section className="space-y-2">
        <h2 className="section-title text-[11px] mb-1.5 px-1">{t("sleep.sounds")} · 자연</h2>
        <div className="grid gap-1.5">
          {TRACKS.map((track) => {
            const locked = track.premium && !isPremium;
            const isActive = activeIds.has(track.id);
            const curIdx = variantIdx[track.id] ?? 0;
            const v = track.variants[curIdx];
            return (
              <div
                key={track.id}
                className={cn(
                  "liquid-card p-3 relative",
                  isActive && "ring-2 ring-primary/60",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleTrack(track)}
                    disabled={locked}
                    className="flex-1 min-w-0 flex items-center gap-2.5 text-left"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                      <track.Icon className="w-5 h-5 text-primary" strokeWidth={1.7} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-foreground text-[13.5px] truncate">
                          {t(`sleep.categories.${track.id}`, { defaultValue: track.name })}
                        </p>
                        {locked && <Lock className="w-3 h-3 text-foreground/40" />}
                      </div>
                      <p className="text-[10.5px] text-foreground/55 mt-0.5 truncate">
                        {isActive ? v?.name : `${track.variants.length}종 · 번호로 선택`}
                      </p>
                    </div>
                  </button>
                  {isActive && (
                    <button
                      onClick={() => setEditingVolume(editingVolume === track.id ? null : track.id)}
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center",
                        editingVolume === track.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-foreground/10 text-foreground/60",
                      )}
                      aria-label="볼륨"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => toggleTrack(track)}
                    disabled={locked}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/5 text-foreground/70",
                    )}
                  >
                    {isActive ? (
                      <Pause className="w-3.5 h-3.5" strokeWidth={2.4} />
                    ) : (
                      <Play className="w-3.5 h-3.5 ml-0.5" strokeWidth={2.4} />
                    )}
                  </button>
                </div>

                {/* 번호로 변주 선택 — 활성/비활성 모두 노출. 비활성 시 번호 누르면 즉시 재생 시작 + 그 변주로. */}
                {!locked && track.variants.length > 1 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {track.variants.map((variant, i) => {
                      const isCurrent = isActive && curIdx === i;
                      return (
                        <button
                          key={i}
                          onClick={() => playTrack(track, i)}
                          title={variant.name}
                          className={cn(
                            "min-w-[26px] h-6 px-2 rounded-full text-[10px] font-semibold transition",
                            isCurrent
                              ? "bg-primary text-primary-foreground"
                              : isActive
                                ? "bg-foreground/8 text-foreground/65 hover:bg-foreground/15"
                                : "bg-foreground/5 text-foreground/55 hover:bg-foreground/12",
                          )}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                )}

                {isActive && editingVolume === track.id && (
                  <div className="mt-2 flex items-center gap-2">
                    <Volume2 className="w-3 h-3 text-foreground/55 shrink-0" />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round((volumes[track.id] ?? DEFAULT_NATURE_VOL) * 100)}
                      onChange={(e) => updateVolume(track.id, Number(e.target.value) / 100)}
                      className="w-full h-1 accent-primary"
                    />
                    <span className="text-[9px] text-foreground/55 font-mono w-7 text-right shrink-0">
                      {Math.round((volumes[track.id] ?? DEFAULT_NATURE_VOL) * 100)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* sleep frequencies — 수면용 주파수만 (Delta·Theta) */}
      <section className="space-y-2">
        <h2 className="section-title text-[11px] mb-1.5 px-1">수면 주파수</h2>
        <p className="text-[10px] text-foreground/45 mb-1.5 px-1 leading-relaxed">
          δ·θ 뇌파 유도 — 자연 사운드와 같이 켜면 더 깊은 수면
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {SLEEP_FREQUENCIES.map((freq) => {
            const isActive = activeIds.has(freq.id);
            return (
              <div
                key={freq.id}
                className={cn(
                  "liquid-card p-2.5 relative",
                  isActive && "ring-2 ring-primary/60",
                )}
              >
                <button
                  onClick={() => toggleFreq(freq)}
                  className="w-full flex items-center gap-2 text-left"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                    isActive ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary",
                  )}>
                    <freq.Icon className="w-4 h-4" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-[12px] leading-tight truncate">
                      {freq.label}
                    </p>
                    <p className="text-[9.5px] text-primary font-medium tracking-wide leading-tight truncate mt-0.5">
                      {freq.tag}
                    </p>
                  </div>
                  {isActive && (
                    <Pause className="w-3 h-3 text-primary shrink-0" strokeWidth={2.4} />
                  )}
                </button>
                {isActive && (
                  <button
                    onClick={() => setEditingVolume(editingVolume === freq.id ? null : freq.id)}
                    className={cn(
                      "absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px]",
                      editingVolume === freq.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/10 text-foreground/55",
                    )}
                    aria-label="볼륨"
                  >
                    <Volume2 className="w-2.5 h-2.5" />
                  </button>
                )}
                {isActive && editingVolume === freq.id && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round((volumes[freq.id] ?? (freq.type === "noise" ? DEFAULT_NOISE_VOL : DEFAULT_TONE_VOL)) * 100)}
                      onChange={(e) => updateVolume(freq.id, Number(e.target.value) / 100)}
                      className="w-full h-1 accent-primary"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* stop all */}
      {activeIds.size > 0 && (
        <button
          onClick={stopAll}
          className="liquid-card w-full py-3 text-sm font-semibold text-primary"
        >
          전체 정지
        </button>
      )}

      <p className="text-[10px] text-foreground/45 leading-relaxed text-center px-3 pt-1">
        {t("sleep.tip")}
      </p>
    </div>
  );
};

export default Sleep;
