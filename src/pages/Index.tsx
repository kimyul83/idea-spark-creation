import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moodie } from "@/components/Moodie";
import { MonetBackground } from "@/components/MonetBackground";

const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const seen = localStorage.getItem("moodie_onboarded");
    const t = setTimeout(() => navigate(seen ? "/home" : "/onboarding", { replace: true }), 400);
    return () => clearTimeout(t);
  }, [navigate]);
  return (
    <div className="app-shell flex items-center justify-center relative min-h-[100dvh]">
      <MonetBackground intensity="strong" />
      <Moodie size="large" />
    </div>
  );
};

export default Index;
