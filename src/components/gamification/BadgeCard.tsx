// Esquads Academy - Componente de Badge

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Trophy, Crown } from 'lucide-react';
import type { Badge as BadgeType } from '@/types/gamification';

interface BadgeCardProps {
  badge: BadgeType;
  earned?: boolean;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function BadgeCard({ 
  badge, 
  earned = false, 
  earnedAt, 
  size = 'md',
  showDetails = true 
}: BadgeCardProps) {
  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return Crown;
      case 'epic':
        return Trophy;
      case 'rare':
        return Star;
      default:
        return Award;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      case 'epic':
        return 'from-purple-400 to-pink-500';
      case 'rare':
        return 'from-blue-400 to-cyan-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'w-16 h-16',
          icon: 'h-6 w-6',
          text: 'text-xs'
        };
      case 'lg':
        return {
          card: 'w-32 h-32',
          icon: 'h-12 w-12',
          text: 'text-lg'
        };
      default:
        return {
          card: 'w-24 h-24',
          icon: 'h-8 w-8',
          text: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const RarityIcon = getRarityIcon(badge.rarity);
  const rarityGradient = getRarityColor(badge.rarity);

  return (
    <div className="group relative">
      <Card className={`
        ${sizeClasses.card} 
        ${earned ? 'opacity-100' : 'opacity-50 grayscale'}
        transition-all duration-300 hover:scale-105 cursor-pointer
        ${earned ? 'shadow-lg hover:shadow-xl' : ''}
      `}>
        <CardContent className="p-0 h-full flex flex-col items-center justify-center relative overflow-hidden">
          {/* Background gradient */}
          <div className={`
            absolute inset-0 bg-gradient-to-br ${rarityGradient} opacity-20
          `} />
          
          {/* Badge icon */}
          <div className="relative z-10 flex flex-col items-center">
            <RarityIcon 
              className={`${sizeClasses.icon} text-gray-600`}
              style={{ color: badge.color }}
            />
            
            {size !== 'sm' && (
              <span className={`${sizeClasses.text} font-medium text-center mt-1 text-gray-700`}>
                {badge.name}
              </span>
            )}
          </div>

          {/* Earned indicator */}
          {earned && (
            <div className="absolute top-1 right-1">
              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tooltip/Details */}
      {showDetails && (
        <div className="
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
          bg-black text-white text-xs rounded-lg px-3 py-2 
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none z-20 w-48
        ">
          <div className="font-semibold">{badge.name}</div>
          <div className="text-gray-300 mt-1">{badge.description}</div>
          
          <div className="flex items-center justify-between mt-2">
            <Badge variant="secondary" className="text-xs">
              {badge.rarity}
            </Badge>
            {badge.points_required && (
              <span className="text-xs text-gray-300">
                {badge.points_required} pts
              </span>
            )}
          </div>

          {earned && earnedAt && (
            <div className="text-xs text-green-300 mt-1">
              Conquistado em {new Date(earnedAt).toLocaleDateString('pt-BR')}
            </div>
          )}

          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
        </div>
      )}
    </div>
  );
}
