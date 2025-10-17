-- Migration: Create system notifications tables
-- Description: Creates tables for system notifications and user notification preferences

-- Create system_notifications table
CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('user_registered', 'user_updated', 'user_deleted', 'system_alert', 'maintenance')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  admin_only BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_notification_preferences table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_notifications_user_id ON system_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_system_notifications_type ON system_notifications(type);
CREATE INDEX IF NOT EXISTS idx_system_notifications_read ON system_notifications(read);
CREATE INDEX IF NOT EXISTS idx_system_notifications_created_at ON system_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_system_notifications_admin_only ON system_notifications(admin_only);

CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

-- Create RLS policies
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON system_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON system_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Admins can see all notifications
CREATE POLICY "Admins can view all notifications" ON system_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Policy: System can insert notifications
CREATE POLICY "System can insert notifications" ON system_notifications
  FOR INSERT WITH CHECK (true);

-- Policy: Users can view their own notification preferences
CREATE POLICY "Users can view own notification preferences" ON user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own notification preferences
CREATE POLICY "Users can update own notification preferences" ON user_notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Policy: System can insert notification preferences
CREATE POLICY "System can insert notification preferences" ON user_notification_preferences
  FOR INSERT WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_notifications_updated_at 
  BEFORE UPDATE ON system_notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_preferences_updated_at 
  BEFORE UPDATE ON user_notification_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create system_settings table for admin settings
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

-- Create security_settings table for admin settings
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

-- Enable RLS for settings tables
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can access settings
CREATE POLICY "Admins can access system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can access security settings" ON security_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Insert default settings
INSERT INTO system_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
INSERT INTO security_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- Create triggers for settings tables
CREATE TRIGGER update_system_settings_updated_at 
  BEFORE UPDATE ON system_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_settings_updated_at 
  BEFORE UPDATE ON security_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
