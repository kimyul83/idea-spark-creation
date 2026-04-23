import { useNavigate } from "react-router-dom";
import { MUSIC_SITUATIONS } from "@/lib/modes";
import { SITUATION_DETAILS } from "@/lib/situation-details";
import { FOCUS_MODES } from "@/types/db";
import { getIcon } from "@/lib/icon-map";
import { ChevronRight } from "lucide-react";

/**
 * Music — 테라피·임상 스타일.
 * 컬러 위젯 제거. 수치·과학 정보 중심.
 * 임상 분위기: 수면클리닉, 뇌 웰니스 센터 느낌.
 */
const Music = () => {
  const navigate = useNavigate();
  const hour = new Date().getHours();

  const core = MUSIC_SITUATIONS.filter((s) => s.group === "core");
  const mood = MUSIC_SITUATIONS.filter((s) => s.group === "mood");
  const travel = MUSIC_SITUATIONS.filter((s) => s.group === "travel");

  return (
    <div className="px-6 pt-12 pb-6 flex-1 flex flex-col">
      {/* Header */}
      <header className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-serif">
          Therapeutic Soundscape
        </p>
        <h1 className="text-[26px] font-bold text-foreground mt-1.5 leading-tight">
          상황별 심리 음악
        </h1>
        <p className="text-xs text-foreground/55 mt-2 leading-relaxed">
          주파수 · 자연 녹음 · 앰비언트 레이어링<br />
          뇌파 동조 기반 사운드 테라피
        </p>
      </header>

      <Section title="Essentials" subtitle="일상 · Core 6">
        {core.map((s) => <Row key={s.id} id={s.id} onClick={() => navigate(`/music/${s.id}`)} />)}
      </Section>

      <Section title="Mood" subtitle="라이프스타일">
        {mood.map((s) => <Row key={s.id} id={s.id} onClick={() => navigate(`/music/${s.id}`)} />)}
      </Section>

      <Section title="Escape" subtitle="여행 바이브 · Travel">
        {travel.map((s) => <Row key={s.id} id={s.id} onClick={() => navigate(`/music/${s.id}`)} />)}
      </Section>

      <Section title="Focus Modes" subtitle="집중·뽀모도로">
        {FOCUS_MODES.map((m) => {
          const Icon = getIcon(m.icon);
          const route = m.id === "adhd" ? "/focus/adhd" : `/session/focus/${m.id}`;
          return (
            <button
              key={m.id}
              onClick={() => navigate(route)}
              className="w-full flex items-start gap-4 py-4 border-b border-foreground/[0.06] active:opacity-60 transition text-left"
            >
              <Icon className="w-4 h-4 text-primary mt-1 shrink-0" strokeWidth={1.6} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-[15px] font-bold text-foreground">{m.title}</p>
                  <span className="text-[10px] text-foreground/45 font-mono">{m.durationMin}min</span>
                </div>
                <p className="text-xs text-foreground/55 mt-1">{m.recommend}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-foreground/25 shrink-0 mt-1" />
            </button>
          );
        })}
      </Section>
    </div>
  );
};

const Section: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <section className="mb-10">
    <div className="mb-3 px-1">
      <p className="text-[10px] tracking-[0.25em] uppercase text-primary font-serif">
        {title}
      </p>
      <p className="text-[11px] text-foreground/45 mt-0.5">{subtitle}</p>
    </div>
    <div className="divide-y divide-foreground/[0.06]">{children}</div>
  </section>
);

const Row: React.FC<{ id: string; onClick: () => void }> = ({ id, onClick }) => {
  const detail = SITUATION_DETAILS[id];
  if (!detail) return null;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-4 py-4 active:opacity-60 transition-opacity text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-[15px] font-bold text-foreground leading-tight">
            {detail.mood}
          </p>
          <span className="text-[10px] font-mono text-primary tracking-wide">
            {detail.frequencyLabel}
          </span>
        </div>
        <p className="text-[12px] text-foreground/60 mt-1 leading-snug">
          {detail.scene}
        </p>
        <p className="text-[10px] text-foreground/40 mt-1.5 leading-snug">
          {detail.effect}
        </p>
        <div className="flex gap-1.5 mt-2">
          {detail.genreTags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] text-foreground/55 px-1.5 py-0.5 rounded-full border border-foreground/10 tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-foreground/25 shrink-0 mt-1" />
    </button>
  );
};

export default Music;
