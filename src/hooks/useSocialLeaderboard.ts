import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SocialLeaderboard } from '@/types/social';
import { toast } from 'sonner';

export function useSocialLeaderboard() {
  const { user } = useAuth();
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<SocialLeaderboard[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<SocialLeaderboard[]>([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<SocialLeaderboard[]>([]);
  const [userRanking, setUserRanking] = useState<SocialLeaderboard | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all leaderboards
  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchWeeklyLeaderboard(),
        fetchMonthlyLeaderboard(),
        fetchAllTimeLeaderboard(),
        fetchUserRanking()
      ]);
    } catch (error) {
      console.error('Erro ao buscar leaderboards:', error);
      toast.error('Erro ao carregar rankings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch weekly leaderboard
  const fetchWeeklyLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('social_leaderboard')
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .eq('period', 'weekly')
        .order('social_points', { ascending: false })
        .limit(20);

      if (error) throw error;

      setWeeklyLeaderboard(data || []);
    } catch (error) {
      console.error('Erro ao buscar ranking semanal:', error);
    }
  };

  // Fetch monthly leaderboard
  const fetchMonthlyLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('social_leaderboard')
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .eq('period', 'monthly')
        .order('social_points', { ascending: false })
        .limit(20);

      if (error) throw error;

      setMonthlyLeaderboard(data || []);
    } catch (error) {
      console.error('Erro ao buscar ranking mensal:', error);
    }
  };

  // Fetch all-time leaderboard
  const fetchAllTimeLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('social_leaderboard')
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .eq('period', 'all_time')
        .order('social_points', { ascending: false })
        .limit(20);

      if (error) throw error;

      setAllTimeLeaderboard(data || []);
    } catch (error) {
      console.error('Erro ao buscar ranking geral:', error);
    }
  };

  // Fetch current user ranking
  const fetchUserRanking = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('social_leaderboard')
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .eq('period', 'weekly')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setUserRanking(data);
    } catch (error) {
      console.error('Erro ao buscar ranking do usuário:', error);
    }
  };

  // Update user points (called when user performs social actions)
  const updateUserPoints = async (pointsToAdd: number, actionType: string) => {
    if (!user) return;

    try {
      // Call stored procedure to update points
      const { error } = await supabase.rpc('update_social_points', {
        p_user_id: user.id,
        p_points: pointsToAdd,
        p_action_type: actionType
      });

      if (error) throw error;

      // Refresh leaderboards
      await fetchLeaderboards();
    } catch (error) {
      console.error('Erro ao atualizar pontos:', error);
    }
  };

  // Calculate user level based on points
  const getUserLevel = (points: number) => {
    return Math.floor(points / 1000) + 1;
  };

  // Get points needed for next level
  const getPointsToNextLevel = (points: number) => {
    const currentLevel = getUserLevel(points);
    const nextLevelPoints = currentLevel * 1000;
    return nextLevelPoints - points;
  };

  // Get user rank in a specific leaderboard
  const getUserRankInLeaderboard = (leaderboard: SocialLeaderboard[], userId: string) => {
    const userIndex = leaderboard.findIndex(entry => entry.user_id === userId);
    return userIndex >= 0 ? userIndex + 1 : null;
  };

  return {
    weeklyLeaderboard,
    monthlyLeaderboard,
    allTimeLeaderboard,
    userRanking,
    loading,
    fetchLeaderboards,
    fetchWeeklyLeaderboard,
    fetchMonthlyLeaderboard,
    fetchAllTimeLeaderboard,
    fetchUserRanking,
    updateUserPoints,
    getUserLevel,
    getPointsToNextLevel,
    getUserRankInLeaderboard
  };
}