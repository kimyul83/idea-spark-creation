/**
 * 관리자 대시보드용 매출/마진/순이익 계산 헬퍼.
 *
 * 가격 (KRW):
 *   - 월간 5,500
 *   - 연간 49,000 (월 환산 ~4,083 = 26% 할인)
 *   - lifetime 99,000 (참고용 — 현재는 비활성)
 *
 * 비용 가정:
 *   - Apple In-App Purchase 수수료: 첫 해 30%, 1년 후 15%
 *     단순화를 위해 평균 25% 적용. (Small Business Program 적용 시 15%)
 *   - 서버/CDN/Supabase 비용: 사용자당 월 ~₩100 (Pro 플랜 평균 분담)
 *
 * 매출 = 활성 구독자 × 해당 플랜 가격 (월 환산)
 * 순이익 = 매출 − Apple 수수료 − 서버 비용
 * 마진률 = 순이익 / 매출
 */

export const PRICES_KRW = {
  monthly: 5500,
  yearly: 49000,
  lifetime: 99000,
  free: 0,
} as const;

/** 월 환산 가격 (yearly 는 ÷12). */
export const MONTHLY_REVENUE_KRW = {
  monthly: PRICES_KRW.monthly,
  yearly: Math.round(PRICES_KRW.yearly / 12),
  lifetime: 0, // lifetime 은 1회성 — 월 매출 0
  free: 0,
} as const;

export const APPLE_FEE_RATE = 0.25; // Apple 수수료 평균
export const SERVER_COST_PER_USER_KRW = 100; // 월 인당 서버 비용

export type PlanType = "free" | "monthly" | "yearly" | "lifetime";

/** 단일 사용자 한 달치 매출 계산. lifetime 은 결제 시점에만 매출 발생하므로 별도 처리 필요. */
export function monthlyRevenue(plan: PlanType): number {
  return MONTHLY_REVENUE_KRW[plan] ?? 0;
}

/** 전체 사용자 배열 → 월 환산 KPI. lifetime 은 LIFETIME_REVENUE 별도 합산. */
export function computeKPI(users: Array<{ subscription_type: string }>) {
  let monthly = 0;
  let yearly = 0;
  let lifetime = 0;
  let free = 0;
  let monthlyRevenueKrw = 0;
  let lifetimeRevenueKrw = 0;

  for (const u of users) {
    const plan = (u.subscription_type ?? "free") as PlanType;
    if (plan === "monthly") {
      monthly += 1;
      monthlyRevenueKrw += MONTHLY_REVENUE_KRW.monthly;
    } else if (plan === "yearly") {
      yearly += 1;
      monthlyRevenueKrw += MONTHLY_REVENUE_KRW.yearly;
    } else if (plan === "lifetime") {
      lifetime += 1;
      lifetimeRevenueKrw += PRICES_KRW.lifetime; // 1회성 — 누적
    } else {
      free += 1;
    }
  }

  const totalUsers = users.length;
  const paidUsers = monthly + yearly + lifetime;
  // Apple 수수료 — 월 매출 + lifetime 누적 매출 모두에 부과
  const totalRevenue = monthlyRevenueKrw + lifetimeRevenueKrw;
  const appleFee = Math.round(totalRevenue * APPLE_FEE_RATE);
  const serverCost = totalUsers * SERVER_COST_PER_USER_KRW;
  const netProfit = totalRevenue - appleFee - serverCost;
  const margin = totalRevenue > 0 ? netProfit / totalRevenue : 0;

  return {
    totalUsers, paidUsers, free, monthly, yearly, lifetime,
    monthlyRevenueKrw, lifetimeRevenueKrw, totalRevenue,
    appleFee, serverCost, netProfit, margin,
  };
}

/** ₩ 포맷팅. */
export const fmtKrw = (n: number): string =>
  n.toLocaleString("ko-KR", { maximumFractionDigits: 0 }) + "원";

/** 퍼센트 포맷팅. */
export const fmtPct = (n: number): string =>
  (n * 100).toFixed(1) + "%";
