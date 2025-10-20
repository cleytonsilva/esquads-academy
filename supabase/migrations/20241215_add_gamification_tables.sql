-- Esquads Academy - Migração para tabelas de gamificação adicionais
-- Data: 2024-12-15

-- Tabela para histórico de pontos
CREATE TABLE IF NOT EXISTS points_history (
  id UUID DEFAULT extensions.gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('lesson', 'course', 'mission', 'quiz', 'streak', 'bonus')),
  source_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para configurações de níveis
CREATE TABLE IF NOT EXISTS level_configs (
  id UUID DEFAULT extensions.gen_random_uuid() PRIMARY KEY,
  level INTEGER NOT NULL UNIQUE,
  points_required INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rewards JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para atividades de gamificação (feed de atividades)
CREATE TABLE IF NOT EXISTS gamification_activities (
  id UUID DEFAULT extensions.gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('badge_earned', 'level_up', 'mission_completed', 'course_completed', 'streak_milestone')),
  title TEXT NOT NULL,
  description TEXT,
  points_earned INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar campos de gamificação à tabela badges se não existirem
DO $$ 
BEGIN
  -- Adicionar campo rarity se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'rarity') THEN
    ALTER TABLE badges ADD COLUMN rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'));
  END IF;
  
  -- Adicionar campo category se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'category') THEN
    ALTER TABLE badges ADD COLUMN category TEXT DEFAULT 'achievement' CHECK (category IN ('achievement', 'progress', 'special', 'milestone'));
  END IF;
  
  -- Adicionar campo requirements se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'requirements') THEN
    ALTER TABLE badges ADD COLUMN requirements JSONB;
  END IF;
  
  -- Adicionar campo is_active se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'is_active') THEN
    ALTER TABLE badges ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Adicionar campos de gamificação à tabela missions se não existirem
DO $$ 
BEGIN
  -- Adicionar campo difficulty se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'difficulty') THEN
    ALTER TABLE missions ADD COLUMN difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard'));
  END IF;
  
  -- Adicionar campo type se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'type') THEN
    ALTER TABLE missions ADD COLUMN type TEXT DEFAULT 'course_completion' CHECK (type IN ('course_completion', 'lesson_completion', 'points_earned', 'streak', 'quiz_score', 'time_spent'));
  END IF;
  
  -- Adicionar campo target_value se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'target_value') THEN
    ALTER TABLE missions ADD COLUMN target_value INTEGER DEFAULT 1;
  END IF;
  
  -- Adicionar campo badge_reward se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'badge_reward') THEN
    ALTER TABLE missions ADD COLUMN badge_reward UUID REFERENCES badges(id);
  END IF;
END $$;

-- Adicionar campos de streak à tabela user_points se não existirem
DO $$ 
BEGIN
  -- Adicionar campo current_streak se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_points' AND column_name = 'current_streak') THEN
    ALTER TABLE user_points ADD COLUMN current_streak INTEGER DEFAULT 0;
  END IF;
  
  -- Adicionar campo longest_streak se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_points' AND column_name = 'longest_streak') THEN
    ALTER TABLE user_points ADD COLUMN longest_streak INTEGER DEFAULT 0;
  END IF;
  
  -- Adicionar campo last_activity_date se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_points' AND column_name = 'last_activity_date') THEN
    ALTER TABLE user_points ADD COLUMN last_activity_date DATE;
  END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON points_history(created_at);
CREATE INDEX IF NOT EXISTS idx_gamification_activities_user_id ON gamification_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_activities_created_at ON gamification_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_progress_user_id ON mission_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_progress_status ON mission_progress(status);

-- Habilitar RLS nas novas tabelas
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_activities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para points_history
CREATE POLICY "Users can view their own points history" ON points_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert points history" ON points_history
  FOR INSERT WITH CHECK (true);

-- Políticas RLS para level_configs (público para leitura)
CREATE POLICY "Anyone can view level configs" ON level_configs
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify level configs" ON level_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para gamification_activities
CREATE POLICY "Users can view their own activities" ON gamification_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activities" ON gamification_activities
  FOR INSERT WITH CHECK (true);

-- Inserir configurações de níveis padrão
INSERT INTO level_configs (level, points_required, title, description, rewards) VALUES
(1, 0, 'Iniciante', 'Bem-vindo à Esquads Academy!', '{"badge": null, "title": "Estudante Iniciante"}'),
(2, 100, 'Aprendiz', 'Você está progredindo bem!', '{"badge": null, "title": "Aprendiz Dedicado"}'),
(3, 250, 'Estudioso', 'Seu conhecimento está crescendo!', '{"badge": null, "title": "Estudioso Aplicado"}'),
(4, 500, 'Conhecedor', 'Você domina os conceitos básicos!', '{"badge": null, "title": "Conhecedor Experiente"}'),
(5, 1000, 'Especialista', 'Você é um especialista em formação!', '{"badge": null, "title": "Especialista em Desenvolvimento"}'),
(6, 1750, 'Mestre', 'Seu conhecimento é impressionante!', '{"badge": null, "title": "Mestre do Conhecimento"}'),
(7, 2750, 'Guru', 'Você é uma referência!', '{"badge": null, "title": "Guru da Tecnologia"}'),
(8, 4000, 'Lenda', 'Poucos chegam até aqui!', '{"badge": null, "title": "Lenda Viva"}'),
(9, 6000, 'Mito', 'Você é extraordinário!', '{"badge": null, "title": "Mito da Programação"}'),
(10, 10000, 'Imortal', 'O conhecimento supremo!', '{"badge": null, "title": "Imortal do Código"}')
ON CONFLICT (level) DO NOTHING;

-- Inserir badges padrão (apenas se não existirem)
INSERT INTO badges (name, description, icon_url, points_required, color, rarity, category, requirements) 
SELECT 'Primeiro Passo', 'Complete sua primeira lição', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=golden%20trophy%20badge%20with%20footstep%20icon%20minimalist%20design&image_size=square', 0, '#10B981', 'common', 'achievement', '{"type": "lesson_completion", "count": 1}'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Primeiro Passo');

INSERT INTO badges (name, description, icon_url, points_required, color, rarity, category, requirements) 
SELECT 'Estudante Dedicado', 'Complete 5 lições', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=silver%20badge%20with%20book%20icon%20academic%20style&image_size=square', 0, '#3B82F6', 'common', 'progress', '{"type": "lesson_completion", "count": 5}'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Estudante Dedicado');

INSERT INTO badges (name, description, icon_url, points_required, color, rarity, category, requirements) 
SELECT 'Maratonista', 'Complete 10 lições em um dia', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=bronze%20badge%20with%20running%20icon%20speed%20design&image_size=square', 0, '#F59E0B', 'rare', 'special', '{"type": "daily_lessons", "count": 10}'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Maratonista');

INSERT INTO badges (name, description, icon_url, points_required, color, rarity, category, requirements) 
SELECT 'Primeiro Curso', 'Complete seu primeiro curso', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=golden%20graduation%20cap%20badge%20celebration%20design&image_size=square', 0, '#8B5CF6', 'common', 'milestone', '{"type": "course_completion", "count": 1}'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Primeiro Curso');

INSERT INTO badges (name, description, icon_url, points_required, color, rarity, category, requirements) 
SELECT 'Colecionador', 'Complete 3 cursos', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=platinum%20badge%20with%20collection%20icon%20premium%20design&image_size=square', 0, '#EC4899', 'rare', 'milestone', '{"type": "course_completion", "count": 3}'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Colecionador');

INSERT INTO badges (name, description, icon_url, points_required, color, rarity, category, requirements) 
SELECT 'Sequência de Fogo', 'Mantenha uma sequência de 7 dias', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=fire%20badge%20with%20flame%20icon%20hot%20design&image_size=square', 0, '#EF4444', 'epic', 'special', '{"type": "streak", "count": 7}'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Sequência de Fogo');

-- Inserir missões padrão (apenas se não existirem)
INSERT INTO missions (title, description, icon_url, points_reward, requirements, is_daily, is_active, difficulty, type, target_value) 
SELECT 'Primeira Lição', 'Complete sua primeira lição do dia', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mission%20icon%20with%20play%20button%20daily%20task&image_size=square', 50, '{"type": "lesson_completion", "count": 1}', true, true, 'easy', 'lesson_completion', 1
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Primeira Lição');

INSERT INTO missions (title, description, icon_url, points_reward, requirements, is_daily, is_active, difficulty, type, target_value) 
SELECT 'Estudante Ativo', 'Complete 3 lições hoje', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mission%20icon%20with%20three%20stars%20achievement&image_size=square', 150, '{"type": "lesson_completion", "count": 3}', true, true, 'medium', 'lesson_completion', 3
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Estudante Ativo');

INSERT INTO missions (title, description, icon_url, points_reward, requirements, is_daily, is_active, difficulty, type, target_value) 
SELECT 'Maratona Diária', 'Complete 5 lições em um dia', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mission%20icon%20with%20lightning%20bolt%20energy&image_size=square', 300, '{"type": "lesson_completion", "count": 5}', true, true, 'hard', 'lesson_completion', 5
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Maratona Diária');

INSERT INTO missions (title, description, icon_url, points_reward, requirements, is_daily, is_active, difficulty, type, target_value) 
SELECT 'Conquistador de Pontos', 'Ganhe 500 pontos', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mission%20icon%20with%20coin%20stack%20wealth&image_size=square', 100, '{"type": "points_earned", "count": 500}', false, true, 'medium', 'points_earned', 500
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Conquistador de Pontos');

INSERT INTO missions (title, description, icon_url, points_reward, requirements, is_daily, is_active, difficulty, type, target_value) 
SELECT 'Mestre da Consistência', 'Mantenha uma sequência de 5 dias', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mission%20icon%20with%20calendar%20consistency&image_size=square', 250, '{"type": "streak", "count": 5}', false, true, 'hard', 'streak', 5
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Mestre da Consistência');

-- Comentários para documentação
COMMENT ON TABLE points_history IS 'Histórico de pontos ganhos pelos usuários';
COMMENT ON TABLE level_configs IS 'Configurações dos níveis de gamificação';
COMMENT ON TABLE gamification_activities IS 'Feed de atividades de gamificação dos usuários';
