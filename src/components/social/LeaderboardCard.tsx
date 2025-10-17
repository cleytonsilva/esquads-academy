import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Star,
  Crown,
  Zap,
  Target,
  Users,
  Calendar
} from 'lucide-react';
import { SocialLeaderboard } from '@/types/social';

interface LeaderboardCardProps {
  leaderboard: SocialLeaderboard;
  currentUserRank?: number;
  showFullRanking?: boolean;
  onViewDetails?: (leaderboardId: string) => void;
  onJoinChallenge?: (challengeId: string) => void;
}

export function LeaderboardCard({ 
  leaderboard, 
  currentUserRank,
  showFullRanking = false,
  onViewDetails,
  onJoinChallenge
}: LeaderboardCardProps) {
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{position}</span>;
    }
  };

  const getRankBadgeColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLeaderboardTypeIcon = (type: string) => {
    switch (type) {
      case 'weekly':
        return <Calendar className="h-4 w-4" />;
      case 'monthly':
        return <TrendingUp className="h-4 w-4" />;
      case 'challenge':
        return <Target className="h-4 w-4" />;
      case 'course':
        return <Star className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const getLeaderboardTypeLabel = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensal';
      case 'challenge':
        return 'Desafio';
      case 'course':
        return 'Curso';
      case 'all_time':
        return 'Geral';
      default:
        return type;
    }
  };

  const displayedRankings = showFullRanking 
    ? leaderboard.rankings 
    : leaderboard.rankings.slice(0, 5);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
              {getLeaderboardTypeIcon(leaderboard.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{leaderboard.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Badge variant="secondary" className="text-xs">
                  {getLeaderboardTypeLabel(leaderboard.type)}
                </Badge>
                <span>•</span>
                <span>{leaderboard.rankings.length} participantes</span>
              </div>
            </div>
          </div>
          
          {leaderboard.is_active && (
            <Badge className="bg-green-100 text-green-800">
              <Zap className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descrição */}
        {leaderboard.description && (
          <p className="text-gray-700 text-sm">{leaderboard.description}</p>
        )}

        {/* Período */}
        {(leaderboard.start_date || leaderboard.end_date) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {leaderboard.start_date && new Date(leaderboard.start_date).toLocaleDateString('pt-BR')}
              {leaderboard.start_date && leaderboard.end_date && ' - '}
              {leaderboard.end_date && new Date(leaderboard.end_date).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}

        {/* Posição do usuário atual */}
        {currentUserRank && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Sua posição:</span>
              <div className="flex items-center gap-2">
                {getRankIcon(currentUserRank)}
                <span className="font-bold text-blue-800">#{currentUserRank}</span>
              </div>
            </div>
          </div>
        )}

        {/* Rankings */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Top Participantes</h4>
            {!showFullRanking && leaderboard.rankings.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails?.(leaderboard.id)}
                className="text-blue-600 hover:text-blue-700"
              >
                Ver todos
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {displayedRankings.map((ranking, index) => (
              <div
                key={ranking.user_id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  index < 3 ? 'bg-gradient-to-r from-gray-50 to-white border' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(ranking.position)}
                  </div>
                  
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={ranking.user?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {ranking.user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <p className="font-medium text-sm">{ranking.user?.full_name}</p>
                    {ranking.user?.department && (
                      <p className="text-xs text-gray-500">{ranking.user.department}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{ranking.score}</span>
                    <span className="text-sm text-gray-500">pts</span>
                  </div>
                  
                  {ranking.change && (
                    <div className={`flex items-center gap-1 text-xs ${
                      ranking.change > 0 ? 'text-green-600' : 
                      ranking.change < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      <TrendingUp className={`h-3 w-3 ${
                        ranking.change < 0 ? 'rotate-180' : ''
                      }`} />
                      <span>{Math.abs(ranking.change)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prêmios/Recompensas */}
        {leaderboard.rewards && leaderboard.rewards.length > 0 && (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Recompensas</span>
            </div>
            <div className="space-y-1">
              {leaderboard.rewards.map((reward, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-yellow-700">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`} lugar
                  </span>
                  <span className="font-medium text-yellow-800">{reward}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {leaderboard.type === 'challenge' && leaderboard.is_active && onJoinChallenge && (
            <Button
              size="sm"
              onClick={() => onJoinChallenge(leaderboard.challenge_id!)}
              className="flex-1"
            >
              <Target className="h-4 w-4 mr-2" />
              Participar do Desafio
            </Button>
          )}
          
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(leaderboard.id)}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
          )}
        </div>

        {/* Estatísticas adicionais */}
        {(leaderboard.total_participants || leaderboard.average_score) && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t text-center">
            {leaderboard.total_participants && (
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {leaderboard.total_participants}
                </p>
                <p className="text-xs text-gray-500">Participantes</p>
              </div>
            )}
            
            {leaderboard.average_score && (
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {leaderboard.average_score.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">Média de Pontos</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}