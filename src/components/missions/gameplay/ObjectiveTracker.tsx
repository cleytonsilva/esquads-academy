import React from 'react';
import { CheckSquare, CheckCircle, Target, Circle, Zap, Lightbulb, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Objective {
  title: string;
  description: string;
  hint?: string;
  xpReward?: number;
  completedAt?: string;
}

interface ObjectiveTrackerProps {
  objectives?: Objective[];
  currentStep?: number;
  className?: string;
}

const ObjectiveTracker: React.FC<ObjectiveTrackerProps> = ({ 
  objectives = [], 
  currentStep = 1, 
  className = '' 
}) => {
  const getObjectiveStatus = (index: number): 'completed' | 'active' | 'pending' => {
    if (index < currentStep - 1) return 'completed';
    if (index === currentStep - 1) return 'active';
    return 'pending';
  };

  const getStatusIcon = (status: 'completed' | 'active' | 'pending') => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'active':
        return Target;
      case 'pending':
        return Circle;
      default:
        return Circle;
    }
  };

  const getStatusColor = (status: 'completed' | 'active' | 'pending') => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'active':
        return 'text-primary';
      case 'pending':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const progressPercentage = objectives.length > 0 ? ((currentStep - 1) / objectives.length) * 100 : 0;

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <CheckSquare className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">Objetivos da Missão</h3>
      </div>
      
      <div className="space-y-3">
        {objectives.map((objective, index) => {
          const status = getObjectiveStatus(index);
          const isActive = status === 'active';
          const StatusIcon = getStatusIcon(status);
          
          return (
            <div
              key={index}
              className={`
                flex items-start space-x-3 p-3 rounded-lg transition-all duration-200
                ${isActive ? 'bg-primary bg-opacity-10 border border-primary border-opacity-20' : 'hover:bg-muted'}
              `}
            >
              <div className={`mt-0.5 ${getStatusColor(status)}`}>
                <StatusIcon 
                  className="w-4 h-4"
                  strokeWidth={status === 'completed' ? 2.5 : 2}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`
                    text-sm font-medium
                    ${status === 'completed' ? 'text-green-500 line-through' : 
                      status === 'active' ? 'text-foreground' : 'text-muted-foreground'}
                  `}>
                    {objective.title}
                  </h4>
                  
                  {objective.xpReward && (
                    <div className="flex items-center space-x-1 text-xs">
                      <Zap className="w-3 h-3 text-accent" />
                      <span className="text-accent font-medium">+{objective.xpReward}</span>
                    </div>
                  )}
                </div>
                
                <p className={`
                  text-xs mt-1
                  ${status === 'completed' ? 'text-muted-foreground line-through' : 
                    status === 'active' ? 'text-muted-foreground' : 'text-muted-foreground opacity-60'}
                `}>
                  {objective.description}
                </p>

                {objective.hint && status === 'active' && (
                  <div className="mt-2 p-2 bg-accent bg-opacity-10 rounded border-l-2 border-accent">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-3 h-3 text-accent mt-0.5" />
                      <p className="text-xs text-accent">{objective.hint}</p>
                    </div>
                  </div>
                )}

                {status === 'completed' && objective.completedAt && (
                  <div className="flex items-center space-x-1 mt-2 text-xs text-green-500">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Concluído em {objective.completedAt}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium text-foreground">
            {currentStep - 1}/{objectives.length} objetivos
          </span>
        </div>
        
        <Progress value={progressPercentage} className="mt-2 h-2" />

        {currentStep <= objectives.length && (
          <p className="text-xs text-muted-foreground mt-2">
            Objetivo atual: {objectives[currentStep - 1]?.title}
          </p>
        )}
      </div>
    </Card>
  );
};

export default ObjectiveTracker;