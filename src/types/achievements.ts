// src/types/achievements.ts
export interface Achievement {
  id: string;
  name: string;
  description?: string;
  type: 'achievement' | 'progress' | 'special' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'learning' | 'social' | 'completion' | 'streak' | 'special';
  points: number;
  criteria?: AchievementCriteria;
  icon_url?: string;
  color_primary?: string;
  color_secondary?: string;
  unlock_message?: string;
  is_active: boolean;
  is_secret: boolean;
  unlock_order?: number;
  created_at: string;
  updated_at: string;
}

export interface AchievementCriteria {
  missions_completed?: number;
  points_earned?: number;
  streak_days?: number;
  forum_posts?: number;
  helpful_posts?: number;
  courses_completed?: number;
  certificates_earned?: number;
  level_reached?: number;
  custom_criteria?: Record<string, any>;
}

export interface UserBadge {
  id: string;
  user_id: string;
  achievement_id: string;
  progress_percentage: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  notification_sent: boolean;
  created_at: string;
  achievement?: Achievement;
}

export interface AchievementProgress {
  achievement: Achievement;
  userBadge?: UserBadge;
  progress: number;
  isUnlocked: boolean;
  canUnlock: boolean;
  nextMilestone?: number;
}

export interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  totalPoints: number;
  rarityBreakdown: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  categoryBreakdown: {
    learning: number;
    social: number;
    completion: number;
    streak: number;
    special: number;
  };
  recentUnlocks: UserBadge[];
}

export interface AchievementNotification {
  id: string;
  achievement: Achievement;
  type: 'unlocked' | 'progress' | 'milestone';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export const RARITY_COLORS = {
  common: {
    primary: '#10B981',
    secondary: '#D1FAE5',
    gradient: 'from-green-500 to-green-600'
  },
  rare: {
    primary: '#3B82F6',
    secondary: '#DBEAFE',
    gradient: 'from-blue-500 to-blue-600'
  },
  epic: {
    primary: '#8B5CF6',
    secondary: '#EDE9FE',
    gradient: 'from-purple-500 to-purple-600'
  },
  legendary: {
    primary: '#F59E0B',
    secondary: '#FEF3C7',
    gradient: 'from-yellow-500 to-orange-500'
  }
} as const;

export const ACHIEVEMENT_ICONS = {
  learning: 'BookOpen',
  social: 'Users',
  completion: 'CheckCircle',
  streak: 'Flame',
  special: 'Star'
} as const;