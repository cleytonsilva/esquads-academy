// Supabase Edge Function: auth-otp (send/verify OTP for 2FA)
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
  })

  try {
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

    const { data: authUser } = await supabase.auth.getUser()
    const user = authUser?.user
    if (!user) return json({ error: 'Unauthorized' }, 401)

    const body = await req.json().catch(() => ({}))
    const action: 'send' | 'verify' | undefined = body?.action
    if (!action) return json({ error: 'Missing action' }, 400)

    if (action === 'send') {
      // Basic resend cooldown: 30s from last created
      const { data: lastRecords, error: lastErr } = await supabase
        .from('auth_mfa_otp')
        .select('*')
        .eq('user_id', user.id)
        .is('used_at', null)
        .order('created_at', { ascending: false })
        .limit(1)

      if (lastErr) console.warn('Error fetching last OTP:', lastErr)
      const last = (lastRecords || [])[0] as
        | { created_at?: string; attempt_count?: number }
        | undefined
      if (last?.created_at) {
        const diff = Date.now() - new Date(last.created_at).getTime()
        if (diff < 30_000) {
          return json({ ok: false, error: 'RESEND_COOLDOWN' }, 429)
        }
      }

      // Generate and store hashed OTP
      const code = generateOtp()
      const codeHash = await sha256Hex(code)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes

      const { error: insertErr } = await supabase.from('auth_mfa_otp').insert({
        user_id: user.id,
        code_hash: codeHash,
        expires_at: expiresAt,
        channel: 'email',
      })
      if (insertErr) {
        console.error('Error inserting OTP:', insertErr)
        return json({ ok: false, error: 'STORE_FAILED' }, 500)
      }

      // TODO: Integrate email provider (Resend/SendGrid). For now, log in non-prod
      const isProd = (Deno.env.get('NODE_ENV') || '').toLowerCase() === 'production'
      if (!isProd) {
        console.log(`[DEV] OTP for user ${user.id}: ${code}`)
      }

      return json({ ok: true, sent: true, dev_code: isProd ? undefined : code })
    }

    if (action === 'verify') {
      const inputCode: string | undefined = body?.code
      if (!inputCode) return json({ ok: false, error: 'MISSING_CODE' }, 400)

      const nowIso = new Date().toISOString()
      // Get the latest active OTP for this user
      const { data: records, error: selErr } = await supabase
        .from('auth_mfa_otp')
        .select('*')
        .eq('user_id', user.id)
        .is('used_at', null)
        .gt('expires_at', nowIso)
        .order('created_at', { ascending: false })
        .limit(1)
      if (selErr) {
        console.error('Error selecting OTP:', selErr)
        return json({ ok: false, error: 'VERIFY_FAILED' }, 500)
      }

      const current = (records || [])[0] as
        | { id: string; attempt_count: number; code_hash: string }
        | undefined
      if (!current) return json({ ok: false, error: 'NO_ACTIVE_CODE' }, 400)

      // Increment attempt count
      const attempts = (current.attempt_count ?? 0) + 1
      if (attempts > 5) {
        // lock this OTP
        await supabase
          .from('auth_mfa_otp')
          .update({ used_at: new Date().toISOString(), attempt_count: attempts })
          .eq('id', current.id)
        return json({ ok: false, error: 'TOO_MANY_ATTEMPTS' }, 429)
      }

      const inputHash = await sha256Hex(inputCode)
      const isMatch = inputHash === current.code_hash

      if (!isMatch) {
        await supabase
          .from('auth_mfa_otp')
          .update({ attempt_count: attempts })
          .eq('id', current.id)
        return json({ ok: false, error: 'INVALID_CODE' }, 400)
      }

      // Mark as used
      await supabase
        .from('auth_mfa_otp')
        .update({ used_at: new Date().toISOString(), attempt_count: attempts })
        .eq('id', current.id)

      return json({ ok: true, verified: true })
    }

    return json({ error: 'Unknown action' }, 400)
  } catch (e) {
    console.error('auth-otp error:', e)
    return json({ ok: false, error: e?.message || 'ERROR' }, 500)
  }
})

