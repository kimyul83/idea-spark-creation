import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonetBackground } from "@/components/MonetBackground";
import { Moody } from "@/components/Moody";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { cn } from "@/lib/utils";

type PlanId = "monthly" | "yearly";

interface Plan {
  id: PlanId;
  label: string;
  price: string;
  per: string;
  badge?: string;
}

const PLANS: Plan[] = [
  { id: "monthly", label: "월 구독", price: "₩4,900", per: "/ 월" },
  { id: "yearly",  label: "연 구독", price: "₩29,000", per: "/ 년", badge: "최대 60% 할인" },
];

interface Row { feature: string; endel: string; moody: string; highlight?: boolean }
const COMPARE: Row[] = [
  { feature: "감정 카테고리", endel: "4개", moody: "12개" },
  { feature: "한국 감정", endel: "✗", moody: "✓", highlight: true },
  { feature: "호흡법 영상", endel: "✗", moody: "✓" },
  { feature: "ADHD 모드", endel: "부분", moody: "전용" },
  { feature: "유리 깨기", endel: "✗", moody: "✓", highlight: true },
  { feature: "월 구독", endel: "₩28,000", moody: "₩4,900", highlight: true },
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
    alert("결제 시스템 준비 중이에요 ✨\n곧 만나보실 수 있어요!");
    await supabase.from("profiles").update({ subscription_type: picked }).eq("id", user.id);
    refresh();
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
        <p className="mt-3 text-[11px] tracking-[0.3em] uppercase text-primary font-serif">Moody+</p>
        <h1 className="text-[28px] font-bold text-foreground mt-2 leading-tight">
          프리미엄으로<br />더 깊은 힐링을
        </h1>
        <p className="text-sm text-foreground/60 mt-2">
          12가지 감정 · 모든 호흡법 · ADHD · 유리 깨기까지
        </p>
        {isPremium && (
          <p className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            <Crown className="w-3.5 h-3.5" /> 프리미엄 활성
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
            <div className="font-serif text-2xl">{p.price}</div>
          </button>
        ))}
      </div>

      {/* compare */}
      <div className="px-5 mt-5">
        <div className="surface rounded-3xl p-5 shadow-soft">
          <p className="text-[11px] tracking-[0.3em] uppercase text-primary font-serif">Compare</p>
          <h2 className="font-bold text-foreground mt-1">Endel vs Moody</h2>
          <div className="mt-4">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3 text-sm">
              <div className="text-[11px] uppercase tracking-wider text-foreground/40">기능</div>
              <div className="text-[11px] uppercase tracking-wider text-foreground/40 text-right">Endel</div>
              <div className="text-[11px] uppercase tracking-wider text-primary font-bold text-right">Moody</div>
              {COMPARE.map((r) => (
                <div key={r.feature} className="contents">
                  <div className="text-foreground/80">{r.feature}</div>
                  <div className="text-foreground/50 text-right tabular-nums">{r.endel}</div>
                  <div
                    className={cn(
                      "text-right tabular-nums font-semibold",
                      r.highlight ? "text-primary" : "text-foreground"
                    )}
                  >
                    {r.moody}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 mt-6">
        <Button
          onClick={handleSubscribe}
          className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-card"
        >
          <Crown className="w-5 h-5 mr-2" /> 프리미엄 시작하기
        </Button>
        <p className="text-center text-[11px] text-foreground/40 mt-3">
          언제든 해지 가능 · 첫 7일 환불 보장
        </p>
      </div>
    </div>
  );
};

export default Subscribe;
