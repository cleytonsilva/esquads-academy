-- Criar tabela mission_progress se não existir
CREATE TABLE IF NOT EXISTS mission_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  objectives_completed JSONB DEFAULT '[]'::jsonb,
  commands_executed JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

-- Habilitar RLS
ALTER TABLE mission_progress ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seu próprio progresso
CREATE POLICY "Usuários podem ver seu próprio progresso" ON mission_progress
  FOR ALL USING (auth.uid() = user_id);

-- Conceder permissões
GRANT ALL PRIVILEGES ON mission_progress TO authenticated;
GRANT SELECT ON mission_progress TO anon;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mission_progress_user_id ON mission_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_progress_mission_id ON mission_progress(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_progress_status ON mission_progress(status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_mission_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mission_progress_updated_at
  BEFORE UPDATE ON mission_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_mission_progress_updated_at();

-- Verificar se a tabela foi criada corretamente
SELECT 'Tabela mission_progress criada com sucesso!' as resultado;
