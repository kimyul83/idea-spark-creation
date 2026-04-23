import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { Moodie } from "@/components/Moodie";
import { MUSIC_SITUATIONS } from "@/lib/modes";
import { SITUATION_DETAILS } from "@/lib/situation-details";
import { FOCUS_MODES } from "@/types/db";
import { getIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

/**
 * Music — Breath 페이지와 완전 통일 스타일.
 * liquid-card 리스트 · 탭 세그먼트 · 다크+아쿠아.
 */

type Cat = "core" | "mood" | "travel" | "focus";

const CATEGORIES: { id: Cat; label: string }[] = [
  { id: "core",   label: "일상" },
  { id: "mood",   label: "무드" },
  { id: "travel", label: "여행" },
  { id: "focus",  label: "집중" },
];

const Music = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<Cat>("core");

  const situations =
    category === "focus"
      ? []
      : MUSIC_SITUATIONS.filter((s) => s.group === category);

  return (
    <div className="px-5 pt-12 pb-6 relative flex-1 flex flex-col">
      <MonetBackground intensity="medium" />

      {/* Header */}
      <div className="animate-fade-up">
        <p className="text-[11px] tracking-[0.3em] uppercase text-primary font-serif">
          Music
        </p>
        <h1 className="text-[26px] font-bold text-foreground mt-1 leading-tight">
          상황별 심리 음악
        </h1>
        <p className="text-sm text-foreground/60 mt-1">
          지금 필요한 무드를 골라요
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-5 grid grid-cols-4 gap-1.5 liquid-card p-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              "segment-item rounded-2xl py-2 text-xs font-medium",
              category === c.id
                ? "is-active bg-primary text-primary-foreground"
                : "text-foreground/60 hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mt-4 space-y-2.5">
        {category !== "focus" &&
          situations.map((s) => {
            const d = SITUATION_DETAILS[s.id];
            if (!d) return null;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => navigate(`/music/${s.id}`)}
                className="liquid-card liquid-card-hover w-full p-4 flex items-center gap-3 text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-bold text-foreground text-[15px]">
                      {d.mood}
                    </span>
                    <span className="text-[10px] font-mono text-primary tracking-wide">
                      {d.frequencyLabel}
                    </span>
                  </div>
                  <div className="text-[11px] text-foreground/60 mt-0.5">
                    {d.scene}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] text-primary font-medium">
                      {d.effect}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    {d.genreTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] text-foreground/50 px-1.5 py-0.5 rounded-full border border-foreground/15 tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-foreground/30 shrink-0" />
              </button>
            );
          })}

        {category === "focus" &&
          FOCUS_MODES.map((m) => {
            const Icon = getIcon(m.icon);
            const route = m.id === "adhd" ? "/focus/adhd" : `/session/focus/${m.id}`;
            return (
              <button
                key={m.id}
                onClick={() => navigate(route)}
                className="liquid-card liquid-card-hover w-full p-4 flex items-center gap-3 text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-foreground text-[15px]">
                      {m.title}
                    </span>
                    <span className="text-[10px] font-mono text-primary">
                      {m.durationMin} min
                    </span>
                  </div>
                  <div className="text-[11px] text-foreground/60 mt-0.5">
                    {m.recommend}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-foreground/30 shrink-0" />
              </button>
            );
          })}
      </div>

      {/* Moodie */}
      <div className="flex-1 flex items-end justify-center pt-6">
        <div className="text-center opacity-80">
          <Moodie size={48} />
          <p className="text-[11px] text-foreground/50 mt-2 font-serif tracking-widest">
            과학이 · 마음을 · 돌봐요
          </p>
        </div>
      </div>
    </div>
  );
};

export default Music;
