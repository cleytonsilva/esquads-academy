import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Trophy, 
  Target, 
  Award, 
  TrendingUp, 
  Calendar,
  Clock,
  Zap,
  Users,
  Gift,
  History
} from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { useUserPoints } from '@/hooks/useUserPoints';
import { useAuth } from '@/contexts/AuthContext';
import { PointsDisplay } from '@/components/gamification/PointsDisplay';
import { MissionCard } from '@/components/gamification/MissionCard';
import { BadgeCard } from '@/components/gamification/BadgeCard';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { RewardNotification } from '@/components/gamification/RewardNotification';
import { formatPoints, formatRelativeTime } from '@/utils/format';

export default function Gamification() {
  const { user } = useAuth();
  const {
    userPoints,
    badges,
    userBadges,
    missions,
    userMissions,
    leaderboard,
    stats,
    pointsHistory,
    activities,
    loading,
    error,
    addPoints,
    completeMission
  } = useGamification();

  const { userPoints: userPointsData, loading: pointsLoading, getLevelProgress } = useUserPoints();

  const [rewards, setRewards] = useState<any[]>([]);

  const handleCompleteMission = async (missionId: string) => {
    try {
      const result = await completeMission(missionId);
      // Resultado da missão completada
      console.log('Missão completada:', result);
    } catch (error) {
      console.error('Erro ao completar missão:', error);
    }
  };

  const handleStartMission = (missionId: string) => {
    // Implementar lógica para iniciar missão
    console.log('Iniciando missão:', missionId);
  };

  const clearRewards = () => {
    setRewards([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando gamificação...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dados de gamificação</p>
          <Button onClick={() => {
            // Recarrega apenas os dados necessários sem recarregar a página inteira
            console.log('Tentando recarregar dados de gamificação...');
            // Os hooks já gerenciam o recarregamento automático
          }}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Filtrar missões ativas e disponíveis - com verificações de segurança
  const activeMissions = (missions || []).filter(mission => {
    const userMission = (userMissions || []).find(um => um.mission_id === mission.id);
    return userMission && userMission.status === 'active';
  });

  const availableMissions = (missions || []).filter(mission => {
    const userMission = (userMissions || []).find(um => um.mission_id === mission.id);
    return !userMission && mission.is_active;
  });

  const completedMissions = (missions || []).filter(mission => {
    const userMission = (userMissions || []).find(um => um.mission_id === mission.id);
    return userMission && userMission.status === 'completed';
  });

  // Filtrar badges conquistados - com verificações de segurança
  const earnedBadges = (badges || []).filter(badge => 
    (userBadges || []).some(ub => ub.badge_id === badge.id)
  );

  const availableBadges = (badges || []).filter(badge => 
    !(userBadges || []).some(ub => ub.badge_id === badge.id)
  );

  return (
    <div className="space-y-6">
      {/* Header com pontos e nível */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PointsDisplay
            points={userPointsData?.total_points || 0}
            level={userPointsData?.level || 1}
            streak={userPointsData?.streak_days || 0}
            levelProgress={getLevelProgress()}
            pointsToNext={userPointsData?.points_to_next_level || 0}
            variant="detailed"
          />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Missões</span>
              </div>
              <span className="font-semibold">{stats?.missions_completed || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-600">Badges</span>
              </div>
              <span className="font-semibold">{stats?.badges_earned || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Ranking</span>
              </div>
              <span className="font-semibold">#{stats?.rank_position || '-'}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-gray-600">Sequência</span>
              </div>
              <span className="font-semibold">0 dias</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="missions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="missions">Missões Ativas</TabsTrigger>
          <TabsTrigger value="available">Disponíveis</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Missões Ativas */}
        <TabsContent value="missions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Missões Ativas</h2>
            <Badge variant="secondary">
              {activeMissions.length} ativa{activeMissions.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {activeMissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma missão ativa
                </h3>
                <p className="text-gray-600 mb-4">
                  Explore as missões disponíveis para começar a ganhar pontos!
                </p>
                <Button onClick={() => {
                  const element = document.querySelector('[value="available"]') as HTMLElement;
                  element?.click();
                }}>
                  Ver Missões Disponíveis
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMissions.map((mission) => {
                const userMission = userMissions.find(um => um.mission_id === mission.id);
                return (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    progress={userMission?.current_progress || 0}
                    completed={userMission?.status === 'completed'}
                    completedAt={userMission?.completed_at}
                    onComplete={() => handleCompleteMission(mission.id)}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Missões Disponíveis */}
        <TabsContent value="available" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Missões Disponíveis</h2>
            <Badge variant="secondary">
              {availableMissions.length} disponíve{availableMissions.length !== 1 ? 'is' : 'l'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                progress={0}
                completed={false}
                onStart={() => handleStartMission(mission.id)}
              />
            ))}
          </div>

          {/* Missões recentemente completadas */}
          {completedMissions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Recentemente Completadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedMissions.slice(0, 3).map((mission) => {
                  const userMission = userMissions.find(um => um.mission_id === mission.id);
                  return (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      progress={mission.target_value}
                      completed={true}
                      completedAt={userMission?.completed_at}
                      variant="compact"
                    />
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="space-y-6">
          {/* Badges conquistados */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Badges Conquistados</h2>
              <Badge variant="secondary">
                {earnedBadges.length} conquistado{earnedBadges.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {earnedBadges.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum badge conquistado ainda</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {earnedBadges.map((badge) => {
                  const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
                  return (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      earned={true}
                      earnedAt={userBadge?.earned_at}
                      size="md"
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Badges disponíveis */}
          <div>
            <h3 className="text-lg font-medium mb-4">Badges Disponíveis</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {availableBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  earned={false}
                  size="md"
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard">
          <Leaderboard
            entries={leaderboard}
            currentUserId={user?.id}
            title="Ranking Global"
            showBadges={true}
            maxEntries={20}
          />
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="history" className="space-y-6">
          {/* Histórico de pontos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Histórico de Pontos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pointsHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum histórico de pontos ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pointsHistory.slice(0, 10).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Star className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            +{formatPoints(entry.points_earned)} pontos
                          </p>
                          <p className="text-sm text-gray-600">{entry.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {formatRelativeTime(entry.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Atividades recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Atividades Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhuma atividade recente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Gift className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.type}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {formatRelativeTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notificação de recompensas */}
      {rewards.length > 0 && (
        <RewardNotification
          rewards={rewards}
          onClose={clearRewards}
          autoClose={true}
          autoCloseDelay={5000}
        />
      )}
    </div>
  );
}
