import React, { useState, useEffect } from 'react';
import { Clock, Pause, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ExamTimerProps {
  totalTimeMinutes?: number;
  onTimeUp?: () => void;
  isPaused?: boolean;
  className?: string;
}

const ExamTimer: React.FC<ExamTimerProps> = ({ 
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

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return ((totalTimeMinutes * 60 - timeRemaining) / (totalTimeMinutes * 60)) * 100;
  };

  const getTimerColor = (): string => {
    if (isCritical) return 'text-red-500';
    if (isWarning) return 'text-yellow-500';
    return 'text-foreground';
  };

  const getProgressColor = (): string => {
    if (isCritical) return 'bg-red-500';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-primary';
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock 
            className={`w-4 h-4 ${getTimerColor()}`}
          />
          <span className="text-sm font-medium text-foreground">Tempo Restante</span>
        </div>
        {isPaused && (
          <div className="flex items-center space-x-1">
            <Pause className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-xs text-yellow-500">Pausado</span>
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
      <Progress 
        value={getProgressPercentage()} 
        className="h-2"
      />

      {/* Time Warnings */}
      {isWarning && (
        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-xs text-yellow-500 font-medium">
              {isCritical ? 'Tempo crítico! Finalize suas respostas.' : 'Atenção: Restam poucos minutos.'}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ExamTimer;