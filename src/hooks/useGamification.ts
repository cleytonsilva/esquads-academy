import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserStats, 
  Achievement, 
  XPGain, 
  LevelProgress, 
  LifeSystem,
  GAMIFICATION_CONSTANTS 
} from '@/types/gamification';
import { GamificationService } from '@/services/gamificationService';
import { toast } from 'sonner';

export function useGamification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar estatísticas do usuário
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_stats')
        .select('user_id, total_xp, level, streak_days, total_study_time, courses_completed, missions_completed, simulations_completed, achievements_count, badges_earned')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as UserStats;
    },
    enabled: !!user?.id
  });

  // Buscar conquistas do usuário
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data as Achievement[];
    },
    enabled: !!user?.id
  });

  // Calcular nível e progresso
  const calculateLevel = (totalXP: number): LevelProgress => {
    const level = Math.floor(totalXP / GAMIFICATION_CONSTANTS.XP_PER_LEVEL) + 1;
    const xpInCurrentLevel = totalXP % GAMIFICATION_CONSTANTS.XP_PER_LEVEL;
    const xpForNextLevel = GAMIFICATION_CONSTANTS.XP_PER_LEVEL - xpInCurrentLevel;
    const progress = (xpInCurrentLevel / GAMIFICATION_CONSTANTS.XP_PER_LEVEL) * 100;

    return {
      currentLevel: level,
      currentXP: xpInCurrentLevel,
      xpForNextLevel,
      totalXPForNextLevel: GAMIFICATION_CONSTANTS.XP_PER_LEVEL,
      progress
    };
  };

  // Calcular sistema de vidas
  const calculateLifeSystem = (stats: UserStats): LifeSystem => {
    const maxLives = stats.subscription_type === 'premium' 
      ? GAMIFICATION_CONSTANTS.MAX_LIVES_PREMIUM 
      : GAMIFICATION_CONSTANTS.MAX_LIVES_FREE;

    return {
      current: stats.lives_remaining,
      max: maxLives,
      regenTime: GAMIFICATION_CONSTANTS.LIFE_REGEN_TIME,
      lastUsed: stats.updated_at
    };
  };

  // Mutation para ganhar XP usando o serviço
  const gainXPMutation = useMutation({
    mutationFn: async (xpGain: XPGain) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      return await GamificationService.processXPGain(user.id, xpGain);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userStats', user?.id] });
      
      if (data.levelUp) {
        queryClient.invalidateQueries({ queryKey: ['achievements', user?.id] });
        toast.success(`🎉 Parabéns! Você subiu para o nível ${data.newLevel}!`);
      }
      
      if (data.newAchievements.length > 0) {
        data.newAchievements.forEach(achievement => {
          toast.success(`🏆 Nova conquista: ${achievement.achievement_name}!`);
        });
      }
      
      toast.success(`+${data.newTotalXP - (userStats?.total_xp || 0)} XP ganho!`);
    },
    onError: (error) => {
      toast.error(`Erro ao ganhar XP: ${error.message}`);
    }
  });

  // Mutation para usar uma vida usando o serviço
  const useLifeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      return await GamificationService.useLife(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStats', user?.id] });
      toast.info('💔 Uma vida foi usada');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Mutation para regenerar vidas usando o serviço
  const regenLifeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      return await GamificationService.regenerateLife(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStats', user?.id] });
      toast.success('💚 Uma vida foi regenerada!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Mutation para adicionar conquista usando o serviço
  const addAchievementMutation = useMutation({
    mutationFn: async (achievement: Omit<Achievement, 'id' | 'user_id' | 'earned_at'>) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      return await GamificationService.grantAchievement(user.id, achievement);
    },
    onSuccess: (achievement) => {
      queryClient.invalidateQueries({ queryKey: ['achievements', user?.id] });
      if (achievement) {
        toast.success(`🏆 Nova conquista: ${achievement.achievement_name}!`);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar conquista: ${error.message}`);
    }
  });

  // Mutation para atualizar progresso
  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      certificationId, 
      progressData 
    }: { 
      certificationId: string; 
      progressData: {
        topicScores?: Record<string, number>;
        missionsCompleted?: number;
        simulationsTaken?: number;
        masteryLevel?: number;
      }
    }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      return await GamificationService.updateUserProgress(user.id, certificationId, progressData);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas ao progresso
      queryClient.invalidateQueries({ queryKey: ['userProgress', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userStats', user?.id] });
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar progresso: ${error.message}`);
    }
  });

  const levelProgress = userStats ? calculateLevel(userStats.total_xp) : null;
  const lifeSystem = userStats ? calculateLifeSystem(userStats) : null;

  return {
    // Data
    userStats,
    achievements,
    levelProgress,
    lifeSystem,
    
    // Loading states
    isLoading: statsLoading || achievementsLoading,
    
    // Actions
    gainXP: gainXPMutation.mutate,
    useLife: useLifeMutation.mutate,
    regenLife: regenLifeMutation.mutate,
    addAchievement: addAchievementMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
    
    // Utilities
    calculateLevel,
    calculateLifeSystem,
    
    // Service methods
    calculateXP: GamificationService.calculateXP,
    checkAchievements: (userId: string) => GamificationService.checkAndGrantAchievements(userId)
  };
}