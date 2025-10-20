-- Atualizar tabelas existentes para alinhar com a arquitetura técnica
-- Data: 2025-01-17
-- Responsável: Sistema Esquads
-- Descrição: Atualiza estruturas existentes e adiciona novas tabelas necessárias

-- ========================================
-- ATUALIZAR TABELA EXAM_ATTEMPTS
-- ========================================

-- Adicionar colunas faltantes na tabela exam_attempts
ALTER TABLE public.exam_attempts 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'NOT_STARTED' 
CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'EXPIRED', 'CANCELLED'));

ALTER TABLE public.exam_attempts 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.exam_attempts 
ADD COLUMN IF NOT EXISTS percentage DECIMAL(5,2) DEFAULT 0;

ALTER TABLE public.exam_attempts 
ADD COLUMN IF NOT EXISTS analytics JSONB DEFAULT '{}';

ALTER TABLE public.exam_attempts 
ADD COLUMN IF NOT EXISTS proctoring_data JSONB DEFAULT '{}';

ALTER TABLE public.exam_attempts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ========================================
-- ATUALIZAR TABELA USER_SIMULATION_PROGRESS
-- ========================================

-- Atualizar constraint da coluna status para incluir novos valores
ALTER TABLE public.user_simulation_progress 
DROP CONSTRAINT IF EXISTS user_simulation_progress_status_check;

ALTER TABLE public.user_simulation_progress 
ADD CONSTRAINT user_simulation_progress_status_check 
CHECK (status IN ('active', 'completed', 'locked', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'EXPIRED', 'FAILED'));

-- Adicionar colunas faltantes
ALTER TABLE public.user_simulation_progress 
ADD COLUMN IF NOT EXISTS team_id UUID;

ALTER TABLE public.user_simulation_progress 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'INDIVIDUAL' 
CHECK (role IN ('INDIVIDUAL', 'TEAM_LEADER', 'TEAM_MEMBER', 'OBSERVER'));

ALTER TABLE public.user_simulation_progress 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

ALTER TABLE public.user_simulation_progress 
ADD COLUMN IF NOT EXISTS max_score INTEGER DEFAULT 100;

ALTER TABLE public.user_simulation_progress 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.user_simulation_progress 
ADD COLUMN IF NOT EXISTS current_phase INTEGER DEFAULT 0;

ALTER TABLE public.user_simulation_progress 
ADD COLUMN IF NOT EXISTS objectives_completed TEXT[];

ALTER TABLE public.user_simulation_progress 
ADD COLUMN IF NOT EXISTS flags_found JSONB DEFAULT '[]';

ALTER TABLE public.user_simulation_progress 
ADD COLUMN IF NOT EXISTS hints_used_detailed JSONB DEFAULT '[]';

ALTER TABLE public.user_simulation_progress 
ADD COLUMN IF NOT EXISTS tools_used TEXT[];

ALTER TABLE public.user_simulation_progress 
ADD COLUMN IF NOT EXISTS evidence_analyzed TEXT[];

ALTER TABLE public.user_simulation_progress 
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]';

ALTER TABLE public.user_simulation_progress 
ADD COLUMN IF NOT EXISTS analytics JSONB DEFAULT '{}';

-- ========================================
-- CRIAR TABELAS FALTANTES
-- ========================================

-- Tabela de equipes de simulação
CREATE TABLE IF NOT EXISTS public.simulation_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    simulation_id UUID NOT NULL REFERENCES public.simulations(id),
    leader_id UUID NOT NULL REFERENCES auth.users(id),
    members JSONB DEFAULT '[]',
    score INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED' 
    CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'EXPIRED', 'FAILED')),
    max_members INTEGER DEFAULT 4,
    is_public BOOLEAN DEFAULT true,
    invite_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de definições de badges
CREATE TABLE IF NOT EXISTS public.badge_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    category VARCHAR(100),
    rarity VARCHAR(20) DEFAULT 'common' 
    CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    points INTEGER DEFAULT 0,
    criteria JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de eventos de gamificação
CREATE TABLE IF NOT EXISTS public.gamification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}',
    xp_gained INTEGER DEFAULT 0,
    points_gained INTEGER DEFAULT 0,
    badges_earned UUID[],
    level_gained INTEGER,
    source_type VARCHAR(50), -- 'mission', 'exam', 'simulation', 'achievement'
    source_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para exam_attempts
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON public.exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON public.exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON public.exam_attempts(status);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_started_at ON public.exam_attempts(started_at);

-- Índices para user_simulation_progress
CREATE INDEX IF NOT EXISTS idx_user_simulation_progress_user_id ON public.user_simulation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_simulation_progress_simulation_id ON public.user_simulation_progress(simulation_id);
CREATE INDEX IF NOT EXISTS idx_user_simulation_progress_status ON public.user_simulation_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_simulation_progress_team_id ON public.user_simulation_progress(team_id);

-- Índices para simulation_teams
CREATE INDEX IF NOT EXISTS idx_simulation_teams_simulation_id ON public.simulation_teams(simulation_id);
CREATE INDEX IF NOT EXISTS idx_simulation_teams_leader_id ON public.simulation_teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_simulation_teams_invite_code ON public.simulation_teams(invite_code);

-- Índices para gamification_events
CREATE INDEX IF NOT EXISTS idx_gamification_events_user_id ON public.gamification_events(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_events_event_type ON public.gamification_events(event_type);
CREATE INDEX IF NOT EXISTS idx_gamification_events_source ON public.gamification_events(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_gamification_events_created_at ON public.gamification_events(created_at);

-- ========================================
-- TRIGGERS PARA UPDATED_AT
-- ========================================

-- Trigger para exam_attempts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exam_attempts_updated_at 
    BEFORE UPDATE ON public.exam_attempts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simulation_teams_updated_at 
    BEFORE UPDATE ON public.simulation_teams 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_badge_definitions_updated_at 
    BEFORE UPDATE ON public.badge_definitions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- POLÍTICAS RLS
-- ========================================

-- Políticas para simulation_teams
ALTER TABLE public.simulation_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams they are part of" ON public.simulation_teams
    FOR SELECT USING (
        leader_id = auth.uid() OR 
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(members))
    );

CREATE POLICY "Team leaders can update their teams" ON public.simulation_teams
    FOR UPDATE USING (leader_id = auth.uid());

CREATE POLICY "Users can create teams" ON public.simulation_teams
    FOR INSERT WITH CHECK (leader_id = auth.uid());

-- Políticas para badge_definitions
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view badge definitions" ON public.badge_definitions
    FOR SELECT USING (is_active = true);

-- Políticas para gamification_events
ALTER TABLE public.gamification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gamification events" ON public.gamification_events
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert gamification events" ON public.gamification_events
    FOR INSERT WITH CHECK (true);

-- ========================================
-- PERMISSÕES
-- ========================================

-- Conceder permissões para usuários autenticados
GRANT SELECT, INSERT, UPDATE ON public.simulation_teams TO authenticated;
GRANT SELECT ON public.badge_definitions TO authenticated;
GRANT SELECT, INSERT ON public.gamification_events TO authenticated;

-- Conceder permissões para usuários anônimos (apenas leitura)
GRANT SELECT ON public.badge_definitions TO anon;

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Inserir badges básicos
INSERT INTO public.badge_definitions (name, description, icon_url, category, rarity, points, criteria) VALUES
('First Mission', 'Complete your first mission', '/badges/first-mission.svg', 'missions', 'common', 10, '{"type": "mission_completion", "count": 1}'),
('Mission Master', 'Complete 10 missions', '/badges/mission-master.svg', 'missions', 'uncommon', 50, '{"type": "mission_completion", "count": 10}'),
('Exam Ace', 'Pass your first exam', '/badges/exam-ace.svg', 'exams', 'common', 25, '{"type": "exam_pass", "count": 1}'),
('Simulation Expert', 'Complete a simulation with 90%+ score', '/badges/simulation-expert.svg', 'simulations', 'rare', 100, '{"type": "simulation_completion", "min_score": 90}'),
('Team Player', 'Complete a team simulation', '/badges/team-player.svg', 'teamwork', 'uncommon', 75, '{"type": "team_simulation", "count": 1}')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- REGISTRO DE ATIVIDADE
-- ========================================

INSERT INTO public.system_activities (
    activity_type,
    activity_description,
    metadata
) VALUES (
    'database_migration',
    'Atualização das tabelas existentes para alinhar com arquitetura técnica',
    '{"migration": "20250117_update_existing_tables", "tables_updated": ["exam_attempts", "user_simulation_progress"], "tables_created": ["simulation_teams", "badge_definitions", "gamification_events"]}'
);
