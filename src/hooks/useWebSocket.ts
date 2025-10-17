import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

export interface UseWebSocketOptions {
  url?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  sendMessage: (message: WebSocketMessage) => void;
  disconnect: () => void;
  reconnect: () => void;
  lastMessage: WebSocketMessage | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = process.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080',
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    onMessage,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState('connecting');
    
    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionState('connected');
        reconnectCountRef.current = 0;
        onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Erro ao parsear mensagem WebSocket:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setConnectionState('disconnected');
        onDisconnect?.();

        // Tentar reconectar automaticamente
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current.onerror = (error) => {
        setConnectionState('error');
        onError?.(error);
      };

    } catch (error) {
      setConnectionState('error');
      console.error('Erro ao conectar WebSocket:', error);
    }
  }, [url, reconnectAttempts, reconnectInterval, onConnect, onMessage, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionState('disconnected');
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectCountRef.current = 0;
    connect();
  }, [disconnect, connect]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket não está conectado. Mensagem não enviada:', message);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionState,
    sendMessage,
    disconnect,
    reconnect,
    lastMessage
  };
}

// Hook específico para atualizações do Admin Dashboard
export function useAdminDashboardWebSocket() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'METRIC_UPDATE':
        setMetrics(prev => {
          const updated = [...prev];
          const index = updated.findIndex(m => m.id === message.payload.id);
          if (index >= 0) {
            updated[index] = message.payload;
          } else {
            updated.push(message.payload);
          }
          return updated;
        });
        break;

      case 'NEW_ALERT':
        setAlerts(prev => [message.payload, ...prev]);
        break;

      case 'ALERT_ACKNOWLEDGED':
        setAlerts(prev => 
          prev.map(alert => 
            alert.id === message.payload.id 
              ? { ...alert, is_acknowledged: true, acknowledged_at: message.payload.acknowledged_at }
              : alert
          )
        );
        break;

      case 'NEW_ACTIVITY':
        setActivities(prev => [message.payload, ...prev.slice(0, 49)]); // Manter apenas 50 atividades
        break;

      case 'USER_ONLINE':
      case 'USER_OFFLINE':
        // Atualizar status de usuários online
        break;

      default:
        console.log('Tipo de mensagem WebSocket não reconhecido:', message.type);
    }
  }, []);

  const webSocket = useWebSocket({
    onMessage: handleMessage,
    onConnect: () => {
      console.log('WebSocket conectado para Admin Dashboard');
    },
    onDisconnect: () => {
      console.log('WebSocket desconectado do Admin Dashboard');
    }
  });

  return {
    ...webSocket,
    metrics,
    alerts,
    activities,
    setMetrics,
    setAlerts,
    setActivities
  };
}

// Hook para usar Supabase Realtime como alternativa ao WebSocket
export function useSupabaseRealtime() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Configurar canais de realtime do Supabase
    const metricsChannel = supabase
      .channel('admin_dashboard_metrics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'admin_dashboard_metrics' },
        (payload) => {
          console.log('Métrica atualizada:', payload);
          // Emitir evento customizado para componentes
          window.dispatchEvent(new CustomEvent('metric_updated', { detail: payload }));
        }
      )
      .subscribe();

    const alertsChannel = supabase
      .channel('system_alerts')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'system_alerts' },
        (payload) => {
          console.log('Alerta atualizado:', payload);
          window.dispatchEvent(new CustomEvent('alert_updated', { detail: payload }));
        }
      )
      .subscribe();

    const activitiesChannel = supabase
      .channel('system_activities')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'system_activities' },
        (payload) => {
          console.log('Nova atividade:', payload);
          window.dispatchEvent(new CustomEvent('activity_created', { detail: payload }));
        }
      )
      .subscribe();

    const usersChannel = supabase
      .channel('users')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('Usuário atualizado:', payload);
          window.dispatchEvent(new CustomEvent('user_updated', { detail: payload }));
        }
      )
      .subscribe();

    setIsConnected(true);

    return () => {
      metricsChannel.unsubscribe();
      alertsChannel.unsubscribe();
      activitiesChannel.unsubscribe();
      usersChannel.unsubscribe();
      setIsConnected(false);
    };
  }, []);

  return { isConnected };
}