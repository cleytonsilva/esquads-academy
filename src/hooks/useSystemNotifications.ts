import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { notificationService, SystemNotification } from '@/services/notificationService';

export const useSystemNotifications = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await notificationService.getUserNotifications(user.id);
      setNotifications(data);
    } catch (error: any) {
      console.error('Erro ao buscar notificações:', error);
      
      // Se a tabela não existir ou houver erro de RLS, usar fallback
      if (error?.code === 'PGRST116' || error?.code === '42P01' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
        console.warn('⚠️ Tabela system_notifications não encontrada, usando fallback vazio');
        setNotifications([]);
      } else if (error?.code === '42501' || error?.message?.includes('permission denied') || error?.message?.includes('RLS')) {
        console.warn('⚠️ Erro de permissão RLS, usando fallback vazio');
        setNotifications([]);
      } else {
        // Para outros erros, apenas logar sem criar notificação para evitar loops
        console.error('Erro ao carregar notificações do sistema:', error);
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error: any) {
      console.error('Erro ao buscar contagem de notificações:', error);
      
      // Se a tabela não existir ou houver erro de RLS, usar fallback
      if (error?.code === 'PGRST116' || error?.code === '42P01' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
        console.warn('⚠️ Tabela system_notifications não encontrada, contagem = 0');
        setUnreadCount(0);
      } else if (error?.code === '42501' || error?.message?.includes('permission denied') || error?.message?.includes('RLS')) {
        console.warn('⚠️ Erro de permissão RLS, contagem = 0');
        setUnreadCount(0);
      } else {
        // Para outros erros, manter contagem como 0
        setUnreadCount(0);
      }
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Erro ao marcar notificação como lida:', error);
      
      // Se a tabela não existir, apenas atualizar localmente
      if (error?.code === 'PGRST116' || error?.code === '42P01' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
        console.warn('⚠️ Tabela system_notifications não encontrada, atualizando apenas localmente');
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        // Para outros erros, apenas logar sem criar notificação para evitar loops
        console.error('Erro ao marcar notificação como lida:', error);
      }
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      await notificationService.markAllNotificationsAsRead(user.id);
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      
      // Se a tabela não existir, apenas atualizar localmente
      if (error?.code === 'PGRST116' || error?.code === '42P01' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
        console.warn('⚠️ Tabela system_notifications não encontrada, atualizando apenas localmente');
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        setUnreadCount(0);
      } else {
        // Para outros erros, apenas logar sem criar notificação para evitar loops
        console.error('Erro ao marcar todas as notificações como lidas:', error);
      }
    }
  }, [user?.id]);

  const createSystemNotification = useCallback(async (
    type: SystemNotification['type'],
    title: string,
    message: string,
    data?: any,
    adminOnly: boolean = true
  ) => {
    try {
      await notificationService.createSystemNotification(
        type,
        title,
        message,
        data,
        adminOnly
      );

      // Se for admin e a notificação for para admins, atualizar lista
      if (user?.role === 'admin' && adminOnly) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (error: any) {
      console.error('Erro ao criar notificação de sistema:', error);
      
      // Se a tabela não existir, apenas mostrar aviso
      if (error?.code === 'PGRST116' || error?.code === '42P01' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
        console.warn('⚠️ Tabela system_notifications não encontrada, notificação não foi criada');
      } else {
        // Para outros erros, apenas logar sem criar notificação para evitar loops
        console.error('Erro ao criar notificação do sistema:', error);
      }
    }
  }, [user?.role, fetchNotifications, fetchUnreadCount]);

  // Carregar notificações quando o usuário mudar
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user?.id, fetchNotifications, fetchUnreadCount]);

  // Polling para atualizar notificações a cada 30 segundos
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    createSystemNotification
  };
};
