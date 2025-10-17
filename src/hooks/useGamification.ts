import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  UserPoints, 
  Badge, 
  UserBadge, 
  Mission, 
  UserMission, 
  LeaderboardEntry, 
  GamificationStats,
  LevelConfig,
  PointsHistory,
  GamificationActivity
} from '@/types/gamification';

export function useGamification(userId?: string) {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [levelConfigs, setLevelConfigs] = useState<LevelConfig[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [activities, setActivities] = useState<GamificationActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar configurações de níveis
  const loadLevelConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('level_configs')
        .select('*')
        .order('level', { ascending: true });

      if (error) throw error;
      setLevelConfigs(data || []);
    } catch (err) {
      console.error('Erro ao carregar configurações de níveis:', err);
    }
  };

  // Carregar dados do usuário
  const loadUserData = async (currentUserId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Carregar pontos do usuário
      let { data: userPointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', currentUserId)
        .single();

      if (pointsError && pointsError.code === 'PGRST116') {
        // Usuário não tem pontos ainda, criar registro inicial
        const { data: newUserPoints, error: createError } = await supabase
          .from('user_points')
          .insert({
            user_id: currentUserId,
            total_points: 0,
            level: 1,
            experience_points: 0,
            current_streak: 0,
            longest_streak: 0,
            last_activity_date: new Date().toISOString().split('T')[0]
          })
          .select()
          .single();

        if (createError) throw createError;
        userPointsData = newUserPoints;
      } else if (pointsError) {
        throw pointsError;
      }

      setUserPoints(userPointsData);

      // Carregar badges do usuário
      const { data: userBadgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', currentUserId);

      if (badgesError) throw badgesError;
      setUserBadges(userBadgesData || []);

      // Carregar todos os badges disponíveis
      const { data: allBadgesData, error: allBadgesError } = await supabase
        .from('badges')
        .select('*');

      if (allBadgesError) throw allBadgesError;
      setBadges(allBadgesData || []);

      // Carregar progresso das missões do usuário
      const { data: userMissionsData, error: missionsError } = await supabase
        .from('mission_progress')
        .select(`
          *,
          mission:missions(*)
        `)
        .eq('user_id', currentUserId);

      if (missionsError) throw missionsError;
      setUserMissions(userMissionsData || []);

      // Carregar todas as missões disponíveis
      const { data: allMissionsData, error: allMissionsError } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true);

      if (allMissionsError) throw allMissionsError;
      setMissions(allMissionsData || []);

      // Carregar histórico de pontos
      const { data: historyData, error: historyError } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (historyError) throw historyError;
      setPointsHistory(historyData || []);

      // Carregar atividades de gamificação
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('gamification_activities')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Calcular estatísticas
      const totalBadges = userBadgesData?.length || 0;
      const completedMissions = userMissionsData?.filter(m => m.status === 'completed').length || 0;
      const totalMissions = userMissionsData?.length || 0;
      
      setStats({
        total_points: userPointsData?.total_points || 0,
        current_level: userPointsData?.level || 1,
        points_to_next_level: userPointsData?.points_to_next_level || 0,
        badges_earned: totalBadges,
        missions_completed: completedMissions,
        current_streak: userPointsData?.current_streak || 0,
        longest_streak: userPointsData?.longest_streak || 0,
        rank_position: 0,
        total_users: 0
      });

    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };



  // Carregar leaderboard
  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select(`
          user_id,
          total_points,
          level,
          current_streak,
          user:users(full_name, avatar_url)
        `)
        .order('total_points', { ascending: false })
        .limit(10);

      if (error) throw error;

      const leaderboardData: LeaderboardEntry[] = data?.map((entry, index) => ({
        user_id: entry.user_id,
        username: entry.user?.full_name || 'Usuário',
        full_name: entry.user?.full_name || 'Usuário',
        avatar_url: entry.user?.avatar_url || '',
        total_points: entry.total_points,
        level: entry.level,
        badges_count: 0, // Será calculado separadamente se necessário
        position: index + 1
      })) || [];

      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error('Erro ao carregar leaderboard:', err);
    }
  };

  // Adicionar pontos
  const addPoints = async (points: number, reason: string, sourceType: string, sourceId?: string) => {
    if (!userId) return;

    try {
      // Adicionar ao histórico
      const { error: historyError } = await supabase
        .from('points_history')
        .insert({
          user_id: userId,
          points,
          reason,
          source_type: sourceType,
          source_id: sourceId
        });

      if (historyError) throw historyError;

      // Atualizar pontos do usuário
      const currentPoints = userPoints?.total_points || 0;
      const newTotalPoints = currentPoints + points;
      
      // Calcular novo nível baseado nos pontos
      let newLevel = userPoints?.level || 1;
      const currentLevelConfig = levelConfigs.find(config => config.level === newLevel);
      const nextLevelConfig = levelConfigs.find(config => config.level === newLevel + 1);
      
      if (nextLevelConfig && newTotalPoints >= nextLevelConfig.points_required) {
        newLevel = nextLevelConfig.level;
        
        // Criar atividade de level up
        await supabase
          .from('gamification_activities')
          .insert({
            user_id: userId,
            type: 'level_up',
            title: `Nível ${newLevel} alcançado!`,
            description: `Parabéns! Você alcançou o nível ${newLevel}`,
            points_earned: 0,
            metadata: { level: newLevel, previous_level: userPoints?.level || 1 }
          });
      }

      const { error: updateError } = await supabase
        .from('user_points')
        .update({
          total_points: newTotalPoints,
          level: newLevel,
          experience_points: newTotalPoints,
          last_activity_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Recarregar dados
      await loadUserData(userId);
      
    } catch (err) {
      console.error('Erro ao adicionar pontos:', err);
      throw err;
    }
  };

  // Completar missão
  const completeMission = async (missionId: string) => {
    if (!userId) return;

    try {
      // Buscar dados da missão
      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single();

      if (missionError) throw missionError;

      // Atualizar progresso da missão
      const { error: progressError } = await supabase
        .from('mission_progress')
        .upsert({
          user_id: userId,
          mission_id: missionId,
          status: 'completed',
          progress: mission.target_value,
          completed_at: new Date().toISOString()
        });

      if (progressError) throw progressError;

      // Adicionar pontos da missão
      await addPoints(
        mission.points_reward,
        `Missão completada: ${mission.title}`,
        'mission',
        missionId
      );

      // Criar atividade de missão completada
      await supabase
        .from('gamification_activities')
        .insert({
          user_id: userId,
          type: 'mission_completed',
          title: 'Missão completada!',
          description: `Você completou a missão: ${mission.title}`,
          points_earned: mission.points_reward,
          metadata: { mission_id: missionId, mission_title: mission.title }
        });

      // Se a missão tem badge como recompensa, conceder o badge
      if (mission.badge_reward) {
        await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: mission.badge_reward,
            earned_at: new Date().toISOString()
          });

        // Criar atividade de badge conquistado
        const { data: badge } = await supabase
          .from('badges')
          .select('name')
          .eq('id', mission.badge_reward)
          .single();

        if (badge) {
          await supabase
            .from('gamification_activities')
            .insert({
              user_id: userId,
              type: 'badge_earned',
              title: 'Badge conquistado!',
              description: `Você conquistou o badge: ${badge.name}`,
              points_earned: 0,
              metadata: { badge_id: mission.badge_reward, badge_name: badge.name }
            });
        }
      }

      // Recarregar dados
      await loadUserData(userId);
      
    } catch (err) {
      console.error('Erro ao completar missão:', err);
      throw err;
    }
  };

  // Efeitos
  useEffect(() => {
    loadLevelConfigs();
    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (userId) {
      loadUserData(userId);
    }
  }, [userId]);

  return {
    userPoints,
    badges,
    userBadges,
    missions,
    userMissions,
    leaderboard,
    stats,
    levelConfigs,
    pointsHistory,
    activities,
    loading,
    error,
    addPoints,
    completeMission,
    refreshData: () => userId && loadUserData(userId),
    refreshLeaderboard: loadLeaderboard
  };
}
