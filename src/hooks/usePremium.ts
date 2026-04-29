import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const DEV_KEY = "moody_dev_premium";

/**
 * Premium status with optional dev-toggle stored in localStorage.
 * `isPremium` is true if either the profile row says so, or the local
 * developer override is on.
 *
 * NOTE: During public preview / friend-testing phase, the dev toggle
 * defaults to ON so visitors can try every feature without sign-up.
 * Set DEV_KEY to "0" explicitly in localStorage to lock features again.
 */
export function usePremium() {
  const { user } = useAuth();
  const [serverPremium, setServerPremium] = useState(false);
  const [devPremium, setDevPremium] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(DEV_KEY);
    // 처음 방문자: 자동으로 잠금 해제 (프리뷰 모드)
    if (stored === null) {
      localStorage.setItem(DEV_KEY, "1");
      return true;
    }
    return stored === "1";
  });
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

/** ADHD daily-trial helper.
 *  프리뷰 모드에서는 항상 사용 가능하도록 dev premium ON이면 true 반환. */
const ADHD_KEY = "moody_adhd_last";
export function adhdTrialAvailable(): boolean {
  if (typeof window !== "undefined" && localStorage.getItem(DEV_KEY) === "1") {
    return true;
  }
  const last = localStorage.getItem(ADHD_KEY);
  if (!last) return true;
  const lastDay = new Date(last).toDateString();
  return lastDay !== new Date().toDateString();
}
export function markAdhdUsed() {
  localStorage.setItem(ADHD_KEY, new Date().toISOString());
}
