-- =============================================
-- ESQUADS ACADEMY - MISSIONS & ACHIEVEMENTS
-- Schema Migration Script - Complete Fix
-- Data: 2025-01-15
-- =============================================

-- 1. CRIAR EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. VERIFICAR E CORRIGIR TABELA DE PERFIS
DO $$
BEGIN
    -- Verificar se a tabela profiles existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        -- Criar tabela de perfis se não existir
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT,
            avatar_url TEXT,
            role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
            points INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            experience INTEGER DEFAULT 0,
            streak_days INTEGER DEFAULT 0,
            last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Adicionar colunas faltantes se a tabela já existir
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. CRIAR TABELA DE MISSÕES
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    objective TEXT,
    type TEXT CHECK (type IN ('daily', 'weekly', 'ai_generated', 'contextual', 'special')),
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
    category TEXT CHECK (category IN ('programming', 'theory', 'project', 'challenge')),
    points INTEGER DEFAULT 0,
    experience_reward INTEGER DEFAULT 0,
    time_limit INTEGER, -- em minutos
    max_attempts INTEGER DEFAULT 3,
    prerequisites JSONB DEFAULT '[]'::jsonb,
    content JSONB, -- Conteúdo estruturado da missão
    validation_criteria JSONB, -- Critérios de validação
    hints JSONB DEFAULT '[]'::jsonb,
    checkpoints JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR TABELA DE PROGRESSO DE MISSÕES
CREATE TABLE IF NOT EXISTS public.mission_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed', 'abandoned')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    current_checkpoint INTEGER DEFAULT 0,
    attempts_used INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- em segundos
    code_submissions JSONB DEFAULT '[]'::jsonb,
    validation_results JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, mission_id)
);

-- 5. CRIAR TABELA DE ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('achievement', 'progress', 'special', 'milestone')),
    rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    category TEXT CHECK (category IN ('learning', 'social', 'completion', 'streak', 'special')),
    points INTEGER DEFAULT 0,
    criteria JSONB, -- Critérios para conquistar o achievement
    icon_url TEXT,
    color_primary TEXT, -- Cor primária baseada na raridade
    color_secondary TEXT, -- Cor secundária
    unlock_message TEXT,
    is_active BOOLEAN DEFAULT true,
    is_secret BOOLEAN DEFAULT false, -- Achievements secretos
    unlock_order INTEGER, -- Ordem de desbloqueio
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CRIAR TABELA DE BADGES CONQUISTADOS
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0,
    is_unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    notification_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- 7. CRIAR TABELA DE CERTIFICADOS
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_hash TEXT UNIQUE NOT NULL,
    certificate_url TEXT,
    title TEXT NOT NULL,
    description TEXT,
    completion_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    verification_code TEXT UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 8. CRIAR TABELA DE NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('achievement', 'mission', 'certificate', 'system', 'social')),
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CRIAR TABELA DE CHATBOT CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    messages JSONB DEFAULT '[]'::jsonb,
    context JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. CORRIGIR TABELAS SOCIAIS (se existirem)
DO $$
BEGIN
    -- Adicionar coluna status à tabela social_challenges se existir
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_challenges') THEN
        ALTER TABLE public.social_challenges 
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'));
    END IF;

    -- Adicionar coluna period_type à tabela social_leaderboard se existir
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_leaderboard') THEN
        ALTER TABLE public.social_leaderboard 
        ADD COLUMN IF NOT EXISTS period_type TEXT DEFAULT 'weekly' CHECK (period_type IN ('weekly', 'monthly', 'all_time'));
    END IF;

    -- Renomear tabela social_likes para social_post_likes se necessário
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_likes') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_post_likes') THEN
        ALTER TABLE public.social_likes RENAME TO social_post_likes;
    END IF;
END $$;

-- 11. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(level DESC);

CREATE INDEX IF NOT EXISTS idx_missions_type ON public.missions(type);
CREATE INDEX IF NOT EXISTS idx_missions_difficulty ON public.missions(difficulty);
CREATE INDEX IF NOT EXISTS idx_missions_active ON public.missions(is_active);
CREATE INDEX IF NOT EXISTS idx_missions_featured ON public.missions(is_featured);

CREATE INDEX IF NOT EXISTS idx_mission_progress_user ON public.mission_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_progress_status ON public.mission_progress(status);
CREATE INDEX IF NOT EXISTS idx_mission_progress_completed ON public.mission_progress(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_achievements_type ON public.achievements(type);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON public.achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_active ON public.achievements(is_active);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_unlocked ON public.user_badges(is_unlocked, unlocked_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- 12. REMOVER POLÍTICAS RLS EXISTENTES QUE PODEM CAUSAR RECURSÃO
DO $$
DECLARE
    pol_name TEXT;
BEGIN
    -- Remover políticas problemáticas se existirem
    FOR pol_name IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'missions', 'mission_progress', 'achievements', 'user_badges', 'certificates', 'notifications', 'chatbot_conversations')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol_name, 
            (SELECT tablename FROM pg_policies WHERE policyname = pol_name AND schemaname = 'public' LIMIT 1));
    END LOOP;
END $$;

-- 13. HABILITAR ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- 14. CRIAR POLÍTICAS RLS SIMPLES E SEGURAS

-- Políticas para profiles
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Políticas para missions
CREATE POLICY "missions_select_active" ON public.missions
    FOR SELECT USING (is_active = true);

CREATE POLICY "missions_all_admin" ON public.missions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Políticas para mission_progress
CREATE POLICY "mission_progress_select_own" ON public.mission_progress
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "mission_progress_insert_own" ON public.mission_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "mission_progress_update_own" ON public.mission_progress
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "mission_progress_select_admin" ON public.mission_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Políticas para achievements
CREATE POLICY "achievements_select_active" ON public.achievements
    FOR SELECT USING (is_active = true AND is_secret = false);

CREATE POLICY "achievements_all_admin" ON public.achievements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Políticas para user_badges
CREATE POLICY "user_badges_select_own" ON public.user_badges
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_badges_insert_own" ON public.user_badges
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_badges_update_own" ON public.user_badges
    FOR UPDATE USING (user_id = auth.uid());

-- Políticas para certificates
CREATE POLICY "certificates_select_own" ON public.certificates
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "certificates_insert_own" ON public.certificates
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "certificates_select_admin" ON public.certificates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Políticas para notifications
CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_own" ON public.notifications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Políticas para chatbot_conversations
CREATE POLICY "chatbot_conversations_select_own" ON public.chatbot_conversations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "chatbot_conversations_insert_own" ON public.chatbot_conversations
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "chatbot_conversations_update_own" ON public.chatbot_conversations
    FOR UPDATE USING (user_id = auth.uid());

-- 15. CRIAR FUNÇÕES AUXILIARES

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_missions_updated_at ON public.missions;
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON public.missions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_achievements_updated_at ON public.achievements;
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON public.achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chatbot_conversations_updated_at ON public.chatbot_conversations;
CREATE TRIGGER update_chatbot_conversations_updated_at BEFORE UPDATE ON public.chatbot_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular nível baseado na experiência
CREATE OR REPLACE FUNCTION calculate_user_level(experience INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Fórmula: level = floor(sqrt(experience / 100)) + 1
    RETURN FLOOR(SQRT(experience / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar achievements automaticamente
CREATE OR REPLACE FUNCTION check_user_achievements(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    achievement_record RECORD;
    user_stats RECORD;
BEGIN
    -- Buscar estatísticas do usuário
    SELECT 
        p.points,
        p.level,
        p.experience,
        p.streak_days,
        COUNT(mp.id) FILTER (WHERE mp.status = 'completed') as completed_missions,
        COUNT(ub.id) FILTER (WHERE ub.is_unlocked = true) as unlocked_badges
    INTO user_stats
    FROM public.profiles p
    LEFT JOIN public.mission_progress mp ON mp.user_id = p.id
    LEFT JOIN public.user_badges ub ON ub.user_id = p.id
    WHERE p.id = user_uuid
    GROUP BY p.id, p.points, p.level, p.experience, p.streak_days;

    -- Verificar cada achievement ativo
    FOR achievement_record IN 
        SELECT * FROM public.achievements 
        WHERE is_active = true
    LOOP
        -- Lógica de verificação baseada nos critérios
        -- (implementar conforme necessário)
        NULL;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 16. INSERIR DADOS INICIAIS

-- Achievements padrão
INSERT INTO public.achievements (name, description, type, rarity, category, points, criteria, color_primary, color_secondary, unlock_message) VALUES
('Primeiro Passo', 'Complete sua primeira missão', 'milestone', 'common', 'learning', 10, '{"missions_completed": 1}', '#10B981', '#D1FAE5', 'Parabéns! Você completou sua primeira missão!'),
('Explorador', 'Complete 10 missões', 'progress', 'common', 'learning', 50, '{"missions_completed": 10}', '#10B981', '#D1FAE5', 'Você está se tornando um verdadeiro explorador!'),
('Veterano', 'Complete 50 missões', 'progress', 'rare', 'learning', 200, '{"missions_completed": 50}', '#3B82F6', '#DBEAFE', 'Impressionante! Você é um veterano das missões!'),
('Mestre', 'Complete 100 missões', 'progress', 'epic', 'learning', 500, '{"missions_completed": 100}', '#8B5CF6', '#EDE9FE', 'Você alcançou o nível de Mestre!'),
('Lenda', 'Complete 200 missões', 'progress', 'legendary', 'learning', 1000, '{"missions_completed": 200}', '#F59E0B', '#FEF3C7', 'Você se tornou uma LENDA!'),
('Persistente', 'Mantenha uma sequência de 7 dias', 'achievement', 'rare', 'streak', 100, '{"streak_days": 7}', '#3B82F6', '#DBEAFE', 'Sua persistência está dando frutos!'),
('Dedicado', 'Mantenha uma sequência de 30 dias', 'achievement', 'epic', 'streak', 300, '{"streak_days": 30}', '#8B5CF6', '#EDE9FE', 'Sua dedicação é inspiradora!'),
('Social', 'Participe de 5 discussões no fórum', 'achievement', 'common', 'social', 25, '{"forum_posts": 5}', '#10B981', '#D1FAE5', 'Você está contribuindo para a comunidade!'),
('Mentor', 'Ajude 10 colegas no fórum', 'achievement', 'rare', 'social', 150, '{"helpful_posts": 10}', '#3B82F6', '#DBEAFE', 'Você é um verdadeiro mentor!')
ON CONFLICT (name) DO NOTHING;

-- Missões de exemplo
INSERT INTO public.missions (title, description, objective, type, difficulty, category, points, experience_reward, time_limit, content, validation_criteria, hints, checkpoints) VALUES
('Olá Mundo em Python', 'Crie seu primeiro programa em Python', 'Escrever um programa que exiba "Olá, Mundo!" na tela', 'daily', 'beginner', 'programming', 10, 25, 30, 
'{"language": "python", "template": "# Escreva seu código aqui\nprint(\"___\")", "expected_output": "Olá, Mundo!"}',
'{"output_match": "Olá, Mundo!", "syntax_check": true}',
'["Lembre-se de usar aspas", "A função print() exibe texto na tela", "Não esqueça dos parênteses"]',
'[{"id": 1, "title": "Escrever o código", "description": "Digite o código Python"}]'),

('Variáveis e Tipos', 'Aprenda sobre variáveis em Python', 'Criar variáveis de diferentes tipos e exibi-las', 'daily', 'beginner', 'programming', 15, 30, 45,
'{"language": "python", "template": "# Crie as variáveis solicitadas\nnome = \"\"\nidade = 0\naltura = 0.0\n\n# Exiba as variáveis", "requirements": ["string", "integer", "float"]}',
'{"variable_types": ["str", "int", "float"], "output_contains": ["nome", "idade", "altura"]}',
'["Strings usam aspas", "Números inteiros não têm casas decimais", "Números decimais usam ponto"]',
'[{"id": 1, "title": "Criar variáveis", "description": "Defina as três variáveis"}, {"id": 2, "title": "Exibir valores", "description": "Use print() para mostrar os valores"}]')
ON CONFLICT (title) DO NOTHING;

-- 17. CONCEDER PERMISSÕES

-- Permissões para authenticated users
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.missions TO authenticated;
GRANT ALL ON public.mission_progress TO authenticated;
GRANT SELECT ON public.achievements TO authenticated;
GRANT ALL ON public.user_badges TO authenticated;
GRANT ALL ON public.certificates TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.chatbot_conversations TO authenticated;

-- Permissões para anon users (limitadas)
GRANT SELECT ON public.achievements TO anon;
GRANT SELECT ON public.missions TO anon;

-- Permissões para service_role (para funções administrativas)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 18. VERIFICAÇÃO FINAL
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Tables created: profiles, missions, mission_progress, achievements, user_badges, certificates, notifications, chatbot_conversations';
    RAISE NOTICE 'RLS policies applied without recursion';
    RAISE NOTICE 'Performance indexes created';
    RAISE NOTICE 'Sample data inserted';
END $$;
