import { useEffect, useRef, useState } from "react";
import {
  CloudRain, Waves, Trees, Mountain, Wind, Bird, Flame, Moon,
  Droplets, Sun, Music2, Heart, Brain, Coffee, BookOpen, Keyboard,
  Pause,
} from "lucide-react";
import { Howl } from "howler";
import { MonetBackground } from "@/components/MonetBackground";
import { audioEngine } from "@/lib/audio-engine";
import { toCdnUrl } from "@/lib/situation-tracks";
import { cn } from "@/lib/utils";

/**
 * Music — 사운드 믹스 스타일.
 * 여러 사운드 동시 재생 가능. 자연 + 주파수 + ASMR 섹션.
 */

interface NatureItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  file: string;
}

const NATURE: NatureItem[] = [
  { id: "waterfall", label: "폭포",        icon: Droplets,  file: "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 02 - Epidemic Sound.mp3" },
  { id: "rain",      label: "빗소리",      icon: CloudRain, file: "/sounds/ES_Rain, Vegetation, Medium Leaves, Drop, Tropical, Jungle - Epidemic Sound.mp3" },
  { id: "bird",      label: "새소리",      icon: Bird,      file: "/sounds/ES_Ambience, Birdsong, Chaffinch, Blackbird, Black Woodpecker, Coniferous Forest, Summer, Afternoon - Epidemic Sound.mp3" },
  { id: "sun",       label: "따뜻한 햇살",  icon: Sun,       file: "/sounds/ES_Ambience, Birdsong, Meadow, Summer, Birds Sing, Wind, Light Rustle In Trees - Epidemic Sound.mp3" },
  { id: "wind",      label: "바람 소리",   icon: Wind,      file: "/sounds/ES_Wind, Vegetation, Blowing Through Deciduous Trees, Leaves Rustling, Moderate Intensity, Winter, Afternoon - Epidemic Sound.mp3" },
  { id: "cave",      label: "동굴 울림",   icon: Mountain,  file: "/sounds/ES_Ambience, Underground, Cave, Magic, Deep, Wind, Howling 02 - Epidemic Sound.mp3" },
  { id: "ocean",     label: "바다 파도",   icon: Waves,     file: "/sounds/ES_Water, Lap, Gentle, On Rocks, Quiet, Peaceful, Calm Waves - Epidemic Sound.mp3" },
  { id: "forest",    label: "숲속",        icon: Trees,     file: "/sounds/ES_Ambience, Forest, Birds Chirping, Light Rain, Light Wind - Epidemic Sound.mp3" },
  { id: "fire",      label: "모닥불",      icon: Flame,     file: "/sounds/ES_Fire, Burning, Bonfire, Moderate Size, Close, Crackling - Epidemic Sound.mp3" },
  { id: "night",     label: "밤 풀벌레",   icon: Moon,      file: "/sounds/ES_Ambience, Insect, Cricket, Night, Clean - Epidemic Sound.mp3" },
];

interface FreqItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  hz: number;
  type: "tone" | "noise";
  noiseType?: "brown" | "pink" | "white";
}

const FREQUENCIES: FreqItem[] = [
  { id: "brown",  label: "브라운 노이즈", icon: Music2, hz: 0,   type: "noise", noiseType: "brown" },
  { id: "pink",   label: "핑크 노이즈",   icon: Music2, hz: 0,   type: "noise", noiseType: "pink" },
  { id: "white",  label: "화이트 노이즈", icon: Music2, hz: 0,   type: "noise", noiseType: "white" },
  { id: "432",    label: "432Hz 힐링",    icon: Waves,  hz: 432, type: "tone" },
  { id: "528",    label: "528Hz 사랑",    icon: Heart,  hz: 528, type: "tone" },
  { id: "40",     label: "40Hz 감마파",   icon: Brain,  hz: 40,  type: "tone" },
];

interface AsmrItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  file: string;
}

const ASMR: AsmrItem[] = [
  { id: "cafe",   label: "카페 분위기",   icon: Coffee,   file: "/sounds/ES_Fire, Burning, Burning Wood, Bonfire, Crispy, Soft Intensity, Loop - Epidemic Sound.mp3" },
  { id: "page",   label: "페이지 넘기기", icon: BookOpen, file: "/sounds/ES_Human, Breath, Female, Nose Breathing, Inhale, Exhale, Calm 01 - Epidemic Sound.mp3" },
  { id: "typing", label: "타이핑 ASMR",   icon: Keyboard, file: "/sounds/ES_Human, Breath, Breathing Mask, Close, Isolated, Heavy Breathing, Long Inhale & Exhale 01 - Epidemic Sound.mp3" },
];

const Music = () => {
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const howlsRef = useRef<Map<string, Howl>>(new Map());

  useEffect(() => {
    return () => {
      howlsRef.current.forEach((h) => { h.stop(); h.unload(); });
      howlsRef.current.clear();
      audioEngine.stopAll();
    };
  }, []);

  const toggleNature = (item: NatureItem | AsmrItem) => {
    const isActive = activeIds.has(item.id);
    if (isActive) {
      const howl = howlsRef.current.get(item.id);
      howl?.stop();
      howl?.unload();
      howlsRef.current.delete(item.id);
      setActiveIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      return;
    }
    const url = toCdnUrl(item.file);
    const howl = new Howl({
      src: [url],
      html5: true,
      loop: true,
      volume: 0.55,
    });
    howl.play();
    howlsRef.current.set(item.id, howl);
    setActiveIds((prev) => new Set(prev).add(item.id));
  };

  const toggleFreq = (item: FreqItem) => {
    const isActive = activeIds.has(item.id);
    if (isActive) {
      audioEngine.stop(item.id);
      setActiveIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      return;
    }
    if (item.type === "noise" && item.noiseType) {
      audioEngine.playNoise(item.id, item.noiseType, 0.15);
    } else {
      audioEngine.playTone(item.id, item.hz, 0.12);
    }
    setActiveIds((prev) => new Set(prev).add(item.id));
  };

  return (
    <div className="px-5 pt-12 pb-6 relative flex-1 flex flex-col">
      <MonetBackground intensity="medium" />

      {/* Header */}
      <div className="flex items-end justify-between animate-fade-up">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-primary font-serif">
            Sound Mix
          </p>
          <h1 className="text-[26px] font-bold text-foreground mt-1 leading-tight">
            사운드 믹스
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            여러 소리를 동시에 재생할 수 있어요
          </p>
        </div>
        <span className="text-xs text-foreground/55 font-medium">
          {activeIds.size}개 선택됨
        </span>
      </div>

      {/* 자연 */}
      <section className="mt-7">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary/80 font-serif mb-3 px-1">
          자연
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {NATURE.map((item) => (
            <SoundTile
              key={item.id}
              label={item.label}
              icon={item.icon}
              active={activeIds.has(item.id)}
              onClick={() => toggleNature(item)}
            />
          ))}
        </div>
      </section>

      {/* 주파수 */}
      <section className="mt-7">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary/80 font-serif mb-3 px-1">
          주파수
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {FREQUENCIES.map((item) => (
            <SoundTile
              key={item.id}
              label={item.label}
              icon={item.icon}
              active={activeIds.has(item.id)}
              onClick={() => toggleFreq(item)}
            />
          ))}
        </div>
      </section>

      {/* ASMR */}
      <section className="mt-7">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary/80 font-serif mb-3 px-1">
          ASMR
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {ASMR.map((item) => (
            <SoundTile
              key={item.id}
              label={item.label}
              icon={item.icon}
              active={activeIds.has(item.id)}
              onClick={() => toggleNature(item)}
            />
          ))}
        </div>
      </section>

      {activeIds.size > 0 && (
        <button
          onClick={() => {
            howlsRef.current.forEach((h) => { h.stop(); h.unload(); });
            howlsRef.current.clear();
            audioEngine.stopAll();
            setActiveIds(new Set());
          }}
          className="mt-6 liquid-card w-full py-3 text-sm font-semibold text-primary"
        >
          전체 정지
        </button>
      )}
    </div>
  );
};

interface TileProps {
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  active: boolean;
  onClick: () => void;
}

const SoundTile = ({ label, icon: Icon, active, onClick }: TileProps) => (
  <button
    onClick={onClick}
    className={cn(
      "liquid-card aspect-[1.1] p-3 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95",
      active && "ring-2 ring-primary shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)]"
    )}
  >
    <div className={cn(
      "w-8 h-8 rounded-xl flex items-center justify-center",
      active ? "bg-primary text-primary-foreground" : "text-primary"
    )}>
      {active ? <Pause className="w-4 h-4" /> : <Icon className="w-5 h-5" strokeWidth={1.6} />}
    </div>
    <span className="text-[11px] font-medium text-foreground text-center leading-tight">
      {label}
    </span>
  </button>
);

export default Music;
