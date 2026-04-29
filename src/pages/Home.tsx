import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Wind, Sparkles, ChevronRight } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { Moody } from "@/components/Moody";
import { MUSIC_SITUATIONS } from "@/lib/modes";
import { SITUATION_DETAILS } from "@/lib/situation-details";

const TAP_REACTIONS = ["happy", "love", "surprised", "calm", "focus"] as const;
const REACTION_DURATION_MS = 1800;

/**
 * Home — 6개 핵심 상황 + 호흡·깨기 빠른 진입.
 * 무디 탭하면 표정이 바뀜 (귀여운 인터랙션).
 */
const Home = () => {
  const navigate = useNavigate();
  const hour = new Date().getHours();

  const greeting =
    hour < 6 ? "깊은 밤이에요" :
    hour < 11 ? "좋은 아침이에요" :
    hour < 18 ? "오늘 어때요" :
    hour < 22 ? "편안한 저녁이에요" :
    "하루를 마무리해요";

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
            ✨ Tap to greet
          </p>
        )}
        <p className="text-[13px] tracking-[0.3em] uppercase text-primary font-serif mt-1">
          Home
        </p>
        <h1 className="text-[30px] font-bold text-foreground mt-1 leading-tight">
          {greeting}
        </h1>
        <p className="text-base text-foreground/65 mt-1">
          어떤 시간이 필요해요?
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
            <p className="font-bold text-foreground text-[16px]">호흡</p>
            <p className="text-[12px] text-foreground/60 mt-0.5">10 Techniques</p>
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
            <p className="font-bold text-foreground text-[16px]">깨기</p>
            <p className="text-[12px] text-foreground/60 mt-0.5">스트레스 해소</p>
          </div>
        </button>
      </div>

      {/* 6개 상황 */}
      <section className="mt-7">
        <h2 className="text-[13px] tracking-[0.2em] uppercase text-primary/80 font-serif mb-3 px-1">
          힐링 사운드
        </h2>
        <div className="space-y-2.5">
          {MUSIC_SITUATIONS.map((s) => (
            <SituationRow key={s.id} id={s.id} icon={s.icon} onClick={() => navigate(`/music/${s.id}`)} />
          ))}
        </div>
      </section>

      <div className="flex-1 flex items-end justify-center pt-8">
        <div className="text-center opacity-75">
          <p className="text-[12px] text-foreground/50 font-serif tracking-widest">
            마음에 · 내리는 · 민트무디
          </p>
        </div>
      </div>
    </div>
  );
};

interface SituationRowProps {
  id: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick: () => void;
}

const SituationRow = ({ id, icon: Icon, onClick }: SituationRowProps) => {
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
          <span className="font-bold text-foreground text-[16px]">{d.mood}</span>
          <span className="text-[12px] font-mono text-primary tracking-wide">{d.frequencyLabel}</span>
        </div>
        <div className="text-[13px] text-foreground/65 mt-0.5">{d.scene}</div>
      </div>
      <ChevronRight className="w-5 h-5 text-foreground/30 shrink-0" />
    </button>
  );
};

export default Home;
