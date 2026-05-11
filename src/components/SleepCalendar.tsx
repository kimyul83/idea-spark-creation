import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SleepRow {
  duration_seconds: number;
  created_at: string;
}

type ViewMode = "week" | "month" | "year";

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
const MONTH_LABELS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

export const SleepCalendar = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<SleepRow[]>([]);
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    // 1년치 fetch — year view 까지 커버
    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);
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

  // 현재 view 기준 통계 (week=일요일~토요일, month=달, year=1월~12월)
  const stats = useMemo(() => {
    let totalSec = 0;
    let nights = 0;
    if (view === "week") {
      const sunday = new Date(cursor);
      sunday.setDate(cursor.getDate() - cursor.getDay());
      sunday.setHours(0, 0, 0, 0);
      for (let i = 0; i < 7; i++) {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        const v = sessionsByDay.get(dateKey(d));
        if (v) { totalSec += v.totalSec; nights += 1; }
      }
    } else if (view === "month") {
      const y = cursor.getFullYear(), m = cursor.getMonth();
      sessionsByDay.forEach((v, k) => {
        const d = new Date(k);
        if (d.getFullYear() === y && d.getMonth() === m) {
          totalSec += v.totalSec; nights += 1;
        }
      });
    } else {
      const y = cursor.getFullYear();
      sessionsByDay.forEach((v, k) => {
        const d = new Date(k);
        if (d.getFullYear() === y) { totalSec += v.totalSec; nights += 1; }
      });
    }
    const avg = nights > 0 ? totalSec / nights : 0;
    return { totalSec, nights, avg };
  }, [view, cursor, sessionsByDay]);

  const monthCells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const cells: Array<{ day: number | null; key: string | null }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ day: null, key: null });
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ day: d, key: dateKey(new Date(year, month, d)) });
    }
    return cells;
  }, [cursor]);

  const weekCells = useMemo(() => {
    const sunday = new Date(cursor);
    sunday.setDate(cursor.getDate() - cursor.getDay());
    sunday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return { date: d, key: dateKey(d) };
    });
  }, [cursor]);

  const yearMonths = useMemo(() => {
    const y = cursor.getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      let total = 0, nights = 0;
      sessionsByDay.forEach((v, k) => {
        const d = new Date(k);
        if (d.getFullYear() === y && d.getMonth() === i) {
          total += v.totalSec; nights += 1;
        }
      });
      return { month: i, total, nights };
    });
  }, [cursor, sessionsByDay]);

  const intensityFor = (sec: number, maxSec = 8 * 3600) => Math.min(1, sec / maxSec);
  const intensityForKey = (key: string | null) => {
    if (!key) return 0;
    const s = sessionsByDay.get(key);
    return s ? intensityFor(s.totalSec) : 0;
  };

  const todayKey = dateKey(new Date());

  const shift = (dir: -1 | 1) => {
    if (view === "week") {
      const d = new Date(cursor);
      d.setDate(d.getDate() + dir * 7);
      setCursor(d);
    } else if (view === "month") {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1));
    } else {
      setCursor(new Date(cursor.getFullYear() + dir, 0, 1));
    }
  };

  const headerLabel =
    view === "week"
      ? (() => {
          const sun = weekCells[0].date;
          const sat = weekCells[6].date;
          return `${sun.getMonth() + 1}/${sun.getDate()} – ${sat.getMonth() + 1}/${sat.getDate()}`;
        })()
      : view === "month"
      ? `${cursor.getFullYear()}.${cursor.getMonth() + 1}`
      : `${cursor.getFullYear()}`;

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
          <button onClick={() => shift(-1)} className="w-7 h-7 rounded-full hover:bg-foreground/5 flex items-center justify-center" aria-label="이전">
            <ChevronLeft className="w-4 h-4 text-foreground/60" />
          </button>
          <span className="text-[12px] font-semibold text-foreground/80 min-w-[88px] text-center">
            {headerLabel}
          </span>
          <button onClick={() => shift(1)} className="w-7 h-7 rounded-full hover:bg-foreground/5 flex items-center justify-center" aria-label="다음">
            <ChevronRight className="w-4 h-4 text-foreground/60" />
          </button>
        </div>
      </div>

      {/* view 토글 — 주/월/연 */}
      <div className="flex gap-1 mb-3 p-1 bg-foreground/5 rounded-2xl">
        {(["week", "month", "year"] as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "flex-1 py-1.5 text-[11px] font-semibold rounded-xl transition",
              view === v ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/55 hover:text-foreground/85",
            )}
          >
            {v === "week" ? "주" : v === "month" ? "월" : "연"}
          </button>
        ))}
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="잠든 밤" value={`${stats.nights}일`} />
        <Stat label="총 수면" value={fmtHours(stats.totalSec)} />
        <Stat label="평균" value={fmtHours(stats.avg)} />
      </div>

      {/* week view — 7개 큰 셀 (요일 + 날짜 + 시간) */}
      {view === "week" && (
        <div className="grid grid-cols-7 gap-1.5">
          {weekCells.map((c, i) => {
            const v = sessionsByDay.get(c.key);
            const intensity = v ? intensityFor(v.totalSec) : 0;
            const isToday = c.key === todayKey;
            return (
              <div
                key={c.key}
                className={cn(
                  "rounded-2xl aspect-[0.7] p-2 flex flex-col items-center justify-between",
                  isToday && "ring-2 ring-primary/40",
                )}
                style={{
                  background: intensity > 0
                    ? `hsl(var(--primary) / ${0.15 + intensity * 0.5})`
                    : "hsl(var(--foreground) / 0.04)",
                }}
              >
                <div className="text-center">
                  <p className={cn("text-[9px]", i === 0 ? "text-rose-400" : i === 6 ? "text-blue-400" : "text-foreground/45")}>
                    {WEEK_LABELS[i]}
                  </p>
                  <p className={cn("text-[14px] font-bold mt-0.5", isToday && "text-primary")}>{c.date.getDate()}</p>
                </div>
                <p className={cn("text-[9px] font-semibold text-center", intensity > 0.5 ? "text-primary-foreground" : "text-foreground/70")}>
                  {v ? fmtHours(v.totalSec) : "—"}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* month view — 캘린더 */}
      {view === "month" && (
        <>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEK_LABELS.map((w, i) => (
              <div key={w} className={cn("text-[10px] text-center font-semibold tracking-wide",
                i === 0 ? "text-rose-400/70" : i === 6 ? "text-blue-400/70" : "text-foreground/40")}>
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthCells.map((cell, i) => {
              const intensity = intensityForKey(cell.key);
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
                  <span className={cn("text-[11px] font-semibold",
                    isToday ? "text-primary" : intensity > 0.5 ? "text-primary-foreground" : "text-foreground/70")}>
                    {cell.day}
                  </span>
                  {session && <span className="w-1 h-1 rounded-full bg-current opacity-60 mt-0.5" />}
                </button>
              );
            })}
          </div>
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
        </>
      )}

      {/* year view — 12개월 grid */}
      {view === "year" && (
        <div className="grid grid-cols-4 gap-1.5">
          {yearMonths.map((m) => {
            const maxMonthSec = 31 * 8 * 3600;  // 한 달 max ~ 31일 × 8시간
            const intensity = intensityFor(m.total, maxMonthSec);
            return (
              <div
                key={m.month}
                className="rounded-xl aspect-square p-2 flex flex-col items-center justify-center"
                style={{
                  background: intensity > 0
                    ? `hsl(var(--primary) / ${0.12 + intensity * 0.5})`
                    : "hsl(var(--foreground) / 0.04)",
                }}
              >
                <p className={cn("text-[10px] font-semibold", intensity > 0.5 ? "text-primary-foreground" : "text-foreground/55")}>
                  {MONTH_LABELS[m.month]}
                </p>
                <p className={cn("text-[10px] font-bold mt-0.5 text-center leading-tight",
                  intensity > 0.5 ? "text-primary-foreground" : "text-foreground/85")}>
                  {m.nights > 0 ? fmtHours(m.total) : "—"}
                </p>
                <p className={cn("text-[8px] mt-0.5", intensity > 0.5 ? "text-primary-foreground/70" : "text-foreground/45")}>
                  {m.nights > 0 ? `${m.nights}일` : ""}
                </p>
              </div>
            );
          })}
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
