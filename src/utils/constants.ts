// Esquads Academy - Constantes da aplicaÃ§Ã£o

/**
 * Rotas da aplicaÃ§Ã£o
 */
export const ROUTES = {
  // PÃºblicas
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Estudante
  STUDENT_DASHBOARD: '/student',
  STUDENT_COURSES: '/student/courses',
  STUDENT_COURSE_DETAIL: '/student/courses/:id',
  STUDENT_LESSON: '/student/courses/:courseId/lessons/:lessonId',
  STUDENT_PROFILE: '/student/profile',
  STUDENT_ACHIEVEMENTS: '/student/achievements',
  STUDENT_LEADERBOARD: '/student/leaderboard',
  STUDENT_MISSIONS: '/student/missions',
  STUDENT_GAMIFICATION: '/student/gamification',
  STUDENT_PATHS: '/student/paths',
  STUDENT_PATH_DETAIL: '/student/paths/:id',
  STUDENT_CERTIFICATIONS: '/student/certifications',
  STUDENT_EXAM_ATTEMPT: '/student/certifications/:id',
  STUDENT_SOCIAL: '/student/social',
  
  // Instrutor
  INSTRUCTOR_DASHBOARD: '/instructor',
  INSTRUCTOR_COURSES: '/instructor/courses',
  INSTRUCTOR_COURSE_CREATE: '/instructor/courses/create',
  INSTRUCTOR_COURSE_EDIT: '/instructor/courses/:id/edit',
  INSTRUCTOR_COURSE_DETAIL: '/instructor/courses/:id',
  INSTRUCTOR_STUDENTS: '/instructor/students',
  INSTRUCTOR_ANALYTICS: '/instructor/analytics',
  INSTRUCTOR_PROFILE: '/instructor/profile',
  
  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_BADGES: '/admin/badges',
  ADMIN_ACHIEVEMENTS: '/admin/achievements',
  ADMIN_MISSIONS: '/admin/missions',
  ADMIN_PATHS: '/admin/paths',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_CERTIFICATIONS: '/admin/certifications'
} as const;

/**
 * Roles de usuÃ¡rio
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student'
} as const;

/**
 * NÃ­veis de dificuldade
 */
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
} as const;

/**
 * Status de curso
 */
export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const;

/**
 * Tipos de conteÃºdo de liÃ§Ã£o
 */
export const LESSON_CONTENT_TYPES = {
  VIDEO: 'video',
  TEXT: 'text',
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  INTERACTIVE: 'interactive'
} as const;

/**
 * Tipos de missÃ£o
 */
export const MISSION_TYPES = {
  COURSE_COMPLETION: 'course_completion',
  LESSON_COMPLETION: 'lesson_completion',
  POINTS_EARNED: 'points_earned',
  STREAK: 'streak',
  QUIZ_SCORE: 'quiz_score',
  TIME_SPENT: 'time_spent',
  TERMINAL_SCENARIO: 'terminal_scenario'
} as const;

export const MISSION_ENVIRONMENTS = {
  FIREWALL: 'firewall',
  INCIDENT_RESPONSE: 'incident_response',
  FORENSICS: 'forensics'
} as const;

export const MISSION_DELIVERY_MODES = {
  TERMINAL: 'terminal',
  CONFIG_PANEL: 'config_panel',
  HYBRID: 'hybrid'
} as const;

/**
 * Categorias de badge
 */
export const BADGE_CATEGORIES = {
  ACHIEVEMENT: 'achievement',
  PROGRESS: 'progress',
  SPECIAL: 'special',
  MILESTONE: 'milestone'
} as const;

/**
 * ConfiguraÃ§Ãµes de pontuaÃ§Ã£o
 */
export const POINTS_CONFIG = {
  LESSON_COMPLETION: 50,
  QUIZ_COMPLETION: 100,
  COURSE_COMPLETION: 500,
  DAILY_LOGIN: 10,
  STREAK_BONUS: 25,
  PERFECT_QUIZ: 150,
  FIRST_COURSE: 200,
  POINTS_PER_LEVEL: 1000
} as const;

/**
 * ConfiguraÃ§Ãµes de tempo
 */
export const TIME_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos em ms
  AUTO_SAVE_INTERVAL: 30 * 1000, // 30 segundos em ms
  PROGRESS_UPDATE_INTERVAL: 10 * 1000, // 10 segundos em ms
  NOTIFICATION_DURATION: 5000 // 5 segundos em ms
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
 * ConfiguraÃ§Ãµes de validaÃ§Ã£o
 */
export const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_COURSE_DURATION: 10080, // 7 dias em minutos
  MAX_POINTS: 10000
} as const;

/**
 * ConfiguraÃ§Ãµes de paginaÃ§Ã£o
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  COURSES_PER_PAGE: 12,
  STUDENTS_PER_PAGE: 25,
  LESSONS_PER_PAGE: 50
} as const;

/**
 * Cores do tema
 */
export const THEME_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#10B981',
  SUCCESS: '#22C55E',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#06B6D4'
} as const;

/**
 * ConfiguraÃ§Ãµes de notificaÃ§Ã£o
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

export const CERTIFICATION_DIFFICULTY = {
  PRACTITIONER: 'practitioner',
  ASSOCIATE: 'associate',
  PROFESSIONAL: 'professional',
  EXPERT: 'expert'
} as const;

export const DEFAULT_EXAM_LENGTHS = [20, 40, 60, 80];

/**
 * ConfiguraÃ§Ãµes de cache
 */
export const CACHE_CONFIG = {
  USER_DATA_TTL: 5 * 60 * 1000, // 5 minutos
  COURSE_DATA_TTL: 10 * 60 * 1000, // 10 minutos
  STATIC_DATA_TTL: 60 * 60 * 1000 // 1 hora
} as const;

/**
 * ConfiguraÃ§Ãµes de API
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 segundo
} as const;

/**
 * ConfiguraÃ§Ãµes de gamificaÃ§Ã£o
 */
export const GAMIFICATION_CONFIG = {
  DAILY_STREAK_BONUS: 25,
  WEEKLY_STREAK_BONUS: 100,
  MONTHLY_STREAK_BONUS: 500,
  PERFECT_SCORE_MULTIPLIER: 1.5,
  SPEED_BONUS_THRESHOLD: 0.8, // 80% do tempo esperado
  SPEED_BONUS_POINTS: 50
} as const;

/**
 * Mensagens padrÃ£o
 */
export const MESSAGES = {
  LOADING: 'Carregando...',
  ERROR_GENERIC: 'Ocorreu um erro inesperado',
  ERROR_NETWORK: 'Erro de conexÃ£o. Verifique sua internet',
  ERROR_UNAUTHORIZED: 'VocÃª nÃ£o tem permissÃ£o para esta aÃ§Ã£o',
  ERROR_NOT_FOUND: 'Recurso nÃ£o encontrado',
  SUCCESS_SAVE: 'Salvo com sucesso!',
  SUCCESS_DELETE: 'ExcluÃ­do com sucesso!',
  SUCCESS_UPDATE: 'Atualizado com sucesso!',
  CONFIRM_DELETE: 'Tem certeza que deseja excluir?',
  CONFIRM_LEAVE: 'Tem certeza que deseja sair? AlteraÃ§Ãµes nÃ£o salvas serÃ£o perdidas.'
} as const;

/**
 * ConfiguraÃ§Ãµes de SEO
 */
export const SEO_CONFIG = {
  DEFAULT_TITLE: 'Esquads Academy - Plataforma de Ensino',
  DEFAULT_DESCRIPTION: 'Aprenda com os melhores cursos online da Esquads Academy',
  DEFAULT_KEYWORDS: 'cursos online, educaÃ§Ã£o, aprendizado, esquads',
  SITE_NAME: 'Esquads Academy',
  SITE_URL: 'https://academy.esquads.com'
} as const;


