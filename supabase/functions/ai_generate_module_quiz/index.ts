// Supabase Edge Function: ai_generate_module_quiz
// Generates quiz JSON using OpenAI, Gemini, or fallback stub.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

async function generateWithOpenAI(prompt: string, apiKey: string) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você gera quizzes JSON. Responda SOMENTE em JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    }),
  })
  const j = await r.json()
  const content = j?.choices?.[0]?.message?.content || '{}'
  return JSON.parse(content)
}

async function generateWithGemini(prompt: string, apiKey: string) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  })
  const j = await r.json()
  const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  return JSON.parse(txt)
}

serve(async (req) => {
  try {
    const body = await req.json()
    const moduleTitle = body?.moduleTitle || 'Módulo'
    const difficulty = body?.difficulty || 'beginner'
    const n = body?.n || 5
    const provider = body?.provider || 'openai' // 'openai' | 'gemini'

    const jsonSpec = `Gere um quiz JSON com ${n} questões de múltipla escolha para o módulo "${moduleTitle}" (nível: ${difficulty}).
Formato: {"questions":[{"q":"texto","type":"multiple_choice","options":["A","B","C","D"],"answer":"A"}, ...]}. Responda SOMENTE JSON.`

    let quiz
    const openaiKey = Deno.env.get('API_OPENAI')
    const geminiKey = Deno.env.get('API_GEMINI')
    if (provider === 'openai' && openaiKey) {
      quiz = await generateWithOpenAI(jsonSpec, openaiKey)
    } else if (provider === 'gemini' && geminiKey) {
      quiz = await generateWithGemini(jsonSpec, geminiKey)
    } else {
      // Fallback stub
      quiz = {
        questions: [
          { q: `(${difficulty}) ${moduleTitle}: Questão 1?`, type: 'multiple_choice', options: ['A', 'B', 'C', 'D'], answer: 'C' },
          { q: `(${difficulty}) ${moduleTitle}: Questão 2?`, type: 'multiple_choice', options: ['A', 'B', 'C', 'D'], answer: 'A' },
        ]
      }
    }

    return new Response(JSON.stringify({ success: true, quiz }), { headers: { 'Content-Type': 'application/json' }, status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e?.message || 'error' }), { headers: { 'Content-Type': 'application/json' }, status: 400 })
  }
})
