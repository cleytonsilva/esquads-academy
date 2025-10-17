import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

// Get current user profile; auto-create if missing
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .or(`user_id.eq.${userId},id.eq.${userId}`)
      .maybeSingle()

    if (error) {
      res.status(500).json({ success: false, error: error.message })
      return
    }

    if (!profile) {
      const { data: created, error: createError } = await supabaseAdmin
        .from('user_profiles')
        .insert({ user_id: userId, role: 'student' })
        .select('*')
        .maybeSingle()
      if (createError) {
        res.status(500).json({ success: false, error: createError.message })
        return
      }
      res.json({ success: true, profile: created })
      return
    }

    res.json({ success: true, profile })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Internal error' })
  }
})

// Update current user profile (whitelist selected fields)
router.put('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId as string
    const allowed = ['interests', 'skill_level', 'learning_goals', 'preferred_duration', 'favorite_categories', 'learning_style', 'time_availability']
    const payload: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in req.body) payload[key] = req.body[key]
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .or(`user_id.eq.${userId},id.eq.${userId}`)
      .select('*')
      .maybeSingle()

    if (error) {
      res.status(400).json({ success: false, error: error.message })
      return
    }
    res.json({ success: true, profile: data })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Internal error' })
  }
})

export default router

