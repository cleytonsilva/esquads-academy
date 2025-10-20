-- Migration: Sistema de Banco de Questões de Certificação e Expansão de Missões
-- Data: 2025-01-25
-- Descrição: Cria tabelas para banco de questões, interações com IA, compartilhamentos sociais e expande tabelas existentes

-- 1. Expandir tabela missions com novos campos
ALTER TABLE missions ADD COLUMN IF NOT EXISTS mission_type TEXT CHECK (mission_type IN ('terminal', 'web_interface', 'chat_textual'));
ALTER TABLE missions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'published'));
ALTER TABLE missions ADD COLUMN IF NOT EXISTS ai_prompt TEXT;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE missions ADD COLUMN IF NOT EXISTS approval_notes TEXT;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 2. Criar tabela de questões de certificação
CREATE TABLE IF NOT EXISTS certification_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification TEXT NOT NULL CHECK (certification IN ('AWS', 'Azure', 'CompTIA', 'Oracle', 'Cisco', 'ISC2', 'EC-Council', 'ISACA')),
  topic TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer_id TEXT NOT NULL,
  explanation TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'archived')),
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela de interações com Agente Blue
CREATE TABLE IF NOT EXISTS mission_ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  mission_id UUID REFERENCES missions(id) NOT NULL,
  hint_level INTEGER CHECK (hint_level BETWEEN 1 AND 3),
  user_input TEXT,
  ai_response TEXT,
  was_helpful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criar tabela de simulados gerados
CREATE TABLE IF NOT EXISTS generated_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_count INTEGER NOT NULL,
  questions JSONB NOT NULL, -- Array de IDs das questões selecionadas
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Para simulados temporários
);

-- 5. Criar tabela de tentativas de simulados
CREATE TABLE IF NOT EXISTS simulation_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  simulation_id UUID REFERENCES generated_simulations(id) NOT NULL,
  answers JSONB NOT NULL, -- Respostas do usuário
  score DECIMAL(5,2),
  time_spent INTEGER, -- em segundos
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Expandir tabela certificates
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS certificate_type TEXT CHECK (certificate_type IN ('course', 'simulation', 'mission_track'));
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS badge_id UUID REFERENCES badge_definitions(id);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS is_shareable BOOLEAN DEFAULT TRUE;

-- 7. Criar tabela de compartilhamentos sociais
CREATE TABLE IF NOT EXISTS social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  share_type TEXT CHECK (share_type IN ('badge', 'certificate', 'achievement', 'level_up', 'simulation_score')),
  content_id UUID NOT NULL,
  platform TEXT CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'whatsapp', 'instagram')),
  metadata JSONB, -- Dados específicos do compartilhamento
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Criar tabela de configurações de simulados
CREATE TABLE IF NOT EXISTS simulation_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification TEXT NOT NULL,
  name TEXT NOT NULL, -- Ex: "AWS Solutions Architect - Básico"
  description TEXT,
  question_count INTEGER NOT NULL,
  time_limit INTEGER, -- em minutos
  passing_score DECIMAL(5,2) DEFAULT 70.0,
  difficulty_distribution JSONB, -- Ex: {"easy": 30, "medium": 50, "hard": 20}
  topics JSONB, -- Array de tópicos obrigatórios
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_certification_questions_certification ON certification_questions(certification);
CREATE INDEX IF NOT EXISTS idx_certification_questions_status ON certification_questions(status);
CREATE INDEX IF NOT EXISTS idx_certification_questions_difficulty ON certification_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_certification_questions_topic ON certification_questions(topic);

CREATE INDEX IF NOT EXISTS idx_mission_ai_interactions_user_mission ON mission_ai_interactions(user_id, mission_id);
CREATE INDEX IF NOT EXISTS idx_simulation_attempts_user ON simulation_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_attempts_simulation ON simulation_attempts(simulation_id);

CREATE INDEX IF NOT EXISTS idx_social_shares_user ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_type ON social_shares(share_type);

-- 10. Criar triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_certification_questions_updated_at BEFORE UPDATE ON certification_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_simulation_configs_updated_at BEFORE UPDATE ON simulation_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Comentários para documentação
COMMENT ON TABLE certification_questions IS 'Banco de questões para simulados de certificação';
COMMENT ON TABLE mission_ai_interactions IS 'Histórico de interações com Agente Blue durante missões';
COMMENT ON TABLE generated_simulations IS 'Simulados gerados dinamicamente pelo sistema';
COMMENT ON TABLE simulation_attempts IS 'Tentativas de simulados pelos alunos';
COMMENT ON TABLE social_shares IS 'Compartilhamentos sociais de conquistas e resultados';
COMMENT ON TABLE simulation_configs IS 'Configurações pré-definidas para diferentes tipos de simulados';
