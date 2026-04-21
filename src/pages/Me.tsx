import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Crown, Heart, Bell } from "lucide-react";

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

  return (
    <div className="px-5 pt-12">
      {/* profile card */}
      <div className="bg-gradient-mint rounded-3xl p-6 text-white shadow-card relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur flex items-center justify-center">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs text-white/80">반가워요</p>
            <p className="font-bold text-lg">{user?.email ?? "게스트"}</p>
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-white/80 rounded-2xl p-4 shadow-soft">
          <p className="text-xs text-navy-soft/70">총 세션</p>
          <p className="text-2xl font-bold text-navy mt-1">{stats.total}회</p>
        </div>
        <div className="bg-white/80 rounded-2xl p-4 shadow-soft">
          <p className="text-xs text-navy-soft/70">누적 시간</p>
          <p className="text-2xl font-bold text-navy mt-1">{stats.minutes}분</p>
        </div>
      </div>

      {/* menu */}
      <div className="mt-6 bg-white/80 rounded-3xl shadow-soft overflow-hidden">
        <MenuItem Icon={Crown} label="프리미엄 구독" tag="준비 중" />
        <MenuItem Icon={Heart} label="즐겨찾기" tag="준비 중" />
        <MenuItem Icon={Bell} label="알림 설정" tag="준비 중" />
      </div>

      {user && (
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full mt-4 text-navy-soft/70"
        >
          <LogOut className="w-4 h-4 mr-2" /> 로그아웃
        </Button>
      )}
    </div>
  );
};

const MenuItem = ({ Icon, label, tag }: { Icon: any; label: string; tag?: string }) => (
  <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-mint/10 transition border-b border-mint/10 last:border-0">
    <div className="w-10 h-10 rounded-xl bg-mint/20 flex items-center justify-center">
      <Icon className="w-5 h-5 text-mint-deep" />
    </div>
    <span className="flex-1 text-left text-navy font-medium">{label}</span>
    {tag && <span className="text-xs text-navy-soft/50">{tag}</span>}
  </button>
);

export default Me;
