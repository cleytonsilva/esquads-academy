import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

// List achievements
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabaseAdmin.from('achievements').select('*').order('created_at', { ascending: false })
    if (error) { res.status(500).json({ success: false, error: error.message }); return }
    res.json({ success: true, achievements: data || [] })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Create achievement (admin)
router.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const p = req.body || {}
    const { data, error } = await supabaseAdmin.from('achievements').insert({
      key: p.key,
      name: p.name,
      description: p.description || '',
      points: p.points || 0,
      icon_url: p.icon_url || '',
    }).select('*').maybeSingle()
    if (error) { res.status(400).json({ success: false, error: error.message }); return }
    res.status(201).json({ success: true, achievement: data })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Award achievement to user
router.post('/award', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, achievement_key } = req.body || {}
    const { data: a, error: e1 } = await supabaseAdmin.from('achievements').select('id').eq('key', achievement_key).maybeSingle()
    if (e1 || !a) { res.status(400).json({ success: false, error: 'Achievement not found' }); return }
    const { error: e2 } = await supabaseAdmin.from('user_achievements').insert({ user_id, achievement_id: a.id })
    if (e2) { res.status(400).json({ success: false, error: e2.message }); return }
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

export default router

