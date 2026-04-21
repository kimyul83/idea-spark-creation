import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EmotionRow, FOCUS_MODES } from "@/types/db";
import { getIcon } from "@/lib/icon-map";
import { Moodie } from "@/components/Moodie";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

type Tab = "calm" | "boost" | "focus";

const Home = () => {
  const [tab, setTab] = useState<Tab>("calm");
  const [emotions, setEmotions] = useState<EmotionRow[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("emotions")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setEmotions((data ?? []) as EmotionRow[]));
  }, []);

  const calm = emotions.filter((e) => e.category === "calm");
  const boost = emotions.filter((e) => e.category === "boost");

  return (
    <div className="px-5 pt-10 relative">
      {/* mesh blob deco */}
      <div className="blob w-[300px] h-[300px] top-0 -right-20 opacity-30 bg-terracotta -z-10" />
      <div className="blob w-[280px] h-[280px] -top-10 -left-10 opacity-30 bg-sage -z-10" />

      {/* header */}
      <header className="flex items-center gap-3 mb-8 animate-fade-up">
        <Moodie size="small" />
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-sage-deep font-medium font-serif">
            Moodie
          </p>
          <h1 className="text-[20px] font-bold text-charcoal mt-0.5">
            오늘 기분이 어때요?
          </h1>
        </div>
      </header>

      {/* segmented tabs */}
      <div className="surface p-1 rounded-2xl flex gap-1 mb-6 shadow-soft">
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
                ? "bg-charcoal text-cream shadow-soft"
                : "text-charcoal/60"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div key={tab} className="animate-fade-up">
        {tab === "calm" && <EmotionGrid items={calm} onPick={(e) => navigate(`/session/emotion/${e.id}`)} />}
        {tab === "boost" && <EmotionGrid items={boost} onPick={(e) => navigate(`/session/emotion/${e.id}`)} />}
        {tab === "focus" && <FocusList onPick={(id) => navigate(`/session/focus/${id}`)} />}
      </div>
    </div>
  );
};

const EmotionGrid = ({ items, onPick }: { items: EmotionRow[]; onPick: (e: EmotionRow) => void }) => (
  <div className="grid grid-cols-2 gap-3">
    {items.map((e) => {
      const Icon = getIcon(e.icon_name);
      return (
        <button
          key={e.id}
          onClick={() => onPick(e)}
          className="group relative aspect-square rounded-3xl overflow-hidden shadow-soft transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] hover:shadow-card text-left"
        >
          {/* cream base */}
          <div className="absolute inset-0 bg-cream" />
          {/* emotion gradient overlay (preserved) */}
          <div
            className="absolute inset-0 opacity-90"
            style={{ background: `linear-gradient(150deg, ${e.gradient_from} 0%, ${e.gradient_to} 100%)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/15 to-transparent" />
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

const FocusList = ({ onPick }: { onPick: (id: string) => void }) => (
  <div className="space-y-2.5">
    {FOCUS_MODES.map((m) => {
      const Icon = getIcon(m.icon);
      return (
        <button
          key={m.id}
          onClick={() => onPick(m.id)}
          className="w-full bg-white/80 border border-beige rounded-3xl p-4 flex items-center gap-4 shadow-soft transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] hover:border-sage-deep/40"
        >
          <div className="w-12 h-12 rounded-2xl bg-sage/40 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-sage-deep" strokeWidth={1.8} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-charcoal">{m.title}</div>
            <div className="text-xs text-charcoal/60 mt-0.5">
              {m.durationMin}분 · {m.recommend}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-charcoal/30" />
        </button>
      );
    })}
  </div>
);

export default Home;
