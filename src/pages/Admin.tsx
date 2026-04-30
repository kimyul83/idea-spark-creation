import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search, Users, Clock, Crown, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { MonetBackground } from "@/components/MonetBackground";

type Row = {
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
};

const PLANS = ["free", "monthly", "yearly", "lifetime"] as const;
type Plan = (typeof PLANS)[number];

const fmtMin = (sec: number) => `${Math.round((sec ?? 0) / 60)}m`;
const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  // 비관리자 차단
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    if (!isAdmin) {
      toast.error("관리자 전용 페이지예요");
      navigate("/me", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_user_stats" as any)
      .select("*")
      .order("joined_at", { ascending: false });
    if (error) {
      toast.error(`불러오기 실패: ${error.message}`);
      setLoading(false);
      return;
    }
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const totals = useMemo(() => {
    const users = rows.length;
    const premium = rows.filter((r) => r.is_premium).length;
    const totalMin = Math.round(rows.reduce((a, r) => a + (r.total_seconds ?? 0), 0) / 60);
    const sessions = rows.reduce((a, r) => a + (r.session_count ?? 0), 0);
    return { users, premium, totalMin, sessions };
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => (r.email ?? "").toLowerCase().includes(needle));
  }, [q, rows]);

  const grant = async (row: Row, plan: Plan) => {
    setBusy(row.id);
    const isPremium = plan !== "free";
    const startedAt = isPremium ? new Date().toISOString() : null;
    const { error } = await supabase
      .from("profiles")
      .update({
        is_premium: isPremium,
        subscription_type: plan,
        subscription_started_at: startedAt,
      })
      .eq("id", row.id);
    setBusy(null);
    if (error) {
      toast.error(`적용 실패: ${error.message}`);
      return;
    }
    toast.success(`${row.email ?? row.id.slice(0, 8)} → ${plan}`);
    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? { ...r, is_premium: isPremium, subscription_type: plan, subscription_started_at: startedAt }
          : r
      )
    );
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

      {/* totals */}
      <div className="grid grid-cols-2 gap-3">
        <KPI Icon={Users} label="가입자" value={`${totals.users}`} sub={`프리미엄 ${totals.premium}`} />
        <KPI Icon={Clock} label="총 이용" value={`${totals.totalMin}분`} sub={`세션 ${totals.sessions}회`} />
      </div>

      {/* search */}
      <div className="relative">
        <Search className="w-4 h-4 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이메일 검색"
          className="pl-9 h-11 bg-white/60 border-white/40"
        />
      </div>

      {/* user list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && !loading && (
          <div className="liquid-card p-6 text-center text-foreground/50 text-sm">
            {q ? "검색 결과가 없어요" : "아직 가입자가 없어요"}
          </div>
        )}
        {filtered.map((row) => (
          <UserRow key={row.id} row={row} busy={busy === row.id} onGrant={(p) => grant(row, p)} />
        ))}
      </div>
    </div>
  );
};

const KPI = ({
  Icon,
  label,
  value,
  sub,
}: {
  Icon: any;
  label: string;
  value: string;
  sub?: string;
}) => (
  <div className="liquid-card p-4">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
      </div>
      <p className="text-[11px] text-foreground/55 uppercase tracking-widest font-semibold">{label}</p>
    </div>
    <p className="num-display text-[24px] text-primary mt-1.5 leading-none">{value}</p>
    {sub && <p className="text-[11px] text-foreground/45 mt-1">{sub}</p>}
  </div>
);

const UserRow = ({
  row,
  busy,
  onGrant,
}: {
  row: Row;
  busy: boolean;
  onGrant: (p: Plan) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="liquid-card p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold shrink-0">
          {(row.email ?? "?")[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate text-[14px]">
            {row.email ?? row.id.slice(0, 8)}
          </p>
          <p className="text-[11px] text-foreground/50 truncate">
            가입 {fmtDate(row.joined_at)} · 세션 {row.session_count} · {fmtMin(row.total_seconds)}
            {row.last_session_at ? ` · 최근 ${fmtDate(row.last_session_at)}` : ""}
          </p>
        </div>
        {row.is_premium && (
          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full inline-flex items-center gap-1 shrink-0">
            <Crown className="w-3 h-3" />
            {row.subscription_type}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-white/30 flex flex-wrap gap-2">
          {PLANS.map((p) => {
            const active = row.subscription_type === p;
            return (
              <Button
                key={p}
                size="sm"
                disabled={busy}
                variant={active ? "default" : "outline"}
                onClick={() => onGrant(p)}
                className="h-8 text-[12px] flex-1 min-w-[70px]"
              >
                {p}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Admin;
