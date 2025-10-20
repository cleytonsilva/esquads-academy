import React from 'react';
import Icon from '../../../components/AppIcon';

const ObjectiveTracker = ({ 
  objectives = [], 
  currentStep = 1, 
  className = '' 
}) => {
  const getObjectiveStatus = (index) => {
    if (index < currentStep - 1) return 'completed';
    if (index === currentStep - 1) return 'active';
    return 'pending';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'active':
        return 'Target';
      case 'pending':
        return 'Circle';
      default:
        return 'Circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'active':
        return 'text-primary';
      case 'pending':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="CheckSquare" size={16} color="var(--color-primary)" />
        <h3 className="font-semibold text-foreground">Objetivos da Missão</h3>
      </div>
      <div className="space-y-3">
        {objectives?.map((objective, index) => {
          const status = getObjectiveStatus(index);
          const isActive = status === 'active';
          
          return (
            <div
              key={index}
              className={`
                flex items-start space-x-3 p-3 rounded-lg transition-all duration-200
                ${isActive ? 'bg-primary bg-opacity-10 border border-primary border-opacity-20' : 'hover:bg-muted'}
              `}
            >
              <div className={`mt-0.5 ${getStatusColor(status)}`}>
                <Icon 
                  name={getStatusIcon(status)} 
                  size={16} 
                  strokeWidth={status === 'completed' ? 2.5 : 2}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`
                    text-sm font-medium
                    ${status === 'completed' ? 'text-success line-through' : 
                      status === 'active' ? 'text-foreground' : 'text-muted-foreground'}
                  `}>
                    {objective?.title}
                  </h4>
                  
                  {objective?.xpReward && (
                    <div className="flex items-center space-x-1 text-xs">
                      <Icon name="Zap" size={12} color="var(--color-accent)" />
                      <span className="text-accent font-medium">+{objective?.xpReward}</span>
                    </div>
                  )}
                </div>
                
                <p className={`
                  text-xs mt-1
                  ${status === 'completed' ? 'text-muted-foreground line-through' : 
                    status === 'active' ? 'text-muted-foreground' : 'text-muted-foreground opacity-60'}
                `}>
                  {objective?.description}
                </p>

                {objective?.hint && status === 'active' && (
                  <div className="mt-2 p-2 bg-accent bg-opacity-10 rounded border-l-2 border-accent">
                    <div className="flex items-start space-x-2">
                      <Icon name="Lightbulb" size={12} color="var(--color-accent)" className="mt-0.5" />
                      <p className="text-xs text-accent">{objective?.hint}</p>
                    </div>
                  </div>
                )}

                {status === 'completed' && objective?.completedAt && (
                  <div className="flex items-center space-x-1 mt-2 text-xs text-success">
                    <Icon name="Clock" size={10} />
                    <span>Concluído em {objective?.completedAt}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Progress Summary */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium text-foreground">
            {currentStep - 1}/{objectives?.length} objetivos
          </span>
        </div>
        
        <div className="mt-2 w-full bg-muted rounded-full h-2">
          <div 
            className="h-2 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / objectives?.length) * 100}%` }}
          />
        </div>

        {currentStep <= objectives?.length && (
          <p className="text-xs text-muted-foreground mt-2">
            Objetivo atual: {objectives?.[currentStep - 1]?.title}
          </p>
        )}
      </div>
    </div>
  );
};

export default ObjectiveTracker;