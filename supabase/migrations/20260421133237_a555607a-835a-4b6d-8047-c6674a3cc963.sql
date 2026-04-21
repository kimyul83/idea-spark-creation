-- ============ updated_at 트리거 함수 ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============ profiles ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  subscription_type TEXT NOT NULL DEFAULT 'free' CHECK (subscription_type IN ('free','monthly','yearly','lifetime')),
  subscription_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 회원가입 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ sounds ============
CREATE TABLE public.sounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('nature','frequency','asmr')),
  source_type TEXT NOT NULL CHECK (source_type IN ('web_audio','url')),
  audio_url TEXT,
  frequency_hz NUMERIC,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  icon_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sounds are public" ON public.sounds FOR SELECT USING (true);

-- ============ emotions ============
CREATE TABLE public.emotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('calm','boost')),
  emoji TEXT,
  icon_name TEXT,
  gradient_from TEXT NOT NULL,
  gradient_to TEXT NOT NULL,
  recommended_sound_ids UUID[] DEFAULT '{}',
  recommended_breathing TEXT CHECK (recommended_breathing IN ('4-7-8','4-4-4-4','8-2-8')),
  recommended_video_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.emotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Emotions are public" ON public.emotions FOR SELECT USING (true);

-- ============ sessions ============
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('breathing','sound','focus')),
  emotion_id UUID REFERENCES public.emotions(id) ON DELETE SET NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sessions" ON public.sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON public.sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own sessions" ON public.sessions FOR DELETE USING (auth.uid() = user_id);

-- ============ focus_sessions ============
CREATE TABLE public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('adhd','work','study','deepwork','meeting')),
  planned_duration INT NOT NULL,
  actual_duration INT,
  completed_tasks JSONB DEFAULT '[]'::jsonb,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own focus" ON public.focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own focus" ON public.focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own focus" ON public.focus_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own focus" ON public.focus_sessions FOR DELETE USING (auth.uid() = user_id);

-- ============ favorites ============
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('sound','emotion','mix')),
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own favs" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favs" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favs" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- ============ sound_mixes ============
CREATE TABLE public.sound_mixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sound_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sound_mixes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own mixes" ON public.sound_mixes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own mixes" ON public.sound_mixes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own mixes" ON public.sound_mixes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own mixes" ON public.sound_mixes FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_sound_mixes_updated_at BEFORE UPDATE ON public.sound_mixes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ 시드: sounds ============
INSERT INTO public.sounds (name, category, source_type, frequency_hz, icon_name) VALUES
  ('432Hz 힐링', 'frequency', 'web_audio', 432, 'Waves'),
  ('528Hz 사랑', 'frequency', 'web_audio', 528, 'Heart'),
  ('40Hz 감마파', 'frequency', 'web_audio', 40, 'Brain'),
  ('브라운 노이즈', 'frequency', 'web_audio', 0, 'Volume2'),
  ('핑크 노이즈', 'frequency', 'web_audio', 0, 'Volume2'),
  ('화이트 노이즈', 'frequency', 'web_audio', 0, 'Volume2');

INSERT INTO public.sounds (name, category, source_type, audio_url, icon_name) VALUES
  ('숲속', 'nature', 'url', 'https://cdn.pixabay.com/audio/2022/03/15/audio_3b1e2f6c0c.mp3', 'TreePine'),
  ('바다 파도', 'nature', 'url', 'https://cdn.pixabay.com/audio/2021/09/06/audio_3471545026.mp3', 'Waves'),
  ('동굴 울림', 'nature', 'url', 'https://cdn.pixabay.com/audio/2022/10/14/audio_a7c2c9d59c.mp3', 'Mountain'),
  ('폭포', 'nature', 'url', 'https://cdn.pixabay.com/audio/2022/03/24/audio_dc39bbc5d0.mp3', 'Droplets'),
  ('빗소리', 'nature', 'url', 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', 'CloudRain'),
  ('새소리', 'nature', 'url', 'https://cdn.pixabay.com/audio/2021/10/19/audio_8e79f0b2cd.mp3', 'Bird'),
  ('따뜻한 햇살', 'nature', 'url', 'https://cdn.pixabay.com/audio/2022/03/10/audio_270f49b83a.mp3', 'Sun'),
  ('바람 소리', 'nature', 'url', 'https://cdn.pixabay.com/audio/2022/03/15/audio_1f2f6c0c0c.mp3', 'Wind');

INSERT INTO public.sounds (name, category, source_type, audio_url, icon_name, is_premium) VALUES
  ('타이핑 ASMR', 'asmr', 'url', 'https://cdn.pixabay.com/audio/2022/10/19/audio_1f6c0c0c0c.mp3', 'Keyboard', true),
  ('페이지 넘기기', 'asmr', 'url', 'https://cdn.pixabay.com/audio/2022/10/19/audio_2f6c0c0c0c.mp3', 'BookOpen', true),
  ('카페 분위기', 'asmr', 'url', 'https://cdn.pixabay.com/audio/2022/10/19/audio_3f6c0c0c0c.mp3', 'Coffee', false);

-- ============ 시드: emotions ============
INSERT INTO public.emotions (name, category, emoji, icon_name, gradient_from, gradient_to, recommended_breathing, sort_order) VALUES
  ('불안', 'calm', '😰', 'Waves', '#C7B8E8', '#7BA3D9', '4-7-8', 1),
  ('분노', 'calm', '😡', 'Flame', '#3D5A80', '#6C7A89', '8-2-8', 2),
  ('불면', 'calm', '😴', 'Moon', '#1E2A3A', '#6A4C93', '4-7-8', 3),
  ('공황', 'calm', '😱', 'Wind', '#81D8D0', '#9EDDC8', '4-7-8', 4),
  ('우울', 'calm', '😔', 'CloudRain', '#A8C09A', '#FFF8ED', '4-4-4-4', 5),
  ('집중', 'calm', '🎯', 'Target', '#36454F', '#D4A574', '4-4-4-4', 6),
  ('신남', 'boost', '🤩', 'Sparkles', '#FF8C42', '#FFB3C6', '4-4-4-4', 7),
  ('자신감', 'boost', '👑', 'Crown', '#D4A574', '#F4C95D', '4-4-4-4', 8),
  ('설렘', 'boost', '💗', 'Heart', '#FFB3C6', '#C7B8E8', '4-4-4-4', 9),
  ('사랑받음', 'boost', '🥰', 'HeartHandshake', '#E8A0BF', '#FFCBA4', '4-7-8', 10),
  ('자연인', 'boost', '🌿', 'Leaf', '#A8C09A', '#8B6F47', '4-4-4-4', 11),
  ('에너지 충전', 'boost', '⚡', 'Zap', '#FF7F50', '#F4D03F', '4-4-4-4', 12);