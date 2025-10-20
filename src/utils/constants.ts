// Esquads Academy - Constantes da aplicação

/**
 * Rotas da aplicação - Estrutura Unificada Esquads
 */
export const ROUTES = {
  // Públicas
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Dashboard Unificado (ponto central de navegação)
  DASHBOARD: '/dashboard',
  STUDENT_DASHBOARD: '/student',
  
  // Hub de Missões Gamificadas
  MISSIONS: '/missions',
  MISSIONS_CATEGORY: '/missions/:category',
  MISSION_DETAIL: '/missions/:category/:id',
  MISSION_PLAY: '/missions/:category/:id/play',
  
  // Centro de Simulações para Certificações
  SIMULATIONS: '/simulations',
  SIMULATIONS_CERTIFICATION: '/simulations/:certification',
  SIMULATION_START: '/simulations/:certification/start',
  SIMULATION_SESSION: '/simulations/:certification/session/:sessionId',
  SIMULATION_RESULTS: '/simulations/:certification/results/:sessionId',
  
  // Perfil e Progresso
  PROFILE: '/profile',
  PROGRESS: '/progress',
  ACHIEVEMENTS: '/achievements',
  LEADERBOARD: '/leaderboard',
  
  // Certificações
  CERTIFICATIONS: '/certifications',
  CERTIFICATION_DETAIL: '/certifications/:id',
  
  // Social (mantido para compatibilidade)
  SOCIAL: '/social',
  
  // Painel Administrativo
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_CONTENT: '/admin/content',
  ADMIN_MISSIONS: '/admin/missions',
  ADMIN_MISSIONS_CREATE: '/admin/missions/create',
  ADMIN_MISSIONS_EDIT: '/admin/missions/:id/edit',
  ADMIN_QUESTIONS: '/admin/questions',
  ADMIN_QUESTIONS_CREATE: '/admin/questions/create',
  ADMIN_QUESTIONS_EDIT: '/admin/questions/:id/edit',
  ADMIN_SIMULATION_GENERATOR: '/admin/simulation-generator',
  ADMIN_APPROVAL: '/admin/approval',
  ADMIN_USERS: '/admin/users',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_BADGES: '/admin/badges',
  ADMIN_ACHIEVEMENTS: '/admin/achievements',
  ADMIN_PATHS: '/admin/paths',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_PROFILE: '/admin/profile',
  
  // Painel do Estudante
  STUDENT_COURSES: '/student/courses',
  STUDENT_MISSIONS: '/student/missions',
  STUDENT_SIMULATIONS: '/student/simulations',
  STUDENT_PATHS: '/student/paths',
  STUDENT_SOCIAL: '/student/social',
  STUDENT_ACHIEVEMENTS: '/student/achievements',
  STUDENT_LEADERBOARD: '/student/leaderboard',
  STUDENT_PROFILE: '/student/profile',
  
  // Rotas de desenvolvimento (temporárias)
  DEV_MISSIONS_TEST: '/dev/missions-test',
  
  // Rotas legadas (para migração gradual)
  LEGACY_STUDENT: '/student',
  LEGACY_INSTRUCTOR: '/instructor'
} as const;

/**
 * Roles de usuário - Estrutura Unificada
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  MISSION_ARCHITECT: 'mission_architect',
  INSTRUCTOR: 'instructor' // mantido para compatibilidade
} as const;

/**
 * Tipos de assinatura
 */
export const SUBSCRIPTION_TYPES = {
  FREE: 'free',
  PREMIUM: 'premium'
} as const;

/**
 * Tipos de missão
 */
export const MISSION_TYPES = {
  TERMINAL: 'terminal',
  WEB_INTERFACE: 'web_interface',
  CHAT_TEXTUAL: 'chat_textual'
} as const;

/**
 * Status de aprovação de conteúdo
 */
export const CONTENT_APPROVAL_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  REJECTED: 'rejected'
} as const;

/**
 * Tipos de certificação para banco de questões
 */
export const CERTIFICATION_PROVIDERS = {
  AWS: 'AWS',
  AZURE: 'Azure',
  COMPTIA: 'CompTIA',
  ORACLE: 'Oracle',
  CISCO: 'Cisco',
  ISC2: 'ISC2',
  ECCOUNCIL: 'EC-Council',
  ISACA: 'ISACA'
} as const;

/**
 * Certificações Disponíveis
 */
export const CERTIFICATIONS = {
  AWS_CLOUD_PRACTITIONER: 'aws-cloud-practitioner',
  AWS_SOLUTIONS_ARCHITECT: 'aws-solutions-architect',
  AZURE_FUNDAMENTALS: 'azure-fundamentals',
  AZURE_ADMINISTRATOR: 'azure-administrator',
  COMPTIA_SECURITY_PLUS: 'comptia-security-plus',
  COMPTIA_NETWORK_PLUS: 'comptia-network-plus'
} as const;

/**
 * Níveis de dificuldade
 */
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
} as const;

/**
 * Status de missão
 */
export const MISSION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  LOCKED: 'locked',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

/**
 * Status de tentativa de missão
 */
export const MISSION_ATTEMPT_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

/**
 * Status de sessão de simulação
 */
export const SIMULATION_SESSION_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed'
} as const;

/**
 * Tipos de conquista
 */
export const ACHIEVEMENT_TYPES = {
  MISSION_COMPLETION: 'mission_completion',
  SIMULATION_SCORE: 'simulation_score',
  STREAK: 'streak',
  XP_MILESTONE: 'xp_milestone',
  CERTIFICATION_PROGRESS: 'certification_progress'
} as const;

/**
 * Configurações de gamificação
 */
export const GAMIFICATION_CONFIG = {
  INITIAL_LIVES: 5,
  MAX_LIVES: 10,
  LIFE_REGENERATION_TIME: 30 * 60 * 1000, // 30 minutos em ms
  XP_PER_MISSION: 100,
  XP_PER_SIMULATION: 50,
  XP_BONUS_PERFECT_SCORE: 50,
  LEVELS: {
    NOVICE: { min: 0, max: 999 },
    APPRENTICE: { min: 1000, max: 2499 },
    PRACTITIONER: { min: 2500, max: 4999 },
    EXPERT: { min: 5000, max: 9999 },
    MASTER: { min: 10000, max: Infinity }
  }
} as const;

/**
 * Configurações de tempo
 */
export const TIME_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos em ms
  AUTO_SAVE_INTERVAL: 30 * 1000, // 30 segundos em ms
  PROGRESS_UPDATE_INTERVAL: 10 * 1000, // 10 segundos em ms
  NOTIFICATION_DURATION: 5000, // 5 segundos em ms
  SIMULATION_TIME_LIMIT: 90 * 60 * 1000 // 90 minutos em ms
} as const;

/**
 * Limites de arquivo
 */
export const FILE_LIMITS = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  VIDEO_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'application/msword']
} as const;

/**
 * Configurações de validação
 */
export const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_MISSION_STEPS: 20,
  MAX_SIMULATION_QUESTIONS: 100,
  MIN_SIMULATION_QUESTIONS: 10
} as const;

/**
 * Configurações de paginação
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MISSIONS_PER_PAGE: 12,
  QUESTIONS_PER_PAGE: 25,
  USERS_PER_PAGE: 25
} as const;

/**
 * Cores do tema - Estilo 8-bit/Terminal
 */
export const THEME_COLORS = {
  // Cores principais do terminal
  PRIMARY: '#00FF00', // Verde terminal clássico
  SECONDARY: '#00FFFF', // Ciano
  ACCENT: '#FFFF00', // Amarelo
  
  // Estados
  SUCCESS: '#00FF00',
  WARNING: '#FFFF00',
  ERROR: '#FF0000',
  INFO: '#00FFFF',
  
  // Fundo e texto
  BACKGROUND: '#000000',
  SURFACE: '#1A1A1A',
  TEXT_PRIMARY: '#00FF00',
  TEXT_SECONDARY: '#00FFFF',
  TEXT_MUTED: '#808080',
  
  // Bordas e elementos
  BORDER: '#333333',
  BORDER_ACTIVE: '#00FF00'
} as const;

/**
 * Configurações de notificação
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  XP_GAINED: 'xp_gained',
  LIFE_LOST: 'life_lost',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked'
} as const;

/**
 * Configurações de IA para geração de conteúdo
 */
export const AI_CONFIG = {
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.7,
  CONTENT_TYPES: {
    MISSION: 'mission',
    QUESTION: 'question',
    EXPLANATION: 'explanation'
  }
} as const;


