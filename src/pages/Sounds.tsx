import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SoundRow } from "@/types/db";
import { audioEngine } from "@/lib/audio-engine";
import { getIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";

const Sounds = () => {
  const [sounds, setSounds] = useState<SoundRow[]>([]);
  const [active, setActive] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("sounds").select("*").order("category").then(({ data }) => {
      setSounds((data ?? []) as SoundRow[]);
    });
    return () => audioEngine.stopAll();
  }, []);

  const toggle = (s: SoundRow) => {
    if (s.is_premium) return;
    if (active.includes(s.id)) {
      audioEngine.stop(s.id);
      setActive((p) => p.filter((x) => x !== s.id));
    } else {
      if (s.source_type === "url" && s.audio_url) audioEngine.playUrl(s.id, s.audio_url);
      else if (s.name.includes("브라운")) audioEngine.playNoise(s.id, "brown");
      else if (s.name.includes("핑크")) audioEngine.playNoise(s.id, "pink");
      else if (s.name.includes("화이트")) audioEngine.playNoise(s.id, "white");
      else audioEngine.playTone(s.id, s.frequency_hz ?? 432);
      setActive((p) => [...p, s.id]);
    }
  };

  const groups = [
    { id: "nature", title: "자연 소리", desc: "마음을 자연으로 데려가요" },
    { id: "frequency", title: "주파수 · 노이즈", desc: "과학적으로 설계된 소리" },
    { id: "asmr", title: "ASMR", desc: "섬세한 일상의 소리" },
  ];

  return (
    <div className="px-5 pt-12 relative">
      <MonetBackground intensity="medium" />

      <p className="text-[11px] tracking-[0.3em] uppercase text-sage-deep font-serif">Library</p>
      <h1 className="text-[28px] font-bold text-charcoal mt-1">사운드 라이브러리</h1>
      <p className="text-sm text-charcoal/60 mt-1">여러 소리를 동시에 재생할 수 있어요</p>

      <div className="mt-6 space-y-6">
        {groups.map((g) => (
          <section key={g.id}>
            <h2 className="font-bold text-charcoal">{g.title}</h2>
            <p className="text-xs text-charcoal/50 mt-0.5 mb-3">{g.desc}</p>
            <div className="grid grid-cols-3 gap-2">
              {sounds.filter((s) => s.category === g.id).map((s) => {
                const Icon = getIcon(s.icon_name);
                const isActive = active.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(s)}
                    className={cn(
                      "relative p-3 rounded-2xl border transition-all duration-300 active:scale-95 hover:scale-[1.02] flex flex-col items-center gap-1.5",
                      isActive
                        ? "bg-sage-deep border-sage-deep text-white shadow-soft"
                        : "bg-white/80 border-beige text-charcoal",
                      s.is_premium && "opacity-60"
                    )}
                  >
                    {s.is_premium && (
                      <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-charcoal/50" />
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
    </div>
  );
};

export default Sounds;
