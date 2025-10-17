// Esquads Academy - Sistema de Notificações Global

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Trophy, 
  Star, 
  Gift,
  Zap,
  Bell,
  Target,
  Medal,
  Settings,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = React.forwardRef<HTMLDivElement, NotificationItemProps>(
  ({ notification, onDismiss, onMarkAsRead }, ref) => {
  const [isVisible, setIsVisible] = useState(true);

  const getIcon = () => {
    switch (notification.type) {
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'mission':
        return <Target className="h-5 w-5 text-blue-600" />;
      case 'badge':
        return <Medal className="h-5 w-5 text-purple-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'achievement':
        return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200';
      case 'mission':
        return 'bg-blue-50 border-blue-200';
      case 'badge':
        return 'bg-purple-50 border-purple-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      case 'reminder':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  // Auto-dismiss after 8 seconds for non-achievement notifications
  useEffect(() => {
    if (notification.type !== 'achievement' && notification.type !== 'badge') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [notification.type]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        x: isVisible ? 0 : 300, 
        scale: isVisible ? 1 : 0.9 
      }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative p-4 rounded-lg border shadow-lg backdrop-blur-sm",
        "max-w-sm w-full cursor-pointer transition-all duration-200",
        "hover:shadow-xl hover:scale-105",
        getBackgroundColor(),
        !notification.is_read && "ring-2 ring-blue-200"
      )}
      onClick={handleClick}
    >
      {/* Indicador de não lida */}
      {!notification.is_read && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}

      {/* Botão de fechar */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-white/50"
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
      >
        <X className="h-3 w-3" />
      </Button>

      <div className="flex items-start space-x-3">
        {/* Ícone */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {notification.title}
            </h4>
            {(notification.type === 'achievement' || notification.type === 'badge') && (
              <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                <Gift className="h-3 w-3 mr-1" />
                Nova!
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-700 mt-1 leading-relaxed">
            {notification.message}
          </p>

          {/* Dados adicionais */}
          {notification.data && (
            <div className="mt-2 flex items-center space-x-2 flex-wrap">
              {notification.data.points && (
                <Badge variant="outline" className="text-xs">
                  +{notification.data.points} pontos
                </Badge>
              )}
              {notification.data.achievementName && (
                <Badge variant="outline" className="text-xs">
                  {notification.data.achievementName}
                </Badge>
              )}
              {notification.data.missionTitle && (
                <Badge variant="outline" className="text-xs">
                  {notification.data.missionTitle}
                </Badge>
              )}
              {notification.data.badgeName && (
                <Badge variant="outline" className="text-xs">
                  {notification.data.badgeName}
                </Badge>
              )}
              {notification.data.newLevel && (
                <Badge variant="outline" className="text-xs">
                  Nível {notification.data.newLevel}
                </Badge>
              )}
              {notification.data.streakDays && (
                <Badge variant="outline" className="text-xs">
                  {notification.data.streakDays} dias
                </Badge>
              )}
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-500 mt-2">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: ptBR
            })}
          </p>
        </div>
      </div>

      {/* Animação especial para conquistas e badges */}
      {(notification.type === 'achievement' || notification.type === 'badge') && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute -top-2 -right-2"
        >
          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <Star className="h-3 w-3 text-white" />
          </div>
        </motion.div>
      )}

      {/* Efeito de brilho para conquistas */}
      {notification.type === 'achievement' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-orange-200/20 rounded-lg pointer-events-none"
        />
      )}
    </motion.div>
  );
});

NotificationItem.displayName = 'NotificationItem';

export const GlobalNotifications: React.FC = () => {
  const { 
    notifications, 
    deleteNotification, 
    markAsRead,
    getRecentNotifications 
  } = useNotifications();
  
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  // Manter apenas as últimas 5 notificações recentes visíveis
  useEffect(() => {
    const recent = getRecentNotifications(24) // Últimas 24 horas
      .filter(n => !n.is_read) // Apenas não lidas
      .slice(0, 5); // Máximo 5
    setVisibleNotifications(recent);
  }, [notifications, getRecentNotifications]);

  const handleDismiss = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Erro ao dispensar notificação:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={handleDismiss}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </AnimatePresence>

      {/* Indicador de notificações quando há muitas */}
      {unreadCount > 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2 text-center shadow-lg"
        >
          <div className="flex items-center justify-center space-x-2">
            <Bell className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-600">
              +{unreadCount - 5} notificações não lidas
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GlobalNotifications;
