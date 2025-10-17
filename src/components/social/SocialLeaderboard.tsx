import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Users, 
  Target,
  Crown,
  Star,
  Zap,
  Calendar
} from 'lucide-react';
import { SocialLeaderboard as LeaderboardType } from '@/types/social';
import { useSocialLeaderboard } from '@/hooks/useSocialLeaderboard';
import { useAuth } from '@/contexts/AuthContext';

export function SocialLeaderboard() {
  const { user } = useAuth();
  const {
    weeklyLeaderboard,
    monthlyLeaderboard,
    allTimeLeaderboard,
    userRanking,
    loading,
    fetchLeaderboards
  } = useSocialLeaderboard();

  const [activeTab, setActiveTab] = useState('weekly');

  useEffect(() => {
    fetchLeaderboards();
  }, []);

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
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  const getCurrentLeaderboard = () => {
    switch (activeTab) {
      case 'weekly':
        return weeklyLeaderboard;
      case 'monthly':
        return monthlyLeaderboard;
      case 'alltime':
        return allTimeLeaderboard;
      default:
        return weeklyLeaderboard;
    }
  };

  const LeaderboardList = ({ data }: { data: LeaderboardType[] }) => (
    <div className="space-y-3">
      {data.map((entry, index) => {
        const position = index + 1;
        const isCurrentUser = entry.user_id === user?.id;
        
        return (
          <Card 
            key={entry.id} 
            className={`transition-all duration-200 ${
              isCurrentUser 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(position)} text-white`}>
                    {position <= 3 ? getRankIcon(position) : `#${position}`}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.user?.avatar_url} />
                      <AvatarFallback>
                        {entry.user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {entry.user?.full_name || 'Usuário'}
                        </p>
                        {isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">Você</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Nível {Math.floor(entry.social_points / 1000) + 1}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold text-blue-600">
                    <Star className="h-4 w-4" />
                    {entry.social_points.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {entry.posts_count} posts • {entry.comments_count} comentários
                  </div>
                </div>
              </div>
              
              {/* Progress indicators */}
              <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    {entry.likes_received}
                  </div>
                  <span className="text-xs text-gray-500">Curtidas</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-sm font-medium text-purple-600">
                    <Users className="h-3 w-3" />
                    {entry.groups_joined}
                  </div>
                  <span className="text-xs text-gray-500">Grupos</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-sm font-medium text-orange-600">
                    <Zap className="h-3 w-3" />
                    {entry.streak_days}
                  </div>
                  <span className="text-xs text-gray-500">Sequência</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User's Current Ranking */}
      {userRanking && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Sua Posição Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                  #{userRanking.rank_position || '?'}
                </div>
                <div>
                  <p className="text-xl font-bold">{userRanking.social_points} pontos</p>
                  <p className="text-blue-100">
                    Nível {Math.floor(userRanking.social_points / 1000) + 1}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">{userRanking.posts_count}</p>
                    <p className="text-xs text-blue-100">Posts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userRanking.likes_received}</p>
                    <p className="text-xs text-blue-100">Curtidas</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Ranking Social
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Semanal
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Mensal
              </TabsTrigger>
              <TabsTrigger value="alltime" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Geral
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Ranking Semanal</h3>
                  <Badge variant="outline">Esta semana</Badge>
                </div>
                <LeaderboardList data={weeklyLeaderboard} />
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Ranking Mensal</h3>
                  <Badge variant="outline">Este mês</Badge>
                </div>
                <LeaderboardList data={monthlyLeaderboard} />
              </div>
            </TabsContent>
            
            <TabsContent value="alltime" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Ranking Geral</h3>
                  <Badge variant="outline">Todos os tempos</Badge>
                </div>
                <LeaderboardList data={allTimeLeaderboard} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Achievement Hints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Como Ganhar Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-800">Criar Posts</p>
                <p className="text-sm text-green-600">+10 pontos por post</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-blue-800">Receber Curtidas</p>
                <p className="text-sm text-blue-600">+5 pontos por curtida</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-purple-800">Participar de Grupos</p>
                <p className="text-sm text-purple-600">+20 pontos por grupo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-orange-800">Manter Sequência</p>
                <p className="text-sm text-orange-600">+15 pontos por dia</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}