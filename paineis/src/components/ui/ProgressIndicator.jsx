import React from 'react';
import Icon from '../AppIcon';

const ProgressIndicator = ({ 
  currentStep = 1, 
  totalSteps = 5, 
  context = 'mission', 
  title = '',
  showPercentage = true,
  className = '' 
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  
  const getContextIcon = () => {
    switch (context) {
      case 'mission':
        return 'Target';
      case 'exam':
        return 'FileText';
      case 'results':
        return 'BarChart3';
      default:
        return 'Activity';
    }
  };

  const getContextColor = () => {
    switch (context) {
      case 'mission':
        return 'var(--color-primary)';
      case 'exam':
        return 'var(--color-secondary)';
      case 'results':
        return 'var(--color-success)';
      default:
        return 'var(--color-accent)';
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon 
            name={getContextIcon()} 
            size={16} 
            color={getContextColor()} 
          />
          <span className="text-sm font-medium text-foreground">
            {title || `Progresso ${context === 'mission' ? 'da Missão' : context === 'exam' ? 'do Exame' : 'dos Resultados'}`}
          </span>
        </div>
        {showPercentage && (
          <span className="text-sm font-bold text-foreground">
            {percentage}%
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: getContextColor()
            }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-30 animate-pulse"></div>
          </div>
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-between mt-2">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              className={`
                w-2 h-2 rounded-full transition-colors duration-200
                ${index < currentStep 
                  ? 'bg-current' :'bg-muted-foreground opacity-30'
                }
              `}
              style={{ 
                color: index < currentStep ? getContextColor() : undefined 
              }}
            />
          ))}
        </div>
      </div>

      {/* Step counter */}
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span>Etapa {currentStep} de {totalSteps}</span>
        <span>{totalSteps - currentStep} restantes</span>
      </div>
    </div>
  );
};

export default ProgressIndicator;