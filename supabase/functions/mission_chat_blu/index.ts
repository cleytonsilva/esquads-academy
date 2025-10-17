// Supabase Edge Function: mission_chat_blu (Chatbot BLU)
// Uses OpenAI or Gemini to provide mission assistance. Persona: BLU.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

async function chatOpenAI(messages: any[], apiKey: string) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.3 })
  })
  const j = await r.json()
  return j?.choices?.[0]?.message?.content || ''
}

async function chatGemini(prompt: string, apiKey: string) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  })
  const j = await r.json()
  return j?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
    const { messages, context, provider } = await req.json()
    const system = {
      role: 'system',
      content: 'Você é BLU, um assistente de missão de cibersegurança. Dê dicas progressivas, sem revelar a resposta de imediato. Seja breve e objetivo.'
    }
    const openaiKey = Deno.env.get('API_OPENAI')
    const geminiKey = Deno.env.get('API_GEMINI')
    let reply = ''
    if ((provider || 'openai') === 'openai' && openaiKey) {
      reply = await chatOpenAI([system, ...(messages || [])], openaiKey)
    } else if (geminiKey) {
      const prompt = `${system.content}\nContexto: ${JSON.stringify(context)}\nUsuário: ${(messages||[]).map((m:any)=>`${m.role}: ${m.content}`).join('\n')}`
      reply = await chatGemini(prompt, geminiKey)
    } else {
      reply = 'Habilite API_OPENAI ou API_GEMINI nos secrets para usar o BLU.'
    }
    // Guardrails simples
    const disallowed = [/senha\s*:\s*/i, /malware/i, /ransomware/i, /exploit\s+zero\-day/i, /dados\s+sigilosos/i]
    const flagged = disallowed.some((re) => re.test(String(reply)))
    if (flagged) {
      reply = 'Desculpe, não posso ajudar com esse conteúdo. Vamos focar nas etapas e dicas seguras da missão.'
    }
    return new Response(JSON.stringify({ success: true, reply, flagged }), { headers: { 'Content-Type': 'application/json' }, status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e?.message || 'error' }), { headers: { 'Content-Type': 'application/json' }, status: 400 })
  }
})
