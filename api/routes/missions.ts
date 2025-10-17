import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

// List missions (optionally by course)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = (req.query.course_id as string) || undefined
    let q = supabaseAdmin.from('missions').select('*').order('created_at', { ascending: false })
    if (courseId) q = q.eq('course_id', courseId as any)
    const { data, error } = await q
    if (error) { res.status(500).json({ success: false, error: error.message }); return }
    res.json({ success: true, missions: data || [] })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Admin: create mission (optionally linked to course), with AI generation support
router.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const p = req.body || {}
    // If p.generate_with_ai, create content from Edge Function
    let content = p.content || null
    if (!content && p.generate_with_ai) {
      try {
        const body = { prompt: p.title || 'Missão', context: { courseId: p.course_id, objective: p.objective } }
        const r = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/ai_generate_lesson_content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}` },
          body: JSON.stringify(body)
        })
        const j: any = await r.json()
        if (j?.html) content = j.html
      } catch {}
    }
    const { data, error } = await supabaseAdmin.from('missions').insert({
      title: p.title,
      description: p.description || '',
      course_id: p.course_id || null,
      objective: p.objective || '',
      type: p.type || 'ctf',
      content,
      is_required: !!p.is_required,
    }).select('*').maybeSingle()
    if (error) { res.status(400).json({ success: false, error: error.message }); return }
    res.status(201).json({ success: true, mission: data })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Get mission by id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id
    const { data, error } = await supabaseAdmin.from('missions').select('*').eq('id', id).maybeSingle()
    if (error) { res.status(500).json({ success: false, error: error.message }); return }
    if (!data) { res.status(404).json({ success: false, error: 'Not found' }); return }
    res.json({ success: true, mission: data })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Complete mission for current user
import { requireAuth } from '../middleware/requireAuth.js'
import { ensureBadge, grantBadge } from '../lib/badges.js'
router.post('/:id/complete', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id
    const userId = (req as any).userId as string
    // upsert mission_progress
    const { data: existing } = await supabaseAdmin
      .from('mission_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('mission_id', id)
      .maybeSingle()
    if (existing?.id) {
      const { error } = await supabaseAdmin
        .from('mission_progress')
        .update({ status: 'completed', completed_at: new Date().toISOString(), progress: 100 })
        .eq('id', existing.id)
      if (error) { res.status(400).json({ success: false, error: error.message }); return }
    } else {
      const { error } = await supabaseAdmin
        .from('mission_progress')
        .insert({ user_id: userId, mission_id: id, status: 'completed', progress: 100, completed_at: new Date().toISOString() })
      if (error) { res.status(400).json({ success: false, error: error.message }); return }
    }
    // Count completed missions
    try {
      const { data: totalCompleted } = await supabaseAdmin
        .from('mission_progress')
        .select('id', { count: 'exact', head: false })
        .eq('user_id', userId)
        .eq('status', 'completed')
      const count = Array.isArray(totalCompleted) ? totalCompleted.length : 0
      if (count >= 5) {
        // Grant badge after completing 5 missions
        try {
          const badge = await ensureBadge('Explorador de Missões', { description: 'Concluiu 5 missões', category: 'achievement', color: '#F59E0B' })
          await grantBadge(userId, badge.id)
        } catch {}
      }
    } catch {}
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

export default router
