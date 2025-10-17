import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Heart,
  MessageCircle,
  Users,
  Trophy,
  AtSign,
  Mail,
  Trash2,
  Settings
} from 'lucide-react';
import { useSocialNotifications, SocialNotification } from '@/hooks/useSocialNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getNotificationIcon = (type: SocialNotification['notification_type']) => {
  switch (type) {
    case 'like':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'comment':
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case 'message':
      return <Mail className="h-4 w-4 text-green-500" />;
    case 'group_invite':
      return <Users className="h-4 w-4 text-purple-500" />;
    case 'achievement':
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case 'mention':
      return <AtSign className="h-4 w-4 text-orange-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: SocialNotification['notification_type']) => {
  switch (type) {
    case 'like':
      return 'bg-red-50 border-red-200';
    case 'comment':
      return 'bg-blue-50 border-blue-200';
    case 'message':
      return 'bg-green-50 border-green-200';
    case 'group_invite':
      return 'bg-purple-50 border-purple-200';
    case 'achievement':
      return 'bg-yellow-50 border-yellow-200';
    case 'mention':
      return 'bg-orange-50 border-orange-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { unreadCount } = useSocialNotifications();

  return (
    <div className={`relative ${className}`}>
      {unreadCount > 0 ? (
        <BellRing className="h-5 w-5 text-blue-600" />
      ) : (
        <Bell className="h-5 w-5 text-gray-600" />
      )}
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  );
}

interface NotificationDropdownProps {
  children: React.ReactNode;
}

export function NotificationDropdown({ children }: NotificationDropdownProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useSocialNotifications();

  const [showAll, setShowAll] = useState(false);
  const displayNotifications = showAll ? notifications : notifications.slice(0, 5);

  const handleNotificationClick = async (notification: SocialNotification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    // Here you could add navigation logic based on notification type
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-6 px-2 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Carregando notificações...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Nenhuma notificação
          </div>
        ) : (
          <ScrollArea className="h-80">
            {displayNotifications.map((notification) => (
              <div key={notification.id}>
                <DropdownMenuItem
                  className={`p-3 cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0">
                      {notification.sender?.avatar_url ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={notification.sender.avatar_url} />
                          <AvatarFallback>
                            {notification.sender.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {getNotificationIcon(notification.notification_type)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />
                        )}
                      </div>
                      
                      {notification.content && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.content}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
                <Separator />
              </div>
            ))}
            
            {notifications.length > 5 && !showAll && (
              <DropdownMenuItem
                className="text-center text-blue-600 hover:text-blue-800"
                onClick={() => setShowAll(true)}
              >
                Ver todas as notificações ({notifications.length})
              </DropdownMenuItem>
            )}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SocialNotifications() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useSocialNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const handleNotificationClick = async (notification: SocialNotification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Não lidas
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Carregando notificações...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                    !notification.is_read 
                      ? getNotificationColor(notification.notification_type)
                      : 'bg-white border-gray-200'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {notification.sender?.avatar_url ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={notification.sender.avatar_url} />
                          <AvatarFallback>
                            {notification.sender.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {getNotificationIcon(notification.notification_type)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />
                        )}
                      </div>
                      
                      {notification.content && (
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.content}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Marcar como lida
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}