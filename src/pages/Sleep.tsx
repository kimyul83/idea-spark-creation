import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock, Moon, Pause, Play, Sparkles,
} from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { Moodie } from "@/components/Moodie";
import { audioEngine, SleepSoundId } from "@/lib/audio-engine";
import { usePremium } from "@/hooks/usePremium";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SleepTrack {
  id: SleepSoundId;
  emoji: string;
  name: string;
  desc: string;
  premium: boolean;
}

const TRACKS: SleepTrack[] = [
  { id: "deep_waves",       emoji: "🌊", name: "깊은 파도",       desc: "40Hz 델타파 + 바다",      premium: false },
  { id: "calm_rain",        emoji: "🌧️", name: "잔잔한 빗소리",   desc: "비 + 432Hz",              premium: false },
  { id: "forest_night",     emoji: "🌲", name: "숲의 밤",         desc: "풀벌레 + 새벽 공기",       premium: false },
  { id: "sleep_asmr",       emoji: "🎵", name: "수면 ASMR",       desc: "로파이 + 화이트노이즈",    premium: true  },
  { id: "delta_meditation", emoji: "🌙", name: "델타파 명상",     desc: "0.5–4Hz 바이노럴",        premium: true  },
  { id: "lullaby",          emoji: "🕯️", name: "자장가",          desc: "부드러운 피아노 + 528Hz",  premium: true  },
  { id: "cosmic_drone",     emoji: "💤", name: "우주 앰비언트",   desc: "딥 드론 사운드",          premium: true  },
  { id: "meadow_breeze",    emoji: "🌾", name: "초원 밤바람",     desc: "바람 + 귀뚜라미",         premium: true  },
];

const MIN_HOURS = 1;
const MAX_HOURS = 10;
const STEP_HOURS = 0.5;
const FADE_BEFORE_END_SECONDS = 20 * 60; // 20-min taper
const FADE_DURATION_SECONDS = 5 * 60;     // smooth 5-min fade

const formatHours = (h: number) =>
  Number.isInteger(h) ? `${h}시간` : `${Math.floor(h)}시간 30분`;

const formatClock = (d: Date) =>
  d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });

const Sleep = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { resolvedVariant } = useTheme();

  const [hours, setHours] = useState(8);
  const [activeId, setActiveId] = useState<SleepSoundId | null>(null);
  const [endsAt, setEndsAt] = useState<Date | null>(null);
  const startedAt = useRef<number>(0);
  const endTimer = useRef<number>();
  const fadeTimer = useRef<number>();

  const wakeAt = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + Math.round(hours * 60));
    return d;
  }, [hours]);

  const greeting =
    resolvedVariant === "light"
      ? "오늘 밤 좋은 꿈 꾸세요 🌙"
      : "푹 주무실 준비 되셨나요 🌙";

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeId) audioEngine.stop(activeId);
      if (endTimer.current) window.clearTimeout(endTimer.current);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopActive = async () => {
    if (!activeId) return;
    const elapsedSec = Math.round((Date.now() - startedAt.current) / 1000);
    audioEngine.stop(activeId);
    if (endTimer.current) window.clearTimeout(endTimer.current);
    if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    // Save session if signed in
    if (user && elapsedSec > 30) {
      try {
        await supabase.from("sessions").insert({
          user_id: user.id,
          session_type: "sleep",
          duration_seconds: elapsedSec,
          completed: true,
        });
      } catch { /* silent */ }
    }
    setActiveId(null);
    setEndsAt(null);
  };

  const startTrack = (track: SleepTrack) => {
    if (track.premium && !isPremium) {
      navigate("/subscribe");
      return;
    }
    if (activeId === track.id) {
      stopActive();
      return;
    }
    if (activeId) audioEngine.stop(activeId);
    audioEngine.playSleep(track.id, track.id, 0.22);

    const totalSec = Math.round(hours * 3600);
    const fadeStartIn = Math.max(0, totalSec - FADE_BEFORE_END_SECONDS) * 1000;

    fadeTimer.current = window.setTimeout(() => {
      audioEngine.fadeTo(track.id, 0, FADE_DURATION_SECONDS);
    }, fadeStartIn);

    endTimer.current = window.setTimeout(() => {
      stopActive();
      toast.success("좋은 아침이에요 ☀️");
    }, totalSec * 1000);

    startedAt.current = Date.now();
    setActiveId(track.id);
    setEndsAt(new Date(Date.now() + totalSec * 1000));
    toast(`${track.name} · ${formatHours(hours)} 재생`);
  };

  return (
    <div className="px-5 pt-10 pb-6 relative flex-1 flex flex-col gap-5">
      <MonetBackground intensity="soft" emotion="sleepy" />

      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/55 font-serif">
            Sleep
          </p>
          <h1 className="text-[26px] font-bold text-foreground mt-1 leading-tight">
            편안한 수면
          </h1>
          <p className="text-sm text-foreground/60 mt-1">{greeting}</p>
        </div>
        <Moodie size={64} emotion="calm" />
      </header>

      {/* Duration dial */}
      <section className="liquid-card p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] uppercase tracking-widest text-foreground/45">
            수면 시간
          </p>
          <p className="text-[10px] text-foreground/45">
            지금 시작 → <span className="text-primary font-semibold">{formatClock(wakeAt)}</span> 종료
          </p>
        </div>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-[44px] font-serif leading-none text-foreground">
            {Math.floor(hours)}
          </span>
          <span className="text-foreground/60 mb-1.5 text-sm">
            {hours % 1 === 0.5 ? "시간 30분" : "시간"}
          </span>
        </div>
        <input
          type="range"
          min={MIN_HOURS}
          max={MAX_HOURS}
          step={STEP_HOURS}
          value={hours}
          onChange={(e) => setHours(parseFloat(e.target.value))}
          className="w-full mt-4 accent-primary"
          aria-label="수면 시간"
        />
        <div className="flex justify-between text-[10px] text-foreground/40 mt-1">
          <span>1시간</span>
          <span>5시간</span>
          <span>10시간</span>
        </div>
        {activeId && endsAt && (
          <div className="mt-4 flex items-center justify-between bg-primary/10 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-foreground/80">
                {formatClock(endsAt)} 자동 종료 · 20분 전부터 페이드
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Sleep music list */}
      <section className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-foreground/45 px-1">
          수면 음악
        </p>
        <div className="grid gap-2">
          {TRACKS.map((t) => {
            const locked = t.premium && !isPremium;
            const isActive = activeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => startTrack(t)}
                className={cn(
                  "liquid-card liquid-card-hover w-full p-4 flex items-center gap-3 text-left",
                  isActive && "ring-2 ring-primary/60",
                )}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center text-2xl shrink-0">
                  {t.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-foreground text-[15px] truncate">
                      {t.name}
                    </p>
                    {locked && <Lock className="w-3 h-3 text-foreground/40" />}
                  </div>
                  <p className="text-[11px] text-foreground/55 mt-0.5 truncate">
                    {t.desc}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground/5 text-foreground/70",
                  )}
                  aria-label={isActive ? "정지" : "재생"}
                >
                  {isActive ? (
                    <Pause className="w-4 h-4" strokeWidth={2.4} />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" strokeWidth={2.4} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tip */}
      <p className="text-[11px] text-foreground/45 leading-relaxed text-center px-4 pt-2">
        화면을 꺼도 재생은 유지돼요. 알람 대신 부드러운 페이드 아웃으로 깨워드려요.
      </p>
    </div>
  );
};

export default Sleep;
