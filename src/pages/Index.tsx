import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moodie } from "@/components/Moodie";

const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const seen = localStorage.getItem("moodie_onboarded");
    const t = setTimeout(() => navigate(seen ? "/home" : "/onboarding", { replace: true }), 400);
    return () => clearTimeout(t);
  }, [navigate]);
  return (
    <div className="app-shell flex items-center justify-center mesh-bg">
      <Moodie size="large" />
    </div>
  );
};

export default Index;
