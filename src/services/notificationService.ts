import { supabase } from '@/integrations/supabase/client';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';

export interface SystemNotification {
  id: string;
  type: 'user_registered' | 'user_updated' | 'user_deleted' | 'system_alert' | 'maintenance';
  title: string;
  message: string;
  data?: any;
  created_at: string;
  is_read: boolean;
  user_id?: string;
  admin_only: boolean;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  user_registrations: boolean;
  system_alerts: boolean;
  maintenance_notices: boolean;
}

class NotificationService {
  /**
   * Criar notificação para novos usuários cadastrados
   */
  async notifyNewUserRegistration(userData: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  }): Promise<void> {
    try {
      // Notificar administradores sobre novo usuário
      const { data: admins, error: adminsError } = await supabaseWithRetry(() =>
        supabase
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .eq('status', 'active')
      );

      if (adminsError) {
        console.error('Erro ao buscar administradores:', adminsError);
        return;
      }

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          type: 'user_registered',
          title: 'Novo Usuário Cadastrado',
          message: `${userData.full_name} (${userData.email}) se cadastrou como ${userData.role === 'admin' ? 'Administrador' : 'Estudante'}`,
          data: {
            user_id: userData.id,
            user_email: userData.email,
            user_name: userData.full_name,
            user_role: userData.role
          },
          user_id: admin.id,
          admin_only: true,
          is_read: false,
          created_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabaseWithRetry(() =>
          supabase
            .from('system_notifications')
            .insert(notifications)
        );

        if (insertError) {
          console.error('Erro ao inserir notificações:', insertError);
          return;
        }

        // Enviar notificação em tempo real para admins online
        await this.broadcastNotificationToAdmins({
          type: 'user_registered',
          title: 'Novo Usuário Cadastrado',
          message: `${userData.full_name} se cadastrou na plataforma`,
          data: {
            user_id: userData.id,
            user_email: userData.email,
            user_name: userData.full_name,
            user_role: userData.role
          }
        });
      }
    } catch (error) {
      console.error('Erro ao criar notificação de novo usuário:', error);
    }
  }

  /**
   * Criar notificação para alterações de usuário
   */
  async notifyUserUpdate(userData: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    changes: Record<string, any>;
  }): Promise<void> {
    try {
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .eq('status', 'active');

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          type: 'user_updated',
          title: 'Usuário Atualizado',
          message: `Dados do usuário ${userData.full_name} foram atualizados`,
          data: {
            user_id: userData.id,
            user_email: userData.email,
            user_name: userData.full_name,
            changes: userData.changes
          },
          user_id: admin.id,
          admin_only: true,
          is_read: false,
          created_at: new Date().toISOString()
        }));

        await supabase
          .from('system_notifications')
          .insert(notifications);
      }
    } catch (error) {
      console.error('Erro ao criar notificação de atualização de usuário:', error);
    }
  }

  /**
   * Criar notificação para exclusão de usuário
   */
  async notifyUserDeletion(userData: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  }): Promise<void> {
    try {
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .eq('status', 'active');

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          type: 'user_deleted',
          title: 'Usuário Excluído',
          message: `Usuário ${userData.full_name} (${userData.email}) foi excluído do sistema`,
          data: {
            user_id: userData.id,
            user_email: userData.email,
            user_name: userData.full_name,
            user_role: userData.role
          },
          user_id: admin.id,
          admin_only: true,
          is_read: false,
          created_at: new Date().toISOString()
        }));

        await supabase
          .from('system_notifications')
          .insert(notifications);
      }
    } catch (error) {
      console.error('Erro ao criar notificação de exclusão de usuário:', error);
    }
  }

  /**
   * Buscar notificações do usuário
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<SystemNotification[]> {
    try {
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        // Tratamento robusto para diferentes tipos de erro
        if (
          error.code === 'PGRST116' || // Tabela não existe
          error.code === 'PGRST205' || // Tabela não encontrada no schema cache
          error.message.includes('relation "system_notifications" does not exist') ||
          error.message.includes('Could not find the table') ||
          error.message.includes('schema cache')
        ) {
          console.warn('Tabela system_notifications não está disponível. Retornando array vazio.', {
            code: error.code,
            message: error.message
          });
          return [];
        }
        
        // Para outros erros, log detalhado mas ainda retorna array vazio para não quebrar a UI
        console.error('Erro ao buscar notificações:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar notificações:', error);
      return [];
    }
  }

  /**
   * Marcar notificação como lida
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        // Tratamento robusto para diferentes tipos de erro
        if (
          error.code === 'PGRST116' || // Tabela não existe
          error.code === 'PGRST205' || // Tabela não encontrada no schema cache
          error.message.includes('relation "system_notifications" does not exist') ||
          error.message.includes('Could not find the table') ||
          error.message.includes('schema cache')
        ) {
          console.warn('Tabela system_notifications não está disponível. Operação ignorada.', {
            code: error.code,
            message: error.message
          });
          return;
        }
        
        console.error('Erro ao marcar notificação como lida:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
      }
    } catch (error) {
      console.error('Erro inesperado ao marcar notificação como lida:', error);
    }
  }

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        // Tratamento robusto para diferentes tipos de erro
        if (
          error.code === 'PGRST116' || // Tabela não existe
          error.code === 'PGRST205' || // Tabela não encontrada no schema cache
          error.message.includes('relation "system_notifications" does not exist') ||
          error.message.includes('Could not find the table') ||
          error.message.includes('schema cache')
        ) {
          console.warn('Tabela system_notifications não está disponível. Operação ignorada.', {
            code: error.code,
            message: error.message
          });
          return;
        }
        
        console.error('Erro ao marcar todas as notificações como lidas:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
      }
    } catch (error) {
      console.error('Erro inesperado ao marcar todas as notificações como lidas:', error);
    }
  }

  /**
   * Contar notificações não lidas
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('system_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        // Tratamento robusto para diferentes tipos de erro
        if (
          error.code === 'PGRST116' || // Tabela não existe
          error.code === 'PGRST205' || // Tabela não encontrada no schema cache
          error.message.includes('relation "system_notifications" does not exist') ||
          error.message.includes('Could not find the table') ||
          error.message.includes('schema cache')
        ) {
          console.warn('Tabela system_notifications não está disponível. Retornando 0.', {
            code: error.code,
            message: error.message
          });
          return 0;
        }
        
        console.error('Erro ao contar notificações não lidas:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      return 0;
    }
  }

  /**
   * Criar notificação de sistema
   */
  async createSystemNotification(
    type: SystemNotification['type'],
    title: string,
    message: string,
    data?: any,
    adminOnly: boolean = true
  ): Promise<void> {
    try {
      let userIds: string[] = [];

      if (adminOnly) {
        const { data: admins } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .eq('status', 'active');
        userIds = admins?.map(admin => admin.id) || [];
      } else {
        const { data: users } = await supabase
          .from('users')
          .select('id')
          .eq('status', 'active');
        userIds = users?.map(user => user.id) || [];
      }

      if (userIds.length > 0) {
        const notifications = userIds.map(userId => ({
          type,
          title,
          message,
          data,
          user_id: userId,
          admin_only: adminOnly,
          is_read: false,
          created_at: new Date().toISOString()
        }));

        await supabase
          .from('system_notifications')
          .insert(notifications);

        // Broadcast para usuários online
        await this.broadcastNotificationToUsers(userIds, {
          type,
          title,
          message,
          data
        });
      }
    } catch (error) {
      console.error('Erro ao criar notificação de sistema:', error);
    }
  }

  /**
   * Broadcast de notificação para administradores online
   */
  private async broadcastNotificationToAdmins(notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }): Promise<void> {
    try {
      // Em uma implementação real, isso seria feito via WebSocket ou Server-Sent Events
      // Por enquanto, vamos usar o sistema de notificações do contexto
      console.log('Broadcasting notification to admins:', notification);
    } catch (error) {
      console.error('Erro ao fazer broadcast para admins:', error);
    }
  }

  /**
   * Broadcast de notificação para usuários específicos
   */
  private async broadcastNotificationToUsers(
    userIds: string[],
    notification: {
      type: string;
      title: string;
      message: string;
      data?: any;
    }
  ): Promise<void> {
    try {
      // Em uma implementação real, isso seria feito via WebSocket ou Server-Sent Events
      console.log('Broadcasting notification to users:', userIds, notification);
    } catch (error) {
      console.error('Erro ao fazer broadcast para usuários:', error);
    }
  }

  /**
   * Configurar preferências de notificação
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erro ao atualizar preferências de notificação:', error);
    }
  }

  /**
   * Buscar preferências de notificação
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || {
        email_notifications: true,
        push_notifications: true,
        user_registrations: true,
        system_alerts: true,
        maintenance_notices: true
      };
    } catch (error) {
      console.error('Erro ao buscar preferências de notificação:', error);
      return {
        email_notifications: true,
        push_notifications: true,
        user_registrations: true,
        system_alerts: true,
        maintenance_notices: true
      };
    }
  }
}

export const notificationService = new NotificationService();
