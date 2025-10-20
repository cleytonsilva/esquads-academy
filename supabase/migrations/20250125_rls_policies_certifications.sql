-- Migration: RLS Policies para Sistema de Certificações e Missões
-- Data: 2025-01-25
-- Descrição: Configura políticas de segurança para as novas tabelas

-- 1. Habilitar RLS nas novas tabelas
ALTER TABLE certification_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_configs ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para certification_questions
-- Admins podem fazer tudo
CREATE POLICY "Admins can manage certification questions" ON certification_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Students podem apenas visualizar questões aprovadas
CREATE POLICY "Students can view approved questions" ON certification_questions
  FOR SELECT USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'student'
    )
  );

-- 3. Políticas para mission_ai_interactions
-- Usuários podem ver apenas suas próprias interações
CREATE POLICY "Users can view own AI interactions" ON mission_ai_interactions
  FOR SELECT USING (user_id = auth.uid());

-- Usuários podem criar suas próprias interações
CREATE POLICY "Users can create own AI interactions" ON mission_ai_interactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins podem ver todas as interações
CREATE POLICY "Admins can view all AI interactions" ON mission_ai_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 4. Políticas para generated_simulations
-- Admins podem gerenciar simulados
CREATE POLICY "Admins can manage simulations" ON generated_simulations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Students podem visualizar simulados ativos
CREATE POLICY "Students can view active simulations" ON generated_simulations
  FOR SELECT USING (
    expires_at > NOW() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'student'
    )
  );

-- 5. Políticas para simulation_attempts
-- Usuários podem ver apenas suas próprias tentativas
CREATE POLICY "Users can view own simulation attempts" ON simulation_attempts
  FOR SELECT USING (user_id = auth.uid());

-- Usuários podem criar suas próprias tentativas
CREATE POLICY "Users can create own simulation attempts" ON simulation_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar suas próprias tentativas (para salvar progresso)
CREATE POLICY "Users can update own simulation attempts" ON simulation_attempts
  FOR UPDATE USING (user_id = auth.uid());

-- Admins podem ver todas as tentativas
CREATE POLICY "Admins can view all simulation attempts" ON simulation_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 6. Políticas para social_shares
-- Usuários podem ver apenas seus próprios compartilhamentos
CREATE POLICY "Users can view own social shares" ON social_shares
  FOR SELECT USING (user_id = auth.uid());

-- Usuários podem criar seus próprios compartilhamentos
CREATE POLICY "Users can create own social shares" ON social_shares
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Compartilhamentos públicos podem ser visualizados por todos (para verificação)
CREATE POLICY "Public shares are viewable by all" ON social_shares
  FOR SELECT USING (share_type IN ('certificate', 'achievement', 'level_up'));

-- Admins podem ver todos os compartilhamentos
CREATE POLICY "Admins can view all social shares" ON social_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 7. Políticas para simulation_configs
-- Admins podem gerenciar configurações
CREATE POLICY "Admins can manage simulation configs" ON simulation_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Students podem visualizar configurações ativas
CREATE POLICY "Students can view active simulation configs" ON simulation_configs
  FOR SELECT USING (
    is_active = TRUE AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'student'
    )
  );

-- 8. Políticas para missions (expandir existentes)
-- Garantir que admins podem gerenciar missões com novos campos
CREATE POLICY "Admins can manage missions with approval workflow" ON missions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Students podem ver apenas missões aprovadas e publicadas
CREATE POLICY "Students can view published missions" ON missions
  FOR SELECT USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'student'
    )
  );

-- 9. Políticas para certificates (expandir existentes)
-- Certificados podem ser visualizados publicamente para verificação
CREATE POLICY "Public certificates are viewable by all" ON certificates
  FOR SELECT USING (is_shareable = TRUE);

-- Usuários podem ver seus próprios certificados
CREATE POLICY "Users can view own certificates" ON certificates
  FOR SELECT USING (user_id = auth.uid());

-- Admins podem gerenciar todos os certificados
CREATE POLICY "Admins can manage all certificates" ON certificates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 10. Função auxiliar para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Função auxiliar para verificar se usuário é student
CREATE OR REPLACE FUNCTION is_student()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.role = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Comentários para documentação
COMMENT ON FUNCTION is_admin() IS 'Verifica se o usuário atual é um administrador';
COMMENT ON FUNCTION is_student() IS 'Verifica se o usuário atual é um estudante';
