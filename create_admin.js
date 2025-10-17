import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anyjcglrdkfkfdylcwxo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueWpjZ2xyZGtma2ZkeWxjd3hvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkwNzI2OSwiZXhwIjoyMDc1NDgzMjY5fQ.3ak2-YH5lEqkW6EiKS_5cOQPJy6SBB1rawQl8Nj9_XQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log('🔧 Criando usuário administrador...');
    
    const adminEmail = 'admin@esquads.com';
    const adminPassword = 'Admin123!';
    
    // Criar usuário na auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador Esquads',
        role: 'admin'
      }
    });
    
    if (authError) {
      console.error('❌ Erro ao criar usuário na auth:', authError);
      return;
    }
    
    console.log('✅ Usuário criado na auth:', authUser.user.id);
    
    // Inserir na tabela users
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        full_name: 'Administrador Esquads',
        role: 'admin'
      })
      .select();
    
    if (publicError) {
      console.error('❌ Erro ao inserir na tabela users:', publicError);
      return;
    }
    
    console.log('✅ Usuário inserido na tabela users:', publicUser);
    
    // Criar pontos para o usuário
    const { data: userPoints, error: pointsError } = await supabase
      .from('user_points')
      .insert({
        user_id: authUser.user.id,
        total_points: 0,
        level: 1,
        experience_points: 0
      })
      .select();
    
    if (pointsError) {
      console.error('❌ Erro ao criar pontos:', pointsError);
    } else {
      console.log('✅ Pontos criados:', userPoints);
    }
    
    console.log('\n🎉 Usuário administrador criado com sucesso!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Senha: ${adminPassword}`);
    console.log(`🆔 ID: ${authUser.user.id}`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createAdminUser();