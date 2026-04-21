import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, X } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { Button } from "@/components/ui/button";
import { playShatter, vibrate } from "@/lib/sfx";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Clip {
  id: string;
  title: string;
  hint: string;
  /** Hue for the placeholder thumbnail gradient. */
  hue: number;
}

const CLIPS: Clip[] = [
  { id: "g1", title: "와인잔 산산조각", hint: "고요한 깨짐", hue: 200 },
  { id: "g2", title: "거울 박살", hue: 260, hint: "큰 카타르시스" },
  { id: "g3", title: "유리병 슬로우", hue: 30, hint: "느린 깨짐" },
  { id: "g4", title: "쇼윈도우", hue: 340, hint: "강렬함" },
  { id: "g5", title: "유리벽 폭파", hue: 160, hint: "최대치" },
];

const GlassBreak = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<Clip | null>(null);
  const [taps, setTaps] = useState(0);

  const open = (c: Clip) => {
    setActive(c);
    setTaps(0);
  };

  const close = async (saveIt = true) => {
    if (saveIt) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("sessions").insert({
          user_id: user.id,
          session_type: "glass",
          duration_seconds: taps * 2,
          completed: true,
        });
      }
    }
    setActive(null);
  };

  const tap = () => {
    playShatter(0.5);
    vibrate([50, 50, 50]);
    setTaps((t) => t + 1);
  };

  return (
    <div className="min-h-screen relative">
      <MonetBackground intensity="medium" emotion="angry" />

      <div className="px-5 pt-12 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full surface flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-charcoal" />
        </button>
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-sage-deep font-serif">
            Release
          </p>
          <h1 className="text-[24px] font-bold text-charcoal">유리 깨기</h1>
        </div>
      </div>

      <p className="px-5 mt-3 text-sm text-charcoal/60">
        영상을 탭할 때마다 시원하게 부서져요. 마음껏 분노를 풀어보세요.
      </p>

      <div className="px-5 mt-6 grid grid-cols-2 gap-3 pb-10">
        {CLIPS.map((c) => (
          <button
            key={c.id}
            onClick={() => open(c)}
            className="group relative aspect-[3/4] rounded-3xl overflow-hidden shadow-soft transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] hover:shadow-card text-left"
          >
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(160deg, hsl(${c.hue} 50% 75%) 0%, hsl(${c.hue + 30} 35% 35%) 100%)`,
              }}
            />
            {/* fake glass crack lines */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M50 50 L20 10 M50 50 L80 15 M50 50 L90 60 M50 50 L60 95 M50 50 L10 80" stroke="white" strokeWidth="0.5" fill="none" />
              <path d="M50 50 L35 30 M50 50 L70 40 M50 50 L65 70 M50 50 L30 60" stroke="white" strokeWidth="0.3" fill="none" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
            <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <div className="font-bold text-[15px] drop-shadow">{c.title}</div>
              <div className="text-[11px] opacity-80 drop-shadow">{c.hint}</div>
            </div>
          </button>
        ))}
      </div>

      {/* fullscreen player */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-charcoal flex flex-col"
          onClick={tap}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, hsl(${active.hue} 55% 55%) 0%, hsl(${active.hue} 30% 12%) 100%)`,
            }}
          />
          {/* expanding crack effect on tap */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {Array.from({ length: Math.min(taps, 40) }).map((_, i) => {
              const angle = (i * 137.5) % 360;
              const len = 40 + (i % 5) * 10;
              const x = 50 + Math.cos((angle * Math.PI) / 180) * len * 0.7;
              const y = 50 + Math.sin((angle * Math.PI) / 180) * len * 0.7;
              return (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={x}
                  y2={y}
                  stroke="white"
                  strokeOpacity="0.6"
                  strokeWidth="0.3"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-white/80 text-center">
              <div className="text-[11px] tracking-[0.3em] uppercase font-serif">
                Tap to break
              </div>
              <div className="font-bold text-2xl mt-1">{active.title}</div>
              <div className="text-sm mt-2 opacity-70">{taps} 번 깨뜨렸어요</div>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); close(true); }}
            className="absolute top-12 right-5 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {taps >= 10 && (
            <div className="absolute bottom-10 left-0 right-0 px-6 flex gap-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <Button
                onClick={() => setTaps(0)}
                variant="ghost"
                className="flex-1 h-14 rounded-2xl bg-white/15 text-white hover:bg-white/25"
              >
                한 번 더
              </Button>
              <Button
                onClick={() => { close(true); navigate("/home"); }}
                className={cn("flex-1 h-14 rounded-2xl bg-cream text-charcoal hover:bg-cream/90 font-semibold")}
              >
                홈으로
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlassBreak;
