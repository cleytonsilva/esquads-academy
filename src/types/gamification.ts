// Esquads Academy - Tipos para Sistema de Gamificação

/**
 * Tipos de badge
 */
export type BadgeType = 'achievement' | 'progress' | 'special' | 'milestone';

/**
 * Tipos de missão
 */
export type MissionType = 
  | 'course_completion'
  | 'lesson_completion'
  | 'points_earned'
  | 'streak'
  | 'quiz_score'
  | 'quiz_completion'
  | 'daily_login'
  | 'time_spent'
  | 'daily'
  | 'weekly'
  | 'achievement'
  | 'challenge';

/**
 * Status de missão
 */
export type MissionStatus = 'active' | 'completed' | 'expired';

/**
 * Dificuldade de missão
 */
export type MissionDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Interface para Badge
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  icon_url?: string;
  type: BadgeType;
  points_required?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  category?: string;
  requirements?: any;
  created_at: string;
  updated_at: string;
}

/**
 * Interface para Badge do Usuário
 */
export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  name?: string;
  badge?: Badge;
}

/**
 * Interface para Missão
 */
export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  difficulty: MissionDifficulty;
  points_reward: number;
  badge_reward_id?: string;
  target_value: number;
  duration_days?: number;
  is_active?: boolean;
  is_daily?: boolean;
  is_weekly?: boolean;
  is_contextual?: boolean;
  is_ai_generated?: boolean;
  is_completed?: boolean;
  is_started?: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  badge_reward?: Badge;
}

/**
 * Interface para Missão do Usuário
 */
export interface UserMission {
  id: string;
  user_id: string;
  mission_id: string;
  status: MissionStatus;
  current_progress: number;
  current_value?: number;
  is_completed?: boolean;
  started_at: string;
  completed_at?: string;
  expires_at?: string;
  last_updated_at?: string;
  mission?: Mission;
}

/**
 * Interface para Pontos do Usuário
 */
export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  level: number;
  points_to_next_level: number;
  streak_days: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface para Histórico de Pontos
 */
export interface PointsHistory {
  id: string;
  user_id: string;
  points_earned: number;
  reason: string;
  source_type: 'lesson' | 'quiz' | 'course' | 'mission' | 'streak' | 'bonus' | 'badge';
  source_id?: string;
  created_at: string;
}

/**
 * Interface para Ranking
 */
export interface LeaderboardEntry {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  total_points: number;
  level: number;
  badges_count: number;
  position: number;
}

/**
 * Interface para Estatísticas de Gamificação
 */
export interface GamificationStats {
  total_points: number;
  current_level: number;
  points_to_next_level: number;
  badges_earned: number;
  missions_completed: number;
  current_streak: number;
  longest_streak: number;
  rank_position: number;
  total_users: number;
}

/**
 * Interface para Configuração de Níveis
 */
export interface LevelConfig {
  level: number;
  points_required: number;
  title: string;
  benefits: string[];
  badge_id?: string;
}

/**
 * Interface para Recompensa
 */
export interface Reward {
  type: 'points' | 'badge' | 'level_up';
  value: number;
  badge?: Badge;
  level?: number;
  message: string;
}

/**
 * Interface para Progresso de Missão
 */
export interface MissionProgress {
  mission_id: string;
  current_value: number;
  target_value: number;
  percentage: number;
  is_completed: boolean;
}

/**
 * Interface para Atividade de Gamificação
 */
export interface GamificationActivity {
  id: string;
  user_id: string;
  type: 'badge_earned' | 'mission_completed' | 'level_up' | 'streak_milestone';
  title: string;
  description: string;
  points_earned?: number;
  badge_id?: string;
  level?: number;
  created_at: string;
}
