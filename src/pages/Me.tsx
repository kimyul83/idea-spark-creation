import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Moody } from "@/components/Moody";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LogOut, Crown, Heart, Bell, ChevronRight, FlaskConical, Palette, Languages, ShieldCheck, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/i18n/config";
import { MonetBackground } from "@/components/MonetBackground";
import { usePremium } from "@/hooks/usePremium";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * useAuth 가 hydrate 되기 전이라도 localStorage 에 Supabase 토큰이 있으면
 * "로그인된 것으로 간주" — 로그인했는데 로그아웃 버튼이 안 보이는 race 방지.
 */
const hasStoredSession = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return Object.keys(localStorage).some(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
    );
  } catch {
    return false;
  }
};

const Me = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [stats, setStats] = useState({ total: 0, minutes: 0 });
  const [tokenSeen] = useState(hasStoredSession);
  const navigate = useNavigate();
  const { isPremium, devPremium, setDev } = usePremium();
  const { label: themeLabel } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLangLabel = SUPPORTED_LANGUAGES.find(
    (l) => l.code === (i18n.resolvedLanguage ?? i18n.language)
  )?.name ?? "한국어";

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
            <p className="text-[11px] tracking-[0.3em] uppercase opacity-70 font-serif">{t("subscribe.label")}</p>
            <h2 className="text-[22px] font-bold mt-1 leading-tight whitespace-pre-line">
              {isPremium ? t("me.premiumThanks") : t("me.premiumCta")}
            </h2>
            <p className="opacity-70 text-xs mt-2">{t("me.premiumDesc")}</p>
          </div>
          <Moody size={160} emotion={isPremium ? "happy" : "default"} />
        </div>
        <Button
          onClick={() => navigate("/subscribe")}
          className="relative w-full mt-5 h-11 rounded-2xl bg-white/95 text-[#0A1525] hover:bg-white font-semibold"
        >
          <Crown className="w-4 h-4 mr-2" />
          {isPremium ? t("me.manageSubscription") : t("me.startPremium")}
        </Button>
      </div>

      {/* stats — 로그인 사용자만 노출 (게스트한테 0/0 보여줘봤자 의미없음) */}
      {(user || tokenSeen) && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label={t("me.statSessions")} value={`${stats.total}`} unit={t("me.statSessionsUnit")} />
          <StatCard label={t("me.statTime")} value={`${stats.minutes}`} unit={t("me.statTimeUnit")} />
        </div>
      )}

      {/* user info — 로그인 사용자만. 게스트는 로그인 CTA 로 대체. */}
      {user ? (
        <div className="liquid-card p-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center text-primary font-bold shrink-0">
            {(user.email ?? "G")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-foreground/50 tracking-widest uppercase flex items-center gap-1.5">
              <ProviderBadge provider={(user.app_metadata?.provider as string) ?? "guest"} />
            </p>
            <p className="font-semibold text-foreground truncate">{user.email ?? t("me.guest")}</p>
          </div>
        </div>
      ) : tokenSeen ? (
        // useAuth 가 아직 hydrate 안 됐지만 토큰은 있음 — 로그인 정보 자리에 표시.
        <div className="liquid-card p-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center text-primary font-bold shrink-0">
            ⋯
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-foreground/50 tracking-widest uppercase">Apple ID</p>
            <p className="font-semibold text-foreground/70 truncate">{t("common.loading")}</p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/onboarding")}
          className="liquid-card liquid-card-hover w-full flex items-center gap-3 px-4 py-4 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <LogIn className="w-5 h-5 text-primary" strokeWidth={1.8} />
          </div>
          <span className="flex-1 text-foreground font-medium">{t("me.signIn")}</span>
          <ChevronRight className="w-4 h-4 text-foreground/30" />
        </button>
      )}

      {/* menu — each item is its own droplet */}
      <div className="grid gap-2">
        {isAdmin && (
          <MenuRow
            Icon={ShieldCheck}
            label={t("me.adminDashboard")}
            right={<span className="text-[11px] text-primary font-medium">Admin</span>}
            onClick={() => navigate("/admin")}
          />
        )}
        <MenuRow
          Icon={Crown}
          label={t("me.premiumSubscription")}
          onClick={() => navigate("/subscribe")}
        />
        <MenuRow
          Icon={Palette}
          label={t("me.themeSettings")}
          right={<span className="text-[11px] text-primary font-medium truncate max-w-[140px]">{themeLabel}</span>}
          onClick={() => navigate("/settings/theme")}
        />
        <MenuRow
          Icon={Languages}
          label={t("me.language")}
          right={<span className="text-[11px] text-primary font-medium truncate max-w-[140px]">{currentLangLabel}</span>}
          onClick={() => navigate("/settings/language")}
        />
        <MenuRow Icon={Heart} label={t("me.favorites")} tag={t("me.comingSoon")} />
        <MenuRow Icon={Bell}  label={t("me.notifications")} tag={t("me.comingSoon")} />
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
            <p className="font-semibold text-foreground text-sm">{t("me.devToggle")}</p>
            <p className="text-[11px] text-foreground/50 mt-0.5">{t("me.devDesc")}</p>
          </div>
          <Switch checked={devPremium} onCheckedChange={setDev} />
        </div>
      </div>

      {/* logout — 눈에 잘 띄게: 빨간 톤 + 카드형. */}
      {/* useAuth 가 아직 안 떠도 토큰만 있으면 노출 → race 로 사라지는 버그 방지. */}
      {(user || tokenSeen) && (
        <button
          onClick={handleSignOut}
          className="liquid-card liquid-card-hover w-full flex items-center gap-3 px-4 py-4 text-left mt-1"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5 text-destructive" strokeWidth={1.8} />
          </div>
          <span className="flex-1 text-destructive font-semibold">{t("me.logout")}</span>
          <ChevronRight className="w-4 h-4 text-destructive/40" />
        </button>
      )}
    </div>
  );
};

const StatCard = ({ label, value, unit }: { label: string; value: string; unit?: string }) => (
  <div className="liquid-card p-5 overflow-hidden">
    <div className="droplet-particles" aria-hidden>
      <span /><span /><span /><span />
    </div>
    <p className="relative text-[12px] text-foreground/65 tracking-widest uppercase font-semibold">{label}</p>
    <p className="relative num-display text-[28px] text-primary mt-1.5 leading-none">
      {value}
      {unit && <span className="text-[14px] font-normal opacity-70 ml-0.5">{unit}</span>}
    </p>
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
  const { t } = useTranslation();
  const map: Record<string, { label: string; logo: JSX.Element | null }> = {
    google: {
      label: t("me.providerGoogle"),
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
      label: t("me.providerApple"),
      logo: (
        <svg width="10" height="11" viewBox="0 0 384 512" fill="currentColor" aria-hidden>
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM256 84.5c19.4-23 17.6-43.9 17-51.5-17.1 1-36.9 11.7-48.2 24.8-12.4 14-19.7 31.4-18.1 50.7 18.5 1.4 35.4-8.1 49.3-24z"/>
        </svg>
      ),
    },
    email: { label: t("me.providerEmail"), logo: null },
    guest: { label: t("me.providerGuest"), logo: null },
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
