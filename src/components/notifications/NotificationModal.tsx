/**
 * ============================================================================
 * NOTIFICATION MODAL COMPONENT
 * ============================================================================
 * 
 * Modal para notificações importantes que exigem atenção do usuário
 * Usado para: level up, certificados obtidos, missões concluídas
 * 
 * Features:
 * - Animações de entrada/saída suaves
 * - Confetti animation para celebrações
 * - Backdrop blur
 * - Botão de ação primária
 * - Responsivo e acessível
 */

import React, { useEffect, useState } from 'react';
import { X, Trophy, Award, Star, CheckCircle, Zap, ChevronRight } from 'lucide-react';
import { Notification } from '@/services/notificationService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface NotificationModalProps {
  notification: Notification;
  onClose: () => void;
  onAction?: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  onClose,
  onAction
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setIsOpen(true);
    
    // Mostrar confetti para conquistas especiais
    if (['level', 'certificate', 'achievement'].includes(notification.category)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [notification.category]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const handleAction = () => {
    onAction?.();
    handleClose();
  };

  const getIcon = () => {
    switch (notification.category) {
      case 'level':
        return <Trophy className="h-16 w-16 text-yellow-500" />;
      case 'certificate':
        return <Award className="h-16 w-16 text-green-500" />;
      case 'mission':
        return <CheckCircle className="h-16 w-16 text-purple-500" />;
      case 'achievement':
        return <Star className="h-16 w-16 text-orange-500" />;
      default:
        return <Zap className="h-16 w-16 text-blue-500" />;
    }
  };

  const getGradient = () => {
    switch (notification.category) {
      case 'level':
        return 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20';
      case 'certificate':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20';
      case 'mission':
        return 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20';
      case 'achievement':
        return 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20';
      default:
        return 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20';
    }
  };

  const getActionLabel = () => {
    switch (notification.category) {
      case 'level':
        return 'Ver Recompensas';
      case 'certificate':
        return 'Ver Certificado';
      case 'mission':
        return 'Ver Detalhes';
      case 'achievement':
        return 'Ver Conquistas';
      default:
        return 'Ver Mais';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          {/* Icon Header com gradiente */}
          <div className={`${getGradient()} -mx-6 -mt-6 px-6 pt-8 pb-6 rounded-t-lg`}>
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="mb-4 relative">
                <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-full blur-xl opacity-50" />
                <div className="relative">
                  {getIcon()}
                </div>
              </div>

              {/* Title */}
              <DialogTitle className="text-2xl font-bold text-foreground mb-2">
                {notification.title}
              </DialogTitle>

              {/* Message */}
              <DialogDescription className="text-base text-muted-foreground">
                {notification.message}
              </DialogDescription>

              {/* Grouped count indicator */}
              {notification.grouped_count > 1 && (
                <div className="mt-3 inline-flex items-center space-x-1 px-3 py-1 bg-white/50 dark:bg-gray-900/50 rounded-full text-sm">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">
                    +{notification.grouped_count - 1} conquistas similares
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payload details (se houver) */}
          {notification.payload && Object.keys(notification.payload).length > 0 && (
            <div className="mt-4 space-y-2">
              {notification.category === 'level' && notification.payload.level && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Novo Nível</span>
                  <span className="text-2xl font-bold text-primary">
                    {notification.payload.level}
                  </span>
                </div>
              )}

              {notification.category === 'mission' && notification.payload.rewards && (
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Recompensas:</div>
                  {notification.payload.rewards.xp && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center space-x-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span>XP Ganho</span>
                      </span>
                      <span className="font-semibold">+{notification.payload.rewards.xp}</span>
                    </div>
                  )}
                  {notification.payload.rewards.badges && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center space-x-1">
                        <Award className="h-4 w-4 text-blue-500" />
                        <span>Badges</span>
                      </span>
                      <span className="font-semibold">{notification.payload.rewards.badges}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Fechar
            </Button>
            <Button
              onClick={handleAction}
              className="flex-1"
            >
              {getActionLabel()}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 10}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div 
                className={`
                  w-2 h-2 
                  ${['bg-yellow-500', 'bg-blue-500', 'bg-pink-500', 'bg-purple-500', 'bg-green-500'][Math.floor(Math.random() * 5)]}
                  rounded-sm
                `}
              />
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </>
  );
};

export default NotificationModal;

