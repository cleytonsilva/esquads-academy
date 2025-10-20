import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const BadgeShowcase = ({ 
  newBadges = [],
  allBadges = [],
  showAnimation = true 
}) => {
  const [visibleBadges, setVisibleBadges] = useState([]);
  const [animationIndex, setAnimationIndex] = useState(0);

  useEffect(() => {
    if (showAnimation && newBadges?.length > 0) {
      const timer = setInterval(() => {
        if (animationIndex < newBadges?.length) {
          setVisibleBadges(prev => [...prev, newBadges?.[animationIndex]]);
          setAnimationIndex(prev => prev + 1);
        } else {
          clearInterval(timer);
        }
      }, 800);

      return () => clearInterval(timer);
    } else {
      setVisibleBadges(newBadges);
    }
  }, [newBadges, animationIndex, showAnimation]);

  const mockNewBadges = [
    {
      id: 'firewall-expert',
      name: 'Especialista em Firewall',
      description: 'Configurou regras de firewall com 95% de precisão',
      icon: 'Shield',
      rarity: 'epic',
      isNew: true
    },
    {
      id: 'speed-demon',
      name: 'Demônio da Velocidade',
      description: 'Completou a missão em menos de 5 minutos',
      icon: 'Zap',
      rarity: 'rare',
      isNew: true
    }
  ];

  const mockAllBadges = [
    {
      id: 'first-mission',
      name: 'Primeira Missão',
      description: 'Completou sua primeira missão',
      icon: 'Target',
      rarity: 'common',
      isNew: false
    },
    {
      id: 'accuracy-master',
      name: 'Mestre da Precisão',
      description: 'Alcançou 100% de precisão em uma missão',
      icon: 'Crosshair',
      rarity: 'legendary',
      isNew: false
    },
    ...mockNewBadges
  ];

  const displayBadges = newBadges?.length > 0 ? visibleBadges : mockNewBadges;
  const totalBadges = allBadges?.length > 0 ? allBadges : mockAllBadges;

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'from-amber-400 to-yellow-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'common':
        return 'from-gray-400 to-gray-600';
      default:
        return 'from-accent to-accent';
    }
  };

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'border-amber-400 shadow-amber-400/50';
      case 'epic':
        return 'border-purple-400 shadow-purple-400/50';
      case 'rare':
        return 'border-blue-400 shadow-blue-400/50';
      case 'common':
        return 'border-gray-400 shadow-gray-400/50';
      default:
        return 'border-accent shadow-accent/50';
    }
  };

  if (displayBadges?.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Award" size={24} color="var(--color-accent)" />
          <h2 className="text-xl font-heading font-bold text-foreground">
            Conquistas Desbloqueadas
          </h2>
        </div>
        <div className="text-sm text-muted-foreground">
          {totalBadges?.length} total
        </div>
      </div>
      {/* New Badges Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {displayBadges?.map((badge, index) => (
          <div
            key={badge?.id}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-500
              ${getRarityBorder(badge?.rarity)}
              ${badge?.isNew ? 'animate-achievement' : ''}
            `}
            style={{
              animationDelay: `${index * 200}ms`
            }}
          >
            {/* New Badge Indicator */}
            {badge?.isNew && (
              <div className="absolute -top-2 -right-2 bg-success text-success-foreground text-xs px-2 py-1 rounded-full font-medium">
                NOVO!
              </div>
            )}

            <div className="flex items-start space-x-4">
              {/* Badge Icon */}
              <div className={`
                w-16 h-16 rounded-full bg-gradient-to-br ${getRarityColor(badge?.rarity)}
                flex items-center justify-center flex-shrink-0
              `}>
                <Icon name={badge?.icon} size={24} color="white" />
              </div>

              {/* Badge Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1">
                  {badge?.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {badge?.description}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`
                    text-xs px-2 py-1 rounded-full font-medium capitalize
                    ${badge?.rarity === 'legendary' ? 'bg-amber-100 text-amber-800' :
                      badge?.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                      badge?.rarity === 'rare'? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {badge?.rarity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Badge Collection Progress */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Coleção de Conquistas
          </span>
          <span className="text-sm text-muted-foreground">
            {totalBadges?.filter(b => !b?.isNew)?.length + displayBadges?.length} / {totalBadges?.length + 15}
          </span>
        </div>
        <div className="w-full bg-background rounded-full h-2">
          <div 
            className="h-2 bg-gradient-to-r from-accent to-secondary rounded-full transition-all duration-500"
            style={{ 
              width: `${((totalBadges?.filter(b => !b?.isNew)?.length + displayBadges?.length) / (totalBadges?.length + 15)) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BadgeShowcase;