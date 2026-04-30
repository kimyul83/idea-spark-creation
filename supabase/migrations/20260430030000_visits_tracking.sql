-- ============ 방문자 추적 (익명 + 가입자) ============
-- 익명 방문자 카운트, 일/주/총 누적 방문 수, 가입 전환률 계산용.
--
-- 설계:
--   - 디바이스마다 localStorage 에 session_id (UUID v4) 영구 저장 → 재방문해도 같은 ID
--   - (session_id, visit_date) 페어로 하루에 한 row → 같은 디바이스가 하루에 100번 들어와도 visit_count 만 ↑
--   - 로그인하면 user_id 도 같이 기록 → 가입 전환 추적

CREATE TABLE IF NOT EXISTS public.visits (
  session_id   TEXT NOT NULL,
  visit_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visit_count  INT NOT NULL DEFAULT 1,
  first_seen   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen    TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent   TEXT,
  referrer     TEXT,
  language     TEXT,
  PRIMARY KEY (session_id, visit_date)
);

-- 빠른 집계용 인덱스
CREATE INDEX IF NOT EXISTS idx_visits_date     ON public.visits (visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_user     ON public.visits (user_id) WHERE user_id IS NOT NULL;

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- 관리자만 SELECT — 익명/일반 사용자는 자기 visits 도 못 봄
CREATE POLICY "Admin views all visits"
  ON public.visits FOR SELECT
  USING (public.is_admin());

-- 익명 + 인증 사용자 모두 RPC 함수로 INSERT (직접 INSERT 정책은 안 만듦 — RPC 만 통하도록)
-- track_visit RPC: SECURITY DEFINER 로 RLS 우회해서 upsert.
CREATE OR REPLACE FUNCTION public.track_visit(
  p_session_id TEXT,
  p_user_id    UUID DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer   TEXT DEFAULT NULL,
  p_language   TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_session_id IS NULL OR length(p_session_id) < 8 OR length(p_session_id) > 64 THEN
    RETURN; -- 잘못된 입력은 조용히 무시
  END IF;

  INSERT INTO public.visits (session_id, user_id, user_agent, referrer, language)
  VALUES (p_session_id, p_user_id, p_user_agent, p_referrer, p_language)
  ON CONFLICT (session_id, visit_date) DO UPDATE SET
    last_seen   = now(),
    visit_count = visits.visit_count + 1,
    user_id     = COALESCE(EXCLUDED.user_id, visits.user_id),
    user_agent  = COALESCE(EXCLUDED.user_agent, visits.user_agent),
    referrer    = COALESCE(EXCLUDED.referrer, visits.referrer),
    language    = COALESCE(EXCLUDED.language, visits.language);
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_visit(TEXT, UUID, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 관리자 통계 뷰 — 전체/오늘/이번주/누적 방문
CREATE OR REPLACE VIEW public.admin_visit_stats AS
SELECT
  COUNT(DISTINCT session_id)                                              AS unique_visitors,
  COUNT(DISTINCT session_id) FILTER (WHERE visit_date = CURRENT_DATE)     AS today_visitors,
  COUNT(DISTINCT session_id) FILTER (WHERE visit_date >= CURRENT_DATE - INTERVAL '6 days') AS week_visitors,
  COUNT(DISTINCT session_id) FILTER (WHERE visit_date >= CURRENT_DATE - INTERVAL '29 days') AS month_visitors,
  COUNT(DISTINCT session_id) FILTER (WHERE user_id IS NOT NULL)           AS converted_visitors, -- 가입까지 한 사람
  SUM(visit_count)                                                        AS total_pageviews,
  SUM(visit_count) FILTER (WHERE visit_date = CURRENT_DATE)               AS today_pageviews
FROM public.visits;

GRANT SELECT ON public.admin_visit_stats TO authenticated;
