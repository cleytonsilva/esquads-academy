// Esquads Academy - Tipos para Sistema de Simulações
import type { Database } from './database';

// Tipos base do banco de dados
export type SimulationQuestion = Database['public']['Tables']['simulation_questions']['Row'];
export type SimulationSession = Database['public']['Tables']['simulation_sessions']['Row'];
export type SessionAnswer = Database['public']['Tables']['session_answers']['Row'];
export type Certification = Database['public']['Tables']['certifications']['Row'];

// Interfaces estendidas para o frontend
export interface SimulationQuestionWithDetails extends SimulationQuestion {
  certification?: Certification;
}

export interface SimulationSessionWithDetails extends SimulationSession {
  certification?: Certification;
  answers?: SessionAnswer[];
  questions?: SimulationQuestionWithDetails[];
}

export interface SessionAnswerWithQuestion extends SessionAnswer {
  question?: SimulationQuestionWithDetails;
}

// Interface para questão durante a simulação
export interface ActiveQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  certification_id: string;
  time_limit?: number; // em segundos
}

// Interface para resposta do usuário
export interface UserAnswer {
  question_id: string;
  selected_option: number;
  time_spent: number; // em segundos
  is_correct: boolean;
}

// Interface para progresso do usuário em simulação
export interface UserSimulationProgress {
  simulation_id: string;
  user_id: string;
  status: SimulationStatus;
  progressPercentage: number;
  currentStep?: number;
  totalSteps?: number;
  timeSpent: number; // em segundos
  lastAccessed: string;
  completedObjectives: string[];
  score?: number;
}

// Interface para estatísticas da sessão
export interface SessionStats {
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  score_percentage: number;
  time_spent: number; // em segundos
  time_remaining: number; // em segundos
  questions_by_difficulty: {
    beginner: { total: number; correct: number };
    intermediate: { total: number; correct: number };
    advanced: { total: number; correct: number };
  };
  topics_performance: Record<string, { total: number; correct: number }>;
}

// Interface para configuração de simulação
export interface SimulationConfig {
  certification_id: string;
  total_questions: number;
  time_limit: number; // em minutos
  passing_score: number; // porcentagem
  difficulty_distribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  randomize_questions: boolean;
  randomize_options: boolean;
  show_results_immediately: boolean;
}

// Interface para resultado da simulação
export interface SimulationResult {
  session_id: string;
  certification_id: string;
  certification_name: string;
  score_percentage: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  time_spent: number; // em segundos
  completed_at: string;
  detailed_results: {
    questions: Array<{
      question_id: string;
      question_text: string;
      user_answer: number;
      correct_answer: number;
      is_correct: boolean;
      explanation?: string;
      topic: string;
      difficulty: string;
      time_spent: number;
    }>;
    performance_by_topic: Record<string, {
      total: number;
      correct: number;
      percentage: number;
    }>;
    performance_by_difficulty: {
      beginner: { total: number; correct: number; percentage: number };
      intermediate: { total: number; correct: number; percentage: number };
      advanced: { total: number; correct: number; percentage: number };
    };
  };
  recommendations: string[];
  next_steps: string[];
}

// Interface para filtros de simulação
export interface SimulationFilters {
  certification?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  topic?: string;
  status?: 'not_started' | 'in_progress' | 'completed';
  search?: string;
}

// Interface para estatísticas do usuário em simulações
export interface UserSimulationStats {
  total_sessions: number;
  completed_sessions: number;
  average_score: number;
  best_score: number;
  total_time_spent: number; // em segundos
  certifications_attempted: number;
  certifications_passed: number;
  current_streak: number;
  longest_streak: number;
  performance_by_certification: Record<string, {
    attempts: number;
    best_score: number;
    average_score: number;
    passed: boolean;
    last_attempt: string;
  }>;
  recent_sessions: Array<{
    session_id: string;
    certification_name: string;
    score: number;
    passed: boolean;
    completed_at: string;
  }>;
}

// Interface para progresso em certificação
export interface CertificationProgress {
  certification_id: string;
  certification_name: string;
  description: string;
  total_questions_available: number;
  questions_practiced: number;
  average_score: number;
  best_score: number;
  attempts: number;
  passed: boolean;
  mastery_level: 'novice' | 'apprentice' | 'practitioner' | 'expert' | 'master';
  topics_progress: Record<string, {
    total_questions: number;
    practiced_questions: number;
    average_score: number;
    mastery_percentage: number;
  }>;
  recommended_study_time: number; // em horas
  estimated_readiness: number; // porcentagem
  weak_areas: string[];
  strong_areas: string[];
  next_milestone: {
    description: string;
    questions_needed: number;
    score_needed: number;
  };
}

// Constantes para simulações
export const SIMULATION_CONSTANTS = {
  // Configurações padrão
  DEFAULT_TIME_LIMIT: 90, // minutos
  DEFAULT_PASSING_SCORE: 70, // porcentagem
  DEFAULT_QUESTIONS_COUNT: 65,
  
  // Limites
  MIN_QUESTIONS: 10,
  MAX_QUESTIONS: 100,
  MIN_TIME_LIMIT: 30, // minutos
  MAX_TIME_LIMIT: 180, // minutos
  
  // Distribuição de dificuldade padrão
  DEFAULT_DIFFICULTY_DISTRIBUTION: {
    beginner: 30, // 30%
    intermediate: 50, // 50%
    advanced: 20, // 20%
  },
  
  // Pontuações para gamificação
  XP_REWARDS: {
    QUESTION_CORRECT: 10,
    QUESTION_INCORRECT: 2,
    SESSION_COMPLETED: 50,
    SESSION_PASSED: 100,
    PERFECT_SCORE: 200,
    FIRST_ATTEMPT_PASS: 150,
  },
  
  // Multiplicadores por dificuldade
  DIFFICULTY_MULTIPLIERS: {
    beginner: 1.0,
    intermediate: 1.5,
    advanced: 2.0,
  },
  
  // Níveis de maestria
  MASTERY_THRESHOLDS: {
    novice: 0,
    apprentice: 40,
    practitioner: 60,
    expert: 80,
    master: 95,
  },
  
  // Configurações de tempo
  AUTO_SAVE_INTERVAL: 30, // segundos
  WARNING_TIME_REMAINING: 300, // 5 minutos em segundos
  CRITICAL_TIME_REMAINING: 60, // 1 minuto em segundos
} as const;

// Enum para status de simulação
export enum SimulationStatus {
  NotStarted = 'not_started',
  Available = 'available',
  InProgress = 'in_progress',
  Completed = 'completed',
  Paused = 'paused'
}

// Tipos para status
export type QuestionDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type MasteryLevel = 'novice' | 'apprentice' | 'practitioner' | 'expert' | 'master';

// Enums para simulações
export enum SimulationType {
  IncidentResponse = 'incident_response',
  PenetrationTesting = 'penetration_testing',
  NetworkSecurity = 'network_security',
  Forensics = 'forensics',
  Malware = 'malware',
  CTF = 'ctf',
  Lab = 'lab',
  Scenario = 'scenario',
  Challenge = 'challenge',
  Team = 'team'
}

export enum SimulationDifficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
  Expert = 'expert'
}

export enum EnvironmentType {
  Virtual = 'virtual',
  Container = 'container',
  Cloud = 'cloud'
}

// Interface para simulação completa
export interface Simulation {
  id: string;
  title: string;
  description: string;
  type: SimulationType;
  difficulty: SimulationDifficulty;
  status: SimulationStatus;
  estimatedDuration: number; // em minutos
  maxScore: number;
  environment: EnvironmentType;
  isPremium?: boolean;
  scenario: {
    title: string;
    description: string;
    objectives: string[];
    tools: string[];
    timeLimit: number; // em minutos
    resources: Array<{
      name: string;
      description: string;
    }>;
  };
  tags: string[];
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}

// Interface para navegação entre questões
export interface QuestionNavigation {
  current_question: number;
  total_questions: number;
  can_go_back: boolean;
  can_go_forward: boolean;
  answered_questions: Set<number>;
  flagged_questions: Set<number>;
}

// Interface para timer da simulação
export interface SimulationTimer {
  total_time: number; // em segundos
  elapsed_time: number; // em segundos
  remaining_time: number; // em segundos
  is_running: boolean;
  is_warning: boolean; // quando restam 5 minutos
  is_critical: boolean; // quando resta 1 minuto
}

// Enum para temas do terminal
export enum TerminalTheme {
  Dark = 'dark',
  Light = 'light',
  Matrix = 'matrix',
  Hacker = 'hacker'
}

// Interface para comandos de simulação
export interface SimulationCommand {
  id: string;
  command: string;
  timestamp: Date;
  success: boolean;
  output: string;
  executionTime: number;
}