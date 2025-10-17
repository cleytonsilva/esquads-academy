import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } })

router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const file = (req as any).file as any
    if (!file) {
      res.status(400).json({ success: false, error: 'No file' })
      return
    }

    // Ensure public bucket exists
    try {
      await supabaseAdmin.storage.createBucket('lesson-content', { public: true })
    } catch (e: any) {
      // ignore if exists
    }

    const ext = file.originalname.split('.').pop() || 'bin'
    const path = `lessons/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const { error: upErr } = await supabaseAdmin.storage.from('lesson-content').upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    })
    if (upErr) {
      res.status(500).json({ success: false, error: upErr.message })
      return
    }

    const { data: pub } = supabaseAdmin.storage.from('lesson-content').getPublicUrl(path)
    res.json({ success: true, url: pub.publicUrl })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Upload failed' })
  }
})

export default router
