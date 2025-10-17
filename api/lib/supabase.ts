import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Ensure env is loaded before reading variables
dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  throw new Error('Supabase URL not configured (VITE_SUPABASE_URL or SUPABASE_URL)')
}

export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || '')
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || ''
)

export default supabaseAdmin
