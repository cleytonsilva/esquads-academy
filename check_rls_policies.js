import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSPolicies() {
  console.log('🔍 Verificando políticas RLS...');
  
  try {
    // Verificar políticas da tabela user_progress
    const { data: userProgressPolicies, error: upError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'user_progress');

    console.log('\n📋 Políticas user_progress:');
    if (upError) {
      console.error('❌ Erro:', upError.message);
    } else {
      userProgressPolicies.forEach(policy => {
        console.log(`- ${policy.policyname}: ${policy.cmd} - ${policy.qual}`);
      });
    }

    // Verificar políticas da tabela missions
    const { data: missionsPolicies, error: mError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'missions');

    console.log('\n📋 Políticas missions:');
    if (mError) {
      console.error('❌ Erro:', mError.message);
    } else {
      missionsPolicies.forEach(policy => {
        console.log(`- ${policy.policyname}: ${policy.cmd} - ${policy.qual}`);
      });
    }

    // Testar acesso direto às tabelas
    console.log('\n🧪 Testando acesso direto...');
    
    const adminUserId = '7630f2af-dc67-40c7-b5bc-3606b681df4b';
    
    // Testar user_progress
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', adminUserId)
      .limit(1);

    if (progressError) {
      console.log('❌ Erro user_progress:', progressError.message);
    } else {
      console.log('✅ user_progress acessível:', progressData.length, 'registros');
    }

    // Testar missions
    const { data: missionsData, error: missionsError } = await supabase
      .from('missions')
      .select('*')
      .limit(1);

    if (missionsError) {
      console.log('❌ Erro missions:', missionsError.message);
    } else {
      console.log('✅ missions acessível:', missionsData.length, 'registros');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkRLSPolicies();