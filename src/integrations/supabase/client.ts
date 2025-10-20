// Esquads Academy - Cliente Supabase (apenas dados reais)

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Verificar variáveis de ambiente obrigatórias
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Configuração do Supabase incompleta. Verifique se as seguintes variáveis estão definidas no arquivo .env:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY\n\n' +
    'Para obter essas informações, acesse o painel do Supabase em https://supabase.com/dashboard'
  )
}

// Criar cliente real do Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: import.meta.env.DEV
  },
  global: {
    headers: {
      'X-Client-Info': 'esquads-academy'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export type SupabaseClient = typeof supabase

// Auth helpers
export const auth = supabase.auth
export const storage = supabase.storage
export const functions = supabase.functions

// Database helpers
export const db = supabase

export default supabase
