import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pause, Play, Heart, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmotionRow, FOCUS_MODES, SoundRow } from "@/types/db";
import { audioEngine } from "@/lib/audio-engine";
import { getIcon } from "@/lib/icon-map";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DURATIONS = [15, 30, 60];

const Session = () => {
  const { type, id } = useParams<{ type: "emotion" | "focus"; id: string }>();
  const navigate = useNavigate();

  const [emotion, setEmotion] = useState<EmotionRow | null>(null);
  const [sounds, setSounds] = useState<SoundRow[]>([]);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [durationMin, setDurationMin] = useState(15);
  const [remaining, setRemaining] = useState(15 * 60);
  const [running, setRunning] = useState(false);
  const tickRef = useRef<number | null>(null);

  // load data
  useEffect(() => {
    (async () => {
      if (type === "emotion") {
        const { data } = await supabase.from("emotions").select("*").eq("id", id!).maybeSingle();
        setEmotion(data as EmotionRow | null);
      } else if (type === "focus") {
        const m = FOCUS_MODES.find((x) => x.id === id);
        if (m) {
          setDurationMin(m.durationMin);
          setRemaining(m.durationMin * 60);
        }
      }
      const { data: s } = await supabase.from("sounds").select("*").order("category");
      setSounds((s ?? []) as SoundRow[]);
    })();

    return () => {
      audioEngine.stopAll();
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [type, id]);

  useEffect(() => {
    setRemaining(durationMin * 60);
  }, [durationMin]);

  const focusMode = type === "focus" ? FOCUS_MODES.find((m) => m.id === id) : null;

  const headerStyle = useMemo(() => {
    if (emotion) {
      return { background: `linear-gradient(160deg, ${emotion.gradient_from} 0%, ${emotion.gradient_to} 100%)` };
    }
    return { background: "linear-gradient(160deg, hsl(var(--mint-deep)) 0%, hsl(var(--navy)) 100%)" };
  }, [emotion]);

  const HeaderIcon = getIcon(emotion?.icon_name ?? focusMode?.icon);
  const title = emotion?.name ?? focusMode?.title ?? "세션";
  const subtitle = emotion
    ? `추천 호흡: ${emotion.recommended_breathing ?? "4-4-4-4"}`
    : focusMode?.recommend ?? "";

  const toggleSound = (s: SoundRow) => {
    if (activeIds.includes(s.id)) {
      audioEngine.stop(s.id);
      setActiveIds((p) => p.filter((x) => x !== s.id));
      return;
    }
    if (s.source_type === "url" && s.audio_url) {
      audioEngine.playUrl(s.id, s.audio_url, 0.6);
    } else if (s.source_type === "web_audio") {
      if (s.name.includes("브라운")) audioEngine.playNoise(s.id, "brown");
      else if (s.name.includes("핑크")) audioEngine.playNoise(s.id, "pink");
      else if (s.name.includes("화이트")) audioEngine.playNoise(s.id, "white");
      else audioEngine.playTone(s.id, s.frequency_hz ?? 432);
    }
    setActiveIds((p) => [...p, s.id]);
  };

  const togglePlay = () => {
    if (activeIds.length === 0) {
      toast("사운드를 먼저 선택해주세요");
      return;
    }
    setRunning((r) => !r);
  };

  // timer tick
  useEffect(() => {
    if (running) {
      tickRef.current = window.setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            audioEngine.stopAll();
            setRunning(false);
            saveSession(true);
            toast.success("세션 완료! 잘하셨어요 🌿");
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else if (tickRef.current) {
      window.clearInterval(tickRef.current);
    }
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const saveSession = async (completed: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const elapsed = durationMin * 60 - remaining;
    if (type === "focus" && focusMode) {
      await supabase.from("focus_sessions").insert({
        user_id: user.id,
        mode: focusMode.id,
        planned_duration: durationMin * 60,
        actual_duration: elapsed,
      });
    } else {
      await supabase.from("sessions").insert({
        user_id: user.id,
        session_type: emotion ? "sound" : "focus",
        emotion_id: emotion?.id,
        duration_seconds: elapsed,
        completed,
      });
    }
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* hero */}
      <div style={headerStyle} className="relative px-5 pt-12 pb-8 text-white">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="mt-6 flex items-center gap-4">
          <div
            className={cn(
              "w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center",
              running && "animate-breathe"
            )}
          >
            <HeaderIcon className="w-9 h-9" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-white/80 text-sm mt-1">{subtitle}</p>
          </div>
        </div>

        {/* timer display */}
        <div className="mt-8 text-center">
          <div className="text-6xl font-bold tabular-nums tracking-tight">{fmt(remaining)}</div>
          <div className="mt-3 flex justify-center gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                disabled={running}
                onClick={() => setDurationMin(d)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                  durationMin === d
                    ? "bg-white text-navy"
                    : "bg-white/20 text-white",
                  running && "opacity-40"
                )}
              >
                {d}분
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* sound mixer */}
      <div className="flex-1 px-5 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-navy">사운드 믹스</h2>
          <span className="text-xs text-navy-soft/60">{activeIds.length}개 선택됨</span>
        </div>

        <SoundSection title="자연" sounds={sounds.filter((s) => s.category === "nature")} active={activeIds} onToggle={toggleSound} />
        <SoundSection title="주파수" sounds={sounds.filter((s) => s.category === "frequency")} active={activeIds} onToggle={toggleSound} />
        <SoundSection title="ASMR" sounds={sounds.filter((s) => s.category === "asmr")} active={activeIds} onToggle={toggleSound} />
      </div>

      {/* play button */}
      <div className="sticky bottom-0 px-5 pb-6 pt-4 bg-gradient-to-t from-cream via-cream/95 to-transparent">
        <Button
          size="lg"
          onClick={togglePlay}
          className="w-full h-16 rounded-2xl bg-navy hover:bg-navy/90 text-white text-base font-bold shadow-card"
        >
          {running ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
          {running ? "일시정지" : "세션 시작"}
        </Button>
      </div>
    </div>
  );
};

const SoundSection = ({
  title, sounds, active, onToggle,
}: { title: string; sounds: SoundRow[]; active: string[]; onToggle: (s: SoundRow) => void }) => {
  if (sounds.length === 0) return null;
  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-navy-soft/70 mb-2 px-1">{title}</h3>
      <div className="grid grid-cols-3 gap-2">
        {sounds.map((s) => {
          const Icon = getIcon(s.icon_name);
          const isActive = active.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => onToggle(s)}
              className={cn(
                "p-3 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center gap-1.5",
                isActive
                  ? "bg-gradient-mint border-mint-deep text-white shadow-glow"
                  : "bg-white/80 border-mint/20 text-navy hover:border-mint/50"
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={1.8} />
              <span className="text-[11px] font-medium leading-tight text-center">{s.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Session;
