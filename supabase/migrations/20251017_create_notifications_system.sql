-- ============================================================================
-- MIGRATION: Sistema de Notificações Inteligente - Esquads Academy
-- Data: 17 de Outubro de 2025
-- Descrição: Sistema centralizado de notificações com agrupamento e supressão
-- ============================================================================

-- Tabela principal de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT NOT NULL, -- 'xp', 'badge', 'mission', 'certificate', 'level', 'reputation', 'hint', 'feedback'
  priority TEXT NOT NULL DEFAULT 'normal', -- 'silent', 'toast', 'modal'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'unread', -- 'unread', 'read', 'suppressed', 'grouped'
  grouped_count INTEGER DEFAULT 1,
  parent_group_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  content_hash TEXT, -- Para detectar duplicatas
  expires_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('unread', 'read', 'suppressed', 'grouped')),
  CONSTRAINT valid_priority CHECK (priority IN ('silent', 'toast', 'modal')),
  CONSTRAINT valid_category CHECK (category IN ('xp', 'badge', 'mission', 'certificate', 'level', 'reputation', 'hint', 'feedback', 'exam', 'achievement', 'social', 'system'))
);

-- Índices para performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_content_hash ON notifications(content_hash);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_parent_group ON notifications(parent_group_id);

-- Tabela de preferências de notificações
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  priority_override TEXT, -- 'silent', 'toast', 'modal', null (usa padrão)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, category),
  CONSTRAINT valid_category_pref CHECK (category IN ('xp', 'badge', 'mission', 'certificate', 'level', 'reputation', 'hint', 'feedback', 'exam', 'achievement', 'social', 'system')),
  CONSTRAINT valid_priority_override CHECK (priority_override IS NULL OR priority_override IN ('silent', 'toast', 'modal'))
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Tabela de histórico de supressões
CREATE TABLE IF NOT EXISTS notification_suppressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  suppressed_count INTEGER DEFAULT 0,
  last_suppressed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reset_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, type, category)
);

CREATE INDEX idx_notification_suppressions_user_id ON notification_suppressions(user_id);
CREATE INDEX idx_notification_suppressions_reset_at ON notification_suppressions(reset_at);

-- Função para gerar hash de conteúdo
CREATE OR REPLACE FUNCTION generate_notification_hash(
  p_user_id UUID,
  p_type TEXT,
  p_category TEXT,
  p_payload JSONB
)
RETURNS TEXT AS $$
BEGIN
  RETURN md5(
    p_user_id::TEXT || '|' ||
    p_type || '|' ||
    p_category || '|' ||
    p_payload::TEXT
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para agrupar notificações similares
CREATE OR REPLACE FUNCTION group_similar_notifications(
  p_user_id UUID,
  p_category TEXT,
  p_time_window_minutes INTEGER DEFAULT 30
)
RETURNS TABLE(grouped_count BIGINT) AS $$
DECLARE
  v_group_id UUID;
  v_count BIGINT;
BEGIN
  -- Encontrar notificações similares recentes
  SELECT id INTO v_group_id
  FROM notifications
  WHERE user_id = p_user_id
    AND category = p_category
    AND status = 'unread'
    AND parent_group_id IS NULL
    AND created_at > now() - (p_time_window_minutes || ' minutes')::INTERVAL
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_group_id IS NOT NULL THEN
    -- Agrupar notificações subsequentes
    UPDATE notifications
    SET 
      status = 'grouped',
      parent_group_id = v_group_id
    WHERE user_id = p_user_id
      AND category = p_category
      AND status = 'unread'
      AND parent_group_id IS NULL
      AND id != v_group_id
      AND created_at > now() - (p_time_window_minutes || ' minutes')::INTERVAL;

    -- Atualizar contador no grupo pai
    UPDATE notifications
    SET grouped_count = (
      SELECT COUNT(*) 
      FROM notifications 
      WHERE parent_group_id = v_group_id OR id = v_group_id
    )
    WHERE id = v_group_id;

    GET DIAGNOSTICS v_count = ROW_COUNT;
  ELSE
    v_count := 0;
  END IF;

  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se deve suprimir notificação
CREATE OR REPLACE FUNCTION should_suppress_notification(
  p_user_id UUID,
  p_type TEXT,
  p_category TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_suppression RECORD;
BEGIN
  -- Verificar preferências do usuário
  IF EXISTS (
    SELECT 1 FROM notification_preferences
    WHERE user_id = p_user_id
      AND category = p_category
      AND enabled = false
  ) THEN
    RETURN true;
  END IF;

  -- Contar eventos recentes (últimos 2 minutos)
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
    AND type = p_type
    AND category = p_category
    AND created_at > now() - INTERVAL '2 minutes';

  -- Se mais de 3 eventos em 2 minutos, suprimir
  IF v_count >= 3 THEN
    -- Registrar supressão
    INSERT INTO notification_suppressions (user_id, type, category, suppressed_count, reset_at)
    VALUES (p_user_id, p_type, p_category, 1, now() + INTERVAL '10 minutes')
    ON CONFLICT (user_id, type, category) 
    DO UPDATE SET
      suppressed_count = notification_suppressions.suppressed_count + 1,
      last_suppressed_at = now(),
      reset_at = now() + INTERVAL '10 minutes';
    
    RETURN true;
  END IF;

  -- Verificar se está em período de supressão ativa
  SELECT * INTO v_suppression
  FROM notification_suppressions
  WHERE user_id = p_user_id
    AND type = p_type
    AND category = p_category
    AND reset_at > now();

  RETURN v_suppression IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar notificações antigas
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Deletar notificações lidas com mais de 30 dias
  DELETE FROM notifications
  WHERE status = 'read'
    AND read_at < now() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  -- Deletar notificações suprimidas com mais de 7 dias
  DELETE FROM notifications
  WHERE status = 'suppressed'
    AND created_at < now() - INTERVAL '7 days';

  -- Deletar notificações expiradas
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < now();

  -- Resetar supressões antigas
  DELETE FROM notification_suppressions
  WHERE reset_at < now() - INTERVAL '1 day';

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_suppressions ENABLE ROW LEVEL SECURITY;

-- Políticas para notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para notification_preferences
CREATE POLICY "Users can manage their preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Políticas para notification_suppressions
CREATE POLICY "Users can view their suppressions"
  ON notification_suppressions FOR SELECT
  USING (auth.uid() = user_id);

-- Seed de preferências padrão para usuários existentes
INSERT INTO notification_preferences (user_id, category, enabled, priority_override)
SELECT 
  id as user_id,
  unnest(ARRAY['xp', 'badge', 'mission', 'certificate', 'level', 'reputation', 'hint', 'feedback', 'exam', 'achievement', 'social', 'system']) as category,
  true as enabled,
  CASE unnest(ARRAY['xp', 'badge', 'mission', 'certificate', 'level', 'reputation', 'hint', 'feedback', 'exam', 'achievement', 'social', 'system'])
    WHEN 'xp' THEN 'silent'
    WHEN 'reputation' THEN 'silent'
    WHEN 'hint' THEN 'toast'
    WHEN 'feedback' THEN 'toast'
    WHEN 'badge' THEN 'toast'
    WHEN 'mission' THEN 'modal'
    WHEN 'certificate' THEN 'modal'
    WHEN 'level' THEN 'modal'
    WHEN 'achievement' THEN 'modal'
    WHEN 'exam' THEN 'toast'
    WHEN 'social' THEN 'toast'
    WHEN 'system' THEN 'toast'
    ELSE NULL
  END as priority_override
FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM notification_preferences)
ON CONFLICT (user_id, category) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE notifications IS 'Armazena todas as notificações do sistema com suporte a agrupamento e supressão inteligente';
COMMENT ON TABLE notification_preferences IS 'Preferências de notificação por categoria para cada usuário';
COMMENT ON TABLE notification_suppressions IS 'Registra supressões automáticas para evitar spam de notificações';
COMMENT ON FUNCTION group_similar_notifications IS 'Agrupa notificações similares dentro de uma janela de tempo';
COMMENT ON FUNCTION should_suppress_notification IS 'Verifica se uma notificação deve ser suprimida baseado em regras';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Remove notificações antigas e resets supressões expiradas';

-- Job agendado para limpeza (executar diariamente)
-- Nota: Isso precisa ser configurado no Supabase Dashboard em Database > Cron Jobs
-- SELECT cron.schedule('cleanup-notifications', '0 2 * * *', 'SELECT cleanup_old_notifications()');

-- Grant permissions
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notification_preferences TO authenticated;
GRANT SELECT ON notification_suppressions TO authenticated;

