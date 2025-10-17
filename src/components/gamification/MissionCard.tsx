// Esquads Academy - Componente de Missão

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Clock, 
  Star, 
  CheckCircle, 
  Award,
  Calendar,
  Zap,
  Play
} from 'lucide-react';
import { formatPoints, formatRelativeTime } from '@/utils/format';
import type { Mission } from '@/types/gamification';

interface MissionCardProps {
  mission: Mission;
  progress?: number;
  variant?: 'card' | 'compact';
  completed?: boolean;
  completedAt?: string;
  onComplete?: () => void;
  onStart?: () => void;
}

export function MissionCard({ 
  mission, 
  progress = 0,
  variant = 'card',
  completed = false,
  completedAt,
  onComplete,
  onStart
}: MissionCardProps) {
  const progressPercentage = (progress / mission.target_value) * 100;
  const canComplete = progress >= mission.target_value && !completed;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Médio';
      case 'hard':
        return 'Difícil';
      default:
        return difficulty;
    }
  };

  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case 'course_completion':
        return Target;
      case 'lesson_completion':
        return CheckCircle;
      case 'points_earned':
        return Star;
      case 'streak':
        return Zap;
      case 'quiz_score':
        return Award;
      case 'time_spent':
        return Clock;
      default:
        return Target;
    }
  };

  const TypeIcon = getMissionTypeIcon(mission.type);

  if (variant === 'compact') {
    return (
      <Card className={`
        ${completed ? 'bg-green-50 border-green-200' : ''}
        ${canComplete ? 'bg-blue-50 border-blue-200' : ''}
        transition-all duration-200 hover:shadow-md
      `}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`
                p-2 rounded-lg
                ${completed ? 'bg-green-100' : 'bg-gray-100'}
              `}>
                {completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <TypeIcon className="h-4 w-4 text-gray-600" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{mission.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-1">{mission.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className={getDifficultyColor(mission.difficulty)}>
                {getDifficultyLabel(mission.difficulty)}
              </Badge>
              
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-600">
                  +{formatPoints(mission.points_reward)}
                </p>
                <p className="text-xs text-gray-500">pontos</p>
              </div>
            </div>
          </div>

          {progress > 0 && !completed && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progresso</span>
                <span className="text-gray-600">
                  {progress}/{mission.target_value}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {canComplete && onComplete && (
            <div className="mt-3">
              <Button 
                onClick={onComplete}
                size="sm"
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resgatar
              </Button>
            </div>
          )}

          {!completed && progress === 0 && onStart && (
            <div className="mt-3">
              <Button 
                onClick={onStart}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`
      ${completed ? 'bg-green-50 border-green-200' : ''}
      ${canComplete ? 'bg-blue-50 border-blue-200 shadow-md' : ''}
      transition-all duration-200 hover:shadow-lg
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`
              p-3 rounded-lg
              ${completed ? 'bg-green-100' : 'bg-gray-100'}
            `}>
              {completed ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <TypeIcon className="h-6 w-6 text-gray-600" />
              )}
            </div>
            
            <div>
              <CardTitle className="text-lg">{mission.title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{mission.description}</p>
            </div>
          </div>

          {completed && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Completa
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações da missão */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className={getDifficultyColor(mission.difficulty)}>
              {getDifficultyLabel(mission.difficulty)}
            </Badge>
            
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>+{formatPoints(mission.points_reward)} pontos</span>
            </div>

            {mission.badge_reward && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Award className="h-4 w-4 text-purple-500" />
                <span>Badge</span>
              </div>
            )}
          </div>

          {mission.duration_days && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{mission.duration_days} dias</span>
            </div>
          )}
        </div>

        {/* Progresso */}
        {progress > 0 && !completed && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progresso</span>
              <span className="text-gray-600">
                {progress}/{mission.target_value} ({Math.round(progressPercentage)}%)
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        )}

        {/* Data de conclusão */}
        {completed && completedAt && (
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>
              Completada {formatRelativeTime(completedAt)}
            </span>
          </div>
        )}

        {/* Botão de ação */}
        {canComplete && onComplete && (
          <Button 
            onClick={onComplete}
            className="w-full"
            size="sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Resgatar Recompensa
          </Button>
        )}

        {!completed && progress === 0 && onStart && (
          <Button 
            onClick={onStart}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Iniciar Missão
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
