// Supabase Edge Function: ai_generate_final_exam
// Stub that returns a final exam for the course
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  try {
    const { courseTitle = 'Curso', level = 'beginner' } = await req.json()
    const exam = {
      title: `Prova Final - ${courseTitle}`,
      duration: 30,
      questions: [
        { q: `(${level}) Questão final 1?`, type: 'multiple_choice', options: ['A', 'B', 'C', 'D'], answer: 'D' },
        { q: `(${level}) Questão final 2?`, type: 'multiple_choice', options: ['A', 'B', 'C', 'D'], answer: 'B' },
      ],
    }
    return new Response(JSON.stringify({ success: true, exam }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e?.message || 'error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
