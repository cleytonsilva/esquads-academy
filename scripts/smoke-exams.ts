import 'dotenv/config'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import app from '../api/app.js'
import { createClient } from '@supabase/supabase-js'

async function ensureUser(email: string, password: string) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !serviceKey) throw new Error('Missing Supabase envs')
  const admin = createClient(url, serviceKey)
  const anon = createClient(url, anonKey)
  try {
    // Try sign-in first
    let { data: signed, error: signErr } = await anon.auth.signInWithPassword({ email, password })
    if (signErr) {
      // Create and try again
      const { data: created, error } = await (admin as any).auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { role: 'student' } })
      if (error) throw error
      console.log('Created user', created.user?.id)
      const retry = await anon.auth.signInWithPassword({ email, password })
      signed = retry.data
      signErr = retry.error
      if (signErr) throw signErr
    }
    return {
      token: signed!.session!.access_token as string,
      userId: signed!.user!.id as string,
      email,
    }
  } catch (e) {
    console.error('ensureUser failed', e)
    throw e
  }
}

async function ensureExam() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing Supabase envs')
  const admin = createClient(url, serviceKey)
  // fetch any course or create a minimal one
  let courseId: string | null = null
  {
    const { data: c } = await admin.from('courses').select('id').limit(1)
    if (Array.isArray(c) && c[0]?.id) courseId = c[0].id as any
  }
  if (!courseId) {
    const { data: created, error: cErr } = await admin.from('courses').insert({
      title: `Smoke Course ${Date.now()}`,
      description: 'Temporary course for smoke test',
      status: 'draft',
      difficulty: 'beginner',
      is_free: true,
      estimated_duration: 0,
      points_reward: 0,
      price: 0,
      tags: [],
    }).select('id').maybeSingle()
    if (cErr) throw cErr
    courseId = (created as any).id
  }
  const title = `Smoke Exam ${Date.now()}`
  const payload: any = {
    title,
    description: 'Smoke test exam',
    questions: [
      { q: '2 + 2 = ?', type: 'multiple_choice', options: ['4', '3', '5'], answer: '4' },
      { q: '3 + 1 = ?', type: 'multiple_choice', options: ['1', '4', '0'], answer: '4' },
    ],
    passing_score: 50,
    time_limit: 10,
    max_attempts: 3,
    course_id: courseId,
  }
  const { data, error } = await admin.from('exams').insert(payload).select('*').maybeSingle()
  if (error) throw error
  return (data as any).id as string
}

async function main() {
  // Boot express locally
  const server = http.createServer(app)
  await new Promise<void>((resolve) => server.listen(0, resolve))
  const { port } = server.address() as AddressInfo
  const base = `http://127.0.0.1:${port}`
  console.log('Server started on', base)

  try {
    // Ensure test data
    const { token, userId, email } = await ensureUser('student.smoke@esquads.com', 'Student123!')
    const examId = await ensureExam()

    // Ensure user exists in app 'users' table for FK
    {
      const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      const admin = createClient(url!, serviceKey!)
      const { data: exists } = await admin.from('users').select('id').eq('id', userId).maybeSingle()
      if (!exists?.id) {
        await admin.from('users').insert({ id: userId, full_name: email.split('@')[0], role: 'student' })
      }
    }

    // List exams
    const rList = await fetch(`${base}/api/exams`)
    const jList = await rList.json()
    console.log('List exams ok:', rList.ok, 'count:', (jList.exams || []).length)

    // Fetch exam details (debug)
    const rExam = await fetch(`${base}/api/exams/${examId}`)
    const jExam = await rExam.json()
    console.log('Exam questions example:', jExam?.exam?.questions?.[0])
    // Local compute expected score for sanity
    if (Array.isArray(jExam?.exam?.questions)) {
      const qs = jExam.exam.questions as any[]
      let total = 0, correct = 0
      for (let i = 0; i < qs.length; i += 1) {
        const q = qs[i]
        const key = q.key || q.id || `q${i}`
        if (typeof q.answer !== 'undefined') {
          total += 1
          const userAns = (i === 0 || i === 1) ? '4' : undefined
          if (typeof userAns !== 'undefined' && String(userAns).trim() === String(q.answer).trim()) {
            correct += 1
          }
        }
      }
      const expected = total > 0 ? Math.round((correct / total) * 100) : 0
      console.log('Local expected score:', expected)
    }

    // Start attempt
    const rStart = await fetch(`${base}/api/exams/${examId}/attempts`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
    const jStart = await rStart.json()
    if (!rStart.ok) throw new Error(`start failed: ${JSON.stringify(jStart)}`)
    const attemptId = jStart.attempt?.id
    console.log('Attempt started:', attemptId)

    // Submit attempt (all correct)
    const q0 = jExam?.exam?.questions?.[0]?.q || '2 + 2 = ?'
    const q1 = jExam?.exam?.questions?.[1]?.q || '3 + 1 = ?'
    const answers: Record<string,string> = { [q0]: '4', [q1]: '4' }
    const rSubmit = await fetch(`${base}/api/exams/attempts/${attemptId}/submit`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ answers }) })
    const jSubmit = await rSubmit.json()
    if (!rSubmit.ok) throw new Error(`submit failed: ${JSON.stringify(jSubmit)}`)
    console.log('Submitted score:', jSubmit?.attempt?.score, 'answers saved:', jSubmit?.attempt?.answers)

    // My attempts
    const rMine = await fetch(`${base}/api/exams/attempts/my`, { headers: { Authorization: `Bearer ${token}` } })
    const jMine = await rMine.json()
    if (!rMine.ok) throw new Error(`mine failed: ${JSON.stringify(jMine)}`)
    console.log('My attempts count:', (jMine.attempts || []).length)
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
    console.log('Server closed')
  }
}

main().catch((e) => {
  console.error('Smoke failed', e)
  process.exit(1)
})
