import React from 'react';
import { Trophy, Star, Zap, Target, Award, Crown } from 'lucide-react';
import { Achievement } from '@/types/gamification';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

const achievementIcons = {
  first_mission: Target,
  mission_streak: Zap,
  simulation_master: Trophy,
  xp_milestone: Star,
  perfect_score: Award,
  speed_demon: Zap,
  certification_expert: Crown,
  level_up: Star
};

const rarityColors = {
  common: 'border-gray-400 bg-gray-800 text-gray-300',
  rare: 'border-blue-400 bg-blue-900 text-blue-300',
  epic: 'border-purple-400 bg-purple-900 text-purple-300',
  legendary: 'border-yellow-400 bg-yellow-900 text-yellow-300'
};

const sizeClasses = {
  sm: 'w-8 h-8 p-1',
  md: 'w-12 h-12 p-2',
  lg: 'w-16 h-16 p-3'
};

export function AchievementBadge({ 
  achievement, 
  size = 'md', 
  showDetails = false,
  className = '' 
}: AchievementBadgeProps) {
  const IconComponent = achievementIcons[achievement.achievement_type as keyof typeof achievementIcons] || Trophy;
  const rarity = (achievement.metadata?.rarity as keyof typeof rarityColors) || 'common';
  
  return (
    <div className={`group relative ${className}`}>
      {/* Badge principal */}
      <div 
        className={`
          ${sizeClasses[size]} 
          ${rarityColors[rarity]}
          border-2 rounded-lg flex items-center justify-center
          transition-all duration-300 hover:scale-110 hover:brightness-125
          cursor-pointer
        `}
        style={{
          filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.8))',
          imageRendering: 'pixelated'
        }}
      >
        <IconComponent className="w-full h-full" />
        
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-20 rounded-lg" />
      </div>
      
      {/* Tooltip com detalhes */}
      {showDetails && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="bg-gray-900 border-2 border-green-400 p-3 rounded-lg min-w-48">
            <div className="text-green-400 font-mono text-sm font-bold mb-1">
              {achievement.achievement_name}
            </div>
            <div className="text-green-300 font-mono text-xs mb-2">
              {achievement.description}
            </div>
            <div className="text-gray-400 font-mono text-xs">
              Conquistado em: {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
            </div>
            
            {/* Seta do tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="border-l-4 border-r-4 border-t-4 border-transparent border-t-green-400" />
            </div>
          </div>
        </div>
      )}
      
      {/* Animação de conquista recente */}
      {achievement.metadata?.isNew && (
        <div className="absolute inset-0 animate-ping">
          <div className={`${sizeClasses[size]} ${rarityColors[rarity]} border-2 rounded-lg opacity-75`} />
        </div>
      )}
    </div>
  );
}