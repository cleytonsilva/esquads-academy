export interface Mission {
  id: string;
  title: string;
  description: string;
  certification_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  estimated_time: number; // em minutos
  prerequisites?: string[];
  topics: string[];
  content: MissionContent;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MissionContent {
  type: 'scenario' | 'challenge' | 'lab' | 'quiz';
  scenario?: {
    background: string;
    objective: string;
    constraints?: string[];
    resources?: string[];
  };
  questions?: MissionQuestion[];
  steps?: MissionStep[];
  validation?: {
    criteria: string[];
    automated_checks?: string[];
  };
}

export interface MissionQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'drag_drop' | 'code_input' | 'scenario_based';
  question: string;
  options?: string[];
  correct_answer: string | string[];
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MissionStep {
  id: string;
  title: string;
  description: string;
  type: 'instruction' | 'action' | 'verification';
  content: string;
  hints?: string[];
  validation?: {
    type: 'manual' | 'automated';
    criteria: string[];
  };
}

export interface MissionAttempt {
  id: string;
  user_id: string;
  mission_id: string;
  status: 'in_progress' | 'completed' | 'failed' | 'abandoned';
  score: number;
  max_score: number;
  time_spent: number; // em segundos
  answers: Record<string, any>;
  feedback?: string;
  started_at: string;
  completed_at?: string;
  lives_used: number;
}

export interface MissionProgress {
  mission_id: string;
  user_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'locked';
  best_score: number;
  attempts_count: number;
  last_attempt_at?: string;
  completion_percentage: number;
  time_spent_total: number;
}

export interface MissionCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  certification_id: string;
  missions_count: number;
  completed_missions: number;
  total_xp: number;
  earned_xp: number;
}

export interface MissionFilters {
  certification?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'not_started' | 'in_progress' | 'completed';
  topics?: string[];
  search?: string;
}

export interface MissionStats {
  total_missions: number;
  completed_missions: number;
  in_progress_missions: number;
  total_xp_available: number;
  total_xp_earned: number;
  average_score: number;
  completion_rate: number;
  time_spent_total: number;
  favorite_topics: string[];
  difficulty_breakdown: {
    easy: { completed: number; total: number };
    medium: { completed: number; total: number };
    hard: { completed: number; total: number };
  };
}

// Constantes para missões
export const MISSION_CONSTANTS = {
  DIFFICULTY_MULTIPLIERS: {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0
  },
  BASE_XP_REWARDS: {
    easy: 50,
    medium: 100,
    hard: 200
  },
  COMPLETION_THRESHOLDS: {
    bronze: 60,
    silver: 80,
    gold: 95
  },
  MAX_ATTEMPTS_FREE: 3,
  MAX_ATTEMPTS_PREMIUM: 10,
  LIFE_COST_PER_ATTEMPT: 1
} as const;

export type MissionDifficulty = keyof typeof MISSION_CONSTANTS.DIFFICULTY_MULTIPLIERS;
export type CompletionLevel = keyof typeof MISSION_CONSTANTS.COMPLETION_THRESHOLDS;