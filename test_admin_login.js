import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminLogin() {
  console.log('🧪 Testando login de administrador...');
  
  try {
    // Tentar fazer login com as credenciais do admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@esquads.com',
      password: 'Admin123!'
    });

    if (authError) {
      console.error('❌ Erro no login:', authError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('👤 Usuário:', authData.user.email);

    // Verificar se o usuário foi sincronizado corretamente
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message);
    } else {
      console.log('✅ Perfil encontrado:', {
        user_id: userProfile.user_id,
        full_name: userProfile.full_name,
        role: userProfile.role
      });
    }

    // Verificar se o usuário está na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError.message);
    } else {
      console.log('✅ Usuário encontrado:', {
        id: userData.id,
        full_name: userData.full_name,
        role: userData.role
      });
    }

    // Fazer logout
    await supabase.auth.signOut();
    console.log('✅ Logout realizado com sucesso!');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testAdminLogin();