-- Configuração de políticas RLS granulares para o sistema Esquads Unificado
-- Data: 2025-01-25
-- Descrição: Implementa políticas de segurança Row Level Security para todas as tabelas

-- ============================================================================
-- POLÍTICAS PARA TABELA CERTIFICATIONS
-- ============================================================================

-- Permitir leitura para todos os usuários autenticados
CREATE POLICY "certifications_read_policy" ON certifications
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir criação/edição apenas para admins e mission_architects
CREATE POLICY "certifications_write_policy" ON certifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'mission_architect')
    )
  );

-- ============================================================================
-- POLÍTICAS PARA TABELA MISSIONS
-- ============================================================================

-- Permitir leitura de missões aprovadas para todos os usuários autenticados
CREATE POLICY "missions_read_approved_policy" ON missions
  FOR SELECT USING (
    auth.role() = 'authenticated' AND status = 'approved'
  );

-- Permitir leitura de todas as missões para admins e mission_architects
CREATE POLICY "missions_read_all_policy" ON missions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'mission_architect')
    )
  );

-- Permitir criação para mission_architects e admins
CREATE POLICY "missions_create_policy" ON missions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'mission_architect')
    )
  );

-- Permitir edição apenas do próprio conteúdo ou para admins
CREATE POLICY "missions_update_policy" ON missions
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- POLÍTICAS PARA TABELA MISSION_ATTEMPTS
-- ============================================================================

-- Usuários podem ver apenas suas próprias tentativas
CREATE POLICY "mission_attempts_user_policy" ON mission_attempts
  FOR ALL USING (user_id = auth.uid());

-- Admins podem ver todas as tentativas
CREATE POLICY "mission_attempts_admin_policy" ON mission_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- POLÍTICAS PARA TABELA SIMULATION_QUESTIONS
-- ============================================================================

-- Permitir leitura de questões aprovadas para usuários autenticados
CREATE POLICY "simulation_questions_read_approved_policy" ON simulation_questions
  FOR SELECT USING (
    auth.role() = 'authenticated' AND status = 'approved'
  );

-- Permitir leitura de todas as questões para admins e mission_architects
CREATE POLICY "simulation_questions_read_all_policy" ON simulation_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'mission_architect')
    )
  );

-- Permitir criação para mission_architects e admins
CREATE POLICY "simulation_questions_create_policy" ON simulation_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'mission_architect')
    )
  );

-- Permitir edição apenas do próprio conteúdo ou para admins
CREATE POLICY "simulation_questions_update_policy" ON simulation_questions
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- POLÍTICAS PARA TABELA SIMULATION_SESSIONS
-- ============================================================================

-- Usuários podem ver apenas suas próprias sessões
CREATE POLICY "simulation_sessions_user_policy" ON simulation_sessions
  FOR ALL USING (user_id = auth.uid());

-- Admins podem ver todas as sessões
CREATE POLICY "simulation_sessions_admin_policy" ON simulation_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- POLÍTICAS PARA TABELA SESSION_ANSWERS
-- ============================================================================

-- Usuários podem ver apenas suas próprias respostas (através da sessão)
CREATE POLICY "session_answers_user_policy" ON session_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM simulation_sessions 
      WHERE simulation_sessions.id = session_answers.session_id 
      AND simulation_sessions.user_id = auth.uid()
    )
  );

-- Admins podem ver todas as respostas
CREATE POLICY "session_answers_admin_policy" ON session_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- POLÍTICAS PARA TABELA USER_PROGRESS
-- ============================================================================

-- Usuários podem ver apenas seu próprio progresso
CREATE POLICY "user_progress_user_policy" ON user_progress
  FOR ALL USING (user_id = auth.uid());

-- Admins podem ver todo o progresso
CREATE POLICY "user_progress_admin_policy" ON user_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- POLÍTICAS PARA TABELA USER_ACHIEVEMENTS
-- ============================================================================

-- Usuários podem ver apenas suas próprias conquistas
CREATE POLICY "user_achievements_user_policy" ON user_achievements
  FOR SELECT USING (user_id = auth.uid());

-- Admins podem ver todas as conquistas
CREATE POLICY "user_achievements_admin_policy" ON user_achievements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Sistema pode inserir conquistas
CREATE POLICY "user_achievements_system_policy" ON user_achievements
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- POLÍTICAS PARA TABELA CONTENT_APPROVAL
-- ============================================================================

-- Criadores podem ver aprovações de seu próprio conteúdo
CREATE POLICY "content_approval_creator_policy" ON content_approval
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = content_approval.content_id 
      AND missions.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM simulation_questions 
      WHERE simulation_questions.id = content_approval.content_id 
      AND simulation_questions.created_by = auth.uid()
    )
  );

-- Admins podem ver e gerenciar todas as aprovações
CREATE POLICY "content_approval_admin_policy" ON content_approval
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- POLÍTICAS PARA TABELA USERS (atualização)
-- ============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "users_read_own_policy" ON users;
DROP POLICY IF EXISTS "users_update_own_policy" ON users;
DROP POLICY IF EXISTS "users_admin_policy" ON users;

-- Usuários podem ver e editar apenas seu próprio perfil
CREATE POLICY "users_own_profile_policy" ON users
  FOR ALL USING (id = auth.uid());

-- Admins podem ver todos os usuários
CREATE POLICY "users_admin_read_policy" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- Admins podem editar outros usuários
CREATE POLICY "users_admin_update_policy" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- ============================================================================
-- CONCESSÃO DE PERMISSÕES PARA ROLES
-- ============================================================================

-- Conceder permissões básicas para role anon (usuários não autenticados)
GRANT SELECT ON certifications TO anon;

-- Conceder permissões para role authenticated (usuários autenticados)
GRANT ALL PRIVILEGES ON certifications TO authenticated;
GRANT ALL PRIVILEGES ON missions TO authenticated;
GRANT ALL PRIVILEGES ON mission_attempts TO authenticated;
GRANT ALL PRIVILEGES ON simulation_questions TO authenticated;
GRANT ALL PRIVILEGES ON simulation_sessions TO authenticated;
GRANT ALL PRIVILEGES ON session_answers TO authenticated;
GRANT ALL PRIVILEGES ON user_progress TO authenticated;
GRANT ALL PRIVILEGES ON user_achievements TO authenticated;
GRANT ALL PRIVILEGES ON content_approval TO authenticated;

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON POLICY "certifications_read_policy" ON certifications IS 
'Permite leitura de certificações para usuários autenticados';

COMMENT ON POLICY "missions_read_approved_policy" ON missions IS 
'Permite leitura apenas de missões aprovadas para usuários regulares';

COMMENT ON POLICY "mission_attempts_user_policy" ON mission_attempts IS 
'Usuários podem acessar apenas suas próprias tentativas de missão';

COMMENT ON POLICY "user_progress_user_policy" ON user_progress IS 
'Usuários podem acessar apenas seu próprio progresso';

COMMENT ON POLICY "content_approval_admin_policy" ON content_approval IS 
'Admins têm acesso total ao workflow de aprovação de conteúdo';
