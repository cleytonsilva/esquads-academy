/**
 * Tipos para Sistema de Certificações e Questões
 */

export interface QuestionOption {
  option_text: string
  is_correct: boolean
}

export interface CertificationQuestion {
  id: string
  certification: CertificationProvider
  topic: string
  difficulty: QuestionDifficulty
  question_text: string
  question_type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'fill_blank'
  options: QuestionOption[]
  correct_answer: string
  explanation: string
  status: QuestionStatus
  usage_count: number
  success_rate: number
  created_by: string
  approved_by?: string
  created_at: string
  updated_at: string
}

export type CertificationProvider = 
  | 'AWS' 
  | 'Azure' 
  | 'CompTIA' 
  | 'Oracle' 
  | 'Cisco' 
  | 'ISC2' 
  | 'EC-Council' 
  | 'ISACA'

export type QuestionDifficulty = 'easy' | 'medium' | 'hard'

export type QuestionStatus = 'draft' | 'pending_review' | 'approved' | 'archived'

export interface QuestionFormData {
  certification: CertificationProvider
  topic: string
  difficulty: QuestionDifficulty
  question_text: string
  options: QuestionOption[]
  correct_answer: string
  explanation: string
  status: QuestionStatus
}

export interface QuestionUploadResult {
  success: boolean
  questionsCreated: number
  questionsSkipped: number
  errors: string[]
  processingTime: number
}

export interface QuestionFilter {
  certification?: CertificationProvider
  topic?: string
  difficulty?: QuestionDifficulty
  status?: QuestionStatus
  searchTerm?: string
}

export interface QuestionStats {
  total: number
  byCertification: Record<CertificationProvider, number>
  byDifficulty: Record<QuestionDifficulty, number>
  byStatus: Record<QuestionStatus, number>
  averageSuccessRate: number
  mostUsedTopics: Array<{ topic: string; count: number }>
}

export interface SimulationConfig {
  certification: CertificationProvider
  questionCount: number
  difficulty: QuestionDifficulty
  topics: string[]
  timeLimit: number // em minutos
  mode: 'timed' | 'practice'
}

export interface SimulationSession {
  id: string
  userId: string
  config: SimulationConfig
  questions: CertificationQuestion[]
  answers: Record<string, string> // questionId -> answerId
  startTime: string
  endTime?: string
  score?: number
  status: 'active' | 'completed' | 'abandoned'
}

export interface SimulationResult {
  sessionId: string
  userId: string
  certification: CertificationProvider
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number // em minutos
  topicBreakdown: Array<{
    topic: string
    correct: number
    total: number
    percentage: number
  }>
  difficultyBreakdown: Array<{
    difficulty: QuestionDifficulty
    correct: number
    total: number
    percentage: number
  }>
  recommendations: string[]
  isPassing: boolean
  createdAt: string
}

export interface MissionAIInteraction {
  id: string
  user_id: string
  mission_id: string
  hint_level: 1 | 2 | 3
  user_input?: string
  ai_response: string
  was_helpful?: boolean
  created_at: string
}

export interface GeneratedSimulation {
  id: string
  certification: CertificationProvider
  difficulty: QuestionDifficulty
  question_count: number
  questions: string[] // Array de IDs das questões
  created_by: string
  created_at: string
  expires_at?: string
}

export interface SimulationAttempt {
  id: string
  user_id: string
  simulation_id: string
  answers: Record<string, string> // questionId -> answerId
  score?: number
  time_spent?: number // em segundos
  completed_at?: string
  started_at: string
}

export interface SimulationConfig {
  id: string
  certification: CertificationProvider
  name: string
  description?: string
  question_count: number
  time_limit?: number // em minutos
  passing_score: number
  difficulty_distribution: Record<QuestionDifficulty, number>
  topics: string[]
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface SocialShare {
  id: string
  user_id: string
  share_type: 'badge' | 'certificate' | 'achievement' | 'level_up' | 'simulation_score'
  content_id: string
  platform: 'twitter' | 'linkedin' | 'facebook' | 'whatsapp' | 'instagram'
  metadata?: Record<string, any>
  created_at: string
}

export interface CertificationTopic {
  name: string
  description: string
  weight: number // Peso na certificação (1-10)
  prerequisites?: string[]
}

export interface CertificationInfo {
  provider: CertificationProvider
  name: string
  description: string
  difficulty: QuestionDifficulty
  duration: number // em minutos
  passingScore: number // porcentagem
  topics: CertificationTopic[]
  prerequisites?: string[]
  isActive: boolean
}

// Constantes para certificações
export const CERTIFICATION_INFO: Record<CertificationProvider, CertificationInfo> = {
  AWS: {
    provider: 'AWS',
    name: 'AWS Cloud Practitioner',
    description: 'Fundamentos da AWS e serviços de nuvem básicos',
    difficulty: 'easy',
    duration: 90,
    passingScore: 70,
    topics: [
      { name: 'Cloud Concepts', description: 'Conceitos fundamentais de nuvem', weight: 8 },
      { name: 'Security', description: 'Segurança na AWS', weight: 7 },
      { name: 'Technology', description: 'Tecnologias AWS', weight: 6 },
      { name: 'Billing', description: 'Modelos de cobrança', weight: 4 }
    ],
    isActive: true
  },
  Azure: {
    provider: 'Azure',
    name: 'Azure Fundamentals',
    description: 'Conceitos fundamentais do Microsoft Azure',
    difficulty: 'easy',
    duration: 85,
    passingScore: 70,
    topics: [
      { name: 'Cloud Concepts', description: 'Conceitos de nuvem', weight: 7 },
      { name: 'Azure Services', description: 'Serviços do Azure', weight: 8 },
      { name: 'Security', description: 'Segurança no Azure', weight: 6 },
      { name: 'Pricing', description: 'Preços e suporte', weight: 4 }
    ],
    isActive: true
  },
  CompTIA: {
    provider: 'CompTIA',
    name: 'Security+',
    description: 'Fundamentos de segurança da informação',
    difficulty: 'medium',
    duration: 90,
    passingScore: 75,
    topics: [
      { name: 'Threats', description: 'Ameaças e vulnerabilidades', weight: 8 },
      { name: 'Architecture', description: 'Arquitetura e design', weight: 7 },
      { name: 'Operations', description: 'Operações e resposta', weight: 6 },
      { name: 'Governance', description: 'Governança e compliance', weight: 4 }
    ],
    isActive: true
  },
  Oracle: {
    provider: 'Oracle',
    name: 'Oracle Database Administrator',
    description: 'Administração de banco de dados Oracle',
    difficulty: 'hard',
    duration: 120,
    passingScore: 70,
    topics: [
      { name: 'Database Architecture', description: 'Arquitetura do banco', weight: 8 },
      { name: 'Security', description: 'Segurança do banco', weight: 7 },
      { name: 'Performance', description: 'Performance e tuning', weight: 6 },
      { name: 'Backup', description: 'Backup e recovery', weight: 5 }
    ],
    isActive: true
  },
  Cisco: {
    provider: 'Cisco',
    name: 'CCNA',
    description: 'Cisco Certified Network Associate',
    difficulty: 'medium',
    duration: 120,
    passingScore: 70,
    topics: [
      { name: 'Network Fundamentals', description: 'Fundamentos de rede', weight: 8 },
      { name: 'Security', description: 'Segurança de rede', weight: 7 },
      { name: 'Automation', description: 'Automação de rede', weight: 6 },
      { name: 'IP Services', description: 'Serviços IP', weight: 5 }
    ],
    isActive: true
  },
  ISC2: {
    provider: 'ISC2',
    name: 'CISSP',
    description: 'Certified Information Systems Security Professional',
    difficulty: 'hard',
    duration: 180,
    passingScore: 70,
    topics: [
      { name: 'Security Architecture', description: 'Arquitetura de segurança', weight: 8 },
      { name: 'Risk Management', description: 'Gestão de riscos', weight: 7 },
      { name: 'Cryptography', description: 'Criptografia', weight: 6 },
      { name: 'Operations', description: 'Operações de segurança', weight: 5 }
    ],
    isActive: true
  },
  'EC-Council': {
    provider: 'EC-Council',
    name: 'CEH',
    description: 'Certified Ethical Hacker',
    difficulty: 'medium',
    duration: 240,
    passingScore: 70,
    topics: [
      { name: 'Ethical Hacking', description: 'Hacking ético', weight: 8 },
      { name: 'Penetration Testing', description: 'Teste de penetração', weight: 7 },
      { name: 'Vulnerability Assessment', description: 'Avaliação de vulnerabilidades', weight: 6 },
      { name: 'Incident Response', description: 'Resposta a incidentes', weight: 5 }
    ],
    isActive: true
  },
  ISACA: {
    provider: 'ISACA',
    name: 'CISA',
    description: 'Certified Information Systems Auditor',
    difficulty: 'hard',
    duration: 240,
    passingScore: 70,
    topics: [
      { name: 'Audit Process', description: 'Processo de auditoria', weight: 8 },
      { name: 'Governance', description: 'Governança de TI', weight: 7 },
      { name: 'Risk Management', description: 'Gestão de riscos', weight: 6 },
      { name: 'Protection', description: 'Proteção de ativos', weight: 5 }
    ],
    isActive: true
  }
}
