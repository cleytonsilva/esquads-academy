import 'dotenv/config'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import app from '../api/app.js'
import { createClient } from '@supabase/supabase-js'

async function ensureStudent(email: string, password: string) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !serviceKey) throw new Error('Missing Supabase envs')
  const admin = createClient(url, serviceKey)
  const anon = createClient(url, anonKey)
  let { data: signed, error: signErr } = await anon.auth.signInWithPassword({ email, password })
  if (signErr) {
    const { data: created, error } = await (admin as any).auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { role: 'student' } })
    if (error) throw error
    console.log('Created user', created.user?.id)
    const retry = await anon.auth.signInWithPassword({ email, password })
    signed = retry.data
    signErr = retry.error
    if (signErr) throw signErr
  }
  return { token: signed!.session!.access_token as string, userId: signed!.user!.id as string, email }
}

async function ensureMission() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing Supabase envs')
  const admin = createClient(url, serviceKey)
  const { data, error } = await admin.from('missions').insert({
    title: `Smoke Mission ${Date.now()}`,
    description: 'Smoke test mission',
    type: 'lesson_completion',
    difficulty: 'easy',
    is_required: false,
    objective: 'Complete the smoke mission',
    content: '<p>Try completing this mission.</p>'
  }).select('id').maybeSingle()
  if (error) throw error
  return (data as any).id as string
}

async function main() {
  const server = http.createServer(app)
  await new Promise<void>((resolve) => server.listen(0, resolve))
  const { port } = server.address() as AddressInfo
  const base = `http://127.0.0.1:${port}`
  console.log('Server started on', base)
  try {
    const { token, userId, email } = await ensureStudent('student.missions@esquads.com', 'Student123!')

    // Ensure user exists in app 'users' for any FKs
    {
      const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      const admin = createClient(url!, serviceKey!)
      const { data: exists } = await admin.from('users').select('id').eq('id', userId).maybeSingle()
      if (!exists?.id) {
        await admin.from('users').insert({ id: userId, full_name: email.split('@')[0], role: 'student' })
      }
    }

    const missionId = await ensureMission()
    // List missions
    const rList = await fetch(`${base}/api/missions`)
    const jList = await rList.json()
    console.log('List missions ok:', rList.ok, 'count:', (jList.missions || []).length)

    // Complete mission
    const rComplete = await fetch(`${base}/api/missions/${missionId}/complete`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const jComplete = await rComplete.json()
    if (!rComplete.ok) throw new Error(`complete failed: ${JSON.stringify(jComplete)}`)
    console.log('Mission completed response ok:', jComplete?.success)

    console.log('Missions smoke ok')
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
    console.log('Server closed')
  }
}

main().catch((e) => {
  console.error('Smoke missions failed', e)
  process.exit(1)
})
