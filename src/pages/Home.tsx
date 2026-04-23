import { useNavigate } from "react-router-dom";
import { Music, Wind, Sparkles, ChevronRight } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { Moodie } from "@/components/Moodie";
import { MUSIC_SITUATIONS } from "@/lib/modes";
import { SITUATION_DETAILS } from "@/lib/situation-details";

/**
 * 홈 — Breath 페이지 통일 스타일.
 * liquid-card 리스트 중심. 컬러풀 위젯 X.
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

  const recommended = MUSIC_SITUATIONS.filter((s) => {
    if (!s.showHours) return s.group === "core";
    const [start, end] = s.showHours;
    if (start <= end) return hour >= start && hour < end;
    return hour >= start || hour < end;
  }).slice(0, 4);

  return (
    <div className="px-5 pt-12 pb-6 relative flex-1 flex flex-col">
      <MonetBackground intensity="medium" />

      {/* Header */}
      <div className="animate-fade-up">
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

      {/* 3대 기능 */}
      <div className="mt-5 space-y-2.5">
        <PillarCard
          icon={<Music className="w-6 h-6 text-primary" strokeWidth={1.6} />}
          title="음악"
          subtitle="상황별 심리 음악 · 자연 소리 · 주파수"
          tag="98 Tracks · 15 Situations"
          onClick={() => navigate("/music")}
        />
        <PillarCard
          icon={<Wind className="w-6 h-6 text-primary" strokeWidth={1.6} />}
          title="호흡"
          subtitle="4-7-8 · 박스 · 코히어런트 호흡법"
          tag="10 Techniques · 임상 검증"
          onClick={() => navigate("/breathing")}
        />
        <PillarCard
          icon={<Sparkles className="w-6 h-6 text-primary" strokeWidth={1.6} />}
          title="깨기"
          subtitle="터치해서 깨부수는 스트레스 해소"
          tag="12 Visuals · 파편 카타르시스"
          onClick={() => navigate("/release/glass")}
        />
      </div>

      {/* 지금 어울리는 순간 */}
      <div className="mt-7 animate-fade-up">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-primary font-serif">
              For this moment
            </p>
            <p className="text-[15px] font-bold text-foreground mt-0.5">
              지금 어울리는 순간
            </p>
          </div>
          <button
            onClick={() => navigate("/music")}
            className="text-[11px] text-foreground/55"
          >
            전체 →
          </button>
        </div>

        <div className="space-y-2">
          {recommended.map((s) => {
            const d = SITUATION_DETAILS[s.id];
            if (!d) return null;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => navigate(`/music/${s.id}`)}
                className="liquid-card liquid-card-hover w-full p-3.5 flex items-center gap-3 text-left"
              >
                <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="font-bold text-foreground text-[14px]">{d.mood}</p>
                    <span className="text-[10px] font-mono text-primary tracking-wide">
                      {d.frequencyLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground/55 mt-0.5 truncate">
                    {d.scene}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-foreground/30 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Moodie */}
      <div className="flex-1 flex items-end justify-center pt-8">
        <div className="text-center opacity-80">
          <Moodie size={48} />
          <p className="text-[11px] text-foreground/50 mt-2 font-serif tracking-widest">
            마음에 · 내리는 · 윤슬
          </p>
        </div>
      </div>
    </div>
  );
};

interface PillarCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tag: string;
  onClick: () => void;
}

const PillarCard = ({ icon, title, subtitle, tag, onClick }: PillarCardProps) => (
  <button
    onClick={onClick}
    className="liquid-card liquid-card-hover w-full p-4 flex items-center gap-3 text-left"
  >
    <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-foreground text-[16px]">{title}</p>
      <p className="text-[11px] text-foreground/60 mt-0.5">{subtitle}</p>
      <p className="text-[10px] text-primary mt-1 font-medium">{tag}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-foreground/30 shrink-0" />
  </button>
);

export default Home;
