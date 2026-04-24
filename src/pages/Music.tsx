import { useEffect, useRef, useState } from "react";
import {
  CloudRain, Waves, Trees, Mountain, Wind, Bird, Flame, Moon,
  Droplets, Sun, Music2, Heart, Brain, Coffee, BookOpen, Keyboard,
  Pause, ChevronDown, Zap,
} from "lucide-react";
import { Howl } from "howler";
import { MonetBackground } from "@/components/MonetBackground";
import { audioEngine } from "@/lib/audio-engine";
import { toCdnUrl } from "@/lib/situation-tracks";
import { cn } from "@/lib/utils";

/**
 * Music — 사운드 믹스.
 * 정확한 카테고리 매핑 + 각 카테고리에 여러 버전.
 * 재생 중 같은 타일 다시 누르면 다음 버전으로 순환.
 */

interface NatureItem {
  id: string;
  label: string;
  tag: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  /** 카테고리 내 여러 버전 (순환 재생) */
  files: string[];
}

const NATURE: NatureItem[] = [
  {
    id: "waterfall", label: "폭포", tag: "Pink Noise · 집중",
    icon: Droplets,
    files: [
      "/sounds/ES_Water, Waterfall, Small, Long Fall, Flowing, Trickle - Epidemic Sound.mp3",
      "/sounds/ES_Water, Waterfall, Steady, Perspective - Epidemic Sound.mp3",
      "/sounds/ES_Water, Waterfall, Top, Deep, Water Flowing Before Falling - Epidemic Sound.mp3",
      "/sounds/ES_Water, Waterfall, Waterfall, Medium Flow 01 - Epidemic Sound.mp3",
    ],
  },
  {
    id: "rain", label: "빗소리", tag: "Pink Noise · 수면 +23%",
    icon: CloudRain,
    files: [
      "/sounds/ES_Rain, Vegetation, Medium Leaves, Drop, Tropical, Jungle - Epidemic Sound.mp3",
      "/sounds/ES_Rain, Vegetation, Rain, Daytime, Incoming Hard Rain, Baratang Island - Epidemic Sound.mp3",
    ],
  },
  {
    id: "ocean", label: "바다 파도", tag: "1Hz Breath · HRV",
    icon: Waves,
    files: [
      "/sounds/ES_Water, Lap, Gentle, On Rocks, Quiet, Peaceful, Calm Waves - Epidemic Sound.mp3",
      "/sounds/ES_Water, Lap, Gentle Waves, Splashing Against Rocks, Calm, Light Water Fizz - Epidemic Sound.mp3",
      "/sounds/ES_Water, Lap, Lake, Small Waves Lapping, Detailed, 1m, Loop 01 - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Ocean, Beach Waves, Small, Lapping - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Seaside, Waves, Inside, Mangroves, South Andaman - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Small Waves Close, Bigger Distant Waves, 5 Meters From Ocean, Halmstad, Sweden - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Waves Sweeping Over Rocks, Calm, Lapping, Scandinavian Archipelago - Epidemic Sound.mp3",
    ],
  },
  {
    id: "stream", label: "시냇물", tag: "Alpha · 이완",
    icon: Waves,
    files: [
      "/sounds/ES_Water, Flow, Creek, Light, Flowing, Foam Details, Calm Forest 01 - Epidemic Sound.mp3",
      "/sounds/ES_Water, Flow, River, Small, Soft, Burbling Between Stones - Epidemic Sound.mp3",
      "/sounds/ES_Water, Movement, Small River, Continuous, Calm, Happy, Steady Stream 01 Schoeps (MS) - Epidemic Sound.mp3",
    ],
  },
  {
    id: "bird", label: "새소리", tag: "Stress −50% · 산림치유",
    icon: Bird,
    files: [
      "/sounds/ES_Ambience, Birdsong, Chaffinch, Blackbird, Black Woodpecker, Coniferous Forest, Summer, Afternoon - Epidemic Sound.mp3",
      "/sounds/ES_Birds, Songbird, Rainforest, Dawn, Pied, Imperial, Pigeon, Ambience, Havelock Island - Epidemic Sound.mp3",
      "/sounds/ES_Birds, Tropical, Rainforest, Afternoon, Singing Bird, Insects, Little Andaman 02 - Epidemic Sound.mp3",
      "/sounds/ES_Birds, Tropical, Rainforest, Morning, Rich, Bird, Drongo, Baratang Island 01 - Epidemic Sound.mp3",
    ],
  },
  {
    id: "forest", label: "숲속", tag: "Forest Bathing · Cortisol",
    icon: Trees,
    files: [
      "/sounds/ES_Ambience, Forest, Birds Chirping, Light Rain, Light Wind - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Forest, Singing Birds, Distant Traffic - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Forest, Wind, Daytime, Creaking Tree In Wind, Little Andaman - Epidemic Sound.mp3",
    ],
  },
  {
    id: "meadow", label: "풀밭", tag: "Serotonin · Alpha",
    icon: Sun,
    files: [
      "/sounds/ES_Ambience, Birdsong, Meadow, Summer, Birds Sing, Wind, Light Rustle In Trees - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Grassland, Bird Chirping Close, Insects, Flies 02 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Swamp, Mangroves, Morning, Mangrove Whistler, Middle Andaman - Epidemic Sound.mp3",
    ],
  },
  {
    id: "wind", label: "바람 소리", tag: "Masking · 이완",
    icon: Wind,
    files: [
      "/sounds/ES_Wind, Vegetation, Blowing Through Deciduous Trees, Leaves Rustling, Moderate Intensity, Winter, Afternoon - Epidemic Sound.mp3",
      "/sounds/ES_Wind, Vegetation, Blowing Through Defoliated Deciduous Trees, Moderate Intensity, Crow Flying By, Winter, Evening - Epidemic Sound.mp3",
      "/sounds/ES_Wind, Gust, Mountain Wind, Very Strong, Cold Wind, Heavy Gusts, Jotunheimen, Norway 01 - Epidemic Sound.mp3",
    ],
  },
  {
    id: "cave", label: "동굴 울림", tag: "Deep Reverb · Theta",
    icon: Mountain,
    files: [
      "/sounds/ES_Ambience, Underground, Cave, Magic, Deep, Bubbling - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Underground, Cave, Magic, Deep, Wind, Howling 02 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 02 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 03 - Epidemic Sound.mp3",
    ],
  },
  {
    id: "fire", label: "모닥불", tag: "저주파 · 세로토닌",
    icon: Flame,
    files: [
      "/sounds/ES_Fire, Burning, Bonfire, Moderate Size, Close, Crackling - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Burning Wood, Bonfire, Crispy, Soft Intensity, Loop - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Wood, Crispy, Medium Intensity - Epidemic Sound.mp3",
    ],
  },
  {
    id: "night", label: "밤 풀벌레", tag: "Delta 유도 · 수면",
    icon: Moon,
    files: [
      "/sounds/ES_Ambience, Insect, Cricket, Night, Clean - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Insect, Cricket, Night, Meadow, Jungle 01 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Insect, Cricket, Night, Meadow, Jungle 02 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Tropical, Amazonas, Night Close, River Crickets, Frogs Bird Sometimes - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Tropical, Mysterious Night, Cricket - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Tropical, Rainforest, Night, Insects, Boobook, Middle Jarawa, Edge 02 - Epidemic Sound.mp3",
    ],
  },
  {
    id: "storm", label: "폭풍우", tag: "Pink Noise · 수면",
    icon: Zap,
    files: [
      "/sounds/ES_Weather, Storm, Snow Storm, Cold, Freezing, Heavy Wind, Whistling - Epidemic Sound.mp3",
      "/sounds/ES_Weather, Storm, Strong, Storm 2, Lightning, High Mountains, Bhaleydhunga, Himalaya 04 - Epidemic Sound.mp3",
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
  // 재생 중인 카테고리 id → 현재 버전 idx
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [versionIdx, setVersionIdx] = useState<Record<string, number>>({});
  const howlsRef = useRef<Map<string, Howl>>(new Map());

  useEffect(() => {
    return () => {
      howlsRef.current.forEach((h) => { h.stop(); h.unload(); });
      howlsRef.current.clear();
      audioEngine.stopAll();
    };
  }, []);

  /** 자연/ASMR 타일 클릭 */
  const handleNatureClick = (item: NatureItem) => {
    const isActive = activeIds.has(item.id);
    const currentIdx = versionIdx[item.id] ?? 0;

    if (!isActive) {
      // 새로 재생
      playFile(item, currentIdx);
    } else {
      // 재생 중 → 다음 버전으로 순환
      const nextIdx = (currentIdx + 1) % item.files.length;
      if (item.files.length > 1) {
        playFile(item, nextIdx);
      } else {
        stopFile(item.id);
      }
    }
  };

  const playFile = (item: NatureItem, idx: number) => {
    const existing = howlsRef.current.get(item.id);
    if (existing) {
      existing.stop();
      existing.unload();
    }
    const url = toCdnUrl(item.files[idx]);
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
  };

  const stopFile = (id: string) => {
    const howl = howlsRef.current.get(id);
    howl?.stop();
    howl?.unload();
    howlsRef.current.delete(id);
    setActiveIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleFreq = (item: FreqItem) => {
    if (activeIds.has(item.id)) {
      audioEngine.stop(item.id);
      setActiveIds((prev) => { const n = new Set(prev); n.delete(item.id); return n; });
      return;
    }
    if (item.type === "noise" && item.noiseType) {
      audioEngine.playNoise(item.id, item.noiseType, 0.15);
    } else {
      audioEngine.playTone(item.id, item.hz, 0.12);
    }
    setActiveIds((prev) => new Set(prev).add(item.id));
  };

  const stopAll = () => {
    howlsRef.current.forEach((h) => { h.stop(); h.unload(); });
    howlsRef.current.clear();
    audioEngine.stopAll();
    setActiveIds(new Set());
  };

  return (
    <div className="px-5 pt-12 pb-6 relative flex-1 flex flex-col">
      <MonetBackground intensity="medium" />

      <div className="flex items-end justify-between animate-fade-up">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-primary font-serif">
            Sound Mix
          </p>
          <h1 className="text-[26px] font-bold text-foreground mt-1 leading-tight">
            사운드 믹스
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            동시 재생 가능 · 같은 타일 다시 누르면 다른 버전
          </p>
        </div>
        <span className="text-xs text-foreground/55 font-medium">
          {activeIds.size}개 선택됨
        </span>
      </div>

      <section className="mt-7">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary/80 font-serif mb-3 px-1">
          자연
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
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
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary/80 font-serif mb-3 px-1">
          주파수
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
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
          className="mt-7 liquid-card w-full py-3 text-sm font-semibold text-primary"
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
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={cn(
          "liquid-card w-full aspect-[1.1] p-2.5 flex flex-col items-center justify-center gap-1 transition-all active:scale-95",
          active && "ring-2 ring-primary shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)]"
        )}
      >
        <div className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center",
          active ? "bg-primary text-primary-foreground" : "text-primary"
        )}>
          {active ? <Icon className="w-4 h-4" strokeWidth={1.8} /> : <Icon className="w-4 h-4" strokeWidth={1.6} />}
        </div>
        <span className="text-[11px] font-semibold text-foreground text-center leading-tight">
          {item.label}
        </span>
        <span className="text-[8.5px] text-primary/70 tracking-wide text-center leading-tight mt-0.5">
          {item.tag}
        </span>
        {item.files.length > 1 && (
          <span className="text-[8px] text-foreground/50 mt-0.5">
            {active ? `${versionIdx + 1}/${item.files.length} · 탭 변경` : `${item.files.length}종`}
          </span>
        )}
      </button>
      {active && (
        <button
          onClick={(e) => { e.stopPropagation(); onStop(); }}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-foreground/70 text-background flex items-center justify-center text-[10px] hover:bg-foreground"
          aria-label="정지"
        >
          <Pause className="w-2.5 h-2.5" />
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
        "liquid-card aspect-[1.1] p-2.5 flex flex-col items-center justify-center gap-1 transition-all active:scale-95",
        active && "ring-2 ring-primary shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)]"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center",
        active ? "bg-primary text-primary-foreground" : "text-primary"
      )}>
        {active ? <Pause className="w-4 h-4" /> : <Icon className="w-4 h-4" strokeWidth={1.6} />}
      </div>
      <span className="text-[11px] font-semibold text-foreground text-center leading-tight">
        {item.label}
      </span>
      <span className="text-[8.5px] text-primary/70 tracking-wide text-center leading-tight mt-0.5">
        {item.tag}
      </span>
    </button>
  );
};

export default Music;
