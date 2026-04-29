import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pause, Play, Wind, Sparkles, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmotionRow, FOCUS_MODES, SoundRow } from "@/types/db";
import { audioEngine } from "@/lib/audio-engine";
import { getIcon } from "@/lib/icon-map";
import { Moody } from "@/components/Moody";
import { MonetBackground } from "@/components/MonetBackground";
import { emotionNameToTint } from "@/lib/emotion-tint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { emotionToBreathingId } from "@/lib/breathing";
import { usePremium, markAdhdUsed } from "@/hooks/usePremium";

const DURATIONS = [15, 30, 60];

const Session = () => {
  const { type, id } = useParams<{ type: "emotion" | "focus"; id: string }>();
  const navigate = useNavigate();
  const { isPremium } = usePremium();

  const [emotion, setEmotion] = useState<EmotionRow | null>(null);
  const [sounds, setSounds] = useState<SoundRow[]>([]);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [durationMin, setDurationMin] = useState(15);
  const [remaining, setRemaining] = useState(15 * 60);
  const [running, setRunning] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const tickRef = useRef<number | null>(null);

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

  useEffect(() => setRemaining(durationMin * 60), [durationMin]);

  const focusMode = type === "focus" ? FOCUS_MODES.find((m) => m.id === id) : null;

  const headerStyle = useMemo(() => {
    if (emotion) {
      return { background: `linear-gradient(160deg, ${emotion.gradient_from} 0%, ${emotion.gradient_to} 100%)` };
    }
    return { background: "linear-gradient(160deg, hsl(var(--sage-deep)) 0%, hsl(var(--charcoal)) 100%)" };
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
    // 자연 사운드는 실제 CC0 mp3 우선, 실패 시 합성 폴백
    if (s.category === "nature") {
      const map: Record<string, "rain"|"ocean"|"wind"|"forest"|"stream"|"cave"|"sun"|"birds"> = {
        "숲속": "forest", "바다 파도": "ocean", "빗소리": "rain",
        "새소리": "birds", "폭포": "stream", "바람 소리": "wind",
        "동굴 울림": "cave", "따뜻한 햇살": "sun",
      };
      const kind = map[s.name];
      if (kind) audioEngine.playNatureReal(s.id, kind);
      else audioEngine.playTone(s.id, 432);
    } else if (s.source_type === "url" && s.audio_url) {
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

  useEffect(() => {
    if (running) {
      tickRef.current = window.setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            audioEngine.stopAll();
            setRunning(false);
            saveSession(true);
            setDoneOpen(true);
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
    <div className="min-h-screen flex flex-col relative">
      <MonetBackground intensity="strong" emotion={emotionNameToTint(emotion?.name)} />
      {/* hero */}
      <div style={headerStyle} className="relative px-5 pt-12 pb-8 text-white rounded-b-[32px]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="mt-4 flex items-center gap-4">
          <div className={cn("w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center", running && "animate-breathe")}>
            <HeaderIcon className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-white/70 font-serif">
              {emotion ? "Emotion" : "Focus"}
            </p>
            <h1 className="text-[24px] font-bold mt-0.5">{title}</h1>
            <p className="text-white/80 text-xs mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="text-[64px] font-serif tabular-nums tracking-tight leading-none">{fmt(remaining)}</div>
          <div className="mt-4 flex justify-center gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                disabled={running}
                onClick={() => setDurationMin(d)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300",
                  durationMin === d ? "bg-white text-charcoal" : "bg-white/15 text-white",
                  running && "opacity-40"
                )}
              >
                {d}분
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* quick actions for emotion sessions */}
      {emotion && (
        <div className="px-5 pt-5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const bid = emotionToBreathingId(emotion.name);
                navigate(`/breathing/session/${bid}?reps=5&emotion=${encodeURIComponent(emotion.name)}`);
              }}
              className="surface rounded-2xl p-4 text-left active:scale-[0.98] transition shadow-soft"
            >
              <Wind className="w-5 h-5 text-sage-deep" strokeWidth={1.6} />
              <div className="font-bold text-charcoal text-sm mt-2">호흡 가이드</div>
              <div className="text-[11px] text-charcoal/60 mt-0.5">
                추천: {emotion.recommended_breathing ?? "박스 호흡"}
              </div>
            </button>
            {emotion.name === "분노" ? (
              <button
                onClick={() => navigate("/release/glass")}
                className="surface rounded-2xl p-4 text-left active:scale-[0.98] transition shadow-soft relative"
              >
                {!isPremium && (
                  <Lock className="absolute top-2 right-2 w-3.5 h-3.5 text-charcoal/50" />
                )}
                <Sparkles className="w-5 h-5 text-terracotta" strokeWidth={1.6} />
                <div className="font-bold text-charcoal text-sm mt-2">유리 깨기 영상</div>
                <div className="text-[11px] text-charcoal/60 mt-0.5">시원하게 풀어내요</div>
              </button>
            ) : (
              <button
                onClick={() => toast("곧 만나보실 수 있어요 🌿")}
                className="surface rounded-2xl p-4 text-left active:scale-[0.98] transition shadow-soft opacity-70"
              >
                <Sparkles className="w-5 h-5 text-sage-deep" strokeWidth={1.6} />
                <div className="font-bold text-charcoal text-sm mt-2">영상 가이드</div>
                <div className="text-[11px] text-charcoal/60 mt-0.5">준비 중</div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* sound mixer */}
      <div className="flex-1 px-5 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-charcoal">사운드 믹스</h2>
          <span className="text-xs text-charcoal/50">{activeIds.length}개 선택됨</span>
        </div>

        <SoundSection title="자연" sounds={sounds.filter((s) => s.category === "nature")} active={activeIds} onToggle={toggleSound} />
        <SoundSection title="주파수" sounds={sounds.filter((s) => s.category === "frequency")} active={activeIds} onToggle={toggleSound} />
        <SoundSection title="ASMR" sounds={sounds.filter((s) => s.category === "asmr")} active={activeIds} onToggle={toggleSound} />
      </div>

      {/* play button */}
      <div className="sticky bottom-0 px-5 pb-6 pt-4 bg-gradient-to-t from-cream/85 via-cream/60 to-transparent backdrop-blur-sm">
        <Button
          size="lg"
          onClick={togglePlay}
          className="w-full h-16 rounded-2xl bg-charcoal hover:bg-charcoal/90 text-cream text-base font-bold shadow-soft"
        >
          {running ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
          {running ? "일시정지" : "세션 시작"}
        </Button>
      </div>

      {/* done modal */}
      {doneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-charcoal/40 backdrop-blur-sm animate-fade-up">
          <div className="surface rounded-3xl p-8 w-full max-w-sm text-center shadow-card">
            <Moody size="medium" />
            <p className="text-[11px] tracking-[0.3em] uppercase text-sage-deep font-serif mt-4">
              Well done
            </p>
            <h2 className="text-2xl font-bold text-charcoal mt-2">세션을 마쳤어요</h2>
            <p className="text-sm text-charcoal/60 mt-2">
              {durationMin}분 동안 마음을 돌봤어요.<br />잘하셨어요 🌿
            </p>
            <Button
              onClick={() => { setDoneOpen(false); navigate("/home"); }}
              className="w-full h-12 mt-6 rounded-2xl bg-charcoal hover:bg-charcoal/90 text-cream"
            >
              홈으로
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const SoundSection = ({
  title, sounds, active, onToggle,
}: { title: string; sounds: SoundRow[]; active: string[]; onToggle: (s: SoundRow) => void }) => {
  if (sounds.length === 0) return null;
  return (
    <div className="mb-5">
      <h3 className="text-[11px] tracking-[0.2em] uppercase text-charcoal/50 font-serif mb-2 px-1">{title}</h3>
      <div className="grid grid-cols-3 gap-2">
        {sounds.map((s) => {
          const Icon = getIcon(s.icon_name);
          const isActive = active.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => onToggle(s)}
              className={cn(
                "p-3 rounded-2xl border transition-all duration-300 active:scale-95 hover:scale-[1.02] flex flex-col items-center gap-1.5",
                isActive
                  ? "bg-sage-deep border-sage-deep text-white shadow-soft"
                  : "bg-white/80 border-beige text-charcoal hover:border-sage-deep/40"
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
