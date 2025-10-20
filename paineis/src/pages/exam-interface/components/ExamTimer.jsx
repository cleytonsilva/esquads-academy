import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ExamTimer = ({ 
  totalTimeMinutes = 90, 
  onTimeUp, 
  isPaused = false,
  className = '' 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(totalTimeMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Warning at 15 minutes
        if (newTime <= 900 && !isWarning) {
          setIsWarning(true);
        }
        
        // Critical at 5 minutes
        if (newTime <= 300 && !isCritical) {
          setIsCritical(true);
        }
        
        // Time up
        if (newTime <= 0) {
          onTimeUp?.();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isWarning, isCritical, onTimeUp]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
    }
    return `${minutes}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((totalTimeMinutes * 60 - timeRemaining) / (totalTimeMinutes * 60)) * 100;
  };

  const getTimerColor = () => {
    if (isCritical) return 'text-error';
    if (isWarning) return 'text-warning';
    return 'text-foreground';
  };

  const getProgressColor = () => {
    if (isCritical) return 'bg-error';
    if (isWarning) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon 
            name="Clock" 
            size={16} 
            className={getTimerColor()}
          />
          <span className="text-sm font-medium text-foreground">Tempo Restante</span>
        </div>
        {isPaused && (
          <div className="flex items-center space-x-1">
            <Icon name="Pause" size={14} className="text-warning" />
            <span className="text-xs text-warning">Pausado</span>
          </div>
        )}
      </div>

      <div className="text-center mb-3">
        <div className={`text-2xl font-mono font-bold ${getTimerColor()}`}>
          {formatTime(timeRemaining)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {Math.floor(timeRemaining / 60)} minutos restantes
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Time Warnings */}
      {isWarning && (
        <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={14} className="text-warning" />
            <span className="text-xs text-warning font-medium">
              {isCritical ? 'Tempo crítico! Finalize suas respostas.' : 'Atenção: Restam poucos minutos.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTimer;