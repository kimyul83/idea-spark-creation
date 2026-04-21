import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Moodie } from "@/components/Moodie";
import { MonetBackground } from "@/components/MonetBackground";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        toast.error("로그인 처리 중 오류가 발생했어요");
        navigate("/onboarding", { replace: true });
        return;
      }
      if (data.session) {
        localStorage.setItem("moodie_onboarded", "1");
        toast.success("환영해요 ✨");
        navigate("/home", { replace: true });
      } else {
        // OAuth flow may still be settling — give it a beat
        setTimeout(() => {
          if (!active) return;
          supabase.auth.getSession().then(({ data: d2 }) => {
            if (d2.session) {
              localStorage.setItem("moodie_onboarded", "1");
              navigate("/home", { replace: true });
            } else {
              navigate("/onboarding", { replace: true });
            }
          });
        }, 800);
      }
    });
    return () => { active = false; };
  }, [navigate]);

  return (
    <div className="app-shell flex items-center justify-center relative min-h-[100dvh]">
      <MonetBackground intensity="strong" />
      <div className="text-center">
        <Moodie size="large" emotion="happy" />
        <p className="mt-4 text-foreground/60 text-sm font-serif tracking-widest">
          로그인 중...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
