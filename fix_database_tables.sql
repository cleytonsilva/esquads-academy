-- ============================================================================
-- SCRIPT DE CORREÇÃO URGENTE - Esquads Academy
-- Aplicar migrações essenciais para corrigir erros 404
-- ============================================================================

-- 1. CRIAR TABELA USER_MISSIONS
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
  )
);

-- Índices para user_missions
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_mission_id ON user_missions(mission_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON user_missions(status);

-- RLS para user_missions
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mission progress"
  ON user_missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own mission progress"
  ON user_missions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mission progress"
  ON user_missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. CRIAR TABELA MISSIONS (se não existir)
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

-- Índices para missions
CREATE INDEX IF NOT EXISTS idx_missions_category ON missions(category);
CREATE INDEX IF NOT EXISTS idx_missions_difficulty ON missions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_missions_is_premium ON missions(is_premium);
CREATE INDEX IF NOT EXISTS idx_missions_is_locked ON missions(is_locked);

-- RLS para missions
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view missions"
  ON missions FOR SELECT
  USING (true);

-- 3. CRIAR TABELA NOTIFICATIONS (se não existir)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'unread',
  grouped_count INTEGER DEFAULT 1,
  parent_group_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  content_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('unread', 'read', 'suppressed', 'grouped')),
  CONSTRAINT valid_priority CHECK (priority IN ('silent', 'toast', 'modal')),
  CONSTRAINT valid_category CHECK (category IN ('xp', 'badge', 'mission', 'certificate', 'level', 'reputation', 'hint', 'feedback', 'exam', 'achievement', 'social', 'system'))
);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS para notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- 4. INSERIR DADOS DE TESTE
-- ============================================================================

-- Inserir algumas missões de exemplo
INSERT INTO missions (id, title, description, category, difficulty_level, xp_reward, duration_minutes, objectives, terminal_commands) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Firewall Básico', 'Configure um firewall básico para proteger uma rede', 'FIREWALL', 'BASIC', 100, 30, 
 '[{"id": "obj1", "description": "Configurar regras básicas", "points": 50}, {"id": "obj2", "description": "Testar conectividade", "points": 50}]',
 '[{"command": "iptables -L", "expected_output": "Chain INPUT", "points": 25}, {"command": "ufw status", "expected_output": "Status: active", "points": 25}]'),
('550e8400-e29b-41d4-a716-446655440002', 'Análise Forense', 'Analise evidências digitais de um incidente', 'FORENSICS', 'INTERMEDIATE', 200, 45,
 '[{"id": "obj1", "description": "Extrair metadados", "points": 100}, {"id": "obj2", "description": "Analisar logs", "points": 100}]',
 '[{"command": "exiftool image.jpg", "expected_output": "File Name", "points": 50}, {"command": "strings file.bin", "expected_output": "text", "points": 50}]')
ON CONFLICT (id) DO NOTHING;

-- 5. GRANTS E PERMISSÕES
-- ============================================================================

GRANT ALL ON missions TO authenticated;
GRANT ALL ON user_missions TO authenticated;
GRANT ALL ON notifications TO authenticated;

-- 6. FUNÇÃO PARA ATUALIZAR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_missions_updated_at ON missions;
CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_missions_updated_at ON user_missions;
CREATE TRIGGER update_user_missions_updated_at
  BEFORE UPDATE ON user_missions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. LOG DE CONCLUSÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Script de correção aplicado com sucesso!';
  RAISE NOTICE 'Tabelas criadas/verificadas: missions, user_missions, notifications';
  RAISE NOTICE 'RLS habilitado em todas as tabelas';
  RAISE NOTICE 'Dados de teste inseridos';
END $$;
