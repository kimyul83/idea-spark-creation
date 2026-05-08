import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moody } from "@/components/Moody";

/**
 * 앱 진입 로딩 — TesterGate 톤 (다크 그라디언트 + 가운데 무디 캐릭터).
 * 1.2초 보여주고 다음 페이지로 매끄럽게 이동.
 */
const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const seen = localStorage.getItem("moody_onboarded");
    const t = setTimeout(() => navigate(seen ? "/home" : "/onboarding", { replace: true }), 1200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-[#050505] via-[#0A1525] to-[#0A0A0A] text-white">
      <div className="w-full max-w-sm flex flex-col items-center text-center animate-fade-up">
        <Moody size={240} emotion="default" />
        <p className="text-[11px] tracking-[0.3em] uppercase text-[#4AEBFB] font-serif mt-6">
          MINT WAVE
        </p>
        <h1 className="text-2xl font-bold mt-2">
          마음에 닿는 사운드 웨이브
        </h1>
        <p className="text-xs text-white/40 mt-3 tracking-wider">
          잠시만 기다려주세요 🫧
        </p>
      </div>
    </div>
  );
};

export default Index;
