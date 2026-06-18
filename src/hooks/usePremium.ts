import { useCallback } from "react";

/**
 * v1.0 출시 — 결제 시스템 없이 모든 기능 무료.
 * 향후 v1.x 에서 RevenueCat 붙일 때 아래 주석 블록 복원하면 됨.
 *
 * 코드 곳곳의 `track.premium && !isPremium` 가드는 그대로 유지 — 나중에 결제 붙이면
 * 자동으로 잠금 동작 함. 지금은 isPremium=true 라 모두 통과.
 */
export function usePremium() {
  // no-op refresh — 결제 비활성 상태라 server/RevenueCat 조회 없음
  const refresh = useCallback(async () => {}, []);
  const setDev = useCallback((_v: boolean) => {}, []);
  return {
    isPremium: true,
    serverPremium: true,
    devPremium: true,
    setDev,
    loading: false,
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

/** ADHD daily-trial helper — v1.0 출시는 결제 없어서 항상 true. */
const ADHD_KEY = "moody_adhd_last";
export function adhdTrialAvailable(): boolean {
  return true;
}
export function markAdhdUsed() {
  localStorage.setItem(ADHD_KEY, new Date().toISOString());
}
