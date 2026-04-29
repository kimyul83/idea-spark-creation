import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Moody } from "@/components/Moody";
import { MonetBackground } from "@/components/MonetBackground";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        toast.error(t("auth.errCallback"));
        navigate("/onboarding", { replace: true });
        return;
      }
      if (data.session) {
        localStorage.setItem("moody_onboarded", "1");
        toast.success(t("auth.successWelcome"));
        navigate("/home", { replace: true });
      } else {
        // OAuth flow may still be settling — give it a beat
        setTimeout(() => {
          if (!active) return;
          supabase.auth.getSession().then(({ data: d2 }) => {
            if (d2.session) {
              localStorage.setItem("moody_onboarded", "1");
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
        <Moody size="large" emotion="happy" />
        <p className="mt-4 text-foreground/60 text-sm font-serif tracking-widest">
          {t("common.loading")}...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
