import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

// Leaderboard based on user_points joined with users (updated schema)
router.get('/leaderboard', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_points')
      .select(`
        user_id,
        total_points,
        level,
        current_streak,
        user:users(full_name, avatar_url)
      `)
      .order('total_points', { ascending: false })
      .limit(50)

    if (error) {
      res.status(500).json({ success: false, error: error.message })
      return
    }

    const leaderboard = (data || []).map((row: any) => ({
      user_id: row.user_id,
      full_name: row.user?.full_name || 'Usuário',
      avatar_url: row.user?.avatar_url || null,
      total_points: row.total_points || 0,
      level: row.level || 1,
      current_streak: row.current_streak || 0,
    }))

    res.json({ success: true, leaderboard })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Internal error' })
  }
})

export default router

