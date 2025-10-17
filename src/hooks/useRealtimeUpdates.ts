import { useEffect, useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { 
  AdminDashboardMetric, 
  SystemAlert, 
  SystemActivity, 
  ExtendedUser 
} from '@/types/database';

export interface RealtimeData {
  metrics: AdminDashboardMetric[];
  alerts: SystemAlert[];
  activities: SystemActivity[];
  users: ExtendedUser[];
  onlineUsers: string[];
}

export interface UseRealtimeUpdatesReturn extends RealtimeData {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  refreshData: () => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
}

export function useRealtimeUpdates(): UseRealtimeUpdatesReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [metrics, setMetrics] = useState<AdminDashboardMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [activities, setActivities] = useState<SystemActivity[]>([]);
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Função para carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    try {
      setConnectionStatus('connecting');

      // Carregar métricas
      const { data: metricsData } = await supabase
        .from('admin_dashboard_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (metricsData) {
        setMetrics(metricsData);
      }

      // Carregar alertas não resolvidos
      const { data: alertsData } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (alertsData) {
        setAlerts(alertsData);
      }

      // Carregar atividades recentes
      const { data: activitiesData } = await supabase
        .from('system_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (activitiesData) {
        setActivities(activitiesData);
      }

      // Carregar usuários
      const { data: usersData } = await supabase
        .from('users')
        .select(`
          *,
          department:departments(*),
          user_role:roles(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (usersData) {
        setUsers(usersData as ExtendedUser[]);
      }

      setConnectionStatus('connected');
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      setConnectionStatus('error');
    }
  }, []);

  // Função para atualizar dados
  const refreshData = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  // Função para marcar alerta como lido
  const markAlertAsRead = useCallback(async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('system_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_by: user.id,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        console.error('Erro ao marcar alerta como lido:', error);
      }
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
    }
  }, []);

  // Função para dispensar alerta
  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('system_alerts')
        .update({
          is_resolved: true,
          resolved_by: user.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        console.error('Erro ao dispensar alerta:', error);
      }
    } catch (error) {
      console.error('Erro ao dispensar alerta:', error);
    }
  }, []);

  useEffect(() => {
    // Carregar dados iniciais
    loadInitialData();

    // Configurar canais de realtime do Supabase
    const metricsChannel = supabase
      .channel('admin_dashboard_metrics_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'admin_dashboard_metrics' },
        (payload) => {
          console.log('Métrica atualizada em tempo real:', payload);
          
          if (payload.eventType === 'INSERT') {
            setMetrics(prev => [payload.new as AdminDashboardMetric, ...prev.slice(0, 99)]);
          } else if (payload.eventType === 'UPDATE') {
            setMetrics(prev => 
              prev.map(metric => 
                metric.id === payload.new.id ? payload.new as AdminDashboardMetric : metric
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setMetrics(prev => prev.filter(metric => metric.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const alertsChannel = supabase
      .channel('system_alerts_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'system_alerts' },
        (payload) => {
          console.log('Alerta atualizado em tempo real:', payload);
          
          if (payload.eventType === 'INSERT') {
            setAlerts(prev => [payload.new as SystemAlert, ...prev.slice(0, 49)]);
          } else if (payload.eventType === 'UPDATE') {
            setAlerts(prev => 
              prev.map(alert => 
                alert.id === payload.new.id ? payload.new as SystemAlert : alert
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prev => prev.filter(alert => alert.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const activitiesChannel = supabase
      .channel('system_activities_realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'system_activities' },
        (payload) => {
          console.log('Nova atividade em tempo real:', payload);
          setActivities(prev => [payload.new as SystemActivity, ...prev.slice(0, 99)]);
        }
      )
      .subscribe();

    const usersChannel = supabase
      .channel('users_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('Usuário atualizado em tempo real:', payload);
          
          if (payload.eventType === 'INSERT') {
            setUsers(prev => [payload.new as ExtendedUser, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setUsers(prev => 
              prev.map(user => 
                user.id === payload.new.id ? payload.new as ExtendedUser : user
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setUsers(prev => prev.filter(user => user.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Canal para presença de usuários online
    const presenceChannel = supabase
      .channel('online_users')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const onlineUserIds = Object.keys(state);
        setOnlineUsers(onlineUserIds);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Usuário entrou online:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Usuário saiu offline:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await presenceChannel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    setIsConnected(true);

    return () => {
      metricsChannel.unsubscribe();
      alertsChannel.unsubscribe();
      activitiesChannel.unsubscribe();
      usersChannel.unsubscribe();
      presenceChannel.unsubscribe();
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
  }, [loadInitialData, markAlertAsRead, dismissAlert]);

  return {
    isConnected,
    connectionStatus,
    metrics,
    alerts,
    activities,
    users,
    onlineUsers,
    refreshData,
    markAlertAsRead,
    dismissAlert
  };
}

// Hook específico para notificações em tempo real
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<SystemAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'system_alerts',
          filter: 'severity=in.(high,critical)'
        },
        (payload) => {
          const newAlert = payload.new as SystemAlert;
          setNotifications(prev => [newAlert, ...prev.slice(0, 9)]);
          setUnreadCount(prev => prev + 1);

          // Mostrar notificação do navegador se permitido
          if (Notification.permission === 'granted') {
            new Notification(newAlert.title, {
              body: newAlert.message,
              icon: '/favicon.ico',
              tag: newAlert.id
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const markAsRead = useCallback((alertId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === alertId ? { ...notif, is_acknowledged: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll
  };
}