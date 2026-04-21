import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Pause, Play, Square as Stop } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { Moodie } from "@/components/Moodie";
import { Button } from "@/components/ui/button";
import { getPatternById, PHASE_LABEL, type BreathingPhase } from "@/lib/breathing";
import { vibrate } from "@/lib/sfx";
import { supabase } from "@/integrations/supabase/client";
import { emotionNameToTint } from "@/lib/emotion-tint";
import { cn } from "@/lib/utils";

const PHASE_BG: Record<BreathingPhase, string> = {
  inhale: "radial-gradient(circle at 50% 50%, hsl(var(--monet-mint)) 0%, hsl(var(--sage)) 100%)",
  hold1:  "radial-gradient(circle at 50% 50%, hsl(var(--monet-cream-soft)) 0%, hsl(var(--monet-mint)) 100%)",
  exhale: "radial-gradient(circle at 50% 50%, hsl(var(--monet-lilac)) 0%, hsl(var(--monet-sky)) 100%)",
  hold2:  "radial-gradient(circle at 50% 50%, hsl(var(--monet-sky)) 0%, hsl(var(--monet-lilac)) 100%)",
};

const BreathingSession = () => {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const totalReps = Math.max(1, Number(params.get("reps") ?? 5));
  const emotionName = params.get("emotion");

  const pattern = useMemo(() => getPatternById(id ?? "box"), [id]);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(pattern.phases[0].seconds);
  const [rep, setRep] = useState(1);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const tickRef = useRef<number | null>(null);

  const currentPhase = pattern.phases[phaseIdx];

  // Timer loop
  useEffect(() => {
    if (!running || done) return;
    tickRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        // advance to next phase
        const nextPhaseIdx = phaseIdx + 1;
        if (nextPhaseIdx >= pattern.phases.length) {
          // rep complete
          if (rep >= totalReps) {
            setRunning(false);
            setDone(true);
            saveSession();
            return 0;
          }
          setRep((r) => r + 1);
          setPhaseIdx(0);
          vibrate([200]);
          return pattern.phases[0].seconds;
        }
        setPhaseIdx(nextPhaseIdx);
        vibrate([200]);
        return pattern.phases[nextPhaseIdx].seconds;
      });
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIdx, rep, done]);

  const saveSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const elapsed = Math.round((Date.now() - startedAtRef.current) / 1000);
    await supabase.from("sessions").insert({
      user_id: user.id,
      session_type: "breathing",
      duration_seconds: elapsed,
      completed: true,
    });
  };

  const stop = async () => {
    setRunning(false);
    await saveSession();
    navigate("/breathing");
  };

  const restart = () => {
    setPhaseIdx(0);
    setSecondsLeft(pattern.phases[0].seconds);
    setRep(1);
    setRunning(true);
    setDone(false);
    startedAtRef.current = Date.now();
  };

  // Animation: scale from 0.5 to 1.3 over phase duration
  const isInhale = currentPhase.phase === "inhale";
  const isExhale = currentPhase.phase === "exhale";
  const targetScale = isInhale ? 1.3 : isExhale ? 0.5 : currentPhase.phase === "hold1" ? 1.3 : 0.5;
  const targetOpacity = isInhale ? 1 : isExhale ? 0.4 : currentPhase.phase === "hold1" ? 1 : 0.5;

  return (
    <div className="min-h-screen flex flex-col relative">
      <MonetBackground
        intensity="strong"
        emotion={emotionName ? emotionNameToTint(emotionName) : "default"}
      />

      {/* top bar */}
      <div className="px-5 pt-12 flex items-center justify-between relative z-10">
        <button
          onClick={() => navigate("/breathing")}
          className="w-10 h-10 rounded-full surface flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-charcoal" />
        </button>
        <div className="text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-sage-deep font-serif">
            {pattern.id.toUpperCase()}
          </p>
          <p className="text-xs text-charcoal/60 mt-0.5">{rep} / {totalReps}회</p>
        </div>
        <div className="w-10" />
      </div>

      {/* phase label */}
      <div className="text-center mt-10 relative z-10">
        <p
          key={`${rep}-${phaseIdx}`}
          className="text-[20px] font-semibold text-charcoal animate-fade-up"
        >
          {PHASE_LABEL[currentPhase.phase]} {currentPhase.seconds}초
        </p>
        <p className="text-charcoal/50 text-sm mt-1 tabular-nums">{secondsLeft}</p>
      </div>

      {/* breathing circle */}
      <div className="flex-1 flex items-center justify-center relative">
        <div
          className="rounded-full shadow-card"
          style={{
            width: 260,
            height: 260,
            background: PHASE_BG[currentPhase.phase],
            transform: `scale(${targetScale})`,
            opacity: targetOpacity,
            transition: `transform ${currentPhase.seconds}s cubic-bezier(0.4, 0, 0.2, 1), opacity ${currentPhase.seconds}s cubic-bezier(0.4, 0, 0.2, 1), background ${currentPhase.seconds}s ease`,
          }}
        />
      </div>

      {/* controls */}
      <div className="px-6 pb-10 flex items-center justify-center gap-3 relative z-10">
        <Button
          variant="ghost"
          onClick={stop}
          className="h-14 px-6 rounded-2xl bg-white/70 backdrop-blur-sm text-charcoal hover:bg-white/90"
        >
          <Stop className="w-5 h-5 mr-2" /> 종료
        </Button>
        <Button
          onClick={() => setRunning((r) => !r)}
          className="h-16 px-8 rounded-2xl bg-charcoal hover:bg-charcoal/90 text-cream font-semibold flex-1 max-w-[200px]"
        >
          {running ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
          {running ? "일시정지" : "이어하기"}
        </Button>
      </div>

      {/* done modal */}
      {done && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-charcoal/40 backdrop-blur-sm animate-fade-up">
          <div className="surface rounded-3xl p-8 w-full max-w-sm text-center shadow-card">
            <div className="flex justify-center">
              <Moodie size="medium" emotion="happy" />
            </div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-sage-deep font-serif mt-4">
              Well done
            </p>
            <h2 className="text-2xl font-bold text-charcoal mt-2">완료했어요!</h2>
            <p className="text-sm text-charcoal/60 mt-2">
              {totalReps}회 호흡을 마쳤어요.<br />마음이 한결 가벼워졌길 바라요 🌿
            </p>
            <div className="grid grid-cols-2 gap-2 mt-6">
              <Button
                variant="ghost"
                onClick={restart}
                className="h-12 rounded-2xl bg-white/80 text-charcoal hover:bg-white"
              >
                한 번 더
              </Button>
              <Button
                onClick={() => navigate("/home")}
                className={cn("h-12 rounded-2xl bg-charcoal text-cream hover:bg-charcoal/90")}
              >
                홈으로
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreathingSession;
