import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Request {
      userId?: string
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
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
    req.userId = data.user.id
    next()
  } catch (err: any) {
    res.status(401).json({ success: false, error: 'Não autorizado' })
  }
}

