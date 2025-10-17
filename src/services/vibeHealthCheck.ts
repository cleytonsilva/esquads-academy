import { supabase } from '@/integrations/supabase/client'
import { cache } from '@/utils/cache'
import { normalizeUserProfileData, safeArray } from '@/utils/vibeCheck'
import { RecommendationService } from './recommendationService'

export interface VibeHealthReport {
  timestamp: string
  supabase: {
    ok: boolean
    error?: string
    sampleCourseTitle?: string
  }
  cache: {
    size: number
    keys: string[]
  }
  recommendations: {
    ok: boolean
    count: number
    error?: string
  }
  normalization: {
    arraysSafe: boolean
    stringsSafe: boolean
  }
}

export async function runVibeCheckHealth(): Promise<VibeHealthReport> {
  const timestamp = new Date().toISOString()

  // Supabase connectivity and minimal query
  let supabaseOk = false
  let supabaseErr: string | undefined
  let sampleCourseTitle: string | undefined
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('title')
      .eq('is_published', true)
      .limit(1)

    if (error) throw error
    supabaseOk = true
    sampleCourseTitle = data?.[0]?.title
  } catch (err: any) {
    supabaseOk = false
    supabaseErr = err?.message || String(err)
  }

  // Cache stats
  const cacheStats = cache.getStats()

  // Recommendations fallback check
  let recOk = false
  let recCount = 0
  let recErr: string | undefined
  try {
    const recs = await RecommendationService.getPopularCourses(3)
    recOk = Array.isArray(recs)
    recCount = recs.length
  } catch (err: any) {
    recOk = false
    recErr = err?.message || String(err)
  }

  // Normalization check with null/undefined payload
  const raw = {
    id: 'test-user',
    email: null,
    full_name: undefined,
    learning_goals: null,
    preferred_categories: undefined,
    current_skills: [null, 'react', undefined],
    completed_courses: null,
    favorite_categories: undefined,
  }
  const normalized = normalizeUserProfileData(raw)
  const arraysSafe = [
    normalized.learning_goals,
    normalized.preferred_categories,
    normalized.current_skills,
    normalized.completed_courses,
    normalized.favorite_categories,
  ].every((arr) => Array.isArray(arr))
  const stringsSafe = typeof normalized.email === 'string' && typeof normalized.full_name === 'string'

  return {
    timestamp,
    supabase: {
      ok: supabaseOk,
      error: supabaseErr,
      sampleCourseTitle,
    },
    cache: {
      size: cacheStats.size,
      keys: cacheStats.keys,
    },
    recommendations: {
      ok: recOk,
      count: recCount,
      error: recErr,
    },
    normalization: {
      arraysSafe,
      stringsSafe,
    },
  }
}

export function logVibeHealthReport(report: VibeHealthReport) {
  console.group('🩺 VibeCheck Health Report')
  console.info('Timestamp:', report.timestamp)
  console.info('Supabase OK:', report.supabase.ok, '| Sample Title:', report.supabase.sampleCourseTitle)
  if (!report.supabase.ok && report.supabase.error) console.warn('Supabase Error:', report.supabase.error)
  console.info('Cache Size:', report.cache.size)
  console.info('Recommendations OK:', report.recommendations.ok, '| Count:', report.recommendations.count)
  if (!report.recommendations.ok && report.recommendations.error) console.warn('Recs Error:', report.recommendations.error)
  console.info('Normalization -> arrays:', report.normalization.arraysSafe, 'strings:', report.normalization.stringsSafe)
  console.groupEnd()
}