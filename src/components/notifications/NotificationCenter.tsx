// Esquads Academy - Centro de Notificações

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter,
  Search,
  Trophy,
  Target,
  Medal,
  Settings,
  Clock,
  X,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    loading,
    error,
    stats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearOldNotifications
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Filtrar notificações
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filtro por aba
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (activeTab === 'read') {
      filtered = filtered.filter(n => n.is_read);
    }

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    // Filtro por status
    if (statusFilter === 'read') {
      filtered = filtered.filter(n => n.is_read);
    } else if (statusFilter === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [notifications, activeTab, typeFilter, statusFilter, searchTerm]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 'mission':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'badge':
        return <Medal className="h-4 w-4 text-purple-600" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-600" />;
      case 'reminder':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      toast.success('Notificação marcada como lida');
    } catch (error) {
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('Todas as notificações marcadas como lidas');
    } catch (error) {
      toast.error('Erro ao marcar todas as notificações como lidas');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      toast.success('Notificação excluída');
    } catch (error) {
      toast.error('Erro ao excluir notificação');
    }
  };

  const handleClearOld = async () => {
    try {
      await clearOldNotifications();
      toast.success('Notificações antigas removidas');
    } catch (error) {
      toast.error('Erro ao limpar notificações antigas');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Central de Notificações
              </h2>
              <p className="text-sm text-gray-500">
                {stats.total} notificações • {stats.unread} não lidas
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={stats.unread === 0}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleClearOld}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar antigas (30+ dias)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar notificações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="achievement">Conquistas</SelectItem>
                  <SelectItem value="mission">Missões</SelectItem>
                  <SelectItem value="badge">Badges</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="reminder">Lembretes</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="unread">Não lidas</SelectItem>
                  <SelectItem value="read">Lidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Todas ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                <BellOff className="h-4 w-4" />
                Não lidas ({stats.unread})
              </TabsTrigger>
              <TabsTrigger value="read" className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Lidas ({stats.read})
              </TabsTrigger>
            </TabsList>

            <div className="p-6 h-[500px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-red-600">
                  <p>Erro ao carregar notificações: {error}</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Bell className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhuma notificação encontrada</p>
                  <p className="text-sm">Tente ajustar os filtros ou aguarde novas notificações</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                          "p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                          notification.is_read 
                            ? "bg-gray-50 border-gray-200" 
                            : "bg-white border-blue-200 shadow-sm"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {getIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className={cn(
                                  "text-sm font-medium truncate",
                                  notification.is_read ? "text-gray-700" : "text-gray-900"
                                )}>
                                  {notification.title}
                                </h4>
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                                )}
                              </div>
                              
                              <p className={cn(
                                "text-sm mt-1",
                                notification.is_read ? "text-gray-500" : "text-gray-700"
                              )}>
                                {notification.message}
                              </p>
                              
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
                                </div>
                              )}
                              
                              <p className="text-xs text-gray-400 mt-2">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-4">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationCenter;