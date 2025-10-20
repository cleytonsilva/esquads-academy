// Tipos para o sistema de gamificação do Esquads

export enum DifficultyLevel {
  Basic = "BASIC",
  Intermediate = "INTERMEDIATE", 
  Advanced = "ADVANCED",
  Expert = "EXPERT",
  Easy = "EASY",
  Medium = "MEDIUM",
  Hard = "HARD"
}

export interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  lives_remaining: number;
  level: number;
  subscription_type: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

export enum UserPlanType {
  Free = 'free',
  Premium = 'premium'
}

export interface UserPlan {
  type: UserPlanType;
  features: {
    maxLives: number;
    unlimitedSimulations: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customCertifications: boolean;
  };
  limits: {
    dailySimulations: number;
    monthlySimulations: number;
  };
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  metadata: Record<string, any>;
  earned_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: string;
    value: number;
    description: string;
  };
}

export interface XPGain {
  amount: number;
  source: 'mission_complete' | 'simulation_complete' | 'streak_bonus' | 'daily_login';
  description: string;
}

export interface LifeSystem {
  current: number;
  max: number;
  regenTime: number; // em minutos
  lastUsed: string;
}

export interface LevelProgress {
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  totalXPForNextLevel: number;
  progress: number; // 0-100
}

export interface GameificationStats {
  totalMissions: number;
  completedMissions: number;
  totalSimulations: number;
  completedSimulations: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  totalTimeSpent: number; // em minutos
}

export interface Leaderboard {
  rank: number;
  user_id: string;
  name: string;
  total_xp: number;
  level: number;
  achievements_count: number;
}

// Constantes do sistema de gamificação
export const GAMIFICATION_CONSTANTS = {
  // Sistema de XP
  XP_PER_LEVEL: 1000,
  MISSION_BASE_XP: 100,
  SIMULATION_BASE_XP: 50,
  STREAK_MULTIPLIER: 1.5,
  DAILY_LOGIN_XP: 25,
  
  // Sistema de vidas
  MAX_LIVES_FREE: 5,
  MAX_LIVES_PREMIUM: 10,
  LIFE_REGEN_TIME: 30, // minutos
  
  // Badges e conquistas
  ACHIEVEMENT_TYPES: {
    FIRST_MISSION: 'first_mission',
    MISSION_STREAK: 'mission_streak',
    SIMULATION_MASTER: 'simulation_master',
    XP_MILESTONE: 'xp_milestone',
    PERFECT_SCORE: 'perfect_score',
    SPEED_DEMON: 'speed_demon',
    CERTIFICATION_EXPERT: 'certification_expert'
  },
  
  // Níveis de dificuldade
  DIFFICULTY_MULTIPLIERS: {
    beginner: 1.0,
    intermediate: 1.5,
    advanced: 2.0
  }
} as const;

export type AchievementType = keyof typeof GAMIFICATION_CONSTANTS.ACHIEVEMENT_TYPES;

// Enum para categorias de missões
export enum MissionCategory {
  Firewall = "FIREWALL",
  CloudSecurity = "CLOUD_SECURITY",
  Forensics = "FORENSICS",
  NetworkSecurity = "NETWORK_SECURITY",
  PenetrationTesting = "PENETRATION_TESTING",
  IncidentResponse = "INCIDENT_RESPONSE",
  VulnerabilityAssessment = "VULNERABILITY_ASSESSMENT"
}

// Comandos por categoria
export const COMMANDS_BY_CATEGORY = {
  FIREWALL: ['iptables', 'ufw', 'netstat', 'ss', 'nmap'],
  CLOUD_SECURITY: ['aws', 'kubectl', 'docker', 'terraform'],
  FORENSICS: ['volatility', 'autopsy', 'strings', 'hexdump'],
  NETWORK_SECURITY: ['wireshark', 'nmap', 'netcat', 'curl'],
  PENETRATION_TESTING: ['nmap', 'metasploit', 'burpsuite', 'sqlmap'],
  INCIDENT_RESPONSE: ['volatility', 'wireshark', 'tcpdump', 'grep'],
  VULNERABILITY_ASSESSMENT: ['nessus', 'openvas', 'nikto', 'dirb']
} as const;

// Interface para linha de output do terminal
export interface TerminalOutputLine {
  id: string;
  type: 'command' | 'output' | 'success' | 'error' | 'warning' | 'info' | 'system' | 'prompt';
  content: string;
  timestamp: Date;
}

// Interface para estado do terminal
export interface TerminalState {
  commandHistory: any[];
  output: TerminalOutputLine[];
  isExecuting: boolean;
  prompt: string;
  environmentVariables: Record<string, string>;
  theme: any;
}