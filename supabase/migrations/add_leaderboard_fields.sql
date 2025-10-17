-- Adicionar campos faltantes na tabela social_leaderboard
ALTER TABLE social_leaderboard 
ADD COLUMN IF NOT EXISTS groups_joined INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;

-- Atualizar dados existentes com valores padrão
UPDATE social_leaderboard 
SET groups_joined = 0, streak_days = 0 
WHERE groups_joined IS NULL OR streak_days IS NULL;