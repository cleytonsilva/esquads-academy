import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface Notification {
  id: string
  user_id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  data?: any
  is_read: boolean
  created_at: string
  expires_at?: string
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<string, number>
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {}
  })
  
  // Ref para evitar dependências circulares
  const loadNotificationsRef = useRef<() => Promise<void>>()

  // Calcular estatísticas
  const calculateStats = useCallback((notificationList: Notification[]) => {
    const stats: NotificationStats = {
      total: notificationList.length,
      unread: notificationList.filter(n => !n.is_read).length,
      byType: {}
    }

    notificationList.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1
    })

    setStats(stats)
  }, [])

  // Carregar notificações
  const loadNotifications = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError

      setNotifications(data || [])
      calculateStats(data || [])
    } catch (err) {
      console.error('Erro ao carregar notificações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [user, calculateStats])

  // Atualizar ref
  useEffect(() => {
    loadNotificationsRef.current = loadNotifications
  }, [loadNotifications])

  // Criar notificação
  const createNotification = useCallback(async (
    type: Notification['type'],
    title: string,
    message: string,
    data?: any,
    expiresAt?: string
  ) => {
    if (!user) return

    try {
      const notification = {
        user_id: user.id,
        type,
        title,
        message,
        data,
        expires_at: expiresAt,
        is_read: false
      }

      const { data: newNotification, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single()

      if (error) throw error

      // Atualizar lista local
      setNotifications(prev => {
        const updated = [newNotification, ...prev]
        calculateStats(updated)
        return updated
      })

      return newNotification
    } catch (err) {
      console.error('Erro ao criar notificação:', err)
      throw err
    }
  }, [user, calculateStats])

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (error) throw error

      // Atualizar estado local
      setNotifications(prev => {
        const updated = prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
        calculateStats(updated)
        return updated
      })
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err)
      throw err
    }
  }, [calculateStats])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      // Atualizar estado local
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, is_read: true }))
        calculateStats(updated)
        return updated
      })
    } catch (err) {
      console.error('Erro ao marcar todas as notificações como lidas:', err)
      throw err
    }
  }, [user, calculateStats])

  // Deletar notificação
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      // Atualizar estado local
      setNotifications(prev => {
        const updated = prev.filter(n => n.id !== notificationId)
        calculateStats(updated)
        return updated
      })
    } catch (err) {
      console.error('Erro ao deletar notificação:', err)
      throw err
    }
  }, [calculateStats])

  // Limpar notificações antigas (30 dias)
  const clearOldNotifications = useCallback(async () => {
    if (!user) return

    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .lt('created_at', thirtyDaysAgo.toISOString())

      if (error) throw error

      // Recarregar usando ref para evitar dependência circular
      if (loadNotificationsRef.current) {
        await loadNotificationsRef.current()
      }
    } catch (err) {
      console.error('Erro ao limpar notificações antigas:', err)
      throw err
    }
  }, [user])

  // Filtrar notificações
  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(n => n.type === type)
  }, [notifications])

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.is_read)
  }, [notifications])

  const getRecentNotifications = useCallback((hours: number = 24) => {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - hours)
    
    return notifications.filter(n => 
      new Date(n.created_at) > cutoff
    )
  }, [notifications])

  // Configurar realtime
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => {
            const updated = [newNotification, ...prev]
            calculateStats(updated)
            return updated
          })

          // Mostrar toast para nova notificação
          toast.info(newNotification.title, {
            description: newNotification.message,
            duration: 5000
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          setNotifications(prev =>
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const deletedId = payload.old.id
          setNotifications(prev => prev.filter(n => n.id !== deletedId))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, calculateStats])

  // Carregar notificações ao montar - usando ref para evitar dependência circular
  useEffect(() => {
    if (loadNotificationsRef.current) {
      loadNotificationsRef.current()
    }
  }, [user])

  // Limpar notificações expiradas
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setNotifications(prev =>
        prev.filter(n => !n.expires_at || new Date(n.expires_at) > now)
      )
    }, 60000) // Verificar a cada minuto

    return () => clearInterval(interval)
  }, [])

  return {
    // Estados
    notifications,
    loading,
    error,
    stats,

    // Ações
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearOldNotifications,
    loadNotifications,

    // Consultas
    getNotificationsByType,
    getUnreadNotifications,
    getRecentNotifications
  }
}