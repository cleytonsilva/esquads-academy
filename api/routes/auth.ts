/**
 * Authentication routes backed by Supabase
 */
import { Router, type Request, type Response } from 'express'
import { supabaseAnon, supabaseAdmin } from '../lib/supabase.js'

const router = Router()

// Helper: ensure user profile exists
async function ensureUserProfile(userId: string, role: string = 'student') {
  const { data: existing } = await supabaseAdmin
    .from('user_profiles')
    .select('id, user_id')
    .or(`user_id.eq.${userId},id.eq.${userId}`)
    .maybeSingle()

  if (!existing) {
    await supabaseAdmin.from('user_profiles').insert({ user_id: userId, role })
  }
}

// Register
// POST /api/auth/register { email, password, role? }
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role = 'student' } = req.body || {}
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Missing email or password' })
      return
    }

    const { data, error } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: { data: { role } },
    })

    if (error) {
      res.status(400).json({ success: false, error: error.message })
      return
    }

    if (data.user?.id) {
      await ensureUserProfile(data.user.id, role)
    }

    res.status(201).json({ success: true, user: data.user })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Internal error' })
  }
})

// Login
// POST /api/auth/login { email, password }
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Missing email or password' })
      return
    }

    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      res.status(401).json({ success: false, error: error.message })
      return
    }

    // Ensure profile exists
    if (data.user?.id) {
      const role = (data.user as any)?.user_metadata?.role || 'student'
      await ensureUserProfile(data.user.id, role)
    }

    res.json({ success: true, session: data.session, user: data.user })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Internal error' })
  }
})

// Logout — stateless on server; client should discard tokens.
// POST /api/auth/logout
router.post('/logout', async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true })
})

// Me — resolve user from Bearer token
// GET /api/auth/me  (Authorization: Bearer <token>)
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.substring(7) : ''
    if (!token) {
      res.status(401).json({ success: false, error: 'Missing bearer token' })
      return
    }
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error) {
      res.status(401).json({ success: false, error: error.message })
      return
    }
    res.json({ success: true, user: data.user })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Internal error' })
  }
})

export default router
