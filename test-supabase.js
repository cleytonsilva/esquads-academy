// Teste direto do Supabase
import { supabase } from './src/integrations/supabase/client.js';

console.log('🧪 Testando integração Supabase...');

// Teste 1: Verificar conexão
async function testConnection() {
  console.log('🔌 Testando conexão com Supabase...');
  
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida!');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    return false;
  }
}

// Teste 2: Verificar tabelas
async function testTables() {
  console.log('📋 Verificando estrutura das tabelas...');
  
  try {
    // Testar tabela users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Erro na tabela users:', usersError);
    } else {
      console.log('✅ Tabela users acessível');
    }
    
    // Testar tabela user_profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erro na tabela user_profiles:', profilesError);
    } else {
      console.log('✅ Tabela user_profiles acessível');
    }
    
    // Testar tabela user_points
    const { data: pointsData, error: pointsError } = await supabase
      .from('user_points')
      .select('*')
      .limit(1);
    
    if (pointsError) {
      console.error('❌ Erro na tabela user_points:', pointsError);
    } else {
      console.log('✅ Tabela user_points acessível');
    }
    
  } catch (error) {
    console.error('❌ Erro geral ao testar tabelas:', error);
  }
}

// Teste 3: Testar registro de usuário
async function testUserRegistration() {
  console.log('👤 Testando registro de usuário...');
  
  try {
    const testEmail = `teste${Date.now()}@exemplo.com`;
    const testPassword = 'MinhaSenh@123';
    
    console.log('📝 Registrando usuário:', testEmail);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Usuário Teste',
          role: 'student'
        }
      }
    });
    
    if (error) {
      console.error('❌ Erro no registro:', error);
      return false;
    }
    
    console.log('✅ Usuário registrado com sucesso!', data);
    
    // Aguardar um pouco para o trigger funcionar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar se o usuário foi criado nas tabelas
    if (data.user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (userError) {
        console.warn('⚠️ Usuário não encontrado na tabela users:', userError);
      } else {
        console.log('✅ Usuário encontrado na tabela users:', userData);
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      if (profileError) {
        console.warn('⚠️ Perfil não encontrado na tabela user_profiles:', profileError);
      } else {
        console.log('✅ Perfil encontrado na tabela user_profiles:', profileData);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro no teste de registro:', error);
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando bateria de testes...');
  
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('❌ Testes interrompidos - falha na conexão');
    return;
  }
  
  await testTables();
  await testUserRegistration();
  
  console.log('🏁 Testes concluídos!');
}

// Executar testes
runAllTests();