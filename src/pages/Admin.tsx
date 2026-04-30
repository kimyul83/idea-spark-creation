import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  BadgeCheck,
  Ban,
  CalendarDays,
  ChevronLeft,
  Clock,
  Crown,
  DollarSign,
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { MonetBackground } from "@/components/MonetBackground";

const PLAN_PRICES = {
  free: 0,
  monthly: 4900,
  yearly: 39000,
  lifetime: 89000,
} as const;
const COST_RATE = 0.2;
const PLANS = Object.keys(PLAN_PRICES) as Plan[];
type Plan = keyof typeof PLAN_PRICES;

type AdminRow = {
  id: string;
  email: string | null;
  is_premium: boolean;
  subscription_type: string;
  subscription_started_at: string | null;
  joined_at: string;
  session_count: number;
  total_seconds: number;
  focus_count: number;
  focus_seconds: number;
  last_session_at: string | null;
  last_seen_at: string | null;
  is_friend: boolean;
  manual_access_granted: boolean;
  estimated_paid_amount: number;
  access_note: string | null;
};

const money = (value: number) => `₩${Math.round(value).toLocaleString("ko-KR")}`;
const fmtMin = (sec: number) => `${Math.round((sec ?? 0) / 60)}분`;
const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const planPrice = (plan: string) => PLAN_PRICES[(plan as Plan) in PLAN_PRICES ? (plan as Plan) : "free"];

const normalizeRows = (rows: unknown[]): AdminRow[] =>
  rows.map((r: any) => ({
    id: r.id,
    email: r.email ?? null,
    is_premium: !!r.is_premium,
    subscription_type: r.subscription_type ?? "free",
    subscription_started_at: r.subscription_started_at ?? null,
    joined_at: r.joined_at ?? r.created_at ?? new Date().toISOString(),
    session_count: Number(r.session_count ?? 0),
    total_seconds: Number(r.total_seconds ?? 0),
    focus_count: Number(r.focus_count ?? 0),
    focus_seconds: Number(r.focus_seconds ?? 0),
    last_session_at: r.last_session_at ?? null,
    last_seen_at: r.last_seen_at ?? null,
    is_friend: !!r.is_friend,
    manual_access_granted: !!r.manual_access_granted,
    estimated_paid_amount: Number(r.estimated_paid_amount ?? 0),
    access_note: r.access_note ?? null,
  }));

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || adminLoading) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    if (!isAdmin) {
      toast.error("관리자 전용 페이지예요");
      navigate("/me", { replace: true });
    }
  }, [authLoading, adminLoading, user, isAdmin, navigate]);

  const load = async () => {
    setLoading(true);
    setErrMsg(null);

    const viewRes = await supabase
      .from("admin_user_stats" as any)
      .select("*")
      .order("joined_at", { ascending: false });

    if (!viewRes.error) {
      setRows(normalizeRows((viewRes.data ?? []) as unknown[]));
      setLoading(false);
      return;
    }

    const msg = `${viewRes.error.message} (code: ${viewRes.error.code ?? "?"})`;
    setErrMsg(msg);
    toast.error(`불러오기 실패: ${msg}`);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin && !adminLoading) load();
  }, [isAdmin, adminLoading]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => (r.email ?? "").toLowerCase().includes(needle));
  }, [q, rows]);

  const totals = useMemo(() => {
    const users = rows.length;
    const premium = rows.filter((r) => r.is_premium).length;
    const friends = rows.filter((r) => r.is_friend).length;
    const sessions = rows.reduce((a, r) => a + r.session_count, 0);
    const totalMin = Math.round(rows.reduce((a, r) => a + r.total_seconds, 0) / 60);
    const revenue = rows.reduce((a, r) => a + (r.estimated_paid_amount || planPrice(r.subscription_type)), 0);
    const cost = revenue * COST_RATE;
    const profit = revenue - cost;
    const margin = revenue ? Math.round((profit / revenue) * 100) : 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsers = rows.filter((r) => new Date(r.joined_at) >= today).length;
    const active = rows.filter((r) => r.last_seen_at || r.last_session_at).length;
    return { users, premium, friends, sessions, totalMin, revenue, cost, profit, margin, todayUsers, active };
  }, [rows]);

  const patchProfile = async (row: AdminRow, patch: Partial<AdminRow>, success: string) => {
    setBusy(row.id);
    const { error } = await supabase.from("profiles").update(patch as any).eq("id", row.id);
    setBusy(null);

    if (error) {
      toast.error(`적용 실패: ${error.message}`);
      return;
    }

    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...patch } : r)));
    toast.success(success);
  };

  const grant = (row: AdminRow, plan: Plan) => {
    const isPremium = plan !== "free";
    patchProfile(
      row,
      {
        is_premium: isPremium,
        subscription_type: plan,
        subscription_started_at: isPremium ? row.subscription_started_at ?? new Date().toISOString() : null,
        manual_access_granted: isPremium,
        estimated_paid_amount: isPremium ? row.estimated_paid_amount || PLAN_PRICES[plan] : 0,
      },
      `${row.email ?? row.id.slice(0, 8)} 권한을 ${plan}로 변경했어요`
    );
  };

  const toggleFriend = (row: AdminRow) => {
    patchProfile(row, { is_friend: !row.is_friend }, !row.is_friend ? "친구로 표시했어요" : "친구 표시를 해제했어요");
  };

  if (authLoading || adminLoading || (!isAdmin && !user)) {
    return (
      <div className="px-5 pt-10 pb-6 flex-1 flex items-center justify-center">
        <RefreshCw className="w-5 h-5 text-foreground/40 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-10 pb-10 relative flex-1 flex flex-col gap-4">
      <MonetBackground intensity="soft" />

      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-background/50 flex items-center justify-center" aria-label="뒤로">
          <ChevronLeft className="w-5 h-5 text-foreground/70" />
        </button>
        <div>
          <h1 className="text-[22px] font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            관리자
          </h1>
          <p className="text-[11px] text-foreground/45">가입자 · 권한 · 친구 · 매출 추정</p>
        </div>
        <button onClick={load} className="ml-auto w-9 h-9 rounded-full bg-background/50 flex items-center justify-center" aria-label="새로고침">
          <RefreshCw className={`w-4 h-4 text-foreground/70 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <KPI Icon={Users} label="가입자" value={`${totals.users}`} sub={`오늘 +${totals.todayUsers} · 활성 ${totals.active}`} />
        <KPI Icon={Crown} label="유료/친구" value={`${totals.premium}`} sub={`친구 ${totals.friends}명`} />
        <KPI Icon={DollarSign} label="추정 매출" value={money(totals.revenue)} sub={`비용 ${money(totals.cost)}`} />
        <KPI Icon={TrendingUp} label="순이익" value={money(totals.profit)} sub={`마진율 ${totals.margin}%`} />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-background/45 h-11">
          <TabsTrigger value="users" className="rounded-xl text-xs">사용자</TabsTrigger>
          <TabsTrigger value="access" className="rounded-xl text-xs">권한</TabsTrigger>
          <TabsTrigger value="money" className="rounded-xl text-xs">매출</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4 space-y-3">
          <SearchBox q={q} setQ={setQ} />
          {errMsg && <ErrorCard msg={errMsg} />}
          <div className="flex flex-col gap-2">
            {filtered.length === 0 && !loading && !errMsg && <EmptyState q={q} />}
            {filtered.map((row) => (
              <UserRow key={row.id} row={row} busy={busy === row.id} onGrant={(p) => grant(row, p)} onFriend={() => toggleFriend(row)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="access" className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <KPI Icon={Star} label="친구" value={`${totals.friends}`} sub="별표 표시" />
            <KPI Icon={BadgeCheck} label="수동 권한" value={`${rows.filter((r) => r.manual_access_granted).length}`} sub="관리자 부여" />
          </div>
          <div className="flex flex-col gap-2">
            {filtered.map((row) => (
              <AccessRow key={row.id} row={row} busy={busy === row.id} onGrant={(p) => grant(row, p)} onFriend={() => toggleFriend(row)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="money" className="mt-4 space-y-3">
          <div className="liquid-card p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Metric label="월간권" value={money(rows.filter((r) => r.subscription_type === "monthly").length * PLAN_PRICES.monthly)} />
              <Metric label="연간권" value={money(rows.filter((r) => r.subscription_type === "yearly").length * PLAN_PRICES.yearly)} />
              <Metric label="평생권" value={money(rows.filter((r) => r.subscription_type === "lifetime").length * PLAN_PRICES.lifetime)} />
              <Metric label="무료/취소" value={`${rows.filter((r) => !r.is_premium).length}명`} />
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 text-[11px] text-foreground/50 leading-relaxed">
              현재는 플랜별 기본가 월 ₩4,900 · 연 ₩39,000 · 평생 ₩89,000, 비용률 20% 기준의 추정치예요. 실제 결제 연동 후에는 실결제액으로 바꿀 수 있어요.
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {rows.filter((r) => r.is_premium || r.estimated_paid_amount > 0).map((row) => (
              <RevenueRow key={row.id} row={row} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const KPI = ({ Icon, label, value, sub }: { Icon: any; label: string; value: string; sub?: string }) => (
  <div className="liquid-card p-4 min-h-[104px]">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
      </div>
      <p className="text-[10px] text-foreground/55 uppercase tracking-widest font-semibold">{label}</p>
    </div>
    <p className="num-display text-[22px] text-primary mt-2 leading-none break-words">{value}</p>
    {sub && <p className="text-[11px] text-foreground/45 mt-1">{sub}</p>}
  </div>
);

const SearchBox = ({ q, setQ }: { q: string; setQ: (value: string) => void }) => (
  <div className="relative">
    <Search className="w-4 h-4 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
    <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이메일 검색" className="pl-9 h-11 bg-background/55 border-border/50" />
  </div>
);

const ErrorCard = ({ msg }: { msg: string }) => (
  <div className="liquid-card p-4 border border-destructive/30 bg-destructive/5">
    <p className="text-xs text-destructive font-semibold mb-1">불러오기 실패</p>
    <p className="text-[11px] text-foreground/60 break-words">{msg}</p>
  </div>
);

const EmptyState = ({ q }: { q: string }) => (
  <div className="liquid-card p-6 text-center text-foreground/50 text-sm">{q ? "검색 결과가 없어요" : "아직 가입자가 없어요"}</div>
);

const UserRow = ({ row, busy, onGrant, onFriend }: { row: AdminRow; busy: boolean; onGrant: (p: Plan) => void; onFriend: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="liquid-card p-4">
      <div className="flex items-start gap-3">
        <button onClick={onFriend} disabled={busy} className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0" aria-label="친구 표시">
          <Star className={`w-5 h-5 ${row.is_friend ? "fill-primary text-primary" : "text-primary/45"}`} strokeWidth={1.8} />
        </button>
        <button onClick={() => setOpen((v) => !v)} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 min-w-0">
            <p className="font-semibold text-foreground truncate text-[14px]">{row.email ?? row.id.slice(0, 8)}</p>
            {row.is_premium ? <Badge className="shrink-0 text-[10px]"><Crown className="w-3 h-3 mr-1" />{row.subscription_type}</Badge> : <Badge variant="outline" className="shrink-0 text-[10px]">free</Badge>}
          </div>
          <p className="text-[11px] text-foreground/50 truncate mt-1">
            가입 {fmtDate(row.joined_at)} · 최근 {fmtDate(row.last_seen_at ?? row.last_session_at)}
          </p>
          <p className="text-[11px] text-foreground/45 truncate">
            세션 {row.session_count}회 · 이용 {fmtMin(row.total_seconds)} · 집중 {row.focus_count}회
          </p>
        </button>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <MiniStat Icon={CalendarDays} label="가입" value={fmtDate(row.joined_at)} />
            <MiniStat Icon={Eye} label="최근" value={fmtDate(row.last_seen_at ?? row.last_session_at)} />
            <MiniStat Icon={Activity} label="세션" value={`${row.session_count}회`} />
            <MiniStat Icon={Clock} label="총 이용" value={fmtMin(row.total_seconds)} />
          </div>
          <PlanButtons row={row} busy={busy} onGrant={onGrant} />
        </div>
      )}
    </div>
  );
};

const AccessRow = ({ row, busy, onGrant, onFriend }: { row: AdminRow; busy: boolean; onGrant: (p: Plan) => void; onFriend: () => void }) => (
  <div className="liquid-card p-4 space-y-3">
    <div className="flex items-center gap-3">
      <button onClick={onFriend} disabled={busy} className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center" aria-label="친구 표시">
        <Star className={`w-4 h-4 ${row.is_friend ? "fill-primary text-primary" : "text-primary/45"}`} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{row.email ?? row.id.slice(0, 8)}</p>
        <p className="text-[11px] text-foreground/45">{row.manual_access_granted ? "관리자가 부여한 권한" : "일반 상태"}</p>
      </div>
      <Button size="sm" variant="outline" disabled={busy || !row.is_premium} onClick={() => onGrant("free")} className="h-8 text-[11px]">
        <Ban className="w-3.5 h-3.5 mr-1" />취소
      </Button>
    </div>
    <PlanButtons row={row} busy={busy} onGrant={onGrant} />
  </div>
);

const RevenueRow = ({ row }: { row: AdminRow }) => {
  const revenue = row.estimated_paid_amount || planPrice(row.subscription_type);
  const profit = revenue * (1 - COST_RATE);
  return (
    <div className="liquid-card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
        <DollarSign className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{row.email ?? row.id.slice(0, 8)}</p>
        <p className="text-[11px] text-foreground/45">{row.subscription_type} · 예상 순이익 {money(profit)}</p>
      </div>
      <p className="num-display text-primary text-[18px]">{money(revenue)}</p>
    </div>
  );
};

const PlanButtons = ({ row, busy, onGrant }: { row: AdminRow; busy: boolean; onGrant: (p: Plan) => void }) => (
  <div className="grid grid-cols-4 gap-2">
    {PLANS.map((p) => {
      const active = row.subscription_type === p;
      return (
        <Button key={p} size="sm" disabled={busy} variant={active ? "default" : "outline"} onClick={() => onGrant(p)} className="h-8 text-[11px] px-2">
          {p === "free" ? "무료" : p === "monthly" ? "월" : p === "yearly" ? "연" : "평생"}
        </Button>
      );
    })}
  </div>
);

const MiniStat = ({ Icon, label, value }: { Icon: any; label: string; value: string }) => (
  <div className="rounded-xl bg-background/45 px-3 py-2 min-w-0">
    <p className="text-[10px] text-foreground/40 flex items-center gap-1"><Icon className="w-3 h-3" />{label}</p>
    <p className="text-[11px] text-foreground/75 truncate mt-0.5">{value}</p>
  </div>
);

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-background/45 px-3 py-3">
    <p className="text-[10px] text-foreground/45 tracking-widest uppercase">{label}</p>
    <p className="num-display text-primary text-[18px] mt-1">{value}</p>
  </div>
);

export default Admin;
