// Esquads Academy - Hook para gerenciar pontos do usuário

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import type { UserPoints } from '@/types/gamification';

export const useUserPoints = () => {
  const { user } = useAuth();
  const { showReward } = useNotifications();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserPoints();
    }
  }, [user]);

  const fetchUserPoints = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Se não existir registro de pontos, criar um
        if (error.code === 'PGRST116') {
          const { data: newPoints, error: createError } = await supabase
            .from('user_points')
            .insert([{
              user_id: user.id,
              total_points: 0,
              level: 1,
              points_to_next_level: 1000,
              streak_days: 0,
              last_activity_date: new Date().toISOString()
            }])
            .select()
            .single();

          if (createError) throw createError;
          setUserPoints(newPoints as unknown as UserPoints);
        } else {
          throw error;
        }
      } else {
        setUserPoints(data as unknown as UserPoints);
      }
    } catch (err) {
      console.error('Error fetching user points:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user points');
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (points: number, reason?: string) => {
    if (!user || !userPoints) return;

    try {
      const oldLevel = userPoints.level;
      const newTotalPoints = userPoints.total_points + points;
      
      // Calcular novo nível baseado nos pontos totais
      const newLevel = Math.floor(newTotalPoints / 1000) + 1;
      const pointsToNext = (newLevel * 1000) - newTotalPoints;

      const { data, error } = await supabase
        .from('user_points')
        .update({
          total_points: newTotalPoints,
          level: newLevel,
          points_to_next_level: pointsToNext,
          last_activity_date: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setUserPoints(data as unknown as UserPoints);
      
      // Mostrar notificação de pontos
      showReward({
        id: `points-${Date.now()}`,
        type: 'points',
        title: 'Pontos Ganhos!',
        description: reason || 'Você ganhou pontos!',
        value: points
      });

      // Se subiu de nível, mostrar notificação de level up
      if (newLevel > oldLevel) {
        showReward({
          id: `level-${Date.now()}`,
          type: 'level_up',
          title: 'Level Up!',
          description: `Parabéns! Você alcançou o nível ${newLevel}!`,
          level: newLevel
        });
      }
      
      // Log da atividade de pontos (opcional)
      console.log(`Pontos adicionados: ${points} (${reason || 'Sem motivo especificado'})`);
      
      return data;
    } catch (err) {
      console.error('Error adding points:', err);
      throw err;
    }
  };

  const getPointsToNextLevel = () => {
    if (!userPoints) return 0;
    return userPoints.points_to_next_level;
  };

  const getLevelProgress = () => {
    if (!userPoints) return 0;
    const currentLevelPoints = (userPoints.level - 1) * 1000;
    const nextLevelPoints = userPoints.level * 1000;
    const progressInLevel = userPoints.total_points - currentLevelPoints;
    const totalLevelPoints = nextLevelPoints - currentLevelPoints;
    return Math.round((progressInLevel / totalLevelPoints) * 100);
  };

  return {
    userPoints,
    points: userPoints?.total_points || 0,
    level: userPoints?.level || 1,
    experienceToNext: getPointsToNextLevel(),
    loading,
    error,
    addPoints,
    getPointsToNextLevel,
    getLevelProgress,
    refetch: fetchUserPoints
  };
};
