-- Corrigir políticas RLS para administradores

-- Política para user_progress - permitir que usuários vejam seus próprios dados e admins vejam tudo
DROP POLICY IF EXISTS "user_progress_select_policy" ON user_progress;
CREATE POLICY "user_progress_select_policy" ON user_progress
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "user_progress_insert_policy" ON user_progress;
CREATE POLICY "user_progress_insert_policy" ON user_progress
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "user_progress_update_policy" ON user_progress;
CREATE POLICY "user_progress_update_policy" ON user_progress
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Política para missions - permitir leitura para todos autenticados, escrita para admins
DROP POLICY IF EXISTS "missions_select_policy" ON missions;
CREATE POLICY "missions_select_policy" ON missions
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "missions_insert_policy" ON missions;
CREATE POLICY "missions_insert_policy" ON missions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "missions_update_policy" ON missions;
CREATE POLICY "missions_update_policy" ON missions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Política para user_profiles - permitir que usuários vejam seus próprios dados e admins vejam tudo
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
CREATE POLICY "user_profiles_select_policy" ON user_profiles
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
CREATE POLICY "user_profiles_insert_policy" ON user_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;
CREATE POLICY "user_profiles_update_policy" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Política para system_notifications - permitir que usuários vejam suas notificações e admins vejam/criem todas
DROP POLICY IF EXISTS "system_notifications_select_policy" ON system_notifications;
CREATE POLICY "system_notifications_select_policy" ON system_notifications
  FOR SELECT USING (
    auth.uid() = user_id OR 
    user_id IS NULL OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "system_notifications_insert_policy" ON system_notifications;
CREATE POLICY "system_notifications_insert_policy" ON system_notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "system_notifications_update_policy" ON system_notifications;
CREATE POLICY "system_notifications_update_policy" ON system_notifications
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )