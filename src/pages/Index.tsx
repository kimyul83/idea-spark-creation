// Index redirects to onboarding (or home if already onboarded)
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const seen = localStorage.getItem("moodie_onboarded");
    navigate(seen ? "/home" : "/onboarding", { replace: true });
  }, [navigate]);
  return (
    <div className="app-shell flex items-center justify-center bg-gradient-cream">
      <div className="w-16 h-16 rounded-full bg-gradient-mint animate-breathe shadow-glow" />
    </div>
  );
};

export default Index;
