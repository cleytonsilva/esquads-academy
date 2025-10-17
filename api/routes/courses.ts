import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

// List courses (optionally filter by status)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const status = (req.query.status as string) || undefined
    let query = supabaseAdmin.from('courses').select('*').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) {
      res.status(500).json({ success: false, error: error.message })
      return
    }
    res.json({ success: true, courses: data || [] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Internal error' })
  }
})

// Get course with modules and lessons
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id
    const { data: course, error: cErr } = await supabaseAdmin.from('courses').select('*').eq('id', id).maybeSingle()
    if (cErr) { res.status(500).json({ success: false, error: cErr.message }); return }
    if (!course) { res.status(404).json({ success: false, error: 'Course not found' }); return }

    const { data: modules, error: mErr } = await supabaseAdmin.from('course_modules').select('*').eq('course_id', id).order('order_index', { ascending: true })
    if (mErr) { res.status(500).json({ success: false, error: mErr.message }); return }

    const moduleIds = (modules || []).map((m: any) => m.id)
    let lessons: any[] = []
    if (moduleIds.length) {
      const { data: ls, error: lErr } = await supabaseAdmin.from('module_lessons').select('*').in('module_id', moduleIds).order('order_index', { ascending: true })
      if (lErr) { res.status(500).json({ success: false, error: lErr.message }); return }
      lessons = ls || []
    }

    const modulesWithLessons = (modules || []).map((m: any) => ({
      ...m,
      lessons: lessons.filter(l => l.module_id === m.id),
    }))

    res.json({ success: true, course, modules: modulesWithLessons })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Internal error' })
  }
})

// Admin: create course
router.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body || {}
    // If no thumbnail provided, try Supabase Edge Function for cover generation (uses secrets)
    let thumbnail = payload.thumbnail_url || null
    if (!thumbnail) {
      try {
        const url = `${process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL}/functions/v1/generate_course_cover`
        const r = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
          },
          body: JSON.stringify({ title: payload.title, prompt: payload.cover_prompt, aspect_ratio: '16:9' })
        })
        const j: any = await r.json()
        if (j?.success && j?.image) thumbnail = j.image
      } catch {}
    }
    // Optionally create a certificate template first
    let templateId: string | null = null
    if (payload.certificate_template && typeof payload.certificate_template === 'object') {
      const t = payload.certificate_template
      const { data: tData, error: tErr } = await supabaseAdmin.from('certificate_templates').insert({
        name: t.name || payload.title || 'Modelo',
        background_url: t.background_url || null,
        elements: t.elements || [],
        is_default: false,
      }).select('id').maybeSingle()
      if (!tErr && tData?.id) templateId = tData.id
    }

    const { data, error } = await supabaseAdmin.from('courses').insert({
      title: payload.title,
      description: payload.description,
      thumbnail_url: thumbnail,
      instructor_id: payload.instructor_id || payload.admin_id || null,
      status: payload.status || 'draft',
      difficulty: payload.level || 'beginner',
      estimated_duration: payload.duration || 0,
      points_reward: payload.points_reward || 0,
      price: payload.price || 0,
      is_free: payload.is_free ?? true,
      tags: payload.tags || [],
      certificate_template_id: templateId,
    }).select('*').maybeSingle()
    if (error) { res.status(400).json({ success: false, error: error.message }); return }
    // Optionally attach a badge image to this course (category certificate)
    if (payload.badge_icon_url) {
      await supabaseAdmin.from('badges').insert({
        name: `${payload.title} Certificate`,
        description: 'Badge de conclusão de curso',
        icon_url: payload.badge_icon_url,
        color: '#3B82F6',
        course_id: data.id,
        category: 'certificate',
        points_required: 0,
        share_text: `Concluí o curso "${payload.title}"`,
      })
    }
    res.status(201).json({ success: true, course: data })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Internal error' })
  }
})

// Admin: add module to course
router.post('/:id/modules', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id
    const payload = req.body || {}
    const { data, error } = await supabaseAdmin.from('course_modules').insert({
      course_id: courseId,
      title: payload.title,
      description: payload.description || '',
      order_index: payload.order_index || 0,
    }).select('*').maybeSingle()
    if (error) { res.status(400).json({ success: false, error: error.message }); return }
    res.status(201).json({ success: true, module: data })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Internal error' })
  }
})

// Admin: add lesson to module
router.post('/modules/:moduleId/lessons', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const moduleId = req.params.moduleId
    const p = req.body || {}
    const { data, error } = await supabaseAdmin.from('module_lessons').insert({
      module_id: moduleId,
      title: p.title,
      content: p.content || null,
      video_url: p.video_url || null,
      duration: p.duration || 0,
      order_index: p.order_index || 0,
      points_reward: p.points_reward || 0,
    }).select('*').maybeSingle()
    if (error) { res.status(400).json({ success: false, error: error.message }); return }
    res.status(201).json({ success: true, lesson: data })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Internal error' })
  }
})

export default router
// Generate quiz for a module via Edge and save as lesson
router.post('/modules/:moduleId/quiz/generate', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const moduleId = req.params.moduleId
    const { moduleTitle = 'Quiz', difficulty = 'beginner', n = 5, provider = 'openai' } = req.body || {}
    const url = `${process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL}/functions/v1/ai_generate_module_quiz`
    const r = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}` },
      body: JSON.stringify({ moduleTitle, difficulty, n, provider })
    })
    const j: any = await r.json()
    if (!r.ok) { res.status(400).json({ success: false, error: j?.error || 'AI generation failed' }); return }
    const quiz = j.quiz || { questions: [] }
    const { data, error } = await supabaseAdmin.from('module_lessons').insert({
      module_id: moduleId,
      title: `${moduleTitle} - Quiz`,
      content: JSON.stringify(quiz),
      duration: 0,
      order_index: 999,
      points_reward: 0,
    }).select('*').maybeSingle()
    if (error) { res.status(400).json({ success: false, error: error.message }); return }
    res.status(201).json({ success: true, lesson: data })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Generate final exam for a course via Edge and save in exams table
router.post('/:id/exams/generate', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id
    const { courseTitle = 'Prova Final', level = 'beginner' } = req.body || {}
    const url = `${process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL}/functions/v1/ai_generate_final_exam`
    const r = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}` },
      body: JSON.stringify({ courseTitle, level })
    })
    const j: any = await r.json()
    if (!r.ok) { res.status(400).json({ success: false, error: j?.error || 'AI generation failed' }); return }
    const exam = j.exam || { title: 'Prova Final', questions: [], duration: 30 }
    const { data, error } = await supabaseAdmin.from('exams').insert({
      course_id: id,
      title: exam.title,
      description: 'Gerado por IA',
      questions: exam.questions,
      passing_score: 70,
      time_limit: exam.duration || 30,
      max_attempts: 3,
    }).select('*').maybeSingle()
    if (error) { res.status(400).json({ success: false, error: error.message }); return }
    res.status(201).json({ success: true, exam: data })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})
