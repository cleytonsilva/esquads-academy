// Esquads Academy - Componente de Missão com IA

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Clock, 
  Star, 
  Zap, 
  Brain,
  CheckCircle,
  Play,
  Trophy,
  Calendar,
  Timer
} from 'lucide-react';
import type { GeneratedMission } from '@/services/aiMissionGenerator';

interface AIMissionCardProps {
  mission: GeneratedMission & {
    current_progress?: number;
    is_completed?: boolean;
    is_started?: boolean;
  };
  onStart?: (missionId: string) => void;
  onComplete?: (missionId: string) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

export function AIMissionCard({ 
  mission, 
  onStart, 
  onComplete, 
  variant = 'default' 
}: AIMissionCardProps) {
  const progress = mission.current_progress || 0;
  const progressPercentage = Math.min((progress / mission.target_value) * 100, 100);
  const isCompleted = mission.is_completed || progressPercentage >= 100;
  const isStarted = mission.is_started || progress > 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="h-4 w-4" />;
      case 'weekly': return <Target className="h-4 w-4" />;
      case 'achievement': return <Trophy className="h-4 w-4" />;
      case 'challenge': return <Zap className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'weekly': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'achievement': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'challenge': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirada';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d restantes`;
    if (hours > 0) return `${hours}h restantes`;
    return 'Menos de 1h';
  };

  if (variant === 'compact') {
    return (
      <Card className={`transition-all duration-200 hover:shadow-md ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getTypeColor(mission.type)}`}>
                {getTypeIcon(mission.type)}
              </div>
              <div>
                <h4 className="font-medium text-sm">{mission.title}</h4>
                <p className="text-xs text-gray-600">{mission.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getDifficultyColor(mission.difficulty)}>
                {mission.difficulty}
              </Badge>
              <span className="text-sm font-medium text-blue-600">
                +{mission.points_reward}
              </span>
            </div>
          </div>
          
          {isStarted && !isCompleted && (
            <div className="mt-3">
              <Progress value={progressPercentage} className="h-1.5" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{progress}/{mission.target_value}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${getTypeColor(mission.type)}`}>
              {getTypeIcon(mission.type)}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {mission.title}
                {mission.type === 'challenge' && <Brain className="h-4 w-4 text-purple-600" />}
              </CardTitle>
              <CardDescription className="mt-1">
                {mission.description}
              </CardDescription>
            </div>
          </div>
          
          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Concluída</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Badge variant="outline" className={getDifficultyColor(mission.difficulty)}>
            {mission.difficulty}
          </Badge>
          <Badge variant="outline" className={getTypeColor(mission.type)}>
            {mission.type}
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            +{mission.points_reward} pontos
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progresso */}
        {isStarted && !isCompleted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progresso</span>
              <span className="font-medium">{progress}/{mission.target_value}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-gray-500 text-right">
              {Math.round(progressPercentage)}% concluído
            </div>
          </div>
        )}

        {/* Informações adicionais */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Timer className="h-4 w-4" />
            <span>{mission.estimated_time} min</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{formatTimeRemaining(mission.expires_at)}</span>
          </div>
        </div>

        {/* Requisitos */}
        {variant === 'detailed' && mission.requirements.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700">Requisitos:</h5>
            <ul className="text-xs text-gray-600 space-y-1">
              {mission.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dicas */}
        {variant === 'detailed' && mission.hints.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700">Dicas:</h5>
            <ul className="text-xs text-gray-600 space-y-1">
              {mission.hints.slice(0, 2).map((hint, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">💡</span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {mission.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {mission.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          {!isStarted && !isCompleted && (
            <Button 
              onClick={() => onStart?.(mission.id)}
              className="flex-1"
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Missão
            </Button>
          )}
          
          {isStarted && !isCompleted && progressPercentage >= 100 && (
            <Button 
              onClick={() => onComplete?.(mission.id)}
              className="flex-1"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Concluir
            </Button>
          )}
          
          {isCompleted && (
            <Button 
              variant="outline" 
              className="flex-1" 
              size="sm"
              disabled
            >
              <Trophy className="h-4 w-4 mr-2" />
              Missão Concluída
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
