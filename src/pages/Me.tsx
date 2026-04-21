import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Moodie } from "@/components/Moodie";
import { Button } from "@/components/ui/button";
import { LogOut, Crown, Heart, Bell, ChevronRight } from "lucide-react";

const Me = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, minutes: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("sessions")
      .select("duration_seconds")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const total = data?.length ?? 0;
        const seconds = data?.reduce((acc, s: any) => acc + (s.duration_seconds ?? 0), 0) ?? 0;
        setStats({ total, minutes: Math.round(seconds / 60) });
      });
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("moodie_onboarded");
    navigate("/", { replace: true });
  };

  const isEmpty = stats.total === 0;

  return (
    <div className="px-5 pt-10 relative">
      <div className="blob w-[280px] h-[280px] -top-10 -right-10 opacity-30 bg-sage -z-10" />

      {/* premium / profile card */}
      <div className="bg-charcoal rounded-3xl p-6 text-cream shadow-card relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-sage-deep/40 rounded-full blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-cream/60 font-serif">Moodie+</p>
            <h2 className="text-[22px] font-bold mt-1 leading-tight">
              프리미엄으로<br />더 깊이 돌봐요
            </h2>
            <p className="text-cream/70 text-xs mt-2">전체 ASMR · 무제한 믹스 · 통계</p>
          </div>
          <Moodie size={80} />
        </div>
        <Button className="w-full mt-5 h-11 rounded-2xl bg-cream text-charcoal hover:bg-cream/90 font-semibold">
          준비 중
        </Button>
      </div>

      {/* user info */}
      <div className="mt-4 surface rounded-3xl p-4 flex items-center gap-3 shadow-soft">
        <div className="w-12 h-12 rounded-2xl bg-sage/40 flex items-center justify-center text-sage-deep font-bold">
          {(user?.email ?? "G")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-charcoal/50 tracking-widest uppercase">Account</p>
          <p className="font-semibold text-charcoal truncate">{user?.email ?? "게스트로 둘러보는 중"}</p>
        </div>
      </div>

      {/* stats / empty */}
      {isEmpty ? (
        <div className="mt-4 surface rounded-3xl p-6 text-center shadow-soft">
          <Moodie size="medium" />
          <p className="text-charcoal font-semibold mt-2">아직 기록이 없어요</p>
          <p className="text-xs text-charcoal/60 mt-1">첫 세션을 시작해 마음을 돌봐주세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="surface rounded-3xl p-4 shadow-soft">
            <p className="text-[10px] text-charcoal/50 tracking-widest uppercase">Sessions</p>
            <p className="text-[28px] font-serif text-charcoal mt-1 leading-none">{stats.total}회</p>
          </div>
          <div className="surface rounded-3xl p-4 shadow-soft">
            <p className="text-[10px] text-charcoal/50 tracking-widest uppercase">Minutes</p>
            <p className="text-[28px] font-serif text-charcoal mt-1 leading-none">{stats.minutes}분</p>
          </div>
        </div>
      )}

      {/* menu */}
      <div className="mt-4 surface rounded-3xl shadow-soft overflow-hidden">
        <MenuItem Icon={Crown} label="프리미엄 구독" tag="준비 중" />
        <MenuItem Icon={Heart} label="즐겨찾기" tag="준비 중" />
        <MenuItem Icon={Bell} label="알림 설정" tag="준비 중" />
      </div>

      {user && (
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full mt-4 text-charcoal/60 hover:text-charcoal"
        >
          <LogOut className="w-4 h-4 mr-2" /> 로그아웃
        </Button>
      )}
    </div>
  );
};

const MenuItem = ({ Icon, label, tag }: { Icon: any; label: string; tag?: string }) => (
  <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-sage/15 transition border-b border-beige last:border-0">
    <div className="w-10 h-10 rounded-xl bg-sage/30 flex items-center justify-center">
      <Icon className="w-5 h-5 text-sage-deep" strokeWidth={1.8} />
    </div>
    <span className="flex-1 text-left text-charcoal font-medium">{label}</span>
    {tag && <span className="text-xs text-charcoal/40 mr-1">{tag}</span>}
    <ChevronRight className="w-4 h-4 text-charcoal/30" />
  </button>
);

export default Me;
