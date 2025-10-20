-- Expansão da estrutura de dados para Missões, Exames e Simulações
-- Baseado nos protótipos e arquitetura técnica

-- =====================================================
-- 1. EXPANSÃO DA TABELA MISSIONS
-- =====================================================

-- Adicionar colunas que estão nos protótipos mas não na tabela atual
ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS tools JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS objectives JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 0;

-- Atualizar constraint de categoria para incluir categorias dos protótipos
ALTER TABLE missions DROP CONSTRAINT IF EXISTS missions_category_check;
ALTER TABLE missions ADD CONSTRAINT missions_category_check 
CHECK (category = ANY (ARRAY[
  'general'::text, 
  'programming'::text, 
  'design'::text, 
  'business'::text, 
  'marketing'::text, 
  'cybersecurity'::text,
  'Firewall'::text,
  'Cloud Security'::text,
  'Forensics'::text,
  'Network Security'::text,
  'Penetration Testing'::text,
  'Incident Response'::text
]));

-- Atualizar constraint de dificuldade
ALTER TABLE missions DROP CONSTRAINT IF EXISTS missions_difficulty_check;
ALTER TABLE missions ADD CONSTRAINT missions_difficulty_check 
CHECK (difficulty = ANY (ARRAY[
  'easy'::text, 
  'medium'::text, 
  'hard'::text, 
  'intermediate'::text, 
  'advanced'::text, 
  'expert'::text,
  'Iniciante'::text,
  'Intermediário'::text,
  'Avançado'::text
]));

-- =====================================================
-- 2. TABELA EXAM_QUESTIONS (Nova)
-- =====================================================

CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('scenario', 'code', 'multiple')),
  category VARCHAR(100),
  difficulty VARCHAR(50) CHECK (difficulty IN ('easy', 'medium', 'hard', 'Iniciante', 'Intermediário', 'Avançado')),
  points INTEGER DEFAULT 1,
  question_text TEXT NOT NULL,
  scenario_text TEXT,
  code_snippet TEXT,
  options JSONB NOT NULL DEFAULT '[]', -- Array de opções com {id, text, description?, isCorrect}
  correct_answer VARCHAR(255) NOT NULL,
  explanation TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, question_number)
);

-- =====================================================
-- 3. EXPANSÃO DA TABELA USER_EXAM_ATTEMPTS
-- =====================================================

-- Renomear exam_attempts para user_exam_attempts se necessário
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exam_attempts' AND table_schema = 'public') THEN
    -- Adicionar colunas que estão faltando
    ALTER TABLE exam_attempts 
    ADD COLUMN IF NOT EXISTS time_elapsed INTEGER, -- em segundos
    ADD COLUMN IF NOT EXISTS flagged_questions JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- =====================================================
-- 4. TABELA SIMULATIONS (Nova)
-- =====================================================

CREATE TABLE IF NOT EXISTS simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'Iniciante', 'Intermediário', 'Avançado')),
  estimated_duration INTEGER, -- em minutos
  xp_reward INTEGER DEFAULT 0,
  environment_config JSONB DEFAULT '{}', -- Configuração do ambiente
  validation_rules JSONB DEFAULT '{}', -- Regras de validação
  flags JSONB DEFAULT '[]', -- Flags para CTF
  hints JSONB DEFAULT '[]',
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  tools JSONB DEFAULT '[]',
  prerequisites JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA USER_SIMULATION_PROGRESS (Nova)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_simulation_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id UUID REFERENCES simulations(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'locked')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  flags_captured JSONB DEFAULT '[]',
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 1,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_elapsed INTEGER DEFAULT 0, -- em segundos
  hints_used INTEGER DEFAULT 0,
  commands_executed JSONB DEFAULT '[]',
  validation_results JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, simulation_id)
);

-- =====================================================
-- 6. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para exam_questions
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_type ON exam_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_exam_questions_difficulty ON exam_questions(difficulty);

-- Índices para simulations
CREATE INDEX IF NOT EXISTS idx_simulations_category ON simulations(category);
CREATE INDEX IF NOT EXISTS idx_simulations_difficulty ON simulations(difficulty);
CREATE INDEX IF NOT EXISTS idx_simulations_active ON simulations(is_active);
CREATE INDEX IF NOT EXISTS idx_simulations_premium ON simulations(is_premium);

-- Índices para user_simulation_progress
CREATE INDEX IF NOT EXISTS idx_user_simulation_progress_user_id ON user_simulation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_simulation_progress_simulation_id ON user_simulation_progress(simulation_id);
CREATE INDEX IF NOT EXISTS idx_user_simulation_progress_status ON user_simulation_progress(status);

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_simulation_progress ENABLE ROW LEVEL SECURITY;

-- Políticas para exam_questions
CREATE POLICY "exam_questions_select_policy" ON exam_questions
  FOR SELECT USING (true); -- Questões podem ser lidas por todos os usuários autenticados

CREATE POLICY "exam_questions_insert_policy" ON exam_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "exam_questions_update_policy" ON exam_questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "exam_questions_delete_policy" ON exam_questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Políticas para simulations
CREATE POLICY "simulations_select_policy" ON simulations
  FOR SELECT USING (is_active = true);

CREATE POLICY "simulations_insert_policy" ON simulations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "simulations_update_policy" ON simulations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "simulations_delete_policy" ON simulations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Políticas para user_simulation_progress
CREATE POLICY "user_simulation_progress_select_policy" ON user_simulation_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_simulation_progress_insert_policy" ON user_simulation_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_simulation_progress_update_policy" ON user_simulation_progress
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_simulation_progress_delete_policy" ON user_simulation_progress
  FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- 8. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para calcular progresso de simulação
CREATE OR REPLACE FUNCTION calculate_simulation_progress(
  p_user_id UUID,
  p_simulation_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_progress INTEGER := 0;
  v_total_flags INTEGER;
  v_captured_flags INTEGER;
BEGIN
  -- Buscar total de flags da simulação
  SELECT COALESCE(jsonb_array_length(flags), 0)
  INTO v_total_flags
  FROM simulations
  WHERE id = p_simulation_id;

  -- Buscar flags capturadas pelo usuário
  SELECT COALESCE(jsonb_array_length(flags_captured), 0)
  INTO v_captured_flags
  FROM user_simulation_progress
  WHERE user_id = p_user_id AND simulation_id = p_simulation_id;

  -- Calcular progresso
  IF v_total_flags > 0 THEN
    v_progress := (v_captured_flags * 100) / v_total_flags;
  END IF;

  RETURN v_progress;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar flag de simulação
CREATE OR REPLACE FUNCTION validate_simulation_flag(
  p_user_id UUID,
  p_simulation_id UUID,
  p_flag TEXT
) RETURNS JSONB AS $$
DECLARE
  v_flags JSONB;
  v_flag_obj JSONB;
  v_is_valid BOOLEAN := false;
  v_flag_name TEXT;
  v_points INTEGER := 0;
  v_result JSONB;
BEGIN
  -- Buscar flags da simulação
  SELECT flags INTO v_flags
  FROM simulations
  WHERE id = p_simulation_id;

  -- Verificar se a flag é válida
  FOR v_flag_obj IN SELECT * FROM jsonb_array_elements(v_flags)
  LOOP
    IF v_flag_obj->>'value' = p_flag THEN
      v_is_valid := true;
      v_flag_name := v_flag_obj->>'name';
      v_points := COALESCE((v_flag_obj->>'points')::INTEGER, 10);
      EXIT;
    END IF;
  END LOOP;

  -- Construir resultado
  v_result := jsonb_build_object(
    'isValid', v_is_valid,
    'flagName', v_flag_name,
    'points', v_points,
    'message', CASE 
      WHEN v_is_valid THEN 'Flag capturada com sucesso!'
      ELSE 'Flag inválida. Tente novamente.'
    END
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger para atualizar updated_at nas novas tabelas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas novas tabelas
CREATE TRIGGER update_exam_questions_updated_at
  BEFORE UPDATE ON exam_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simulations_updated_at
  BEFORE UPDATE ON simulations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_simulation_progress_updated_at
  BEFORE UPDATE ON user_simulation_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. DADOS INICIAIS DE EXEMPLO
-- =====================================================

-- Inserir simulações de exemplo
INSERT INTO simulations (title, description, category, difficulty, estimated_duration, xp_reward, flags, environment_config, validation_rules) VALUES
('CTF Básico - Firewall', 'Simulação básica de configuração de firewall com iptables', 'Firewall', 'Iniciante', 45, 100, 
 '[{"name": "flag1", "value": "ESQUADS{firewall_basic_rules}", "points": 50}, {"name": "flag2", "value": "ESQUADS{iptables_mastery}", "points": 50}]',
 '{"environment": "linux", "tools": ["iptables", "netstat", "ss"]}',
 '{"commands": ["iptables -L", "iptables -A INPUT"], "flags": 2}'
),
('Análise Forense Digital', 'Investigação de incidente de segurança usando ferramentas forenses', 'Forensics', 'Intermediário', 90, 200,
 '[{"name": "evidence1", "value": "ESQUADS{hidden_file_found}", "points": 75}, {"name": "evidence2", "value": "ESQUADS{malware_signature}", "points": 125}]',
 '{"environment": "kali", "tools": ["volatility", "autopsy", "strings"]}',
 '{"files": ["memory.dump", "disk.img"], "flags": 2}'
),
('Penetration Testing Web', 'Teste de penetração em aplicação web vulnerável', 'Penetration Testing', 'Avançado', 120, 300,
 '[{"name": "sqli", "value": "ESQUADS{sql_injection_found}", "points": 100}, {"name": "xss", "value": "ESQUADS{xss_payload_executed}", "points": 100}, {"name": "rce", "value": "ESQUADS{remote_code_execution}", "points": 100}]',
 '{"environment": "web", "tools": ["burpsuite", "sqlmap", "nmap"]}',
 '{"target": "vulnerable-app.local", "flags": 3}'
);

-- Inserir questões de exemplo para exames existentes
DO $$
DECLARE
  exam_record RECORD;
BEGIN
  -- Para cada exame existente, inserir questões de exemplo
  FOR exam_record IN SELECT id, title FROM exams LIMIT 3
  LOOP
    INSERT INTO exam_questions (exam_id, question_number, question_type, category, difficulty, points, question_text, options, correct_answer, explanation) VALUES
    (exam_record.id, 1, 'multiple', 'Cybersecurity', 'medium', 2, 
     'Qual é o principal objetivo de um firewall?',
     '[{"id": "a", "text": "Acelerar a conexão de rede", "isCorrect": false}, {"id": "b", "text": "Filtrar e controlar o tráfego de rede", "isCorrect": true}, {"id": "c", "text": "Armazenar dados", "isCorrect": false}, {"id": "d", "text": "Executar aplicações", "isCorrect": false}]',
     'b',
     'Um firewall é um sistema de segurança que monitora e controla o tráfego de rede baseado em regras de segurança predeterminadas.'
    ),
    (exam_record.id, 2, 'scenario', 'Network Security', 'hard', 3,
     'Você é um administrador de rede e detectou tráfego suspeito na porta 22. Que ações você tomaria?',
     '[{"id": "a", "text": "Bloquear imediatamente toda a porta 22", "isCorrect": false}, {"id": "b", "text": "Investigar os logs, identificar a origem e implementar regras específicas", "isCorrect": true}, {"id": "c", "text": "Ignorar, pois é tráfego normal", "isCorrect": false}, {"id": "d", "text": "Reiniciar o servidor", "isCorrect": false}]',
     'b',
     'A abordagem correta é investigar primeiro para entender a natureza do tráfego antes de tomar ações que possam impactar operações legítimas.'
    );
  END LOOP;
END $$;

-- =====================================================
-- 11. PERMISSÕES PARA ROLES
-- =====================================================

-- Conceder permissões para roles anon e authenticated
GRANT SELECT ON exam_questions TO anon, authenticated;
GRANT SELECT ON simulations TO anon, authenticated;
GRANT ALL PRIVILEGES ON user_simulation_progress TO authenticated;

-- Permissões específicas para funções
GRANT EXECUTE ON FUNCTION calculate_simulation_progress(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_simulation_flag(UUID, UUID, TEXT) TO authenticated;

-- =====================================================
-- 12. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE exam_questions IS 'Questões individuais dos exames com suporte a diferentes tipos (cenário, código, múltipla escolha)';
COMMENT ON TABLE simulations IS 'Simulações CTF e labs práticos para treinamento hands-on';
COMMENT ON TABLE user_simulation_progress IS 'Progresso dos usuários nas simulações, incluindo flags capturadas e comandos executados';

COMMENT ON FUNCTION calculate_simulation_progress(UUID, UUID) IS 'Calcula o progresso percentual de um usuário em uma simulação baseado nas flags capturadas';
COMMENT ON FUNCTION validate_simulation_flag(UUID, UUID, TEXT) IS 'Valida se uma flag submetida pelo usuário é correta para a simulação';
