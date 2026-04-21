import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moodie } from "@/components/Moodie";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const slides = [
  {
    eyebrow: "Moodie",
    title: "당신의 감정에 맞춘\n사운드 테라피",
    desc: "기분과 상황에 꼭 맞는 소리로\n마음을 부드럽게 다독여요",
  },
  {
    eyebrow: "Care",
    title: "호흡 · 자연 · 집중\n세 가지로 마음을 돌봐요",
    desc: "과학적으로 설계된 주파수와\n자연의 소리, 깊은 호흡까지",
  },
  {
    eyebrow: "Begin",
    title: "준비됐다면\n같이 시작해요",
    desc: "이메일로 빠르게 시작하고\n맞춤 추천을 받아보세요",
  },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("moodie_onboarded")) navigate("/home", { replace: true });
  }, [navigate]);

  const finish = () => {
    localStorage.setItem("moodie_onboarded", "1");
    navigate("/home", { replace: true });
  };

  const handleAuth = async () => {
    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해주세요");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/home` },
        });
        if (error) throw error;
        toast.success("가입 완료! 환영해요 🌿");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("다시 만나서 반가워요");
      }
      finish();
    } catch (e: any) {
      toast.error(e.message ?? "오류가 발생했어요");
    } finally {
      setBusy(false);
    }
  };

  const slide = slides[step];

  return (
    <div className="app-shell flex flex-col mesh-bg overflow-hidden">
      {/* progress dots */}
      <div className="flex justify-center gap-1.5 pt-12">
        {slides.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              i === step ? "w-10 bg-charcoal" : "w-1 bg-charcoal/20"
            )}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative">
        {/* soft background blob */}
        <div className="blob w-[420px] h-[420px] -z-10 opacity-30 bg-sage-deep" />

        <Moodie size="large" />

        <p className="mt-10 text-xs tracking-[0.3em] uppercase text-sage-deep font-medium font-serif animate-fade-up" key={step + "-e"}>
          {slide.eyebrow}
        </p>
        <h1
          key={step + "-t"}
          className="mt-3 text-[28px] font-bold text-charcoal whitespace-pre-line leading-tight animate-fade-up"
        >
          {slide.title}
        </h1>
        <p
          key={step + "-d"}
          className="mt-4 text-charcoal/60 whitespace-pre-line leading-relaxed animate-fade-up"
        >
          {slide.desc}
        </p>

        {step === 2 && (
          <div className="mt-8 w-full space-y-2.5 animate-fade-up">
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-2xl bg-white/90 border-beige text-charcoal"
            />
            <Input
              type="password"
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-2xl bg-white/90 border-beige text-charcoal"
            />
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-xs text-charcoal/60 underline pt-1"
            >
              {mode === "signup" ? "이미 계정이 있어요" : "처음이에요 (가입하기)"}
            </button>
          </div>
        )}
      </div>

      <div className="px-6 pb-10 space-y-2">
        {step < 2 ? (
          <>
            <Button
              size="lg"
              onClick={() => setStep(step + 1)}
              className="w-full h-14 rounded-2xl bg-charcoal hover:bg-charcoal/90 text-cream text-base font-semibold shadow-soft"
            >
              다음 <ChevronRight className="ml-1 w-5 h-5" />
            </Button>
            <button onClick={finish} className="w-full text-sm text-charcoal/50 py-2">
              나중에 할게요
            </button>
          </>
        ) : (
          <>
            <Button
              size="lg"
              disabled={busy}
              onClick={handleAuth}
              className="w-full h-14 rounded-2xl bg-charcoal hover:bg-charcoal/90 text-cream text-base font-semibold shadow-soft"
            >
              {busy ? "처리 중..." : mode === "signup" ? "가입하고 시작하기" : "로그인"}
            </Button>
            <button onClick={finish} className="w-full text-sm text-charcoal/50 py-2">
              둘러보기 (로그인 없이)
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
