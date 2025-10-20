import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Clock, 
  Zap, 
  TrendingUp,
  Award,
  Star,
  BarChart3
} from 'lucide-react';
import { MissionStats as MissionStatsType } from '@/types/missions';
import { cn } from '@/lib/utils';

interface MissionStatsProps {
  stats: MissionStatsType;
  className?: string;
}

export function MissionStats({ stats, className }: MissionStatsProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const statCards = [
    {
      title: 'Missões Concluídas',
      value: stats.completed_missions,
      total: stats.total_missions,
      icon: Trophy,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      showProgress: true
    },
    {
      title: 'XP Total Ganho',
      value: stats.total_xp_earned,
      total: stats.total_xp_available,
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      showProgress: true,
      suffix: ' XP'
    },
    {
      title: 'Pontuação Média',
      value: Math.round(stats.average_score),
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      suffix: '%'
    },
    {
      title: 'Tempo Total',
      value: formatTime(stats.time_spent_total),
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      isTime: true
    }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const percentage = stat.total ? (stat.value / stat.total) * 100 : 0;
          
          return (
            <Card 
              key={index}
              className={cn(
                "bg-gray-900/50 border-gray-700 hover:border-purple-500/30 transition-all duration-300",
                stat.borderColor
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                    <Icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  {stat.showProgress && (
                    <div className="text-xs text-gray-400 font-mono">
                      {stat.value}/{stat.total}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-300">
                    {stat.title}
                  </h3>
                  
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-2xl font-bold font-mono", stat.color)}>
                      {stat.isTime ? stat.value : typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </span>
                    {stat.suffix && (
                      <span className="text-sm text-gray-400">{stat.suffix}</span>
                    )}
                  </div>
                  
                  {stat.showProgress && (
                    <Progress 
                      value={percentage} 
                      className="h-2 bg-gray-800"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Breakdown por dificuldade */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Progresso por Dificuldade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(stats.difficulty_breakdown).map(([difficulty, data]) => {
            const percentage = data.total > 0 ? (data.completed / data.total) * 100 : 0;
            
            return (
              <div key={difficulty} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className={cn("w-4 h-4", getDifficultyColor(difficulty))} />
                    <span className="text-sm font-medium text-gray-300 capitalize">
                      {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {data.completed}/{data.total} ({Math.round(percentage)}%)
                  </div>
                </div>
                
                <Progress 
                  value={percentage} 
                  className="h-2 bg-gray-800"
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Métricas adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400 font-mono">
              {Math.round(stats.completion_rate)}%
            </div>
            <div className="text-sm text-gray-400">Taxa de Conclusão</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400 font-mono">
              {stats.in_progress_missions}
            </div>
            <div className="text-sm text-gray-400">Em Progresso</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400 font-mono">
              {stats.total_missions - stats.completed_missions - stats.in_progress_missions}
            </div>
            <div className="text-sm text-gray-400">Não Iniciadas</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}