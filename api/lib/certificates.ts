import { createHash, randomUUID } from 'crypto'
import { supabaseAdmin } from './supabase.js'

export type GeneratePayload = {
  user_id: string
  course_id: string
  grade?: number | null
  hours_completed?: number | null
  skills_acquired?: string[]
}

export async function logFailure(stage: string, payload: any, err: any) {
  const errorMessage = (err && (err.message || String(err))) || 'unknown'
  const errorCode = err && (err.code || err.name) || 'UNKNOWN'
  try {
    await supabaseAdmin.from('certificate_failure_logs').insert({
      user_id: payload?.user_id || null,
      course_id: payload?.course_id || null,
      stage,
      error_message: errorMessage,
      error_code: String(errorCode),
      details: payload || {},
    })
  } catch {}
}

async function generateHash(userId: string, courseId: string): Promise<string> {
  const ts = new Date().toISOString()
  const base = `${userId}:${courseId}:${ts}:${randomUUID()}`
  return createHash('sha256').update(base).digest('hex')
}

export async function doGenerateCertificate(p: GeneratePayload) {
  if (!p?.user_id || !p?.course_id) throw new Error('Parâmetros obrigatórios ausentes')

  // Check if already exists to avoid duplicates
  const { data: existing } = await supabaseAdmin
    .from('certificates')
    .select('*')
    .eq('user_id', p.user_id)
    .eq('course_id', p.course_id)
    .limit(1)
  if (existing && existing.length) return existing[0]

  // Load course
  const { data: course, error: cErr } = await supabaseAdmin
    .from('courses')
    .select('id,title,instructor_id')
    .eq('id', p.course_id)
    .maybeSingle()
  if (cErr) { await logFailure('load_course', p, cErr); throw cErr }
  if (!course) { const e = new Error('Curso não encontrado'); await logFailure('load_course', p, e); throw e }

  // Load instructor name (optional)
  let instructorName: string | null = null
  if (course.instructor_id) {
    const { data: instr } = await supabaseAdmin.from('users').select('full_name').eq('id', course.instructor_id).maybeSingle()
    instructorName = instr?.full_name || null
  }

  // Load user
  const { data: user, error: uErr } = await supabaseAdmin
    .from('users')
    .select('id,full_name')
    .eq('id', p.user_id)
    .maybeSingle()
  if (uErr) { await logFailure('load_user', p, uErr); throw uErr }
  if (!user) { const e = new Error('Usuário não encontrado'); await logFailure('load_user', p, e); throw e }

  // Prepare fields
  const certificate_hash = await generateHash(p.user_id, p.course_id)
  const skills = Array.isArray(p.skills_acquired) ? p.skills_acquired.filter(Boolean) : []
  const grade = typeof p.grade === 'number' ? Math.max(0, Math.min(100, p.grade)) : null
  const hours = typeof p.hours_completed === 'number' ? Math.max(0, p.hours_completed) : null
  const verification_url = `/certificate/verify/${certificate_hash}`

  // Insert certificate
  const { data: cert, error: iErr } = await supabaseAdmin
    .from('certificates')
    .insert({
      user_id: p.user_id,
      course_id: p.course_id,
      course_title: course.title,
      instructor_name: instructorName,
      completion_date: new Date().toISOString(),
      certificate_hash,
      blockchain_verified: false,
      skills_acquired: skills,
      grade,
      hours_completed: hours,
      verification_url,
    })
    .select('*')
    .maybeSingle()
  if (iErr) { await logFailure('insert_certificate', p, iErr); throw iErr }
  return cert
}

