import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Moodie } from "@/components/Moodie";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LogOut, Crown, Heart, Bell, ChevronRight, FlaskConical, Sun, Moon, Wand2 } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { usePremium } from "@/hooks/usePremium";
import { useTheme, type ThemePref } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const Me = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, minutes: 0 });
  const navigate = useNavigate();
  const { isPremium, devPremium, setDev } = usePremium();
  const { pref, setPref } = useTheme();

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

  const themeOptions: { id: ThemePref; label: string; Icon: any }[] = [
    { id: "auto", label: "자동", Icon: Wand2 },
    { id: "dawn", label: "Dawn", Icon: Sun },
    { id: "dusk", label: "Dusk", Icon: Moon },
  ];

  return (
    <div className="px-5 pt-10 pb-6 relative flex-1 flex flex-col">
      <MonetBackground intensity="soft" />

      {/* premium / profile card */}
      <div className="bg-foreground rounded-3xl p-6 text-background shadow-card relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/40 rounded-full blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase opacity-60 font-serif">Moodie+</p>
            <h2 className="text-[22px] font-bold mt-1 leading-tight">
              {isPremium ? <>프리미엄 활성<br />감사해요 ✨</> : <>프리미엄으로<br />더 깊이 돌봐요</>}
            </h2>
            <p className="opacity-70 text-xs mt-2">전체 ASMR · 무제한 믹스 · ADHD · 유리 깨기</p>
          </div>
          <Moodie size={80} emotion={isPremium ? "happy" : "default"} />
        </div>
        <Button
          onClick={() => navigate("/subscribe")}
          className="w-full mt-5 h-11 rounded-2xl bg-background text-foreground hover:bg-background/90 font-semibold"
        >
          <Crown className="w-4 h-4 mr-2" />
          {isPremium ? "구독 관리" : "프리미엄 시작"}
        </Button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="surface rounded-3xl p-4 shadow-soft">
          <p className="text-[10px] text-foreground/50 tracking-widest uppercase">Sessions</p>
          <p className="text-[28px] font-serif text-foreground mt-1 leading-none">{stats.total}회</p>
        </div>
        <div className="surface rounded-3xl p-4 shadow-soft">
          <p className="text-[10px] text-foreground/50 tracking-widest uppercase">Minutes</p>
          <p className="text-[28px] font-serif text-foreground mt-1 leading-none">{stats.minutes}분</p>
        </div>
      </div>

      {/* user info */}
      <div className="mt-3 surface rounded-3xl p-4 flex items-center gap-3 shadow-soft">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center text-primary font-bold shrink-0">
          {(user?.email ?? "G")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-foreground/50 tracking-widest uppercase flex items-center gap-1.5">
            <ProviderBadge provider={(user?.app_metadata?.provider as string) ?? "guest"} />
          </p>
          <p className="font-semibold text-foreground truncate">{user?.email ?? "게스트로 둘러보는 중"}</p>
        </div>
      </div>

      {/* Theme toggle */}
      <div className="mt-3 surface rounded-3xl p-4 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-foreground text-sm">화면 테마</p>
            <p className="text-[11px] text-foreground/50 mt-0.5">자동: 아침엔 Dawn, 저녁엔 Dusk</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 bg-foreground/5 p-1 rounded-2xl">
          {themeOptions.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setPref(id)}
              className={cn(
                "py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                pref === id ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground/60"
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* menu */}
      <div className="mt-3 surface rounded-3xl shadow-soft overflow-hidden">
        <button
          onClick={() => navigate("/subscribe")}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-primary/10 transition border-b border-border"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Crown className="w-5 h-5 text-primary" strokeWidth={1.8} />
          </div>
          <span className="flex-1 text-left text-foreground font-medium">프리미엄 구독</span>
          <ChevronRight className="w-4 h-4 text-foreground/30" />
        </button>
        <MenuItem Icon={Heart} label="즐겨찾기" tag="준비 중" />
        <MenuItem Icon={Bell} label="알림 설정" tag="준비 중" />
      </div>

      {/* DEV: premium toggle */}
      <div className="mt-3 surface rounded-3xl p-4 shadow-soft border-2 border-dashed border-accent/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-accent-foreground" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">개발용 · 프리미엄 토글</p>
            <p className="text-[11px] text-foreground/50 mt-0.5">결제 없이 모든 기능 잠금 해제</p>
          </div>
          <Switch checked={devPremium} onCheckedChange={setDev} />
        </div>
      </div>

      {user && (
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full mt-3 text-foreground/60 hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" /> 로그아웃
        </Button>
      )}
    </div>
  );
};

const MenuItem = ({ Icon, label, tag }: { Icon: any; label: string; tag?: string }) => (
  <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-primary/10 transition border-b border-border last:border-0">
    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
      <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
    </div>
    <span className="flex-1 text-left text-foreground font-medium">{label}</span>
    {tag && <span className="text-xs text-foreground/40 mr-1">{tag}</span>}
    <ChevronRight className="w-4 h-4 text-foreground/30" />
  </button>
);

export default Me;
