import { useEffect, useRef, useState } from "react";
import {
  CloudRain, Waves, Trees, Mountain, Wind, Bird, Flame, Moon,
  Droplets, Sun, Music2, Heart, Brain,
  Coffee, Pause, Zap,
} from "lucide-react";
import { Howl } from "howler";
import { MonetBackground } from "@/components/MonetBackground";
import { audioEngine } from "@/lib/audio-engine";
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
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  variants: Variant[];
}

const NATURE: NatureItem[] = [
  {
    id: "waterfall", label: "폭포", tag: "Pink Noise · 집중",
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
    id: "rain", label: "빗소리", tag: "Pink Noise · 수면 +23%",
    icon: CloudRain,
    variants: [
      { name: "잎새 위 빗방울 (열대)", file: "/sounds/ES_Rain, Vegetation, Medium Leaves, Drop, Tropical, Jungle - Epidemic Sound.mp3" },
      { name: "낮의 거센 빗줄기", file: "/sounds/ES_Rain, Vegetation, Rain, Daytime, Incoming Hard Rain, Baratang Island - Epidemic Sound.mp3" },
      { name: "오후 강한 비", file: "/sounds/ES_Rain, Vegetation, Rain, Afternoon, Strong Rain, Baratang Island 02 - Epidemic Sound.mp3" },
      { name: "오후 잔잔한 비와 새소리", file: "/sounds/ES_Rain, Vegetation, Rain, Afternoon, Gentle Rain, Birds, Baratang Island 02 - Epidemic Sound.mp3" },
      { name: "낮 중간 빗줄기 1", file: "/sounds/ES_Rain, Vegetation, Rain, Daytime, Mid To Hard Rainfall, Havelock Island, Second 01 - Epidemic Sound.mp3" },
      { name: "낮 중간 빗줄기 2", file: "/sounds/ES_Rain, Vegetation, Rain, Daytime, Mid To Hard Rainfall, Havelock Island, Second 02 - Epidemic Sound.mp3" },
      { name: "야자 잎에 떨어지는 비", file: "/sounds/ES_Rain, Vegetation, Rain, Daytime, Rain Drops Hitting Hard Palm Leaves, Havelock Island 02 - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "ocean", label: "바다 파도", tag: "1Hz Breath · HRV",
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
      { name: "망그로브 해안", file: "/sounds/ES_Water, Wave, Seaside, Waves, Inside, Mangroves, South Andaman - Epidemic Sound.mp3" },
      { name: "가깝고 먼 파도 (스웨덴)", file: "/sounds/ES_Water, Wave, Small Waves Close, Bigger Distant Waves, 5 Meters From Ocean, Halmstad, Sweden - Epidemic Sound.mp3" },
      { name: "바위를 쓸고 가는 파도", file: "/sounds/ES_Water, Wave, Waves Sweeping Over Rocks, Calm, Lapping, Scandinavian Archipelago - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "stream", label: "시냇물", tag: "Alpha · 이완",
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
    id: "bird", label: "새소리", tag: "Stress −50% · 산림치유",
    icon: Bird,
    variants: [
      { name: "여름 침엽수 숲의 새들", file: "/sounds/ES_Ambience, Birdsong, Chaffinch, Blackbird, Black Woodpecker, Coniferous Forest, Summer, Afternoon - Epidemic Sound.mp3" },
      { name: "새벽 열대우림 (하벨록)", file: "/sounds/ES_Birds, Songbird, Rainforest, Dawn, Pied, Imperial, Pigeon, Ambience, Havelock Island - Epidemic Sound.mp3" },
      { name: "오후 열대우림의 새와 곤충", file: "/sounds/ES_Birds, Tropical, Rainforest, Afternoon, Singing Bird, Insects, Little Andaman 02 - Epidemic Sound.mp3" },
      { name: "아침의 풍부한 새소리 (Drongo)", file: "/sounds/ES_Birds, Tropical, Rainforest, Morning, Rich, Bird, Drongo, Baratang Island 01 - Epidemic Sound.mp3" },
      { name: "아침 매미와 새소리", file: "/sounds/ES_Birds, Tropical, Rainforest, Morning, Cicadas, Singing Bird, Little Andaman 01 - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "forest", label: "숲속", tag: "Forest Bathing · Cortisol",
    icon: Trees,
    variants: [
      { name: "약한 비와 바람 부는 숲", file: "/sounds/ES_Ambience, Forest, Birds Chirping, Light Rain, Light Wind - Epidemic Sound.mp3" },
      { name: "노래하는 숲의 새 (멀리 도시)", file: "/sounds/ES_Ambience, Forest, Singing Birds, Distant Traffic - Epidemic Sound.mp3" },
      { name: "낮 바람에 삐걱이는 나무", file: "/sounds/ES_Ambience, Forest, Wind, Daytime, Creaking Tree In Wind, Little Andaman - Epidemic Sound.mp3" },
      { name: "발트 해안 숲 낮바람", file: "/sounds/ES_Ambience, Forest, Day, Wind In Trees, Birds Chirping, Calm, Baltic - Epidemic Sound.mp3" },
      { name: "우크라이나 숲 아침", file: "/sounds/ES_Ambience, Forest, Ukraine, Morning, Birds, Nature, Trees, Calm, Breeze, Wildlife - Epidemic Sound.mp3" },
      { name: "약한 비 내리는 열대 숲", file: "/sounds/ES_Ambience, Tropical, Slightly Raining, Forest - Epidemic Sound.mp3" },
      { name: "산속 숲, 멀고 가까운 강", file: "/sounds/ES_Ambience, Rural, Mountain Forest, Distant & Close River, Water Flow, Light Wind, Calm - Epidemic Sound.mp3" },
      { name: "산의 고요, 먼 강물 소리", file: "/sounds/ES_Ambience, Rural, Mountain, Quiet, Distant River, Light Wind, Calm - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "meadow", label: "풀밭", tag: "Serotonin · Alpha",
    icon: Sun,
    variants: [
      { name: "여름 풀밭의 새와 잎사귀", file: "/sounds/ES_Ambience, Birdsong, Meadow, Summer, Birds Sing, Wind, Light Rustle In Trees - Epidemic Sound.mp3" },
      { name: "풀밭의 가까운 새와 곤충", file: "/sounds/ES_Ambience, Grassland, Bird Chirping Close, Insects, Flies 02 - Epidemic Sound.mp3" },
      { name: "스위스 작은 마을의 풀밭", file: "/sounds/ES_Ambience, Grassland, Field, Outisde Small City, Fribourg, Switzerland - Epidemic Sound.mp3" },
      { name: "도미니카 시골의 들판", file: "/sounds/ES_Ambience, Rural, Countryside, Field, Horses Eating Grass, Insects, Distant Loud Traffic, Cotui, Dominican Republic - Epidemic Sound.mp3" },
      { name: "이탈리아 봄날의 자연공원", file: "/sounds/ES_Ambience, Rural, Spring Day, Italy, Nature Park, Birds, High Activity 02 - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "wind", label: "바람", tag: "Masking · 이완",
    icon: Wind,
    variants: [
      { name: "겨울 활엽수 사이 바람", file: "/sounds/ES_Wind, Vegetation, Blowing Through Deciduous Trees, Leaves Rustling, Moderate Intensity, Winter, Afternoon - Epidemic Sound.mp3" },
      { name: "눈과 잎사귀 사이 휘파람 바람", file: "/sounds/ES_Wind, General, Gusts, Snow, Leaves, Howling - Epidemic Sound.mp3" },
      { name: "눈바람의 휘몰아침", file: "/sounds/ES_Wind, General, Gusts, Snow, Rustling, Howling 01 - Epidemic Sound.mp3" },
      { name: "극지 눈보라", file: "/sounds/ES_Wind, Gust, Designed, Polar, Snow Storm 05 - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "cave", label: "동굴", tag: "Deep · 물방울",
    icon: Mountain,
    variants: [
      { name: "동굴의 물방울 흐름 02", file: "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 02 - Epidemic Sound.mp3" },
      { name: "동굴의 물방울 흐름 03", file: "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 03 - Epidemic Sound.mp3" },
      { name: "동굴의 깊은 물방울 06", file: "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 06 - Epidemic Sound.mp3" },
      { name: "동굴 강물과 바람구멍", file: "/sounds/ES_Ambience, Underground, Cave, Water, River, Wind Hole - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "fire", label: "모닥불", tag: "저주파 · 세로토닌",
    icon: Flame,
    variants: [
      { name: "타닥거리는 모닥불 (가까이)", file: "/sounds/ES_Fire, Burning, Bonfire, Moderate Size, Close, Crackling - Epidemic Sound.mp3" },
      { name: "잔잔한 장작 모닥불 (Loop)", file: "/sounds/ES_Fire, Burning, Burning Wood, Bonfire, Crispy, Soft Intensity, Loop - Epidemic Sound.mp3" },
      { name: "중간 세기의 장작불", file: "/sounds/ES_Fire, Burning, Wood, Crispy, Medium Intensity - Epidemic Sound.mp3" },
      { name: "유리벽 안 장작불 (가까이)", file: "/sounds/ES_Fire, Burning, Fireplace, Glass Walls, Wood Burning Calm, Close Up - Epidemic Sound.mp3" },
      { name: "해변 야외 모닥불 + 갈매기", file: "/sounds/ES_Fire, Burning, Fireplace, Outdoor, Seaside, Plank Firewood Burning Medium, Heavy Crackling, Seagulls, Birds In Background - Epidemic Sound.mp3" },
      { name: "사우나의 작은 장작불", file: "/sounds/ES_Fire, Crackle, Fireplace In Sauna, Small, Thin, Bright - Epidemic Sound.mp3" },
      { name: "실내 벽난로 (낮은 세기)", file: "/sounds/ES_Fire, Crackle, Fireplace, Indoor, Open, Crackling, Transient, Low Intensity - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "night", label: "밤 풀벌레", tag: "Delta 유도 · 수면",
    icon: Moon,
    variants: [
      { name: "맑은 밤의 귀뚜라미", file: "/sounds/ES_Ambience, Insect, Cricket, Night, Clean - Epidemic Sound.mp3" },
      { name: "밤 풀밭 귀뚜라미 1", file: "/sounds/ES_Ambience, Insect, Cricket, Night, Meadow, Jungle 01 - Epidemic Sound.mp3" },
      { name: "밤 풀밭 귀뚜라미 2", file: "/sounds/ES_Ambience, Insect, Cricket, Night, Meadow, Jungle 02 - Epidemic Sound.mp3" },
      { name: "아마존 강가의 밤", file: "/sounds/ES_Ambience, Tropical, Amazonas, Night Close, River Crickets, Frogs Bird Sometimes - Epidemic Sound.mp3" },
      { name: "신비한 열대의 밤 (귀뚜라미)", file: "/sounds/ES_Ambience, Tropical, Mysterious Night, Cricket - Epidemic Sound.mp3" },
      { name: "열대우림의 밤 (Boobook)", file: "/sounds/ES_Ambience, Tropical, Rainforest, Night, Insects, Boobook, Middle Jarawa, Edge 02 - Epidemic Sound.mp3" },
      { name: "열대우림 밤 (벌·야행성)", file: "/sounds/ES_Ambience, Tropical, Rainforest, Night, Nocturnal Animals, Bees, Background, Little Andaman 02 - Epidemic Sound.mp3" },
      { name: "밤바다 (멀리 거친 파도)", file: "/sounds/ES_Water, Surf, Seaside, Night, Distant Rough Sea, Crickets, Middle Andaman - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "storm", label: "폭풍우", tag: "Pink Noise · 수면",
    icon: Zap,
    variants: [
      { name: "히말라야 천둥번개 04", file: "/sounds/ES_Weather, Storm, Strong, Storm 2, Lightning, High Mountains, Bhaleydhunga, Himalaya 04 - Epidemic Sound.mp3" },
      { name: "히말라야 천둥번개 01", file: "/sounds/ES_Weather, Storm, Strong, Storm 2, Lightning, High Mountains, Bhaleydhunga, Himalaya 01 - Epidemic Sound.mp3" },
      { name: "히말라야 천둥번개 03", file: "/sounds/ES_Weather, Storm, Strong, Storm 2, Lightning, High Mountains, Bhaleydhunga, Himalaya 03 - Epidemic Sound.mp3" },
      { name: "히말라야 강한 폭풍 01", file: "/sounds/ES_Weather, Storm, Strong, Storm 3, Lightning, High Mountains, Bhaleydhunga, Himalaya 01 - Epidemic Sound.mp3" },
      { name: "히말라야 강한 폭풍 03", file: "/sounds/ES_Weather, Storm, Strong, Storm 3, Lightning, High Mountains, Bhaleydhunga, Himalaya 03 - Epidemic Sound.mp3" },
    ],
  },
  {
    id: "cafe", label: "카페", tag: "Background · 집중",
    icon: Coffee,
    variants: [
      { name: "밴쿠버 카페의 아늑함", file: "/sounds/ES_Ambience, Restaurant & Bar, Coffee Shop, Spacious, Hum, Coffee Machines, Walla, Vancouver 01 - Epidemic Sound.mp3" },
      { name: "카페 카운터 곁 (계산대)", file: "/sounds/ES_Ambience, Restaurant & Bar, Coffee Shop, Walla, By Counter, Cash Register - Epidemic Sound.mp3" },
    ],
  },
];

interface FreqItem {
  id: string;
  label: string;
  tag: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  hz: number;
  type: "tone" | "noise";
  noiseType?: "brown" | "pink" | "white";
}

const FREQUENCIES: FreqItem[] = [
  { id: "brown",  label: "브라운 노이즈", tag: "수면·이완 (Delta)",        icon: Music2, hz: 0,   type: "noise", noiseType: "brown" },
  { id: "pink",   label: "핑크 노이즈",   tag: "Northwestern 임상",        icon: Music2, hz: 0,   type: "noise", noiseType: "pink" },
  { id: "white",  label: "화이트 노이즈", tag: "Masking · 집중",           icon: Music2, hz: 0,   type: "noise", noiseType: "white" },
  { id: "432",    label: "432Hz",         tag: "Healing · HRV 개선",       icon: Waves,  hz: 432, type: "tone" },
  { id: "528",    label: "528Hz",         tag: "Love · Oxytocin",          icon: Heart,  hz: 528, type: "tone" },
  { id: "40",     label: "40Hz",          tag: "Gamma · MIT 임상",         icon: Brain,  hz: 40,  type: "tone" },
];

const Music = () => {
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [versionIdx, setVersionIdx] = useState<Record<string, number>>({});
  const howlsRef = useRef<Map<string, Howl>>(new Map());

  useEffect(() => {
    return () => {
      howlsRef.current.forEach((h) => { h.stop(); h.unload(); });
      howlsRef.current.clear();
      audioEngine.stopAll();
      clearMediaSession();
      releaseWakeLock();
    };
  }, []);

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
    const existing = howlsRef.current.get(item.id);
    if (existing) {
      existing.stop();
      existing.unload();
    }
    const v = item.variants[idx];
    const url = toCdnUrl(v.file);
    const howl = new Howl({
      src: [url],
      html5: true,
      loop: true,
      volume: 0.55,
    });
    howl.play();
    howlsRef.current.set(item.id, howl);
    setVersionIdx((prev) => ({ ...prev, [item.id]: idx }));
    setActiveIds((prev) => new Set(prev).add(item.id));

    setMediaSession(
      { title: `${item.label} · ${v.name}`, artist: "MintMoody · Sound Mix", album: item.tag },
      { onPause: () => stopAll() }
    );
    setMediaSessionPlaying(true);
    requestWakeLock();
  };

  const stopFile = (id: string) => {
    const howl = howlsRef.current.get(id);
    howl?.stop();
    howl?.unload();
    howlsRef.current.delete(id);
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
    if (item.type === "noise" && item.noiseType) {
      audioEngine.playNoise(item.id, item.noiseType, 0.15);
    } else {
      audioEngine.playTone(item.id, item.hz, 0.12);
    }
    setActiveIds((prev) => new Set(prev).add(item.id));
    setMediaSession(
      { title: item.label, artist: "MintMoody · Frequency", album: item.tag },
      { onPause: () => stopAll() }
    );
    setMediaSessionPlaying(true);
    requestWakeLock();
  };

  const stopAll = () => {
    howlsRef.current.forEach((h) => { h.stop(); h.unload(); });
    howlsRef.current.clear();
    audioEngine.stopAll();
    setActiveIds(new Set());
    clearMediaSession();
    releaseWakeLock();
  };

  return (
    <div className="px-5 pt-12 pb-6 relative flex-1 flex flex-col">
      <MonetBackground intensity="medium" />

      <div className="flex items-end justify-between animate-fade-up">
        <div>
          <p className="chip-primary text-[14px] tracking-[0.3em] uppercase font-serif">
            Sound Mix
          </p>
          <h1 className="text-[28px] font-bold text-foreground mt-1 leading-tight">
            사운드 믹스
          </h1>
          <p className="text-[15px] text-foreground/65 mt-1.5">
            동시 재생 가능 · 같은 타일 다시 누르면 다른 버전
          </p>
        </div>
        <span className="text-sm text-foreground/55 font-medium">
          {activeIds.size}개
        </span>
      </div>

      <section className="mt-7">
        <h2 className="section-title mb-3 px-1">
          자연
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {NATURE.map((item) => (
            <NatureTile
              key={item.id}
              item={item}
              active={activeIds.has(item.id)}
              versionIdx={versionIdx[item.id] ?? 0}
              onClick={() => handleNatureClick(item)}
              onStop={() => stopFile(item.id)}
            />
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="section-title mb-3 px-1">
          주파수
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {FREQUENCIES.map((item) => (
            <FreqTile
              key={item.id}
              item={item}
              active={activeIds.has(item.id)}
              onClick={() => toggleFreq(item)}
            />
          ))}
        </div>
      </section>

      {activeIds.size > 0 && (
        <button
          onClick={stopAll}
          className="mt-7 liquid-card w-full py-3.5 text-base font-semibold text-primary"
        >
          전체 정지
        </button>
      )}
    </div>
  );
};

interface NatureTileProps {
  item: NatureItem;
  active: boolean;
  versionIdx: number;
  onClick: () => void;
  onStop: () => void;
}

const NatureTile = ({ item, active, versionIdx, onClick, onStop }: NatureTileProps) => {
  const Icon = item.icon;
  const hasMultiple = item.variants.length > 1;
  const currentName = item.variants[versionIdx]?.name;
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
          <Icon className="w-5 h-5" strokeWidth={active ? 1.9 : 1.7} />
        </div>
        <span className="text-[14px] font-bold text-foreground text-center leading-tight">
          {item.label}
        </span>
        <span className="text-[12px] text-primary font-semibold tracking-wide text-center leading-tight line-clamp-1">
          {item.tag}
        </span>
        {hasMultiple && (
          <span className="text-[10px] text-foreground/60 line-clamp-1 max-w-full px-1">
            {active ? `${versionIdx + 1}/${item.variants.length} · ${currentName}` : `${item.variants.length}종 · 탭으로 변경`}
          </span>
        )}
      </button>
      {active && (
        <button
          onClick={(e) => { e.stopPropagation(); onStop(); }}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-foreground/75 text-background flex items-center justify-center hover:bg-foreground"
          aria-label="정지"
        >
          <Pause className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

interface FreqTileProps {
  item: FreqItem;
  active: boolean;
  onClick: () => void;
}

const FreqTile = ({ item, active, onClick }: FreqTileProps) => {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "liquid-card aspect-[0.95] p-3 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95",
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
        {item.label}
      </span>
      <span className="text-[12px] text-primary font-semibold tracking-wide text-center leading-tight">
        {item.tag}
      </span>
    </button>
  );
};

export default Music;
