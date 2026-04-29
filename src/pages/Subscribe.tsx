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
  { id: "monthly", label: "월 구독", price: "₩5,500", per: "/ 월" },
  { id: "yearly",  label: "연 구독", price: "₩49,000", per: "/ 년", badge: "두 달 무료 · 25% 할인" },
];

const BENEFITS = [
  { title: "12시간 무제한 재생", desc: "무료는 10분 미리듣기 · 프리미엄은 잠들 때까지" },
  { title: "12가지 자연 사운드 · 무제한 믹스", desc: "폭포·빗소리·바다·숲·동굴 등 변주 50종 이상 잠금 해제" },
  { title: "모든 호흡법 10가지", desc: "Wim Hof · 6-6 깊은 호흡 · 카팔라바티 등 프리미엄 패턴" },
  { title: "수면 사운드 풀 라이브러리", desc: "모닥불 ASMR · 깊은 밤 명상 등 6개 트랙 22변주 + 최대 12시간 타이머" },
  { title: "유리 깨기 모든 영상", desc: "프리미엄 슬라이싱·파괴·ASMR 영상 12개 전부" },
  { title: "ADHD 집중 모드", desc: "40Hz 감마파 + 집중 사운드 · 뽀모도로 자동" },
  { title: "광고 없음 · 끊김 없는 재생", desc: "잠들 때까지 한 번 켜면 끝" },
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
        <p className="mt-3 chip-primary text-[12px] tracking-[0.3em] uppercase font-serif">Moody+</p>
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
            <div className="num-display text-2xl">{p.price}</div>
          </button>
        ))}
      </div>

      {/* benefits */}
      <div className="px-5 mt-6">
        <p className="text-[15px] tracking-[0.3em] uppercase text-primary font-bold font-serif mb-3 px-1">
          포함된 혜택
        </p>
        <div className="space-y-2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="liquid-card p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-5 h-5 text-primary" strokeWidth={2.4} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground text-[15px] leading-snug">{b.title}</p>
                <p className="text-[12px] text-foreground/65 mt-0.5 leading-snug">{b.desc}</p>
              </div>
            </div>
          ))}
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
