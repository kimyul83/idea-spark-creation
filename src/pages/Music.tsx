import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CloudRain, Waves, Trees, Mountain, Wind, Bird, Flame, Moon,
  Droplets, Sun, Music2, Heart, Brain,
  Coffee, Pause, Zap, Timer, HelpCircle, Volume2, type LucideIcon,
} from "lucide-react";
import { MusicGuideSheet } from "@/components/MusicGuideSheet";
import { Howl } from "howler";
import { MonetBackground } from "@/components/MonetBackground";
import { audioEngine } from "@/lib/audio-engine";
import { audioAdapter } from "@/lib/audio-adapter";
import { toCdnUrl } from "@/lib/situation-tracks";
import {
  setMediaSession,
  setMediaSessionPlaying,
  clearMediaSession,
  requestWakeLock,
  releaseWakeLock,
} from "@/lib/media-session";
import { cn } from "@/lib/utils";

/**
 * Music — 자연 사운드 믹스.
 * 각 카테고리마다 여러 버전을 이름으로 골라 재생.
 * 섬뜩하거나 신비한 분위기 사운드는 제외 — 힐링되는 자연만.
 */

interface Variant {
  name: string;
  file: string;
}

interface NatureItem {
  id: string;
  label: string;
  tag: string;
  icon: LucideIcon;
  variants: Variant[];
}

const NATURE: NatureItem[] = [
  {
    id: "waterfall", label: "폭포", tag: "Pink Noise · Dopamine ↑",
    icon: Droplets,
    variants: [
      { name: "안정적인 폭포 (멀리서)", file: "/sounds/ES_Water, Waterfall, Steady, Perspective - Epidemic Sound.mp3" },
      { name: "중간 세기 폭포", file: "/sounds/ES_Water, Waterfall, Waterfall, Medium Flow 01 - Epidemic Sound.mp3" },
      { name: "작고 긴 폭포", file: "/sounds/ES_Water, Waterfall, Small, Long Fall, Flowing, Trickle - Epidemic Sound.mp3" },
      { name: "강 끝의 먼 폭포", file: "/sounds/ES_Water, Flow, River, Small, Distant Waterfall 02 - Epidemic Sound.mp3" },
      { name: "거친 강물 흐름", file: "/sounds/ES_Water, Turbulent, River, Medium Size, Close 01 - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "rain", label: "빗소리", tag: "Pink Noise · Melatonin · 수면",
    icon: CloudRain,
    variants: [
      { name: "열대 잎새 빗방울", file: "/sounds/ES_Rain, Vegetation, Medium Leaves, Drop, Tropical, Jungle - Epidemic Sound.mp3" },
      { name: "낮의 거센 빗줄기", file: "/sounds/ES_Rain, Vegetation, Rain, Daytime, Incoming Hard Rain, Baratang Island - Epidemic Sound.mp3" },
      { name: "오후의 강한 비", file: "/sounds/ES_Rain, Vegetation, Rain, Afternoon, Strong Rain, Baratang Island 02 - Epidemic Sound.mp3" },
      { name: "오후 잔잔한 비와 새소리", file: "/sounds/ES_Rain, Vegetation, Rain, Afternoon, Gentle Rain, Birds, Baratang Island 02 - Epidemic Sound.mp3" },
      { name: "한낮 빗줄기 1", file: "/sounds/ES_Rain, Vegetation, Rain, Daytime, Mid To Hard Rainfall, Havelock Island, Second 01 - Epidemic Sound.mp3" },
      { name: "한낮 빗줄기 2", file: "/sounds/ES_Rain, Vegetation, Rain, Daytime, Mid To Hard Rainfall, Havelock Island, Second 02 - Epidemic Sound.mp3" },
      { name: "야자 잎에 떨어지는 비", file: "/sounds/ES_Rain, Vegetation, Rain, Daytime, Rain Drops Hitting Hard Palm Leaves, Havelock Island 02 - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "ocean", label: "바다 파도", tag: "0.5Hz · Oxytocin · HRV ↑",
    icon: Waves,
    variants: [
      { name: "고요한 바위 위 잔파도", file: "/sounds/ES_Water, Lap, Gentle, On Rocks, Quiet, Peaceful, Calm Waves - Epidemic Sound.mp3" },
      { name: "바위에 부서지는 잔파도", file: "/sounds/ES_Water, Lap, Gentle Waves, Splashing Against Rocks, Calm, Light Water Fizz - Epidemic Sound.mp3" },
      { name: "호수의 잔물결", file: "/sounds/ES_Water, Lap, Lake, Small Waves Lapping, Detailed, 1m, Loop 01 - Epidemic Sound.mp3" },
      { name: "호수의 밝은 물결 (가까이)", file: "/sounds/ES_Water, Lap, Waves, Lake, Small, Bright, Lapping, Close - Epidemic Sound.mp3" },
      { name: "잔잔→강한 작은 파도", file: "/sounds/ES_Water, Lap, Waves, Small, Lapping, Calm To Intense 02 - Epidemic Sound.mp3" },
      { name: "해변의 작은 파도", file: "/sounds/ES_Water, Wave, Ocean, Beach Waves, Small, Lapping - Epidemic Sound.mp3" },
      { name: "넓은 바다의 중간 파도", file: "/sounds/ES_Water, Wave, Ocean, Medium Waves, Wind - Epidemic Sound.mp3" },
      { name: "잔잔한 작은 파도 움직임", file: "/sounds/ES_Water, Wave, Small Waves, Movements - Epidemic Sound.mp3" },
      { name: "맹그로브 해안", file: "/sounds/ES_Water, Wave, Seaside, Waves, Inside, Mangroves, South Andaman - Epidemic Sound.mp3" },
      { name: "다층의 파도", file: "/sounds/ES_Water, Wave, Small Waves Close, Bigger Distant Waves, 5 Meters From Ocean, Halmstad, Sweden - Epidemic Sound.mp3" },
      { name: "바위를 쓸고 가는 파도", file: "/sounds/ES_Water, Wave, Waves Sweeping Over Rocks, Calm, Lapping, Scandinavian Archipelago - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "stream", label: "시냇물", tag: "Alpha · Serotonin · 이완",
    icon: Waves,
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
    id: "bird", label: "새소리", tag: "Phytoncide · Cortisol −50%",
    icon: Bird,
    variants: [
      { name: "여름 침엽수 숲의 새들", file: "/sounds/ES_Ambience, Birdsong, Chaffinch, Blackbird, Black Woodpecker, Coniferous Forest, Summer, Afternoon - Epidemic Sound.mp3" },
      { name: "새벽 열대우림", file: "/sounds/ES_Birds, Songbird, Rainforest, Dawn, Pied, Imperial, Pigeon, Ambience, Havelock Island - Epidemic Sound.mp3" },
      { name: "오후 열대우림의 새와 곤충", file: "/sounds/ES_Birds, Tropical, Rainforest, Afternoon, Singing Bird, Insects, Little Andaman 02 - Epidemic Sound.mp3" },
      { name: "아침의 풍부한 새소리", file: "/sounds/ES_Birds, Tropical, Rainforest, Morning, Rich, Bird, Drongo, Baratang Island 01 - Epidemic Sound.mp3" },
      { name: "아침 매미와 새소리", file: "/sounds/ES_Birds, Tropical, Rainforest, Morning, Cicadas, Singing Bird, Little Andaman 01 - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "forest", label: "숲속", tag: "Forest Bathing · GABA · Cortisol −15%",
    icon: Trees,
    variants: [
      { name: "약한 비와 바람 부는 숲", file: "/sounds/ES_Ambience, Forest, Birds Chirping, Light Rain, Light Wind - Epidemic Sound.mp3" },
      { name: "노래하는 숲의 새", file: "/sounds/ES_Ambience, Forest, Singing Birds, Distant Traffic - Epidemic Sound.mp3" },
      { name: "낮 바람에 삐걱이는 나무", file: "/sounds/ES_Ambience, Forest, Wind, Daytime, Creaking Tree In Wind, Little Andaman - Epidemic Sound.mp3" },
      { name: "해안 숲의 낮바람", file: "/sounds/ES_Ambience, Forest, Day, Wind In Trees, Birds Chirping, Calm, Baltic - Epidemic Sound.mp3" },
      { name: "이른 아침의 숲", file: "/sounds/ES_Ambience, Forest, Ukraine, Morning, Birds, Nature, Trees, Calm, Breeze, Wildlife - Epidemic Sound.mp3" },
      { name: "약한 비 내리는 열대 숲", file: "/sounds/ES_Ambience, Tropical, Slightly Raining, Forest - Epidemic Sound.mp3" },
      { name: "산속 숲, 멀고 가까운 강", file: "/sounds/ES_Ambience, Rural, Mountain Forest, Distant & Close River, Water Flow, Light Wind, Calm - Epidemic Sound.mp3" },
      { name: "산의 고요, 먼 강물 소리", file: "/sounds/ES_Ambience, Rural, Mountain, Quiet, Distant River, Light Wind, Calm - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "meadow", label: "풀밭", tag: "Serotonin ↑ · Alpha · Sunlight",
    icon: Sun,
    variants: [
      { name: "여름 풀밭의 새와 잎사귀", file: "/sounds/ES_Ambience, Birdsong, Meadow, Summer, Birds Sing, Wind, Light Rustle In Trees - Epidemic Sound.mp3" },
      { name: "풀밭의 가까운 새와 곤충", file: "/sounds/ES_Ambience, Grassland, Bird Chirping Close, Insects, Flies 02 - Epidemic Sound.mp3" },
      { name: "작은 마을의 풀밭", file: "/sounds/ES_Ambience, Grassland, Field, Outisde Small City, Fribourg, Switzerland - Epidemic Sound.mp3" },
      { name: "들판의 말과 곤충", file: "/sounds/ES_Ambience, Rural, Countryside, Field, Horses Eating Grass, Insects, Distant Loud Traffic, Cotui, Dominican Republic - Epidemic Sound.mp3" },
      { name: "봄날의 자연공원", file: "/sounds/ES_Ambience, Rural, Spring Day, Italy, Nature Park, Birds, High Activity 02 - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "wind", label: "바람", tag: "Pink Noise · GABA · Masking",
    icon: Wind,
    variants: [
      { name: "겨울 활엽수 사이 바람", file: "/sounds/ES_Wind, Vegetation, Blowing Through Deciduous Trees, Leaves Rustling, Moderate Intensity, Winter, Afternoon - Epidemic Sound.mp3" },
      { name: "눈과 잎사귀 사이 휘파람 바람", file: "/sounds/ES_Wind, General, Gusts, Snow, Leaves, Howling - Epidemic Sound.mp3" },
      { name: "눈바람의 휘몰아침", file: "/sounds/ES_Wind, General, Gusts, Snow, Rustling, Howling 01 - Epidemic Sound.mp3" },
      { name: "극지 눈보라", file: "/sounds/ES_Wind, Gust, Designed, Polar, Snow Storm 05 - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "cave", label: "동굴", tag: "Delta · ASMR · 물방울",
    icon: Mountain,
    variants: [
      { name: "동굴의 물방울 1", file: "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 02 - Epidemic Sound.mp3" },
      { name: "동굴의 물방울 2", file: "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 03 - Epidemic Sound.mp3" },
      { name: "깊은 동굴의 물방울", file: "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 06 - Epidemic Sound.mp3" },
      { name: "동굴 강물과 바람구멍", file: "/sounds/ES_Ambience, Underground, Cave, Water, River, Wind Hole - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "fire", label: "모닥불", tag: "60Hz · Oxytocin · Serotonin",
    icon: Flame,
    variants: [
      { name: "타닥거리는 모닥불", file: "/sounds/ES_Fire, Burning, Bonfire, Moderate Size, Close, Crackling - Epidemic Sound.mp3" },
      { name: "잔잔한 장작 모닥불", file: "/sounds/ES_Fire, Burning, Burning Wood, Bonfire, Crispy, Soft Intensity, Loop - Epidemic Sound.mp3" },
      { name: "중간 세기의 장작불", file: "/sounds/ES_Fire, Burning, Wood, Crispy, Medium Intensity - Epidemic Sound.mp3" },
      { name: "유리벽 안 장작불", file: "/sounds/ES_Fire, Burning, Fireplace, Glass Walls, Wood Burning Calm, Close Up - Epidemic Sound.mp3" },
      { name: "해변 야외 모닥불 + 갈매기", file: "/sounds/ES_Fire, Burning, Fireplace, Outdoor, Seaside, Plank Firewood Burning Medium, Heavy Crackling, Seagulls, Birds In Background - Epidemic Sound.mp3" },
      { name: "사우나의 작은 장작불", file: "/sounds/ES_Fire, Crackle, Fireplace In Sauna, Small, Thin, Bright - Epidemic Sound.mp3" },
      { name: "실내 벽난로 (잔잔)", file: "/sounds/ES_Fire, Crackle, Fireplace, Indoor, Open, Crackling, Transient, Low Intensity - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "night", label: "밤 풀벌레", tag: "Delta · Melatonin · 수면",
    icon: Moon,
    variants: [
      { name: "맑은 밤의 귀뚜라미", file: "/sounds/ES_Ambience, Insect, Cricket, Night, Clean - Epidemic Sound.mp3" },
      { name: "밤 풀밭 귀뚜라미 1", file: "/sounds/ES_Ambience, Insect, Cricket, Night, Meadow, Jungle 01 - Epidemic Sound.mp3" },
      { name: "밤 풀밭 귀뚜라미 2", file: "/sounds/ES_Ambience, Insect, Cricket, Night, Meadow, Jungle 02 - Epidemic Sound.mp3" },
      { name: "열대 강가의 밤", file: "/sounds/ES_Ambience, Tropical, Amazonas, Night Close, River Crickets, Frogs Bird Sometimes - Epidemic Sound.mp3" },
      { name: "신비한 열대의 밤", file: "/sounds/ES_Ambience, Tropical, Mysterious Night, Cricket - Epidemic Sound.mp3" },
      { name: "열대우림의 밤", file: "/sounds/ES_Ambience, Tropical, Rainforest, Night, Insects, Boobook, Middle Jarawa, Edge 02 - Epidemic Sound.mp3" },
      { name: "열대우림 밤 (야행성)", file: "/sounds/ES_Ambience, Tropical, Rainforest, Night, Nocturnal Animals, Bees, Background, Little Andaman 02 - Epidemic Sound.mp3" },
      { name: "밤바다 (멀리 거친 파도)", file: "/sounds/ES_Water, Surf, Seaside, Night, Distant Rough Sea, Crickets, Middle Andaman - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "storm", label: "폭풍우", tag: "Pink Noise · Theta · 깊은수면",
    icon: Zap,
    variants: [
      { name: "산속 천둥번개 1", file: "/sounds/ES_Weather, Storm, Strong, Storm 2, Lightning, High Mountains, Bhaleydhunga, Himalaya 04 - Epidemic Sound.mp3" },
      { name: "산속 천둥번개 2", file: "/sounds/ES_Weather, Storm, Strong, Storm 2, Lightning, High Mountains, Bhaleydhunga, Himalaya 01 - Epidemic Sound.mp3" },
      { name: "산속 천둥번개 3", file: "/sounds/ES_Weather, Storm, Strong, Storm 2, Lightning, High Mountains, Bhaleydhunga, Himalaya 03 - Epidemic Sound.mp3" },
      { name: "강한 산속 폭풍 1", file: "/sounds/ES_Weather, Storm, Strong, Storm 3, Lightning, High Mountains, Bhaleydhunga, Himalaya 01 - Epidemic Sound.mp3" },
      { name: "강한 산속 폭풍 2", file: "/sounds/ES_Weather, Storm, Strong, Storm 3, Lightning, High Mountains, Bhaleydhunga, Himalaya 03 - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "cafe", label: "카페", tag: "Brown Noise · Dopamine · 집중",
    icon: Coffee,
    variants: [
      { name: "아늑한 카페", file: "/sounds/ES_Ambience, Restaurant & Bar, Coffee Shop, Spacious, Hum, Coffee Machines, Walla, Vancouver 01 - Epidemic Sound.mp3" },
      { name: "카페 카운터 곁", file: "/sounds/ES_Ambience, Restaurant & Bar, Coffee Shop, Walla, By Counter, Cash Register - Epidemic Sound.mp3" },
    ],
  },
];

interface FreqItem {
  id: string;
  label: string;
  tag: string;
  icon: LucideIcon;
  hz: number;
  type: "tone" | "noise";
  noiseType?: "brown" | "pink" | "white";
}

const FREQUENCIES: FreqItem[] = [
  { id: "brown",  label: "브라운 노이즈", tag: "Delta · Melatonin · 수면",  icon: Music2, hz: 0,   type: "noise", noiseType: "brown" },
  { id: "pink",   label: "핑크 노이즈",   tag: "Theta · Cortisol ↓ · 임상",  icon: Music2, hz: 0,   type: "noise", noiseType: "pink" },
  { id: "white",  label: "화이트 노이즈", tag: "Beta · Dopamine · 집중",     icon: Music2, hz: 0,   type: "noise", noiseType: "white" },
  { id: "432",    label: "432Hz",         tag: "432Hz · HRV ↑ · Healing",   icon: Waves,  hz: 432, type: "tone" },
  { id: "528",    label: "528Hz",         tag: "528Hz · Oxytocin · Love",   icon: Heart,  hz: 528, type: "tone" },
  { id: "40",     label: "40Hz",          tag: "Gamma · Focus · MIT 임상",  icon: Brain,  hz: 40,  type: "tone" },
];

const TIMER_OPTIONS: Array<{ hours: number | null; key: string }> = [
  { hours: null, key: "off" },
  { hours: 0.5, key: "minutes30" },
  { hours: 1,   key: "hour1" },
  { hours: 3,   key: "hour3" },
  { hours: 6,   key: "hour6" },
  { hours: 8,   key: "hour8" },
  { hours: 12,  key: "hour12" },
];

const Music = () => {
  const { t } = useTranslation();
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [versionIdx, setVersionIdx] = useState<Record<string, number>>({});
  const [timerHours, setTimerHours] = useState<number | null>(null);
  const [timerOpen, setTimerOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  // 타일별 볼륨 (0~1). 미설정 시 기본값(자연 0.45 / 노이즈 0.13 / 톤 0.09) 적용.
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [editingVolume, setEditingVolume] = useState<string | null>(null);
  // 실시간 경과 시간 (초) — HH:MM:SS 표시용
  const [elapsedSec, setElapsedSec] = useState(0);
  const startedAt = useRef<number>(0);
  const howlsRef = useRef<Map<string, Howl>>(new Map()); // legacy — adapter 가 대신 관리
  const timerRef = useRef<number | undefined>();

  useEffect(() => {
    return () => {
      audioAdapter.stopAll().catch(() => {});
      audioEngine.stopAll();
      clearMediaSession();
      releaseWakeLock();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  // 활성 시 매초 elapsed 갱신, 비활성 시 0
  useEffect(() => {
    if (activeIds.size === 0) {
      setElapsedSec(0);
      startedAt.current = 0;
      return;
    }
    if (startedAt.current === 0) startedAt.current = Date.now();
    const tick = () => setElapsedSec(Math.round((Date.now() - startedAt.current) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [activeIds.size]);

  const applyTimer = (hours: number | null) => {
    setTimerHours(hours);
    setTimerOpen(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (hours == null) return;
    timerRef.current = window.setTimeout(() => stopAll(), hours * 3600 * 1000);
  };

  /** 탭 동작:
   *  - 비활성 → 1번 변주 재생
   *  - 활성 + 단일 변주 → 정지
   *  - 활성 + 다중 변주 → 다음 변주로 순환
   */
  const handleNatureClick = (item: NatureItem) => {
    const isActive = activeIds.has(item.id);
    const currentIdx = versionIdx[item.id] ?? 0;
    if (!isActive) {
      playFile(item, currentIdx);
      return;
    }
    if (item.variants.length > 1) {
      playFile(item, (currentIdx + 1) % item.variants.length);
    } else {
      stopFile(item.id);
    }
  };

  const playFile = (item: NatureItem, idx: number) => {
    // 재생 전 AudioContext 깨우기 — 전체정지 후 재생 안 되는 버그 방지.
    // (Howler.ctx 가 suspended 상태면 새 Howl 도 못 재생)
    try {
      const Howler = (window as any).Howler;
      if (Howler?.ctx?.state === "suspended") Howler.ctx.resume();
    } catch {}

    const v = item.variants[idx];
    const url = toCdnUrl(v.file);
    setVersionIdx((prev) => ({ ...prev, [item.id]: idx }));
    setActiveIds((prev) => new Set(prev).add(item.id));
    setLoadingIds((prev) => new Set(prev).add(item.id));

    const clearLoading = () => setLoadingIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });

    // audioAdapter — iOS 면 AVAudioPlayer (잠금화면 자동 메타 충돌 0), 웹은 Howler
    audioAdapter.play({
      id: item.id,
      url,
      volume: volumes[item.id] ?? 0.45,
      loop: true,
    }).then(clearLoading).catch(clearLoading);

    // 재생 시간 — 사용자 설정 타이머 (시간) 또는 12시간 기본
    const totalSec = (timerHours ?? 12) * 3600;
    setMediaSession(
      {
        title: `${item.label} · ${v.name}`,
        artist: "Mint Wave · Sound Mix",
        album: item.tag,
        durationSeconds: totalSec,
        elapsedSeconds: 0,
      },
      {
        onPause: () => {
          audioAdapter.pauseAll();
          setMediaSessionPlaying(false);
        },
        onPlay: () => {
          audioAdapter.resumeAll();
          setMediaSessionPlaying(true);
        },
      }
    );
    setMediaSessionPlaying(true);
    requestWakeLock();
  };

  const stopFile = (id: string) => {
    audioAdapter.stop(id).catch(() => {});
    setActiveIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      if (next.size === 0) {
        clearMediaSession();
        releaseWakeLock();
      }
      return next;
    });
  };

  const toggleFreq = (item: FreqItem) => {
    if (activeIds.has(item.id)) {
      audioEngine.stop(item.id);
      setActiveIds((prev) => {
        const n = new Set(prev);
        n.delete(item.id);
        if (n.size === 0) {
          clearMediaSession();
          releaseWakeLock();
        }
        return n;
      });
      return;
    }
    // 노이즈 0.3 / 톤 0.2 — 자연 음악(0.45)과 균형. 사용자 슬라이더 우선.
    if (item.type === "noise" && item.noiseType) {
      audioEngine.playNoise(item.id, item.noiseType, volumes[item.id] ?? 0.3);
    } else {
      audioEngine.playTone(item.id, item.hz, volumes[item.id] ?? 0.2);
    }
    setActiveIds((prev) => new Set(prev).add(item.id));
    setMediaSession(
      {
        title: item.label,
        artist: "Mint Wave · Frequency",
        album: item.tag,
        // 타이머 설정 시에만 시간 표시. 미설정 = 무한 (사용자가 정지 누를 때까지)
        durationSeconds: timerHours != null ? timerHours * 3600 : undefined,
        elapsedSeconds: 0,
      },
      {
        onPause: () => {
          audioAdapter.pauseAll();
          setMediaSessionPlaying(false);
        },
        onPlay: () => {
          audioAdapter.resumeAll();
          setMediaSessionPlaying(true);
        },
      }
    );
    setMediaSessionPlaying(true);
    requestWakeLock();
  };

  /** 활성 트랙 볼륨 변경 — 자연 / 노이즈·톤 양쪽 모두 시도 */
  const updateVolume = (id: string, vol: number) => {
    const v = Math.max(0, Math.min(1, vol));
    setVolumes((prev) => ({ ...prev, [id]: v }));
    audioAdapter.setVolume(id, v).catch(() => {});
    audioEngine.setVolume(id, v);
  };

  const stopAll = () => {
    audioAdapter.stopAll().catch(() => {});
    audioEngine.stopAll();
    setActiveIds(new Set());
    clearMediaSession();
    releaseWakeLock();
  };

  return (
    <div className="px-5 pt-16 pb-8 relative flex-1 flex flex-col gap-2">
      <MonetBackground intensity="medium" />

      <div className="flex items-end justify-between animate-fade-up">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="chip-primary text-[14px] tracking-[0.3em] uppercase font-serif">
              {t("music.label")}
            </p>
            {/* 가이드 버튼 — 어떤 조합이 어떤 효과인지 */}
            <button
              onClick={() => setGuideOpen(true)}
              className="w-7 h-7 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
              aria-label="사운드 믹스 가이드"
            >
              <HelpCircle className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
            </button>
          </div>
          <h1 className="text-[28px] font-bold text-foreground mt-1 leading-tight">
            {t("music.title")}
          </h1>
          <p className="text-[15px] text-foreground/65 mt-1.5">
            {t("music.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimerOpen(true)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition relative",
              timerHours != null
                ? "bg-primary text-primary-foreground"
                : "liquid-card text-foreground/70",
            )}
            aria-label={t("timer.title")}
          >
            <Timer className="w-4 h-4" strokeWidth={2} />
            {timerHours != null && (
              <span className="absolute -bottom-1 -right-1 text-[9px] bg-primary text-primary-foreground rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-bold border border-background">
                {timerHours < 1 ? "30" : `${timerHours}h`}
              </span>
            )}
          </button>
          <span className="text-sm text-foreground/55 font-medium">
            {t("music.selected", { count: activeIds.size })}
          </span>
        </div>
      </div>

      {activeIds.size > 0 && (
        <div className="mt-3 bg-primary/10 rounded-2xl px-4 py-2.5 flex items-center justify-between animate-fade-up">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-foreground/60 tracking-widest uppercase font-semibold">재생 중</span>
          </div>
          <span className="num-display text-[18px] text-primary tabular-nums leading-none">
            {String(Math.floor(elapsedSec / 3600)).padStart(2, "0")}:
            {String(Math.floor((elapsedSec % 3600) / 60)).padStart(2, "0")}:
            {String(elapsedSec % 60).padStart(2, "0")}
          </span>
        </div>
      )}

      <section className="mt-7">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="section-title">{t("music.nature")}</h2>
          <span className="text-[10px] text-primary/85 font-semibold bg-primary/10 rounded-full px-2.5 py-1">
            {t("music.realRecording")}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {NATURE.map((item) => (
            <NatureTile
              key={item.id}
              item={item}
              active={activeIds.has(item.id)}
              loading={loadingIds.has(item.id)}
              versionIdx={versionIdx[item.id] ?? 0}
              volume={volumes[item.id] ?? 0.45}
              showVolume={editingVolume === item.id}
              onClick={() => handleNatureClick(item)}
              onStop={() => stopFile(item.id)}
              onToggleVolume={() => setEditingVolume(editingVolume === item.id ? null : item.id)}
              onVolumeChange={(v) => updateVolume(item.id, v)}
            />
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="section-title mb-3 px-1">
          {t("music.frequencies")}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {FREQUENCIES.map((item) => {
            const def = item.type === "noise" ? 0.3 : 0.2;
            return (
              <FreqTile
                key={item.id}
                item={item}
                active={activeIds.has(item.id)}
                volume={volumes[item.id] ?? def}
                showVolume={editingVolume === item.id}
                onClick={() => toggleFreq(item)}
                onToggleVolume={() => setEditingVolume(editingVolume === item.id ? null : item.id)}
                onVolumeChange={(v) => updateVolume(item.id, v)}
              />
            );
          })}
        </div>
      </section>

      {activeIds.size > 0 && (
        <button
          onClick={stopAll}
          className="mt-7 liquid-card w-full py-3.5 text-base font-semibold text-primary"
        >
          {t("music.stopAll")}
        </button>
      )}

      {guideOpen && <MusicGuideSheet onClose={() => setGuideOpen(false)} />}

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
                  key={opt.key}
                  onClick={() => applyTimer(opt.hours)}
                  className={cn(
                    "w-full px-4 py-3 rounded-2xl text-left transition flex items-center justify-between",
                    timerHours === opt.hours
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground/5 text-foreground/85 hover:bg-foreground/10",
                  )}
                >
                  <span className="font-semibold">{t(`timer.${opt.key}`)}</span>
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

interface NatureTileProps {
  item: NatureItem;
  active: boolean;
  loading?: boolean;
  versionIdx: number;
  volume: number;
  showVolume: boolean;
  onClick: () => void;
  onStop: () => void;
  onToggleVolume: () => void;
  onVolumeChange: (v: number) => void;
}

const NatureTile = ({ item, active, loading, versionIdx, volume, showVolume, onClick, onStop, onToggleVolume, onVolumeChange }: NatureTileProps) => {
  const { t } = useTranslation();
  const Icon = item.icon;
  const hasMultiple = item.variants.length > 1;
  const currentName = item.variants[versionIdx]?.name;
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={cn(
          "liquid-card w-full aspect-[0.95] p-3 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95",
          active && "ring-2 ring-primary shadow-[0_0_24px_-4px_hsl(var(--primary)/0.55)]",
          loading && "animate-pulse"
        )}
      >
        <div className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center relative",
          active ? "bg-primary text-primary-foreground" : "text-primary"
        )}>
          <Icon className="w-5 h-5" strokeWidth={active ? 1.9 : 1.7} />
          {loading && (
            <span className="absolute inset-0 rounded-2xl border-2 border-primary border-t-transparent animate-spin" />
          )}
        </div>
        <span className="text-[14px] font-bold text-foreground text-center leading-tight">
          {t(`music.categories.${item.id}`, { defaultValue: item.label })}
        </span>
        <span className="text-[12px] text-primary font-semibold tracking-wide text-center leading-tight line-clamp-1">
          {t(`music.tags.${item.id}`, { defaultValue: item.tag })}
        </span>
        {hasMultiple && (
          <span className="text-[10px] text-foreground/60 line-clamp-1 max-w-full px-1">
            {active ? `${versionIdx + 1}/${item.variants.length} · ${currentName}` : t("music.kinds", { count: item.variants.length })}
          </span>
        )}
      </button>
      {active && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onStop(); }}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-foreground/75 text-background flex items-center justify-center hover:bg-foreground"
            aria-label={t("common.stop")}
          >
            <Pause className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleVolume(); }}
            className={cn(
              "absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center",
              showVolume ? "bg-primary text-primary-foreground" : "bg-foreground/30 text-background hover:bg-foreground/60",
            )}
            aria-label="볼륨"
          >
            <Volume2 className="w-3 h-3" />
          </button>
          {showVolume && (
            <VolumeSlider value={volume} onChange={onVolumeChange} />
          )}
        </>
      )}
    </div>
  );
};

const VolumeSlider = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div
    className="absolute -bottom-2 left-1.5 right-1.5 z-10"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="liquid-card p-2 flex items-center gap-2">
      <Volume2 className="w-3 h-3 text-foreground/55 shrink-0" />
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full h-1 accent-primary cursor-pointer"
      />
      <span className="text-[9px] text-foreground/55 font-mono w-7 text-right shrink-0">
        {Math.round(value * 100)}
      </span>
    </div>
  </div>
);

interface FreqTileProps {
  item: FreqItem;
  active: boolean;
  volume: number;
  showVolume: boolean;
  onClick: () => void;
  onToggleVolume: () => void;
  onVolumeChange: (v: number) => void;
}

const FreqTile = ({ item, active, volume, showVolume, onClick, onToggleVolume, onVolumeChange }: FreqTileProps) => {
  const { t } = useTranslation();
  const Icon = item.icon;
  // 노이즈 종류는 번역, 톤 (432Hz 등)은 그대로
  const labelKey = item.id === "brown" || item.id === "pink" || item.id === "white"
    ? `music.freqs.${item.id}` : "";
  const label = labelKey ? t(labelKey, { defaultValue: item.label }) : item.label;
  return (
    <div className="relative">
    <button
      onClick={onClick}
      className={cn(
        "liquid-card w-full aspect-[0.95] p-3 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95",
        active && "ring-2 ring-primary shadow-[0_0_24px_-4px_hsl(var(--primary)/0.55)]"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center",
        active ? "bg-primary text-primary-foreground" : "text-primary"
      )}>
        {active ? <Pause className="w-5 h-5" /> : <Icon className="w-5 h-5" strokeWidth={1.7} />}
      </div>
      <span className="text-[14px] font-bold text-foreground text-center leading-tight">
        {label}
      </span>
      <span className="text-[12px] text-primary font-semibold tracking-wide text-center leading-tight">
        {t(`music.tags.${item.id}`, { defaultValue: item.tag })}
      </span>
    </button>
    {active && (
      <>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVolume(); }}
          className={cn(
            "absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center",
            showVolume ? "bg-primary text-primary-foreground" : "bg-foreground/30 text-background hover:bg-foreground/60",
          )}
          aria-label="볼륨"
        >
          <Volume2 className="w-3 h-3" />
        </button>
        {showVolume && <VolumeSlider value={volume} onChange={onVolumeChange} />}
      </>
    )}
    </div>
  );
};

export default Music;
