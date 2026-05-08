import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SleepRow {
  duration_seconds: number;
  created_at: string;
}

/** YYYY-MM-DD 키 */
const dateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fmtHours = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h === 0 && m === 0) return "—";
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
};

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export const SleepCalendar = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<SleepRow[]>([]);
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    // 최근 90일치 sleep 세션
    const since = new Date();
    since.setDate(since.getDate() - 90);
    supabase
      .from("sessions")
      .select("duration_seconds, created_at")
      .eq("user_id", user.id)
      .eq("session_type", "sleep")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data ?? []) as SleepRow[]));
  }, [user]);

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, { totalSec: number; count: number }>();
    rows.forEach((r) => {
      const key = dateKey(new Date(r.created_at));
      const cur = map.get(key) ?? { totalSec: 0, count: 0 };
      cur.totalSec += r.duration_seconds ?? 0;
      cur.count += 1;
      map.set(key, cur);
    });
    return map;
  }, [rows]);

  const monthStats = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    let totalSec = 0;
    let nights = 0;
    sessionsByDay.forEach((v, k) => {
      const d = new Date(k);
      if (d.getFullYear() === year && d.getMonth() === month) {
        totalSec += v.totalSec;
        nights += 1;
      }
    });
    const avgPerNight = nights > 0 ? totalSec / nights : 0;
    return { totalSec, nights, avgPerNight };
  }, [cursor, sessionsByDay]);

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const cells: Array<{ day: number | null; key: string | null }> = [];
    // 빈 셀 (이전 달)
    for (let i = 0; i < startWeekday; i++) cells.push({ day: null, key: null });
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      cells.push({ day: d, key: dateKey(date) });
    }
    return cells;
  }, [cursor]);

  // 색 강도 — 시간에 비례 (0~12h → 0.0~1.0)
  const intensityFor = (key: string | null): number => {
    if (!key) return 0;
    const s = sessionsByDay.get(key);
    if (!s) return 0;
    return Math.min(1, s.totalSec / (8 * 3600)); // 8시간 자면 max
  };

  const todayKey = dateKey(new Date());

  if (!user) {
    return (
      <div className="liquid-card p-5 text-center">
        <Moon className="w-6 h-6 text-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-foreground/50">로그인하면 수면 기록이 캘린더로 보여요</p>
      </div>
    );
  }

  return (
    <div className="liquid-card p-4">
      {/* header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center">
            <Moon className="w-4 h-4 text-primary" strokeWidth={1.8} />
          </div>
          <p className="text-[13px] font-bold text-foreground">수면 기록</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="w-7 h-7 rounded-full hover:bg-foreground/5 flex items-center justify-center"
            aria-label="이전 달"
          >
            <ChevronLeft className="w-4 h-4 text-foreground/60" />
          </button>
          <span className="text-[12px] font-semibold text-foreground/80 min-w-[64px] text-center">
            {cursor.getFullYear()}.{cursor.getMonth() + 1}
          </span>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="w-7 h-7 rounded-full hover:bg-foreground/5 flex items-center justify-center"
            aria-label="다음 달"
          >
            <ChevronRight className="w-4 h-4 text-foreground/60" />
          </button>
        </div>
      </div>

      {/* 월간 통계 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="잠든 밤" value={`${monthStats.nights}일`} />
        <Stat label="총 수면" value={fmtHours(monthStats.totalSec)} />
        <Stat label="하루 평균" value={fmtHours(monthStats.avgPerNight)} />
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEK_LABELS.map((w, i) => (
          <div
            key={w}
            className={cn(
              "text-[10px] text-center font-semibold tracking-wide",
              i === 0 ? "text-rose-400/70" : i === 6 ? "text-blue-400/70" : "text-foreground/40",
            )}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, i) => {
          const intensity = intensityFor(cell.key);
          const session = cell.key ? sessionsByDay.get(cell.key) : null;
          const isToday = cell.key === todayKey;
          const isSelected = cell.key === selectedDay;
          return (
            <button
              key={i}
              onClick={() => cell.key && setSelectedDay(isSelected ? null : cell.key)}
              disabled={!cell.day}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center transition-all",
                cell.day === null && "invisible",
                isSelected && "ring-2 ring-primary",
                isToday && "ring-1 ring-primary/40",
              )}
              style={{
                background: intensity > 0
                  ? `hsl(var(--primary) / ${0.15 + intensity * 0.5})`
                  : "hsl(var(--foreground) / 0.04)",
              }}
            >
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  isToday ? "text-primary" : intensity > 0.5 ? "text-primary-foreground" : "text-foreground/70",
                )}
              >
                {cell.day}
              </span>
              {session && (
                <span className="w-1 h-1 rounded-full bg-current opacity-60 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 날 상세 */}
      {selectedDay && sessionsByDay.has(selectedDay) && (
        <div className="mt-3 p-3 rounded-xl bg-primary/5 flex items-center justify-between animate-fade-up">
          <div>
            <p className="text-[10px] text-foreground/50 tracking-widest uppercase">{selectedDay}</p>
            <p className="text-[14px] font-bold text-foreground mt-0.5">
              {fmtHours(sessionsByDay.get(selectedDay)!.totalSec)}
            </p>
          </div>
          <p className="text-[11px] text-foreground/55">
            {sessionsByDay.get(selectedDay)!.count}회 수면 세션
          </p>
        </div>
      )}

      {rows.length === 0 && (
        <p className="text-[11px] text-foreground/40 text-center mt-3">
          수면 탭에서 음악 재생하면 자동으로 기록돼요 🌙
        </p>
      )}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="liquid-card p-2 text-center">
    <p className="text-[9px] text-foreground/50 tracking-widest uppercase font-semibold">{label}</p>
    <p className="text-[14px] font-bold text-foreground mt-0.5">{value}</p>
  </div>
);
