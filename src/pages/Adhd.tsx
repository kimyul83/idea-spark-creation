import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Pause, Play, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { MonetBackground } from "@/components/MonetBackground";
import { Moody } from "@/components/Moody";
import { audioEngine } from "@/lib/audio-engine";
import { playDing, vibrate } from "@/lib/sfx";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { markAdhdUsed, usePremium } from "@/hooks/usePremium";

const FOCUS_MIN = 25;
const BREAK_MIN = 5;
const ID_GAMMA = "adhd-gamma-40";
const ID_BROWN = "adhd-brown";
const ID_NATURE = "adhd-nature";
const NATURE_URL = "https://cdn.pixabay.com/download/audio/2022/03/15/audio_a86d3b3b29.mp3?filename=forest-with-small-river-birds-and-nature-field-recording-6735.mp3";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

const Adhd = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(2);
  const [phase, setPhase] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MIN * 60);
  const [running, setRunning] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [gammaVol, setGammaVol] = useState(0.08);
  const [brownVol, setBrownVol] = useState(0.18);
  const [done, setDone] = useState(false);
  const [rating, setRating] = useState(0);
  const tickRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const { isPremium } = usePremium();

  // mark trial as used for free users when this screen mounts
  useEffect(() => {
    if (!isPremium) markAdhdUsed();
  }, [isPremium]);

  // start/stop audio when running
  useEffect(() => {
    if (running) {
      if (phase === "focus") {
        if (audioEngine.isPlaying(ID_NATURE)) audioEngine.stop(ID_NATURE);
        if (!audioEngine.isPlaying(ID_GAMMA)) audioEngine.playTone(ID_GAMMA, 40, gammaVol);
        if (!audioEngine.isPlaying(ID_BROWN)) audioEngine.playNoise(ID_BROWN, "brown", brownVol);
      } else {
        if (audioEngine.isPlaying(ID_GAMMA)) audioEngine.stop(ID_GAMMA);
        if (audioEngine.isPlaying(ID_BROWN)) audioEngine.stop(ID_BROWN);
        if (!audioEngine.isPlaying(ID_NATURE)) audioEngine.playUrl(ID_NATURE, NATURE_URL, 0.4);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase]);

  // volume sync
  useEffect(() => { audioEngine.setVolume(ID_GAMMA, gammaVol); }, [gammaVol]);
  useEffect(() => { audioEngine.setVolume(ID_BROWN, brownVol); }, [brownVol]);

  // tick
  useEffect(() => {
    if (!running) return;
    tickRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        // phase end
        vibrate([200, 80, 200]);
        if (phase === "focus") {
          if (round >= totalRounds) {
            // session complete after final focus
            finishSession();
            return 0;
          }
          setPhase("break");
          return BREAK_MIN * 60;
        } else {
          setRound((r) => r + 1);
          setPhase("focus");
          return FOCUS_MIN * 60;
        }
      });
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, round, totalRounds]);

  // cleanup on unmount
  useEffect(() => () => audioEngine.stopAll(), []);

  const finishSession = async () => {
    setRunning(false);
    audioEngine.stopAll();
    setDone(true);
    const elapsed = Math.round((Date.now() - startedAtRef.current) / 1000);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("focus_sessions").insert({
      user_id: user.id,
      mode: "adhd",
      planned_duration: totalRounds * (FOCUS_MIN + BREAK_MIN) * 60,
      actual_duration: elapsed,
      completed_tasks: tasks.filter((t) => t.done).map((t) => t.text),
    });
  };

  const submitRating = async (n: number) => {
    setRating(n);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Update most recent focus_session for this user with rating
    const { data: rows } = await supabase
      .from("focus_sessions")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (rows && rows[0]) {
      await supabase.from("focus_sessions").update({ rating: n }).eq("id", rows[0].id);
    }
  };

  const addTask = () => {
    if (!taskInput.trim() || tasks.length >= 3) return;
    setTasks((t) => [...t, { id: crypto.randomUUID(), text: taskInput.trim(), done: false }]);
    setTaskInput("");
  };

  const toggleTask = (id: string) => {
    setTasks((ts) =>
      ts.map((t) => {
        if (t.id !== id) return t;
        const newDone = !t.done;
        if (newDone) { playDing(); vibrate([100]); }
        return { ...t, done: newDone };
      })
    );
  };

  const removeTask = (id: string) =>
    setTasks((ts) => ts.filter((t) => t.id !== id));

  const fmt = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="min-h-screen pb-32 relative">
      <MonetBackground intensity="medium" emotion="focused" />

      {/* header */}
      <div className="px-5 pt-12 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full surface flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-charcoal" />
        </button>
        <div className="text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-sage-deep font-serif">
            ADHD Focus
          </p>
          <p className="text-xs text-charcoal/60 mt-0.5">집중 25 · 휴식 5</p>
        </div>
        <div className="w-10" />
      </div>

      {/* timer */}
      <div className="px-5 mt-6">
        <div
          className={cn(
            "rounded-3xl p-6 text-center shadow-card",
            phase === "focus" ? "bg-charcoal text-cream" : "bg-sage-deep text-cream"
          )}
        >
          <p className="text-[11px] tracking-[0.3em] uppercase opacity-70 font-serif">
            {phase === "focus" ? "Focus" : "Break"} · {round} / {totalRounds}
          </p>
          <div className="text-[64px] font-serif tabular-nums leading-none mt-2">
            {fmt(secondsLeft)}
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              size="sm"
              variant="ghost"
              disabled={running}
              onClick={() => {
                if (totalRounds > 1) setTotalRounds(totalRounds - 1);
                if (!running) setSecondsLeft(FOCUS_MIN * 60);
              }}
              className="h-9 px-3 rounded-xl bg-white/15 text-cream hover:bg-white/25"
            >
              −
            </Button>
            <span className="text-sm font-semibold">{totalRounds} 회 반복</span>
            <Button
              size="sm"
              variant="ghost"
              disabled={running || totalRounds >= 8}
              onClick={() => setTotalRounds(totalRounds + 1)}
              className="h-9 px-3 rounded-xl bg-white/15 text-cream hover:bg-white/25"
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* tasks */}
      <div className="px-5 mt-5">
        <h2 className="font-bold text-charcoal mb-2">오늘 할 일 (최대 3개)</h2>
        <div className="surface rounded-3xl p-4 shadow-soft">
          <div className="space-y-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-2 rounded-xl bg-white/60"
              >
                <Checkbox
                  checked={t.done}
                  onCheckedChange={() => toggleTask(t.id)}
                  className="data-[state=checked]:bg-sage-deep data-[state=checked]:border-sage-deep"
                />
                <span
                  className={cn(
                    "flex-1 text-sm text-charcoal",
                    t.done && "line-through text-charcoal/40"
                  )}
                >
                  {t.text}
                </span>
                <button
                  onClick={() => removeTask(t.id)}
                  className="text-charcoal/30 hover:text-charcoal/60"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {tasks.length < 3 && (
              <div className="flex gap-2">
                <Input
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder={t("adhd.todoPlaceholder")}
                  className="h-10 rounded-xl bg-white/80 border-beige text-charcoal"
                />
                <Button
                  onClick={addTask}
                  size="icon"
                  className="h-10 w-10 rounded-xl bg-charcoal hover:bg-charcoal/90 text-cream shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* mixer */}
      <div className="px-5 mt-5">
        <h2 className="font-bold text-charcoal mb-2">집중 사운드</h2>
        <div className="surface rounded-3xl p-4 shadow-soft space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-charcoal">감마파 40Hz</span>
              <span className="text-xs text-charcoal/50">{Math.round(gammaVol * 100)}%</span>
            </div>
            <Slider
              value={[gammaVol * 100]}
              max={50}
              step={1}
              onValueChange={(v) => setGammaVol(v[0] / 100)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-charcoal">브라운 노이즈</span>
              <span className="text-xs text-charcoal/50">{Math.round(brownVol * 100)}%</span>
            </div>
            <Slider
              value={[brownVol * 100]}
              max={60}
              step={1}
              onValueChange={(v) => setBrownVol(v[0] / 100)}
            />
          </div>
          {phase === "break" && running && (
            <p className="text-xs text-sage-deep text-center">
              휴식 중 — 자연 사운드로 자동 전환됐어요 🌿
            </p>
          )}
        </div>
      </div>

      {/* play button */}
      <div className="fixed bottom-20 left-0 right-0 px-5 z-20">
        <div className="mx-auto max-w-[500px]">
          <Button
            onClick={() => {
              if (!running) startedAtRef.current = Date.now();
              setRunning((r) => !r);
            }}
            className="w-full h-16 rounded-2xl bg-charcoal hover:bg-charcoal/90 text-cream text-base font-bold shadow-card"
          >
            {running ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
            {running ? t("adhd.pause") : t("adhd.start")}
          </Button>
        </div>
      </div>

      {/* done modal */}
      {done && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-charcoal/40 backdrop-blur-sm animate-fade-up">
          <div className="surface rounded-3xl p-8 w-full max-w-sm text-center shadow-card">
            <div className="flex justify-center">
              <Moody size="medium" emotion="happy" />
            </div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-sage-deep font-serif mt-4">
              Session done
            </p>
            <h2 className="text-2xl font-bold text-charcoal mt-2">집중 완료!</h2>
            <p className="text-sm text-charcoal/60 mt-2">
              {tasks.filter((t) => t.done).length} / {tasks.length} 할 일 완료
            </p>
            <p className="text-xs text-charcoal/50 mt-4">집중도를 별점으로 남겨주세요</p>
            <div className="flex justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => submitRating(n)}
                  className={cn(
                    "text-2xl transition-transform active:scale-90",
                    rating >= n ? "" : "opacity-30"
                  )}
                >
                  ⭐
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setDone(false);
                  setRound(1);
                  setPhase("focus");
                  setSecondsLeft(FOCUS_MIN * 60);
                  setRating(0);
                }}
                className="h-12 rounded-2xl bg-white/80 text-charcoal hover:bg-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> 다시
              </Button>
              <Button
                onClick={() => navigate("/home")}
                className="h-12 rounded-2xl bg-charcoal text-cream hover:bg-charcoal/90"
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

export default Adhd;
