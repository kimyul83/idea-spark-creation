import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** 즉시 리다이렉트 — 로딩 화면 ❌ */
const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const seen = localStorage.getItem("moody_onboarded");
    navigate(seen ? "/home" : "/onboarding", { replace: true });
  }, [navigate]);
  return null;
};

export default Index;
