-- Migração para criar estrutura de missões, exames e simulações
-- Data: 2024-12-25
-- Descrição: Criação das tabelas para sistema de missões, exames e simulações

-- =====================================================
-- TABELAS DE MISSÕES
-- =====================================================

-- Criar tabela de missões
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Firewall', 'Cloud Security', 'Forensics', 'Network Security', 'Penetration Testing', 'Incident Response')),
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Iniciante', 'Intermediário', 'Avançado')),
    duration VARCHAR(50),
    xp_reward INTEGER DEFAULT 0,
    image_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    tools JSONB DEFAULT '[]',
    prerequisites JSONB DEFAULT '[]',
    objectives JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_missions_category ON missions(category);
CREATE INDEX IF NOT EXISTS idx_missions_difficulty ON missions(difficulty);
CREATE INDEX IF NOT EXISTS idx_missions_premium ON missions(is_premium);

-- Criar tabela de progresso de missões
CREATE TABLE IF NOT EXISTS user_mission_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    current_step INTEGER DEFAULT 1,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_elapsed INTEGER DEFAULT 0, -- em segundos
    lives_used INTEGER DEFAULT 0,
    commands_executed JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, mission_id)
);

-- Índices para progresso de missões
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_user_id ON user_mission_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_mission_id ON user_mission_progress(mission_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_completed ON user_mission_progress(completed_at) WHERE completed_at IS NOT NULL;

-- =====================================================
-- TABELAS DE EXAMES
-- =====================================================

-- Criar tabela de exames
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    certification VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL, -- em minutos
    total_questions INTEGER NOT NULL,
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Iniciante', 'Intermediário', 'Avançado')),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de questões
CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('scenario', 'code', 'multiple')),
    category VARCHAR(100),
    difficulty VARCHAR(50),
    points INTEGER DEFAULT 1,
    question_text TEXT NOT NULL,
    scenario_text TEXT,
    code_snippet TEXT,
    options JSONB NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    explanation TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, question_number)
);

-- Criar tabela de tentativas de exame
CREATE TABLE IF NOT EXISTS user_exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_elapsed INTEGER, -- em segundos
    answers JSONB DEFAULT '{}',
    flagged_questions JSONB DEFAULT '[]',
    score INTEGER,
    passed BOOLEAN,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para exames
CREATE INDEX IF NOT EXISTS idx_exams_certification ON exams(certification);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_user_id ON user_exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_exam_id ON user_exam_attempts(exam_id);

-- =====================================================
-- TABELAS DE SIMULAÇÕES
-- =====================================================

-- Criar tabela de simulações
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Iniciante', 'Intermediário', 'Avançado')),
    estimated_duration INTEGER, -- em minutos
    xp_reward INTEGER DEFAULT 0,
    environment_config JSONB DEFAULT '{}',
    validation_rules JSONB DEFAULT '{}',
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de progresso em simulações
CREATE TABLE IF NOT EXISTS user_simulation_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    simulation_id UUID REFERENCES simulations(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage INTEGER DEFAULT 0,
    flags_captured JSONB DEFAULT '[]',
    hints_used INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    time_elapsed INTEGER DEFAULT 0,
    actions_log JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, simulation_id)
);

-- Índices para simulações
CREATE INDEX IF NOT EXISTS idx_simulations_category ON simulations(category);
CREATE INDEX IF NOT EXISTS idx_simulations_difficulty ON simulations(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_simulation_progress_user_id ON user_simulation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_simulation_progress_simulation_id ON user_simulation_progress(simulation_id);

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Políticas para missions
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "missions_select_all" ON missions
  FOR SELECT USING (true);

CREATE POLICY "missions_insert_admin" ON missions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "missions_update_admin" ON missions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "missions_delete_admin" ON missions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

-- Políticas para user_mission_progress
ALTER TABLE user_mission_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_mission_progress_own_data" ON user_mission_progress
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para exams
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exams_select_active" ON exams
  FOR SELECT USING (is_active = true);

CREATE POLICY "exams_insert_admin" ON exams
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "exams_update_admin" ON exams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

-- Políticas para exam_questions
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_questions_select_with_exam" ON exam_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exams 
      WHERE exams.id = exam_questions.exam_id 
      AND exams.is_active = true
    )
  );

CREATE POLICY "exam_questions_insert_admin" ON exam_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

-- Políticas para user_exam_attempts
ALTER TABLE user_exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_exam_attempts_own_data" ON user_exam_attempts
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para simulations
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "simulations_select_active" ON simulations
  FOR SELECT USING (is_active = true);

CREATE POLICY "simulations_insert_admin" ON simulations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

-- Políticas para user_simulation_progress
ALTER TABLE user_simulation_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_simulation_progress_own_data" ON user_simulation_progress
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNÇÕES DO BANCO DE DADOS
-- =====================================================

-- Função para calcular progresso de missão
CREATE OR REPLACE FUNCTION calculate_mission_progress(
  p_user_id UUID,
  p_mission_id UUID
) RETURNS INTEGER AS $$
DECLARE
  total_objectives INTEGER;
  completed_objectives INTEGER;
  progress_percentage INTEGER;
BEGIN
  -- Buscar total de objetivos da missão
  SELECT jsonb_array_length(objectives) INTO total_objectives
  FROM missions WHERE id = p_mission_id;
  
  -- Buscar objetivos completados pelo usuário
  SELECT current_step INTO completed_objectives
  FROM user_mission_progress 
  WHERE user_id = p_user_id AND mission_id = p_mission_id;
  
  -- Calcular porcentagem
  IF total_objectives > 0 THEN
    progress_percentage := (completed_objectives * 100) / total_objectives;
  ELSE
    progress_percentage := 0;
  END IF;
  
  RETURN COALESCE(progress_percentage, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar comando de missão
CREATE OR REPLACE FUNCTION validate_mission_command(
  p_user_id UUID,
  p_mission_id UUID,
  p_command TEXT,
  p_step INTEGER
) RETURNS JSONB AS $$
DECLARE
  mission_data JSONB;
  step_validation JSONB;
  is_valid BOOLEAN := false;
  response_message TEXT;
  xp_reward INTEGER := 0;
BEGIN
  -- Buscar dados da missão
  SELECT objectives INTO mission_data
  FROM missions WHERE id = p_mission_id;
  
  -- Buscar validação para o step atual
  step_validation := mission_data->p_step-1;
  
  -- Lógica básica de validação (expandir conforme necessário)
  IF p_command IS NOT NULL AND length(trim(p_command)) > 0 THEN
    is_valid := true;
    response_message := 'Comando executado com sucesso!';
    xp_reward := 10;
  ELSE
    response_message := 'Comando inválido. Tente novamente.';
  END IF;
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'is_valid', is_valid,
    'message', response_message,
    'xp_reward', xp_reward,
    'next_step', CASE WHEN is_valid THEN p_step + 1 ELSE p_step END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular score de exame
CREATE OR REPLACE FUNCTION calculate_exam_score(
  p_exam_id UUID,
  p_answers JSONB
) RETURNS INTEGER AS $$
DECLARE
  total_points INTEGER := 0;
  earned_points INTEGER := 0;
  question RECORD;
  user_answer TEXT;
BEGIN
  -- Iterar sobre todas as questões do exame
  FOR question IN 
    SELECT id, points, correct_answer 
    FROM exam_questions 
    WHERE exam_id = p_exam_id
  LOOP
    total_points := total_points + question.points;
    
    -- Verificar resposta do usuário
    user_answer := p_answers->>question.id::text;
    
    IF user_answer = question.correct_answer THEN
      earned_points := earned_points + question.points;
    END IF;
  END LOOP;
  
  -- Calcular porcentagem
  IF total_points > 0 THEN
    RETURN (earned_points * 100) / total_points;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir missões de exemplo
INSERT INTO missions (title, description, category, difficulty, duration, xp_reward, tools, objectives) VALUES
('Configuração Básica de Firewall', 'Aprenda a configurar regras básicas de firewall usando iptables', 'Firewall', 'Iniciante', '15 min', 100, 
 '["iptables", "netstat", "ss"]',
 '[
   {"title": "Listar regras atuais", "description": "Use iptables -L para ver as regras", "xpReward": 25, "hint": "Digite iptables -L"},
   {"title": "Bloquear porta 22", "description": "Bloqueie conexões SSH", "xpReward": 50, "hint": "Use iptables -A INPUT -p tcp --dport 22 -j DROP"},
   {"title": "Permitir HTTP", "description": "Permita tráfego na porta 80", "xpReward": 25, "hint": "Use iptables -A INPUT -p tcp --dport 80 -j ACCEPT"}
 ]'),
 
('Análise de Logs AWS', 'Investigue atividades suspeitas em logs do CloudTrail', 'Cloud Security', 'Intermediário', '30 min', 200,
 '["aws", "jq", "grep"]',
 '[
   {"title": "Conectar ao AWS CLI", "description": "Configure as credenciais AWS", "xpReward": 30, "hint": "Use aws configure"},
   {"title": "Baixar logs CloudTrail", "description": "Obtenha logs dos últimos 7 dias", "xpReward": 50, "hint": "Use aws logs describe-log-groups"},
   {"title": "Filtrar eventos suspeitos", "description": "Encontre tentativas de login falhadas", "xpReward": 70, "hint": "Use jq para filtrar eventName"},
   {"title": "Gerar relatório", "description": "Crie um resumo dos achados", "xpReward": 50, "hint": "Documente os IPs suspeitos"}
 ]'),

('Análise de Memória com Volatility', 'Use Volatility para analisar dump de memória', 'Forensics', 'Avançado', '45 min', 300,
 '["volatility", "strings", "hexdump"]',
 '[
   {"title": "Identificar perfil", "description": "Determine o perfil do sistema operacional", "xpReward": 50, "hint": "Use volatility imageinfo"},
   {"title": "Listar processos", "description": "Extraia lista de processos em execução", "xpReward": 75, "hint": "Use volatility pslist"},
   {"title": "Analisar conexões de rede", "description": "Identifique conexões ativas", "xpReward": 75, "hint": "Use volatility netscan"},
   {"title": "Extrair artefatos", "description": "Encontre evidências de malware", "xpReward": 100, "hint": "Use volatility malfind"}
 ]')
ON CONFLICT DO NOTHING;

-- Inserir exames de exemplo
INSERT INTO exams (title, code, certification, duration, total_questions, difficulty) VALUES
('CISSP Practice Exam', 'CISSP-001', 'CISSP', 180, 50, 'Avançado'),
('Security+ Foundation', 'SEC-PLUS-001', 'CompTIA Security+', 90, 30, 'Intermediário'),
('CEH Ethical Hacking', 'CEH-001', 'CEH', 120, 40, 'Avançado')
ON CONFLICT (code) DO NOTHING;

-- Inserir questões de exemplo para Security+
INSERT INTO exam_questions (exam_id, question_number, question_type, category, difficulty, points, question_text, options, correct_answer, explanation) VALUES
((SELECT id FROM exams WHERE code = 'SEC-PLUS-001'), 1, 'multiple', 'Network Security', 'Intermediário', 1,
 'Qual protocolo é usado para estabelecer uma conexão segura entre um cliente e servidor web?',
 '[
   {"id": "a", "text": "HTTP", "description": "Protocolo de transferência de hipertexto"},
   {"id": "b", "text": "HTTPS", "description": "HTTP seguro com SSL/TLS"},
   {"id": "c", "text": "FTP", "description": "Protocolo de transferência de arquivos"},
   {"id": "d", "text": "SMTP", "description": "Protocolo de transferência de email"}
 ]',
 'b',
 'HTTPS (HTTP Secure) usa SSL/TLS para criptografar a comunicação entre cliente e servidor, garantindo confidencialidade e integridade dos dados.'),

((SELECT id FROM exams WHERE code = 'SEC-PLUS-001'), 2, 'scenario', 'Incident Response', 'Intermediário', 2,
 'Você é um analista de segurança e detectou tráfego suspeito saindo da rede corporativa para um IP desconhecido na porta 443. O tráfego está ocorrendo fora do horário comercial e vem de uma estação de trabalho do departamento financeiro.',
 '[
   {"id": "a", "text": "Ignorar o alerta", "description": "Considerar como falso positivo"},
   {"id": "b", "text": "Isolar a estação imediatamente", "description": "Desconectar da rede"},
   {"id": "c", "text": "Monitorar por mais tempo", "description": "Coletar mais evidências"},
   {"id": "d", "text": "Reiniciar a estação", "description": "Resolver com reboot"}
 ]',
 'b',
 'Em casos de suspeita de comprometimento, especialmente em sistemas críticos como do departamento financeiro, o isolamento imediato é a melhor prática para conter possível propagação de malware.')
ON CONFLICT (exam_id, question_number) DO NOTHING;

-- Inserir simulações de exemplo
INSERT INTO simulations (title, description, category, difficulty, estimated_duration, xp_reward, environment_config, validation_rules) VALUES
('Web Application Penetration Test', 'Encontre vulnerabilidades em uma aplicação web simulada', 'Penetration Testing', 'Intermediário', 60, 250,
 '{"target_url": "http://vulnerable-app.local", "tools": ["burp", "nmap", "sqlmap"], "flags": 5}',
 '{"flags": [
   {"name": "SQL Injection", "value": "flag{sql_injection_found}", "points": 50},
   {"name": "XSS", "value": "flag{xss_vulnerability}", "points": 40},
   {"name": "Directory Traversal", "value": "flag{path_traversal}", "points": 60},
   {"name": "Admin Access", "value": "flag{admin_panel_access}", "points": 70},
   {"name": "Database Dump", "value": "flag{database_extracted}", "points": 80}
 ]}'),

('Network Forensics Challenge', 'Analise captura de tráfego de rede para encontrar evidências', 'Forensics', 'Avançado', 90, 400,
 '{"pcap_file": "network_capture.pcap", "tools": ["wireshark", "tcpdump", "tshark"], "flags": 4}',
 '{"flags": [
   {"name": "Malicious IP", "value": "flag{malicious_ip_identified}", "points": 80},
   {"name": "Exfiltrated Data", "value": "flag{data_exfiltration_found}", "points": 100},
   {"name": "C2 Communication", "value": "flag{c2_communication}", "points": 120},
   {"name": "Attack Timeline", "value": "flag{timeline_reconstructed}", "points": 100}
 ]}')
ON CONFLICT DO NOTHING;

-- Conceder permissões para roles anon e authenticated
GRANT SELECT ON missions TO anon, authenticated;
GRANT ALL PRIVILEGES ON user_mission_progress TO authenticated;
GRANT SELECT ON exams TO anon, authenticated;
GRANT SELECT ON exam_questions TO anon, authenticated;
GRANT ALL PRIVILEGES ON user_exam_attempts TO authenticated;
GRANT SELECT ON simulations TO anon, authenticated;
GRANT ALL PRIVILEGES ON user_simulation_progress TO authenticated;
