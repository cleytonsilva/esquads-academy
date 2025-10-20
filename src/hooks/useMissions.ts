import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Mission, 
  MissionAttempt, 
  MissionProgress, 
  MissionCategory, 
  MissionFilters,
  MissionStats,
  MISSION_CONSTANTS 
} from '@/types/missions';
import { useGamification } from './useGamification';
import { toast } from 'sonner';

export function useMissions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { gainXP, useLife } = useGamification();

  // Buscar todas as missões aprovadas
  const { data: missions, isLoading: missionsLoading } = useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          certifications (
            id,
            name,
            provider
          )
        `)
        .eq('status', 'approved')
        .order('difficulty', { ascending: true })
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Mission[];
    }
  });

  // Buscar progresso do usuário nas missões
  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['missionProgress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('mission_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data as MissionAttempt[];
    },
    enabled: !!user?.id
  });

  // Buscar categorias de missões (certificações)
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['missionCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certifications')
        .select(`
          *,
          missions!inner (
            id,
            difficulty,
            xp_reward,
            status
          )
        `)
        .eq('missions.status', 'approved');
      
      if (error) throw error;
      
      // Processar dados para criar categorias
      return data.map(cert => {
        const missions = cert.missions || [];
        const totalXP = missions.reduce((sum, mission) => sum + mission.xp_reward, 0);
        
        return {
          id: cert.id,
          name: cert.name,
          description: cert.description,
          icon: cert.provider === 'aws' ? 'Cloud' : cert.provider === 'azure' ? 'CloudSnow' : 'Shield',
          color: cert.provider === 'aws' ? 'orange' : cert.provider === 'azure' ? 'blue' : 'green',
          certification_id: cert.id,
          missions_count: missions.length,
          completed_missions: 0, // Será calculado com base no progresso do usuário
          total_xp: totalXP,
          earned_xp: 0 // Será calculado com base no progresso do usuário
        } as MissionCategory;
      });
    }
  });

  // Calcular estatísticas das missões
  const calculateMissionStats = (): MissionStats | null => {
    if (!missions || !userProgress) return null;

    const completedAttempts = userProgress.filter(attempt => attempt.status === 'completed');
    const totalXPEarned = completedAttempts.reduce((sum, attempt) => {
      const mission = missions.find(m => m.id === attempt.mission_id);
      return sum + (mission?.xp_reward || 0);
    }, 0);

    const totalXPAvailable = missions.reduce((sum, mission) => sum + mission.xp_reward, 0);
    const averageScore = completedAttempts.length > 0 
      ? completedAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.max_score * 100), 0) / completedAttempts.length
      : 0;

    const difficultyBreakdown = {
      easy: { completed: 0, total: 0 },
      medium: { completed: 0, total: 0 },
      hard: { completed: 0, total: 0 }
    };

    missions.forEach(mission => {
      difficultyBreakdown[mission.difficulty].total++;
      const isCompleted = completedAttempts.some(attempt => attempt.mission_id === mission.id);
      if (isCompleted) {
        difficultyBreakdown[mission.difficulty].completed++;
      }
    });

    return {
      total_missions: missions.length,
      completed_missions: completedAttempts.length,
      in_progress_missions: userProgress.filter(attempt => attempt.status === 'in_progress').length,
      total_xp_available: totalXPAvailable,
      total_xp_earned: totalXPEarned,
      average_score: averageScore,
      completion_rate: missions.length > 0 ? (completedAttempts.length / missions.length) * 100 : 0,
      time_spent_total: userProgress.reduce((sum, attempt) => sum + attempt.time_spent, 0),
      favorite_topics: [], // Pode ser implementado baseado nos tópicos das missões completadas
      difficulty_breakdown: difficultyBreakdown
    };
  };

  // Mutation para iniciar uma missão
  const startMissionMutation = useMutation({
    mutationFn: async (missionId: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Verificar se o usuário tem vidas suficientes
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('lives_remaining')
        .eq('user_id', user.id)
        .single();

      if (!userData || userData.lives_remaining <= 0) {
        throw new Error('Sem vidas disponíveis para iniciar a missão');
      }

      // Usar uma vida
      await useLife();

      // Criar tentativa de missão
      const { data, error } = await supabase
        .from('mission_attempts')
        .insert({
          user_id: user.id,
          mission_id: missionId,
          status: 'in_progress',
          score: 0,
          max_score: 100, // Será calculado baseado na missão
          time_spent: 0,
          answers: {},
          started_at: new Date().toISOString(),
          lives_used: 1
        })
        .select()
        .single();

      if (error) throw error;
      return data as MissionAttempt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missionProgress', user?.id] });
      toast.success('🚀 Missão iniciada! Boa sorte!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Mutation para completar uma missão
  const completeMissionMutation = useMutation({
    mutationFn: async ({ 
      attemptId, 
      score, 
      answers, 
      timeSpent 
    }: { 
      attemptId: string; 
      score: number; 
      answers: Record<string, any>; 
      timeSpent: number;
    }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Atualizar tentativa
      const { data: attempt, error } = await supabase
        .from('mission_attempts')
        .update({
          status: 'completed',
          score,
          answers,
          time_spent: timeSpent,
          completed_at: new Date().toISOString()
        })
        .eq('id', attemptId)
        .select(`
          *,
          missions (
            id,
            title,
            difficulty,
            xp_reward
          )
        `)
        .single();

      if (error) throw error;

      // Calcular XP baseado na performance
      const mission = attempt.missions;
      const baseXP = mission.xp_reward;
      const performanceMultiplier = score / 100; // 0-1 baseado na pontuação
      const finalXP = Math.floor(baseXP * performanceMultiplier);

      // Ganhar XP
      if (finalXP > 0) {
        await gainXP({
          amount: finalXP,
          source: 'mission_completion',
          description: `Missão: ${mission.title}`,
          metadata: {
            mission_id: mission.id,
            score,
            difficulty: mission.difficulty
          }
        });
      }

      return { attempt, xpGained: finalXP };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['missionProgress', user?.id] });
      toast.success(`🎉 Missão completada! +${data.xpGained} XP`);
    },
    onError: (error) => {
      toast.error(`Erro ao completar missão: ${error.message}`);
    }
  });

  // Função para filtrar missões
  const filterMissions = (filters: MissionFilters) => {
    if (!missions) return [];

    return missions.filter(mission => {
      if (filters.certification && mission.certification_id !== filters.certification) {
        return false;
      }
      
      if (filters.difficulty && mission.difficulty !== filters.difficulty) {
        return false;
      }
      
      if (filters.topics && filters.topics.length > 0) {
        const hasMatchingTopic = filters.topics.some(topic => 
          mission.topics.some(missionTopic => 
            missionTopic.toLowerCase().includes(topic.toLowerCase())
          )
        );
        if (!hasMatchingTopic) return false;
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          mission.title.toLowerCase().includes(searchLower) ||
          mission.description.toLowerCase().includes(searchLower) ||
          mission.topics.some(topic => topic.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  };

  // Função para obter o progresso de uma missão específica
  const getMissionProgress = (missionId: string): MissionProgress | null => {
    if (!userProgress) return null;

    const attempts = userProgress.filter(attempt => attempt.mission_id === missionId);
    if (attempts.length === 0) {
      return {
        mission_id: missionId,
        user_id: user?.id || '',
        status: 'not_started',
        best_score: 0,
        attempts_count: 0,
        completion_percentage: 0,
        time_spent_total: 0
      };
    }

    const completedAttempts = attempts.filter(attempt => attempt.status === 'completed');
    const bestScore = completedAttempts.length > 0 
      ? Math.max(...completedAttempts.map(attempt => (attempt.score / attempt.max_score) * 100))
      : 0;

    const hasInProgress = attempts.some(attempt => attempt.status === 'in_progress');
    const hasCompleted = completedAttempts.length > 0;

    return {
      mission_id: missionId,
      user_id: user?.id || '',
      status: hasInProgress ? 'in_progress' : hasCompleted ? 'completed' : 'not_started',
      best_score: bestScore,
      attempts_count: attempts.length,
      last_attempt_at: attempts[0]?.started_at,
      completion_percentage: bestScore,
      time_spent_total: attempts.reduce((sum, attempt) => sum + attempt.time_spent, 0)
    };
  };

  const stats = calculateMissionStats();

  return {
    // Data
    missions,
    userProgress,
    categories,
    stats,
    
    // Loading states
    isLoading: missionsLoading || progressLoading || categoriesLoading,
    
    // Actions
    startMission: startMissionMutation.mutate,
    completeMission: completeMissionMutation.mutate,
    
    // Utilities
    filterMissions,
    getMissionProgress,
    
    // Loading states for mutations
    isStarting: startMissionMutation.isPending,
    isCompleting: completeMissionMutation.isPending
  };
}