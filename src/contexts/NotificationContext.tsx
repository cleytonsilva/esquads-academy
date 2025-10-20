import React, { createContext, useContext, useEffect, useRef } from 'react'
import { useNotifications as useNotificationsHook, Notification } from '@/hooks/useNotifications'
import { useAuth } from '@/contexts/AuthContext'

interface NotificationContextType {
  notifications: Notification[]
  stats: {
    total: number
    unread: number
    byType: Record<string, number>
  }
  createNotification: (
    type: Notification['type'],
    title: string,
    message: string,
    data?: any,
    expiresAt?: string
  ) => Promise<Notification | undefined>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  getUnreadNotifications: () => Notification[]
  getNotificationsByType: (type: Notification['type']) => Notification[]
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const notificationHook = useNotificationsHook()
  const welcomeCreatedRef = useRef(false)

  // Criar notificações automáticas para eventos importantes
  useEffect(() => {
    if (!user || !notificationHook.createNotification || notificationHook.loading || welcomeCreatedRef.current) return

    // Verificar se já existe notificação de boas-vindas
    const checkAndCreateWelcome = () => {
      const hasWelcomeNotification = notificationHook.notifications.some(
        n => n.type === 'info' && n.data?.welcome === true
      )

      if (!hasWelcomeNotification) {
        notificationHook.createNotification(
          'info',
          'Bem-vindo ao Esquads!',
          'Explore missões, conquiste achievements e desenvolva suas habilidades.',
          { welcome: true }
        )
        welcomeCreatedRef.current = true
      }
    }

    // Aguardar um pouco para as notificações carregarem
    const timer = setTimeout(checkAndCreateWelcome, 3000)
    return () => clearTimeout(timer)
  }, [user?.id, notificationHook.createNotification, notificationHook.loading]) // Dependências estáveis

  const contextValue: NotificationContextType = {
    notifications: notificationHook.notifications,
    stats: notificationHook.stats,
    createNotification: notificationHook.createNotification,
    markAsRead: notificationHook.markAsRead,
    markAllAsRead: notificationHook.markAllAsRead,
    deleteNotification: notificationHook.deleteNotification,
    getUnreadNotifications: notificationHook.getUnreadNotifications,
    getNotificationsByType: notificationHook.getNotificationsByType
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}

// Alias para compatibilidade
export const useNotifications = useNotificationContext

// Hook para criar notificações específicas
export function useNotificationHelpers() {
  const { createNotification } = useNotificationContext()

  const notifyAchievementUnlocked = async (achievementName: string, points: number) => {
    return await createNotification(
      'success',
      'Conquista Desbloqueada! 🏆',
      `Você desbloqueou "${achievementName}" e ganhou ${points} pontos!`,
      { achievementName, points, type: 'unlock' }
    )
  }

  const notifyMissionCompleted = async (missionTitle: string, points: number) => {
    return await createNotification(
      'success',
      'Missão Concluída! 🎯',
      `Parabéns! Você completou "${missionTitle}" e ganhou ${points} pontos!`,
      { missionTitle, points, type: 'completion' }
    )
  }

  const notifyBadgeEarned = async (badgeName: string) => {
    return await createNotification(
      'success',
      'Novo Badge Conquistado! 🏅',
      `Você ganhou o badge "${badgeName}"!`,
      { badgeName, type: 'earned' }
    )
  }

  const notifyLevelUp = async (newLevel: number, rewards?: any) => {
    return await createNotification(
      'info',
      'Level Up! 🚀',
      `Parabéns! Você alcançou o nível ${newLevel}!`,
      { newLevel, rewards, type: 'level_up' }
    )
  }

  const notifyStreakMilestone = async (streakDays: number) => {
    return await createNotification(
      'success',
      'Sequência Incrível! 🔥',
      `Você manteve uma sequência de ${streakDays} dias estudando!`,
      { streakDays, type: 'streak' }
    )
  }

  const notifyDailyReminder = async () => {
    return await createNotification(
      'warning',
      'Hora de Estudar! 📚',
      'Não se esqueça de completar suas missões diárias!',
      { type: 'daily_reminder' },
      // Expira em 24 horas
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    )
  }

  const notifySystemMaintenance = async (startTime: string, duration: string) => {
    return await createNotification(
      'info',
      'Manutenção Programada 🔧',
      `O sistema entrará em manutenção às ${startTime} por aproximadamente ${duration}.`,
      { startTime, duration, type: 'maintenance' }
    )
  }

  const notifyNewFeature = async (featureName: string, description: string) => {
    return await createNotification(
      'system',
      'Nova Funcionalidade! ✨',
      `Confira a nova funcionalidade: ${featureName}. ${description}`,
      { featureName, description, type: 'new_feature' }
    )
  }

  return {
    notifyAchievementUnlocked,
    notifyMissionCompleted,
    notifyBadgeEarned,
    notifyLevelUp,
    notifyStreakMilestone,
    notifyDailyReminder,
    notifySystemMaintenance,
    notifyNewFeature
  }
}