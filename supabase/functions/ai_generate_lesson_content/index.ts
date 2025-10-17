// Supabase Edge Function: ai_generate_lesson_content
// Stub that returns HTML content for a lesson section
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  try {
    const { prompt = 'Tópico da lição', context = {} } = await req.json()
    const html = `<h2>${prompt}</h2><p>Conteúdo gerado por IA com base no contexto: ${JSON.stringify(context)}</p>`
    return new Response(JSON.stringify({ success: true, html }), {
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

