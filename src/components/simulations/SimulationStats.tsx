// Esquads Academy - Estatísticas de Simulações
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  Award,
  BookOpen,
  Zap,
  Calendar,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import type { UserSimulationStats } from '@/types/simulations';

interface SimulationStatsProps {
  stats: UserSimulationStats;
  className?: string;
}

export const SimulationStats: React.FC<SimulationStatsProps> = ({
  stats,
  className = ''
}) => {
  const completionRate = stats.total_sessions > 0 
    ? Math.round((stats.completed_sessions / stats.total_sessions) * 100)
    : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-900/20 text-green-400 border-green-500/30';
    if (score >= 70) return 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30';
    if (score >= 60) return 'bg-orange-900/20 text-orange-400 border-orange-500/30';
    return 'bg-red-900/20 text-red-400 border-red-500/30';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Simulações Completadas */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Simulações</p>
                <p className="text-2xl font-bold text-white">{stats.completed_sessions}</p>
                <p className="text-xs text-gray-500">de {stats.total_sessions} iniciadas</p>
              </div>
              <div className="p-2 bg-cyan-900/20 rounded-lg">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div className="mt-3">
              <Progress value={completionRate} className="h-2 bg-gray-800" />
              <p className="text-xs text-gray-500 mt-1">{completionRate}% de conclusão</p>
            </div>
          </CardContent>
        </Card>

        {/* Pontuação Média */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pontuação Média</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats.average_score)}`}>
                  {stats.average_score}%
                </p>
                <p className="text-xs text-gray-500">Melhor: {stats.best_score}%</p>
              </div>
              <div className="p-2 bg-yellow-900/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificações */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Certificações</p>
                <p className="text-2xl font-bold text-white">{stats.certifications_passed}</p>
                <p className="text-xs text-gray-500">de {stats.certifications_attempted} tentadas</p>
              </div>
              <div className="p-2 bg-green-900/20 rounded-lg">
                <Award className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tempo Total */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tempo de Estudo</p>
                <p className="text-2xl font-bold text-white">
                  {formatTime(stats.total_time_spent)}
                </p>
                <p className="text-xs text-gray-500">Total praticado</p>
              </div>
              <div className="p-2 bg-purple-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Certificação */}
      {Object.keys(stats.performance_by_certification).length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Performance por Certificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.performance_by_certification).map(([certName, data]) => (
              <div key={certName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-white">{certName}</h4>
                    {data.passed && (
                      <Badge className="bg-green-900/20 text-green-400 border-green-500/30 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aprovado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getScoreBadgeColor(data.best_score)} text-xs`}>
                      Melhor: {data.best_score}%
                    </Badge>
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                      {data.attempts} tentativas
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Média: </span>
                    <span className={getScoreColor(data.average_score)}>
                      {data.average_score}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Última tentativa: </span>
                    <span className="text-gray-300">
                      {new Date(data.last_attempt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                <Progress 
                  value={data.best_score} 
                  className="h-2 bg-gray-800"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sessões Recentes */}
      {stats.recent_sessions.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Simulações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent_sessions.map((session, index) => (
                <div 
                  key={session.session_id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${session.passed ? 'bg-green-400' : 'bg-red-400'}`} />
                    <div>
                      <p className="font-medium text-white text-sm">
                        {session.certification_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(session.completed_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`${getScoreBadgeColor(session.score)} text-xs`}>
                      {session.score}%
                    </Badge>
                    {session.passed && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streak e Conquistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-400" />
              Sequência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Sequência Atual</span>
              <span className="text-2xl font-bold text-orange-400">
                {stats.current_streak}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Melhor Sequência</span>
              <span className="text-lg font-medium text-gray-300">
                {stats.longest_streak}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Progresso Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Taxa de Aprovação</span>
              <span className="text-lg font-medium text-green-400">
                {stats.certifications_attempted > 0 
                  ? Math.round((stats.certifications_passed / stats.certifications_attempted) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Horas de Prática</span>
              <span className="text-lg font-medium text-gray-300">
                {Math.round(stats.total_time_spent / 3600)}h
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};