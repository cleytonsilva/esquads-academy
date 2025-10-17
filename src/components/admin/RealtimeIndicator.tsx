import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtimeIndicatorProps {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastUpdate?: string;
  className?: string;
}

export function RealtimeIndicator({ 
  isConnected, 
  connectionStatus, 
  lastUpdate,
  className 
}: RealtimeIndicatorProps) {
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Conectado',
          variant: 'default' as const,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          description: 'Atualizações em tempo real ativas'
        };
      case 'connecting':
        return {
          icon: Clock,
          text: 'Conectando',
          variant: 'secondary' as const,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          description: 'Estabelecendo conexão...'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Erro',
          variant: 'destructive' as const,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          description: 'Erro na conexão. Tentando reconectar...'
        };
      default:
        return {
          icon: WifiOff,
          text: 'Desconectado',
          variant: 'outline' as const,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          description: 'Sem conexão em tempo real'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const formatLastUpdate = (timestamp?: string) => {
    if (!timestamp) return 'Nunca';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
      return 'Agora mesmo';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            <Badge 
              variant={config.variant}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1",
                config.bgColor,
                config.color
              )}
            >
              <Icon className="h-3 w-3" />
              <span className="text-xs font-medium">{config.text}</span>
            </Badge>
            
            {connectionStatus === 'connected' && (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  Tempo real
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{config.description}</p>
            {lastUpdate && (
              <p className="text-xs text-muted-foreground">
                Última atualização: {formatLastUpdate(lastUpdate)}
              </p>
            )}
            {connectionStatus === 'connected' && (
              <div className="text-xs text-muted-foreground">
                <p>✓ Métricas em tempo real</p>
                <p>✓ Alertas instantâneos</p>
                <p>✓ Atividades ao vivo</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Componente para mostrar usuários online
interface OnlineUsersIndicatorProps {
  onlineUsers: string[];
  totalUsers: number;
  className?: string;
}

export function OnlineUsersIndicator({ 
  onlineUsers, 
  totalUsers, 
  className 
}: OnlineUsersIndicatorProps) {
  const onlineCount = onlineUsers.length;
  const percentage = totalUsers > 0 ? Math.round((onlineCount / totalUsers) * 100) : 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium">{onlineCount}</span>
              <span className="text-sm text-muted-foreground">online</span>
            </div>
            <div className="text-xs text-muted-foreground">
              de {totalUsers} usuários
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">Usuários Online</p>
            <p className="text-sm">{onlineCount} de {totalUsers} usuários ({percentage}%)</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Componente para notificações em tempo real
interface RealtimeNotificationBadgeProps {
  count: number;
  className?: string;
  onClick?: () => void;
}

export function RealtimeNotificationBadge({ 
  count, 
  className, 
  onClick 
}: RealtimeNotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className={cn(
        "h-5 w-5 p-0 flex items-center justify-center text-xs cursor-pointer",
        "animate-pulse",
        className
      )}
      onClick={onClick}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
}