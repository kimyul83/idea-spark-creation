DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
$$;

DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Admins can view roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_friend boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS access_note text,
  ADD COLUMN IF NOT EXISTS manual_access_granted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS estimated_paid_amount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;

CREATE POLICY "Admins view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins view all sessions" ON public.sessions;
CREATE POLICY "Admins view all sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins view all focus sessions" ON public.focus_sessions;
CREATE POLICY "Admins view all focus sessions"
ON public.focus_sessions
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE OR REPLACE VIEW public.admin_user_stats
WITH (security_invoker = on) AS
SELECT
  p.id,
  p.email,
  p.is_premium,
  p.subscription_type,
  p.subscription_started_at,
  p.created_at AS joined_at,
  p.is_friend,
  p.manual_access_granted,
  p.estimated_paid_amount,
  p.access_note,
  p.last_seen_at,
  COALESCE(s.session_count, 0)::integer AS session_count,
  COALESCE(s.total_seconds, 0)::integer AS total_seconds,
  COALESCE(s.last_session_at, NULL) AS last_session_at,
  COALESCE(f.focus_count, 0)::integer AS focus_count,
  COALESCE(f.focus_seconds, 0)::integer AS focus_seconds
FROM public.profiles p
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*)::integer AS session_count,
    COALESCE(SUM(duration_seconds), 0)::integer AS total_seconds,
    MAX(created_at) AS last_session_at
  FROM public.sessions
  GROUP BY user_id
) s ON s.user_id = p.id
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*)::integer AS focus_count,
    COALESCE(SUM(COALESCE(actual_duration, planned_duration, 0)), 0)::integer AS focus_seconds
  FROM public.focus_sessions
  GROUP BY user_id
) f ON f.user_id = p.id;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM public.profiles
WHERE lower(email) = 'vm5j8rn27t@privaterelay.appleid.com'
ON CONFLICT (user_id, role) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_email_lower ON public.profiles(lower(email));
CREATE INDEX IF NOT EXISTS idx_sessions_user_created ON public.sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_created ON public.focus_sessions(user_id, created_at DESC);