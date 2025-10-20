-- Migração específica para correções de Missions e Achievements
-- Data: 2025-01-15
-- Versão: 3.0 - Apenas correções necessárias

-- 1. CRIAR TABELA PROFILES (ausente)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    total_study_time INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    achievements_count INTEGER DEFAULT 0,
    badges_count INTEGER DEFAULT 0,
    bio TEXT,
    location TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADICIONAR COLUNAS AUSENTES NA TABELA MISSIONS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'is_featured') THEN
        ALTER TABLE public.missions ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'category') THEN
        ALTER TABLE public.missions ADD COLUMN category TEXT DEFAULT 'general' CHECK (category IN ('general', 'programming', 'design', 'business', 'marketing'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'estimated_time') THEN
        ALTER TABLE public.missions ADD COLUMN estimated_time INTEGER DEFAULT 30;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'prerequisites') THEN
        ALTER TABLE public.missions ADD COLUMN prerequisites JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'tags') THEN
        ALTER TABLE public.missions ADD COLUMN tags JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'updated_at') THEN
        ALTER TABLE public.missions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 3. ADICIONAR COLUNAS AUSENTES NA TABELA ACHIEVEMENTS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'category') THEN
        ALTER TABLE public.achievements ADD COLUMN category TEXT DEFAULT 'general' CHECK (category IN ('general', 'learning', 'social', 'milestone', 'special'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'rarity') THEN
        ALTER TABLE public.achievements ADD COLUMN rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'requirements') THEN
        ALTER TABLE public.achievements ADD COLUMN requirements JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'is_active') THEN
        ALTER TABLE public.achievements ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'updated_at') THEN
        ALTER TABLE public.achievements ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 4. ADICIONAR COLUNAS AUSENTES NA TABELA MISSION_PROGRESS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mission_progress' AND column_name = 'current_step') THEN
        ALTER TABLE public.mission_progress ADD COLUMN current_step INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mission_progress' AND column_name = 'total_steps') THEN
        ALTER TABLE public.mission_progress ADD COLUMN total_steps INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mission_progress' AND column_name = 'checkpoints') THEN
        ALTER TABLE public.mission_progress ADD COLUMN checkpoints JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mission_progress' AND column_name = 'code_submissions') THEN
        ALTER TABLE public.mission_progress ADD COLUMN code_submissions JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mission_progress' AND column_name = 'hints_used') THEN
        ALTER TABLE public.mission_progress ADD COLUMN hints_used INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mission_progress' AND column_name = 'time_spent') THEN
        ALTER TABLE public.mission_progress ADD COLUMN time_spent INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mission_progress' AND column_name = 'updated_at') THEN
        ALTER TABLE public.mission_progress ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 5. CRIAR TABELA NOTIFICATIONS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('achievement', 'mission_completed', 'badge_earned', 'level_up', 'streak', 'course_completed', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CRIAR TABELA CHATBOT_CONVERSATIONS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    messages JSONB DEFAULT '[]',
    context JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HABILITAR RLS NAS NOVAS TABELAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- 8. CRIAR POLÍTICAS RLS APENAS SE NÃO EXISTIREM
DO $$
BEGIN
    -- Profiles policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_own') THEN
        CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_own') THEN
        CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own') THEN
        CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    -- Notifications policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_select_own') THEN
        CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_update_own') THEN
        CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_insert_system') THEN
        CREATE POLICY "notifications_insert_system" ON public.notifications FOR INSERT WITH CHECK (true);
    END IF;
    
    -- Chatbot conversations policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chatbot_conversations' AND policyname = 'chatbot_conversations_select_own') THEN
        CREATE POLICY "chatbot_conversations_select_own" ON public.chatbot_conversations FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chatbot_conversations' AND policyname = 'chatbot_conversations_insert_own') THEN
        CREATE POLICY "chatbot_conversations_insert_own" ON public.chatbot_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chatbot_conversations' AND policyname = 'chatbot_conversations_update_own') THEN
        CREATE POLICY "chatbot_conversations_update_own" ON public.chatbot_conversations FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- Achievements policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'achievements_select_active') THEN
        CREATE POLICY "achievements_select_active" ON public.achievements FOR SELECT USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'achievements_admin_all') THEN
        CREATE POLICY "achievements_admin_all" ON public.achievements FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;

-- 9. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_missions_is_featured ON public.missions(is_featured);
CREATE INDEX IF NOT EXISTS idx_missions_category ON public.missions(category);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON public.achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id ON public.chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_mission_id ON public.chatbot_conversations(mission_id);

-- 10. CONCEDER PERMISSÕES
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.chatbot_conversations TO authenticated;
GRANT SELECT ON public.achievements TO authenticated;
GRANT SELECT ON public.achievements TO anon;

-- Comentário final
COMMENT ON SCHEMA public IS 'Schema com correções específicas para missions e achievements - v3.0';
