import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserProfiles() {
  console.log('🔍 Verificando tabela user_profiles...');
  
  try {
    // Buscar todos os perfis do admin
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', '7630f2af-dc67-40c7-b5bc-3606b681df4b');

    if (error) {
      console.error('❌ Erro ao buscar perfis:', error.message);
      return;
    }

    console.log('📊 Perfis encontrados:', profiles.length);
    profiles.forEach((profile, index) => {
      console.log(`Profile ${index + 1}:`, {
        user_id: profile.user_id,
        full_name: profile.full_name,
        role: profile.role,
        created_at: profile.created_at
      });
    });

    // Se há múltiplos perfis, remover duplicatas
    if (profiles.length > 1) {
      console.log('⚠️ Múltiplos perfis encontrados, removendo duplicatas...');
      
      // Manter apenas o mais recente
      const sortedProfiles = profiles.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      const toDelete = sortedProfiles.slice(1);
      
      for (const profile of toDelete) {
        const { error: deleteError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', profile.user_id)
          .eq('created_at', profile.created_at);
          
        if (deleteError) {
          console.error('❌ Erro ao deletar perfil duplicado:', deleteError.message);
        } else {
          console.log('✅ Perfil duplicado removido');
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkUserProfiles()