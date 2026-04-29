import { useNavigate, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Lock, Check } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { Moody } from "@/components/Moody";
import {
  BREATHING_PATTERNS, BREATHING_VISUALS, CATEGORY_META,
  getStoredVisual, setStoredVisual,
  type BreathingCategory, type BreathingPattern, type BreathingVisualId,
} from "@/lib/breathing";
import { BreathingVisualPreview } from "@/components/BreathingVisuals";
import { usePremium } from "@/hooks/usePremium";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REPS = [3, 5, 10, 15];
const CATEGORIES: BreathingCategory[] = ["calm", "emergency", "energize", "sleep"];

type Step = "pick" | "reps" | "visual";

const Breathing = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isPremium } = usePremium();
  const presetEmotion = params.get("emotion");

  const [category, setCategory] = useState<BreathingCategory>("calm");
  const [step, setStep] = useState<Step>("pick");
  const [picked, setPicked] = useState<BreathingPattern | null>(null);
  const [reps, setReps] = useState<number>(5);
  const [visual, setVisual] = useState<BreathingVisualId>(getStoredVisual());

  const list = useMemo(
    () => BREATHING_PATTERNS.filter((p) => p.category === category),
    [category],
  );

  const onPickPattern = (p: BreathingPattern) => {
    if (p.premium && !isPremium) {
      navigate("/subscribe");
      return;
    }
    setPicked(p);
    setStep("reps");
  };

  const onPickReps = (n: number) => {
    setReps(n);
    setStep("visual");
  };

  const start = () => {
    if (!picked) return;
    setStoredVisual(visual);
    const search = new URLSearchParams({ reps: String(reps), visual });
    if (presetEmotion) search.set("emotion", presetEmotion);
    navigate(`/breathing/session/${picked.id}?${search.toString()}`);
  };

  const goBack = () => {
    if (step === "visual") setStep("reps");
    else if (step === "reps") { setStep("pick"); setPicked(null); }
  };

  return (
    <div className="px-5 pt-12 pb-6 relative flex-1 flex flex-col">
      <MonetBackground intensity="medium" />

      {/* Header */}
      <div className="animate-fade-up flex items-start gap-3">
        {step !== "pick" && (
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-full liquid-card flex items-center justify-center mt-1"
            aria-label="뒤로"
          >
            <ArrowLeft className="w-4 h-4 text-foreground/70" />
          </button>
        )}
        <div className="flex-1">
          <p className="text-[11px] tracking-[0.3em] uppercase text-primary font-serif">Breathing</p>
          <h1 className="text-[26px] font-bold text-foreground mt-1 leading-tight">
            {step === "pick"   && "호흡 가이드"}
            {step === "reps"   && picked?.title}
            {step === "visual" && "애니메이션 선택"}
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            {step === "pick"   && "지금 필요한 호흡을 골라요"}
            {step === "reps"   && "몇 번 반복할까요?"}
            {step === "visual" && "몰입할 시각 스타일을 골라요"}
          </p>
        </div>
      </div>

      {/* STEP 1 — pick technique */}
      {step === "pick" && (
        <>
          {/* Category segments */}
          <div className="mt-5 grid grid-cols-4 gap-1.5 liquid-card p-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "segment-item rounded-2xl py-2 text-xs font-medium",
                  category === c
                    ? "is-active bg-primary text-primary-foreground"
                    : "text-foreground/60 hover:text-foreground",
                )}
              >
                {CATEGORY_META[c].label}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="mt-4 space-y-2.5">
            {list.map((p) => {
              const Icon = p.icon;
              const locked = p.premium && !isPremium;
              return (
                <button
                  key={p.id}
                  onClick={() => onPickPattern(p)}
                  className="liquid-card liquid-card-hover w-full p-4 flex items-center gap-3 text-left"
                >
                  {locked && (
                    <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center">
                      <Lock className="w-3 h-3 text-foreground/60" />
                    </span>
                  )}
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" strokeWidth={1.6} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground text-[15px]">{p.title}</div>
                    <div className="text-[11px] text-foreground/60 mt-0.5">{p.subtitle}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-primary font-medium">{p.description}</span>
                      {p.origin && (
                        <span className="text-[10px] text-foreground/40">· {p.origin}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/30 shrink-0" />
                </button>
              );
            })}
          </div>

          <div className="flex-1 flex items-end justify-center pt-6">
            <div className="text-center opacity-80">
              <Moody size={140} />
              <p className="text-[11px] text-foreground/50 mt-2 font-serif tracking-widest">
                천천히 · 깊게 · 부드럽게
              </p>
            </div>
          </div>
        </>
      )}

      {/* STEP 2 — pick reps */}
      {step === "reps" && picked && (
        <div className="mt-6 space-y-3 animate-fade-up">
          <div className="liquid-card p-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
              <picked.icon className="w-6 h-6 text-primary" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-widest text-foreground/50">선택된 호흡법</p>
              <p className="font-bold text-foreground">{picked.title}</p>
              <p className="text-[11px] text-foreground/60 mt-0.5">{picked.subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mt-2">
            {REPS.map((r) => (
              <button
                key={r}
                onClick={() => onPickReps(r)}
                className={cn(
                  "liquid-card liquid-card-hover h-20 flex flex-col items-center justify-center",
                  reps === r && "ring-2 ring-primary/60",
                )}
              >
                <span className="text-2xl font-serif text-primary">{r}</span>
                <span className="text-[11px] text-foreground/60 mt-0.5">회 반복</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 — pick visual */}
      {step === "visual" && (
        <div className="mt-6 space-y-2.5 animate-fade-up flex-1 flex flex-col">
          <div className="space-y-2.5">
            {BREATHING_VISUALS.map((v) => {
              const selected = visual === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setVisual(v.id)}
                  className={cn(
                    "liquid-card liquid-card-hover w-full p-3 flex items-stretch gap-3 text-left overflow-hidden",
                    selected && "ring-2 ring-primary/60",
                  )}
                >
                  {/* preview 60% */}
                  <div className="w-[42%] shrink-0 h-20 rounded-2xl bg-foreground/[0.04] overflow-hidden">
                    <BreathingVisualPreview visual={v.id} className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5">
                      <span>{v.emoji}</span>
                      <p className="font-bold text-foreground text-[14px]">{v.name}</p>
                      {selected && <Check className="w-3.5 h-3.5 text-primary ml-auto" />}
                    </div>
                    <p className="text-[11px] text-foreground/55 mt-1 leading-snug">
                      {v.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-4">
            <Button
              onClick={start}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold"
            >
              시작하기 · {reps}회
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Breathing;
