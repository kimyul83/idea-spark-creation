import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const DEV_KEY = "moodie_dev_premium";

/**
 * Premium status with optional dev-toggle stored in localStorage.
 * `isPremium` is true if either the profile row says so, or the local
 * developer override is on.
 */
export function usePremium() {
  const { user } = useAuth();
  const [serverPremium, setServerPremium] = useState(false);
  const [devPremium, setDevPremium] = useState<boolean>(
    () => typeof window !== "undefined" && localStorage.getItem(DEV_KEY) === "1"
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setServerPremium(false);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .maybeSingle();
    setServerPremium(!!data?.is_premium);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setDev = (v: boolean) => {
    setDevPremium(v);
    if (v) localStorage.setItem(DEV_KEY, "1");
    else localStorage.removeItem(DEV_KEY);
  };

  return {
    isPremium: serverPremium || devPremium,
    serverPremium,
    devPremium,
    setDev,
    loading,
    refresh,
  };
}

/** Premium emotion names (Korean). */
export const PREMIUM_EMOTION_NAMES = new Set([
  "자연인",
  "설렘",
  "사랑받음",
  "에너지 충전",
]);

/** Premium breathing pattern ids. Only 4-7-8 is free. */
export const PREMIUM_BREATHING = new Set(["box", "8-2-8"]);

/** ADHD daily-trial helper. */
const ADHD_KEY = "moodie_adhd_last";
export function adhdTrialAvailable(): boolean {
  const last = localStorage.getItem(ADHD_KEY);
  if (!last) return true;
  const lastDay = new Date(last).toDateString();
  return lastDay !== new Date().toDateString();
}
export function markAdhdUsed() {
  localStorage.setItem(ADHD_KEY, new Date().toISOString());
}
