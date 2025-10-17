import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anyjcglrdkfkfdylcwxo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueWpjZ2xyZGtma2ZkeWxjd3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDcyNjksImV4cCI6MjA3NTQ4MzI2OX0.UwejUJkbtdVKG4gvWO78pYMZXJaBf5FJRb9NXpa6gLM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminUsers() {
  try {
    console.log('🔍 Verificando usuários administradores...');
    
    // Verificar usuários na tabela users (sem email, pois não existe)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, role')
      .eq('role', 'admin');
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      return;
    }
    
    console.log('👥 Usuários administradores encontrados:', users?.length || 0);
    if (users && users.length > 0) {
      users.forEach(user => {
        console.log(`  - ${user.full_name} (${user.id})`);
      });
    }
    
    // Verificar todos os usuários
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, full_name, role');
    
    if (allUsersError) {
      console.error('❌ Erro ao buscar todos os usuários:', allUsersError);
      return;
    }
    
    console.log('\n📊 Resumo de todos os usuários:');
    console.log(`Total: ${allUsers?.length || 0}`);
    
    const roleCount = {};
    allUsers?.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`  - ${role}: ${count}`);
    });
    
    // Verificar usuários na tabela auth.users para ver emails
    console.log('\n🔍 Verificando emails na tabela auth.users...');
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, raw_user_meta_data');
    
    if (authError) {
      console.error('❌ Erro ao buscar auth.users:', authError);
    } else {
      console.log('📧 Usuários com emails:');
      authUsers?.forEach(user => {
        const role = user.raw_user_meta_data?.role || 'student';
        console.log(`  - ${user.email} (${role}) - ID: ${user.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkAdminUsers();