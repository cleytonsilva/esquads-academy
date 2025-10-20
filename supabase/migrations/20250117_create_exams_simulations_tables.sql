-- Criar tabelas para exames, simulações e gamificação
-- Data: 2025-01-17
-- Responsável: Sistema Esquads
-- Descrição: Implementa o modelo de dados completo conforme arquitetura técnica

-- ========================================
-- TABELAS DE EXAMES
-- ========================================

-- Tabela principal de exames
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    certification VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    duration INTEGER NOT NULL, -- em minutos
    total_questions INTEGER NOT NULL,
    passing_score INTEGER NOT NULL, -- porcentagem mínima
    max_attempts INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    tags TEXT[],
    category VARCHAR(100),
    instructions TEXT,
    proctoring_settings JSONB DEFAULT '{}',
    time_settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de questões de exames
CREATE TABLE IF NOT EXISTS public.exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('scenario', 'code', 'multiple', 'true_false', 'fill_blank', 'drag_drop')),
    category VARCHAR(100),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    points INTEGER NOT NULL DEFAULT 1,
    time_limit INTEGER, -- tempo limite específico em segundos
    text TEXT NOT NULL,
    scenario TEXT,
    code TEXT,
    image_url TEXT,
    options JSONB DEFAULT '[]', -- array de opções
    explanation TEXT,
    question_references TEXT[],
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, number)
);

-- Tabela de tentativas de exames
CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    attempt_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'EXPIRED', 'CANCELLED')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER DEFAULT 0, -- em minutos
    score INTEGER DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    passed BOOLEAN DEFAULT false,
    answers JSONB DEFAULT '[]',
    analytics JSONB DEFAULT '{}',
    proctoring_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, user_id, attempt_number)
);

-- Tabela de certificados
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    exam_id UUID NOT NULL REFERENCES public.exams(id),
    attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id),
    certification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    verification_code VARCHAR(100) UNIQUE NOT NULL,
    is_valid BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELAS DE SIMULAÇÕES
-- ========================================

-- Tabela principal de simulações
CREATE TABLE IF NOT EXISTS public.simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CTF', 'LAB', 'SCENARIO', 'CHALLENGE', 'RED_TEAM', 'BLUE_TEAM', 'PURPLE_TEAM')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    category VARCHAR(100),
    tags TEXT[],
    duration INTEGER NOT NULL, -- em minutos
    max_participants INTEGER DEFAULT 1,
    is_team_based BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    environment JSONB DEFAULT '{}',
    scenario JSONB DEFAULT '{}',
    objectives JSONB DEFAULT '[]',
    flags JSONB DEFAULT '[]',
    tools JSONB DEFAULT '[]',
    hints JSONB DEFAULT '[]',
    scoring JSONB DEFAULT '{}',
    timeline JSONB DEFAULT '{}',
    prerequisites TEXT[],
    learning_outcomes TEXT[],
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de progresso do usuário em simulações
CREATE TABLE IF NOT EXISTS public.user_simulation_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    simulation_id UUID NOT NULL REFERENCES public.simulations(id),
    team_id UUID, -- referência para equipes (será criada depois)
    role VARCHAR(20) DEFAULT 'INDIVIDUAL' CHECK (role IN ('INDIVIDUAL', 'TEAM_LEADER', 'TEAM_MEMBER', 'OBSERVER')),
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'EXPIRED', 'FAILED')),
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 100,
    time_spent INTEGER DEFAULT 0, -- em minutos
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_phase INTEGER DEFAULT 0,
    objectives_completed TEXT[],
    flags_found JSONB DEFAULT '[]',
    hints_used JSONB DEFAULT '[]',
    tools_used TEXT[],
    commands_executed JSONB DEFAULT '[]',
    evidence_analyzed TEXT[],
    achievements JSONB DEFAULT '[]',
    analytics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, simulation_id)
);

-- Tabela de equipes de simulação
CREATE TABLE IF NOT EXISTS public.simulation_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    simulation_id UUID NOT NULL REFERENCES public.simulations(id),
    leader_id UUID NOT NULL REFERENCES auth.users(id),
    members JSONB DEFAULT '[]',
    score INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'EXPIRED', 'FAILED')),
    max_members INTEGER DEFAULT 4,
    is_public BOOLEAN DEFAULT true,
    invite_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELAS DE GAMIFICAÇÃO
-- ========================================

-- Tabela de definições de badges
CREATE TABLE IF NOT EXISTS public.badge_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    category VARCHAR(100),
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    points INTEGER DEFAULT 0,
    criteria JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de badges dos usuários
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    badge_id UUID NOT NULL REFERENCES public.badge_definitions(id),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source_type VARCHAR(50), -- 'mission', 'exam', 'simulation', 'achievement'
    source_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Tabela de eventos de gamificação
CREATE TABLE IF NOT EXISTS public.gamification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    xp_gained INTEGER DEFAULT 0,
    points_gained INTEGER DEFAULT 0,
    badges_earned TEXT[],
    level_before INTEGER,
    level_after INTEGER,
    source_type VARCHAR(50), -- 'mission', 'exam', 'simulation'
    source_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conquistas/achievements
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    icon_url TEXT,
    points INTEGER DEFAULT 0,
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    criteria JSONB DEFAULT '{}',
    unlock_condition TEXT,
    is_active BOOLEAN DEFAULT true,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conquistas dos usuários
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    achievement_id UUID NOT NULL REFERENCES public.achievements(id),
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress DECIMAL(5,2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para exames
CREATE INDEX IF NOT EXISTS idx_exams_certification ON public.exams(certification);
CREATE INDEX IF NOT EXISTS idx_exams_difficulty ON public.exams(difficulty);
CREATE INDEX IF NOT EXISTS idx_exams_is_active ON public.exams(is_active);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON public.exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON public.exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON public.exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON public.exam_attempts(status);

-- Índices para simulações
CREATE INDEX IF NOT EXISTS idx_simulations_type ON public.simulations(type);
CREATE INDEX IF NOT EXISTS idx_simulations_difficulty ON public.simulations(difficulty);
CREATE INDEX IF NOT EXISTS idx_simulations_is_active ON public.simulations(is_active);
CREATE INDEX IF NOT EXISTS idx_user_simulation_progress_user_id ON public.user_simulation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_simulation_progress_simulation_id ON public.user_simulation_progress(simulation_id);
CREATE INDEX IF NOT EXISTS idx_user_simulation_progress_status ON public.user_simulation_progress(status);

-- Índices para gamificação
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_events_user_id ON public.gamification_events(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_events_event_type ON public.gamification_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

-- ========================================
-- TRIGGERS PARA UPDATED_AT
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para todas as tabelas
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_questions_updated_at BEFORE UPDATE ON public.exam_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_attempts_updated_at BEFORE UPDATE ON public.exam_attempts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_simulations_updated_at BEFORE UPDATE ON public.simulations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_simulation_progress_updated_at BEFORE UPDATE ON public.user_simulation_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_simulation_teams_updated_at BEFORE UPDATE ON public.simulation_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_badge_definitions_updated_at BEFORE UPDATE ON public.badge_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON public.user_achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_simulation_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Políticas para exames (leitura pública, escrita apenas para admins)
CREATE POLICY "Exames são visíveis para todos" ON public.exams FOR SELECT USING (is_active = true);
CREATE POLICY "Apenas admins podem gerenciar exames" ON public.exams FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para questões de exames
CREATE POLICY "Questões são visíveis para todos" ON public.exam_questions FOR SELECT USING (is_active = true);
CREATE POLICY "Apenas admins podem gerenciar questões" ON public.exam_questions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para tentativas de exames (usuários veem apenas suas próprias)
CREATE POLICY "Usuários veem suas próprias tentativas" ON public.exam_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem criar suas tentativas" ON public.exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas tentativas" ON public.exam_attempts FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para certificados
CREATE POLICY "Usuários veem seus próprios certificados" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sistema pode criar certificados" ON public.certificates FOR INSERT WITH CHECK (true);

-- Políticas para simulações
CREATE POLICY "Simulações são visíveis para todos" ON public.simulations FOR SELECT USING (is_active = true);
CREATE POLICY "Apenas admins podem gerenciar simulações" ON public.simulations FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para progresso em simulações
CREATE POLICY "Usuários veem seu próprio progresso" ON public.user_simulation_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem criar seu progresso" ON public.user_simulation_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seu progresso" ON public.user_simulation_progress FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para equipes de simulação
CREATE POLICY "Equipes são visíveis para membros" ON public.simulation_teams FOR SELECT USING (
    auth.uid() = leader_id OR 
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(members))
);
CREATE POLICY "Usuários podem criar equipes" ON public.simulation_teams FOR INSERT WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Líderes podem atualizar equipes" ON public.simulation_teams FOR UPDATE USING (auth.uid() = leader_id);

-- Políticas para badges e gamificação
CREATE POLICY "Definições de badges são públicas" ON public.badge_definitions FOR SELECT USING (is_active = true);
CREATE POLICY "Usuários veem seus próprios badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sistema pode conceder badges" ON public.user_badges FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários veem seus eventos de gamificação" ON public.gamification_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sistema pode criar eventos de gamificação" ON public.gamification_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Achievements são públicas" ON public.achievements FOR SELECT USING (is_active = true);
CREATE POLICY "Usuários veem seus próprios achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sistema pode conceder achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Usuários podem atualizar progresso de achievements" ON public.user_achievements FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- PERMISSÕES PARA ROLES
-- ========================================

-- Conceder permissões para role anon (usuários não autenticados)
GRANT SELECT ON public.exams TO anon;
GRANT SELECT ON public.exam_questions TO anon;
GRANT SELECT ON public.simulations TO anon;
GRANT SELECT ON public.badge_definitions TO anon;
GRANT SELECT ON public.achievements TO anon;

-- Conceder permissões para role authenticated (usuários autenticados)
GRANT ALL PRIVILEGES ON public.exam_attempts TO authenticated;
GRANT ALL PRIVILEGES ON public.certificates TO authenticated;
GRANT ALL PRIVILEGES ON public.user_simulation_progress TO authenticated;
GRANT ALL PRIVILEGES ON public.simulation_teams TO authenticated;
GRANT ALL PRIVILEGES ON public.user_badges TO authenticated;
GRANT ALL PRIVILEGES ON public.gamification_events TO authenticated;
GRANT ALL PRIVILEGES ON public.user_achievements TO authenticated;

-- Conceder permissões de leitura para tabelas públicas
GRANT SELECT ON public.exams TO authenticated;
GRANT SELECT ON public.exam_questions TO authenticated;
GRANT SELECT ON public.simulations TO authenticated;
GRANT SELECT ON public.badge_definitions TO authenticated;
GRANT SELECT ON public.achievements TO authenticated;

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Inserir badges básicas
INSERT INTO public.badge_definitions (name, description, icon_url, category, rarity, points, criteria) VALUES
('Primeiro Exame', 'Completou seu primeiro exame', '/badges/first-exam.svg', 'exams', 'common', 10, '{"type": "exam_completed", "count": 1}'),
('Especialista em Segurança', 'Passou em 5 exames de segurança', '/badges/security-expert.svg', 'exams', 'rare', 100, '{"type": "exam_passed", "category": "security", "count": 5}'),
('Primeira Simulação', 'Completou sua primeira simulação', '/badges/first-simulation.svg', 'simulations', 'common', 15, '{"type": "simulation_completed", "count": 1}'),
('Caçador de Flags', 'Encontrou 10 flags em simulações CTF', '/badges/flag-hunter.svg', 'simulations', 'uncommon', 50, '{"type": "flags_found", "count": 10}'),
('Mestre das Missões', 'Completou 20 missões', '/badges/mission-master.svg', 'missions', 'rare', 200, '{"type": "mission_completed", "count": 20}')
ON CONFLICT (name) DO NOTHING;

-- Inserir achievements básicos
INSERT INTO public.achievements (name, description, category, icon_url, points, rarity, criteria, unlock_condition) VALUES
('Estudante Dedicado', 'Faça login por 7 dias consecutivos', 'engagement', '/achievements/dedicated-student.svg', 25, 'common', '{"type": "consecutive_logins", "days": 7}', 'login_streak >= 7'),
('Perfeccionista', 'Obtenha 100% em um exame', 'performance', '/achievements/perfectionist.svg', 100, 'uncommon', '{"type": "perfect_score", "exam": true}', 'exam_score = 100'),
('Velocista', 'Complete uma missão em menos de 5 minutos', 'speed', '/achievements/speedster.svg', 50, 'uncommon', '{"type": "mission_time", "max_minutes": 5}', 'mission_time < 300'),
('Explorador', 'Explore todas as categorias de missões', 'exploration', '/achievements/explorer.svg', 75, 'rare', '{"type": "categories_explored", "all": true}', 'categories_completed = all'),
('Lenda', 'Alcance o nível 50', 'progression', '/achievements/legend.svg', 500, 'legendary', '{"type": "level_reached", "level": 50}', 'user_level >= 50')
ON CONFLICT (name) DO NOTHING;

-- Registrar a criação das tabelas
INSERT INTO system_activities (
    activity_type,
    activity_description,
    metadata,
    created_at
) VALUES (
    'database_migration',
    'Criadas tabelas para exames, simulações e gamificação',
    jsonb_build_object(
        'migration_file', '20250117_create_exams_simulations_tables.sql',
        'tables_created', ARRAY[
            'exams', 'exam_questions', 'exam_attempts', 'certificates',
            'simulations', 'user_simulation_progress', 'simulation_teams',
            'badge_definitions', 'user_badges', 'gamification_events',
            'achievements', 'user_achievements'
        ],
        'features_implemented', ARRAY[
            'Sistema completo de exames com proctoring',
            'Simulações CTF e labs práticos',
            'Sistema de gamificação com badges e achievements',
            'Certificações automáticas',
            'Equipes para simulações colaborativas',
            'Analytics detalhados de performance'
        ],
        'rls_enabled', true,
        'permissions_configured', true,
        'initial_data_inserted', true
    ),
    NOW()
);

SELECT 'Tabelas de exames, simulações e gamificação criadas com sucesso!' as resultado;
