import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Trophy, 
  Star, 
  Play, 
  CheckCircle, 
  Lock,
  Heart,
  Zap
} from 'lucide-react';
import { Mission, MissionProgress } from '@/types/missions';
import { cn } from '@/lib/utils';

interface MissionCardProps {
  mission: Mission;
  progress?: MissionProgress | null;
  onStart?: () => void;
  onContinue?: () => void;
  isLocked?: boolean;
  className?: string;
}

export function MissionCard({ 
  mission, 
  progress, 
  onStart, 
  onContinue, 
  isLocked = false,
  className 
}: MissionCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = () => {
    if (isLocked) return <Lock className="w-4 h-4" />;
    if (progress?.status === 'completed') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (progress?.status === 'in_progress') return <Play className="w-4 h-4 text-blue-400" />;
    return <Star className="w-4 h-4 text-gray-400" />;
  };

  const getActionButton = () => {
    if (isLocked) {
      return (
        <Button disabled className="w-full bg-gray-600 text-gray-400">
          <Lock className="w-4 h-4 mr-2" />
          Bloqueada
        </Button>
      );
    }

    if (progress?.status === 'completed') {
      return (
        <Button 
          variant="outline" 
          className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
          onClick={onContinue}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Refazer ({Math.round(progress.best_score)}%)
        </Button>
      );
    }

    if (progress?.status === 'in_progress') {
      return (
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onContinue}
        >
          <Play className="w-4 h-4 mr-2" />
          Continuar
        </Button>
      );
    }

    return (
      <Button 
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        onClick={onStart}
      >
        <Heart className="w-4 h-4 mr-2" />
        Iniciar Missão
      </Button>
    );
  };

  return (
    <Card className={cn(
      "bg-gray-900/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300",
      "hover:shadow-lg hover:shadow-purple-500/10 group",
      isLocked && "opacity-60",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
              {mission.title}
            </CardTitle>
          </div>
          <Badge className={cn("text-xs font-mono", getDifficultyColor(mission.difficulty))}>
            {mission.difficulty.toUpperCase()}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-400 line-clamp-2">
          {mission.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progresso */}
        {progress && progress.status !== 'not_started' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Progresso</span>
              <span className="text-purple-400 font-mono">
                {Math.round(progress.completion_percentage)}%
              </span>
            </div>
            <Progress 
              value={progress.completion_percentage} 
              className="h-2 bg-gray-800"
            />
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-1 text-gray-400">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="font-mono">{mission.xp_reward} XP</span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3 text-blue-400" />
            <span className="font-mono">{mission.estimated_time}min</span>
          </div>
          
          {progress && progress.attempts_count > 0 && (
            <div className="flex items-center gap-1 text-gray-400">
              <Trophy className="w-3 h-3 text-orange-400" />
              <span className="font-mono">{progress.attempts_count} tent.</span>
            </div>
          )}
        </div>

        {/* Tópicos */}
        <div className="flex flex-wrap gap-1">
          {mission.topics && Array.isArray(mission.topics) && mission.topics.slice(0, 3).map((topic, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className="text-xs px-2 py-0 border-gray-600 text-gray-300"
            >
              {topic}
            </Badge>
          ))}
          {mission.topics && Array.isArray(mission.topics) && mission.topics.length > 3 && (
            <Badge 
              variant="outline" 
              className="text-xs px-2 py-0 border-gray-600 text-gray-400"
            >
              +{mission.topics.length - 3}
            </Badge>
          )}
        </div>

        {/* Botão de ação */}
        {getActionButton()}
      </CardContent>
    </Card>
  );
}