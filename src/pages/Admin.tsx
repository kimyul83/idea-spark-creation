import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft, Search, Users, Clock, Crown, ShieldCheck, RefreshCw,
  Star, TrendingUp, Wallet, Percent, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { MonetBackground } from "@/components/MonetBackground";
import { computeKPI, fmtKrw, fmtPct, monthlyRevenue, PRICES_KRW, type PlanType } from "@/lib/admin-finance";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  email: string | null;
  is_premium: boolean;
  subscription_type: string;
  subscription_started_at: string | null;
  is_starred: boolean;
  joined_at: string;
  session_count: number;
  total_seconds: number;
  focus_count: number;
  focus_seconds: number;
  last_session_at: string | null;
};

const PLANS: PlanType[] = ["free", "monthly", "yearly", "lifetime"];
const PLAN_LABEL: Record<PlanType, string> = {
  free: "무료",
  monthly: "월간",
  yearly: "연간",
  lifetime: "평생",
};

type FilterTab = "all" | "starred" | "premium" | "free";
const FILTER_LABEL: Record<FilterTab, string> = {
  all: "전체",
  starred: "⭐ 친구",
  premium: "프리미엄",
  free: "무료",
};

const fmtMin = (sec: number) => `${Math.round((sec ?? 0) / 60)}분`;
const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear() % 100}/${d.getMonth() + 1}/${d.getDate()}`;
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<FilterTab>("all");

  // 비관리자 차단
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/", { replace: true }); return; }
    if (!isAdmin) {
      toast.error("관리자 전용 페이지예요");
      navigate("/me", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const load = async () => {
    setLoading(true);
    setErrMsg(null);

    // Plan A: admin_user_stats 뷰 (마이그레이션 적용된 경우)
    const viewRes = await supabase
      .from("admin_user_stats" as any)
      .select("*")
      .order("joined_at", { ascending: false });

    if (!viewRes.error && viewRes.data && viewRes.data.length > 0) {
      setRows(viewRes.data as Row[]);
      setLoading(false);
      return;
    }

    if (viewRes.error) console.warn("[Admin] view 실패:", viewRes.error);

    // Plan B: profiles + sessions 직접 조회
    const [profilesRes, sessionsRes, focusRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id,email,is_premium,is_starred,subscription_type,subscription_started_at,created_at")
        .order("created_at", { ascending: false }),
      supabase.from("sessions").select("user_id,duration_seconds,created_at"),
      supabase.from("focus_sessions").select("user_id,actual_duration,planned_duration"),
    ]);

    if (profilesRes.error) {
      const err = profilesRes.error;
      const msg = `${err.message}${err.code ? ` (코드: ${err.code})` : ""}${err.hint ? ` — ${err.hint}` : ""}`;
      console.error("[Admin] profiles 조회 실패:", err);
      setErrMsg(msg);
      setLoading(false);
      return;
    }

    // 별표 컬럼 미적용 시 fallback (마이그레이션 020 이전)
    const profiles = (profilesRes.data ?? []).map((p: any) => ({ ...p, is_starred: !!p.is_starred }));

    const sessionsByUser = new Map<string, { count: number; total: number; last: string | null }>();
    (sessionsRes.data ?? []).forEach((s: any) => {
      const cur = sessionsByUser.get(s.user_id) ?? { count: 0, total: 0, last: null };
      cur.count += 1;
      cur.total += s.duration_seconds ?? 0;
      if (!cur.last || s.created_at > cur.last) cur.last = s.created_at;
      sessionsByUser.set(s.user_id, cur);
    });
    const focusByUser = new Map<string, { count: number; seconds: number }>();
    (focusRes.data ?? []).forEach((f: any) => {
      const cur = focusByUser.get(f.user_id) ?? { count: 0, seconds: 0 };
      cur.count += 1;
      cur.seconds += f.actual_duration ?? f.planned_duration ?? 0;
      focusByUser.set(f.user_id, cur);
    });

    const merged: Row[] = profiles.map((p: any) => {
      const s = sessionsByUser.get(p.id);
      const f = focusByUser.get(p.id);
      return {
        id: p.id,
        email: p.email,
        is_premium: p.is_premium,
        is_starred: p.is_starred,
        subscription_type: p.subscription_type,
        subscription_started_at: p.subscription_started_at,
        joined_at: p.created_at,
        session_count: s?.count ?? 0,
        total_seconds: s?.total ?? 0,
        focus_count: f?.count ?? 0,
        focus_seconds: f?.seconds ?? 0,
        last_session_at: s?.last ?? null,
      };
    });

    setRows(merged);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const kpi = useMemo(() => computeKPI(rows), [rows]);
  const starredCount = useMemo(() => rows.filter((r) => r.is_starred).length, [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (tab === "starred") list = list.filter((r) => r.is_starred);
    else if (tab === "premium") list = list.filter((r) => r.is_premium);
    else if (tab === "free") list = list.filter((r) => !r.is_premium);
    const needle = q.trim().toLowerCase();
    if (needle) list = list.filter((r) => (r.email ?? "").toLowerCase().includes(needle));
    return list;
  }, [tab, q, rows]);

  const grant = async (row: Row, plan: PlanType) => {
    setBusy(row.id);
    const isPremium = plan !== "free";
    const startedAt = isPremium ? new Date().toISOString() : null;
    const { error } = await supabase
      .from("profiles")
      .update({ is_premium: isPremium, subscription_type: plan, subscription_started_at: startedAt })
      .eq("id", row.id);
    setBusy(null);
    if (error) { toast.error(`적용 실패: ${error.message}`); return; }
    toast.success(`${row.email ?? row.id.slice(0, 8)} → ${PLAN_LABEL[plan]}`);
    setRows((prev) => prev.map((r) => r.id === row.id
      ? { ...r, is_premium: isPremium, subscription_type: plan, subscription_started_at: startedAt }
      : r,
    ));
  };

  const toggleStar = async (row: Row) => {
    const newVal = !row.is_starred;
    setBusy(row.id);
    const { error } = await supabase
      .from("profiles")
      .update({ is_starred: newVal })
      .eq("id", row.id);
    setBusy(null);
    if (error) { toast.error(`별표 ${newVal ? "추가" : "해제"} 실패: ${error.message}`); return; }
    toast.success(`${row.email ?? row.id.slice(0, 8)} ${newVal ? "별표 추가됨 ⭐" : "별표 해제"}`);
    setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, is_starred: newVal } : r));
  };

  if (authLoading || (!isAdmin && !user)) {
    return (
      <div className="px-5 pt-10 pb-6 flex-1 flex items-center justify-center">
        <RefreshCw className="w-5 h-5 text-foreground/40 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-10 pb-10 relative flex-1 flex flex-col gap-4">
      <MonetBackground intensity="soft" />

      {/* header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/40 flex items-center justify-center"
          aria-label="뒤로"
        >
          <ChevronLeft className="w-5 h-5 text-foreground/70" />
        </button>
        <h1 className="text-[22px] font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          관리자
        </h1>
        <button
          onClick={load}
          className="ml-auto w-9 h-9 rounded-full bg-white/40 flex items-center justify-center"
          aria-label="새로고침"
        >
          <RefreshCw className={`w-4 h-4 text-foreground/70 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* error display */}
      {errMsg && (
        <div className="liquid-card p-4 border border-destructive/30 bg-destructive/5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-destructive font-semibold">불러오기 실패</p>
              <p className="text-[11px] text-foreground/60 break-words mt-1">{errMsg}</p>
              <p className="text-[10px] text-foreground/40 mt-2 leading-relaxed">
                Supabase 대시보드 → SQL Editor 에서 마이그레이션 적용 필요:<br />
                • <code className="text-[10px]">20260429000000_admin_dashboard.sql</code><br />
                • <code className="text-[10px]">20260430010000_admin_exact_email.sql</code><br />
                • <code className="text-[10px]">20260430020000_admin_starred_friends.sql</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI 카드 — 사용자 통계 */}
      <div className="grid grid-cols-2 gap-3">
        <KPI Icon={Users}  label="가입자"      value={`${kpi.totalUsers}`} sub={`프리미엄 ${kpi.paidUsers} · 무료 ${kpi.free}`} />
        <KPI Icon={Star}   label="별표 친구"   value={`${starredCount}`}   sub={starredCount > 0 ? `중 프리미엄 ${rows.filter(r => r.is_starred && r.is_premium).length}` : "탭 → ⭐ 표시"} />
      </div>

      {/* KPI 카드 — 매출/마진 */}
      <div className="grid grid-cols-3 gap-2.5">
        <KPI Icon={Wallet}     label="월 매출"  value={fmtKrw(kpi.monthlyRevenueKrw)} sub={`연 ${fmtKrw(kpi.monthlyRevenueKrw * 12)}`} small />
        <KPI Icon={TrendingUp} label="순이익"   value={fmtKrw(kpi.netProfit)} sub={`수수료 ${fmtKrw(kpi.appleFee)}`} small />
        <KPI Icon={Percent}    label="마진률"   value={fmtPct(kpi.margin)} sub={`서버 ${fmtKrw(kpi.serverCost)}`} small />
      </div>

      {/* 평생 구독 누적 (있을 경우) */}
      {kpi.lifetime > 0 && (
        <div className="liquid-card p-3 flex items-center gap-3">
          <Crown className="w-4 h-4 text-primary" />
          <span className="text-xs text-foreground/65">평생 구독 누적 매출</span>
          <span className="text-xs font-bold text-primary ml-auto">{fmtKrw(kpi.lifetimeRevenueKrw)}</span>
          <span className="text-[10px] text-foreground/40">· {kpi.lifetime}명</span>
        </div>
      )}

      {/* 필터 탭 */}
      <div className="grid grid-cols-4 gap-1.5 liquid-card p-1.5">
        {(Object.keys(FILTER_LABEL) as FilterTab[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "rounded-2xl py-2 text-xs font-medium transition-colors",
              tab === k ? "bg-primary text-primary-foreground" : "text-foreground/60",
            )}
          >
            {FILTER_LABEL[k]}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="w-4 h-4 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이메일 검색"
          className="pl-9 h-11 bg-white/60 border-white/40"
        />
      </div>

      {/* 사용자 리스트 */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && !loading && !errMsg && (
          <div className="liquid-card p-6 text-center text-foreground/50 text-sm">
            {q ? "검색 결과가 없어요" : tab === "starred" ? "아직 별표 친구가 없어요 — 사용자 카드에서 ⭐ 누르면 추가" : "아직 가입자가 없어요"}
          </div>
        )}
        {filtered.map((row) => (
          <UserRow
            key={row.id}
            row={row}
            busy={busy === row.id}
            onGrant={(p) => grant(row, p)}
            onToggleStar={() => toggleStar(row)}
          />
        ))}
      </div>
    </div>
  );
};

const KPI = ({
  Icon, label, value, sub, small,
}: { Icon: any; label: string; value: string; sub?: string; small?: boolean }) => (
  <div className="liquid-card p-4">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.8} />
      </div>
      <p className="text-[10px] text-foreground/55 uppercase tracking-widest font-semibold">{label}</p>
    </div>
    <p className={cn(
      "num-display text-primary mt-1.5 leading-none",
      small ? "text-[18px]" : "text-[24px]",
    )}>{value}</p>
    {sub && <p className="text-[10px] text-foreground/45 mt-1 truncate">{sub}</p>}
  </div>
);

const UserRow = ({
  row, busy, onGrant, onToggleStar,
}: {
  row: Row;
  busy: boolean;
  onGrant: (p: PlanType) => void;
  onToggleStar: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const monthly = monthlyRevenue((row.subscription_type ?? "free") as PlanType);
  return (
    <div className={cn(
      "liquid-card p-4",
      row.is_starred && "ring-1 ring-yellow-400/50 bg-yellow-50/20 dark:bg-yellow-500/5",
    )}>
      <div className="flex items-center gap-3">
        {/* avatar */}
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold shrink-0">
          {(row.email ?? "?")[0]?.toUpperCase()}
        </div>

        {/* info */}
        <button onClick={() => setOpen((v) => !v)} className="flex-1 min-w-0 text-left">
          <p className="font-semibold text-foreground truncate text-[14px]">
            {row.email ?? row.id.slice(0, 8)}
          </p>
          <p className="text-[11px] text-foreground/50 truncate mt-0.5">
            가입 {fmtDate(row.joined_at)} · {row.session_count}세션 · {fmtMin(row.total_seconds)}
            {row.last_session_at && ` · 최근 ${fmtDate(row.last_session_at)}`}
          </p>
        </button>

        {/* badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {row.is_premium && (
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full inline-flex items-center gap-1">
              <Crown className="w-3 h-3" />
              {PLAN_LABEL[(row.subscription_type ?? "free") as PlanType]}
            </span>
          )}
          {monthly > 0 && (
            <span className="text-[10px] font-semibold text-foreground/55">
              {fmtKrw(monthly)}/월
            </span>
          )}
          <button
            onClick={onToggleStar}
            disabled={busy}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              row.is_starred
                ? "bg-yellow-400/20 text-yellow-500"
                : "text-foreground/30 hover:text-yellow-400 hover:bg-yellow-400/10",
            )}
            aria-label={row.is_starred ? "별표 해제" : "별표 추가"}
          >
            <Star className="w-4 h-4" fill={row.is_starred ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-white/30 space-y-2">
          <p className="text-[10px] text-foreground/55 font-semibold uppercase tracking-widest">플랜 부여</p>
          <div className="grid grid-cols-4 gap-1.5">
            {PLANS.map((p) => {
              const active = row.subscription_type === p;
              return (
                <Button
                  key={p}
                  size="sm"
                  disabled={busy}
                  variant={active ? "default" : "outline"}
                  onClick={() => onGrant(p)}
                  className="h-8 text-[11px] flex-col gap-0"
                >
                  <span>{PLAN_LABEL[p]}</span>
                  {p !== "free" && (
                    <span className="text-[9px] opacity-60 font-normal">
                      {p === "monthly" ? "월" : p === "yearly" ? "연" : "1회"} {fmtKrw(PRICES_KRW[p]).replace("원", "")}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
          <p className="text-[10px] text-foreground/40">
            UUID: <code className="text-[10px] text-foreground/60">{row.id.slice(0, 13)}...</code>
            {row.subscription_started_at && (
              <> · 구독 시작 {fmtDate(row.subscription_started_at)}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default Admin;
