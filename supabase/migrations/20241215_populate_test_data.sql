-- Migração para popular dados de teste na plataforma Esquads Academy
-- Data: 2024-12-15
-- Versão: 5 (sem usuários - apenas dados básicos)

-- Inserir badges de teste (apenas se não existirem)
INSERT INTO badges (id, name, description, icon_url, points_required, color, rarity, category, requirements, is_active) 
SELECT v.id::uuid, v.name, v.description, v.icon_url, v.points_required, v.color, v.rarity, v.category, v.requirements::jsonb, v.is_active
FROM (VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Primeiro Passo', 'Complete sua primeira lição', '🎯', 0, '#10B981', 'common', 'achievement', '{"type": "lesson_completion", "count": 1}', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Estudante Dedicado', 'Complete 5 lições', '📚', 50, '#3B82F6', 'common', 'progress', '{"type": "lesson_completion", "count": 5}', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Mestre do Conhecimento', 'Complete um curso inteiro', '🎓', 100, '#8B5CF6', 'rare', 'achievement', '{"type": "course_completion", "count": 1}', true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Sequência de Fogo', 'Mantenha uma sequência de 7 dias', '🔥', 70, '#F59E0B', 'rare', 'milestone', '{"type": "streak", "count": 7}', true),
  ('550e8400-e29b-41d4-a716-446655440005', 'Explorador', 'Explore 3 cursos diferentes', '🗺️', 150, '#06B6D4', 'epic', 'special', '{"type": "course_exploration", "count": 3}', true)
) AS v(id, name, description, icon_url, points_required, color, rarity, category, requirements, is_active)
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE badges.id = v.id::uuid);

-- Inserir missões de teste (apenas se não existirem)
INSERT INTO missions (id, title, description, icon_url, points_reward, requirements, is_daily, is_active, difficulty, type, target_value, badge_reward) 
SELECT v.id::uuid, v.title, v.description, v.icon_url, v.points_reward, v.requirements::jsonb, v.is_daily, v.is_active, v.difficulty, v.type, v.target_value, v.badge_reward::uuid
FROM (VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'Primeira Lição', 'Complete sua primeira lição hoje', '🎯', 10, '{"type": "lesson_completion", "count": 1}', true, true, 'easy', 'lesson_completion', 1, '550e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440002', 'Estudante Ativo', 'Complete 3 lições hoje', '📖', 25, '{"type": "lesson_completion", "count": 3}', true, true, 'medium', 'lesson_completion', 3, null),
  ('770e8400-e29b-41d4-a716-446655440003', 'Maratona de Aprendizado', 'Estude por 30 minutos', '⏰', 20, '{"type": "time_spent", "minutes": 30}', true, true, 'medium', 'time_spent', 30, null),
  ('770e8400-e29b-41d4-a716-446655440004', 'Conquistador de Pontos', 'Ganhe 50 pontos hoje', '💎', 15, '{"type": "points_earned", "count": 50}', true, true, 'easy', 'points_earned', 50, null),
  ('770e8400-e29b-41d4-a716-446655440005', 'Sequência Perfeita', 'Mantenha uma sequência de 3 dias', '🔥', 50, '{"type": "streak", "count": 3}', false, true, 'hard', 'streak', 3, '550e8400-e29b-41d4-a716-446655440004')
) AS v(id, title, description, icon_url, points_reward, requirements, is_daily, is_active, difficulty, type, target_value, badge_reward)
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE missions.id = v.id::uuid);

-- Conceder permissões para as tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON badges TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON level_configs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON missions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON courses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON course_modules TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON module_lessons TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON exams TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_points TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_badges TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_courses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lesson_progress TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mission_progress TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON certificates TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON exam_attempts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON points_history TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON gamification_activities TO anon, authenticated;
