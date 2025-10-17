// Supabase Edge Function: ai_generate_course_structure
// Stub that returns a generated course structure (modules, lessons, quizzes, final exam)
// Deploy with: supabase functions deploy ai_generate_course_structure

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  try {
    const { topic = 'Curso de Exemplo', level = 'beginner', duration = 120 } = await req.json()

    const modules = [0, 1, 2].map((i) => ({
      title: `${topic} - Módulo ${i + 1}`,
      description: `Conceitos do módulo ${i + 1} para ${topic}.`,
      order: i,
      lessons: [
        {
          title: `Introdução ${i + 1}`,
          description: 'Conceitos fundamentais',
          type: 'text',
          content: `<h2>${topic} - Introdução ${i + 1}</h2><p>Conteúdo introdutório gerado por IA.</p>`,
          duration: 10,
          order: 0,
        },
        {
          title: `Exercícios Práticos ${i + 1}`,
          description: 'Exemplos e práticas',
          type: 'video',
          content: '',
          duration: 15,
          order: 1,
          videoUrl: ''
        },
        {
          title: `Quiz do Módulo ${i + 1}`,
          description: 'Avaliação do módulo',
          type: 'quiz',
          content: JSON.stringify({
            questions: [
              { q: 'Pergunta 1?', type: 'multiple_choice', options: ['A', 'B', 'C', 'D'], answer: 'A' },
              { q: 'Pergunta 2?', type: 'true_false', answer: 'true' },
            ]
          }),
          duration: 5,
          order: 2,
        }
      ]
    }))

    const finalExam = {
      title: 'Prova Final',
      description: 'Avaliação final do curso',
      duration: 30,
      questions: [
        { q: 'Pergunta final 1?', type: 'multiple_choice', options: ['A', 'B', 'C', 'D'], answer: 'B' },
        { q: 'Pergunta final 2?', type: 'text', answer: '' },
      ]
    }

    return new Response(
      JSON.stringify({
        success: true,
        course: {
          title: topic,
          level,
          duration,
          modules,
          finalExam,
        },
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e?.message || 'error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

