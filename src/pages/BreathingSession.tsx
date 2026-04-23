import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Pause, Play, Square as Stop, Volume2, VolumeX } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { Moodie } from "@/components/Moodie";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getPatternById, PHASE_LABEL,
  type BreathingVisualId,
} from "@/lib/breathing";
import { BreathingVisual } from "@/components/BreathingVisuals";
import { vibrate } from "@/lib/sfx";
import { supabase } from "@/integrations/supabase/client";
import { emotionNameToTint } from "@/lib/emotion-tint";
import { cn } from "@/lib/utils";
import {
  speak, stopSpeaking, isTtsMuted, setTtsMuted, primeTts,
  BREATH_PHRASES, BREATH_PHRASES_SHORT,
} from "@/lib/tts";

const BreathingSession = () => {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const totalReps = Math.max(1, Number(params.get("reps") ?? 5));
  const emotionName = params.get("emotion");
  const visual = (params.get("visual") as BreathingVisualId) || "bubble";

  const pattern = useMemo(() => getPatternById(id ?? "box"), [id]);
  const isCycle = pattern.style === "cycle";
  const cycleReps = pattern.cycleReps ?? 1;

  // For cycle-style patterns, one "rep" = `cycleReps` micro-cycles through phases.
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(pattern.phases[0].seconds);
  const [rep, setRep] = useState(1);
  const [microRep, setMicroRep] = useState(1); // counter inside a cycle rep
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);
  const [muted, setMutedState] = useState(isTtsMuted());
  const startedAtRef = useRef<number>(Date.now());
  const tickRef = useRef<number | null>(null);

  const currentPhase = pattern.phases[phaseIdx];

  // TTS 초기화 (voice 리스트 미리 로드)
  useEffect(() => { primeTts(); }, []);

  // 시작 시 첫 안내
  useEffect(() => {
    if (muted || done) return;
    const initial = isCycle
      ? `${pattern.title}, 시작할게요`
      : `${pattern.title}을 시작할게요. 편안하게 따라해보세요.`;
    speak(initial, { rate: 0.95 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 단계가 바뀔 때마다 음성 안내
  useEffect(() => {
    if (muted || done || !running) return;
    const phrase = isCycle
      ? BREATH_PHRASES_SHORT[currentPhase.phase]
      : BREATH_PHRASES[currentPhase.phase];
    speak(phrase, { rate: isCycle ? 1.2 : 0.92 });
    return () => { /* 단계 이동 시 자동 cancel 됨 */ };
  }, [phaseIdx, rep, microRep, muted]); // eslint-disable-line react-hooks/exhaustive-deps

  // 완료 메시지
  useEffect(() => {
    if (done && !muted) {
      speak("잘하셨어요. 호흡을 마쳤어요.", { rate: 0.9 });
    }
  }, [done, muted]);

  // 컴포넌트 unmount 시 음성 중단
  useEffect(() => () => stopSpeaking(), []);

  const toggleMute = () => {
    const next = !muted;
    setMutedState(next);
    setTtsMuted(next);
    if (next) stopSpeaking();
  };

  // Tick — supports fractional seconds (cycle styles use 0.6–1.5s).
  useEffect(() => {
    if (!running || done) return;
    const tickMs = 100; // 100ms tick for fractional precision
    tickRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        const next = +(s - tickMs / 1000).toFixed(2);
        if (next > 0) return next;
        // advance phase
        const nextPhaseIdx = phaseIdx + 1;
        if (nextPhaseIdx >= pattern.phases.length) {
          // micro-cycle complete
          if (isCycle && microRep < cycleReps) {
            setMicroRep((m) => m + 1);
            setPhaseIdx(0);
            return pattern.phases[0].seconds;
          }
          // full rep complete
          if (rep >= totalReps) {
            setRunning(false);
            setDone(true);
            saveSession();
            return 0;
          }
          setRep((r) => r + 1);
          setMicroRep(1);
          setPhaseIdx(0);
          vibrate([200]);
          return pattern.phases[0].seconds;
        }
        setPhaseIdx(nextPhaseIdx);
        vibrate(isCycle ? [60] : [200]);
        return pattern.phases[nextPhaseIdx].seconds;
      });
    }, tickMs);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIdx, rep, microRep, done]);

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
    setMicroRep(1);
    setRunning(true);
    setDone(false);
    startedAtRef.current = Date.now();
  };

  const progress = ((rep - 1) / totalReps) * 100 + (1 / totalReps) * 100 *
    (phaseIdx / pattern.phases.length);
  const displaySecondsLeft = Math.max(1, Math.ceil(secondsLeft));

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      <MonetBackground
        intensity="strong"
        emotion={emotionName ? emotionNameToTint(emotionName) : "default"}
      />

      {/* top bar */}
      <div className="px-5 pt-12 flex items-center justify-between relative z-10">
        <button
          onClick={() => navigate("/breathing")}
          className="w-10 h-10 rounded-full liquid-card flex items-center justify-center"
          aria-label="뒤로"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-primary font-serif">
            {pattern.title}
          </p>
          <p className="text-xs text-foreground/60 mt-0.5">
            {rep} / {totalReps}회
            {isCycle && ` · ${microRep}/${cycleReps}`}
          </p>
        </div>
        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full liquid-card flex items-center justify-center"
          aria-label={muted ? "음성 안내 켜기" : "음성 안내 끄기"}
        >
          {muted ? (
            <VolumeX className="w-5 h-5 text-foreground/60" />
          ) : (
            <Volume2 className="w-5 h-5 text-primary" />
          )}
        </button>
      </div>

      {/* phase label */}
      <div className="text-center mt-6 relative z-10">
        <p
          key={`${rep}-${phaseIdx}-${microRep}`}
          className="text-[20px] font-semibold text-foreground animate-fade-up"
        >
          {PHASE_LABEL[currentPhase.phase]}
          {!isCycle && ` ${currentPhase.seconds}초`}
        </p>
        <p className="text-foreground/50 text-sm mt-1 tabular-nums">
          {isCycle ? "" : displaySecondsLeft}
        </p>
      </div>

      {/* visual stage */}
      <div className="flex-1 flex items-center justify-center relative px-6 py-2">
        <div className="w-full max-w-[360px] h-[360px]">
          <BreathingVisual
            visual={visual}
            phase={currentPhase.phase}
            seconds={currentPhase.seconds}
          />
        </div>
      </div>

      {/* progress + controls */}
      <div className="px-6 pb-10 relative z-10 space-y-4">
        <div>
          <Progress value={progress} className="h-1.5 bg-foreground/10" />
          <p className="text-[10px] text-foreground/45 text-center mt-1.5 tracking-widest uppercase">
            {Math.round(progress)}% · {totalReps - rep + 1}회 남음
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            onClick={stop}
            className="h-14 px-6 rounded-2xl liquid-card text-foreground"
          >
            <Stop className="w-5 h-5 mr-2" /> 종료
          </Button>
          <Button
            onClick={() => setRunning((r) => !r)}
            className="h-16 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex-1 max-w-[200px]"
          >
            {running ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
            {running ? "일시정지" : "이어하기"}
          </Button>
        </div>
      </div>

      {/* done modal */}
      {done && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-foreground/30 backdrop-blur-sm animate-fade-up">
          <div className="liquid-card p-8 w-full max-w-sm text-center">
            <div className="flex justify-center">
              <Moodie size={96} emotion="happy" />
            </div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-primary font-serif mt-4">
              Well done
            </p>
            <h2 className="text-2xl font-bold text-foreground mt-2">완료했어요!</h2>
            <p className="text-sm text-foreground/60 mt-2">
              {totalReps}회 호흡을 마쳤어요.<br />
              마음이 한결 가벼워졌길 바라요 🌿
            </p>
            <div className="grid grid-cols-2 gap-2 mt-6">
              <Button
                variant="ghost"
                onClick={restart}
                className="h-12 rounded-2xl liquid-card text-foreground"
              >
                한 번 더
              </Button>
              <Button
                onClick={() => navigate("/home")}
                className={cn("h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground")}
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
