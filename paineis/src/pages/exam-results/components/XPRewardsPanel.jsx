import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const XPRewardsPanel = ({ 
  baseXP = 500,
  accuracyBonus = 150,
  timeBonus = 75,
  streakBonus = 100,
  badges = [
    { id: 1, name: "Primeira Tentativa", icon: "Award", earned: true, xp: 50 },
    { id: 2, name: "Acima de 80%", icon: "Star", earned: true, xp: 100 },
    { id: 3, name: "Tempo Eficiente", icon: "Clock", earned: false, xp: 75 }
  ],
  isNewRecord = true
}) => {
  const [animatedXP, setAnimatedXP] = useState(0);
  const [showRewards, setShowRewards] = useState(false);
  
  const totalXP = baseXP + accuracyBonus + timeBonus + streakBonus;
  const earnedBadges = badges?.filter(badge => badge?.earned);
  const badgeXP = earnedBadges?.reduce((sum, badge) => sum + badge?.xp, 0);
  const finalTotalXP = totalXP + badgeXP;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRewards(true);
      // Animate XP counter
      let current = 0;
      const increment = finalTotalXP / 50;
      const counter = setInterval(() => {
        current += increment;
        if (current >= finalTotalXP) {
          setAnimatedXP(finalTotalXP);
          clearInterval(counter);
        } else {
          setAnimatedXP(Math.floor(current));
        }
      }, 30);
    }, 500);

    return () => clearTimeout(timer);
  }, [finalTotalXP]);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-warning rounded-lg flex items-center justify-center">
            <Icon name="Zap" size={20} color="white" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Recompensas XP
            </h3>
            <p className="text-sm text-muted-foreground">
              Pontos de experiência conquistados
            </p>
          </div>
        </div>
        
        {isNewRecord && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-success/10 text-success rounded-full border border-success/20">
            <Icon name="Trophy" size={14} />
            <span className="text-xs font-medium">Novo Recorde!</span>
          </div>
        )}
      </div>
      {/* Total XP Display */}
      <div className="text-center mb-6 p-4 bg-gradient-to-br from-accent/10 to-warning/10 rounded-lg border border-accent/20">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Icon name="Zap" size={24} color="var(--color-accent)" />
          <span className="text-3xl font-bold text-foreground">
            +{animatedXP?.toLocaleString()}
          </span>
          <span className="text-lg text-muted-foreground">XP</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Total de pontos conquistados neste exame
        </p>
      </div>
      {/* XP Breakdown */}
      {showRewards && (
        <div className="space-y-3 mb-6 animate-slide-up">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="FileText" size={16} color="var(--color-primary)" />
              <span className="text-sm font-medium text-foreground">XP Base do Exame</span>
            </div>
            <span className="font-semibold text-foreground">+{baseXP}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Target" size={16} color="var(--color-success)" />
              <span className="text-sm font-medium text-foreground">Bônus de Precisão</span>
            </div>
            <span className="font-semibold text-success">+{accuracyBonus}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Clock" size={16} color="var(--color-secondary)" />
              <span className="text-sm font-medium text-foreground">Bônus de Tempo</span>
            </div>
            <span className="font-semibold text-secondary">+{timeBonus}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Flame" size={16} color="var(--color-warning)" />
              <span className="text-sm font-medium text-foreground">Bônus de Sequência</span>
            </div>
            <span className="font-semibold text-warning">+{streakBonus}</span>
          </div>
        </div>
      )}
      {/* Badges Earned */}
      {earnedBadges?.length > 0 && showRewards && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
            <Icon name="Award" size={16} color="var(--color-accent)" />
            <span>Conquistas Desbloqueadas</span>
          </h4>
          
          <div className="grid grid-cols-1 gap-3">
            {earnedBadges?.map((badge, index) => (
              <div 
                key={badge?.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-accent/10 to-warning/10 rounded-lg border border-accent/20 animate-achievement"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent to-warning rounded-lg flex items-center justify-center">
                    <Icon name={badge?.icon} size={16} color="white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{badge?.name}</p>
                    <p className="text-xs text-muted-foreground">Conquista desbloqueada</p>
                  </div>
                </div>
                <span className="font-semibold text-accent">+{badge?.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default XPRewardsPanel;