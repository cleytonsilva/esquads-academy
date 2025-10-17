import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAuthUsers() {
  console.log('🔍 Verificando usuários de autenticação...');
  
  try {
    // Usar RPC para acessar auth.users
    const { data: authUsers, error } = await supabase.rpc('get_auth_users');

    if (error) {
      console.error('❌ Erro ao buscar usuários auth:', error.message);
      
      // Tentar buscar diretamente do schema auth
      const { data: directAuth, error: directError } = await supabase
        .schema('auth')
        .from('users')
        .select('id, email')
        .limit(10);

      if (directError) {
        console.error('❌ Erro acesso direto auth:', directError.message);
      } else {
        console.log('✅ Usuários auth encontrados:', directAuth.length);
        directAuth.forEach(user => {
          console.log(`- ${user.email} (ID: ${user.id})`);
        });
      }
    } else {
      console.log('✅ Usuários auth via RPC:', authUsers.length);
      authUsers.forEach(user => {
        console.log(`- ${user.email} (ID: ${user.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkAuth