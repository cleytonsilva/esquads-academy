// src/types/notifications.ts
export interface Notification {
  id: string;
  user_id: string;
  type: 'achievement' | 'mission' | 'certificate' | 'system' | 'social';
  title: string;
  message?: string;
  data: Record<string, any>;
  is_read: boolean;
  is_important: boolean;
  expires_at?: string;
  created_at: string;
}

export interface NotificationData {
  achievement_id?: string;
  mission_id?: string;
  certificate_id?: string;
  points_earned?: number;
  level_reached?: number;
  streak_days?: number;
  url?: string;
  action?: string;
}

export interface NotificationPreferences {
  achievements: boolean;
  missions: boolean;
  certificates: boolean;
  system: boolean;
  social: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  important: number;
  byType: {
    achievement: number;
    mission: number;
    certificate: number;
    system: number;
    social: number;
  };
}