import { Request, Response } from 'express';
import { supabaseAdmin, supabaseAnon } from '../lib/supabase.js';

/**
 * Criar novo usuário (Modo Desenvolvimento)
 * POST /api/users
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name, role, phone, bio } = req.body;

    // Validações básicas
    if (!email || !password || !full_name || !role) {
      res.status(400).json({ 
        success: false, 
        error: 'Email, senha, nome completo e função são obrigatórios' 
      });
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ 
        success: false, 
        error: 'Email inválido' 
      });
      return;
    }

    // Validar senha
    if (password.length < 6) {
      res.status(400).json({ 
        success: false, 
        error: 'Senha deve ter pelo menos 6 caracteres' 
      });
      return;
    }

    // Validar função
    if (!['admin', 'student', 'instructor'].includes(role)) {
      res.status(400).json({ 
        success: false, 
        error: 'Função deve ser admin, instructor ou student' 
      });
      return;
    }

    // Verificar se o email já existe
    const { data: existingUser } = await supabaseAnon
      .from('user_profiles')
      .select('user_id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      res.status(400).json({ 
        success: false, 
        error: 'Email já está em uso' 
      });
      return;
    }

    // MODO DESENVOLVIMENTO: Criar usuário apenas na tabela users
    // Gerar um ID único para o usuário
    const userId = `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Criar perfil do usuário na tabela user_profiles
    const { data: userData, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: userId,
        email,
        full_name,
        role,
        status: 'active',
        phone: phone || null,
        bio: bio || null,
        created_at: new Date().toISOString(),
        // Campos adicionais para desenvolvimento
        password_hash: `dev-hash-${password}`, // Hash simples para desenvolvimento
        email_verified: true,
        last_sign_in: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('Erro ao criar perfil do usuário:', userError);
      res.status(500).json({ 
        success: false, 
        error: 'Erro ao criar perfil do usuário' 
      });
      return;
    }

    console.log(`✅ Usuário criado em modo desenvolvimento: ${email} (${role})`);

    res.json({ 
      success: true, 
      user: userData,
      message: 'Usuário criado com sucesso! (Modo Desenvolvimento)',
      development_mode: true
    });

  } catch (error) {
    console.error('Erro interno ao criar usuário:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

/**
 * Atualizar usuário
 * PUT /api/users/:id
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { full_name, role, status, phone, bio } = req.body;

    if (!id) {
      res.status(400).json({ 
        success: false, 
        error: 'ID do usuário é obrigatório' 
      });
      return;
    }

    // Preparar dados para atualização
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;

    // Atualizar usuário na tabela user_profiles
    const { data: userData, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar usuário:', updateError);
      res.status(500).json({ 
        success: false, 
        error: 'Erro ao atualizar usuário' 
      });
      return;
    }

    res.json({ 
      success: true, 
      user: userData,
      message: 'Usuário atualizado com sucesso!' 
    });

  } catch (error) {
    console.error('Erro interno ao atualizar usuário:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

/**
 * Sincronizar usuário do Auth com a tabela users
 * POST /api/users/sync
 */
export const syncUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, email, full_name, role = 'student' } = req.body;

    if (!user_id || !email) {
      res.status(400).json({ 
        success: false, 
        error: 'ID do usuário e email são obrigatórios' 
      });
      return;
    }

    // Verificar se o usuário já existe na tabela users
    const { data: existingUser } = await supabaseAnon
      .from('user_profiles')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (existingUser) {
      res.json({ 
        success: true, 
        user: existingUser,
        message: 'Usuário já existe na tabela users' 
      });
      return;
    }

    // Criar registro na tabela users
    const { data: userData, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: user_id,
        email,
        full_name: full_name || email.split('@')[0], // Usar email como nome se não fornecido
        role,
        status: 'active',
        phone: null,
        bio: null,
        created_at: new Date().toISOString(),
        email_verified: true,
        last_sign_in: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('Erro ao sincronizar usuário:', userError);
      res.status(500).json({ 
        success: false, 
        error: 'Erro ao sincronizar usuário' 
      });
      return;
    }

    console.log(`✅ Usuário sincronizado: ${email} (${role})`);

    res.json({ 
      success: true, 
      user: userData,
      message: 'Usuário sincronizado com sucesso!' 
    });

  } catch (error) {
    console.error('Erro interno ao sincronizar usuário:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

/**
 * Excluir usuário
 * DELETE /api/users/:id
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ 
        success: false, 
        error: 'ID do usuário é obrigatório' 
      });
      return;
    }

    // Excluir da tabela users primeiro
    const { error: deleteError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('user_id', id);

    if (deleteError) {
      console.error('Erro ao excluir usuário da tabela:', deleteError);
      res.status(500).json({ 
        success: false, 
        error: 'Erro ao excluir usuário' 
      });
      return;
    }

    res.json({ 
      success: true, 
      message: 'Usuário excluído com sucesso!' 
    });

  } catch (error) {
    console.error('Erro interno ao excluir usuário:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};
