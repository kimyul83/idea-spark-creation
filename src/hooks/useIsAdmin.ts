import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * 관리자 인증 — 정확한 이메일만 매칭. 그 외엔 누구도 관리자 안 됨.
 *  - kimyul83@icloud.com (Apple 이메일 공유 시)
 *  - vm5j8rn27t@privaterelay.appleid.com (Apple Hide My Email 시 발급된 본인 릴레이)
 *
 * 보안: UI 게이트일 뿐 — 진짜 권한은 Supabase RLS 의 is_admin() 함수.
 * DB 함수와 정확히 동일한 화이트리스트를 유지.
 */
const ADMIN_EMAILS = new Set([
  "kimyul83@icloud.com",
  "vm5j8rn27t@privaterelay.appleid.com",
]);

export function useIsAdmin() {
  const { user, loading } = useAuth();
  const email = useMemo(() => (user?.email ?? "").toLowerCase(), [user?.email]);
  const emailAllowed = !!user && ADMIN_EMAILS.has(email);
  const [dbAllowed, setDbAllowed] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (loading) return;
    if (!user) {
      setDbAllowed(false);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);
    supabase
      .from("user_roles" as any)
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        setDbAllowed(!error && !!data);
        setRoleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  const isAdmin = emailAllowed || dbAllowed;
  return { isAdmin, loading: loading || roleLoading };
}

export const ADMIN_EMAIL = "kimyul83@icloud.com";
