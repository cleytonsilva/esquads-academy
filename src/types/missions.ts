// src/types/missions.ts
export interface Mission {
  id: string;
  title: string;
  description?: string;
  objective?: string;
  type: 'daily' | 'weekly' | 'ai_generated' | 'contextual' | 'special';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'programming' | 'theory' | 'project' | 'challenge';
  points: number;
  experience_reward: number;
  time_limit?: number;
  max_attempts: number;
  prerequisites: string[];
  content?: MissionContent;
  validation_criteria?: ValidationCriteria;
  hints: string[];
  checkpoints: Checkpoint[];
  is_active: boolean;
  is_featured: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MissionContent {
  language?: string;
  template?: string;
  expected_output?: string;
  requirements?: string[];
  resources?: Resource[];
  examples?: Example[];
}

export interface ValidationCriteria {
  output_match?: string;
  output_contains?: string[];
  syntax_check?: boolean;
  variable_types?: string[];
  function_calls?: string[];
  custom_validation?: string;
}

export interface Checkpoint {
  id: number;
  title: string;
  description: string;
  validation?: ValidationCriteria;
  points?: number;
  is_completed?: boolean;
}

export interface Resource {
  type: 'link' | 'video' | 'document';
  title: string;
  url: string;
  description?: string;
}

export interface Example {
  title: string;
  code: string;
  explanation: string;
}

export interface MissionProgress {
  id: string;
  user_id: string;
  mission_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'abandoned';
  progress_percentage: number;
  current_checkpoint: number;
  attempts_used: number;
  hints_used: number;
  time_spent: number;
  code_submissions: CodeSubmission[];
  validation_results: ValidationResult[];
  started_at?: string;
  completed_at?: string;
  last_activity: string;
  created_at: string;
}

export interface CodeSubmission {
  timestamp: string;
  code: string;
  checkpoint_id?: number;
  is_successful: boolean;
  output?: string;
  errors?: string[];
}

export interface ValidationResult {
  timestamp: string;
  checkpoint_id?: number;
  is_valid: boolean;
  errors?: string[];
  output?: string;
  execution_time?: number;
  score?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatbotConversation {
  id: string;
  user_id: string;
  mission_id: string;
  messages: ChatMessage[];
  context: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MissionTerminalState {
  isOpen: boolean;
  currentMission: Mission | null;
  code: string;
  output: string;
  isRunning: boolean;
  errors: string[];
  currentCheckpoint: number;
  chatbotActive: boolean;
}

export interface MissionWithProgress extends Mission {
  mission_progress?: MissionProgress[];
}

export interface CodeValidationResult {
  isValid: boolean;
  errors: string[];
  output: string;
  executionTime: number;
  score: number;
  passedTests: number;
  totalTests: number;
}

export interface Hint {
  id: string;
  content: string;
  checkpoint_id?: number;
  cost: number;
  is_used: boolean;
  revealed_at?: string;
}

export interface MissionStats {
  totalMissions: number;
  completedMissions: number;
  activeMissions: number;
  totalPoints: number;
  averageScore: number;
  streakDays: number;
  timeSpent: number;
}