/**
 * RevenueCat 통합 — 구독 결제 / entitlement 관리.
 *
 * 설계 원칙:
 *   - 네이티브 (Capacitor iOS/Android) 에서만 동작. 웹에선 no-op (구독 체크 항상 false).
 *   - API 키 없으면 (.env 미설정) 도 앱 크래시 ❌ — 조용히 비활성화.
 *   - 모든 함수 try-catch — 결제 실패해도 앱이 죽지 않게.
 *
 * 환경변수:
 *   VITE_REVENUECAT_IOS_KEY     — RevenueCat 대시보드의 \"Public SDK Key\" (App Store)
 *   VITE_REVENUECAT_ANDROID_KEY — RevenueCat 대시보드의 \"Public SDK Key\" (Play Store)
 *
 * Entitlement ID: \"premium\" — RevenueCat 대시보드에서 동일하게 설정 필요.
 */

import { Capacitor } from "@capacitor/core";

// 동적 import 로 웹 빌드 시 네이티브 모듈 로딩 안 함 (번들 크기 절약 + SSR safety)
type PurchasesModule = typeof import("@revenuecat/purchases-capacitor");
type PurchasesType = PurchasesModule["Purchases"];

let _Purchases: PurchasesType | null = null;
let _initialized = false;
let _initializing: Promise<boolean> | null = null;

const ENTITLEMENT_ID = "premium";

const isNative = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

const getApiKey = (): string | null => {
  if (!isNative()) return null;
  const platform = Capacitor.getPlatform();
  const key = platform === "ios"
    ? import.meta.env.VITE_REVENUECAT_IOS_KEY
    : platform === "android"
      ? import.meta.env.VITE_REVENUECAT_ANDROID_KEY
      : null;
  return key && key.length > 10 ? key : null;
};

/** 앱 마운트 시 1회 호출. 네이티브 + API 키 있을 때만 초기화. */
export async function initRevenueCat(userId?: string | null): Promise<boolean> {
  if (_initialized) return true;
  if (_initializing) return _initializing;

  _initializing = (async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.info("[RevenueCat] API 키 없음 — 비활성화 모드");
      return false;
    }

    try {
      const mod = await import("@revenuecat/purchases-capacitor");
      _Purchases = mod.Purchases;
      await _Purchases.configure({
        apiKey,
        appUserID: userId ?? undefined, // Supabase user.id 와 매칭
      });
      _initialized = true;
      console.info("[RevenueCat] 초기화 완료");
      return true;
    } catch (err) {
      console.error("[RevenueCat] 초기화 실패:", err);
      return false;
    }
  })();

  return _initializing;
}

/** Supabase 로그인 후 RevenueCat 사용자 ID 동기화. */
export async function setRevenueCatUser(userId: string | null): Promise<void> {
  if (!_initialized || !_Purchases) return;
  try {
    if (userId) await _Purchases.logIn({ appUserID: userId });
    else await _Purchases.logOut();
  } catch (err) {
    console.warn("[RevenueCat] 사용자 동기화 실패:", err);
  }
}

/** 현재 사용자가 프리미엄인지 확인. 네이티브 아니거나 미초기화면 false. */
export async function checkPremium(): Promise<boolean> {
  if (!_initialized || !_Purchases) return false;
  try {
    const info = await _Purchases.getCustomerInfo();
    const ent = info.customerInfo.entitlements.active[ENTITLEMENT_ID];
    return !!ent;
  } catch (err) {
    console.warn("[RevenueCat] 구독 확인 실패:", err);
    return false;
  }
}

/** 사용 가능한 구독 패키지 목록 (월간/연간). */
export async function getOfferings(): Promise<{
  monthly?: any;
  annual?: any;
} | null> {
  if (!_initialized || !_Purchases) return null;
  try {
    const offerings = await _Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return null;
    return {
      monthly: current.monthly ?? undefined,
      annual: current.annual ?? undefined,
    };
  } catch (err) {
    console.warn("[RevenueCat] 오퍼링 조회 실패:", err);
    return null;
  }
}

/** 구독 구매. 성공 시 entitlement 활성화 → checkPremium() = true. */
export async function purchasePackage(pkg: any): Promise<{
  success: boolean;
  cancelled?: boolean;
  error?: string;
}> {
  if (!_initialized || !_Purchases) {
    return { success: false, error: "결제 시스템 미초기화 (앱 다시 시작해주세요)" };
  }
  try {
    const result = await _Purchases.purchasePackage({ aPackage: pkg });
    const isPremium = !!result.customerInfo.entitlements.active[ENTITLEMENT_ID];
    return { success: isPremium };
  } catch (err: any) {
    if (err?.userCancelled || err?.code === "1") {
      return { success: false, cancelled: true };
    }
    return { success: false, error: err?.message ?? "결제 실패" };
  }
}

/** 구매 복원 — 다른 기기에서 산 구독을 현재 기기에 동기화. */
export async function restorePurchases(): Promise<boolean> {
  if (!_initialized || !_Purchases) return false;
  try {
    const info = await _Purchases.restorePurchases();
    return !!info.customerInfo.entitlements.active[ENTITLEMENT_ID];
  } catch (err) {
    console.warn("[RevenueCat] 복원 실패:", err);
    return false;
  }
}

export const isRevenueCatActive = () => _initialized;
export { ENTITLEMENT_ID };
