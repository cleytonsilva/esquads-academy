import { useEffect, useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface RealtimeData {
  metrics: {
    totalUsers: number;
    totalCourses: number;
    totalMissions: number;
    totalSimulations: number;
    activeUsers: number;
    completedCourses: number;
    completedMissions: number;
    completedSimulations: number;
  };
  alerts: any[];
  activities: any[];
  users: any[];
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
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalMissions: 0,
    totalSimulations: 0,
    activeUsers: 0,
    completedCourses: 0,
    completedMissions: 0,
    completedSimulations: 0,
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Função para carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    try {
      setConnectionStatus('connecting');

      // Carregar métricas básicas
      const [
        { count: totalUsers },
        { count: totalCourses },
        { count: totalMissions },
        { count: totalSimulations },
        { count: activeUsers },
        { count: completedCourses },
        { count: completedMissions },
        { count: completedSimulations }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('missions').select('*', { count: 'exact', head: true }),
        supabase.from('generated_simulations').select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_courses').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('mission_attempts').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('simulation_attempts').select('*', { count: 'exact', head: true }).eq('status', 'completed')
      ]);

      setMetrics({
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalMissions: totalMissions || 0,
        totalSimulations: totalSimulations || 0,
        activeUsers: activeUsers || 0,
        completedCourses: completedCourses || 0,
        completedMissions: completedMissions || 0,
        completedSimulations: completedSimulations || 0,
      });

      // Carregar alertas (usando notificações como proxy)
      const { data: alertsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (alertsData) {
        setAlerts(alertsData);
      }

      // Carregar atividades recentes (usando mission_attempts como proxy)
      const { data: activitiesData } = await supabase
        .from('mission_attempts')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(100);

      if (activitiesData) {
        setActivities(activitiesData);
      }

      // Carregar usuários
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersData) {
        setUsers(usersData);
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
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
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
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
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

    // Configurar canais de realtime do Supabase usando tabelas existentes
    const notificationsChannel = supabase
      .channel('notifications_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('Notificação atualizada em tempo real:', payload);
          
          if (payload.eventType === 'INSERT') {
            setAlerts(prev => [payload.new, ...prev.slice(0, 49)]);
          } else if (payload.eventType === 'UPDATE') {
            setAlerts(prev => 
              prev.map(alert => 
                alert.id === payload.new.id ? payload.new : alert
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prev => prev.filter(alert => alert.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const missionAttemptsChannel = supabase
      .channel('mission_attempts_realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mission_attempts' },
        (payload) => {
          console.log('Nova tentativa de missão em tempo real:', payload);
          setActivities(prev => [payload.new, ...prev.slice(0, 99)]);
        }
      )
      .subscribe();

    const userProfilesChannel = supabase
      .channel('user_profiles_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_profiles' },
        (payload) => {
          console.log('Perfil de usuário atualizado em tempo real:', payload);
          
          if (payload.eventType === 'INSERT') {
            setUsers(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setUsers(prev => 
              prev.map(user => 
                user.id === payload.new.id ? payload.new : user
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
      notificationsChannel.unsubscribe();
      missionAttemptsChannel.unsubscribe();
      userProfilesChannel.unsubscribe();
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: 'type=in.(warning,error)'
        },
        (payload) => {
          const newNotification = payload.new;
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          setUnreadCount(prev => prev + 1);

          // Mostrar notificação do navegador se permitido
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title || 'Nova Notificação', {
              body: newNotification.message || 'Você tem uma nova notificação',
              icon: '/favicon.ico',
              tag: newNotification.id
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
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