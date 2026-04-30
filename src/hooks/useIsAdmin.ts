import { useAuth } from "@/hooks/useAuth";

const ADMIN_EMAIL = "kimyul83@icloud.com";
// Apple "내 이메일 숨기기" 시 발급된 릴레이 이메일 prefix.
// vm5j8xxxxx@privaterelay.appleid.com 형태 — 36^5 = 약 6천만 분의 1 충돌 확률이라 사실상 본인만 매칭.
const ADMIN_APPLE_RELAY_PREFIX = "vm5j8";

/**
 * 관리자 1명만 모든 사용자 통계/플랜 부여 페이지에 접근 가능.
 * 보안: UI 게이트일 뿐 — 진짜 권한은 Supabase RLS 의 is_admin() 함수.
 *
 * 매칭 조건 (DB의 is_admin() 함수와 동일):
 *   1) user.email = kimyul83@icloud.com
 *   2) user.email = vm5j8xxx@privaterelay.appleid.com (Apple Hide My Email 릴레이)
 *   3) user.user_metadata.email = kimyul83@icloud.com (Apple 메타데이터)
 *   4) user.app_metadata.email = kimyul83@icloud.com
 */
export function useIsAdmin() {
  const { user, loading } = useAuth();

  const matches = (() => {
    if (!user) return false;
    const email = (user.email ?? "").toLowerCase();
    if (email === ADMIN_EMAIL) return true;
    if (
      email.startsWith(ADMIN_APPLE_RELAY_PREFIX) &&
      email.endsWith("@privaterelay.appleid.com")
    ) {
      return true;
    }
    const metaEmail = (user.user_metadata?.email ?? "").toString().toLowerCase();
    if (metaEmail === ADMIN_EMAIL) return true;
    const appEmail = (user.app_metadata?.email ?? "").toString().toLowerCase();
    if (appEmail === ADMIN_EMAIL) return true;
    return false;
  })();

  return { isAdmin: matches, loading };
}

export { ADMIN_EMAIL };
