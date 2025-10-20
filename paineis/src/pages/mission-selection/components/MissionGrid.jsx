import React from 'react';
import MissionCard from './MissionCard';
import Icon from '../../../components/AppIcon';

const MissionGrid = ({ 
  missions = [], 
  loading = false, 
  userPlan = 'free',
  emptyStateMessage = "Nenhuma missão encontrada com os filtros aplicados." 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
            <div className="h-40 bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="flex justify-between">
                <div className="h-6 bg-muted rounded w-20" />
                <div className="h-6 bg-muted rounded w-16" />
              </div>
              <div className="h-10 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (missions?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon name="Search" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhuma missão encontrada
        </h3>
        <p className="text-muted-foreground max-w-md">
          {emptyStateMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {missions?.map((mission) => (
        <MissionCard
          key={mission?.id}
          mission={mission}
          userPlan={userPlan}
        />
      ))}
    </div>
  );
};

export default MissionGrid;