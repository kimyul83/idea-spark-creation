import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Check, Crown, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonetBackground } from "@/components/MonetBackground";
import { Moody } from "@/components/Moody";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getOfferings, purchasePackage, restorePurchases, isRevenueCatActive } from "@/lib/revenuecat";

type PlanId = "monthly" | "yearly";

interface Plan {
  id: PlanId;
  label: string;
  price: string;
  per: string;
  badge?: string;
}

const BENEFIT_KEYS = ["unlimited", "natureMix", "breathing", "sleep", "glass", "adhd", "noAds"] as const;

const Subscribe = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { refresh, isPremium } = usePremium();
  const [picked, setPicked] = useState<PlanId>("yearly");
  const [busy, setBusy] = useState(false);
  const [offerings, setOfferings] = useState<{ monthly?: any; annual?: any } | null>(null);

  // 네이티브 + RevenueCat 활성화 시 실제 가격 가져옴 (지역화된 가격 표시)
  useEffect(() => {
    if (!isRevenueCatActive()) return;
    getOfferings().then((o) => setOfferings(o));
  }, []);

  const PLANS: Plan[] = [
    {
      id: "monthly",
      label: t("subscribe.monthly"),
      price: offerings?.monthly?.product?.priceString ?? "₩5,500",
      per: t("subscribe.perMonth"),
    },
    {
      id: "yearly",
      label: t("subscribe.yearly"),
      price: offerings?.annual?.product?.priceString ?? "₩49,000",
      per: t("subscribe.perYear"),
      badge: t("subscribe.yearlyBadge"),
    },
  ];

  const handleSubscribe = async () => {
    if (!user) {
      toast.error(t("subscribe.loginRequired"));
      return;
    }

    // 네이티브 환경 + RevenueCat 활성 → 실제 결제
    if (isRevenueCatActive() && offerings) {
      const pkg = picked === "monthly" ? offerings.monthly : offerings.annual;
      if (!pkg) {
        toast.error("이 플랜은 현재 구매할 수 없어요");
        return;
      }
      setBusy(true);
      const result = await purchasePackage(pkg);
      setBusy(false);
      if (result.success) {
        toast.success("프리미엄 활성화됐어요 ✨");
        refresh();
        setTimeout(() => navigate("/me"), 800);
      } else if (result.cancelled) {
        // 사용자가 취소 — 토스트 안 띄움
      } else {
        toast.error(result.error ?? "결제 실패");
      }
      return;
    }

    // 웹 + RevenueCat 비활성 → 안내
    toast.info("앱에서 결제 가능해요. 홈 화면에 추가하거나 App Store 에서 다운받아주세요.");
  };

  const handleRestore = async () => {
    if (!isRevenueCatActive()) return;
    setBusy(true);
    const ok = await restorePurchases();
    setBusy(false);
    if (ok) {
      toast.success("구매 복원됐어요");
      refresh();
    } else {
      toast.info("복원할 구매 내역이 없어요");
    }
  };

  return (
    <div className="min-h-[100dvh] pb-10 relative flex flex-col">
      <MonetBackground intensity="strong" emotion="loved" />

      <div className="px-5 pt-12 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full surface flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full surface flex items-center justify-center"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="text-center mt-4 px-5">
        <div className="flex justify-center">
          <Moody size="large" emotion="happy" />
        </div>
        <p className="mt-3 chip-primary text-[12px] tracking-[0.3em] uppercase font-serif">{t("subscribe.label")}</p>
        <h1 className="text-[28px] font-bold text-foreground mt-2 leading-tight whitespace-pre-line">
          {t("subscribe.title")}
        </h1>
        <p className="text-sm text-foreground/60 mt-2">
          {t("subscribe.subtitle")}
        </p>
        {isPremium && (
          <p className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            <Crown className="w-3.5 h-3.5" /> {t("subscribe.active")}
          </p>
        )}
      </div>

      {/* plans */}
      <div className="px-5 mt-6 space-y-2.5">
        {PLANS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPicked(p.id)}
            className={cn(
              "w-full rounded-3xl p-5 transition-all text-left flex items-center gap-3 border-2",
              picked === p.id
                ? "bg-foreground border-foreground text-background shadow-card"
                : "surface border-transparent text-foreground"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                picked === p.id ? "border-background bg-background" : "border-foreground/30"
              )}
            >
              {picked === p.id && <Check className="w-4 h-4 text-foreground" strokeWidth={3} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">{p.label}</span>
                {p.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      picked === p.id ? "bg-background/20 text-background" : "bg-accent/30 text-accent-foreground"
                    )}
                  >
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="text-[11px] opacity-70 mt-0.5">{p.per}</div>
            </div>
            <div className="num-display text-2xl">{p.price}</div>
          </button>
        ))}
      </div>

      {/* benefits */}
      <div className="px-5 mt-6">
        <p className="section-title mb-3 px-1">
          {t("subscribe.benefitsTitle")}
        </p>
        <div className="space-y-2">
          {BENEFIT_KEYS.map((key) => (
            <div key={key} className="liquid-card p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-5 h-5 text-primary" strokeWidth={2.4} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground text-[15px] leading-snug">
                  {t(`subscribe.benefits.${key}.title`)}
                </p>
                <p className="text-[12px] text-foreground/65 mt-0.5 leading-snug">
                  {t(`subscribe.benefits.${key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 mt-6">
        <Button
          onClick={handleSubscribe}
          disabled={busy}
          className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-card"
        >
          <Crown className="w-5 h-5 mr-2" /> {busy ? "처리 중..." : t("subscribe.cta")}
        </Button>
        {/* 구매 복원 — 네이티브 + RevenueCat 활성 시에만 노출 */}
        {isRevenueCatActive() && (
          <button
            onClick={handleRestore}
            disabled={busy}
            className="w-full mt-2 h-10 text-[12px] text-foreground/55 hover:text-foreground inline-flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" /> 구매 복원
          </button>
        )}
        <p className="text-center text-[11px] text-foreground/40 mt-3">
          {t("subscribe.footer")}
        </p>
      </div>
    </div>
  );
};

export default Subscribe;
