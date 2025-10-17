// VibeCheck Utilities — helpers para segurança nula, arrays e normalização
// Mantém consistência e evita TypeError em dados vindos de APIs/DB

export const safeArray = <T>(value: T[] | null | undefined): T[] => {
  return Array.isArray(value) ? value : []
}

export const hasItems = <T>(arr: T[] | null | undefined): boolean => {
  return Array.isArray(arr) && arr.length > 0
}

export const compact = <T>(arr: (T | null | undefined)[] | null | undefined): T[] => {
  return safeArray(arr as T[]).filter(Boolean) as T[]
}

export const uniq = <T>(arr: T[] | null | undefined): T[] => {
  return Array.from(new Set(safeArray(arr)))
}

export const safeJoin = (arr: Array<string | number> | null | undefined, sep: string = ','): string => {
  const a = safeArray(arr as Array<string | number>)
  return a.length ? a.join(sep) : ''
}

export const safeString = (v: string | null | undefined, fallback: string = ''): string => {
  return typeof v === 'string' ? v : fallback
}

export const safeNumber = (v: number | null | undefined, fallback: number = 0): number => {
  return typeof v === 'number' && !Number.isNaN(v) ? v : fallback
}

// Normalização de perfil do usuário (VibeCheck)
export interface NormalizedUserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  bio?: string
  learning_goals: string[]
  preferred_categories: string[]
  skill_level: 'beginner' | 'intermediate' | 'advanced'
  timezone?: string
  language?: string
  notification_preferences?: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  current_skills: string[]
  desired_skills: string[]
  experience_level?: string
  available_time_hours?: number
  budget_range?: number
  preferred_difficulty?: string
  career_stage?: string
  industry_experience_years?: number
  certification_goals?: boolean
  project_based_learning?: boolean
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  created_at: string
  updated_at: string
  interests: string[]
  preferred_duration: 'short' | 'medium' | 'long'
  completed_courses: string[]
  current_courses: string[]
  favorite_categories: string[]
  time_availability: 'low' | 'medium' | 'high'
}

export function normalizeUserProfileData(data: any): NormalizedUserProfile {
  return {
    id: data?.id || data?.user_id || '',
    email: safeString(data?.email),
    full_name: safeString(data?.full_name),
    avatar_url: data?.avatar_url,
    bio: data?.bio,
    learning_goals: safeArray(data?.learning_goals),
    preferred_categories: safeArray(data?.preferred_categories),
    skill_level: (data?.skill_level || 'beginner') as NormalizedUserProfile['skill_level'],
    timezone: data?.timezone,
    language: data?.language,
    notification_preferences: data?.notification_preferences,
    current_skills: safeArray(data?.current_skills),
    desired_skills: safeArray(data?.desired_skills),
    experience_level: data?.experience_level,
    available_time_hours: (typeof data?.available_time_hours === 'number' && !Number.isNaN(data?.available_time_hours)) ? data.available_time_hours : undefined,
    budget_range: (typeof data?.budget_range === 'number' && !Number.isNaN(data?.budget_range)) ? data.budget_range : undefined,
    preferred_difficulty: data?.preferred_difficulty,
    career_stage: data?.career_stage,
    industry_experience_years: (typeof data?.industry_experience_years === 'number' && !Number.isNaN(data?.industry_experience_years)) ? data.industry_experience_years : undefined,
    certification_goals: data?.certification_goals,
    project_based_learning: data?.project_based_learning,
    learning_style: (data?.learning_style || 'visual') as NormalizedUserProfile['learning_style'],
    created_at: safeString(data?.created_at, new Date().toISOString()),
    updated_at: safeString(data?.updated_at, new Date().toISOString()),
    interests: safeArray(data?.interests),
    preferred_duration: (data?.preferred_duration || 'medium') as NormalizedUserProfile['preferred_duration'],
    completed_courses: safeArray(data?.completed_courses),
    current_courses: safeArray(data?.current_courses),
    favorite_categories: safeArray(data?.favorite_categories),
    time_availability: (data?.time_availability || 'medium') as NormalizedUserProfile['time_availability'],
  }
}

// Helpers de avaliação
export const clamp01 = (n: number): number => {
  return Math.max(0, Math.min(1, n))
}