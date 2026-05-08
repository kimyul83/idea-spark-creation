import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moody } from "@/components/Moody";

/**
 * 앱 진입 로딩 — TesterGate 와 동일한 톤 (다크 그라디언트 + 무디 캐릭터).
 * iOS 네이티브 스플래시(600ms) 후 이어서 매끄럽게.
 */
const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // 즉시 리다이렉트 — Index 자체는 깜빡임만 막는 가림막. iOS 네이티브 스플래시가 이미 보여줌.
    const seen = localStorage.getItem("moody_onboarded");
    navigate(seen ? "/home" : "/onboarding", { replace: true });
  }, [navigate]);
  // 깜빡임 방지용 청록 단색 — iOS 스플래시와 페이지 사이 이음매 매끄럽게
  return <div className="fixed inset-0" style={{ background: "#F2FBFC" }} />;
};

export default Index;
