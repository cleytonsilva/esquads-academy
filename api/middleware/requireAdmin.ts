import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : ''
    if (!token) {
      res.status(401).json({ success: false, error: 'Não autorizado' })
      return
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data.user) {
      res.status(401).json({ success: false, error: error?.message || 'Token inválido' })
      return
    }
    const userId = data.user.id
    req.userId = userId
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .or(`user_id.eq.${userId},id.eq.${userId}`)
      .maybeSingle()
    if (profileErr) {
      res.status(403).json({ success: false, error: profileErr.message })
      return
    }
    if ((profile?.role || 'student') !== 'admin') {
      res.status(403).json({ success: false, error: 'Acesso restrito a administradores' })
      return
    }
    next()
  } catch (e: any) {
    res.status(401).json({ success: false, error: 'Não autorizado' })
  }
}

