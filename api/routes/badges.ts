import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

// List badges (optionally by course_id)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = (req.query.course_id as string) || undefined
    let q = supabaseAdmin.from('badges').select('*').order('created_at', { ascending: false })
    if (courseId) q = q.eq('course_id', courseId)
    const { data, error } = await q
    if (error) { res.status(500).json({ success: false, error: error.message }); return }
    res.json({ success: true, badges: data || [] })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Create badge (admin)
router.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const p = req.body || {}
    // ensure bucket exists
    try { await supabaseAdmin.storage.createBucket('badges', { public: true }) } catch {}
    const { data, error } = await supabaseAdmin.from('badges').insert({
      name: p.name,
      description: p.description || '',
      icon_url: p.icon_url || '',
      color: p.color || '#3B82F6',
      course_id: p.course_id || null,
      category: p.category || 'certificate',
      points_required: p.points_required || 0,
      share_text: p.share_text || '',
    }).select('*').maybeSingle()
    if (error) { res.status(400).json({ success: false, error: error.message }); return }
    res.status(201).json({ success: true, badge: data })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

export default router

// List recent badge grants (admin)
router.get('/grants', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit || 100)
    const { data, error } = await supabaseAdmin
      .from('user_badges')
      .select('id, user_id, badge_id, earned_at, users!user_id(full_name), badges!badge_id(name, icon_url, category, color)')
      .order('earned_at', { ascending: false })
      .limit(Number.isFinite(limit) ? limit : 100)
    if (error) { res.status(400).json({ success: false, error: error.message }); return }
    res.json({ success: true, grants: data || [] })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})
