-- Migração completa para corrigir schema de Missions e Achievements
-- Data: 2024-12-15
-- Descrição: Corrige tabelas ausentes, políticas RLS e adiciona índices

-- ============================================================================
-- 1. CRIAÇÃO/CORREÇÃO DA TABELA PROFILES
-- ============================================================================

-- Verificar se a tabela profiles existe, se não, criar
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_login TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas que podem estar faltando
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- ============================================================================
-- 2. CRIAÇÃO/CORREÇÃO DA TABELA ACHIEVEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'course', 'mission', 'social', 'special')),
    type TEXT DEFAULT 'manual' CHECK (type IN ('manual', 'automatic', 'milestone')),
    criteria JSONB DEFAULT '{}',
    points INTEGER DEFAULT 0,
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. CRIAÇÃO/CORREÇÃO DA TABELA USER_ACHIEVEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    progress INTEGER DEFAULT 0,
    target_value INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- 4. CRIAÇÃO/CORREÇÃO DA TABELA MISSIONS
-- ============================================================================

-- Verificar e adicionar colunas que podem estar faltando na tabela missions
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hints JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS generation_prompt TEXT,
ADD COLUMN IF NOT EXISTS auto_start BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS target_value INTEGER DEFAULT 1;

-- ============================================================================
-- 5. CRIAÇÃO/CORREÇÃO DA TABELA USER_MISSIONS
-- ============================================================================

-- Verificar e adicionar colunas que podem estar faltando na tabela user_missions
ALTER TABLE public.user_missions 
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS step_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS code_submissions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS validation_results JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hints_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- 6. CRIAÇÃO/CORREÇÃO DA TABELA BADGES
-- ============================================================================

-- Verificar e adicionar colunas que podem estar faltando na tabela badges
ALTER TABLE public.badges 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'achievement',
ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
ADD COLUMN IF NOT EXISTS criteria JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================================================
-- 7. CRIAÇÃO/CORREÇÃO DA TABELA USER_BADGES
-- ============================================================================

-- Verificar e adicionar colunas que podem estar faltando na tabela user_badges
ALTER TABLE public.user_badges 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_value INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';

-- ============================================================================
-- 8. CRIAÇÃO DA TABELA NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('achievement', 'mission', 'badge', 'system', 'social')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. CRIAÇÃO DA TABELA CERTIFICATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'course' CHECK (type IN ('course', 'achievement', 'special')),
    template_data JSONB DEFAULT '{}',
    verification_hash TEXT UNIQUE,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. CRIAÇÃO DE ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(level DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Índices para achievements
CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON public.achievements(type);
CREATE INDEX IF NOT EXISTS idx_achievements_active ON public.achievements(is_active);
CREATE INDEX IF NOT EXISTS idx_achievements_points ON public.achievements(points DESC);

-- Índices para user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON public.user_achievements(is_completed);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed_at ON public.user_achievements(completed_at DESC);

-- Índices para missions
CREATE INDEX IF NOT EXISTS idx_missions_category ON public.missions(category);
CREATE INDEX IF NOT EXISTS idx_missions_difficulty ON public.missions(difficulty);
CREATE INDEX IF NOT EXISTS idx_missions_active ON public.missions(is_active);
CREATE INDEX IF NOT EXISTS idx_missions_ai_generated ON public.missions(is_ai_generated);

-- Índices para user_missions
CREATE INDEX IF NOT EXISTS idx_user_missions_user ON public.user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_mission ON public.user_missions(mission_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON public.user_missions(status);
CREATE INDEX IF NOT EXISTS idx_user_missions_completed_at ON public.user_missions(completed_at DESC);

-- Índices para badges
CREATE INDEX IF NOT EXISTS idx_badges_category ON public.badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_active ON public.badges(is_active);

-- Índices para user_badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_awarded_at ON public.user_badges(awarded_at DESC);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Índices para certificates
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_hash ON public.certificates(verification_hash);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_at ON public.certificates(issued_at DESC);

-- ============================================================================
-- 11. CONFIGURAÇÃO DE RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 12. POLÍTICAS RLS CORRIGIDAS (SEM RECURSÃO)
-- ============================================================================

-- Remover políticas existentes que podem causar recursão
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Políticas para profiles (usando auth.uid() diretamente)
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para achievements (públicas para leitura)
DROP POLICY IF EXISTS "achievements_select_all" ON public.achievements;
CREATE POLICY "achievements_select_all" ON public.achievements
    FOR SELECT USING (true);

-- Políticas para user_achievements
DROP POLICY IF EXISTS "user_achievements_select_own" ON public.user_achievements;
DROP POLICY IF EXISTS "user_achievements_insert_own" ON public.user_achievements;
DROP POLICY IF EXISTS "user_achievements_update_own" ON public.user_achievements;

CREATE POLICY "user_achievements_select_own" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_achievements_insert_own" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_achievements_update_own" ON public.user_achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para missions (públicas para leitura)
DROP POLICY IF EXISTS "missions_select_all" ON public.missions;
CREATE POLICY "missions_select_all" ON public.missions
    FOR SELECT USING (true);

-- Políticas para user_missions
DROP POLICY IF EXISTS "user_missions_select_own" ON public.user_missions;
DROP POLICY IF EXISTS "user_missions_insert_own" ON public.user_missions;
DROP POLICY IF EXISTS "user_missions_update_own" ON public.user_missions;

CREATE POLICY "user_missions_select_own" ON public.user_missions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_missions_insert_own" ON public.user_missions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_missions_update_own" ON public.user_missions
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para badges (públicas para leitura)
DROP POLICY IF EXISTS "badges_select_all" ON public.badges;
CREATE POLICY "badges_select_all" ON public.badges
    FOR SELECT USING (true);

-- Políticas para user_badges
DROP POLICY IF EXISTS "user_badges_select_own" ON public.user_badges;
DROP POLICY IF EXISTS "user_badges_insert_own" ON public.user_badges;
DROP POLICY IF EXISTS "user_badges_update_own" ON public.user_badges;

CREATE POLICY "user_badges_select_own" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_badges_insert_own" ON public.user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_badges_update_own" ON public.user_badges
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para notifications
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;

CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para certificates
DROP POLICY IF EXISTS "certificates_select_own" ON public.certificates;
DROP POLICY IF EXISTS "certificates_insert_own" ON public.certificates;

CREATE POLICY "certificates_select_own" ON public.certificates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "certificates_insert_own" ON public.certificates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 13. PERMISSÕES PARA ROLES ANON E AUTHENTICATED
-- ============================================================================

-- Conceder permissões básicas para o role anon
GRANT SELECT ON public.achievements TO anon;
GRANT SELECT ON public.missions TO anon;
GRANT SELECT ON public.badges TO anon;

-- Conceder permissões completas para o role authenticated
GRANT ALL PRIVILEGES ON public.profiles TO authenticated;
GRANT ALL PRIVILEGES ON public.achievements TO authenticated;
GRANT ALL PRIVILEGES ON public.user_achievements TO authenticated;
GRANT ALL PRIVILEGES ON public.missions TO authenticated;
GRANT ALL PRIVILEGES ON public.user_missions TO authenticated;
GRANT ALL PRIVILEGES ON public.badges TO authenticated;
GRANT ALL PRIVILEGES ON public.user_badges TO authenticated;
GRANT ALL PRIVILEGES ON public.notifications TO authenticated;
GRANT ALL PRIVILEGES ON public.certificates TO authenticated;

-- ============================================================================
-- 14. TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_achievements_updated_at ON public.achievements;
CREATE TRIGGER update_achievements_updated_at
    BEFORE UPDATE ON public.achievements
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_achievements_updated_at ON public.user_achievements;
CREATE TRIGGER update_user_achievements_updated_at
    BEFORE UPDATE ON public.user_achievements
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_missions_updated_at ON public.missions;
CREATE TRIGGER update_missions_updated_at
    BEFORE UPDATE ON public.missions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_missions_updated_at ON public.user_missions;
CREATE TRIGGER update_user_missions_updated_at
    BEFORE UPDATE ON public.user_missions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_badges_updated_at ON public.badges;
CREATE TRIGGER update_badges_updated_at
    BEFORE UPDATE ON public.badges
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_badges_updated_at ON public.user_badges;
CREATE TRIGGER update_user_badges_updated_at
    BEFORE UPDATE ON public.user_badges
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 15. DADOS INICIAIS DE EXEMPLO
-- ============================================================================

-- Inserir achievements de exemplo
INSERT INTO public.achievements (title, description, icon, category, type, criteria, points, rarity) VALUES
('Primeiro Passo', 'Complete sua primeira missão', '🎯', 'mission', 'automatic', '{"mission_count": 1}', 100, 'common'),
('Explorador', 'Complete 10 missões', '🗺️', 'mission', 'automatic', '{"mission_count": 10}', 500, 'rare'),
('Mestre das Missões', 'Complete 50 missões', '👑', 'mission', 'automatic', '{"mission_count": 50}', 2000, 'epic'),
('Estudante Dedicado', 'Faça login por 7 dias consecutivos', '📚', 'general', 'automatic', '{"streak_days": 7}', 300, 'common'),
('Colecionador', 'Ganhe 10 badges diferentes', '🏆', 'social', 'automatic', '{"badge_count": 10}', 750, 'rare'),
('Lenda', 'Alcance o nível 20', '⭐', 'general', 'automatic', '{"level": 20}', 5000, 'legendary')
ON CONFLICT (title) DO NOTHING;

-- Inserir missões de exemplo
INSERT INTO public.missions (title, description, category, difficulty, points, estimated_time, steps, hints, tags) VALUES
('Introdução ao JavaScript', 'Aprenda os conceitos básicos do JavaScript', 'programming', 'beginner', 200, 45, 
 '[{"title": "Declarar variáveis", "description": "Declare uma variável usando let"}, {"title": "Criar função", "description": "Crie uma função simples"}]',
 '["Lembre-se de usar let ou const", "Funções podem retornar valores"]',
 '{"javascript", "programming", "basics"}'),
('Estruturas de Dados', 'Trabalhe com arrays e objetos', 'programming', 'intermediate', 350, 60,
 '[{"title": "Criar array", "description": "Crie um array com 5 elementos"}, {"title": "Manipular objeto", "description": "Crie e modifique um objeto"}]',
 '["Arrays usam colchetes []", "Objetos usam chaves {}"]',
 '{"javascript", "data-structures", "arrays", "objects"}'),
('Algoritmos Básicos', 'Implemente algoritmos de ordenação', 'algorithms', 'advanced', 500, 90,
 '[{"title": "Bubble Sort", "description": "Implemente o algoritmo bubble sort"}, {"title": "Quick Sort", "description": "Implemente o algoritmo quick sort"}]',
 '["Compare elementos adjacentes", "Use recursão para quick sort"]',
 '{"algorithms", "sorting", "advanced"}')
ON CONFLICT (title) DO NOTHING;

-- Inserir badges de exemplo
INSERT INTO public.badges (name, description, icon, category, criteria, points) VALUES
('Iniciante', 'Bem-vindo à plataforma!', '🌟', 'achievement', '{"first_login": true}', 50),
('Programador', 'Complete uma missão de programação', '💻', 'achievement', '{"programming_mission": 1}', 100),
('Persistente', 'Complete uma missão difícil', '💪', 'achievement', '{"difficult_mission": 1}', 200),
('Rápido', 'Complete uma missão em menos de 30 minutos', '⚡', 'achievement', '{"time_limit": 30}', 150),
('Perfeito', 'Complete uma missão sem usar dicas', '🎯', 'achievement', '{"no_hints": true}', 250)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

-- Comentário final
COMMENT ON SCHEMA public IS 'Schema público com correções completas para Missions e Achievements - Esquads Academy';

-- Log da migração
DO $$
BEGIN
    RAISE NOTICE 'Migração 20241215_fix_missions_achievements_schema.sql executada com sucesso!';
    RAISE NOTICE 'Tabelas corrigidas: profiles, achievements, user_achievements, missions, user_missions, badges, user_badges, notifications, certificates';
    RAISE NOTICE 'Políticas RLS corrigidas e índices adicionados para performance';
    RAISE NOTICE 'Permissões configuradas para roles anon e authenticated';
END $$;
