import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { doGenerateCertificate, logFailure } from '../lib/certificates.js'

const router = Router()

// Verify certificate by hash
router.get('/verify/:hash', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hash } = req.params
    if (!hash) {
      res.status(400).json({ success: false, error: 'Missing certificate hash' })
      return
    }

    const { data, error } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('certificate_hash', hash)
      .maybeSingle()

    if (error) {
      res.status(500).json({ success: false, error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ success: false, error: 'Certificate not found' })
      return
    }

    res.json({ success: true, certificate: data })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Internal error' })
  }
})

export default router

// -------------------------------
// Certificate Generation + Failure Analysis
// -------------------------------

// Admin: Generate certificate and capture failures
router.post('/generate', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const payload = (req.body || {})
  try {
    const cert = await doGenerateCertificate(payload)
    res.status(201).json({ success: true, certificate: cert })
  } catch (e: any) {
    await logFailure('generate', payload, e)
    res.status(400).json({ success: false, error: e?.message || 'Erro ao gerar certificado' })
  }
})

// Admin: List recent failures
router.get('/failures', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('certificate_failure_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) { res.status(400).json({ success: false, error: error.message }); return }
    res.json({ success: true, failures: data || [] })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Admin: Retry a failure
router.post('/failures/:id/retry', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id
    const { data: row, error } = await supabaseAdmin
      .from('certificate_failure_logs')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) { res.status(400).json({ success: false, error: error.message }); return }
    if (!row) { res.status(404).json({ success: false, error: 'Falha não encontrada' }); return }
    const details = (row as any).details || {}
    const cert = await doGenerateCertificate(details)
    res.status(201).json({ success: true, certificate: cert })
  } catch (e: any) { res.status(400).json({ success: false, error: e?.message || 'Erro ao reprocessar' }) }
})
