import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

// List learning paths (optionally only published)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const published = req.query.published
    let q = supabaseAdmin.from('learning_paths').select('*').order('created_at', { ascending: false })
    if (published === 'true') q = q.eq('is_published', true)
    const { data, error } = await q
    if (error) { res.status(500).json({ success: false, error: error.message }); return }
    res.json({ success: true, paths: data || [] })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Get path detail with courses
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id
    const { data: path, error: e1 } = await supabaseAdmin.from('learning_paths').select('*').eq('id', id).maybeSingle()
    if (e1) { res.status(500).json({ success: false, error: e1.message }); return }
    if (!path) { res.status(404).json({ success: false, error: 'Not found' }); return }
    const { data: links, error: e2 } = await supabaseAdmin
      .from('learning_path_courses')
      .select('course_id, order_index')
      .eq('path_id', id)
      .order('order_index', { ascending: true })
    if (e2) { res.status(500).json({ success: false, error: e2.message }); return }
    const courseIds = (links || []).map((l: any) => l.course_id)
    let courses: any[] = []
    if (courseIds.length) {
      const { data: c, error: e3 } = await supabaseAdmin.from('courses').select('*').in('id', courseIds)
      if (e3) { res.status(500).json({ success: false, error: e3.message }); return }
      // order
      courses = (c || []).sort((a: any, b: any) => (
        ((links || []).find((x:any)=>x.course_id===a.id)?.order_index ?? 0) - ((links || []).find((x:any)=>x.course_id===b.id)?.order_index ?? 0)
      ))
    }
    res.json({ success: true, path, courses })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Create path (admin); accepts course_ids[] ordered
router.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const p = req.body || {}
    const { data: path, error } = await supabaseAdmin.from('learning_paths').insert({
      name: p.name,
      description: p.description || '',
      level: p.level || 'beginner',
      is_published: !!p.is_published,
    }).select('*').maybeSingle()
    if (error) { res.status(400).json({ success: false, error: error.message }); return }

    const ids: string[] = Array.isArray(p.course_ids) ? p.course_ids : []
    let order = 0
    for (const cid of ids) {
      await supabaseAdmin.from('learning_path_courses').insert({ path_id: path.id, course_id: cid, order_index: order++ })
    }
    res.status(201).json({ success: true, path })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

export default router

