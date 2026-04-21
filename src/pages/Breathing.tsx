import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Lock, ChevronRight, X } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { Moodie } from "@/components/Moodie";
import { BREATHING_PATTERNS, BreathingPattern } from "@/lib/breathing";
import { usePremium } from "@/hooks/usePremium";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REPS = [3, 5, 10, 15];

const Breathing = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isPremium } = usePremium();
  const [picked, setPicked] = useState<BreathingPattern | null>(null);
  const presetEmotion = params.get("emotion");

  const onPickPattern = (p: BreathingPattern) => {
    if (p.premium && !isPremium) {
      navigate("/subscribe");
      return;
    }
    setPicked(p);
  };

  const start = (reps: number) => {
    if (!picked) return;
    const search = new URLSearchParams({ reps: String(reps) });
    if (presetEmotion) search.set("emotion", presetEmotion);
    navigate(`/breathing/session/${picked.id}?${search.toString()}`);
  };

  return (
    <div className="px-5 pt-12 pb-6 relative flex-1 flex flex-col">
      <MonetBackground intensity="medium" />

      {/* Header (~20%) */}
      <div className="animate-fade-up">
        <p className="text-[11px] tracking-[0.3em] uppercase text-primary font-serif">Breathing</p>
        <h1 className="text-[28px] font-bold text-foreground mt-1">호흡 가이드</h1>
        <p className="text-sm text-foreground/60 mt-1">
          편한 자세로 앉아 천천히 따라해보세요
        </p>
      </div>

      {/* Cards (~60%) */}
      <div className="mt-6 space-y-3">
        {BREATHING_PATTERNS.map((p) => {
          const Icon = p.icon;
          const locked = p.premium && !isPremium;
          return (
            <button
              key={p.id}
              onClick={() => onPickPattern(p)}
              className="w-full surface rounded-3xl p-5 flex items-center gap-4 shadow-soft transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] hover:shadow-card text-left relative"
            >
              {locked && (
                <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-foreground/60" />
                </span>
              )}
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                <Icon className="w-7 h-7 text-primary" strokeWidth={1.6} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground">{p.title}</div>
                <div className="text-xs text-foreground/60 mt-0.5">{p.subtitle}</div>
                <div className="text-[11px] text-primary mt-1">{p.description}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-foreground/30 shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Filler (~20%) — Moodie */}
      <div className="flex-1 flex items-end justify-center pt-6">
        <div className="text-center opacity-80">
          <Moodie size="small" />
          <p className="text-[11px] text-foreground/50 mt-2 font-serif tracking-widest">
            천천히 · 깊게 · 부드럽게
          </p>
        </div>
      </div>

      {/* repeat modal */}
      {picked && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-up"
          onClick={() => setPicked(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "surface rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 shadow-card"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-primary font-serif">
                  {picked.id.toUpperCase()}
                </p>
                <h2 className="font-bold text-foreground text-lg mt-0.5">
                  몇 번 반복할까요?
                </h2>
              </div>
              <button
                onClick={() => setPicked(null)}
                className="w-9 h-9 rounded-full bg-foreground/5 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-foreground/60" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-5">
              {REPS.map((r) => (
                <Button
                  key={r}
                  onClick={() => start(r)}
                  className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold"
                >
                  {r}회
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Breathing;
