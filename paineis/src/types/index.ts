// ============================================================================
// TIPOS FUNDAMENTAIS DO SISTEMA DE GAMIFICAÇÃO ESQUADS
// ============================================================================

// ============================================================================
// ENUMS E CONSTANTES
// ============================================================================

export enum MissionCategory {
  Firewall = "FIREWALL",
  CloudSecurity = "CLOUD_SECURITY", 
  Forensics = "FORENSICS",
  NetworkSecurity = "NETWORK_SECURITY",
  PenetrationTesting = "PENETRATION_TESTING",
  IncidentResponse = "INCIDENT_RESPONSE",
  VulnerabilityAssessment = "VULNERABILITY_ASSESSMENT"
}

export enum DifficultyLevel {
  Basic = "BASIC",
  Intermediate = "INTERMEDIATE", 
  Advanced = "ADVANCED",
  Expert = "EXPERT"
}

export enum MissionStatus {
  NotStarted = "NOT_STARTED",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
  Locked = "LOCKED"
}

export enum CertificationProvider {
  AWS = "AWS",
  Azure = "AZURE",
  GCP = "GCP",
  CompTIA = "COMPTIA",
  Cisco = "CISCO",
  ISC2 = "ISC2",
  ECCOUNCIL = "ECCOUNCIL",
  ISACA = "ISACA"
}

export enum UserPlan {
  Free = "FREE",
  Pro = "PRO",
  Enterprise = "ENTERPRISE"
}

export enum BadgeType {
  Mission = "MISSION",
  Certification = "CERTIFICATION",
  Achievement = "ACHIEVEMENT",
  Special = "SPECIAL"
}

// ============================================================================
// INTERFACES DE MISSÕES
// ============================================================================

export interface Mission {
  id: string
  title: string
  description: string
  category: MissionCategory
  difficultyLevel: DifficultyLevel
  xpReward: number
  requiredBadge?: string
  isLocked: boolean
  badgeOnCompletion: string
  duration: number // em minutos
  tools: string[]
  prerequisites: string[]
  isPremium: boolean
  image?: string
  progress?: number
  status: MissionStatus
  createdAt: Date
  updatedAt: Date
}

export interface MissionProgress {
  missionId: string
  userId: string
  status: MissionStatus
  score: number
  timeSpent: number // em minutos
  xpEarned: number
  startedAt: Date
  completedAt?: Date
  attempts: number
  bestScore: number
}

export interface MissionObjective {
  id: string
  missionId: string
  title: string
  description: string
  isCompleted: boolean
  order: number
}

// ============================================================================
// INTERFACES DE CERTIFICAÇÕES
// ============================================================================

export interface CertificationExam {
  id: string
  provider: CertificationProvider
  title: string
  description: string
  questionCount: number
  difficultyLevel: DifficultyLevel
  duration: number // em minutos
  passPercentage: number
  questions: ExamQuestion[]
  xpReward: number
  isPremium: boolean
  topics: string[]
  prerequisites: string[]
  successRate: number
  icon: string
  createdAt: Date
  updatedAt: Date
}

export interface ExamQuestion {
  id: string
  examId: string
  text: string
  options: string[]
  correctAnswer: string
  explanation: string
  topic: string
  difficulty: DifficultyLevel
  order: number
  imageUrl?: string
  codeSnippet?: string
}

export interface ExamResult {
  id: string
  examId: string
  userId: string
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  score: number
  passPercentage: number
  completedAt: Date
  timeSpent: number // em minutos
  xpEarned: number
  performanceByTopic: Record<string, number>
  passed: boolean
  attempts: number
}

export interface ExamSession {
  id: string
  examId: string
  userId: string
  startedAt: Date
  currentQuestionIndex: number
  answers: Record<string, string>
  timeRemaining: number
  isCompleted: boolean
}

// ============================================================================
// INTERFACES DE USUÁRIO E PERFIL
// ============================================================================

export interface UserProfile {
  id: string
  username: string
  email: string
  totalXP: number
  currentLevel: number
  completedMissions: string[]
  badges: Badge[]
  lives: number
  maxLives: number
  currentPlan: UserPlan
  globalRanking: number
  createdAt: Date
  lastActiveAt: Date
  preferences: UserPreferences
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  type: BadgeType
  xpReward: number
  earnedAt?: Date
  isNew: boolean
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY"
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: "pt" | "en" | "es"
  notifications: {
    email: boolean
    push: boolean
    achievements: boolean
    ranking: boolean
  }
  difficulty: DifficultyLevel
  autoSave: boolean
}

export interface UserLevel {
  level: number
  xpRequired: number
  xpCurrent: number
  xpToNext: number
  title: string
  benefits: string[]
}

// ============================================================================
// INTERFACES DE RANKING E COMPETIÇÃO
// ============================================================================

export interface RankingEntry {
  userId: string
  username: string
  totalXP: number
  level: number
  badges: Badge[]
  completedMissions: number
  completedExams: number
  rank: number
  avatar?: string
  lastActiveAt: Date
}

export interface Leaderboard {
  id: string
  name: string
  type: "GLOBAL" | "MONTHLY" | "WEEKLY" | "CATEGORY"
  category?: MissionCategory
  entries: RankingEntry[]
  totalParticipants: number
  period: {
    start: Date
    end: Date
  }
  rewards: LeaderboardReward[]
}

export interface LeaderboardReward {
  rank: number
  xpReward: number
  badgeReward?: string
  title?: string
}

// ============================================================================
// INTERFACES DE GAMIFICAÇÃO
// ============================================================================

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  requirements: AchievementRequirement[]
  isSecret: boolean
  category: string
}

export interface AchievementRequirement {
  type: "MISSIONS_COMPLETED" | "EXAMS_PASSED" | "XP_EARNED" | "STREAK" | "PERFECT_SCORE"
  value: number
  category?: MissionCategory
  provider?: CertificationProvider
}

export interface Streak {
  userId: string
  currentStreak: number
  longestStreak: number
  lastActivityDate: Date
  streakType: "DAILY" | "WEEKLY"
}

export interface XPTransaction {
  id: string
  userId: string
  amount: number
  type: "MISSION_COMPLETION" | "EXAM_PASSED" | "BADGE_EARNED" | "ACHIEVEMENT" | "BONUS" | "PENALTY"
  source: string // ID da missão, exame, etc.
  description: string
  createdAt: Date
}

// ============================================================================
// INTERFACES DE CONFIGURAÇÃO E FILTROS
// ============================================================================

export interface MissionFilters {
  search: string
  category: MissionCategory | "all"
  difficulty: DifficultyLevel | "all"
  status: MissionStatus | "all"
  sortBy: "recommended" | "difficulty-asc" | "difficulty-desc" | "xp-asc" | "xp-desc" | "duration-asc" | "duration-desc"
  isPremium?: boolean
  hasPrerequisites?: boolean
}

export interface CertificationFilters {
  search: string
  provider: CertificationProvider | "all"
  difficulty: DifficultyLevel | "all"
  careerPath: string | "all"
  showPremiumOnly: boolean
  showFreeOnly: boolean
  hasPrerequisites: boolean
  sortBy: "recommended" | "difficulty" | "success-rate" | "duration"
}

export interface ExamConfig {
  difficulty: DifficultyLevel
  questionCount: number
  mode: "timed" | "practice" | "review"
  topicFocus: string | "all"
  timeLimit?: number
  showExplanations: boolean
  allowSkip: boolean
}

// ============================================================================
// INTERFACES DE RESPOSTA E ESTADO
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface LoadingState {
  isLoading: boolean
  error?: string
  progress?: number
}

// ============================================================================
// INTERFACES DE COMPONENTES
// ============================================================================

export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface MissionCardProps extends ComponentProps {
  mission: Mission
  userXP: number
  onStart?: (mission: Mission) => void
  onViewDetails?: (mission: Mission) => void
}

export interface CertificationCardProps extends ComponentProps {
  certification: CertificationExam
  onSelect?: (certification: CertificationExam) => void
  isSelected?: boolean
  userPlan: UserPlan
}

export interface UserRankingProps extends ComponentProps {
  userProfile: UserProfile
  globalRanking: RankingEntry[]
  showTop?: number
}

export interface UserLevelBadgeProps extends ComponentProps {
  userProfile: UserProfile
  showProgress?: boolean
}

// ============================================================================
// UTILITÁRIOS DE TIPO
// ============================================================================

export type MissionWithProgress = Mission & {
  progress: MissionProgress
}

export type CertificationWithResult = CertificationExam & {
  lastResult?: ExamResult
  attempts: number
}

export type UserProfileWithStats = UserProfile & {
  stats: {
    totalMissionsCompleted: number
    totalExamsPassed: number
    averageScore: number
    currentStreak: number
    longestStreak: number
  }
}

// ============================================================================
// CONSTANTES DE CONFIGURAÇÃO
// ============================================================================

export const XP_REWARDS = {
  MISSION_BASIC: 100,
  MISSION_INTERMEDIATE: 200,
  MISSION_ADVANCED: 350,
  MISSION_EXPERT: 500,
  EXAM_PASSED: 300,
  PERFECT_SCORE_BONUS: 50,
  STREAK_BONUS: 25,
  DAILY_LOGIN: 10
} as const

export const LEVEL_REQUIREMENTS = {
  1: 0,
  2: 500,
  3: 1000,
  4: 1500,
  5: 2000,
  6: 2500,
  7: 3000,
  8: 3500,
  9: 4000,
  10: 4500
} as const

export const DIFFICULTY_COLORS = {
  [DifficultyLevel.Basic]: "green",
  [DifficultyLevel.Intermediate]: "yellow", 
  [DifficultyLevel.Advanced]: "orange",
  [DifficultyLevel.Expert]: "red"
} as const

export const PROVIDER_COLORS = {
  [CertificationProvider.AWS]: "#FF9900",
  [CertificationProvider.Azure]: "#0078D4",
  [CertificationProvider.GCP]: "#4285F4",
  [CertificationProvider.CompTIA]: "#009639",
  [CertificationProvider.Cisco]: "#1BA1D9",
  [CertificationProvider.ISC2]: "#FF6B35",
  [CertificationProvider.ECCOUNCIL]: "#00A86B",
  [CertificationProvider.ISACA]: "#0066CC"
} as const
