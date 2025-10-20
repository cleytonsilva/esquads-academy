-- Migração corrigida para Missions e Achievements
-- Data: 2025-01-15
-- Versão: 2.0

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
    total_study_time INTEGER DEFAULT 0, -- em minutos
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
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general' CHECK (category IN ('general', 'programming', 'design', 'business', 'marketing')),
ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 30, -- em minutos
ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. ADICIONAR COLUNAS AUSENTES NA TABELA ACHIEVEMENTS
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general' CHECK (category IN ('general', 'learning', 'social', 'milestone', 'special')),
ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. CRIAR TABELA CERTIFICATES (ausente)
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    certificate_url TEXT,
    verification_code TEXT UNIQUE,
    is_verified BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CRIAR TABELA NOTIFICATIONS (ausente)
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

-- 6. CRIAR TABELA CHATBOT_CONVERSATIONS (ausente)
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

-- 7. ADICIONAR COLUNAS AUSENTES NA TABELA MISSION_PROGRESS
ALTER TABLE public.mission_progress 
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_steps INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS checkpoints JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS code_submissions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS hints_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0, -- em minutos
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 8. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(level DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON public.profiles(last_activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_missions_category ON public.missions(category);
CREATE INDEX IF NOT EXISTS idx_missions_difficulty ON public.missions(difficulty);
CREATE INDEX IF NOT EXISTS idx_missions_is_active ON public.missions(is_active);
CREATE INDEX IF NOT EXISTS idx_missions_is_featured ON public.missions(is_featured);
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON public.missions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON public.achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_is_active ON public.achievements(is_active);

CREATE INDEX IF NOT EXISTS idx_mission_progress_user_status ON public.mission_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_mission_progress_mission_user ON public.mission_progress(mission_id, user_id);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON public.user_badges(earned_at DESC);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON public.certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_at ON public.certificates(issued_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id ON public.chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_mission_id ON public.chatbot_conversations(mission_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_id ON public.chatbot_conversations(session_id);

-- 9. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- 10. REMOVER POLÍTICAS EXISTENTES PARA RECRIAR
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
DROP POLICY IF EXISTS "missions_policy" ON public.missions;
DROP POLICY IF EXISTS "mission_progress_policy" ON public.mission_progress;
DROP POLICY IF EXISTS "user_badges_policy" ON public.user_badges;
DROP POLICY IF EXISTS "achievements_policy" ON public.achievements;
DROP POLICY IF EXISTS "certificates_policy" ON public.certificates;
DROP POLICY IF EXISTS "notifications_policy" ON public.notifications;
DROP POLICY IF EXISTS "chatbot_conversations_policy" ON public.chatbot_conversations;

-- 11. CRIAR POLÍTICAS RLS SEGURAS
-- Profiles: usuários podem ver e editar apenas seus próprios dados
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Missions: todos podem ver missions ativas, apenas admins podem modificar
CREATE POLICY "missions_select_all" ON public.missions
    FOR SELECT USING (is_active = true);

CREATE POLICY "missions_admin_all" ON public.missions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Mission Progress: usuários podem ver e modificar apenas seu próprio progresso
CREATE POLICY "mission_progress_select_own" ON public.mission_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "mission_progress_insert_own" ON public.mission_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mission_progress_update_own" ON public.mission_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- User Badges: usuários podem ver apenas seus próprios badges
CREATE POLICY "user_badges_select_own" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_badges_insert_system" ON public.user_badges
    FOR INSERT WITH CHECK (true); -- Sistema pode inserir badges

-- Achievements: todos podem ver achievements ativos
CREATE POLICY "achievements_select_active" ON public.achievements
    FOR SELECT USING (is_active = true);

CREATE POLICY "achievements_admin_all" ON public.achievements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Certificates: usuários podem ver apenas seus próprios certificados
CREATE POLICY "certificates_select_own" ON public.certificates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "certificates_insert_system" ON public.certificates
    FOR INSERT WITH CHECK (true); -- Sistema pode inserir certificados

-- Notifications: usuários podem ver apenas suas próprias notificações
CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_system" ON public.notifications
    FOR INSERT WITH CHECK (true); -- Sistema pode inserir notificações

-- Chatbot Conversations: usuários podem ver apenas suas próprias conversas
CREATE POLICY "chatbot_conversations_select_own" ON public.chatbot_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "chatbot_conversations_insert_own" ON public.chatbot_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chatbot_conversations_update_own" ON public.chatbot_conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- 12. CRIAR FUNÇÕES AUXILIARES
-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular nível baseado em pontos
CREATE OR REPLACE FUNCTION public.calculate_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(SQRT(points / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar estatísticas do perfil
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contadores no perfil quando badges/achievements são adicionados
    IF TG_TABLE_NAME = 'user_badges' THEN
        UPDATE public.profiles 
        SET badges_count = (
            SELECT COUNT(*) FROM public.user_badges 
            WHERE user_id = NEW.user_id
        )
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. CRIAR TRIGGERS
-- Trigger para updated_at
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_missions ON public.missions;
CREATE TRIGGER handle_updated_at_missions
    BEFORE UPDATE ON public.missions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_achievements ON public.achievements;
CREATE TRIGGER handle_updated_at_achievements
    BEFORE UPDATE ON public.achievements
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_mission_progress ON public.mission_progress;
CREATE TRIGGER handle_updated_at_mission_progress
    BEFORE UPDATE ON public.mission_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_chatbot_conversations ON public.chatbot_conversations;
CREATE TRIGGER handle_updated_at_chatbot_conversations
    BEFORE UPDATE ON public.chatbot_conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para atualizar estatísticas
DROP TRIGGER IF EXISTS update_profile_stats_badges ON public.user_badges;
CREATE TRIGGER update_profile_stats_badges
    AFTER INSERT ON public.user_badges
    FOR EACH ROW EXECUTE FUNCTION public.update_profile_stats();

-- 14. INSERIR DADOS INICIAIS
-- Achievements iniciais
INSERT INTO public.achievements (key, name, description, points, category, rarity, requirements) VALUES
('first_login', 'Primeiro Acesso', 'Fez login pela primeira vez na plataforma', 10, 'milestone', 'common', '{"action": "login", "count": 1}'),
('first_mission', 'Primeira Missão', 'Completou sua primeira missão', 25, 'learning', 'common', '{"action": "complete_mission", "count": 1}'),
('mission_streak_3', 'Sequência de 3', 'Completou 3 missões consecutivas', 50, 'learning', 'rare', '{"action": "mission_streak", "count": 3}'),
('points_100', 'Centurião', 'Acumulou 100 pontos', 100, 'milestone', 'rare', '{"action": "earn_points", "total": 100}'),
('level_5', 'Nível 5', 'Alcançou o nível 5', 150, 'milestone', 'epic', '{"action": "reach_level", "level": 5}')
ON CONFLICT (key) DO NOTHING;

-- Missions iniciais
INSERT INTO public.missions (title, description, objective, type, difficulty, points_reward, target_value, is_active, is_featured, category, estimated_time, steps) VALUES
('Bem-vindo à Plataforma', 'Complete seu perfil e explore as funcionalidades básicas', 'Familiarizar-se com a interface da plataforma', 'course_completion', 'easy', 50, 1, true, true, 'general', 15, '[
    {"id": 1, "title": "Complete seu perfil", "description": "Adicione foto e informações pessoais", "type": "profile_update"},
    {"id": 2, "title": "Explore o dashboard", "description": "Navegue pelas seções principais", "type": "navigation"},
    {"id": 3, "title": "Veja seus achievements", "description": "Acesse a página de conquistas", "type": "navigation"}
]'),
('Primeira Lição', 'Complete sua primeira lição em qualquer curso', 'Iniciar o aprendizado na plataforma', 'lesson_completion', 'easy', 25, 1, true, false, 'learning', 30, '[
    {"id": 1, "title": "Escolha um curso", "description": "Selecione um curso de seu interesse", "type": "course_selection"},
    {"id": 2, "title": "Inicie uma lição", "description": "Comece a primeira lição do curso", "type": "lesson_start"},
    {"id": 3, "title": "Complete a lição", "description": "Finalize a lição com sucesso", "type": "lesson_completion"}
]'),
('Desafio de Programação', 'Resolva um problema de programação básico', 'Praticar habilidades de programação', 'quiz_score', 'medium', 100, 80, true, true, 'programming', 45, '[
    {"id": 1, "title": "Leia o problema", "description": "Entenda o que é solicitado", "type": "reading"},
    {"id": 2, "title": "Escreva o código", "description": "Implemente sua solução", "type": "coding"},
    {"id": 3, "title": "Teste sua solução", "description": "Verifique se funciona corretamente", "type": "testing"},
    {"id": 4, "title": "Submeta o código", "description": "Envie sua solução final", "type": "submission"}
]')
ON CONFLICT DO NOTHING;

-- 15. CONCEDER PERMISSÕES
-- Permissões para authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.missions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.mission_progress TO authenticated;
GRANT SELECT ON public.user_badges TO authenticated;
GRANT SELECT ON public.achievements TO authenticated;
GRANT SELECT ON public.certificates TO authenticated;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.chatbot_conversations TO authenticated;

-- Permissões para anon users (apenas leitura limitada)
GRANT SELECT ON public.achievements TO anon;
GRANT SELECT ON public.missions TO anon;

-- Permissões para service_role (acesso total para operações do sistema)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Comentário final
COMMENT ON SCHEMA public IS 'Schema principal com correções completas para missions e achievements - v2.0';
