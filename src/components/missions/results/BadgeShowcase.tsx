import React from 'react';
import { Award, Crown, Zap, Target, Shield, Star } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlockedAt: Date;
  category: string;
}

interface BadgeShowcaseProps {
  badges: Badge[];
  newBadges?: Badge[];
  onBadgeClick?: (badge: Badge) => void;
}

const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ 
  badges, 
  newBadges = [], 
  onBadgeClick 
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-400';
      case 'rare':
        return 'border-blue-400';
      case 'epic':
        return 'border-purple-400';
      case 'legendary':
        return 'border-yellow-400';
      default:
        return 'border-gray-400';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'Comum';
      case 'rare':
        return 'Raro';
      case 'epic':
        return 'Épico';
      case 'legendary':
        return 'Lendário';
      default:
        return 'Comum';
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'award':
        return Award;
      case 'crown':
        return Crown;
      case 'zap':
        return Zap;
      case 'target':
        return Target;
      case 'shield':
        return Shield;
      case 'star':
        return Star;
      default:
        return Award;
    }
  };

  if (badges.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma Badge Conquistada</h3>
        <p className="text-muted-foreground">
          Complete mais missões para desbloquear badges especiais!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Badges Conquistadas</h3>
        {newBadges.length > 0 && (
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            +{newBadges.length} nova(s)
          </div>
        )}
      </div>

      {/* New Badges Highlight */}
      {newBadges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-green-500 mb-3">🎉 Novas Badges Desbloqueadas!</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newBadges.map((badge) => {
              const IconComponent = getIconComponent(badge.icon);
              return (
                <div
                  key={badge.id}
                  className={`bg-gradient-to-br ${getRarityColor(badge.rarity)} p-4 rounded-lg border-2 ${getRarityBorder(badge.rarity)} cursor-pointer transform hover:scale-105 transition-all duration-200 animate-pulse`}
                  onClick={() => onBadgeClick?.(badge)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-white text-sm">{badge.name}</h5>
                      <p className="text-white text-xs opacity-90">{badge.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-white bg-opacity-20 text-white px-2 py-0.5 rounded">
                          {getRarityText(badge.rarity)}
                        </span>
                        <span className="text-xs text-white opacity-90">+{badge.xpReward} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const IconComponent = getIconComponent(badge.icon);
          const isNew = newBadges.some(nb => nb.id === badge.id);
          
          return (
            <div
              key={badge.id}
              className={`bg-gradient-to-br ${getRarityColor(badge.rarity)} p-4 rounded-lg border-2 ${getRarityBorder(badge.rarity)} cursor-pointer transform hover:scale-105 transition-all duration-200 ${
                isNew ? 'animate-pulse' : ''
              }`}
              onClick={() => onBadgeClick?.(badge)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white text-sm">{badge.name}</h5>
                  <p className="text-white text-xs opacity-90">{badge.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs bg-white bg-opacity-20 text-white px-2 py-0.5 rounded">
                      {getRarityText(badge.rarity)}
                    </span>
                    <span className="text-xs text-white opacity-90">+{badge.xpReward} XP</span>
                  </div>
                  <p className="text-xs text-white opacity-70 mt-1">
                    Conquistada em {badge.unlockedAt.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Stats */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">{badges.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">
              {badges.filter(b => b.rarity === 'rare').length}
            </div>
            <div className="text-sm text-muted-foreground">Raras</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-500">
              {badges.filter(b => b.rarity === 'epic').length}
            </div>
            <div className="text-sm text-muted-foreground">Épicas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-500">
              {badges.filter(b => b.rarity === 'legendary').length}
            </div>
            <div className="text-sm text-muted-foreground">Lendárias</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeShowcase;
