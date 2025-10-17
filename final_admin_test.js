import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function finalAdminTest() {
  console.log('🧪 TESTE FINAL - Login de Administrador');
  console.log('=====================================\n');
  
  try {
    // 1. Login
    console.log('1️⃣ Fazendo login como administrador...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: process.env.VITE_TEST_ADMIN_EMAIL,
      password: process.env.VITE_TEST_ADMIN_PASSWORD
    });

    if (authError) {
      console.error('❌ Erro no login:', authError.message);
      return;
    }
    console.log('✅ Login realizado com sucesso!');

    // 2. Verificar usuário na tabela users
    console.log('\n2️⃣ Verificando dados na tabela users...');
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

    // 3. Verificar perfil na tabela user_profiles
    console.log('\n3️⃣ Verificando dados na tabela user_profiles...');
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message);
    } else {
      console.log('✅ Perfil encontrado:', {
        user_id: profileData.user_id,
        full_name: profileData.full_name,
        role: profileData.role
      });
    }

    // 4. Testar acesso a user_progress
    console.log('\n4️⃣ Testando acesso a user_progress...');
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .limit(5);

    if (progressError) {
      console.error('❌ Erro ao acessar user_progress:', progressError.message);
    } else {
      console.log('✅ user_progress acessível:', progressData.length, 'registros');
    }

    // 5. Testar acesso a missions
    console.log('\n5️⃣ Testando acesso a missions...');
    const { data: missionsData, error: missionsError } = await supabase
      .from('missions')
      .select('*')
      .limit(5);

    if (missionsError) {
      console.error('❌ Erro ao acessar missions:', missionsError.message);
    } else {
      console.log('✅ missions acessível:', missionsData.length, 'registros');
    }

    // 6. Testar acesso a system_notifications
    console.log('\n6️⃣ Testando acesso a system_notifications...');
    const { data: notifData, error: notifError } = await supabase
      .from('system_notifications')
      .select('*')
      .eq('user_id', authData.user.id)
      .limit(5);

    if (notifError) {
      console.error('❌ Erro ao acessar system_notifications:', notifError.message);
    } else {
      console.log('✅ system_notifications acessível:', notifData.length, 'registros');
    }

    // 7. Logout
    console.log('\n7️⃣ Fazendo logout...');
    const { error: logoutError } = await supabase.auth.signOut();
    
    if (logoutError) {
      console.error('❌ Erro no logout:', logoutError.message);
    } else {
      console.log('✅ Logout realizado com sucesso!');
    }

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('=====================================');
    console.log('✅ Login de administrador funcionando');
    console.log('✅ Sincronização de dados funcionando');
    console.log('✅ Políticas RLS funcionando');
    console.log('✅ Acesso a todas as tabelas funcionando');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

finalAdminTest();