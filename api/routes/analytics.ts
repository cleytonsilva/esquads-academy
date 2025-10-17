import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

// Platform analytics (basic aggregates)
router.get('/platform', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
      supabaseAdmin.from('users').select('id'),
      supabaseAdmin.from('courses').select('id, price'),
      supabaseAdmin.from('course_enrollments').select('id, course_id, completed_at')
    ])

    if (usersRes.error || coursesRes.error || enrollmentsRes.error) {
      const err = usersRes.error || coursesRes.error || enrollmentsRes.error
      res.status(500).json({ success: false, error: err?.message || 'Query error' })
      return
    }

    const users = usersRes.data || []
    const courses = coursesRes.data || []
    const enrollments = enrollmentsRes.data || []

    const totalUsers = users.length
    const totalCourses = courses.length
    const totalRevenue = enrollments.reduce((sum: number, e: any) => {
      const course = courses.find((c: any) => c.id === e.course_id)
      return sum + (course?.price || 0)
    }, 0)
    const averageCompletionRate = enrollments.length
      ? (enrollments.filter((e: any) => !!e.completed_at).length / enrollments.length) * 100
      : 0

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalCourses,
        totalRevenue,
        averageCompletionRate,
      },
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Internal error' })
  }
})

export default router

