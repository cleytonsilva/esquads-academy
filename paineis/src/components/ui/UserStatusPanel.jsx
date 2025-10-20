import React, { useState } from 'react';
import Icon from '../AppIcon';

const UserStatusPanel = ({ 
  xp = 1247, 
  lives = 3, 
  maxLives = 5, 
  badges = [], 
  level = 12,
  nextLevelXp = 1500,
  className = '',
  compact = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const xpProgress = ((xp % 500) / 500) * 100; // Assuming 500 XP per level
  const recentBadges = badges?.slice(0, 3);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {/* XP Display */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-muted rounded-lg">
          <Icon name="Zap" size={14} color="var(--color-accent)" />
          <span className="text-sm font-medium text-foreground">{xp?.toLocaleString()}</span>
        </div>
        {/* Lives Display */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-muted rounded-lg">
          <Icon name="Heart" size={14} color="var(--color-error)" />
          <span className="text-sm font-medium text-foreground">{lives}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Header - Always Visible */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center space-x-4">
          {/* Level Badge */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{level}</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
              <Icon name="Star" size={10} color="white" />
            </div>
          </div>

          {/* XP and Lives */}
          <div className="space-y-1">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon name="Zap" size={16} color="var(--color-accent)" />
                <span className="font-semibold text-foreground">{xp?.toLocaleString()} XP</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Heart" size={16} color="var(--color-error)" />
                <div className="flex space-x-1">
                  {Array.from({ length: maxLives }, (_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index < lives ? 'bg-error' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* XP Progress Bar */}
            <div className="w-32 bg-muted rounded-full h-1.5">
              <div 
                className="h-1.5 bg-accent rounded-full transition-all duration-300"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Expand Icon */}
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-muted-foreground" 
        />
      </div>
      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="pt-4 space-y-4">
            {/* Level Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Nível {level}</span>
                <span className="text-xs text-muted-foreground">
                  {nextLevelXp - xp} XP para próximo nível
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-2 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>

            {/* Recent Badges */}
            {recentBadges?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Conquistas Recentes</h4>
                <div className="flex space-x-2">
                  {recentBadges?.map((badge, index) => (
                    <div
                      key={index}
                      className="relative group"
                      title={badge?.name}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-accent to-warning rounded-lg flex items-center justify-center">
                        <Icon name={badge?.icon || "Award"} size={16} color="white" />
                      </div>
                      {badge?.isNew && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
                      )}
                    </div>
                  ))}
                  {badges?.length > 3 && (
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        +{badges?.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">24</div>
                <div className="text-xs text-muted-foreground">Missões Completas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">89%</div>
                <div className="text-xs text-muted-foreground">Taxa de Sucesso</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStatusPanel;