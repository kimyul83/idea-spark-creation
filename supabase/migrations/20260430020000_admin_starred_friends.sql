-- ============ 친구 별표 표시 ============
-- 관리자가 친구 계정을 별표로 분류해서 따로 보고 일괄 권한 부여 가능.
-- profiles 테이블에 is_starred boolean 컬럼 추가.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_starred BOOLEAN NOT NULL DEFAULT false;

-- 인덱스 (별표 친구만 필터링 자주 함)
CREATE INDEX IF NOT EXISTS idx_profiles_starred
  ON public.profiles (is_starred) WHERE is_starred = true;

-- admin_user_stats 뷰 갱신 — is_starred 포함
CREATE OR REPLACE VIEW public.admin_user_stats AS
SELECT
  p.id,
  p.email,
  p.is_premium,
  p.subscription_type,
  p.subscription_started_at,
  p.is_starred,
  p.created_at AS joined_at,
  COALESCE(s.session_count, 0)   AS session_count,
  COALESCE(s.total_seconds, 0)   AS total_seconds,
  COALESCE(f.focus_count, 0)     AS focus_count,
  COALESCE(f.focus_seconds, 0)   AS focus_seconds,
  s.last_session_at
FROM public.profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) AS session_count, SUM(duration_seconds) AS total_seconds, MAX(created_at) AS last_session_at
  FROM public.sessions
  GROUP BY user_id
) s ON s.user_id = p.id
LEFT JOIN (
  SELECT user_id, COUNT(*) AS focus_count, SUM(COALESCE(actual_duration, planned_duration)) AS focus_seconds
  FROM public.focus_sessions
  GROUP BY user_id
) f ON f.user_id = p.id;

GRANT SELECT ON public.admin_user_stats TO authenticated;
