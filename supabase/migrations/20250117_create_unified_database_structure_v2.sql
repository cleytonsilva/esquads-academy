-- Migração para criar estrutura de banco de dados unificada do Esquads
-- Data: 2025-01-17
-- Baseado na especificação técnica da reestruturação

-- 1. Verificar e atualizar tabela de usuários para incluir campos necessários
-- Adicionar campos que podem estar faltando
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS name VARCHAR(100),
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS lives_remaining INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

-- Adicionar constraint de subscription_type se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_subscription_type_check' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_subscription_type_check 
        CHECK (subscription_type IN ('free', 'premium'));
    END IF;
END $$;

-- 2. Criar tabela de certificações se não existir
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    topics JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de missões se não existir
CREATE TABLE IF NOT EXISTS missions (
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

-- 4. Criar tabela de tentativas de missão se não existir
CREATE TABLE IF NOT EXISTS mission_attempts (
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

-- 5. Criar tabela de questões de simulação se não existir
CREATE TABLE IF NOT EXISTS simulation_questions (
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

-- 6. Criar tabela de sessões de simulação se não existir
CREATE TABLE IF NOT EXISTS simulation_sessions (
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

-- 7. Criar tabela de respostas de sessão se não existir
CREATE TABLE IF NOT EXISTS session_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES simulation_sessions(id),
    question_id UUID REFERENCES simulation_questions(id),
    user_answer VARCHAR(10),
    is_correct BOOLEAN,
    time_spent INTEGER, -- em segundos
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Criar tabela de progresso do usuário se não existir
CREATE TABLE IF NOT EXISTS user_progress (
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

-- 9. Criar tabela de conquistas do usuário se não existir
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Criar tabela de aprovação de conteúdo se não existir
CREATE TABLE IF NOT EXISTS content_approval (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('mission', 'simulation_question')),
    content_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_id UUID REFERENCES users(id),
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 11. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_missions_certification ON missions(certification_id);
CREATE INDEX IF NOT EXISTS idx_missions_difficulty ON missions(difficulty);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_mission_attempts_user ON mission_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_attempts_mission ON mission_attempts(mission_id);
CREATE INDEX IF NOT EXISTS idx_simulation_questions_certification ON simulation_questions(certification_id);
CREATE INDEX IF NOT EXISTS idx_simulation_questions_difficulty ON simulation_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_user ON simulation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_certification ON user_progress(certification_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_content_approval_content ON content_approval(content_type, content_id);

-- 12. Inserir dados iniciais de certificações
INSERT INTO certifications (name, code, description, topics) VALUES
('AWS Security Certification', 'AWS-SEC', 'Amazon Web Services Security Specialty', 
 '["iam", "vpc", "encryption", "monitoring", "compliance"]'),
('Azure Security Engineer', 'AZ-500', 'Microsoft Azure Security Engineer Associate', 
 '["identity", "platform_protection", "security_operations", "data_applications"]'),
('CompTIA Security+', 'SEC-PLUS', 'CompTIA Security+ Certification', 
 '["threats", "architecture", "implementation", "operations", "governance"]')
ON CONFLICT (code) DO NOTHING;

-- 13. Configurar RLS para as novas tabelas
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_approval ENABLE ROW LEVEL SECURITY;

-- 14. Criar políticas RLS básicas
-- Certificações: leitura pública para certificações ativas
DROP POLICY IF EXISTS "certifications_public_read" ON certifications;
CREATE POLICY "certifications_public_read" ON certifications
    FOR SELECT USING (active = true);

-- Missões: leitura pública para missões aprovadas
DROP POLICY IF EXISTS "missions_approved_public" ON missions;
CREATE POLICY "missions_approved_public" ON missions
    FOR SELECT USING (status = 'approved');

-- Tentativas de missão: usuários veem apenas suas próprias tentativas
DROP POLICY IF EXISTS "mission_attempts_own_data" ON mission_attempts;
CREATE POLICY "mission_attempts_own_data" ON mission_attempts
    FOR ALL USING (auth.uid() = user_id);

-- Questões de simulação: leitura pública para questões aprovadas
DROP POLICY IF EXISTS "simulation_questions_approved_public" ON simulation_questions;
CREATE POLICY "simulation_questions_approved_public" ON simulation_questions
    FOR SELECT USING (status = 'approved');

-- Sessões de simulação: usuários veem apenas suas próprias sessões
DROP POLICY IF EXISTS "simulation_sessions_own_data" ON simulation_sessions;
CREATE POLICY "simulation_sessions_own_data" ON simulation_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Respostas de sessão: usuários veem apenas suas próprias respostas
DROP POLICY IF EXISTS "session_answers_own_data" ON session_answers;
CREATE POLICY "session_answers_own_data" ON session_answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM simulation_sessions ss 
            WHERE ss.id = session_id AND ss.user_id = auth.uid()
        )
    );

-- Progresso do usuário: usuários veem apenas seu próprio progresso
DROP POLICY IF EXISTS "user_progress_own_data" ON user_progress;
CREATE POLICY "user_progress_own_data" ON user_progress
    FOR ALL USING (auth.uid() = user_id);

-- Conquistas do usuário: usuários veem apenas suas próprias conquistas
DROP POLICY IF EXISTS "user_achievements_own_data" ON user_achievements;
CREATE POLICY "user_achievements_own_data" ON user_achievements
    FOR ALL USING (auth.uid() = user_id);

-- Aprovação de conteúdo: apenas mission architects e admins
DROP POLICY IF EXISTS "content_approval_reviewers_only" ON content_approval;
CREATE POLICY "content_approval_reviewers_only" ON content_approval
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('mission_architect', 'admin')
        )
    );

-- 15. Conceder permissões básicas
GRANT SELECT ON certifications TO anon, authenticated;
GRANT SELECT ON missions TO anon, authenticated;
GRANT SELECT ON simulation_questions TO anon, authenticated;
GRANT ALL ON mission_attempts TO authenticated;
GRANT ALL ON simulation_sessions TO authenticated;
GRANT ALL ON session_answers TO authenticated;
GRANT ALL ON user_progress TO authenticated;
GRANT ALL ON user_achievements TO authenticated;
GRANT ALL ON content_approval TO authenticated;
