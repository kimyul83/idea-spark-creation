import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonetBackground } from "@/components/MonetBackground";
import { Moodie } from "@/components/Moodie";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { cn } from "@/lib/utils";

type PlanId = "monthly" | "yearly" | "lifetime";

interface Plan {
  id: PlanId;
  label: string;
  price: string;
  per: string;
  badge?: string;
  highlight?: boolean;
}

const PLANS: Plan[] = [
  { id: "monthly", label: "월 구독", price: "₩4,900", per: "/ 월" },
  { id: "yearly",  label: "연 구독", price: "₩29,000", per: "/ 년", badge: "최대 60% 할인", highlight: true },
  { id: "lifetime", label: "평생 이용권", price: "₩59,000", per: "한 번 결제", badge: "런칭 한정" },
];

interface Row {
  feature: string;
  endel: string;
  moodie: string;
  highlight?: boolean;
}
const COMPARE: Row[] = [
  { feature: "감정 카테고리", endel: "4개", moodie: "12개" },
  { feature: "한국 감정", endel: "✗", moodie: "✓", highlight: true },
  { feature: "호흡법 영상", endel: "✗", moodie: "✓" },
  { feature: "ADHD 모드", endel: "부분", moodie: "전용" },
  { feature: "유리 깨기", endel: "✗", moodie: "✓", highlight: true },
  { feature: "월 구독", endel: "₩28,000", moodie: "₩4,900", highlight: true },
];

const Subscribe = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh, isPremium } = usePremium();
  const [picked, setPicked] = useState<PlanId>("yearly");

  const handleSubscribe = async () => {
    if (!user) {
      alert("결제 시스템 준비 중 — 로그인 후 이용 가능해요");
      return;
    }
    // dev placeholder: simulate by updating profile (will be replaced with payment)
    alert("결제 시스템 준비 중이에요 🌿\n곧 만나보실 수 있어요!");
    // Optional: mark as premium for testing only when explicitly chosen via Me toggle.
    await supabase
      .from("profiles")
      .update({ subscription_type: picked })
      .eq("id", user.id);
    refresh();
  };

  return (
    <div className="min-h-screen pb-10 relative">
      <MonetBackground intensity="strong" emotion="loved" />

      <div className="px-5 pt-12 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full surface flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-charcoal" />
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full surface flex items-center justify-center"
        >
          <X className="w-5 h-5 text-charcoal" />
        </button>
      </div>

      <div className="text-center mt-6 px-5">
        <div className="flex justify-center">
          <Moodie size="large" emotion="happy" />
        </div>
        <p className="mt-4 text-[11px] tracking-[0.3em] uppercase text-sage-deep font-serif">
          Moodie+
        </p>
        <h1 className="text-[28px] font-bold text-charcoal mt-2 leading-tight">
          프리미엄으로<br />더 깊은 힐링을
        </h1>
        <p className="text-sm text-charcoal/60 mt-3">
          12가지 감정 · 모든 호흡법 · ADHD · 유리 깨기까지
        </p>
        {isPremium && (
          <p className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage-deep text-cream text-xs font-semibold">
            <Crown className="w-3.5 h-3.5" /> 프리미엄 활성
          </p>
        )}
      </div>

      {/* plans */}
      <div className="px-5 mt-8 space-y-2.5">
        {PLANS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPicked(p.id)}
            className={cn(
              "w-full rounded-3xl p-5 transition-all text-left flex items-center gap-3 border-2",
              picked === p.id
                ? "bg-charcoal border-charcoal text-cream shadow-card"
                : "bg-white/85 backdrop-blur-sm border-transparent text-charcoal"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                picked === p.id ? "border-cream bg-cream" : "border-charcoal/30"
              )}
            >
              {picked === p.id && <Check className="w-4 h-4 text-charcoal" strokeWidth={3} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">{p.label}</span>
                {p.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      picked === p.id ? "bg-cream/20 text-cream" : "bg-terracotta/20 text-terracotta"
                    )}
                  >
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="text-[11px] opacity-70 mt-0.5">{p.per}</div>
            </div>
            <div className="font-serif text-2xl">{p.price}</div>
          </button>
        ))}
      </div>

      {/* compare */}
      <div className="px-5 mt-6">
        <div className="surface rounded-3xl p-5 shadow-soft">
          <p className="text-[11px] tracking-[0.3em] uppercase text-sage-deep font-serif">
            Compare
          </p>
          <h2 className="font-bold text-charcoal mt-1">Endel vs Moodie</h2>
          <div className="mt-4">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3 text-sm">
              <div className="text-[11px] uppercase tracking-wider text-charcoal/40">기능</div>
              <div className="text-[11px] uppercase tracking-wider text-charcoal/40 text-right">Endel</div>
              <div className="text-[11px] uppercase tracking-wider text-sage-deep font-bold text-right">Moodie</div>
              {COMPARE.map((r) => (
                <>
                  <div key={`${r.feature}-f`} className="text-charcoal/80">{r.feature}</div>
                  <div key={`${r.feature}-e`} className="text-charcoal/50 text-right tabular-nums">{r.endel}</div>
                  <div
                    key={`${r.feature}-m`}
                    className={cn(
                      "text-right tabular-nums font-semibold",
                      r.highlight ? "text-sage-deep" : "text-charcoal"
                    )}
                  >
                    {r.moodie}
                  </div>
                </>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 mt-8">
        <Button
          onClick={handleSubscribe}
          className="w-full h-16 rounded-2xl bg-charcoal hover:bg-charcoal/90 text-cream text-base font-bold shadow-card"
        >
          <Crown className="w-5 h-5 mr-2" /> 프리미엄 시작하기
        </Button>
        <p className="text-center text-[11px] text-charcoal/40 mt-3">
          언제든 해지 가능 · 첫 7일 환불 보장
        </p>
      </div>
    </div>
  );
};

export default Subscribe;
