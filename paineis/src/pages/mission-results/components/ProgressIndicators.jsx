import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicators = ({ 
  currentLevel = 12,
  currentXP = 1247,
  nextLevelXP = 1500,
  totalMissionsCompleted = 24,
  totalMissions = 50,
  weeklyProgress = 85,
  className = ""
}) => {
  const levelProgress = ((currentXP % 500) / 500) * 100; // Assuming 500 XP per level
  const missionProgress = (totalMissionsCompleted / totalMissions) * 100;
  const xpToNextLevel = nextLevelXP - currentXP;

  const progressItems = [
    {
      title: "Progresso do Nível",
      current: currentLevel,
      progress: levelProgress,
      subtitle: `${xpToNextLevel} XP para nível ${currentLevel + 1}`,
      icon: "TrendingUp",
      color: "var(--color-primary)",
      bgColor: "bg-primary/10"
    },
    {
      title: "Missões Completadas",
      current: totalMissionsCompleted,
      total: totalMissions,
      progress: missionProgress,
      subtitle: `${totalMissions - totalMissionsCompleted} missões restantes`,
      icon: "Target",
      color: "var(--color-secondary)",
      bgColor: "bg-secondary/10"
    },
    {
      title: "Meta Semanal",
      current: Math.floor(weeklyProgress),
      progress: weeklyProgress,
      subtitle: weeklyProgress >= 100 ? "Meta atingida!" : `${100 - Math.floor(weeklyProgress)}% restante`,
      icon: "Calendar",
      color: "var(--color-success)",
      bgColor: "bg-success/10"
    }
  ];

  return (
    <div className={`bg-card border border-border rounded-xl p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="Activity" size={24} color="var(--color-accent)" />
        <h2 className="text-xl font-heading font-bold text-foreground">
          Indicadores de Progresso
        </h2>
      </div>
      <div className="space-y-6">
        {progressItems?.map((item, index) => (
          <div key={index} className={`${item?.bgColor} rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Icon name={item?.icon} size={20} color={item?.color} />
                <h3 className="font-semibold text-foreground">{item?.title}</h3>
              </div>
              <div className="text-right">
                <div className="font-bold text-foreground">
                  {item?.total ? `${item?.current}/${item?.total}` : `Nível ${item?.current}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(item?.progress)}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-background rounded-full h-3 mb-2">
              <div 
                className="h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ 
                  width: `${Math.min(item?.progress, 100)}%`,
                  backgroundColor: item?.color
                }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-30 animate-pulse"></div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{item?.subtitle}</p>
          </div>
        ))}
      </div>
      {/* Achievement Milestones */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="font-semibold text-foreground mb-4">Próximos Marcos</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <Icon name="Star" size={16} color="white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-foreground">Nível 15</div>
              <div className="text-sm text-muted-foreground">Desbloqueie missões avançadas</div>
            </div>
            <div className="text-sm text-muted-foreground">
              {1500 - currentXP} XP
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Award" size={16} color="white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-foreground">25 Missões</div>
              <div className="text-sm text-muted-foreground">Conquista "Veterano"</div>
            </div>
            <div className="text-sm text-muted-foreground">
              1 restante
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
              <Icon name="Trophy" size={16} color="white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-foreground">Meta Mensal</div>
              <div className="text-sm text-muted-foreground">Complete 10 missões este mês</div>
            </div>
            <div className="text-sm text-muted-foreground">
              3 restantes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicators;