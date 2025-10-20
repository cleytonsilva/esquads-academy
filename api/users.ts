import { createClient } from '@supabase/supabase-js'
import { NextApiRequest, NextApiResponse } from 'next'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, full_name, role = 'student' } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    // Criar usuário usando service role key
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        name: full_name || email
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário:', authError)
      return res.status(400).json({ error: authError.message })
    }

    // Criar perfil do usuário
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        email: email,
        full_name: full_name || email,
        role: role,
        subscription_type: 'free'
      })

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      // Se falhar ao criar perfil, deletar o usuário criado
      await supabase.auth.admin.deleteUser(authData.user.id)
      return res.status(400).json({ error: 'Erro ao criar perfil do usuário' })
    }

    res.status(201).json({ 
      success: true, 
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: full_name || email,
        role: role
      }
    })

  } catch (error) {
    console.error('Erro no endpoint de criação de usuário:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
