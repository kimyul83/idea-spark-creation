-- ============ Admin 인증 확장: Apple "내 이메일 숨기기" 대응 ============
-- 사용자가 Apple 로그인 시 이메일 공유 안 하면 vm5j8xxx@privaterelay.appleid.com
-- 같은 릴레이 이메일이 저장됨 → 기존 'kimyul83@icloud.com' 매칭이 실패.
--
-- 다음 4가지 중 하나라도 매칭되면 관리자:
--   1) auth.users.email = kimyul83@icloud.com (이메일 공유한 경우)
--   2) auth.users.email LIKE 'vm5j8%@privaterelay.appleid.com' (해당 사용자 릴레이 prefix)
--   3) raw_user_meta_data->>'email' = kimyul83@icloud.com (Apple 메타데이터)
--   4) raw_app_meta_data->>'email' = kimyul83@icloud.com (Supabase 메타데이터)
--
-- prefix 'vm5j8' 는 5글자(영숫자) → 36^5 = 약 6천만 분의 1 충돌 확률.
-- 실질적으로 해당 사용자만 매칭됨.

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
      AND (
        lower(email) = 'kimyul83@icloud.com'
        OR lower(email) LIKE 'vm5j8%@privaterelay.appleid.com'
        OR lower(raw_user_meta_data->>'email') = 'kimyul83@icloud.com'
        OR lower(raw_app_meta_data->>'email') = 'kimyul83@icloud.com'
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
