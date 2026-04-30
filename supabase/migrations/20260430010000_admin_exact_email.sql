-- ============ 관리자 인증 — 정확한 이메일만 ============
-- 사용자가 자신의 Apple 릴레이 이메일을 알려줬으므로 LIKE 패턴 제거하고 exact match 만 허용.
-- 두 이메일 중 하나에 정확히 매칭될 때만 관리자:
--   1) kimyul83@icloud.com (Apple 이메일 공유 시)
--   2) vm5j8rn27t@privaterelay.appleid.com (Apple Hide My Email 시 발급된 본인 릴레이)
-- 이외엔 누구도 관리자 안 됨 — prefix 매칭/메타데이터 매칭 다 제거.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND lower(email) IN (
        'kimyul83@icloud.com',
        'vm5j8rn27t@privaterelay.appleid.com'
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
