import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNotificationsAccess() {
  console.log('🔍 Testando acesso a system_notifications...');
  
  try {
    const adminUserId = '9e84ae70-6c0c-4e0a-92f5-dc70959de282';
    
    // Testar acesso direto
    const { data: notifications, error } = await supabase
      .from('system_notifications')
      .select('*')
      .eq('user_id', adminUserId)
      .limit(5);

    if (error) {
      console.error('❌ Erro ao acessar notificações:', error);
    } else {
      console.log('✅ Notificações encontradas:', notifications.length);
      notifications.forEach(notif => {
        console.log(`- ${notif.title}: ${notif.message}`);
      });
    }

    // Testar contagem não lidas
    const { count, error: countError } = await supabase
      .from('system_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', adminUserId)
      .eq('read', false);

    if (countError) {
      console.error('❌ Erro ao contar não lidas:', countError);
    } else {
      console.log('✅ Notificações não lidas:', count);
    }

    // Criar uma notificação de teste
    console.log('\n📝 Criando notificação de teste...');
    const { data: newNotif, error: createError } = await supabase
      .from('system_notifications')
      .insert({
        type: 'info',
        title: 'Teste de Notificação',
        message: 'Esta é uma notificação de teste para o administrador',
        user_id: adminUserId
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar notificação:', createError);
    } else {
      console.log('✅ Notificação criada:', newNotif.title);
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testNotificationsAccess();