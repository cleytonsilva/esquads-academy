-- ============================================================
-- Esquads Academy - Hint System Tables
-- Data: 2025-10-17
-- Descrição: Tabelas para sistema de dicas progressivas (HintAgent)
-- ============================================================

-- ============================================================
-- 1. TABELA: mission_hint_usage
-- Descrição: Registra quando usuários usam dicas
-- ============================================================
CREATE TABLE IF NOT EXISTS mission_hint_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  hint_level INTEGER NOT NULL CHECK (hint_level IN (1, 2, 3)),
  hint_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_mission_hint_usage_user_mission ON mission_hint_usage(user_id, mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_hint_usage_created_at ON mission_hint_usage(created_at DESC);

-- Comentários
COMMENT ON TABLE mission_hint_usage IS 'Histórico de uso de dicas em missões';
COMMENT ON COLUMN mission_hint_usage.hint_level IS 'Nível da dica: 1 (sutil), 2 (direta), 3 (solução)';

-- ============================================================
-- 2. TABELA: hint_feedback
-- Descrição: Feedback dos usuários sobre as dicas
-- ============================================================
CREATE TABLE IF NOT EXISTS hint_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  hint_level INTEGER NOT NULL CHECK (hint_level IN (1, 2, 3)),
  was_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_hint_feedback_mission ON hint_feedback(mission_id);
CREATE INDEX IF NOT EXISTS idx_hint_feedback_helpful ON hint_feedback(was_helpful);

-- Comentários
COMMENT ON TABLE hint_feedback IS 'Feedback sobre utilidade das dicas';

-- ============================================================
-- 3. ATUALIZAR TABELA missions
-- Adicionar campo hints se não existir
-- ============================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'hints') THEN
    ALTER TABLE missions ADD COLUMN hints JSONB DEFAULT '{
      "level1": ["Comece pela estrutura básica e vá incrementando."],
      "level2": ["Implemente cada etapa por vez e teste frequentemente."],
      "level3": ["Use a estrutura fornecida como base e adapte para seu caso."]
    }'::jsonb;
  END IF;
END $$;

-- ============================================================
-- 4. HABILITAR ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE mission_hint_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE hint_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. POLÍTICAS RLS - mission_hint_usage
-- ============================================================
CREATE POLICY "Users can view their own hint usage"
  ON mission_hint_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hint usage"
  ON mission_hint_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all hint usage"
  ON mission_hint_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 6. POLÍTICAS RLS - hint_feedback
-- ============================================================
CREATE POLICY "Users can submit feedback"
  ON hint_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
  ON hint_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 7. FUNÇÃO: Estatísticas de uso de dicas
-- ============================================================
CREATE OR REPLACE FUNCTION get_hint_usage_stats(p_mission_id UUID)
RETURNS TABLE (
  hint_level INTEGER,
  usage_count BIGINT,
  helpful_count BIGINT,
  helpful_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.hint_level,
    COUNT(DISTINCT h.user_id) as usage_count,
    COUNT(DISTINCT CASE WHEN f.was_helpful = true THEN f.user_id END) as helpful_count,
    ROUND(
      (COUNT(DISTINCT CASE WHEN f.was_helpful = true THEN f.user_id END)::NUMERIC / 
       NULLIF(COUNT(DISTINCT h.user_id), 0)) * 100, 
      2
    ) as helpful_percentage
  FROM mission_hint_usage h
  LEFT JOIN hint_feedback f ON 
    f.user_id = h.user_id AND 
    f.mission_id = h.mission_id AND 
    f.hint_level = h.hint_level
  WHERE h.mission_id = p_mission_id
  GROUP BY h.hint_level
  ORDER BY h.hint_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION get_hint_usage_stats IS 'Retorna estatísticas de uso e utilidade das dicas por missão';

-- ============================================================
-- 8. INSERIR DICAS PADRÃO EM MISSÕES EXISTENTES
-- ============================================================
UPDATE missions
SET hints = '{
  "level1": [
    "Comece identificando as variáveis e estruturas de dados necessárias.",
    "Pense na lógica passo a passo antes de começar a codificar."
  ],
  "level2": [
    "Implemente cada função separadamente e teste individualmente.",
    "Use console.log para verificar os valores intermediários.",
    "Revise a documentação dos métodos que você está usando."
  ],
  "level3": [
    "Veja um exemplo de estrutura similar e adapte para seu caso.",
    "A solução envolve combinar loops e condicionais de forma eficiente.",
    "Não se esqueça de tratar casos especiais e valores nulos."
  ]
}'::jsonb
WHERE hints IS NULL OR hints::text = '{}'::text;

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================

