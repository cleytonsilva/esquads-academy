import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdminCredentials() {
  console.log('🔍 Verificando credenciais de administrador...');
  
  try {
    // Buscar usuários com role admin
    const { data: adminUsers, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin');

    if (error) {
      console.error('❌ Erro ao buscar admins:', error.message);
      return;
    }

    console.log('👥 Administradores encontrados:', adminUsers.length);
    adminUsers.forEach((user, index) => {
      console.log(`Admin ${index + 1}:`, {
        id: user.id,
        full_name: user.full_name,
        role: user.role
      });
    });

    // Buscar na tabela auth.users para ver os emails
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email')
      .in('id', adminUsers.map(u => u.id));

    if (authError) {
      console.error('❌ Erro ao buscar emails:', authError.message);
    } else {
      console.log('\n📧 Emails dos administradores:');
      authUsers.forEach(user => {
        console.log(`- ${user.email} (ID: ${user.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkAdminCredentials();