import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moody } from "@/components/Moody";
import { useAuth } from "@/hooks/useAuth";

/**
 * 로딩 화면 — auth 상태 hydrate 까지 대기 후 라우팅:
 *   - 로그인 + 온보딩 완료 → /home
 *   - 로그아웃 OR 온보딩 미완 → /onboarding (Apple 로그인 보임)
 */
const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [fadeOut, setFadeOut] = useState(false);
  useEffect(() => {
    if (authLoading) return;
    const seen = localStorage.getItem("moody_onboarded");
    const target = (user && seen) ? "/home" : "/onboarding";
    const fade = setTimeout(() => setFadeOut(true), 600);
    const go = setTimeout(() => navigate(target, { replace: true }), 900);
    return () => { clearTimeout(fade); clearTimeout(go); };
  }, [navigate, user, authLoading]);
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
