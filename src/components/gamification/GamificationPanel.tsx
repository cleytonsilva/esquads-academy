import React from 'react';
import { useGamification } from '@/hooks/useGamification';
import { XPBar } from './XPBar';
import { LifeCounter } from './LifeCounter';
import { AchievementBadge } from './AchievementBadge';
import { Loader2, Trophy } from 'lucide-react';

interface GamificationPanelProps {
  className?: string;
  compact?: boolean;
}

export function GamificationPanel({ className = '', compact = false }: GamificationPanelProps) {
  const { 
    userStats, 
    achievements, 
    levelProgress, 
    lifeSystem, 
    isLoading 
  } = useGamification();

  if (isLoading) {
    return (
      <div className={`bg-gray-900 border-2 border-green-400 p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
          <span className="ml-2 text-green-400 font-mono">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!userStats || !levelProgress || !lifeSystem) {
    return (
      <div className={`bg-gray-900 border-2 border-red-400 p-4 ${className}`}>
        <div className="text-red-400 font-mono text-center">
          Erro ao carregar dados de gamificação
        </div>
      </div>
    );
  }

  const recentAchievements = achievements?.slice(0, compact ? 3 : 5) || [];

  return (
    <div className={`bg-gray-900 border-2 border-green-400 p-4 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-green-400 font-mono text-lg font-bold">
          {compact ? 'STATS' : 'GAMIFICAÇÃO'}
        </h3>
        <div className="text-green-300 font-mono text-sm">
          Total: {userStats.total_xp} XP
        </div>
      </div>

      {/* XP e Nível */}
      <XPBar levelProgress={levelProgress} />

      {/* Sistema de Vidas */}
      <LifeCounter lifeSystem={lifeSystem} />

      {/* Conquistas Recentes */}
      {recentAchievements.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-mono text-sm font-bold">
              {compact ? 'BADGES' : 'CONQUISTAS RECENTES'}
            </span>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {recentAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                size={compact ? 'sm' : 'md'}
                showDetails={!compact}
              />
            ))}
          </div>
          
          {achievements && achievements.length > recentAchievements.length && (
            <div className="text-gray-400 font-mono text-xs text-center">
              +{achievements.length - recentAchievements.length} outras conquistas
            </div>
          )}
        </div>
      )}

      {/* Estatísticas rápidas (modo compacto) */}
      {compact && (
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="text-green-300">
            Nível: <span className="text-green-400">{levelProgress.currentLevel}</span>
          </div>
          <div className="text-blue-300">
            Badges: <span className="text-blue-400">{achievements?.length || 0}</span>
          </div>
        </div>
      )}

      {/* Efeito de borda pixelada */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full border-2 border-green-400 opacity-20" 
             style={{ 
               background: `
                 linear-gradient(90deg, transparent 0%, transparent 48%, #10b981 49%, #10b981 51%, transparent 52%, transparent 100%),
                 linear-gradient(0deg, transparent 0%, transparent 48%, #10b981 49%, #10b981 51%, transparent 52%, transparent 100%)
               `,
               backgroundSize: '8px 8px'
             }} 
        />
      </div>
    </div>
  );
}