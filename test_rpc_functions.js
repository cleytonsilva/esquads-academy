import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRPCFunctions() {
  console.log('🧪 Testando funções RPC...');
  
  try {
    const adminUserId = '7630f2af-dc67-40c7-b5bc-3606b681df4b';
    
    // Testar função para user_profiles
    console.log('📝 Testando upsert_user_profile_with_role...');
    const { data: profileData, error: profileError } = await supabase.rpc('upsert_user_profile_with_role', {
      p_user_id: adminUserId,
      p_full_name: 'Administrador Esquads',
      p_role: 'admin'
    });

    if (profileError) {
      console.error('❌ Erro na função user_profile:', profileError.message);
    } else {
      console.log('✅ Função user_profile executada:', profileData);
    }

    // Verificar se o perfil foi criado
    const { data: checkProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', adminUserId)
      .single();

    if (checkError) {
      console.error('❌ Erro ao verificar perfil:', checkError.message);
    } else {
      console.log('✅ Perfil verificado:', {
        user_id: checkProfile.user_id,
        full_name: checkProfile.full_name,
        role: checkProfile.role
      });
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testRPCFunctions();