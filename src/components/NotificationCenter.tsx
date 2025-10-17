import React, { useState } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  Trophy,
  Target,
  Medal,
  Settings,
  Clock,
  X,
  Filter
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const {
    notifications,
    loading,
    stats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearOldNotifications,
    getNotificationsByType,
    getUnreadNotifications
  } = useNotifications()

  const [activeTab, setActiveTab] = useState('all')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-600" />
      case 'mission':
        return <Target className="w-4 h-4 text-blue-600" />
      case 'badge':
        return <Medal className="w-4 h-4 text-purple-600" />
      case 'system':
        return <Settings className="w-4 h-4 text-gray-600" />
      case 'reminder':
        return <Clock className="w-4 h-4 text-orange-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getFilteredNotifications = () => {
    let filtered = notifications

    if (activeTab !== 'all') {
      filtered = getNotificationsByType(activeTab as any)
    }

    switch (filter) {
      case 'unread':
        return filtered.filter(n => !n.is_read)
      case 'read':
        return filtered.filter(n => n.is_read)
      default:
        return filtered
    }
  }

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-end p-4">
      <Card className="w-96 max-h-[80vh] bg-white shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BellRing className="w-5 h-5" />
              <span>Notificações</span>
              {stats.unread > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.unread}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filtros</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    Todas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('unread')}>
                    Não lidas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('read')}>
                    Lidas
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={markAllAsRead}>
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Marcar todas como lidas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={clearOldNotifications}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar antigas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4">
              <TabsList className="grid w-full grid-cols-5 text-xs">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="achievement">
                  <Trophy className="w-3 h-3" />
                </TabsTrigger>
                <TabsTrigger value="mission">
                  <Target className="w-3 h-3" />
                </TabsTrigger>
                <TabsTrigger value="badge">
                  <Medal className="w-3 h-3" />
                </TabsTrigger>
                <TabsTrigger value="system">
                  <Settings className="w-3 h-3" />
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-96 px-4 mt-4">
              <TabsContent value={activeTab} className="mt-0">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Carregando notificações...
                  </div>
                ) : getFilteredNotifications().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>Nenhuma notificação encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getFilteredNotifications().map((notification, index) => (
                      <div key={notification.id}>
                        <div
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            notification.is_read
                              ? 'bg-gray-50 hover:bg-gray-100'
                              : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                          }`}
                          onClick={() => handleNotificationClick(notification.id, notification.is_read)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className={`text-sm font-medium ${
                                  notification.is_read ? 'text-gray-700' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  {!notification.is_read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        markAsRead(notification.id)
                                      }}
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteNotification(notification.id)
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className={`text-xs mt-1 ${
                                notification.is_read ? 'text-gray-500' : 'text-gray-700'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </p>
                              {notification.data && (
                                <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
                                  <pre className="whitespace-pre-wrap">
                                    {JSON.stringify(notification.data, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {index < getFilteredNotifications().length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para o ícone de notificação na navbar
export function NotificationBell() {
  const { stats } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="w-5 h-5" />
        {stats.unread > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
          >
            {stats.unread > 99 ? '99+' : stats.unread}
          </Badge>
        )}
      </Button>
      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}