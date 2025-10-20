/**
 * ============================================================================
 * NOTIFICATION TOAST COMPONENT
 * ============================================================================
 * 
 * Toast de notificação discreto com auto-hide
 * Usado para: badges comuns, feedback IA, progresso de trilha
 * 
 * Features:
 * - Auto-hide após 4 segundos
 * - Animações suaves de entrada/saída
 * - Ícones contextuais por categoria
 * - Suporte a múltiplos toasts simultâneos
 * - Responsivo
 */

import React, { useEffect, useState } from 'react';
import { X, Zap, Award, Trophy, Star, CheckCircle, Info, AlertCircle, MessageCircle } from 'lucide-react';
import { Notification, NotificationCategory } from '@/services/notificationService';

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
  autoHideDuration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  autoHideDuration = 4000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Animação de entrada
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  // Auto-hide timer
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, [autoHideDuration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // Duração da animação de saída
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    const icons: Record<NotificationCategory, React.ReactNode> = {
      xp: <Zap className="h-5 w-5 text-yellow-500" />,
      badge: <Award className="h-5 w-5 text-blue-500" />,
      mission: <Trophy className="h-5 w-5 text-purple-500" />,
      certificate: <Star className="h-5 w-5 text-green-500" />,
      level: <Trophy className="h-5 w-5 text-orange-500" />,
      reputation: <Star className="h-5 w-5 text-indigo-500" />,
      hint: <Info className="h-5 w-5 text-cyan-500" />,
      feedback: <MessageCircle className="h-5 w-5 text-teal-500" />,
      exam: <CheckCircle className="h-5 w-5 text-green-500" />,
      achievement: <Trophy className="h-5 w-5 text-yellow-500" />,
      social: <MessageCircle className="h-5 w-5 text-pink-500" />,
      system: <AlertCircle className="h-5 w-5 text-gray-500" />
    };
    return icons[category];
  };

  const getCategoryColor = (category: NotificationCategory): string => {
    const colors: Record<NotificationCategory, string> = {
      xp: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      badge: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      mission: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      certificate: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      level: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      reputation: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
      hint: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800',
      feedback: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
      exam: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      achievement: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      social: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
      system: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    };
    return colors[category];
  };

  return (
    <div
      className={`
        ${getCategoryColor(notification.category)}
        border rounded-lg shadow-lg p-4 mb-3 
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'translate-x-full opacity-0' : ''}
        max-w-md w-full
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getCategoryIcon(notification.category)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {notification.title}
            {notification.grouped_count > 1 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (+{notification.grouped_count - 1} similar)
              </span>
            )}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
          aria-label="Fechar notificação"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar (auto-hide indicator) */}
      <div className="mt-3 h-1 bg-muted/30 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary/40 transition-all ease-linear"
          style={{
            width: '100%',
            animation: `shrink ${autoHideDuration}ms linear forwards`
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;

