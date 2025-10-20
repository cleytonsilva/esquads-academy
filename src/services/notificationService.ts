/**
 * ============================================================================
 * NOTIFICATION SERVICE - Esquads Academy Platform
 * ============================================================================
 * 
 * Sistema centralizado de notificações com:
 * - Agrupamento automático por tipo
 * - Supressão inteligente de notificações em excesso
 * - Priorização (silent, toast, modal)
 * - Performance otimizada
 * 
 * Baseado em: PRD Esquads Academy - Outubro 2025
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TIPOS
// ============================================================================

export type NotificationCategory = 
  | 'xp' 
  | 'badge' 
  | 'mission' 
  | 'certificate' 
  | 'level' 
  | 'reputation' 
  | 'hint' 
  | 'feedback' 
  | 'exam' 
  | 'achievement' 
  | 'social' 
  | 'system';

export type NotificationPriority = 'silent' | 'toast' | 'modal';

export type NotificationStatus = 'unread' | 'read' | 'suppressed' | 'grouped';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  payload: Record<string, any>;
  status: NotificationStatus;
  grouped_count: number;
  parent_group_id: string | null;
  content_hash: string | null;
  expires_at: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  category: NotificationCategory;
  enabled: boolean;
  priority_override: NotificationPriority | null;
}

export interface CreateNotificationInput {
  userId: string;
  type: string;
  category: NotificationCategory;
  title: string;
  message: string;
  payload?: Record<string, any>;
  priority?: NotificationPriority;
  expiresInMinutes?: number;
}

// ============================================================================
// PRIORIDADES PADRÃO POR CATEGORIA
// ============================================================================

const DEFAULT_PRIORITIES: Record<NotificationCategory, NotificationPriority> = {
  xp: 'silent',
  reputation: 'silent',
  hint: 'toast',
  feedback: 'toast',
  badge: 'toast',
  exam: 'toast',
  social: 'toast',
  system: 'toast',
  mission: 'modal',
  certificate: 'modal',
  level: 'modal',
  achievement: 'modal'
};

// ============================================================================
// SERVIÇO DE NOTIFICAÇÕES
// ============================================================================

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // ==========================================================================
  // CRIAR NOTIFICAÇÃO
  // ==========================================================================

  /**
   * Adiciona uma nova notificação ao sistema
   * Com verificação automática de supressão e agrupamento
   */
  async addNotification(input: CreateNotificationInput): Promise<Notification | null> {
    try {
      const {
        userId,
        type,
        category,
        title,
        message,
        payload = {},
        priority,
        expiresInMinutes
      } = input;

      // STEP 1: Verificar se já existe notificação idêntica recente (últimos 5 minutos)
      const contentHash = this.generateHash(userId, type, category, payload);
      
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('content_hash', contentHash)
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingNotification) {
        console.log(`[NotificationService] Notificação duplicada ignorada: ${type} (já existe nos últimos 5 min)`);
        return null; // Retorna null para indicar que não criou
      }

      // STEP 2: Verificar se deve suprimir
      const { data: shouldSuppress } = await supabase.rpc(
        'should_suppress_notification',
        {
          p_user_id: userId,
          p_type: type,
          p_category: category
        }
      );

      if (shouldSuppress) {
        console.log(`[NotificationService] Notificação suprimida: ${type} para usuário ${userId}`);
        
        // Criar notificação com status 'suppressed' apenas para histórico
        const { data, error } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type,
            category,
            priority: priority || DEFAULT_PRIORITIES[category],
            title,
            message,
            payload,
            status: 'suppressed',
            content_hash: contentHash,
            expires_at: expiresInMinutes ? this.calculateExpiration(expiresInMinutes) : null
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Obter preferências do usuário
      const userPriority = await this.getUserPriority(userId, category);
      const finalPriority = priority || userPriority || DEFAULT_PRIORITIES[category];

      // STEP 3: Criar notificação
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          category,
          priority: finalPriority,
          title,
          message,
          payload,
          status: 'unread',
          content_hash: contentHash,
          expires_at: expiresInMinutes ? this.calculateExpiration(expiresInMinutes) : null
        })
        .select()
        .single();

      if (error) {
        console.error('[NotificationService] Erro ao criar notificação:', error);
        throw error;
      }

      // Agrupar notificações similares (em background)
      this.groupSimilarNotifications(userId, category).catch(err => 
        console.error('[NotificationService] Erro ao agrupar:', err)
      );

      console.log(`[NotificationService] Notificação criada: ${type} (${finalPriority}) para ${userId}`);
      return data;
    } catch (error) {
      console.error('[NotificationService] Erro ao criar notificação:', error);
      return null;
    }
  }

  // ==========================================================================
  // AGRUPAR NOTIFICAÇÕES SIMILARES
  // ==========================================================================

  /**
   * Agrupa notificações similares dentro de uma janela de tempo
   * Chamado automaticamente após criar notificação
   */
  async groupSimilarNotifications(
    userId: string,
    category: NotificationCategory,
    timeWindowMinutes: number = 30
  ): Promise<number> {
    try {
      const { data, error } = await supabase.rpc(
        'group_similar_notifications',
        {
          p_user_id: userId,
          p_category: category,
          p_time_window_minutes: timeWindowMinutes
        }
      );

      if (error) throw error;

      const groupedCount = data?.[0]?.grouped_count || 0;
      if (groupedCount > 0) {
        console.log(`[NotificationService] ${groupedCount} notificações agrupadas para ${userId}`);
      }

      return groupedCount;
    } catch (error) {
      console.error('[NotificationService] Erro ao agrupar notificações:', error);
      return 0;
    }
  }

  // ==========================================================================
  // OBTER NOTIFICAÇÕES
  // ==========================================================================

  /**
   * Retorna notificações visíveis para o usuário
   * Exclui notificações suprimidas e agrupadas
   */
  async getVisibleNotifications(
    userId: string,
    options: {
      status?: NotificationStatus | NotificationStatus[];
      category?: NotificationCategory;
      priority?: NotificationPriority;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .neq('status', 'suppressed')
        .is('parent_group_id', null) // Apenas grupos pai ou não agrupadas
        .order('created_at', { ascending: false });

      if (options.status) {
        if (Array.isArray(options.status)) {
          query = query.in('status', options.status);
        } else {
          query = query.eq('status', options.status);
        }
      }

      if (options.category) {
        query = query.eq('category', options.category);
      }

      if (options.priority) {
        query = query.eq('priority', options.priority);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[NotificationService] Erro ao buscar notificações:', error);
      return [];
    }
  }

  /**
   * Retorna contador de notificações não lidas
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'unread')
        .is('parent_group_id', null);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('[NotificationService] Erro ao contar não lidas:', error);
      return 0;
    }
  }

  /**
   * Retorna notificações por prioridade (para renderização diferenciada)
   */
  async getNotificationsByPriority(userId: string): Promise<{
    modals: Notification[];
    toasts: Notification[];
    silent: Notification[];
  }> {
    try {
      const notifications = await this.getVisibleNotifications(userId, {
        status: 'unread',
        limit: 50
      });

      return {
        modals: notifications.filter(n => n.priority === 'modal'),
        toasts: notifications.filter(n => n.priority === 'toast'),
        silent: notifications.filter(n => n.priority === 'silent')
      };
    } catch (error) {
      console.error('[NotificationService] Erro ao buscar por prioridade:', error);
      return { modals: [], toasts: [], silent: [] };
    }
  }

  // ==========================================================================
  // MARCAR COMO LIDA
  // ==========================================================================

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[NotificationService] Erro ao marcar como lida:', error);
      return false;
    }
  }

  /**
   * Marca múltiplas notificações como lidas
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .in('id', notificationIds)
        .select();

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('[NotificationService] Erro ao marcar múltiplas como lidas:', error);
      return 0;
    }
  }

  /**
   * Marca todas notificações como lidas
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'unread')
        .select();

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('[NotificationService] Erro ao marcar todas como lidas:', error);
      return 0;
    }
  }

  // ==========================================================================
  // DELETAR NOTIFICAÇÕES
  // ==========================================================================

  /**
   * Deleta uma notificação
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[NotificationService] Erro ao deletar notificação:', error);
      return false;
    }
  }

  /**
   * Deleta todas notificações lidas
   */
  async deleteAllRead(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('status', 'read')
        .select();

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('[NotificationService] Erro ao deletar lidas:', error);
      return 0;
    }
  }

  // ==========================================================================
  // PREFERÊNCIAS
  // ==========================================================================

  /**
   * Obtém prioridade preferida do usuário para uma categoria
   */
  async getUserPriority(
    userId: string,
    category: NotificationCategory
  ): Promise<NotificationPriority | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('priority_override, enabled')
        .eq('user_id', userId)
        .eq('category', category)
        .single();

      if (error || !data) return null;
      if (!data.enabled) return 'silent'; // Se desabilitado, silencioso
      return data.priority_override;
    } catch (error) {
      return null;
    }
  }

  /**
   * Atualiza preferências de notificação
   */
  async updatePreference(
    userId: string,
    category: NotificationCategory,
    enabled: boolean,
    priorityOverride?: NotificationPriority | null
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          category,
          enabled,
          priority_override: priorityOverride || null
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[NotificationService] Erro ao atualizar preferência:', error);
      return false;
    }
  }

  /**
   * Obtém todas preferências do usuário
   */
  async getAllPreferences(userId: string): Promise<NotificationPreference[]> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[NotificationService] Erro ao buscar preferências:', error);
      return [];
    }
  }

  // ==========================================================================
  // UTILS
  // ==========================================================================

  /**
   * Gera hash para detectar duplicatas
   */
  private generateHash(
    userId: string,
    type: string,
    category: string,
    payload: Record<string, any>
  ): string {
    const content = `${userId}|${type}|${category}|${JSON.stringify(payload)}`;
    // Implementação simples de hash (em produção, use crypto)
    return btoa(content).substring(0, 32);
  }

  /**
   * Calcula data de expiração
   */
  private calculateExpiration(minutes: number): string {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date.toISOString();
  }

  /**
   * Limpa notificações antigas (chamado por cron job)
   */
  async cleanup(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_old_notifications');
      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('[NotificationService] Erro ao limpar notificações:', error);
      return 0;
    }
  }

  // ==========================================================================
  // ATALHOS PARA TIPOS COMUNS
  // ==========================================================================

  /**
   * Notificação de XP ganho
   */
  async notifyXPGained(userId: string, xpAmount: number, source: string): Promise<Notification | null> {
    return this.addNotification({
      userId,
      type: 'xp_gained',
      category: 'xp',
      title: `+${xpAmount} XP`,
      message: `Você ganhou ${xpAmount} XP em ${source}`,
      payload: { xp_amount: xpAmount, source }
    });
  }

  /**
   * Notificação de badge conquistado
   */
  async notifyBadgeEarned(
    userId: string,
    badgeName: string,
    badgeRarity: string,
    badgeId: string
  ): Promise<Notification | null> {
    const isRare = ['epic', 'legendary'].includes(badgeRarity.toLowerCase());
    
    return this.addNotification({
      userId,
      type: 'badge_earned',
      category: 'badge',
      title: `Conquista Desbloqueada!`,
      message: `Você ganhou o badge "${badgeName}"`,
      payload: { badge_id: badgeId, badge_name: badgeName, rarity: badgeRarity },
      priority: isRare ? 'modal' : 'toast'
    });
  }

  /**
   * Notificação de novo nível
   */
  async notifyLevelUp(userId: string, newLevel: number, rewards: any): Promise<Notification | null> {
    return this.addNotification({
      userId,
      type: 'level_up',
      category: 'level',
      title: `Nível ${newLevel} Alcançado!`,
      message: `Parabéns! Você subiu para o nível ${newLevel}`,
      payload: { level: newLevel, rewards },
      priority: 'modal'
    });
  }

  /**
   * Notificação de missão concluída
   */
  async notifyMissionCompleted(
    userId: string,
    missionTitle: string,
    rewards: any
  ): Promise<Notification | null> {
    return this.addNotification({
      userId,
      type: 'mission_completed',
      category: 'mission',
      title: 'Missão Concluída!',
      message: `Você completou "${missionTitle}"`,
      payload: { mission_title: missionTitle, rewards },
      priority: 'modal'
    });
  }

  /**
   * Notificação de certificado obtido
   */
  async notifyCertificateIssued(
    userId: string,
    certificateTitle: string,
    certificateId: string
  ): Promise<Notification | null> {
    return this.addNotification({
      userId,
      type: 'certificate_issued',
      category: 'certificate',
      title: 'Certificado Emitido!',
      message: `Seu certificado "${certificateTitle}" está disponível`,
      payload: { certificate_id: certificateId, title: certificateTitle },
      priority: 'modal'
    });
  }
}

// ============================================================================
// EXPORTAR INSTÂNCIA SINGLETON
// ============================================================================

export default NotificationService.getInstance();
