import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EmotionRow, FOCUS_MODES } from "@/types/db";
import { getIcon } from "@/lib/icon-map";
import { Moodie } from "@/components/Moodie";
import { MonetBackground } from "@/components/MonetBackground";
import { cn } from "@/lib/utils";
import { ChevronRight, Lock } from "lucide-react";
import { PREMIUM_EMOTION_NAMES, usePremium, adhdTrialAvailable } from "@/hooks/usePremium";
import { useTheme } from "@/contexts/ThemeContext";

type Tab = "calm" | "boost" | "focus";

const Home = () => {
  const [tab, setTab] = useState<Tab>("calm");
  const [emotions, setEmotions] = useState<EmotionRow[]>([]);
  const navigate = useNavigate();
  const { isPremium } = usePremium();
  const { mode } = useTheme();
  const greeting = mode === "dawn" ? "좋은 아침이에요 ☀️" : "편안한 밤이에요 🌙";

  useEffect(() => {
    supabase
      .from("emotions")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setEmotions((data ?? []) as EmotionRow[]));
  }, []);

  const calm = emotions.filter((e) => e.category === "calm");
  const boost = emotions.filter((e) => e.category === "boost");

  const pickEmotion = (e: EmotionRow) => {
    const locked = PREMIUM_EMOTION_NAMES.has(e.name) && !isPremium;
    if (locked) navigate("/subscribe");
    else navigate(`/session/emotion/${e.id}`);
  };

  const pickFocus = (id: string) => {
    if (id === "adhd") {
      if (!isPremium && !adhdTrialAvailable()) {
        navigate("/subscribe");
        return;
      }
      navigate("/focus/adhd");
      return;
    }
    navigate(`/session/focus/${id}`);
  };

  return (
    <div className="px-5 pt-10 pb-6 relative flex-1 flex flex-col">
      <MonetBackground intensity="medium" />

      <header className="flex items-center gap-3 mb-7 animate-fade-up">
        <Moodie size="small" />
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-primary font-medium font-serif">
            {greeting}
          </p>
          <h1 className="text-[20px] font-bold text-foreground mt-0.5">
            오늘 기분이 어때요?
          </h1>
        </div>
      </header>

      <div className="surface p-1 rounded-2xl flex gap-1 mb-5 shadow-soft">
        {([
          { id: "calm", label: "진정하기" },
          { id: "boost", label: "끌어올리기" },
          { id: "focus", label: "집중하기" },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
              tab === t.id
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-foreground/60"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div key={tab} className="animate-fade-up flex-1">
        {tab === "calm" && (
          <EmotionGrid items={calm} isPremium={isPremium} onPick={pickEmotion} />
        )}
        {tab === "boost" && (
          <EmotionGrid items={boost} isPremium={isPremium} onPick={pickEmotion} />
        )}
        {tab === "focus" && <FocusList isPremium={isPremium} onPick={pickFocus} />}
      </div>
    </div>
  );
};

const EmotionGrid = ({
  items, isPremium, onPick,
}: { items: EmotionRow[]; isPremium: boolean; onPick: (e: EmotionRow) => void }) => (
  <div className="grid grid-cols-2 gap-3">
    {items.map((e) => {
      const Icon = getIcon(e.icon_name);
      const locked = PREMIUM_EMOTION_NAMES.has(e.name) && !isPremium;
      return (
        <button
          key={e.id}
          onClick={() => onPick(e)}
          className="group relative aspect-square rounded-3xl overflow-hidden shadow-soft transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] hover:shadow-card text-left"
        >
          <div className="absolute inset-0 bg-section" />
          <div
            className="absolute inset-0 opacity-90"
            style={{ background: `linear-gradient(150deg, ${e.gradient_from} 0%, ${e.gradient_to} 100%)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
          {locked && (
            <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
              <Lock className="w-4 h-4 text-white" strokeWidth={2.2} />
            </span>
          )}
          <div className="relative h-full flex flex-col justify-between p-4">
            <Icon className="w-6 h-6 text-white/90" strokeWidth={1.6} />
            <div>
              <div className="text-xl mb-0.5">{e.emoji}</div>
              <div className="text-white font-bold text-[17px] drop-shadow-sm">{e.name}</div>
            </div>
          </div>
        </button>
      );
    })}
  </div>
);

const FocusList = ({
  isPremium, onPick,
}: { isPremium: boolean; onPick: (id: string) => void }) => (
  <div className="space-y-2.5">
    {FOCUS_MODES.map((m) => {
      const Icon = getIcon(m.icon);
      const trialUsed = m.id === "adhd" && !isPremium && !adhdTrialAvailable();
      return (
        <button
          key={m.id}
          onClick={() => onPick(m.id)}
          className="w-full surface rounded-3xl p-4 flex items-center gap-4 shadow-soft transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] hover:border-primary/40 relative"
        >
          {trialUsed && (
            <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-foreground/60" />
            </span>
          )}
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-primary" strokeWidth={1.8} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-foreground flex items-center gap-2">
              {m.title}
              {m.id === "adhd" && !isPremium && !trialUsed && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/30 text-accent-foreground">
                  오늘 1회 체험
                </span>
              )}
            </div>
            <div className="text-xs text-foreground/60 mt-0.5">
              {m.durationMin}분 · {m.recommend}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-foreground/30" />
        </button>
      );
    })}
  </div>
);

export default Home;
