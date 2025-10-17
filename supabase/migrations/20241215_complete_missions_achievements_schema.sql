-- =============================================
-- ESQUADS ACADEMY - MISSIONS & ACHIEVEMENTS
-- Complete Schema Migration Script (Fixed v3)
-- =============================================

-- 1. CRIAR EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. VERIFICAR E CORRIGIR TABELA DE PERFIS
DO $$
BEGIN
    -- Verificar se a tabela profiles existe e tem as colunas necessárias
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
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
        -- Adicionar colunas que podem estar faltando
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'points') THEN
            ALTER TABLE public.profiles ADD COLUMN points INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'level') THEN
            ALTER TABLE public.profiles ADD COLUMN level INTEGER DEFAULT 1;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'experience') THEN
            ALTER TABLE public.profiles ADD COLUMN experience INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'streak_days') THEN
            ALTER TABLE public.profiles ADD COLUMN streak_days INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_activity') THEN
            ALTER TABLE public.profiles ADD COLUMN last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- 3. CORRIGIR TABELA DE MISSÕES (usando colunas existentes)
DO $$
BEGIN
    -- Adicionar colunas que estão faltando baseado nas especificações
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'experience_reward') THEN
        ALTER TABLE public.missions ADD COLUMN experience_reward INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'max_attempts') THEN
        ALTER TABLE public.missions ADD COLUMN max_attempts INTEGER DEFAULT 3;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'validation_criteria') THEN
        ALTER TABLE public.missions ADD COLUMN validation_criteria JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'hints') THEN
        ALTER TABLE public.missions ADD COLUMN hints JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'checkpoints') THEN
        ALTER TABLE public.missions ADD COLUMN checkpoints JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'created_by') THEN
        ALTER TABLE public.missions ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'time_limit') THEN
        ALTER TABLE public.missions ADD COLUMN time_limit INTEGER DEFAULT 60;
    END IF;
    
    -- Adicionar coluna points se não existir (renomear points_reward)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'points') THEN
        ALTER TABLE public.missions ADD COLUMN points INTEGER DEFAULT 0;
        -- Copiar valores de points_reward para points
        UPDATE public.missions SET points = points_reward WHERE points_reward IS NOT NULL;
    END IF;
END $$;

-- 4. CORRIGIR TABELA DE PROGRESSO DE MISSÕES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mission_progress' AND column_name = 'current_checkpoint') THEN
        ALTER TABLE public.mission_progress ADD COLUMN current_checkpoint INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mission_progress' AND column_name = 'attempts_used') THEN
        ALTER TABLE public.mission_progress ADD COLUMN attempts_used INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mission_progress' AND column_name = 'hints_used') THEN
        ALTER TABLE public.mission_progress ADD COLUMN hints_used INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mission_progress' AND column_name = 'time_spent') THEN
        ALTER TABLE public.mission_progress ADD COLUMN time_spent INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mission_progress' AND column_name = 'code_submissions') THEN
        ALTER TABLE public.mission_progress ADD COLUMN code_submissions JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mission_progress' AND column_name = 'validation_results') THEN
        ALTER TABLE public.mission_progress ADD COLUMN validation_results JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mission_progress' AND column_name = 'last_activity') THEN
        ALTER TABLE public.mission_progress ADD COLUMN last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 5. CORRIGIR TABELA DE ACHIEVEMENTS (usando estrutura existente)
DO $$
BEGIN
    -- Adicionar colunas que estão faltando
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'type') THEN
        ALTER TABLE public.achievements ADD COLUMN type TEXT DEFAULT 'milestone' CHECK (type IN ('milestone', 'progress', 'achievement', 'special'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'criteria') THEN
        ALTER TABLE public.achievements ADD COLUMN criteria JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'color_primary') THEN
        ALTER TABLE public.achievements ADD COLUMN color_primary TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'color_secondary') THEN
        ALTER TABLE public.achievements ADD COLUMN color_secondary TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'unlock_message') THEN
        ALTER TABLE public.achievements ADD COLUMN unlock_message TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'is_secret') THEN
        ALTER TABLE public.achievements ADD COLUMN is_secret BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'unlock_order') THEN
        ALTER TABLE public.achievements ADD COLUMN unlock_order INTEGER;
    END IF;
END $$;

-- 6. CORRIGIR TABELA DE USER_BADGES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_badges' AND column_name = 'progress_percentage') THEN
        ALTER TABLE public.user_badges ADD COLUMN progress_percentage INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_badges' AND column_name = 'is_unlocked') THEN
        ALTER TABLE public.user_badges ADD COLUMN is_unlocked BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_badges' AND column_name = 'unlocked_at') THEN
        ALTER TABLE public.user_badges ADD COLUMN unlocked_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_badges' AND column_name = 'notification_sent') THEN
        ALTER TABLE public.user_badges ADD COLUMN notification_sent BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 7. CORRIGIR TABELA DE CERTIFICADOS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'certificate_url') THEN
        ALTER TABLE public.certificates ADD COLUMN certificate_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'title') THEN
        ALTER TABLE public.certificates ADD COLUMN title TEXT NOT NULL DEFAULT 'Certificado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'completion_date') THEN
        ALTER TABLE public.certificates ADD COLUMN completion_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'verification_code') THEN
        ALTER TABLE public.certificates ADD COLUMN verification_code TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'metadata') THEN
        ALTER TABLE public.certificates ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 8. CORRIGIR TABELA DE NOTIFICAÇÕES (apenas colunas que não existem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'data') THEN
        ALTER TABLE public.notifications ADD COLUMN data JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_important') THEN
        ALTER TABLE public.notifications ADD COLUMN is_important BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'expires_at') THEN
        ALTER TABLE public.notifications ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 9. CRIAR TABELA DE CONVERSAS DO CHATBOT SE NÃO EXISTIR
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

-- 10. CRIAR ÍNDICES PARA PERFORMANCE
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

-- 11. HABILITAR ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- 12. CRIAR POLÍTICAS RLS SEGURAS (apenas se não existirem)

-- Políticas para profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Usuários podem ver próprio perfil') THEN
        CREATE POLICY "Usuários podem ver próprio perfil" ON public.profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Usuários podem atualizar próprio perfil') THEN
        CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Políticas para missions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'missions' AND policyname = 'Todos podem ver missões ativas') THEN
        CREATE POLICY "Todos podem ver missões ativas" ON public.missions
            FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- Políticas para mission_progress
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_progress' AND policyname = 'Usuários podem ver próprio progresso') THEN
        CREATE POLICY "Usuários podem ver próprio progresso" ON public.mission_progress
            FOR SELECT USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_progress' AND policyname = 'Usuários podem inserir próprio progresso') THEN
        CREATE POLICY "Usuários podem inserir próprio progresso" ON public.mission_progress
            FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_progress' AND policyname = 'Usuários podem atualizar próprio progresso') THEN
        CREATE POLICY "Usuários podem atualizar próprio progresso" ON public.mission_progress
            FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

-- Políticas para achievements
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'Todos podem ver achievements ativos') THEN
        CREATE POLICY "Todos podem ver achievements ativos" ON public.achievements
            FOR SELECT USING (is_active = true AND is_secret = false);
    END IF;
END $$;

-- Políticas para user_badges
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Usuários podem ver próprios badges') THEN
        CREATE POLICY "Usuários podem ver próprios badges" ON public.user_badges
            FOR SELECT USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Sistema pode inserir badges') THEN
        CREATE POLICY "Sistema pode inserir badges" ON public.user_badges
            FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Sistema pode atualizar badges') THEN
        CREATE POLICY "Sistema pode atualizar badges" ON public.user_badges
            FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

-- Políticas para certificates
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Usuários podem ver próprios certificados') THEN
        CREATE POLICY "Usuários podem ver próprios certificados" ON public.certificates
            FOR SELECT USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Sistema pode inserir certificados') THEN
        CREATE POLICY "Sistema pode inserir certificados" ON public.certificates
            FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- Políticas para notifications
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Usuários podem ver próprias notificações') THEN
        CREATE POLICY "Usuários podem ver próprias notificações" ON public.notifications
            FOR SELECT USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Sistema pode inserir notificações') THEN
        CREATE POLICY "Sistema pode inserir notificações" ON public.notifications
            FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Usuários podem atualizar próprias notificações') THEN
        CREATE POLICY "Usuários podem atualizar próprias notificações" ON public.notifications
            FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

-- Políticas para chatbot_conversations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chatbot_conversations' AND policyname = 'Usuários podem ver próprias conversas') THEN
        CREATE POLICY "Usuários podem ver próprias conversas" ON public.chatbot_conversations
            FOR SELECT USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chatbot_conversations' AND policyname = 'Usuários podem inserir próprias conversas') THEN
        CREATE POLICY "Usuários podem inserir próprias conversas" ON public.chatbot_conversations
            FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chatbot_conversations' AND policyname = 'Usuários podem atualizar próprias conversas') THEN
        CREATE POLICY "Usuários podem atualizar próprias conversas" ON public.chatbot_conversations
            FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

-- 13. CRIAR FUNÇÕES AUXILIARES

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

-- 14. INSERIR DADOS INICIAIS DE ACHIEVEMENTS (apenas se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE key = 'primeiro_passo') THEN
        INSERT INTO public.achievements (key, name, description, type, rarity, category, points, criteria, color_primary, color_secondary, unlock_message) VALUES
        ('primeiro_passo', 'Primeiro Passo', 'Complete sua primeira missão', 'milestone', 'common', 'learning', 10, '{"missions_completed": 1}', '#10B981', '#D1FAE5', 'Parabéns! Você completou sua primeira missão!');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE key = 'explorador') THEN
        INSERT INTO public.achievements (key, name, description, type, rarity, category, points, criteria, color_primary, color_secondary, unlock_message) VALUES
        ('explorador', 'Explorador', 'Complete 10 missões', 'progress', 'common', 'learning', 50, '{"missions_completed": 10}', '#10B981', '#D1FAE5', 'Você está se tornando um verdadeiro explorador!');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE key = 'veterano') THEN
        INSERT INTO public.achievements (key, name, description, type, rarity, category, points, criteria, color_primary, color_secondary, unlock_message) VALUES
        ('veterano', 'Veterano', 'Complete 50 missões', 'progress', 'rare', 'learning', 200, '{"missions_completed": 50}', '#3B82F6', '#DBEAFE', 'Impressionante! Você é um veterano das missões!');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE key = 'mestre') THEN
        INSERT INTO public.achievements (key, name, description, type, rarity, category, points, criteria, color_primary, color_secondary, unlock_message) VALUES
        ('mestre', 'Mestre', 'Complete 100 missões', 'progress', 'epic', 'learning', 500, '{"missions_completed": 100}', '#8B5CF6', '#EDE9FE', 'Você alcançou o nível de Mestre!');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE key = 'lenda') THEN
        INSERT INTO public.achievements (key, name, description, type, rarity, category, points, criteria, color_primary, color_secondary, unlock_message) VALUES
        ('lenda', 'Lenda', 'Complete 200 missões', 'progress', 'legendary', 'learning', 1000, '{"missions_completed": 200}', '#F59E0B', '#FEF3C7', 'Você se tornou uma LENDA!');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE key = 'persistente') THEN
        INSERT INTO public.achievements (key, name, description, type, rarity, category, points, criteria, color_primary, color_secondary, unlock_message) VALUES
        ('persistente', 'Persistente', 'Mantenha uma sequência de 7 dias', 'achievement', 'rare', 'learning', 100, '{"streak_days": 7}', '#3B82F6', '#DBEAFE', 'Sua persistência está dando frutos!');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE key = 'dedicado') THEN
        INSERT INTO public.achievements (key, name, description, type, rarity, category, points, criteria, color_primary, color_secondary, unlock_message) VALUES
        ('dedicado', 'Dedicado', 'Mantenha uma sequência de 30 dias', 'achievement', 'epic', 'learning', 300, '{"streak_days": 30}', '#8B5CF6', '#EDE9FE', 'Sua dedicação é inspiradora!');
    END IF;
END $$;

-- 15. CONCEDER PERMISSÕES

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

COMMIT;