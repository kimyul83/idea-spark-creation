import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EmotionRow, FOCUS_MODES } from "@/types/db";
import { getIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
import { ChevronRight, Sun, Moon as MoonIcon } from "lucide-react";

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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return { text: "좋은 아침이에요", Icon: Sun };
    if (h < 18) return { text: "오늘도 힘내요", Icon: Sun };
    return { text: "수고했어요", Icon: MoonIcon };
  };
  const g = greeting();

  return (
    <div className="px-5 pt-12">
      {/* header */}
      <header className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-xs text-navy-soft/60">Moodie</p>
          <h1 className="text-2xl font-bold text-navy mt-1 flex items-center gap-2">
            <g.Icon className="w-5 h-5 text-mint-deep" />
            {g.text}
          </h1>
        </div>
        <div className="w-11 h-11 rounded-full bg-gradient-mint shadow-glow animate-breathe" />
      </header>

      {/* segmented tabs */}
      <div className="bg-white/70 backdrop-blur p-1.5 rounded-2xl flex gap-1 mb-6 shadow-soft">
        {([
          { id: "calm", label: "진정하기" },
          { id: "boost", label: "끌어올리기" },
          { id: "focus", label: "집중하기" },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
              tab === t.id
                ? "bg-navy text-white shadow-soft"
                : "text-navy-soft/70"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* content */}
      <div className="animate-fade-up">
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
          className="group relative aspect-square rounded-3xl overflow-hidden shadow-card transition-all active:scale-[0.97] hover:shadow-glow"
          style={{ background: `linear-gradient(135deg, ${e.gradient_from} 0%, ${e.gradient_to} 100%)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative h-full flex flex-col justify-between p-4 text-left">
            <Icon className="w-7 h-7 text-white/90" strokeWidth={1.8} />
            <div>
              <div className="text-2xl mb-1">{e.emoji}</div>
              <div className="text-white font-bold text-lg drop-shadow">{e.name}</div>
            </div>
          </div>
        </button>
      );
    })}
  </div>
);

const FocusList = ({ onPick }: { onPick: (id: string) => void }) => (
  <div className="space-y-3">
    {FOCUS_MODES.map((m) => {
      const Icon = getIcon(m.icon);
      return (
        <button
          key={m.id}
          onClick={() => onPick(m.id)}
          className="w-full bg-cream-soft border-2 border-sage/30 rounded-3xl p-4 flex items-center gap-4 shadow-soft transition-all active:scale-[0.98] hover:border-sage/60"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-mint flex items-center justify-center shadow-soft shrink-0">
            <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-navy">{m.title}</div>
            <div className="text-xs text-navy-soft/70 mt-0.5">
              {m.durationMin}분 · {m.recommend}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-navy-soft/40" />
        </button>
      );
    })}
  </div>
);

export default Home;
