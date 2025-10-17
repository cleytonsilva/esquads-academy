// Esquads Academy - Componente de Notificação de Recompensa

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Award, 
  TrendingUp, 
  X, 
  Sparkles,
  Trophy,
  Crown
} from 'lucide-react';
import { formatPoints } from '@/utils/format';
import type { Reward } from '@/types/gamification';

interface RewardNotificationProps {
  rewards: Reward[];
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function RewardNotification({ 
  rewards, 
  onClose, 
  autoClose = true,
  autoCloseDelay = 5000 
}: RewardNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (rewards.length > 0) {
      setIsVisible(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [rewards, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Aguarda animação
  };

  if (rewards.length === 0 || !isVisible) {
    return null;
  }

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'points':
        return Star;
      case 'badge':
        return Award;
      case 'level_up':
        return Trophy;
      default:
        return Sparkles;
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'points':
        return 'from-yellow-400 to-orange-500';
      case 'badge':
        return 'from-purple-400 to-pink-500';
      case 'level_up':
        return 'from-blue-400 to-cyan-500';
      default:
        return 'from-green-400 to-emerald-500';
    }
  };

  const primaryReward = rewards[0];
  const RewardIcon = getRewardIcon(primaryReward.type);
  const gradientColor = getRewardColor(primaryReward.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`
        transform transition-all duration-300 ease-out
        ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 overflow-hidden">
          {/* Header com gradiente */}
          <div className={`
            bg-gradient-to-r ${gradientColor} p-6 text-white relative
          `}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-2 right-2 text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                <RewardIcon className="h-8 w-8" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">
                {primaryReward.type === 'level_up' ? 'Parabéns!' : 'Recompensa!'}
              </h2>
              
              <p className="text-white text-opacity-90">
                {primaryReward.message}
              </p>
            </div>

            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 animate-pulse" />
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Lista de recompensas */}
            <div className="space-y-3">
              {rewards.map((reward, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {reward.type === 'points' && (
                      <>
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Star className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            +{formatPoints(reward.value)} Pontos
                          </p>
                          <p className="text-sm text-gray-600">
                            {reward.message}
                          </p>
                        </div>
                      </>
                    )}

                    {reward.type === 'badge' && reward.badge && (
                      <>
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Award className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {reward.badge.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {reward.badge.description}
                          </p>
                        </div>
                      </>
                    )}

                    {reward.type === 'level_up' && (
                      <>
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Nível {reward.level}
                          </p>
                          <p className="text-sm text-gray-600">
                            Você subiu de nível!
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Badge de raridade para badges */}
                  {reward.type === 'badge' && reward.badge && (
                    <Badge 
                      variant="secondary" 
                      className={`
                        ${reward.badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${reward.badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' : ''}
                        ${reward.badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' : ''}
                        ${reward.badge.rarity === 'common' ? 'bg-gray-100 text-gray-800' : ''}
                      `}
                    >
                      {reward.badge.rarity}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Botão de fechar */}
            <Button 
              onClick={handleClose}
              className="w-full"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Continuar
            </Button>

            {/* Indicador de auto-close */}
            {autoClose && (
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Esta notificação será fechada automaticamente
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
