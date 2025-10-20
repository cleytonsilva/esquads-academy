import React from 'react';
import MissionCard from './MissionCard';

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryIcon: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  duration: string;
  xpReward: number;
  image: string;
  progress: number;
  isLocked: boolean;
  isPremium: boolean;
  tools: string[];
  badges: Array<{
    name: string;
    icon: string;
  }>;
  prerequisites: string[];
}

interface MissionGridProps {
  missions: Mission[];
  userPlan?: 'free' | 'premium';
  isLoading?: boolean;
  emptyMessage?: string;
}

const MissionGrid: React.FC<MissionGridProps> = ({ 
  missions, 
  userPlan = 'free',
  isLoading = false,
  emptyMessage = 'Nenhuma missão encontrada com os filtros aplicados.'
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
            <div className="h-40 bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="flex justify-between">
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-12" />
              </div>
              <div className="h-10 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎯</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma missão encontrada</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          userPlan={userPlan}
        />
      ))}
    </div>
  );
};

export default MissionGrid;
