-- ============================================================================
-- MIGRAÇÃO: Sistema de Missões V2
-- Descrição: Cria tabelas para o novo sistema de missões baseado na estrutura paineis/
-- Data: 2025-10-17
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA: missions
-- Descrição: Armazena as missões disponíveis na plataforma
-- ============================================================================

CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  xp_reward INTEGER NOT NULL CHECK (xp_reward >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  tools TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  badge_on_completion UUID,
  is_premium BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  objectives JSONB DEFAULT '[]'::jsonb,
  terminal_commands JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_category CHECK (
    category IN (
      'FIREWALL',
      'CLOUD_SECURITY',
      'FORENSICS',
      'NETWORK_SECURITY',
      'PENETRATION_TESTING',
      'INCIDENT_RESPONSE',
      'VULNERABILITY_ASSESSMENT'
    )
  ),
  CONSTRAINT valid_difficulty CHECK (
    difficulty_level IN ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
  )
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_missions_category ON missions(category);
CREATE INDEX IF NOT EXISTS idx_missions_difficulty ON missions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_missions_is_premium ON missions(is_premium);
CREATE INDEX IF NOT EXISTS idx_missions_is_locked ON missions(is_locked);
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON missions(created_at DESC);

-- Comentários
COMMENT ON TABLE missions IS 'Missões práticas de cibersegurança';
COMMENT ON COLUMN missions.category IS 'Categoria da missão (Firewall, Cloud Security, etc)';
COMMENT ON COLUMN missions.difficulty_level IS 'Nível de dificuldade (Basic, Intermediate, Advanced, Expert)';
COMMENT ON COLUMN missions.objectives IS 'Array JSON de objetivos com critérios de validação';
COMMENT ON COLUMN missions.terminal_commands IS 'Array JSON de comandos esperados e respostas';

-- ============================================================================
-- TABELA: user_missions
-- Descrição: Armazena o progresso dos usuários nas missões
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  score NUMERIC(5,2) DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  time_spent_minutes INTEGER DEFAULT 0 CHECK (time_spent_minutes >= 0),
  xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0 CHECK (attempts >= 0),
  best_score NUMERIC(5,2) DEFAULT 0 CHECK (best_score >= 0 AND best_score <= 100),
  objectives_completed TEXT[] DEFAULT '{}',
  commands_executed JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mission_id),
  CONSTRAINT valid_status CHECK (
    status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'LOCKED')
  ),
  CONSTRAINT valid_completion CHECK (
    (status = 'COMPLETED' AND completed_at IS NOT NULL) OR
    (status != 'COMPLETED' AND TRUE)
  )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_mission_id ON user_missions(mission_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON user_missions(status);
CREATE INDEX IF NOT EXISTS idx_user_missions_completed_at ON user_missions(completed_at DESC);

-- Comentários
COMMENT ON TABLE user_missions IS 'Progresso dos usuários nas missões';
COMMENT ON COLUMN user_missions.objectives_completed IS 'Array de IDs dos objetivos completados';
COMMENT ON COLUMN user_missions.commands_executed IS 'Histórico de comandos executados';

-- ============================================================================
-- TABELA: certification_exams
-- Descrição: Armazena os exames/simulados de certificação
-- ============================================================================

CREATE TABLE IF NOT EXISTS certification_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  question_count INTEGER NOT NULL CHECK (question_count > 0),
  difficulty_level TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  pass_percentage NUMERIC(5,2) NOT NULL CHECK (pass_percentage >= 0 AND pass_percentage <= 100),
  xp_reward INTEGER NOT NULL CHECK (xp_reward >= 0),
  is_premium BOOLEAN DEFAULT FALSE,
  topics TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  icon_url TEXT,
  success_rate NUMERIC(5,2) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_provider CHECK (
    provider IN ('AWS', 'AZURE', 'GCP', 'COMPTIA', 'CISCO', 'ISC2', 'ECCOUNCIL', 'ISACA')
  ),
  CONSTRAINT valid_difficulty CHECK (
    difficulty_level IN ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
  )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_exams_provider ON certification_exams(provider);
CREATE INDEX IF NOT EXISTS idx_exams_difficulty ON certification_exams(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exams_is_premium ON certification_exams(is_premium);
CREATE INDEX IF NOT EXISTS idx_exams_created_at ON certification_exams(created_at DESC);

-- Comentários
COMMENT ON TABLE certification_exams IS 'Exames e simulados de certificação';
COMMENT ON COLUMN certification_exams.success_rate IS 'Taxa de sucesso geral dos usuários (%)';

-- ============================================================================
-- TABELA: exam_questions
-- Descrição: Questões dos exames
-- ============================================================================

CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES certification_exams(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'MULTIPLE_CHOICE',
  text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  order_index INTEGER NOT NULL CHECK (order_index >= 0),
  image_url TEXT,
  code_snippet TEXT,
  points INTEGER DEFAULT 1 CHECK (points > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_type CHECK (
    type IN (
      'MULTIPLE_CHOICE',
      'TRUE_FALSE',
      'MULTIPLE_RESPONSE',
      'FILL_IN_THE_BLANK',
      'ORDERING',
      'MATCHING'
    )
  ),
  CONSTRAINT valid_difficulty CHECK (
    difficulty IN ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
  )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON exam_questions(exam_id, order_index);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON exam_questions(topic);

-- Comentários
COMMENT ON TABLE exam_questions IS 'Questões dos exames';
COMMENT ON COLUMN exam_questions.options IS 'Array JSON de opções de resposta';
COMMENT ON COLUMN exam_questions.correct_answer IS 'Resposta correta (string ou array para múltiplas)';

-- ============================================================================
-- TABELA: user_exam_sessions
-- Descrição: Sessões ativas de exames dos usuários
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES certification_exams(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_question_index INTEGER DEFAULT 0 CHECK (current_question_index >= 0),
  answers JSONB DEFAULT '{}'::jsonb,
  time_remaining_seconds INTEGER,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_completion CHECK (
    (is_completed = TRUE AND completed_at IS NOT NULL) OR
    (is_completed = FALSE AND TRUE)
  )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_exam_id ON user_exam_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_sessions_is_completed ON user_exam_sessions(is_completed);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON user_exam_sessions(started_at DESC);

-- Comentários
COMMENT ON TABLE user_exam_sessions IS 'Sessões de exames dos usuários';
COMMENT ON COLUMN user_exam_sessions.config IS 'Configuração do exame (modo, dificuldade, etc)';
COMMENT ON COLUMN user_exam_sessions.answers IS 'Mapa de respostas (questionId -> resposta)';

-- ============================================================================
-- TABELA: user_exam_results
-- Descrição: Resultados dos exames concluídos
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES certification_exams(id) ON DELETE CASCADE,
  session_id UUID REFERENCES user_exam_sessions(id) ON DELETE SET NULL,
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0),
  incorrect_answers INTEGER NOT NULL CHECK (incorrect_answers >= 0),
  skipped_answers INTEGER DEFAULT 0 CHECK (skipped_answers >= 0),
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  pass_percentage NUMERIC(5,2) NOT NULL CHECK (pass_percentage >= 0 AND pass_percentage <= 100),
  passed BOOLEAN NOT NULL,
  time_spent_minutes INTEGER NOT NULL CHECK (time_spent_minutes >= 0),
  xp_earned INTEGER NOT NULL CHECK (xp_earned >= 0),
  performance_by_topic JSONB DEFAULT '{}'::jsonb,
  attempts INTEGER DEFAULT 1 CHECK (attempts > 0),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_results_user_id ON user_exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_exam_id ON user_exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_results_passed ON user_exam_results(passed);
CREATE INDEX IF NOT EXISTS idx_results_completed_at ON user_exam_results(completed_at DESC);

-- Comentários
COMMENT ON TABLE user_exam_results IS 'Resultados dos exames concluídos';
COMMENT ON COLUMN user_exam_results.performance_by_topic IS 'Performance detalhada por tópico';

-- ============================================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para missions
DROP TRIGGER IF EXISTS update_missions_updated_at ON missions;
CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para user_missions
DROP TRIGGER IF EXISTS update_user_missions_updated_at ON user_missions;
CREATE TRIGGER update_user_missions_updated_at
  BEFORE UPDATE ON user_missions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para certification_exams
DROP TRIGGER IF EXISTS update_exams_updated_at ON certification_exams;
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON certification_exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para exam_questions
DROP TRIGGER IF EXISTS update_questions_updated_at ON exam_questions;
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON exam_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para user_exam_sessions
DROP TRIGGER IF EXISTS update_sessions_updated_at ON user_exam_sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON user_exam_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exam_results ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS - MISSIONS
-- ============================================================================

-- Admin: acesso total
CREATE POLICY "Admin full access to missions"
  ON missions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Students: leitura apenas
CREATE POLICY "Students can view missions"
  ON missions FOR SELECT
  USING (true);

-- ============================================================================
-- POLÍTICAS RLS - USER_MISSIONS
-- ============================================================================

-- Usuário vê apenas seu progresso
CREATE POLICY "Users can view own mission progress"
  ON user_missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own mission progress"
  ON user_missions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mission progress"
  ON user_missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin: acesso total
CREATE POLICY "Admin can view all mission progress"
  ON user_missions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ============================================================================
-- POLÍTICAS RLS - CERTIFICATION_EXAMS
-- ============================================================================

-- Admin: acesso total
CREATE POLICY "Admin full access to exams"
  ON certification_exams FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Students: leitura apenas
CREATE POLICY "Students can view exams"
  ON certification_exams FOR SELECT
  USING (true);

-- ============================================================================
-- POLÍTICAS RLS - EXAM_QUESTIONS
-- ============================================================================

-- Admin: acesso total
CREATE POLICY "Admin full access to questions"
  ON exam_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Students: leitura apenas
CREATE POLICY "Students can view questions"
  ON exam_questions FOR SELECT
  USING (true);

-- ============================================================================
-- POLÍTICAS RLS - USER_EXAM_SESSIONS
-- ============================================================================

-- Usuário gerencia apenas suas sessões
CREATE POLICY "Users can manage own exam sessions"
  ON user_exam_sessions FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- POLÍTICAS RLS - USER_EXAM_RESULTS
-- ============================================================================

-- Usuário vê apenas seus resultados
CREATE POLICY "Users can view own exam results"
  ON user_exam_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam results"
  ON user_exam_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin: leitura de todos os resultados
CREATE POLICY "Admin can view all exam results"
  ON user_exam_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para calcular taxa de sucesso de um exame
CREATE OR REPLACE FUNCTION calculate_exam_success_rate(exam_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  success_rate NUMERIC;
BEGIN
  SELECT COALESCE(
    AVG(CASE WHEN passed THEN 100 ELSE 0 END),
    0
  )
  INTO success_rate
  FROM user_exam_results
  WHERE exam_id = exam_uuid;
  
  RETURN ROUND(success_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar taxa de sucesso após inserir resultado
CREATE OR REPLACE FUNCTION update_exam_success_rate()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE certification_exams
  SET success_rate = calculate_exam_success_rate(NEW.exam_id)
  WHERE id = NEW.exam_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar taxa de sucesso automaticamente
DROP TRIGGER IF EXISTS trigger_update_exam_success_rate ON user_exam_results;
CREATE TRIGGER trigger_update_exam_success_rate
  AFTER INSERT ON user_exam_results
  FOR EACH ROW
  EXECUTE FUNCTION update_exam_success_rate();

-- ============================================================================
-- GRANTS (Permissões)
-- ============================================================================

-- Garantir que usuários autenticados possam acessar as tabelas
GRANT SELECT ON missions TO authenticated;
GRANT SELECT ON certification_exams TO authenticated;
GRANT SELECT ON exam_questions TO authenticated;
GRANT ALL ON user_missions TO authenticated;
GRANT ALL ON user_exam_sessions TO authenticated;
GRANT ALL ON user_exam_results TO authenticated;

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE 'Migração concluída: Sistema de Missões V2';
  RAISE NOTICE 'Tabelas criadas: missions, user_missions, certification_exams, exam_questions, user_exam_sessions, user_exam_results';
  RAISE NOTICE 'RLS habilitado em todas as tabelas';
  RAISE NOTICE 'Triggers e funções auxiliares criadas';
END $$;

