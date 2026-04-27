import { useNavigate } from "react-router-dom";
import { Wind, Sparkles, ChevronRight } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { Moodie } from "@/components/Moodie";
import { MUSIC_SITUATIONS } from "@/lib/modes";
import { SITUATION_DETAILS } from "@/lib/situation-details";

/**
 * Home — 6개 핵심 상황 + 호흡·깨기 빠른 진입.
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

  return (
    <div className="px-5 pt-12 pb-6 relative flex-1 flex flex-col">
      <MonetBackground intensity="medium" />

      {/* Header */}
      <div className="animate-fade-up flex items-start justify-between">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-primary font-serif">
            Home
          </p>
          <h1 className="text-[26px] font-bold text-foreground mt-1 leading-tight">
            {greeting}
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            어떤 시간이 필요해요?
          </p>
        </div>
        <Moodie size="small" />
      </div>

      {/* 호흡 · 깨기 빠른 진입 */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => navigate("/breathing")}
          className="liquid-card liquid-card-hover p-3.5 flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Wind className="w-5 h-5 text-primary" strokeWidth={1.6} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-[13px]">호흡</p>
            <p className="text-[10px] text-foreground/55">10 Techniques</p>
          </div>
        </button>
        <button
          onClick={() => navigate("/release/glass")}
          className="liquid-card liquid-card-hover p-3.5 flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.6} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-[13px]">깨기</p>
            <p className="text-[10px] text-foreground/55">스트레스 해소</p>
          </div>
        </button>
      </div>

      {/* 6개 상황 */}
      <section className="mt-7">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary/80 font-serif mb-3 px-1">
          힐링 사운드
        </h2>
        <div className="space-y-2">
          {MUSIC_SITUATIONS.map((s) => (
            <SituationRow key={s.id} id={s.id} icon={s.icon} onClick={() => navigate(`/music/${s.id}`)} />
          ))}
        </div>
      </section>

      <div className="flex-1 flex items-end justify-center pt-8">
        <div className="text-center opacity-75">
          <p className="text-[11px] text-foreground/45 font-serif tracking-widest">
            마음에 · 내리는 · 윤슬
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
      className="liquid-card liquid-card-hover w-full p-4 flex items-center gap-3 text-left"
    >
      <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" strokeWidth={1.6} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-bold text-foreground text-[14px]">{d.mood}</span>
          <span className="text-[10px] font-mono text-primary tracking-wide">{d.frequencyLabel}</span>
        </div>
        <div className="text-[11px] text-foreground/60 mt-0.5">{d.scene}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-foreground/25 shrink-0" />
    </button>
  );
};

export default Home;
