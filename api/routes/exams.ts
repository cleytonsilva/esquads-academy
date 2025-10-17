import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { doGenerateCertificate, logFailure } from '../lib/certificates.js'
import { ensureBadge, grantBadge } from '../lib/badges.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

// List exams (optionally by course)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = (req.query.course_id as string) || undefined
    let q = supabaseAdmin.from('exams').select('*').order('created_at', { ascending: false })
    if (courseId) q = q.eq('course_id', courseId as any)
    const { data, error } = await q
    if (error) { res.status(500).json({ success: false, error: error.message }); return }
    // Enrich with question count
    const exams = (data || []).map((e: any) => ({ ...e, total_questions: Array.isArray(e.questions) ? e.questions.length : 0 }))
    res.json({ success: true, exams })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Admin: create exam from question bank (must appear before '/:id' route)
router.post('/create-from-bank', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const p = req.body || {}
    const title = p.title as string
    const courseId = p.course_id as string
    const questionIds: string[] = Array.isArray(p.question_ids) ? p.question_ids : []
    const timeLimit = typeof p.time_limit === 'number' ? p.time_limit : 0
    const passingScore = typeof p.passing_score === 'number' ? p.passing_score : 70
    const maxAttempts = typeof p.max_attempts === 'number' ? p.max_attempts : 3
    const description = typeof p.description === 'string' ? p.description : 'Criado do banco de questões'

    if (!title || !courseId || questionIds.length === 0) {
      res.status(400).json({ success: false, error: 'Parâmetros inválidos (title, course_id, question_ids)' })
      return
    }

    // Load questions
    const { data: rows, error: qErr } = await supabaseAdmin
      .from('exam_question_bank')
      .select('*')
      .in('id', questionIds)
    if (qErr) { res.status(400).json({ success: false, error: qErr.message }); return }
    if (!rows || rows.length !== questionIds.length) {
      res.status(400).json({ success: false, error: 'Algumas questões não foram encontradas' })
      return
    }

    const questions = rows.map((r: any) => ({
      q: r.question_text,
      type: 'multiple_choice',
      options: r.options,
      answer: r.answer,
    }))

    const { data: exam, error: eErr } = await supabaseAdmin
      .from('exams')
      .insert({
        course_id: courseId,
        title,
        description,
        questions,
        passing_score: passingScore,
        time_limit: timeLimit,
        max_attempts: maxAttempts,
      })
      .select('*')
      .maybeSingle()
    if (eErr) { res.status(400).json({ success: false, error: eErr.message }); return }
    res.status(201).json({ success: true, exam })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Get a single exam
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id
    const { data, error } = await supabaseAdmin.from('exams').select('*').eq('id', id).maybeSingle()
    if (error) { res.status(500).json({ success: false, error: error.message }); return }
    if (!data) { res.status(404).json({ success: false, error: 'Not found' }); return }
    res.json({ success: true, exam: data })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// List my attempts (optionally filtered by exam)
router.get('/attempts/my', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId as string
    const examId = (req.query.exam_id as string) || undefined
    let q = supabaseAdmin.from('exam_attempts').select('*').eq('user_id', userId).order('started_at', { ascending: false })
    if (examId) q = q.eq('exam_id', examId)
    const { data, error } = await q
    if (error) { res.status(500).json({ success: false, error: error.message }); return }
    res.json({ success: true, attempts: data || [] })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Start a new attempt for a given exam
router.post('/:id/attempts', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const examId = req.params.id
    const userId = (req as any).userId as string

    // Load exam
    const { data: exam, error: eErr } = await supabaseAdmin.from('exams').select('*').eq('id', examId).maybeSingle()
    if (eErr) { res.status(400).json({ success: false, error: eErr.message }); return }
    if (!exam) { res.status(404).json({ success: false, error: 'Exam not found' }); return }

    // Count existing attempts
    const { data: existing, error: aErr } = await supabaseAdmin
      .from('exam_attempts')
      .select('id')
      .eq('user_id', userId)
      .eq('exam_id', examId)
    if (aErr) { res.status(400).json({ success: false, error: aErr.message }); return }

    const attemptNumber = (existing?.length || 0) + 1
    if (typeof exam.max_attempts === 'number' && attemptNumber > exam.max_attempts) {
      res.status(403).json({ success: false, error: 'Max attempts reached' })
      return
    }

    const { data: attempt, error } = await supabaseAdmin
      .from('exam_attempts')
      .insert({
        user_id: userId,
        exam_id: examId,
        answers: {},
        score: 0,
        passed: false,
        attempt_number: attemptNumber,
      })
      .select('*')
      .maybeSingle()
    if (error) { res.status(400).json({ success: false, error: error.message }); return }

    // Return attempt and exam questions so client can render without extra roundtrip
    res.status(201).json({ success: true, attempt, questions: exam.questions, time_limit: exam.time_limit, title: exam.title })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Submit attempt and compute score
router.post('/attempts/:attemptId/submit', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const attemptId = req.params.attemptId
    const userId = (req as any).userId as string
    const submittedAnswers = (req.body && req.body.answers) || {}

    // Load attempt
    const { data: attempt, error: aErr } = await supabaseAdmin
      .from('exam_attempts')
      .select('*')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .maybeSingle()
    if (aErr) { res.status(400).json({ success: false, error: aErr.message }); return }
    if (!attempt) { res.status(404).json({ success: false, error: 'Attempt not found' }); return }

    // Load exam to compute score
    const { data: exam, error: eErr } = await supabaseAdmin
      .from('exams')
      .select('*')
      .eq('id', attempt.exam_id)
      .maybeSingle()
    if (eErr) { res.status(400).json({ success: false, error: eErr.message }); return }
    if (!exam) { res.status(404).json({ success: false, error: 'Exam not found' }); return }

    const questions: any[] = Array.isArray(exam.questions) ? exam.questions : []
    // Todos os quizzes são de múltipla escolha: considerar cada questão com options/answer
    let correct = 0
    let total = 0
    for (const q of questions) {
      if (!q) continue
      const key = q.q || q.question_text || ''
      // Apenas considerar questões com opções válidas e resposta definida
      if (Array.isArray(q.options) && q.options.length > 0 && typeof q.answer !== 'undefined') {
        total += 1
        const userAns = submittedAnswers[key]
        if (typeof userAns !== 'undefined' && String(userAns).trim() === String(q.answer).trim()) {
          correct += 1
        }
      }
    }
    const score = total > 0 ? Math.round((correct / total) * 100) : 0
    const passed = score >= (typeof exam.passing_score === 'number' ? exam.passing_score : 70)

    const { data: updated, error: uErr } = await supabaseAdmin
      .from('exam_attempts')
      .update({
        answers: submittedAnswers,
        score,
        passed,
        completed_at: new Date().toISOString(),
      })
      .eq('id', attemptId)
      .select('*')
      .maybeSingle()
    if (uErr) { res.status(400).json({ success: false, error: uErr.message }); return }

    // Auto-issue certificate if passed
    let certificateIssued = false
    if (passed) {
      try {
        // Reload exam to access course_id (exists above but ensure scope)
        // Using previously loaded 'exam' variable
        await doGenerateCertificate({ user_id: userId, course_id: exam.course_id, grade: score, hours_completed: null, skills_acquired: [] })
        certificateIssued = true
        // Grant badge for passing final exam
        try {
          const badge = await ensureBadge('Aprovado em Exame Final', { description: 'Aprovado no exame final do curso', category: 'achievement', color: '#10B981' })
          await grantBadge(userId, badge.id)
        } catch {}
      } catch (e: any) {
        await logFailure('auto_issue_from_exam', { user_id: userId, course_id: exam.course_id, grade: score }, e)
      }
    }

    res.json({ success: true, attempt: updated, certificateIssued })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Question Bank Endpoints
// List bank questions (optional filters: q, tag, difficulty)
router.get('/questions', async (req: Request, res: Response): Promise<void> => {
  try {
    const qText = (req.query.q as string) || undefined
    const tag = (req.query.tag as string) || undefined
    const difficulty = (req.query.difficulty as string) || undefined

    let q = supabaseAdmin.from('exam_question_bank').select('*').order('created_at', { ascending: false })
    if (qText) q = q.ilike('question_text', `%${qText}%`)
    if (tag) q = q.contains('tags', [tag])
    if (difficulty) q = q.eq('difficulty', difficulty)

    const { data, error } = await q
    if (error) { res.status(500).json({ success: false, error: error.message }); return }
    res.json({ success: true, questions: data || [] })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Create a bank question
router.post('/questions', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const p = req.body || {}
    if (!p.question_text || !Array.isArray(p.options) || typeof p.answer === 'undefined') {
      res.status(400).json({ success: false, error: 'Invalid payload' })
      return
    }
    const { data, error } = await supabaseAdmin
      .from('exam_question_bank')
      .insert({
        question_text: p.question_text,
        options: p.options,
        answer: p.answer,
        tags: Array.isArray(p.tags) ? p.tags : [],
        difficulty: p.difficulty || 'medium',
      })
      .select('*')
      .maybeSingle()
    if (error) { res.status(400).json({ success: false, error: error.message }); return }
    res.status(201).json({ success: true, question: data })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Update a bank question
router.put('/questions/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id
    const p = req.body || {}
    const patch: any = {}
    if (typeof p.question_text === 'string') patch.question_text = p.question_text
    if (Array.isArray(p.options)) patch.options = p.options
    if (typeof p.answer !== 'undefined') patch.answer = p.answer
    if (Array.isArray(p.tags)) patch.tags = p.tags
    if (typeof p.difficulty === 'string') patch.difficulty = p.difficulty

    const { data, error } = await supabaseAdmin
      .from('exam_question_bank')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle()
    if (error) { res.status(400).json({ success: false, error: error.message }); return }
    res.json({ success: true, question: data })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

// Delete a bank question
router.delete('/questions/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id
    const { error } = await supabaseAdmin.from('exam_question_bank').delete().eq('id', id)
    if (error) { res.status(400).json({ success: false, error: error.message }); return }
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ success: false, error: e?.message || 'error' }) }
})

export default router
