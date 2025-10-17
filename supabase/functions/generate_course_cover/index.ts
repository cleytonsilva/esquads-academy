// Supabase Edge Function: generate_course_cover
// Uses Replicate to generate a course cover image based on a prompt or title.
// Secrets: REPLICATE_API_TOKEN (set in Supabase project secrets)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { status: 405 })
    }
    const { title, prompt, aspect_ratio, provider } = await req.json()
    const token = Deno.env.get('API_REPLICATE') || Deno.env.get('REPLICATE_API_TOKEN')
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Missing REPLICATE_API_TOKEN' }), { status: 500 })
    }
    const finalPrompt = prompt || `course cover, ${title || 'technology course'}, modern, gradient, professional`
    const model = provider === 'recraft' ? 'recraft-ai/recraft-v3' : 'black-forest-labs/flux-1.1-pro'
    const webhook = Deno.env.get('WEBHOOK_REPLICATE')
    const body: Record<string, unknown> = {
      input: { prompt: finalPrompt, aspect_ratio: aspect_ratio || '16:9' },
    }
    if (webhook) {
      body.webhook = webhook
      body.webhook_events_filter = ['completed']
    }
    const r = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const created = await r.json()
    if (!r.ok) {
      return new Response(JSON.stringify({ success: false, error: created?.error || 'Replicate error' }), { status: 400 })
    }
    const id = created?.id
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'No prediction id' }), { status: 400 })
    }
    // Poll for completion
    let image: string | null = null
    for (let i = 0; i < 20; i++) {
      await new Promise((res) => setTimeout(res, 1500))
      const pr = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { 'Authorization': `Token ${token}` },
      })
      const pj = await pr.json()
      if (pj?.status === 'succeeded') {
        const out = pj?.output
        if (Array.isArray(out) && out.length) image = out[0]
        break
      }
      if (pj?.status === 'failed' || pj?.status === 'canceled') break
    }
    if (!image) {
      return new Response(JSON.stringify({ success: false, error: 'Generation not completed' }), { status: 504 })
    }
    return new Response(JSON.stringify({ success: true, image }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e?.message || 'error' }), { status: 400 })
  }
})
