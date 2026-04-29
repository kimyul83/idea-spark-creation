import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SoundRow } from "@/types/db";
import { audioEngine, NatureSoundId, AsmrSoundId } from "@/lib/audio-engine";
import { getIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
import { Lock, Pause, Play } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { usePremium } from "@/hooks/usePremium";
import { toast } from "sonner";

const FREE_NATURE = new Set(["숲속", "바다 파도", "빗소리"]);

// Map Korean sound names → synth recipe id
const NATURE_MAP: Record<string, NatureSoundId> = {
  "숲속": "forest",
  "바다 파도": "ocean",
  "빗소리": "rain",
  "새소리": "birds",
  "폭포": "stream",
  "바람 소리": "wind",
  "동굴 울림": "cave",
  "따뜻한 햇살": "sun",
};
const ASMR_MAP: Record<string, AsmrSoundId> = {
  "타이핑 ASMR": "typing",
  "페이지 넘기기": "page",
  "카페 분위기": "cafe",
};

const Sounds = () => {
  const [sounds, setSounds] = useState<SoundRow[]>([]);
  const [active, setActive] = useState<string[]>([]);
  const navigate = useNavigate();
  const { isPremium } = usePremium();

  useEffect(() => {
    supabase.from("sounds").select("*").order("category").then(({ data }) => {
      setSounds((data ?? []) as SoundRow[]);
    });
    return () => audioEngine.stopAll();
  }, []);

  const isLocked = (s: SoundRow): boolean => {
    if (isPremium) return false;
    if (s.is_premium) return true;
    if (s.category === "frequency" || s.category === "asmr") return true;
    if (s.category === "nature" && !FREE_NATURE.has(s.name)) return true;
    return false;
  };

  const toggle = (s: SoundRow) => {
    if (isLocked(s)) {
      navigate("/subscribe");
      return;
    }
    if (active.includes(s.id)) {
      audioEngine.stop(s.id);
      setActive((p) => p.filter((x) => x !== s.id));
      return;
    }

    try {
      if (s.category === "nature") {
        const kind = NATURE_MAP[s.name];
        if (!kind) throw new Error("unknown nature kind");
        // 진짜 CC0 자연 녹음을 먼저 시도, 실패 시 합성으로 자동 대체
        audioEngine.playNatureReal(s.id, kind);
      } else if (s.category === "asmr") {
        const kind = ASMR_MAP[s.name];
        if (!kind) throw new Error("unknown asmr kind");
        audioEngine.playAsmr(s.id, kind);
      } else if (s.name.includes("브라운")) {
        audioEngine.playNoise(s.id, "brown");
      } else if (s.name.includes("핑크")) {
        audioEngine.playNoise(s.id, "pink");
      } else if (s.name.includes("화이트")) {
        audioEngine.playNoise(s.id, "white");
      } else if (s.frequency_hz && s.frequency_hz > 0) {
        audioEngine.playTone(s.id, s.frequency_hz);
      } else if (s.source_type === "url" && s.audio_url) {
        audioEngine.playUrl(s.id, s.audio_url, 0.6, (msg) => toast.error(msg));
      } else {
        throw new Error("no playable source");
      }
      setActive((p) => [...p, s.id]);
    } catch {
      toast.error(`${s.name}을(를) 재생할 수 없어요`);
    }
  };

  const stopAll = () => {
    audioEngine.stopAll();
    setActive([]);
  };

  const groups = [
    { id: "nature", title: "자연 소리", desc: "마음을 자연으로 데려가요" },
    { id: "frequency", title: "주파수 · 노이즈", desc: "과학적으로 설계된 소리" },
    { id: "asmr", title: "ASMR", desc: "섬세한 일상의 소리" },
  ];

  return (
    <div className="px-5 pt-12 pb-6 relative flex-1 flex flex-col">
      <MonetBackground intensity="medium" />

      <div className="animate-fade-up">
        <p className="text-[13px] tracking-[0.3em] uppercase text-primary font-bold font-serif">Library</p>
        <h1 className="text-[28px] font-bold text-foreground mt-1">사운드 라이브러리</h1>
        <p className="text-sm text-foreground/60 mt-1">여러 소리를 동시에 재생할 수 있어요</p>
      </div>

      <div className={cn("mt-6 space-y-6 flex-1", active.length > 0 && "pb-24")}>
        {groups.map((g) => (
          <section key={g.id}>
            <h2 className="font-bold text-foreground">{g.title}</h2>
            <p className="text-xs text-foreground/50 mt-0.5 mb-3">{g.desc}</p>
            <div className="grid grid-cols-3 gap-2">
              {sounds.filter((s) => s.category === g.id).map((s) => {
                const Icon = getIcon(s.icon_name);
                const locked = isLocked(s);
                const isActive = active.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(s)}
                    className={cn(
                      "relative p-3 rounded-2xl border transition-all duration-300 active:scale-95 hover:scale-[1.02] flex flex-col items-center gap-1.5",
                      isActive
                        ? "bg-primary border-primary text-primary-foreground shadow-soft"
                        : "surface text-foreground",
                      locked && "opacity-70"
                    )}
                  >
                    {locked && (
                      <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-foreground/60" />
                    )}
                    <Icon className="w-6 h-6" strokeWidth={1.8} />
                    <span className="text-[11px] font-medium leading-tight text-center">{s.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Floating mini player */}
      {active.length > 0 && (
        <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[476px] z-30 animate-fade-up">
          <div className="surface rounded-2xl px-4 py-3 shadow-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Play className="w-4 h-4 text-primary" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground/50">재생 중</p>
              <p className="font-semibold text-foreground text-sm">{active.length}개 사운드 믹스</p>
            </div>
            <button
              onClick={stopAll}
              className="px-3 h-9 rounded-xl bg-foreground/10 text-foreground text-xs font-semibold flex items-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5" /> 정지
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sounds;
