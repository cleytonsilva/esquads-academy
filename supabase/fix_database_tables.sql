-- Script para aplicar migração das tabelas de notificações
-- Execute este script no SQL Editor do Supabase

-- Verificar se as tabelas já existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('system_notifications', 'user_notification_preferences', 'system_settings', 'security_settings');

-- Se as tabelas não existirem, criar:
CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  admin_only BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  user_registrations BOOLEAN DEFAULT true,
  system_alerts BOOLEAN DEFAULT true,
  maintenance_notices BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  registration_enabled BOOLEAN DEFAULT true,
  max_users INTEGER DEFAULT 1000,
  session_timeout INTEGER DEFAULT 30,
  backup_frequency VARCHAR(20) DEFAULT 'daily',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  password_min_length INTEGER DEFAULT 8,
  require_email_verification BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  login_attempts_limit INTEGER DEFAULT 5,
  lockout_duration INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_system_notifications_user_id ON system_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_system_notifications_read ON system_notifications(read);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

-- Habilitar RLS
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas
DROP POLICY IF EXISTS "Users can view own notifications" ON system_notifications;
CREATE POLICY "Users can view own notifications" ON system_notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON system_notifications;
CREATE POLICY "Users can update own notifications" ON system_notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON system_notifications;
CREATE POLICY "System can insert notifications" ON system_notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can manage own notification preferences" ON user_notification_preferences
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notification preferences" ON user_notification_preferences;
CREATE POLICY "System can insert notification preferences" ON user_notification_preferences
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can access system settings" ON system_settings;
CREATE POLICY "Admins can access system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can access security settings" ON security_settings;
CREATE POLICY "Admins can access security settings" ON security_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Inserir configurações padrão
INSERT INTO system_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
INSERT INTO security_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- Verificar se tudo foi criado corretamente
SELECT 'system_notifications' as table_name, count(*) as row_count FROM system_notifications
UNION ALL
SELECT 'user_notification_preferences' as table_name, count(*) as row_count FROM user_notification_preferences
UNION ALL
SELECT 'system_settings' as table_name, count(*) as row_count FROM system_settings
UNION ALL
SELECT 'security_settings' as table_name, count(*) as row_count FROM security_settings;
