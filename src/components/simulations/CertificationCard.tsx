// Esquads Academy - Card de Certificação para Simulações
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Trophy, 
  Clock, 
  Target, 
  BookOpen, 
  TrendingUp,
  Star,
  Award,
  CheckCircle
} from 'lucide-react';
import type { Certification, CertificationProgress } from '@/types/simulations';

interface CertificationCardProps {
  certification: Certification;
  progress?: CertificationProgress;
  onStartSimulation: (certificationId: string) => void;
  onViewProgress: (certificationId: string) => void;
  className?: string;
}

export const CertificationCard: React.FC<CertificationCardProps> = ({
  certification,
  progress,
  onStartSimulation,
  onViewProgress,
  className = ''
}) => {
  const hasProgress = !!progress;
  const readinessPercentage = progress?.estimated_readiness || 0;
  const masteryLevel = progress?.mastery_level || 'novice';
  const bestScore = progress?.best_score || 0;
  const attempts = progress?.attempts || 0;
  const passed = progress?.passed || false;

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'master': return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
      case 'expert': return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      case 'practitioner': return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'apprentice': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const getMasteryIcon = (level: string) => {
    switch (level) {
      case 'master': return <Award className="w-4 h-4" />;
      case 'expert': return <Star className="w-4 h-4" />;
      case 'practitioner': return <Trophy className="w-4 h-4" />;
      case 'apprentice': return <Target className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getReadinessColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <Card className={`
      bg-gray-900/50 border-gray-700/50 hover:border-gray-600/50 
      transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10
      group cursor-pointer
      ${className}
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
              {certification.name}
            </CardTitle>
            <p className="text-sm text-gray-400 line-clamp-2">
              {certification.description}
            </p>
          </div>
          
          {passed && (
            <div className="flex items-center gap-1 text-green-400 bg-green-900/20 px-2 py-1 rounded-full border border-green-500/30">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Aprovado</span>
            </div>
          )}
        </div>

        {hasProgress && (
          <div className="flex items-center gap-2 mt-3">
            <Badge className={`${getMasteryColor(masteryLevel)} text-xs font-medium`}>
              {getMasteryIcon(masteryLevel)}
              <span className="ml-1 capitalize">{masteryLevel}</span>
            </Badge>
            
            {bestScore > 0 && (
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                <Trophy className="w-3 h-3 mr-1" />
                {bestScore}%
              </Badge>
            )}
            
            {attempts > 0 && (
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                <Target className="w-3 h-3 mr-1" />
                {attempts} tentativas
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progresso de Prontidão */}
        {hasProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Prontidão para Exame</span>
              <span className={`font-medium ${getReadinessColor(readinessPercentage)}`}>
                {readinessPercentage}%
              </span>
            </div>
            <Progress 
              value={readinessPercentage} 
              className="h-2 bg-gray-800"
            />
          </div>
        )}

        {/* Estatísticas Rápidas */}
        {hasProgress && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <BookOpen className="w-4 h-4" />
              <span>{progress.questions_practiced} questões</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{progress.recommended_study_time}h estudo</span>
            </div>
          </div>
        )}

        {/* Próximo Marco */}
        {hasProgress && progress.next_milestone && (
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Próximo Marco</span>
            </div>
            <p className="text-xs text-gray-400">
              {progress.next_milestone.description}
            </p>
            {progress.next_milestone.questions_needed > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {progress.next_milestone.questions_needed} questões restantes
              </p>
            )}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onStartSimulation(certification.id)}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-medium"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            {hasProgress ? 'Nova Simulação' : 'Iniciar Simulação'}
          </Button>
          
          {hasProgress && (
            <Button
              onClick={() => onViewProgress(certification.id)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              size="sm"
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Indicador de Dificuldade */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-800">
          <span>Dificuldade: Intermediário</span>
          <span>~90 min</span>
        </div>
      </CardContent>
    </Card>
  );
};