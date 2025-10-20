-- Verificar e configurar políticas RLS para segurança do sistema

-- Habilitar RLS em todas as tabelas principais
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela users
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para tabela user_points
DROP POLICY IF EXISTS "user_points_select_own" ON user_points;
CREATE POLICY "user_points_select_own" ON user_points
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_points_update_own" ON user_points;
CREATE POLICY "user_points_update_own" ON user_points
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_points_insert_own" ON user_points;
CREATE POLICY "user_points_insert_own" ON user_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para tabela user_badges
DROP POLICY IF EXISTS "user_badges_select_own" ON user_badges;
CREATE POLICY "user_badges_select_own" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_badges_insert_own" ON user_badges;
CREATE POLICY "user_badges_insert_own" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para tabela courses (leitura pública para cursos publicados)
DROP POLICY IF EXISTS "courses_select_published" ON courses;
CREATE POLICY "courses_select_published" ON courses
  FOR SELECT USING (status = 'published' OR auth.uid() = instructor_id);

DROP POLICY IF EXISTS "courses_manage_own" ON courses;
CREATE POLICY "courses_manage_own" ON courses
  FOR ALL USING (auth.uid() = instructor_id);

-- Políticas para tabela user_courses
DROP POLICY IF EXISTS "user_courses_select_own" ON user_courses;
CREATE POLICY "user_courses_select_own" ON user_courses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_courses_insert_own" ON user_courses;
CREATE POLICY "user_courses_insert_own" ON user_courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_courses_update_own" ON user_courses;
CREATE POLICY "user_courses_update_own" ON user_courses
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para tabela lesson_progress
DROP POLICY IF EXISTS "lesson_progress_select_own" ON lesson_progress;
CREATE POLICY "lesson_progress_select_own" ON lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_manage_own" ON lesson_progress;
CREATE POLICY "lesson_progress_manage_own" ON lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para tabela missions (leitura pública)
DROP POLICY IF EXISTS "missions_select_all" ON missions;
CREATE POLICY "missions_select_all" ON missions
  FOR SELECT USING (true);

-- Políticas para tabela mission_progress
DROP POLICY IF EXISTS "mission_progress_select_own" ON mission_progress;
CREATE POLICY "mission_progress_select_own" ON mission_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mission_progress_manage_own" ON mission_progress;
CREATE POLICY "mission_progress_manage_own" ON mission_progress
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para tabela certificates
DROP POLICY IF EXISTS "certificates_select_own" ON certificates;
CREATE POLICY "certificates_select_own" ON certificates
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "certificates_insert_own" ON certificates;
CREATE POLICY "certificates_insert_own" ON certificates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para tabela gamification_activities
DROP POLICY IF EXISTS "gamification_activities_select_own" ON gamification_activities;
CREATE POLICY "gamification_activities_select_own" ON gamification_activities
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "gamification_activities_insert_own" ON gamification_activities;
CREATE POLICY "gamification_activities_insert_own" ON gamification_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para tabela points_history
DROP POLICY IF EXISTS "points_history_select_own" ON points_history;
CREATE POLICY "points_history_select_own" ON points_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "points_history_insert_own" ON points_history;
CREATE POLICY "points_history_insert_own" ON points_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para tabela exam_attempts
DROP POLICY IF EXISTS "exam_attempts_select_own" ON exam_attempts;
CREATE POLICY "exam_attempts_select_own" ON exam_attempts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "exam_attempts_insert_own" ON exam_attempts;
CREATE POLICY "exam_attempts_insert_own" ON exam_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas administrativas (para usuários com role admin)
-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas administrativas para todas as tabelas
DROP POLICY IF EXISTS "admin_full_access_users" ON users;
CREATE POLICY "admin_full_access_users" ON users
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_access_courses" ON courses;
CREATE POLICY "admin_full_access_courses" ON courses
  FOR ALL USING (is_admin());

-- Função para trigger de atualização de timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_points_updated_at ON user_points;
CREATE TRIGGER update_user_points_updated_at
    BEFORE UPDATE ON user_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON POLICY "users_select_own" ON users IS 'Usuários podem ver apenas seus próprios dados';
COMMENT ON POLICY "courses_select_published" ON courses IS 'Cursos publicados são visíveis para todos, instrutores veem seus próprios cursos';
COMMENT ON FUNCTION is_admin() IS 'Verifica se o usuário atual tem role de administrador';
