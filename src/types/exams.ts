/**
 * Tipos e Interfaces para o Sistema de Exames
 * Baseado na documentação técnica de Arquitetura_Tecnica_Missoes_Simulados.md
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum QuestionType {
  Scenario = 'scenario',
  Code = 'code',
  Multiple = 'multiple',
  TrueFalse = 'true_false',
  FillInTheBlank = 'fill_blank',
  DragAndDrop = 'drag_drop',
}

export enum ExamStatus {
  NotStarted = 'NOT_STARTED',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
  Paused = 'PAUSED',
  Expired = 'EXPIRED',
  Cancelled = 'CANCELLED',
}

export enum ExamDifficulty {
  Basic = 'BASIC',
  Intermediate = 'INTERMEDIATE',
  Advanced = 'ADVANCED',
  Expert = 'EXPERT',
}

export enum CertificationType {
  CompTIA = 'COMPTIA',
  CISSP = 'CISSP',
  CEH = 'CEH',
  OSCP = 'OSCP',
  CISM = 'CISM',
  CISA = 'CISA',
  Custom = 'CUSTOM',
}

// ============================================================================
// INTERFACES - EXAME
// ============================================================================

export interface Exam {
  id: string
  title: string
  code: string
  description: string
  certification: CertificationType
  difficulty: ExamDifficulty
  duration: number // em minutos
  totalQuestions: number
  passingScore: number // porcentagem mínima para passar
  maxAttempts: number
  isActive: boolean
  isPremium: boolean
  tags: string[]
  category: string
  instructions: string
  proctoring: ProctoringSettings
  timeSettings: TimeSettings
  questions: ExamQuestion[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ExamQuestion {
  id: string
  examId: string
  number: number
  type: QuestionType
  category: string
  difficulty: ExamDifficulty
  points: number
  timeLimit?: number // tempo limite específico para esta questão
  text: string
  scenario?: string
  code?: string
  image?: string
  options: QuestionOption[]
  explanation: string
  references: string[]
  tags: string[]
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface QuestionOption {
  id: string
  text: string
  description?: string
  isCorrect: boolean
  explanation?: string
  order: number
}

export interface ProctoringSettings {
  enabled: boolean
  webcamRequired: boolean
  screenRecording: boolean
  tabSwitchingAllowed: boolean
  copyPasteAllowed: boolean
  calculatorAllowed: boolean
  notesAllowed: boolean
  breakAllowed: boolean
  maxBreakTime?: number // em minutos
}

export interface TimeSettings {
  totalDuration: number // em minutos
  warningAt: number // avisar quando restarem X minutos
  autoSubmit: boolean
  showTimer: boolean
  allowPause: boolean
  maxPauseTime?: number // tempo máximo de pausa em minutos
}

// ============================================================================
// INTERFACES - TENTATIVA DE EXAME
// ============================================================================

export interface ExamAttempt {
  id: string
  examId: string
  userId: string
  attemptNumber: number
  status: ExamStatus
  startedAt: Date
  submittedAt?: Date
  completedAt?: Date
  timeSpent: number // em minutos
  score: number
  percentage: number
  passed: boolean
  answers: ExamAnswer[]
  analytics: ExamAnalytics
  proctoring: ProctoringData
  createdAt: Date
  updatedAt: Date
}

export interface ExamAnswer {
  questionId: string
  selectedOptions: string[] // IDs das opções selecionadas
  textAnswer?: string // para questões de texto livre
  timeSpent: number // tempo gasto nesta questão
  isCorrect: boolean
  pointsEarned: number
  answeredAt: Date
  flagged: boolean // marcada para revisão
}

export interface ExamAnalytics {
  totalQuestions: number
  questionsAnswered: number
  questionsCorrect: number
  questionsIncorrect: number
  questionsSkipped: number
  questionsFlagged: number
  averageTimePerQuestion: number
  categoryPerformance: CategoryPerformance[]
  difficultyPerformance: DifficultyPerformance[]
  timeDistribution: TimeDistribution
}

export interface CategoryPerformance {
  category: string
  totalQuestions: number
  correctAnswers: number
  percentage: number
  averageTime: number
}

export interface DifficultyPerformance {
  difficulty: ExamDifficulty
  totalQuestions: number
  correctAnswers: number
  percentage: number
  averageTime: number
}

export interface TimeDistribution {
  fastAnswers: number // < 30 segundos
  normalAnswers: number // 30s - 2min
  slowAnswers: number // > 2min
  averageTime: number
  totalTime: number
}

export interface ProctoringData {
  webcamSnapshots: string[] // URLs das capturas
  screenRecordings: string[] // URLs das gravações
  tabSwitches: TabSwitchEvent[]
  suspiciousActivity: SuspiciousActivity[]
  environmentCheck: EnvironmentCheck
}

export interface TabSwitchEvent {
  timestamp: Date
  fromTab: string
  toTab: string
  duration: number
}

export interface SuspiciousActivity {
  type: 'TAB_SWITCH' | 'COPY_PASTE' | 'RIGHT_CLICK' | 'KEYBOARD_SHORTCUT' | 'WINDOW_BLUR'
  timestamp: Date
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface EnvironmentCheck {
  browser: string
  os: string
  screenResolution: string
  webcamDetected: boolean
  microphoneDetected: boolean
  multipleMonitors: boolean
  timestamp: Date
}

// ============================================================================
// INTERFACES - COMPONENTES
// ============================================================================

export interface ExamCardProps {
  exam: Exam
  userAttempts?: ExamAttempt[]
  userPlan: string
  onStartExam?: (exam: Exam) => void
  onViewResults?: (exam: Exam) => void
  onUpgrade?: () => void
  showProgress?: boolean
}

export interface QuestionDisplayProps {
  question: ExamQuestion
  selectedAnswer?: string[]
  onAnswerSelect: (optionIds: string[]) => void
  onFlag: (questionId: string) => void
  isReviewMode?: boolean
  showExplanation?: boolean
  timeRemaining?: number
}

export interface ExamSidebarProps {
  questions: ExamQuestion[]
  answers: Record<string, ExamAnswer>
  currentQuestionIndex: number
  onQuestionSelect: (index: number) => void
  timeRemaining: number
  onSubmit: () => void
  onPause?: () => void
}

export interface ExamHeaderProps {
  exam: Exam
  attempt: ExamAttempt
  timeRemaining: number
  currentQuestion: number
  totalQuestions: number
  onSubmit: () => void
  onPause?: () => void
}

export interface ExamResultsProps {
  exam: Exam
  attempt: ExamAttempt
  onRetake?: () => void
  onViewCertificate?: () => void
  onBackToExams: () => void
}

// ============================================================================
// INTERFACES - FILTROS E CONFIGURAÇÃO
// ============================================================================

export interface ExamFilters {
  search: string
  certification: CertificationType | 'all'
  difficulty: ExamDifficulty | 'all'
  category: string | 'all'
  duration: 'short' | 'medium' | 'long' | 'all' // < 60min, 60-120min, > 120min
  showPremiumOnly: boolean
  showCompletedOnly: boolean
  showAvailableOnly: boolean
  tags: string[]
  sortBy: 'recommended' | 'difficulty' | 'duration' | 'newest' | 'popular' | 'passing_rate'
}

// ============================================================================
// INTERFACES - ADMIN
// ============================================================================

export interface ExamTemplate {
  id: string
  name: string
  description: string
  certification: CertificationType
  difficulty: ExamDifficulty
  estimatedDuration: number
  questionCategories: string[]
  defaultSettings: {
    passingScore: number
    maxAttempts: number
    proctoring: ProctoringSettings
    timeSettings: TimeSettings
  }
}

export interface ExamStatistics {
  examId: string
  totalAttempts: number
  uniqueUsers: number
  averageScore: number
  passingRate: number
  averageTime: number
  questionStatistics: QuestionStatistics[]
  categoryPerformance: CategoryPerformance[]
  difficultyDistribution: DifficultyPerformance[]
}

export interface QuestionStatistics {
  questionId: string
  totalAnswers: number
  correctAnswers: number
  averageTime: number
  difficultyRating: number
  flaggedCount: number
  skipCount: number
}

// ============================================================================
// INTERFACES - CERTIFICAÇÃO
// ============================================================================

export interface Certificate {
  id: string
  userId: string
  examId: string
  attemptId: string
  certificationType: CertificationType
  title: string
  score: number
  percentage: number
  issuedAt: Date
  expiresAt?: Date
  verificationCode: string
  isValid: boolean
  metadata: {
    examTitle: string
    examCode: string
    passingScore: number
    totalQuestions: number
  }
}

export interface CertificationPath {
  id: string
  name: string
  description: string
  certification: CertificationType
  requiredExams: string[]
  optionalExams: string[]
  prerequisites: string[]
  estimatedDuration: string
  difficulty: ExamDifficulty
  benefits: string[]
  careerPaths: string[]
}

// ============================================================================
// INTERFACES - GAMEPLAY
// ============================================================================

export interface ExamSession {
  attemptId: string
  currentQuestionIndex: number
  answers: Record<string, ExamAnswer>
  flaggedQuestions: string[]
  timeRemaining: number
  timeSpent: number
  isPaused: boolean
  pauseTimeRemaining?: number
  lastActivity: Date
  proctoring: {
    isActive: boolean
    webcamStream?: MediaStream
    screenRecording?: boolean
  }
}

export interface ExamNavigation {
  canGoNext: boolean
  canGoPrevious: boolean
  canSubmit: boolean
  canPause: boolean
  canFlag: boolean
  showReview: boolean
}

// ============================================================================
// TYPES AUXILIARES
// ============================================================================

export type ExamMode = 'practice' | 'timed' | 'review'
export type ExamLayout = 'single' | 'split' | 'fullscreen'
export type QuestionNavigationMode = 'linear' | 'free' | 'adaptive'

// ============================================================================
// INTERFACES - HOOKS
// ============================================================================

export interface UseExamReturn {
  exam: Exam | null
  attempt: ExamAttempt | null
  session: ExamSession | null
  isLoading: boolean
  error: string | null
  startExam: (examId: string) => Promise<void>
  submitAnswer: (questionId: string, answer: string[]) => Promise<void>
  flagQuestion: (questionId: string) => Promise<void>
  pauseExam: () => Promise<void>
  resumeExam: () => Promise<void>
  submitExam: () => Promise<void>
  navigateToQuestion: (index: number) => void
}

export interface UseExamTimerReturn {
  timeRemaining: number
  timeSpent: number
  isRunning: boolean
  isPaused: boolean
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  addTime: (minutes: number) => void
}