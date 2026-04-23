import { useNavigate } from "react-router-dom";
import { Moodie } from "@/components/Moodie";
import { MUSIC_SITUATIONS } from "@/lib/modes";
import { useTheme } from "@/contexts/ThemeContext";
import { Music, Wind, Sparkles, ChevronRight } from "lucide-react";

/**
 * 홈 — 미니멀 리스트 중심.
 *
 * 위젯/큰 그라디언트 카드 X
 * 텍스트·타이포·여백으로 구성
 * 컬러는 아쿠아 포인트만 절제
 */

const SITUATION_FEELINGS: Record<string, { feeling: string; emoji: string }> = {
  relax: { feeling: "지친 날", emoji: "🌊" },
  meditate: { feeling: "마음이 흐릴 때", emoji: "🧘" },
  focus: { feeling: "집중하고 싶을 때", emoji: "🎯" },
  nap: { feeling: "잠깐 쉬고 싶은 날", emoji: "☕" },
  wake: { feeling: "상쾌한 아침", emoji: "☀️" },
  sleep: { feeling: "깊이 자고 싶은 밤", emoji: "🌙" },
  reading: { feeling: "독서의 시간", emoji: "📖" },
  wine: { feeling: "와인 한 잔", emoji: "🍷" },
  date: { feeling: "둘만의 시간", emoji: "💕" },
  candle: { feeling: "캔들 라이트", emoji: "🕯️" },
  tropical: { feeling: "트로피컬 해변", emoji: "🌴" },
  resort: { feeling: "리조트 수영장", emoji: "🏝️" },
  sunset: { feeling: "노을 지는 바닷가", emoji: "🌇" },
  mountain: { feeling: "산장의 밤", emoji: "🏔️" },
  tokyo: { feeling: "도쿄의 밤", emoji: "🌃" },
};

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

  // 현재 시간대에 어울리는 상황 추천 4개
  const recommended = MUSIC_SITUATIONS.filter((s) => {
    if (!s.showHours) return s.group === "core";
    const [start, end] = s.showHours;
    if (start <= end) return hour >= start && hour < end;
    return hour >= start || hour < end;
  }).slice(0, 4);

  return (
    <div className="px-6 pt-12 pb-6 flex-1 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-primary font-serif mb-1">
            {greeting}
          </p>
          <h1 className="text-[26px] font-bold text-foreground leading-tight">
            어떤 시간이 필요해요?
          </h1>
        </div>
        <Moodie size="small" />
      </header>

      {/* 3대 기능 — 리스트 */}
      <section className="mb-10">
        <h2 className="text-[10px] tracking-[0.25em] uppercase text-foreground/40 font-serif mb-4 px-1">
          Features
        </h2>
        <div className="divide-y divide-foreground/[0.08]">
          <PillarRow
            icon={<Music className="w-[18px] h-[18px]" strokeWidth={1.8} />}
            title="음악"
            subtitle="상황에 맞는 심리 음악과 주파수"
            onClick={() => navigate("/music")}
          />
          <PillarRow
            icon={<Wind className="w-[18px] h-[18px]" strokeWidth={1.8} />}
            title="호흡"
            subtitle="감정을 컨트롤하는 호흡법"
            onClick={() => navigate("/breathing")}
          />
          <PillarRow
            icon={<Sparkles className="w-[18px] h-[18px]" strokeWidth={1.8} />}
            title="깨기"
            subtitle="손끝으로 스트레스 해소"
            onClick={() => navigate("/release/glass")}
          />
        </div>
      </section>

      {/* 오늘의 추천 */}
      <section>
        <h2 className="text-[10px] tracking-[0.25em] uppercase text-foreground/40 font-serif mb-4 px-1">
          For this moment
        </h2>
        <div className="space-y-1.5">
          {recommended.map((s) => {
            const f = SITUATION_FEELINGS[s.id];
            if (!f) return null;
            return (
              <button
                key={s.id}
                onClick={() => navigate(`/music/${s.id}`)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-foreground/[0.04] active:bg-foreground/[0.07] transition-colors text-left"
              >
                <span className="text-xl shrink-0">{f.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-foreground leading-tight">
                    {f.feeling}
                  </p>
                  <p className="text-xs text-foreground/55 mt-0.5">
                    {s.subtitle}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-foreground/30 shrink-0" />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

interface PillarRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}

const PillarRow = ({ icon, title, subtitle, onClick }: PillarRowProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 py-4 px-1 text-left active:opacity-60 transition-opacity"
  >
    <div className="w-10 h-10 rounded-full border border-primary/25 bg-primary/5 flex items-center justify-center text-primary shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[17px] font-bold text-foreground leading-tight">
        {title}
      </p>
      <p className="text-xs text-foreground/55 mt-1">
        {subtitle}
      </p>
    </div>
    <ChevronRight className="w-4 h-4 text-foreground/30 shrink-0" />
  </button>
);

export default Home;
