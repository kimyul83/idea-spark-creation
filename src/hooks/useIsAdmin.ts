import { useAuth } from "@/hooks/useAuth";

const ADMIN_EMAIL = "kimyul83@icloud.com";

/**
 * 관리자 1명만 모든 사용자 통계/플랜 부여 페이지에 접근 가능.
 * 보안: UI 차원의 게이트일 뿐 — 진짜 권한은 Supabase RLS의 is_admin() 함수가 결정.
 */
export function useIsAdmin() {
  const { user, loading } = useAuth();
  const isAdmin = !!user && user.email?.toLowerCase() === ADMIN_EMAIL;
  return { isAdmin, loading };
}

export { ADMIN_EMAIL };
