import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressionPath = ({ 
  userProgress = {},
  totalMissions = 0,
  completedMissions = 0,
  currentLevel = 1,
  nextLevelProgress = 65
}) => {
  const progressPercentage = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

  const pathMilestones = [
    { level: 1, title: 'Novato em Segurança', missions: 5, icon: 'Shield' },
    { level: 2, title: 'Analista Júnior', missions: 15, icon: 'Eye' },
    { level: 3, title: 'Especialista', missions: 30, icon: 'Award' },
    { level: 4, title: 'Expert Avançado', missions: 50, icon: 'Crown' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Trilha de Progressão</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe sua evolução na jornada de cybersegurança
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</div>
          <div className="text-xs text-muted-foreground">Concluído</div>
        </div>
      </div>
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Progresso Geral</span>
          <span className="text-sm text-muted-foreground">
            {completedMissions} de {totalMissions} missões
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className="h-3 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 relative overflow-hidden"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-30 animate-pulse" />
          </div>
        </div>
      </div>
      {/* Progression Milestones */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Marcos da Carreira</h3>
        {pathMilestones?.map((milestone, index) => {
          const isCompleted = completedMissions >= milestone?.missions;
          const isCurrent = currentLevel === milestone?.level;
          const isNext = currentLevel + 1 === milestone?.level;

          return (
            <div
              key={milestone?.level}
              className={`
                flex items-center space-x-4 p-3 rounded-lg border transition-all duration-200
                ${isCompleted 
                  ? 'bg-success/10 border-success/20' 
                  : isCurrent 
                    ? 'bg-primary/10 border-primary/20' 
                    : isNext
                      ? 'bg-accent/10 border-accent/20' :'bg-muted/30 border-muted'
                }
              `}
            >
              {/* Milestone Icon */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isCompleted 
                  ? 'bg-success text-success-foreground' 
                  : isCurrent 
                    ? 'bg-primary text-primary-foreground' 
                    : isNext
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                }
              `}>
                {isCompleted ? (
                  <Icon name="Check" size={16} />
                ) : (
                  <Icon name={milestone?.icon} size={16} />
                )}
              </div>
              {/* Milestone Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className={`font-medium ${
                    isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    Nível {milestone?.level}: {milestone?.title}
                  </h4>
                  {isCurrent && (
                    <div className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                      Atual
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {milestone?.missions} missões necessárias
                </p>
              </div>
              {/* Progress Indicator */}
              <div className="text-right">
                {isCompleted ? (
                  <div className="text-success text-sm font-medium">✓ Completo</div>
                ) : isCurrent ? (
                  <div className="text-primary text-sm font-medium">
                    {completedMissions}/{milestone?.missions}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    0/{milestone?.missions}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Next Level Progress */}
      {currentLevel < pathMilestones?.length && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Próximo Nível: {pathMilestones?.[currentLevel]?.title}
            </span>
            <span className="text-sm text-muted-foreground">
              {nextLevelProgress}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="h-2 bg-accent rounded-full transition-all duration-300"
              style={{ width: `${nextLevelProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Continue completando missões para desbloquear o próximo nível
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressionPath;