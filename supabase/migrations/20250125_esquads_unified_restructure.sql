-- Migração para Reestruturação Unificada da Plataforma Esquads
-- Data: 2025-01-25
-- Descrição: Implementa a nova estrutura de dados conforme PRD e Arquitetura Técnica

-- ============================================================================
-- 1. TABELA DE CERTIFICAÇÕES
-- ============================================================================

-- Criar tabela de certificações se não existir
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    topics JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS para certificações
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "certifications_public_read" ON certifications;

-- Criar nova política
CREATE POLICY "certifications_public_read" ON certifications
    FOR SELECT USING (active = true);

-- Inserir dados iniciais de certificações
INSERT INTO certifications (name, code, description, topics) VALUES
('AWS Security Certification', 'AWS-SEC', 'Amazon Web Services Security Specialty', 
 '["iam", "vpc", "encryption", "monitoring", "compliance"]'),
('Azure Security Engineer', 'AZ-500', 'Microsoft Azure Security Engineer Associate', 
 '["identity", "platform_protection", "security_operations", "data_applications"]'),
('CompTIA Security+', 'SEC-PLUS', 'CompTIA Security+ Certification', 
 '["threats", "architecture", "implementation", "operations", "governance"]')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    topics = EXCLUDED.topics,
    active = EXCLUDED.active;

-- ============================================================================
-- 2. ATUALIZAR TABELA DE USUÁRIOS
-- ============================================================================

-- Adicionar colunas necessárias à tabela users se não existirem
DO $$
BEGIN
    -- Adicionar coluna subscription_type se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'subscription_type') THEN
        ALTER TABLE users ADD COLUMN subscription_type VARCHAR(20) DEFAULT 'free' 
        CHECK (subscription_type IN ('free', 'premium'));
    END IF;
    
    -- Adicionar coluna lives_remaining se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'lives_remaining') THEN
        ALTER TABLE users ADD COLUMN lives_remaining INTEGER DEFAULT 5;
    END IF;
    
    -- Adicionar coluna total_xp se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'total_xp') THEN
        ALTER TABLE users ADD COLUMN total_xp INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================================================
-- 3. REESTRUTURAR TABELA DE MISSÕES
-- ============================================================================

-- Backup da tabela missions existente se houver dados importantes
-- CREATE TABLE missions_backup AS SELECT * FROM missions;

-- Recriar tabela missions com nova estrutura
DROP TABLE IF EXISTS missions CASCADE;

CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certification_id UUID REFERENCES certifications(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    steps JSONB DEFAULT '[]',
    xp_reward INTEGER DEFAULT 100,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_missions_certification ON missions(certification_id);
CREATE INDEX idx_missions_difficulty ON missions(difficulty);
CREATE INDEX idx_missions_status ON missions(status);

-- Políticas RLS
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "missions_approved_public" ON missions
    FOR SELECT USING (status = 'approved');

CREATE POLICY "missions_admin_full_access" ON missions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'mission_architect')
        )
    );

-- ============================================================================
-- 4. TABELA DE TENTATIVAS DE MISSÃO
-- ============================================================================

-- Recriar tabela mission_attempts
DROP TABLE IF EXISTS mission_attempts CASCADE;

CREATE TABLE mission_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    mission_id UUID REFERENCES missions(id),
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
    score INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- em segundos
    progress_data JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_mission_attempts_user ON mission_attempts(user_id);
CREATE INDEX idx_mission_attempts_mission ON mission_attempts(mission_id);
CREATE INDEX idx_mission_attempts_status ON mission_attempts(status);

-- Políticas RLS
ALTER TABLE mission_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mission_attempts_own_data" ON mission_attempts
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 5. TABELA DE QUESTÕES DE SIMULAÇÃO
-- ============================================================================

-- Criar tabela de questões de simulação
DROP TABLE IF EXISTS simulation_questions CASCADE;

CREATE TABLE simulation_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certification_id UUID REFERENCES certifications(id),
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- array de opções
    correct_answer VARCHAR(10) NOT NULL,
    explanation TEXT NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    topics JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_simulation_questions_certification ON simulation_questions(certification_id);
CREATE INDEX idx_simulation_questions_difficulty ON simulation_questions(difficulty);
CREATE INDEX idx_simulation_questions_status ON simulation_questions(status);

-- Políticas RLS
ALTER TABLE simulation_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "simulation_questions_approved_public" ON simulation_questions
    FOR SELECT USING (status = 'approved');

CREATE POLICY "simulation_questions_admin_full_access" ON simulation_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'mission_architect')
        )
    );

-- ============================================================================
-- 6. TABELA DE SESSÕES DE SIMULAÇÃO
-- ============================================================================

-- Criar tabela de sessões de simulação
DROP TABLE IF EXISTS simulation_sessions CASCADE;

CREATE TABLE simulation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    certification_id UUID REFERENCES certifications(id),
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    question_count INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    time_limit INTEGER, -- em minutos
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_simulation_sessions_user ON simulation_sessions(user_id);
CREATE INDEX idx_simulation_sessions_certification ON simulation_sessions(certification_id);
CREATE INDEX idx_simulation_sessions_status ON simulation_sessions(status);

-- Políticas RLS
ALTER TABLE simulation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "simulation_sessions_own_data" ON simulation_sessions
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 7. TABELA DE RESPOSTAS DE SESSÃO
-- ============================================================================

-- Criar tabela de respostas de sessão
DROP TABLE IF EXISTS session_answers CASCADE;

CREATE TABLE session_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES simulation_sessions(id),
    question_id UUID REFERENCES simulation_questions(id),
    user_answer VARCHAR(10),
    is_correct BOOLEAN,
    time_spent INTEGER DEFAULT 0, -- em segundos
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_session_answers_session ON session_answers(session_id);
CREATE INDEX idx_session_answers_question ON session_answers(question_id);

-- Políticas RLS
ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_answers_own_data" ON session_answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM simulation_sessions 
            WHERE simulation_sessions.id = session_answers.session_id 
            AND simulation_sessions.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 8. TABELA DE PROGRESSO DO USUÁRIO
-- ============================================================================

-- Recriar tabela user_progress
DROP TABLE IF EXISTS user_progress CASCADE;

CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    certification_id UUID REFERENCES certifications(id),
    topic_scores JSONB DEFAULT '{}',
    total_missions_completed INTEGER DEFAULT 0,
    total_simulations_taken INTEGER DEFAULT 0,
    mastery_level FLOAT DEFAULT 0.0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, certification_id)
);

-- Índices
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_certification ON user_progress(certification_id);
CREATE INDEX idx_user_progress_mastery ON user_progress(mastery_level DESC);

-- Políticas RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_progress_own_data" ON user_progress
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 9. TABELA DE CONQUISTAS DO USUÁRIO
-- ============================================================================

-- Recriar tabela user_achievements
DROP TABLE IF EXISTS user_achievements CASCADE;

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_type ON user_achievements(achievement_type);

-- Políticas RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_achievements_own_data" ON user_achievements
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 10. TABELA DE APROVAÇÃO DE CONTEÚDO
-- ============================================================================

-- Criar tabela de aprovação de conteúdo
DROP TABLE IF EXISTS content_approval CASCADE;

CREATE TABLE content_approval (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('mission', 'simulation_question')),
    content_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_id UUID REFERENCES users(id),
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_content_approval_type ON content_approval(content_type);
CREATE INDEX idx_content_approval_status ON content_approval(status);
CREATE INDEX idx_content_approval_reviewer ON content_approval(reviewer_id);

-- Políticas RLS
ALTER TABLE content_approval ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_approval_reviewers_access" ON content_approval
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'mission_architect')
        )
    );

-- ============================================================================
-- 11. FUNÇÕES E TRIGGERS
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_missions_updated_at ON missions;
CREATE TRIGGER update_missions_updated_at 
    BEFORE UPDATE ON missions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON user_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 12. PERMISSÕES PARA ROLES
-- ============================================================================

-- Conceder permissões básicas
GRANT SELECT ON certifications TO anon;
GRANT ALL PRIVILEGES ON certifications TO authenticated;

GRANT SELECT ON missions TO anon;
GRANT ALL PRIVILEGES ON missions TO authenticated;

GRANT ALL PRIVILEGES ON mission_attempts TO authenticated;
GRANT ALL PRIVILEGES ON simulation_questions TO authenticated;
GRANT ALL PRIVILEGES ON simulation_sessions TO authenticated;
GRANT ALL PRIVILEGES ON session_answers TO authenticated;
GRANT ALL PRIVILEGES ON user_progress TO authenticated;
GRANT ALL PRIVILEGES ON user_achievements TO authenticated;
GRANT ALL PRIVILEGES ON content_approval TO authenticated;

-- ============================================================================
-- 13. DADOS DE EXEMPLO PARA DESENVOLVIMENTO
-- ============================================================================

-- Inserir algumas missões de exemplo para cada certificação
INSERT INTO missions (certification_id, title, description, difficulty, steps, xp_reward, status) 
SELECT 
    c.id,
    'Introdução ao ' || c.name,
    'Missão introdutória para ' || c.description,
    'beginner',
    '[{"step": 1, "title": "Conceitos Básicos", "description": "Aprenda os conceitos fundamentais"}]',
    100,
    'approved'
FROM certifications c
ON CONFLICT DO NOTHING;

-- Inserir algumas questões de exemplo
INSERT INTO simulation_questions (certification_id, question, options, correct_answer, explanation, difficulty, topics, status)
SELECT 
    c.id,
    'Qual é o principal benefício de usar ' || c.name || '?',
    '["Segurança", "Performance", "Custo", "Todas as anteriores"]',
    'D',
    'Todas as opções são benefícios importantes.',
    'beginner',
    c.topics,
    'approved'
FROM certifications c
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

-- Comentário de finalização
COMMENT ON TABLE certifications IS 'Tabela de certificações disponíveis na plataforma';
COMMENT ON TABLE missions IS 'Tabela de missões gamificadas por certificação';
COMMENT ON TABLE mission_attempts IS 'Tabela de tentativas de missões pelos usuários';
COMMENT ON TABLE simulation_questions IS 'Tabela de questões para simulações de certificação';
COMMENT ON TABLE simulation_sessions IS 'Tabela de sessões de simulação de exames';
COMMENT ON TABLE session_answers IS 'Tabela de respostas dos usuários nas simulações';
COMMENT ON TABLE user_progress IS 'Tabela de progresso dos usuários por certificação';
COMMENT ON TABLE user_achievements IS 'Tabela de conquistas e badges dos usuários';
COMMENT ON TABLE content_approval IS 'Tabela de workflow de aprovação de conteúdo';
