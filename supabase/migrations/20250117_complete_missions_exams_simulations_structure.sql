-- Migração para completar estrutura de missões, exames e simulações
-- Data: 2025-01-17
-- Descrição: Ajustes e complementos na estrutura existente

-- =====================================================
-- AJUSTES NA TABELA DE EXAMES
-- =====================================================

-- Adicionar campos faltantes na tabela exams
ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS code VARCHAR(100),
ADD COLUMN IF NOT EXISTS certification VARCHAR(100),
ADD COLUMN IF NOT EXISTS duration INTEGER, -- em minutos
ADD COLUMN IF NOT EXISTS total_questions INTEGER,
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) CHECK (difficulty IN ('Iniciante', 'Intermediário', 'Avançado')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Criar índice único para o código do exame
CREATE UNIQUE INDEX IF NOT EXISTS idx_exams_code ON exams(code) WHERE code IS NOT NULL;

-- =====================================================
-- CRIAR TABELA user_exam_attempts (se não existir)
-- =====================================================

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
    attempt_number INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para user_exam_attempts
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_user_id ON user_exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_exam_id ON user_exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_completed ON user_exam_attempts(completed_at) WHERE completed_at IS NOT NULL;

-- =====================================================
-- CRIAR TABELA user_mission_progress (se não existir)
-- =====================================================

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

-- Índices para user_mission_progress
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_user_id ON user_mission_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_mission_id ON user_mission_progress(mission_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_completed ON user_mission_progress(completed_at) WHERE completed_at IS NOT NULL;

-- =====================================================
-- FUNÇÕES RPC PARA INTEGRAÇÃO COM HOOKS
-- =====================================================

-- Função para adicionar XP ao usuário
CREATE OR REPLACE FUNCTION add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_source TEXT DEFAULT 'mission'
) RETURNS JSONB AS $$
DECLARE
  current_xp INTEGER;
  new_xp INTEGER;
  level_before INTEGER;
  level_after INTEGER;
  result JSONB;
BEGIN
  -- Buscar XP atual do usuário
  SELECT COALESCE(experience_points, 0) INTO current_xp
  FROM user_profiles WHERE user_id = p_user_id;
  
  -- Calcular novo XP
  new_xp := current_xp + p_xp_amount;
  
  -- Calcular níveis (assumindo 100 XP por nível)
  level_before := current_xp / 100;
  level_after := new_xp / 100;
  
  -- Atualizar XP do usuário
  UPDATE user_profiles 
  SET experience_points = new_xp,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Registrar evento de gamificação se existir a tabela
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gamification_events') THEN
    INSERT INTO gamification_events (user_id, event_type, points_earned, metadata)
    VALUES (p_user_id, 'xp_gained', p_xp_amount, jsonb_build_object('source', p_source));
  END IF;
  
  -- Retornar resultado
  result := jsonb_build_object(
    'success', true,
    'previous_xp', current_xp,
    'new_xp', new_xp,
    'xp_gained', p_xp_amount,
    'level_up', level_after > level_before,
    'new_level', level_after
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para iniciar missão
CREATE OR REPLACE FUNCTION start_mission(
  p_user_id UUID,
  p_mission_id UUID
) RETURNS JSONB AS $$
DECLARE
  mission_exists BOOLEAN;
  progress_exists BOOLEAN;
  result JSONB;
BEGIN
  -- Verificar se a missão existe
  SELECT EXISTS(SELECT 1 FROM missions WHERE id = p_mission_id) INTO mission_exists;
  
  IF NOT mission_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'Mission not found');
  END IF;
  
  -- Verificar se já existe progresso
  SELECT EXISTS(
    SELECT 1 FROM user_mission_progress 
    WHERE user_id = p_user_id AND mission_id = p_mission_id
  ) INTO progress_exists;
  
  IF progress_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'Mission already started');
  END IF;
  
  -- Criar registro de progresso
  INSERT INTO user_mission_progress (user_id, mission_id, progress_percentage, current_step)
  VALUES (p_user_id, p_mission_id, 0, 1);
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Mission started successfully'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para completar missão
CREATE OR REPLACE FUNCTION complete_mission(
  p_user_id UUID,
  p_mission_id UUID,
  p_time_elapsed INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  mission_xp INTEGER;
  result JSONB;
BEGIN
  -- Buscar XP da missão
  SELECT COALESCE(xp_reward, 0) INTO mission_xp
  FROM missions WHERE id = p_mission_id;
  
  -- Atualizar progresso da missão
  UPDATE user_mission_progress 
  SET progress_percentage = 100,
      completed_at = NOW(),
      time_elapsed = p_time_elapsed,
      updated_at = NOW()
  WHERE user_id = p_user_id AND mission_id = p_mission_id;
  
  -- Adicionar XP se a missão tem recompensa
  IF mission_xp > 0 THEN
    PERFORM add_user_xp(p_user_id, mission_xp, 'mission_completion');
  END IF;
  
  result := jsonb_build_object(
    'success', true,
    'xp_earned', mission_xp,
    'message', 'Mission completed successfully'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para iniciar exame
CREATE OR REPLACE FUNCTION start_exam(
  p_user_id UUID,
  p_exam_id UUID
) RETURNS JSONB AS $$
DECLARE
  exam_exists BOOLEAN;
  attempt_count INTEGER;
  max_attempts INTEGER;
  attempt_id UUID;
  result JSONB;
BEGIN
  -- Verificar se o exame existe e está ativo
  SELECT EXISTS(
    SELECT 1 FROM exams 
    WHERE id = p_exam_id AND is_active = true
  ) INTO exam_exists;
  
  IF NOT exam_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'Exam not found or inactive');
  END IF;
  
  -- Verificar número de tentativas
  SELECT COALESCE(max_attempts, 3) INTO max_attempts
  FROM exams WHERE id = p_exam_id;
  
  SELECT COUNT(*) INTO attempt_count
  FROM user_exam_attempts 
  WHERE user_id = p_user_id AND exam_id = p_exam_id;
  
  IF attempt_count >= max_attempts THEN
    RETURN jsonb_build_object('success', false, 'error', 'Maximum attempts reached');
  END IF;
  
  -- Criar nova tentativa
  INSERT INTO user_exam_attempts (user_id, exam_id, attempt_number)
  VALUES (p_user_id, p_exam_id, attempt_count + 1)
  RETURNING id INTO attempt_id;
  
  result := jsonb_build_object(
    'success', true,
    'attempt_id', attempt_id,
    'attempt_number', attempt_count + 1,
    'message', 'Exam started successfully'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para submeter exame
CREATE OR REPLACE FUNCTION submit_exam(
  p_attempt_id UUID,
  p_answers JSONB
) RETURNS JSONB AS $$
DECLARE
  exam_id UUID;
  user_id UUID;
  total_score INTEGER;
  passing_score INTEGER;
  passed BOOLEAN;
  result JSONB;
BEGIN
  -- Buscar dados da tentativa
  SELECT e.id, ua.user_id INTO exam_id, user_id
  FROM user_exam_attempts ua
  JOIN exams e ON e.id = ua.exam_id
  WHERE ua.id = p_attempt_id;
  
  -- Calcular score usando a função existente
  SELECT calculate_exam_score(exam_id, p_answers) INTO total_score;
  
  -- Buscar nota de aprovação
  SELECT COALESCE(passing_score, 70) INTO passing_score
  FROM exams WHERE id = exam_id;
  
  -- Determinar se passou
  passed := total_score >= passing_score;
  
  -- Atualizar tentativa
  UPDATE user_exam_attempts 
  SET answers = p_answers,
      score = total_score,
      passed = passed,
      completed_at = NOW()
  WHERE id = p_attempt_id;
  
  result := jsonb_build_object(
    'success', true,
    'score', total_score,
    'passing_score', passing_score,
    'passed', passed,
    'message', CASE WHEN passed THEN 'Exam passed!' ELSE 'Exam failed. Try again.' END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLÍTICAS RLS PARA NOVAS TABELAS
-- =====================================================

-- Políticas para user_exam_attempts
ALTER TABLE user_exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_exam_attempts_own_data" ON user_exam_attempts
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_mission_progress (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_mission_progress' 
    AND policyname = 'user_mission_progress_own_data'
  ) THEN
    ALTER TABLE user_mission_progress ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "user_mission_progress_own_data" ON user_mission_progress
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- PERMISSÕES PARA ROLES
-- =====================================================

-- Conceder permissões para as novas tabelas
GRANT SELECT ON user_exam_attempts TO anon, authenticated;
GRANT ALL PRIVILEGES ON user_exam_attempts TO authenticated;

GRANT SELECT ON user_mission_progress TO anon, authenticated;
GRANT ALL PRIVILEGES ON user_mission_progress TO authenticated;

-- Conceder permissões para executar as funções RPC
GRANT EXECUTE ON FUNCTION add_user_xp(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION start_mission(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_mission(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION start_exam(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_exam(UUID, JSONB) TO authenticated;

-- =====================================================
-- DADOS DE EXEMPLO ADICIONAIS
-- =====================================================

-- Atualizar exames existentes com novos campos
UPDATE exams SET 
  code = 'CISSP-001',
  certification = 'CISSP',
  duration = 180,
  total_questions = 50,
  difficulty = 'Avançado'
WHERE title = 'CISSP Practice Exam' AND code IS NULL;

UPDATE exams SET 
  code = 'SEC-PLUS-001',
  certification = 'CompTIA Security+',
  duration = 90,
  total_questions = 30,
  difficulty = 'Intermediário'
WHERE title = 'Security+ Foundation' AND code IS NULL;

UPDATE exams SET 
  code = 'CEH-001',
  certification = 'CEH',
  duration = 120,
  total_questions = 40,
  difficulty = 'Avançado'
WHERE title = 'CEH Ethical Hacking' AND code IS NULL;

-- Inserir questões adicionais se não existirem
INSERT INTO exam_questions (exam_id, question_number, question_type, category, difficulty, points, question_text, options, correct_answer, explanation)
SELECT 
  e.id,
  3,
  'code',
  'Cryptography',
  'Intermediário',
  2,
  'Analise o código Python abaixo e identifique a vulnerabilidade de segurança:

```python
import hashlib

def hash_password(password):
    return hashlib.md5(password.encode()).hexdigest()

user_password = "admin123"
hashed = hash_password(user_password)
print(f"Hash: {hashed}")
```',
  '[
    {"id": "a", "text": "Uso de MD5 para hash de senhas", "description": "MD5 é vulnerável a ataques de colisão"},
    {"id": "b", "text": "Falta de salt no hash", "description": "Sem salt, ataques de rainbow table são possíveis"},
    {"id": "c", "text": "Senha fraca", "description": "A senha é facilmente quebrada"},
    {"id": "d", "text": "Todas as alternativas", "description": "Múltiplas vulnerabilidades presentes"}
  ]',
  'd',
  'O código apresenta múltiplas vulnerabilidades: MD5 é criptograficamente quebrado, não há uso de salt (permitindo ataques de rainbow table), e a senha é fraca. Para segurança adequada, use bcrypt, scrypt ou Argon2 com salt aleatório.'
FROM exams e
WHERE e.code = 'SEC-PLUS-001'
AND NOT EXISTS (
  SELECT 1 FROM exam_questions eq 
  WHERE eq.exam_id = e.id AND eq.question_number = 3
);

-- Inserir missões adicionais se não existirem
INSERT INTO missions (title, description, category, difficulty, duration_minutes, xp_reward, tools, objectives)
SELECT 
  'Detecção de Intrusão com Snort',
  'Configure e use o Snort para detectar atividades maliciosas na rede',
  'Network Security',
  'Intermediário',
  45,
  200,
  '["snort", "tcpdump", "wireshark"]',
  '[
    {"title": "Instalar Snort", "description": "Configure o Snort no sistema", "xpReward": 40, "hint": "Use apt-get install snort"},
    {"title": "Configurar regras", "description": "Crie regras personalizadas de detecção", "xpReward": 80, "hint": "Edite /etc/snort/rules/local.rules"},
    {"title": "Testar detecção", "description": "Execute um teste de intrusão", "xpReward": 80, "hint": "Use nmap para gerar tráfego suspeito"}
  ]'
WHERE NOT EXISTS (
  SELECT 1 FROM missions 
  WHERE title = 'Detecção de Intrusão com Snort'
);

-- Inserir simulação adicional se não existir
INSERT INTO simulations (title, description, category, difficulty, estimated_duration, xp_reward, environment_config, validation_rules)
SELECT 
  'Active Directory Penetration Test',
  'Comprometa um ambiente Active Directory simulado',
  'Penetration Testing',
  'Avançado',
  120,
  500,
  '{"domain": "vulnerable.local", "tools": ["bloodhound", "impacket", "crackmapexec"], "flags": 6}',
  '{"flags": [
    {"name": "User Enumeration", "value": "flag{users_enumerated}", "points": 60},
    {"name": "Password Spray", "value": "flag{password_spray_success}", "points": 80},
    {"name": "Kerberoasting", "value": "flag{kerberos_ticket_cracked}", "points": 100},
    {"name": "Lateral Movement", "value": "flag{lateral_movement}", "points": 120},
    {"name": "Domain Admin", "value": "flag{domain_admin_compromised}", "points": 140},
    {"name": "Persistence", "value": "flag{persistence_established}", "points": 100}
  ]}'
WHERE NOT EXISTS (
  SELECT 1 FROM simulations 
  WHERE title = 'Active Directory Penetration Test'
);
