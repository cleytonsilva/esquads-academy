-- ============================================================
-- Esquads Academy - Gamification Events Tables
-- Data: 2025-10-17
-- Descrição: Criação de tabelas para sistema de gamificação reativo
-- conforme PRD Consolidado
-- ============================================================

-- ============================================================
-- 1. TABELA: xp_events
-- Descrição: Registra todos os eventos de ganho/perda de XP
-- ============================================================
CREATE TABLE IF NOT EXISTS xp_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'mission_started',
    'mission_completed',
    'mission_failed',
    'quiz_correct',
    'quiz_incorrect',
    'hint_used',
    'course_completed',
    'exam_passed',
    'exam_failed',
    'login_daily',
    'feedback_positive',
    'feedback_negative'
  )),
  xp_earned INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON xp_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_events_event_type ON xp_events(event_type);
CREATE INDEX IF NOT EXISTS idx_xp_events_user_created ON xp_events(user_id, created_at DESC);

-- Comentários
COMMENT ON TABLE xp_events IS 'Histórico de eventos de XP (experiência)';
COMMENT ON COLUMN xp_events.user_id IS 'Referência ao usuário que ganhou/perdeu XP';
COMMENT ON COLUMN xp_events.event_type IS 'Tipo de evento que gerou XP';
COMMENT ON COLUMN xp_events.xp_earned IS 'Quantidade de XP ganha (pode ser negativo)';
COMMENT ON COLUMN xp_events.metadata IS 'Metadados adicionais do evento (JSON)';

-- ============================================================
-- 2. TABELA: reputation_events
-- Descrição: Registra todos os eventos de mudança de reputação
-- ============================================================
CREATE TABLE IF NOT EXISTS reputation_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'mission_started',
    'mission_completed',
    'mission_failed',
    'quiz_correct',
    'quiz_incorrect',
    'hint_used',
    'course_completed',
    'exam_passed',
    'exam_failed',
    'login_daily',
    'feedback_positive',
    'feedback_negative'
  )),
  reputation_change INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reputation_events_user_id ON reputation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_events_created_at ON reputation_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reputation_events_event_type ON reputation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_reputation_events_user_created ON reputation_events(user_id, created_at DESC);

-- Comentários
COMMENT ON TABLE reputation_events IS 'Histórico de eventos de reputação';
COMMENT ON COLUMN reputation_events.user_id IS 'Referência ao usuário que ganhou/perdeu reputação';
COMMENT ON COLUMN reputation_events.event_type IS 'Tipo de evento que afetou reputação';
COMMENT ON COLUMN reputation_events.reputation_change IS 'Mudança de reputação (pode ser negativo)';
COMMENT ON COLUMN reputation_events.metadata IS 'Metadados adicionais do evento (JSON)';

-- ============================================================
-- 3. TABELA: user_rankings
-- Descrição: Armazena o ranking de usuários por temporada
-- ============================================================
CREATE TABLE IF NOT EXISTS user_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season TEXT NOT NULL DEFAULT 'current',
  position INTEGER NOT NULL,
  total_xp INTEGER NOT NULL DEFAULT 0,
  reputation INTEGER NOT NULL DEFAULT 0,
  combined_score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, season)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_rankings_season ON user_rankings(season);
CREATE INDEX IF NOT EXISTS idx_user_rankings_position ON user_rankings(season, position);
CREATE INDEX IF NOT EXISTS idx_user_rankings_score ON user_rankings(season, combined_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_rankings_user_season ON user_rankings(user_id, season);

-- Comentários
COMMENT ON TABLE user_rankings IS 'Ranking de usuários por temporada';
COMMENT ON COLUMN user_rankings.season IS 'Temporada do ranking (current, monthly, quarterly)';
COMMENT ON COLUMN user_rankings.position IS 'Posição no ranking';
COMMENT ON COLUMN user_rankings.combined_score IS 'Pontuação combinada: total_xp + (reputation * 2)';

-- ============================================================
-- 4. ATUALIZAR: user_profiles
-- Adicionar campos necessários para gamificação
-- ============================================================
DO $$ 
BEGIN
  -- Adicionar campo total_xp se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'total_xp') THEN
    ALTER TABLE user_profiles ADD COLUMN total_xp INTEGER DEFAULT 0 NOT NULL;
  END IF;
  
  -- Adicionar campo reputation se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'reputation') THEN
    ALTER TABLE user_profiles ADD COLUMN reputation INTEGER DEFAULT 0 NOT NULL;
  END IF;
  
  -- Adicionar campo level se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'level') THEN
    ALTER TABLE user_profiles ADD COLUMN level INTEGER DEFAULT 1 NOT NULL;
  END IF;
END $$;

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_xp ON user_profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_reputation ON user_profiles(reputation DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level DESC);

-- ============================================================
-- 5. TABELA: badge_definitions
-- Descrição: Definições de badges do sistema (caso não exista 'badges')
-- ============================================================
CREATE TABLE IF NOT EXISTS badge_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('Progress', 'Achievement', 'Special', 'Milestone')),
  rarity TEXT NOT NULL CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')),
  xp_value INTEGER NOT NULL DEFAULT 0,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_badge_definitions_type ON badge_definitions(badge_type);
CREATE INDEX IF NOT EXISTS idx_badge_definitions_rarity ON badge_definitions(rarity);
CREATE INDEX IF NOT EXISTS idx_badge_definitions_active ON badge_definitions(is_active);

-- Comentários
COMMENT ON TABLE badge_definitions IS 'Definições de badges e conquistas';
COMMENT ON COLUMN badge_definitions.criteria IS 'Critérios para desbloquear badge (JSON)';
COMMENT ON COLUMN badge_definitions.xp_value IS 'XP ganho ao conquistar o badge';

-- ============================================================
-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. POLÍTICAS RLS - xp_events
-- ============================================================
-- Usuários podem ver apenas seus próprios eventos
CREATE POLICY "Users can view their own XP events"
  ON xp_events FOR SELECT
  USING (auth.uid() = user_id);

-- Sistema pode inserir eventos (via Service Role Key)
CREATE POLICY "Service can insert XP events"
  ON xp_events FOR INSERT
  WITH CHECK (true);

-- Admins podem ver todos os eventos
CREATE POLICY "Admins can view all XP events"
  ON xp_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 8. POLÍTICAS RLS - reputation_events
-- ============================================================
-- Usuários podem ver apenas seus próprios eventos
CREATE POLICY "Users can view their own reputation events"
  ON reputation_events FOR SELECT
  USING (auth.uid() = user_id);

-- Sistema pode inserir eventos
CREATE POLICY "Service can insert reputation events"
  ON reputation_events FOR INSERT
  WITH CHECK (true);

-- Admins podem ver todos os eventos
CREATE POLICY "Admins can view all reputation events"
  ON reputation_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 9. POLÍTICAS RLS - user_rankings
-- ============================================================
-- Todos podem ver o ranking (é público)
CREATE POLICY "Anyone can view rankings"
  ON user_rankings FOR SELECT
  USING (true);

-- Apenas sistema pode atualizar rankings
CREATE POLICY "Service can manage rankings"
  ON user_rankings FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 10. POLÍTICAS RLS - badge_definitions
-- ============================================================
-- Todos podem ver definições de badges
CREATE POLICY "Anyone can view badge definitions"
  ON badge_definitions FOR SELECT
  USING (is_active = true);

-- Apenas admins podem gerenciar badges
CREATE POLICY "Admins can manage badge definitions"
  ON badge_definitions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 11. FUNÇÃO: Atualizar timestamp de updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para badge_definitions
CREATE TRIGGER update_badge_definitions_updated_at
  BEFORE UPDATE ON badge_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_rankings
CREATE TRIGGER update_user_rankings_updated_at
  BEFORE UPDATE ON user_rankings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 12. INSERIR BADGES PADRÃO
-- ============================================================
INSERT INTO badge_definitions (name, description, badge_type, rarity, xp_value, criteria, icon_url) VALUES
  ('Primeiro Passo', 'Complete sua primeira missão', 'Achievement', 'Common', 10, '{"missions_completed": 1}', NULL),
  ('Explorador', 'Complete 10 missões', 'Progress', 'Common', 25, '{"missions_completed": 10}', NULL),
  ('Veterano', 'Complete 50 missões', 'Progress', 'Rare', 100, '{"missions_completed": 50}', NULL),
  ('Lenda Viva', 'Complete 100 missões', 'Milestone', 'Epic', 250, '{"missions_completed": 100}', NULL),
  
  ('Iniciante Dedicado', 'Alcance 500 XP', 'Progress', 'Common', 10, '{"min_xp": 500}', NULL),
  ('Estudioso', 'Alcance 2000 XP', 'Progress', 'Rare', 50, '{"min_xp": 2000}', NULL),
  ('Mestre do Conhecimento', 'Alcance 10000 XP', 'Milestone', 'Epic', 200, '{"min_xp": 10000}', NULL),
  ('Imortal', 'Alcance 50000 XP', 'Milestone', 'Legendary', 1000, '{"min_xp": 50000}', NULL),
  
  ('Respeitado', 'Alcance 100 de reputação', 'Achievement', 'Rare', 50, '{"min_reputation": 100}', NULL),
  ('Renomado', 'Alcance 500 de reputação', 'Special', 'Epic', 150, '{"min_reputation": 500}', NULL),
  ('Lendário', 'Alcance 1000 de reputação', 'Special', 'Legendary', 500, '{"min_reputation": 1000}', NULL),
  
  ('Aprendiz Nível 5', 'Alcance o nível 5', 'Milestone', 'Common', 20, '{"min_level": 5}', NULL),
  ('Especialista Nível 10', 'Alcance o nível 10', 'Milestone', 'Rare', 100, '{"min_level": 10}', NULL),
  ('Guru Nível 20', 'Alcance o nível 20', 'Milestone', 'Epic', 500, '{"min_level": 20}', NULL)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================

