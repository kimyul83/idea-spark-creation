import { useNavigate } from "react-router-dom";
import { Wind, Sparkles, ChevronRight } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { Moodie } from "@/components/Moodie";
import { MUSIC_SITUATIONS } from "@/lib/modes";
import { SITUATION_DETAILS } from "@/lib/situation-details";
import { useTheme } from "@/contexts/ThemeContext";
import { FOCUS_MODES } from "@/types/db";
import { getIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

/**
 * Home — 심리 음악 상황 + 호흡·깨기 빠른 진입.
 * 복잡한 자연 소리는 Music 탭으로 분리.
 */
const Home = () => {
  const navigate = useNavigate();
  const { resolvedVariant } = useTheme();
  const hour = new Date().getHours();

  const greeting =
    hour < 6 ? "깊은 밤이에요" :
    hour < 11 ? "좋은 아침이에요" :
    hour < 18 ? "오늘 어때요" :
    hour < 22 ? "편안한 저녁이에요" :
    "하루를 마무리해요";

  const core = MUSIC_SITUATIONS.filter((s) => s.group === "core");
  const mood = MUSIC_SITUATIONS.filter((s) => s.group === "mood");
  const travel = MUSIC_SITUATIONS.filter((s) => s.group === "travel");

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

      {/* 일상 · Core 6 */}
      <section className="mt-7">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary/80 font-serif mb-3 px-1">
          일상 · 심리 음악
        </h2>
        <div className="space-y-2">
          {core.map((s) => (
            <SituationRow key={s.id} id={s.id} icon={s.icon} onClick={() => navigate(`/music/${s.id}`)} />
          ))}
        </div>
      </section>

      {/* 무드 */}
      <section className="mt-6">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary/80 font-serif mb-3 px-1">
          무드 · 라이프스타일
        </h2>
        <div className="space-y-2">
          {mood.map((s) => (
            <SituationRow key={s.id} id={s.id} icon={s.icon} onClick={() => navigate(`/music/${s.id}`)} />
          ))}
        </div>
      </section>

      {/* 여행 */}
      <section className="mt-6">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary/80 font-serif mb-3 px-1">
          여행 바이브
        </h2>
        <div className="space-y-2">
          {travel.map((s) => (
            <SituationRow key={s.id} id={s.id} icon={s.icon} onClick={() => navigate(`/music/${s.id}`)} />
          ))}
        </div>
      </section>

      {/* 집중 */}
      <section className="mt-6">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary/80 font-serif mb-3 px-1">
          집중 · 몰입
        </h2>
        <div className="space-y-2">
          {FOCUS_MODES.map((m) => {
            const Icon = getIcon(m.icon);
            const route = m.id === "adhd" ? "/focus/adhd" : `/session/focus/${m.id}`;
            return (
              <button
                key={m.id}
                onClick={() => navigate(route)}
                className="liquid-card liquid-card-hover w-full p-4 flex items-center gap-3 text-left"
              >
                <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-foreground text-[14px]">{m.title}</span>
                    <span className="text-[10px] font-mono text-primary">{m.durationMin} min</span>
                  </div>
                  <div className="text-[11px] text-foreground/55 mt-0.5">{m.recommend}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-foreground/25 shrink-0" />
              </button>
            );
          })}
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
