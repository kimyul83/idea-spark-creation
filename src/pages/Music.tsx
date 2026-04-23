import { useNavigate } from "react-router-dom";
import { MonetBackground } from "@/components/MonetBackground";
import { MUSIC_SITUATIONS, getSituationById } from "@/lib/modes";
import { FOCUS_MODES } from "@/types/db";
import { getIcon } from "@/lib/icon-map";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Music 페이지 — "상황에 맞는 주파수 + 심리 음악" 메인 화면.
 *
 * 섹션:
 *   1. Core 6 — 일상 기본 상황
 *   2. Mood 4 — 라이프스타일 무드
 *   3. 집중 5 — ADHD·작업·공부·딥워크·회의 전 (기존 Focus 모드)
 */
const Music = () => {
  const navigate = useNavigate();
  const hour = new Date().getHours();

  const core = MUSIC_SITUATIONS.filter((s) => s.group === "core");
  const mood = MUSIC_SITUATIONS.filter((s) => s.group === "mood");
  const travel = MUSIC_SITUATIONS.filter((s) => s.group === "travel");

  const isRecommended = (situation: (typeof MUSIC_SITUATIONS)[number]) => {
    if (!situation.showHours) return false;
    const [start, end] = situation.showHours;
    if (start <= end) return hour >= start && hour < end;
    return hour >= start || hour < end;
  };

  return (
    <div className="px-5 pt-12 pb-6 relative flex-1 flex flex-col">
      <MonetBackground intensity="medium" />

      <header className="animate-fade-up">
        <p className="text-[11px] tracking-[0.3em] uppercase text-primary font-serif">
          Music
        </p>
        <h1 className="text-[26px] font-bold text-foreground mt-1">
          상황에 맞는 심리 음악
        </h1>
        <p className="text-sm text-foreground/60 mt-1">
          주파수 · 자연 소리 · 앰비언트로 마음을 다독여요
        </p>
      </header>

      {/* Core 6 */}
      <section className="mt-7 animate-fade-up">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-foreground/50 font-serif mb-3 px-1">
          Core · 일상
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {core.map((s) => (
            <SituationCard key={s.id} situation={s} recommended={isRecommended(s)} onClick={() => navigate(`/music/${s.id}`)} />
          ))}
        </div>
      </section>

      {/* Mood 4 */}
      <section className="mt-7 animate-fade-up">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-foreground/50 font-serif mb-3 px-1">
          Mood · 라이프스타일
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {mood.map((s) => (
            <SituationCard key={s.id} situation={s} recommended={isRecommended(s)} onClick={() => navigate(`/music/${s.id}`)} />
          ))}
        </div>
      </section>

      {/* Travel 5 */}
      <section className="mt-7 animate-fade-up">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-foreground/50 font-serif mb-3 px-1">
          Travel · 여행 바이브 🌴
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {travel.map((s) => (
            <SituationCard key={s.id} situation={s} recommended={isRecommended(s)} onClick={() => navigate(`/music/${s.id}`)} />
          ))}
        </div>
      </section>

      {/* Focus 5 — 기존 집중 모드 유지 */}
      <section className="mt-7 animate-fade-up">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-foreground/50 font-serif mb-3 px-1">
          Focus · 집중 · 몰입
        </h2>
        <div className="space-y-2.5">
          {FOCUS_MODES.map((m) => {
            const Icon = getIcon(m.icon);
            const route = m.id === "adhd" ? "/focus/adhd" : `/session/focus/${m.id}`;
            return (
              <button
                key={m.id}
                onClick={() => navigate(route)}
                className="w-full surface rounded-2xl p-4 flex items-center gap-4 shadow-soft transition-all duration-300 active:scale-[0.98] hover:scale-[1.01] text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-foreground text-[15px]">{m.title}</div>
                  <div className="text-xs text-foreground/60 mt-0.5">
                    {m.durationMin}분 · {m.recommend}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-foreground/30" />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

interface SituationCardProps {
  situation: (typeof MUSIC_SITUATIONS)[number];
  recommended: boolean;
  onClick: () => void;
}

const SituationCard = ({ situation: s, recommended, onClick }: SituationCardProps) => {
  const Icon = s.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative aspect-square rounded-[22px] overflow-hidden shadow-soft transition-all duration-300 active:scale-[0.97] hover:scale-[1.02] text-left"
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, ${s.gradient.from} 0%, ${s.gradient.to} 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      {recommended && (
        <span className="absolute top-2.5 right-2.5 text-[9px] px-2 py-0.5 rounded-full bg-white/90 text-charcoal font-bold tracking-wider">
          NOW
        </span>
      )}
      <div className="relative h-full flex flex-col justify-between p-3.5">
        <Icon className="w-5 h-5 text-white/90" strokeWidth={1.7} />
        <div>
          <p className="text-[9px] text-white/75 tracking-wider uppercase font-serif">
            {s.recommendedFrequency.label}
          </p>
          <div className="text-white font-bold text-[18px] mt-0.5 leading-tight">
            {s.title}
          </div>
          <div className="text-[11px] text-white/80 mt-0.5 leading-tight">
            {s.subtitle}
          </div>
        </div>
      </div>
    </button>
  );
};

export default Music;
