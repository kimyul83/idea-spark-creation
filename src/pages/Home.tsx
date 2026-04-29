import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Wind, Sparkles, ChevronRight, type LucideIcon } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { Moody } from "@/components/Moody";
import { MUSIC_SITUATIONS } from "@/lib/modes";
import { SITUATION_DETAILS } from "@/lib/situation-details";

const TAP_REACTIONS = ["happy", "love", "surprised", "calm", "focus"] as const;
const REACTION_DURATION_MS = 1800;

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const hour = new Date().getHours();

  const greetingKey =
    hour < 6 ? "deepNight" :
    hour < 11 ? "morning" :
    hour < 18 ? "day" :
    hour < 22 ? "evening" :
    "lateNight";
  const greeting = t(`home.greeting.${greetingKey}`);

  const [moodyEmotion, setMoodyEmotion] = useState<typeof TAP_REACTIONS[number] | "default">("default");
  const [tapHint, setTapHint] = useState(true);
  const tapIdxRef = useRef(0);
  const reactionTimerRef = useRef<number>();

  const handleMoodyTap = () => {
    setTapHint(false);
    const next = TAP_REACTIONS[tapIdxRef.current % TAP_REACTIONS.length];
    tapIdxRef.current++;
    setMoodyEmotion(next);
    if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = window.setTimeout(() => {
      setMoodyEmotion("default");
    }, REACTION_DURATION_MS);
  };

  return (
    <div className="px-5 pt-6 pb-6 relative flex-1 flex flex-col">
      <MonetBackground intensity="medium" />

      {/* Hero — 큰 마스코트 + 인사말 (중앙 정렬) */}
      <div className="animate-fade-up flex flex-col items-center text-center">
        <Moody size={300} emotion={moodyEmotion} onClick={handleMoodyTap} />
        {tapHint && (
          <p className="text-[10px] text-primary/60 tracking-widest uppercase animate-pulse">
            {t("home.tapHint")}
          </p>
        )}
        <p className="chip-primary text-[12px] tracking-[0.3em] uppercase font-serif mt-1">
          {t("home.label")}
        </p>
        <h1 className="text-[30px] font-bold text-foreground mt-2 leading-tight">
          {greeting}
        </h1>
        <p className="text-base text-foreground/65 mt-1">
          {t("home.subtitle")}
        </p>
      </div>

      {/* 호흡 · 깨기 빠른 진입 */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/breathing")}
          className="liquid-card liquid-card-hover p-4 flex items-center gap-3 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
            <Wind className="w-6 h-6 text-primary" strokeWidth={1.6} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-[16px]">{t("home.breathing")}</p>
            <p className="text-[12px] text-foreground/60 mt-0.5">{t("home.breathingSub")}</p>
          </div>
        </button>
        <button
          onClick={() => navigate("/release/glass")}
          className="liquid-card liquid-card-hover p-4 flex items-center gap-3 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-primary" strokeWidth={1.6} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-[16px]">{t("home.release")}</p>
            <p className="text-[12px] text-foreground/60 mt-0.5">{t("home.releaseSub")}</p>
          </div>
        </button>
      </div>

      {/* 6개 상황 */}
      <section className="mt-7">
        <h2 className="section-title mb-3 px-1">{t("home.healingSounds")}</h2>
        <div className="space-y-2.5">
          {MUSIC_SITUATIONS.map((s) => (
            <SituationRow key={s.id} id={s.id} icon={s.icon} onClick={() => navigate(`/music/${s.id}`)} />
          ))}
        </div>
      </section>
    </div>
  );
};

interface SituationRowProps {
  id: string;
  icon: LucideIcon;
  onClick: () => void;
}

const SituationRow = ({ id, icon: Icon, onClick }: SituationRowProps) => {
  const { t } = useTranslation();
  const d = SITUATION_DETAILS[id];
  if (!d) return null;
  return (
    <button
      onClick={onClick}
      className="liquid-card liquid-card-hover w-full p-4 flex items-center gap-3.5 text-left"
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-primary" strokeWidth={1.6} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-bold text-foreground text-[16px]">{t(`situations.${id}.mood`, { defaultValue: d.mood })}</span>
          <span className="text-[12px] font-mono text-primary tracking-wide">{d.frequencyLabel}</span>
        </div>
        <div className="text-[13px] text-foreground/65 mt-0.5">{t(`situations.${id}.scene`, { defaultValue: d.scene })}</div>
      </div>
      <ChevronRight className="w-5 h-5 text-foreground/30 shrink-0" />
    </button>
  );
};

export default Home;
