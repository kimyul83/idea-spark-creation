import { useNavigate } from "react-router-dom";
import { MonetBackground } from "@/components/MonetBackground";
import { Moodie } from "@/components/Moodie";
import { PILLARS, MUSIC_SITUATIONS } from "@/lib/modes";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

/**
 * 홈 화면 — Endel 스타일 3대 기둥 중심.
 *
 * 구조:
 *   [Moodie + 인사]
 *   [3 Pillar 큰 카드: Music · Breath · Release]
 *   [오늘의 추천 상황 (가로 스크롤)]
 */
const Home = () => {
  const navigate = useNavigate();
  const { resolvedVariant } = useTheme();

  const hour = new Date().getHours();
  const greeting =
    hour < 6 ? "깊은 밤이에요 🌙" :
    hour < 11 ? "좋은 아침이에요 ☀️" :
    hour < 18 ? "오늘 어때요 ✨" :
    hour < 22 ? "편안한 저녁이에요 🌆" :
    "하루를 마무리해요 🌙";

  // 현재 시간에 어울리는 음악 상황 3개만 추천 (가로 스크롤)
  const recommended = MUSIC_SITUATIONS.filter((s) => {
    if (!s.showHours) return s.group === "core";
    const [start, end] = s.showHours;
    if (start <= end) return hour >= start && hour < end;
    return hour >= start || hour < end;
  }).slice(0, 4);

  return (
    <div className="px-5 pt-10 pb-6 relative flex-1 flex flex-col">
      <MonetBackground intensity="medium" />

      {/* Header */}
      <header className="flex items-center gap-3 mb-7 animate-fade-up">
        <Moodie size="small" />
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-primary font-medium font-serif">
            {greeting}
          </p>
          <h1 className="text-[22px] font-bold text-foreground mt-0.5 leading-tight">
            지금, 어떤 시간이 필요해요?
          </h1>
        </div>
      </header>

      {/* 3대 기둥 */}
      <section className="space-y-3 animate-fade-up">
        {PILLARS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => navigate(p.route)}
              className="group relative w-full overflow-hidden rounded-[28px] shadow-soft transition-all duration-300 active:scale-[0.98] hover:scale-[1.01] hover:shadow-card text-left"
              style={{ minHeight: 120 }}
            >
              <div
                className="absolute inset-0 opacity-95"
                style={{
                  background: `linear-gradient(135deg, ${p.gradient.from} 0%, ${p.gradient.to} 100%)`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              <div className="absolute -right-6 -bottom-8 opacity-15 text-white">
                <Icon className="w-[140px] h-[140px]" strokeWidth={0.9} />
              </div>

              <div className="relative p-6">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-white/90" strokeWidth={1.8} />
                  <span className="text-[10px] tracking-[0.25em] uppercase text-white/75 font-serif">
                    {p.subtitle}
                  </span>
                </div>
                <h2 className="mt-3 text-[28px] font-bold text-white drop-shadow-sm leading-none">
                  {p.title}
                </h2>
                <p className="mt-2 text-[13px] text-white/85 leading-snug max-w-[75%]">
                  {p.description}
                </p>
              </div>
            </button>
          );
        })}
      </section>

      {/* 오늘의 추천 상황 (가로 스크롤) */}
      <section className="mt-7 animate-fade-up">
        <div className="flex items-end justify-between mb-3 px-1">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-primary font-serif">
              For This Moment
            </p>
            <h3 className="text-[15px] font-bold text-foreground mt-0.5">
              지금 어울리는 순간
            </h3>
          </div>
          <button
            onClick={() => navigate("/music")}
            className="text-xs text-foreground/60 font-medium"
          >
            전체 보기 →
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory no-scrollbar">
          {recommended.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => navigate(`/music/${s.id}`)}
                className={cn(
                  "relative snap-start shrink-0 w-[150px] aspect-[3/4] rounded-[22px] overflow-hidden shadow-soft transition-all duration-300 active:scale-[0.97] text-left"
                )}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(160deg, ${s.gradient.from} 0%, ${s.gradient.to} 100%)`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="relative h-full flex flex-col justify-between p-3.5">
                  <Icon className="w-5 h-5 text-white/90" strokeWidth={1.7} />
                  <div>
                    <p className="text-[10px] text-white/75 tracking-wider uppercase font-serif">
                      {s.recommendedFrequency.label}
                    </p>
                    <div className="text-white font-bold text-[16px] mt-0.5 leading-tight">
                      {s.title}
                    </div>
                    <div className="text-[11px] text-white/80 mt-0.5 leading-tight">
                      {s.subtitle}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
