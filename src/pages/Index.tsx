import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moody } from "@/components/Moody";

/**
 * 로딩 화면 — iOS 스플래시(cream)와 같은 배경으로 매끄럽게 이어지게.
 * 다크/cream 색 점프 ❌ → 같은 색감으로 부드럽게 페이드인 → 페이드아웃.
 */
const Index = () => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);
  useEffect(() => {
    const seen = localStorage.getItem("moody_onboarded");
    // 800ms 보여주고 → 페이드아웃 → navigate
    const fade = setTimeout(() => setFadeOut(true), 800);
    const go = setTimeout(() => navigate(seen ? "/home" : "/onboarding", { replace: true }), 1100);
    return () => { clearTimeout(fade); clearTimeout(go); };
  }, [navigate]);
  return (
    <div
      className="min-h-screen flex items-center justify-center transition-opacity duration-300"
      style={{
        background: "linear-gradient(180deg, #F2FBFC 0%, #E8F6F8 100%)",
        opacity: fadeOut ? 0 : 1,
      }}
    >
      <div className="animate-fade-up">
        <Moody size={220} emotion="default" />
      </div>
    </div>
  );
};

export default Index;
