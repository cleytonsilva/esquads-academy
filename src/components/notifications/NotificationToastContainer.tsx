/**
 * ============================================================================
 * NOTIFICATION TOAST CONTAINER
 * ============================================================================
 * 
 * Container para gerenciar múltiplos toasts de notificação
 * Posicionado no canto inferior direito da tela
 * 
 * Features:
 * - Gerencia stack de toasts
 * - Remove automaticamente após auto-hide
 * - Máximo de 3 toasts simultâneos
 * - Responsivo (mobile: bottom-center, desktop: bottom-right)
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationService, { Notification } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';
import NotificationToast from './NotificationToast';

const MAX_TOASTS = 3;

const NotificationToastContainer: React.FC = () => {
  const { user } = useAuth();
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [shownNotificationIds, setShownNotificationIds] = useState<Set<string>>(new Set());

  // Buscar toasts APENAS uma vez no login (não recarregar ao trocar de página)
  useEffect(() => {
    if (!user) return;

    // Carregar apenas notificações dos últimos 30 segundos (muito recentes)
    loadRecentToasts();
  }, [user]);

  // Subscription em tempo real para novos toasts
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('toast_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Apenas adicionar toasts (não modais ou silenciosas) que ainda não foram mostrados
          if (
            newNotification.priority === 'toast' && 
            newNotification.status === 'unread' &&
            !shownNotificationIds.has(newNotification.id)
          ) {
            setToasts(prev => {
              // Adicionar ID ao conjunto de já mostradas
              setShownNotificationIds(prevIds => new Set(prevIds).add(newNotification.id));
              
              // Limitar a MAX_TOASTS
              const updated = [newNotification, ...prev].slice(0, MAX_TOASTS);
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, shownNotificationIds]);

  // Carrega apenas notificações MUITO recentes (últimos 30 segundos)
  // Para evitar mostrar notificações antigas ao trocar de página
  const loadRecentToasts = async () => {
    if (!user) return;

    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('priority', 'toast')
      .eq('status', 'unread')
      .filter('parent_group_id', 'is', null)
      .gte('created_at', thirtySecondsAgo)
      .order('created_at', { ascending: false })
      .limit(MAX_TOASTS);

    if (error) {
      console.error('[NotificationToastContainer] Erro ao carregar toasts:', error);
      console.error('[NotificationToastContainer] Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return;
    }

    if (data && data.length > 0) {
      setToasts(data);
      // Marcar IDs como já mostradas
      const ids = new Set(data.map(n => n.id));
      setShownNotificationIds(ids);
    }
  };

  const handleCloseToast = async (notificationId: string) => {
    // Remover do estado
    setToasts(prev => prev.filter(t => t.id !== notificationId));

    // Manter no conjunto de já mostradas (para não reaparecer)
    setShownNotificationIds(prev => new Set(prev).add(notificationId));

    // Marcar como lida no backend
    await NotificationService.markAsRead(notificationId);
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      // Mobile: bottom-center, Desktop: bottom-right
      style={{
        bottom: '1rem',
        right: '1rem',
        left: 'auto'
      }}
      role="region"
      aria-label="Notificações"
    >
      <div className="pointer-events-auto space-y-2">
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            notification={toast}
            onClose={handleCloseToast}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationToastContainer;

