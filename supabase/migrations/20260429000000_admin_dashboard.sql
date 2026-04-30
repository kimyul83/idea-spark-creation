-- ============ Admin dashboard ============
-- 관리자 1명 (kimyul83@icloud.com) 만 모든 사용자/세션 조회·플랜 부여 가능.
-- 보안: SECURITY DEFINER 함수로 auth.users.email 을 조회하여 검증.
-- RLS 정책은 기존 사용자 정책에 OR 형태로 추가.

-- 1) 관리자 검증 함수 (현재 로그인 사용자가 관리자 메일인지)
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
      AND lower(email) = 'kimyul83@icloud.com'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2) profiles: 관리자 전체 조회 + 전체 수정
CREATE POLICY "Admin views all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin updates all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3) sessions: 관리자 전체 조회
CREATE POLICY "Admin views all sessions"
  ON public.sessions
  FOR SELECT
  USING (public.is_admin());

-- 4) focus_sessions: 관리자 전체 조회
CREATE POLICY "Admin views all focus"
  ON public.focus_sessions
  FOR SELECT
  USING (public.is_admin());

-- 5) sound_mixes: 관리자 전체 조회 (이용자가 어떤 믹스 만드는지 모니터링용)
CREATE POLICY "Admin views all mixes"
  ON public.sound_mixes
  FOR SELECT
  USING (public.is_admin());

-- 6) favorites: 관리자 전체 조회
CREATE POLICY "Admin views all favorites"
  ON public.favorites
  FOR SELECT
  USING (public.is_admin());

-- 7) 관리자 통계용 뷰 — 한 번의 쿼리로 모든 사용자 + 사용량 집계
CREATE OR REPLACE VIEW public.admin_user_stats AS
SELECT
  p.id,
  p.email,
  p.is_premium,
  p.subscription_type,
  p.subscription_started_at,
  p.created_at AS joined_at,
  COALESCE(s.session_count, 0)   AS session_count,
  COALESCE(s.total_seconds, 0)   AS total_seconds,
  COALESCE(f.focus_count, 0)     AS focus_count,
  COALESCE(f.focus_seconds, 0)   AS focus_seconds,
  s.last_session_at
FROM public.profiles p
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*)                                  AS session_count,
    SUM(duration_seconds)                     AS total_seconds,
    MAX(created_at)                           AS last_session_at
  FROM public.sessions
  GROUP BY user_id
) s ON s.user_id = p.id
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*)                                  AS focus_count,
    SUM(COALESCE(actual_duration, planned_duration)) AS focus_seconds
  FROM public.focus_sessions
  GROUP BY user_id
) f ON f.user_id = p.id;

-- 뷰는 정의자 권한으로 동작 — 위 RLS 정책으로 관리자만 접근 가능.
GRANT SELECT ON public.admin_user_stats TO authenticated;
