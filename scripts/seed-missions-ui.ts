import 'dotenv/config'
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
  return { userId: signed!.user!.id as string, email }
}

async function main() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const admin = createClient(url!, serviceKey!)
  const { userId } = await ensureStudent('student.missions@esquads.com', 'Student123!')

  // Pick a mission without progress for this user
  const { data: missions, error: mErr } = await admin
    .from('missions')
    .select('id, title')
    .eq('is_active', true)
    .limit(5)
  if (mErr) throw mErr
  if (!missions || missions.length === 0) throw new Error('No missions found')

  // Find a mission with no progress
  let picked: any = null
  for (const m of missions) {
    const { data: prog } = await admin.from('mission_progress').select('id').eq('user_id', userId).eq('mission_id', m.id).maybeSingle()
    if (!prog?.id) { picked = m; break }
  }
  if (!picked) picked = missions[0]

  // Insert active progress
  const { data: inserted, error: iErr } = await admin.from('mission_progress').insert({
    user_id: userId,
    mission_id: picked.id,
    status: 'active',
    progress: 40,
  }).select('id').maybeSingle()
  if (iErr) throw iErr

  // Stats for manual check
  const { data: completed } = await admin
    .from('mission_progress')
    .select('id', { count: 'exact', head: false })
    .eq('user_id', userId)
    .eq('status', 'completed')
  const { data: active } = await admin
    .from('mission_progress')
    .select('id', { count: 'exact', head: false })
    .eq('user_id', userId)
    .eq('status', 'active')
  const usedIds = new Set<string>()
  const { data: myProg } = await admin
    .from('mission_progress')
    .select('mission_id')
    .eq('user_id', userId)
  for (const r of myProg as any[] || []) usedIds.add(r.mission_id)
  const { data: avail } = await admin
    .from('missions')
    .select('id', { count: 'exact', head: false })
    .eq('is_active', true)
  const availableCount = (avail as any[] || []).filter((r: any) => !usedIds.has(r.id)).length

  console.log('Seeded active mission for user:', userId)
  console.log('Manual check target counts =>', {
    active: (active as any[])?.length || 0,
    completed: (completed as any[])?.length || 0,
    available: availableCount,
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
