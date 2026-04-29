import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Moody } from "@/components/Moody";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LogOut, Crown, Heart, Bell, ChevronRight, FlaskConical, Palette } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { usePremium } from "@/hooks/usePremium";
import { useTheme } from "@/contexts/ThemeContext";

const Me = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, minutes: 0 });
  const navigate = useNavigate();
  const { isPremium, devPremium, setDev } = usePremium();
  const { label: themeLabel } = useTheme();

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
    localStorage.removeItem("moody_onboarded");
    navigate("/", { replace: true });
  };

  return (
    <div className="px-5 pt-10 pb-6 relative flex-1 flex flex-col gap-3">
      <MonetBackground intensity="soft" />

      {/* premium / profile hero */}
      <div className="liquid-hero p-6 text-white">
        <span className="shimmer" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase opacity-70 font-serif">Moody+</p>
            <h2 className="text-[22px] font-bold mt-1 leading-tight">
              {isPremium ? <>프리미엄 활성<br />감사해요 ✨</> : <>프리미엄으로<br />더 깊이 돌봐요</>}
            </h2>
            <p className="opacity-70 text-xs mt-2">전체 ASMR · 무제한 믹스 · ADHD · 수면</p>
          </div>
          <Moody size={160} emotion={isPremium ? "happy" : "default"} />
        </div>
        <Button
          onClick={() => navigate("/subscribe")}
          className="relative w-full mt-5 h-11 rounded-2xl bg-white/95 text-[#0A1525] hover:bg-white font-semibold"
        >
          <Crown className="w-4 h-4 mr-2" />
          {isPremium ? "구독 관리" : "프리미엄 시작"}
        </Button>
      </div>

      {/* stats — droplet particles inside */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Sessions" value={`${stats.total}회`} />
        <StatCard label="Minutes" value={`${stats.minutes}분`} />
      </div>

      {/* user info */}
      <div className="liquid-card p-5 flex items-center gap-3">
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

      {/* menu — each item is its own droplet */}
      <div className="grid gap-2">
        <MenuRow
          Icon={Crown}
          label="프리미엄 구독"
          onClick={() => navigate("/subscribe")}
        />
        <MenuRow
          Icon={Palette}
          label="테마 설정"
          right={<span className="text-[11px] text-primary font-medium truncate max-w-[140px]">{themeLabel}</span>}
          onClick={() => navigate("/settings/theme")}
        />
        <MenuRow Icon={Heart} label="즐겨찾기" tag="준비 중" />
        <MenuRow Icon={Bell}  label="알림 설정" tag="준비 중" />
      </div>

      {/* DEV toggle — extra subtle */}
      <div
        className="liquid-card p-4 mt-1"
        style={{ background: "hsl(0 0% 100% / 0.05)" }}
      >
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
          className="w-full mt-2 text-foreground/60 hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" /> 로그아웃
        </Button>
      )}
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="liquid-card p-5 overflow-hidden">
    <div className="droplet-particles" aria-hidden>
      <span /><span /><span /><span />
    </div>
    <p className="relative text-[10px] text-foreground/55 tracking-widest uppercase">{label}</p>
    <p className="relative text-[30px] font-serif text-primary mt-1 leading-none">{value}</p>
  </div>
);

const MenuRow = ({
  Icon, label, tag, right, onClick,
}: {
  Icon: any; label: string; tag?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="liquid-card liquid-card-hover w-full flex items-center gap-3 px-4 py-4 text-left"
  >
    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
    </div>
    <span className="flex-1 text-foreground font-medium">{label}</span>
    {right}
    {tag && <span className="text-xs text-foreground/40 mr-1">{tag}</span>}
    <ChevronRight className="w-4 h-4 text-foreground/30" />
  </button>
);


const ProviderBadge = ({ provider }: { provider: string }) => {
  const map: Record<string, { label: string; logo: JSX.Element | null }> = {
    google: {
      label: "Google 계정",
      logo: (
        <svg width="11" height="11" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.5 6.7 29 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19 19-8.5 19-19c0-1.2-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.2 18.9 13 24 13c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.5 6.7 29 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 43c5 0 9.5-1.6 13-4.4l-6-5.1c-1.9 1.4-4.4 2.4-7 2.4-5.2 0-9.6-2.9-11.3-7l-6.5 5C9.5 39.6 16.2 43 24 43z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6 5.1c-.4.4 6.5-4.7 6.5-14.8 0-1.2-.1-2.4-.4-3.5z"/>
        </svg>
      ),
    },
    apple: {
      label: "Apple 계정",
      logo: (
        <svg width="10" height="11" viewBox="0 0 384 512" fill="currentColor" aria-hidden>
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM256 84.5c19.4-23 17.6-43.9 17-51.5-17.1 1-36.9 11.7-48.2 24.8-12.4 14-19.7 31.4-18.1 50.7 18.5 1.4 35.4-8.1 49.3-24z"/>
        </svg>
      ),
    },
    email: { label: "이메일", logo: null },
    guest: { label: "Guest", logo: null },
  };
  const info = map[provider] ?? map.email;
  return (
    <span className="inline-flex items-center gap-1 normal-case tracking-normal text-foreground/60 text-[11px]">
      {info.logo}
      {info.label}
    </span>
  );
};

export default Me;
