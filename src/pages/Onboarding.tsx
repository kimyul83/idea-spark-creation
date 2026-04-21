import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moodie } from "@/components/Moodie";
import { MonetBackground } from "@/components/MonetBackground";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
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
    title: "간편하게\n시작하세요",
    desc: "소셜 로그인으로 빠르게 시작하고\n맞춤 추천을 받아보세요",
  },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [showEmail, setShowEmail] = useState(false);
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

  const handleOAuth = async (provider: "google" | "apple") => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth/callback`,
      });
      if (result.error) {
        toast.error(`${provider === "google" ? "Google" : "Apple"} 로그인에 실패했어요`);
        setBusy(false);
        return;
      }
      // result.redirected → browser will navigate to provider; nothing else to do
      // tokens-back path → callback page handles it
    } catch (e: any) {
      toast.error(e?.message ?? "로그인 중 오류가 발생했어요");
      setBusy(false);
    }
  };

  const handleEmail = async () => {
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
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        toast.success("가입 완료! 환영해요 ✨");
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
    <div className="app-shell flex flex-col overflow-hidden">
      <MonetBackground intensity="strong" />
      <div className="flex justify-center gap-1.5 pt-12">
        {slides.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              i === step ? "w-10 bg-primary" : "w-1 bg-foreground/20"
            )}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative">
        <Moodie size="large" />

        <p key={step + "-e"} className="mt-10 text-xs tracking-[0.3em] uppercase text-primary font-medium font-serif animate-fade-up">
          {slide.eyebrow}
        </p>
        <h1
          key={step + "-t"}
          className="mt-3 text-[28px] font-bold text-foreground whitespace-pre-line leading-tight animate-fade-up"
        >
          {slide.title}
        </h1>
        <p
          key={step + "-d"}
          className="mt-4 text-foreground/60 whitespace-pre-line leading-relaxed animate-fade-up"
        >
          {slide.desc}
        </p>

        {step === 2 && showEmail && (
          <div className="mt-8 w-full space-y-2.5 animate-fade-up">
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-2xl bg-section/90 border-border text-foreground"
            />
            <Input
              type="password"
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-2xl bg-section/90 border-border text-foreground"
            />
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-xs text-foreground/60 underline pt-1"
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
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold shadow-soft"
            >
              다음 <ChevronRight className="ml-1 w-5 h-5" />
            </Button>
            <button onClick={finish} className="w-full text-sm text-foreground/50 py-2">
              나중에 할게요
            </button>
          </>
        ) : showEmail ? (
          <>
            <Button
              size="lg"
              disabled={busy}
              onClick={handleEmail}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold shadow-soft"
            >
              {busy ? "처리 중..." : mode === "signup" ? "가입하고 시작하기" : "로그인"}
            </Button>
            <button
              onClick={() => setShowEmail(false)}
              className="w-full text-sm text-foreground/50 py-2 inline-flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 다른 방법으로 로그인
            </button>
          </>
        ) : (
          <>
            {/* Google */}
            <button
              disabled={busy}
              onClick={() => handleOAuth("google")}
              className="w-full h-14 rounded-3xl bg-white text-[#1A2333] font-semibold shadow-soft flex items-center justify-center gap-3 disabled:opacity-60 transition-transform active:scale-[0.98]"
            >
              <GoogleLogo />
              <span>Google로 계속하기</span>
            </button>
            {/* Apple */}
            <button
              disabled={busy}
              onClick={() => handleOAuth("apple")}
              className="w-full h-14 rounded-3xl bg-[#000] text-white font-semibold shadow-soft flex items-center justify-center gap-3 disabled:opacity-60 transition-transform active:scale-[0.98]"
            >
              <AppleLogo />
              <span>Apple로 계속하기</span>
            </button>
            {/* Email */}
            <button
              disabled={busy}
              onClick={() => setShowEmail(true)}
              className="w-full h-14 rounded-3xl surface text-foreground font-semibold flex items-center justify-center gap-3 disabled:opacity-60 transition-transform active:scale-[0.98]"
            >
              <Mail className="w-5 h-5" />
              <span>이메일로 계속하기</span>
            </button>
            <button onClick={finish} className="w-full text-sm text-foreground/50 py-2">
              나중에 할게요
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.5 6.7 29 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19 19-8.5 19-19c0-1.2-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.2 18.9 13 24 13c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.5 6.7 29 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 43c5 0 9.5-1.6 13-4.4l-6-5.1c-1.9 1.4-4.4 2.4-7 2.4-5.2 0-9.6-2.9-11.3-7l-6.5 5C9.5 39.6 16.2 43 24 43z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6 5.1c-.4.4 6.5-4.7 6.5-14.8 0-1.2-.1-2.4-.4-3.5z"/>
  </svg>
);

const AppleLogo = () => (
  <svg width="18" height="20" viewBox="0 0 384 512" fill="currentColor" aria-hidden>
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM256 84.5c19.4-23 17.6-43.9 17-51.5-17.1 1-36.9 11.7-48.2 24.8-12.4 14-19.7 31.4-18.1 50.7 18.5 1.4 35.4-8.1 49.3-24z"/>
  </svg>
);

export default Onboarding;
