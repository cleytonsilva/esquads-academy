/**
 * Hook robusto para sistema de missões e gamificação
 * Inclui cache inteligente, fallbacks e tratamento de erros
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCachedUserData, useCache } from '@/hooks/useCache';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TTL } from '@/services/cacheService';
import { MISSION_DELIVERY_MODES, MISSION_ENVIRONMENTS } from '@/utils/constants';

type MissionEnvironment = typeof MISSION_ENVIRONMENTS[keyof typeof MISSION_ENVIRONMENTS];
type MissionDeliveryMode = typeof MISSION_DELIVERY_MODES[keyof typeof MISSION_DELIVERY_MODES];

const resolveEnvironment = (raw?: string | null, category?: string): MissionEnvironment => {
  const normalized = (raw || '').toLowerCase();
  const normalizedCategory = (category || '').toLowerCase();

  if (normalized.includes('firewall') || normalizedCategory.includes('firewall')) {
    return MISSION_ENVIRONMENTS.FIREWALL;
  }

  if (normalized.includes('forensic') || normalized.includes('forense') || normalizedCategory.includes('forense')) {
    return MISSION_ENVIRONMENTS.FORENSICS;
  }

  if (normalized.includes('shell') || normalized.includes('terminal')) {
    return MISSION_ENVIRONMENTS.INCIDENT_RESPONSE;
  }

  return MISSION_ENVIRONMENTS.INCIDENT_RESPONSE;
};

const resolveDeliveryMode = (environment: MissionEnvironment, raw?: string | null): MissionDeliveryMode => {
  const normalized = (raw || '').toLowerCase();

  if (normalized.includes('config')) {
    return MISSION_DELIVERY_MODES.CONFIG_PANEL;
  }

  if (normalized.includes('hybrid')) {
    return MISSION_DELIVERY_MODES.HYBRID;
  }

  if (normalized.includes('terminal')) {
    return MISSION_DELIVERY_MODES.TERMINAL;
  }

  if (environment === MISSION_ENVIRONMENTS.FIREWALL) {
    return MISSION_DELIVERY_MODES.CONFIG_PANEL;
  }

  if (environment === MISSION_ENVIRONMENTS.FORENSICS) {
    return MISSION_DELIVERY_MODES.HYBRID;
  }

  return MISSION_DELIVERY_MODES.TERMINAL;
};

export interface Mission {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement' | 'challenge';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  target_value: number;
  current_progress: number;
  status: 'active' | 'completed' | 'expired' | 'locked';
  expires_at?: string;
  completed_at?: string;
  requirements?: string[];
  hints?: string[];
  estimated_time?: number;
  tags?: string[];
  environment: typeof MISSION_ENVIRONMENTS[keyof typeof MISSION_ENVIRONMENTS];
  delivery_mode: typeof MISSION_DELIVERY_MODES[keyof typeof MISSION_DELIVERY_MODES];
  xp_reward: number;
  badge_reward?: string;
  lives_required?: number;
  unlock_requirement?: string;
  flag_hint?: string;
  metadata?: {
    course_id?: string;
    lesson_id?: string;
    skill?: string;
    streak_type?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  user_id: string;
  total_points: number;
  level: number;
  experience: number;
  experience_to_next_level: number;
  daily_streak: number;
  weekly_streak: number;
  completed_missions: number;
  active_missions: number;
  achievements: string[];
  badges: string[];
  last_activity: string;
}

interface MissionStats {
  total_missions: number;
  completed_missions: number;
  active_missions: number;
  completion_rate: number;
  total_points_earned: number;
  average_difficulty: number;
  favorite_categories: Array<{ category: string; count: number }>;
  streak_data: {
    current_daily: number;
    current_weekly: number;
    best_daily: number;
    best_weekly: number;
  };
}

interface UseMissionsReturn {
  missions: Mission[];
  dailyMissions: Mission[];
  weeklyMissions: Mission[];
  contextualMissions: Mission[];
  activeMissions: Mission[];
  loading: boolean;
  error: Error | null;
  completeMission: (missionId: string) => Promise<void>;
  updateProgress: (missionId: string, progress: number) => Promise<void>;
  generatePersonalizedMissions: () => Promise<Mission[]>;
  refreshMissions: () => Promise<void>;
  startMission: (missionId: string) => Promise<void>;
  isUpdating: boolean;
  // Funções auxiliares
  getDailyMissions: () => Mission[];
  getWeeklyMissions: () => Mission[];
  getAvailableMissions: () => Mission[];
  getCompletedMissions: () => Mission[];
  getContextualMissions: () => Mission[];
  calculateMissionProgress: (missionId: string) => number;
  isMissionCompleted: (missionId: string) => boolean;
  isMissionStarted: (missionId: string) => boolean;
  getMissionsByType: (type: string) => Mission[];
  getMissionsByEnvironment: (environment: Mission['environment']) => Mission[];
  // Estados do terminal (compatibilidade)
  terminalState: {
    isOpen: boolean;
    currentMission: Mission | null;
    code: string;
    output: string;
    isRunning: boolean;
    errors: string[];
    currentCheckpoint: number;
    chatbotActive: boolean;
  };
  openMissionTerminal: (missionId: string) => void;
  closeMissionTerminal: () => void;
}

export function useMissions(): UseMissionsReturn {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  // Função para buscar missões do usuário
  const fetchUserMissions = useCallback(async (): Promise<Mission[]> => {
    if (!user?.id) {
      return [];
    }

    try {
      // Buscar missões ativas com progresso do usuário
      let { data: missionsData, error } = await supabase
        .from('missions')
        .select(`
          *,
          mission_progress!left (
            user_id,
            status,
            progress,
            completed_at,
            current_step,
            total_steps,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      // Se tabela não existe, retornar missões padrão
      if (error && error.message.includes('does not exist')) {
        console.warn('Tabela missions não existe, gerando missões padrão');
        return generateDefaultMissions(user.id);
      }

      if (error) {
        console.error('Erro ao buscar missões:', error);
        return generateDefaultMissions(user.id);
      }

      // Mapear missões para o formato esperado
      return (missionsData || []).map(mission => {
        // Filtrar progresso apenas do usuário atual
        const progress = mission.mission_progress?.find(p => p.user_id === user.id);

        const environment = resolveEnvironment(mission.environment, mission.category);
        const deliveryMode = resolveDeliveryMode(environment, mission.delivery_mode || mission.metadata?.delivery_mode);
        const xpReward = typeof mission.xp_reward === 'number'
          ? mission.xp_reward
          : typeof mission.points_reward === 'number'
            ? mission.points_reward
            : typeof mission.points === 'number'
              ? mission.points
              : 10;
        const badgeReward = mission.badge_reward || mission.metadata?.badge_reward || mission.metadata?.badge || undefined;
        const livesRequired = typeof mission.lives_required === 'number'
          ? mission.lives_required
          : typeof mission.metadata?.lives_required === 'number'
            ? mission.metadata?.lives_required
            : environment === MISSION_ENVIRONMENTS.INCIDENT_RESPONSE
              ? 1
              : 0;
        const unlockRequirement = mission.unlock_requirement || mission.metadata?.unlock_requirement || undefined;
        const flagHint = mission.flag_hint || mission.metadata?.flag_hint || undefined;

        return {
          id: mission.id || '',
          user_id: user.id,
          title: mission.title || 'Missão',
          description: mission.description || 'Descrição da missão',
          type: ['daily', 'weekly', 'achievement', 'challenge'].includes(mission.type) 
            ? mission.type 
            : 'daily',
          category: mission.category || 'geral',
          difficulty: ['easy', 'medium', 'hard'].includes(mission.difficulty) 
            ? mission.difficulty 
            : 'easy',
          points: xpReward,
          target_value: typeof mission.target_value === 'number' ? mission.target_value : 1,
          current_progress: progress?.progress || 0,
          status: progress?.status || 'active',
          expires_at: mission.expires_at || undefined,
          completed_at: progress?.completed_at || undefined,
          requirements: Array.isArray(mission.requirements) ? mission.requirements : [],
          hints: Array.isArray(mission.hints) ? mission.hints : [],
          estimated_time: typeof mission.estimated_time === 'number' ? mission.estimated_time : 30,
          tags: Array.isArray(mission.tags) ? mission.tags : [],
          environment,
          delivery_mode: deliveryMode,
          xp_reward: xpReward,
          badge_reward: badgeReward,
          lives_required: livesRequired,
          unlock_requirement: unlockRequirement,
          flag_hint: flagHint,
          metadata: mission.metadata || {},
          created_at: mission.created_at || new Date().toISOString(),
          updated_at: progress?.updated_at || mission.updated_at || new Date().toISOString()
        };
      }).filter(mission => mission.id); // Filtrar missões inválidas
    } catch (error) {
      console.error('Erro ao buscar missões:', error);
      return generateDefaultMissions(user.id);
    }
  }, [user?.id]);

  // Função para buscar progresso do usuário (usando user_stats)
  const fetchUserProgress = useCallback(async (): Promise<UserProgress> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Buscar dados de user_stats que tem as colunas corretas
      let { data: stats, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Se não encontrou, criar progresso padrão
      if (error || !stats) {
        const defaultProgress: UserProgress = {
          user_id: user.id,
          total_points: 0,
          level: 1,
          experience: 0,
          experience_to_next_level: 100,
          daily_streak: 0,
          weekly_streak: 0,
          completed_missions: 0,
          active_missions: 0,
          achievements: [],
          badges: [],
          last_activity: new Date().toISOString()
        };

        // Tentar criar no banco user_stats
        try {
          const { data: createdStats } = await supabase
            .from('user_stats')
            .insert([{
              user_id: user.id,
              total_xp: 0,
              level: 1,
              streak_days: 0,
              total_study_time: 0,
              courses_completed: 0,
              lessons_completed: 0,
              achievements_count: 0
            }])
            .select()
            .single();

          return defaultProgress;
        } catch (createError) {
          console.warn('Erro ao criar stats, usando padrão:', createError);
          return defaultProgress;
        }
      }

      // Mapear dados de user_stats para UserProgress
      return {
        user_id: stats.user_id || user.id,
        total_points: stats.total_xp || 0,
        level: stats.level || 1,
        experience: stats.total_xp || 0,
        experience_to_next_level: ((stats.level || 1) * 100),
        daily_streak: stats.streak_days || 0,
        weekly_streak: Math.floor((stats.streak_days || 0) / 7),
        completed_missions: stats.lessons_completed || 0,
        active_missions: 0,
        achievements: [],
        badges: [],
        last_activity: stats.last_activity_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar progresso do usuário:', error);
      // Retornar progresso padrão em caso de erro
      return {
        user_id: user.id,
        total_points: 0,
        level: 1,
        experience: 0,
        experience_to_next_level: 100,
        daily_streak: 0,
        weekly_streak: 0,
        completed_missions: 0,
        active_missions: 0,
        achievements: [],
        badges: [],
        last_activity: new Date().toISOString()
      };
    }
  }, [user?.id]);

  // Cache para missões
  const {
    data: missions = [],
    isLoading: missionsLoading,
    error: missionsError,
    refresh: refreshMissionsFunction,
    setData: setCachedMissions
  } = useCachedUserData(
    user?.id || '',
    'missions',
    fetchUserMissions,
    {
      ttl: CACHE_TTL.MISSIONS,
      enabled: !!user?.id,
      staleWhileRevalidate: true,
      onError: (error) => {
        console.error('Erro no cache de missões:', error);
      }
    }
  );

  // Garantir que missões seja sempre um array
  const safeMissions: Mission[] = Array.isArray(missions) ? missions : [];

  // Cache para progresso
  const {
    data: userProgress,
    isLoading: progressLoading,
    error: progressError,
    setData: setCachedProgress
  } = useCachedUserData(
    user?.id || '',
    'progress',
    fetchUserProgress,
    {
      ttl: CACHE_TTL.USER_PROFILE,
      enabled: !!user?.id,
      staleWhileRevalidate: true
    }
  );

  // Combinar estados de loading e error
  const isLoading = missionsLoading || progressLoading;
  const error = missionsError || progressError;

  // Função para calcular estatísticas
  const refreshMissions = useCallback(async (): Promise<void> => {
    await fetchUserMissions();
  }, [fetchUserMissions]);

  const calculateStats = useCallback((): MissionStats => {
    if (!Array.isArray(safeMissions) || safeMissions.length === 0) {
      return {
        total_missions: 0,
        completed_missions: 0,
        active_missions: 0,
        completion_rate: 0,
        total_points_earned: 0,
        average_difficulty: 0,
        favorite_categories: [],
        streak_data: {
          current_daily: 0,
          current_weekly: 0,
          best_daily: 0,
          best_weekly: 0
        }
      };
    }

    const completed = safeMissions.filter(m => m && m.status === 'completed');
    const active = safeMissions.filter(m => m && m.status === 'active');
    
    const total_points_earned = completed.reduce((sum, m) => sum + (m?.points || 0), 0);
    const completion_rate = safeMissions.length > 0 ? (completed.length / safeMissions.length) * 100 : 0;

    // Calcular dificuldade média
    const difficultyValues = { easy: 1, medium: 2, hard: 3 };
    const avgDifficulty = safeMissions.reduce((sum, m) => 
      sum + (difficultyValues[m?.difficulty] || 1), 0) / safeMissions.length;

    // Calcular categorias favoritas
    const categoryMap = new Map<string, number>();
    safeMissions.forEach(m => {
      if (m && m.category) {
        categoryMap.set(m.category, (categoryMap.get(m.category) || 0) + 1);
      }
    });

    const favorite_categories = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total_missions: safeMissions.length,
      completed_missions: completed.length,
      active_missions: active.length,
      completion_rate: Math.round(completion_rate * 100) / 100,
      total_points_earned,
      average_difficulty: Math.round(avgDifficulty * 100) / 100,
      favorite_categories,
      streak_data: {
        current_daily: userProgress?.daily_streak || 0,
        current_weekly: userProgress?.weekly_streak || 0,
        best_daily: userProgress?.daily_streak || 0,
        best_weekly: userProgress?.weekly_streak || 0
      }
    };
  }, [safeMissions, userProgress]);

  // Cache para estatísticas
  const {
    data: stats
  } = useCache(
    `user:${user?.id}:mission-stats`,
    () => Promise.resolve(calculateStats()),
    {
      ttl: CACHE_TTL.ANALYTICS,
      enabled: !!user?.id && safeMissions.length > 0,
      staleWhileRevalidate: true
    }
  );

  // Função para completar missão
  const completeMission = useCallback(async (missionId: string) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    setIsUpdating(true);

    try {
      const mission = safeMissions.find(m => m.id === missionId);
      if (!mission) {
        throw new Error('Missão não encontrada');
      }

      // Atualizar missão
      const updatedMission = {
        ...mission,
        status: 'completed' as const,
        current_progress: mission.target_value,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Tentar atualizar progresso no banco
      try {
        // Verificar se já existe progresso para esta missão
        const { data: existingProgress } = await supabase
          .from('mission_progress')
          .select('id')
          .eq('user_id', user.id)
          .eq('mission_id', missionId)
          .single();

        if (existingProgress) {
          // Atualizar progresso existente
          await supabase
            .from('mission_progress')
            .update({
              status: 'completed',
              progress: mission.target_value,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProgress.id);
        } else {
          // Criar novo progresso
          await supabase
            .from('mission_progress')
            .insert({
              user_id: user.id,
              mission_id: missionId,
              status: 'completed',
              progress: mission.target_value,
              completed_at: new Date().toISOString()
            });
        }
      } catch (dbError) {
        console.warn('Erro ao atualizar progresso no banco:', dbError);
      }

      // Atualizar progresso do usuário
      if (userProgress) {
        const updatedProgress = {
          ...userProgress,
          total_points: userProgress.total_points + mission.points,
          experience: userProgress.experience + mission.points,
          completed_missions: userProgress.completed_missions + 1,
          last_activity: new Date().toISOString()
        };

        // Verificar se subiu de nível
        if (updatedProgress.experience >= updatedProgress.experience_to_next_level) {
          updatedProgress.level += 1;
          updatedProgress.experience = 0;
          updatedProgress.experience_to_next_level = updatedProgress.level * 100;
        }

        setCachedProgress(updatedProgress);

        // Tentar atualizar no banco user_stats
        try {
          await supabase
            .from('user_stats')
            .update({
              total_xp: updatedProgress.total_points,
              level: updatedProgress.level,
              lessons_completed: updatedProgress.completed_missions,
              last_activity_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
        } catch (dbError) {
          console.warn('Erro ao atualizar progresso no banco:', dbError);
        }
      }

      // Atualizar cache de missões
      const updatedMissions = safeMissions.map(m => 
        m.id === missionId ? updatedMission : m
      );
      setCachedMissions(updatedMissions);

    } catch (error) {
      console.error('Erro ao completar missão:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [user?.id, safeMissions, userProgress, setCachedMissions, setCachedProgress]);

  // Função para atualizar progresso
  const updateProgress = useCallback(async (missionId: string, progress: number) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    setIsUpdating(true);

    try {
      const mission = safeMissions.find(m => m.id === missionId);
      if (!mission) {
        throw new Error('Missão não encontrada');
      }

      const clampedProgress = Math.max(0, Math.min(progress, mission.target_value));
      const isCompleted = clampedProgress >= mission.target_value;

      const updatedMission = {
        ...mission,
        current_progress: clampedProgress,
        status: isCompleted ? 'completed' as const : mission.status,
        completed_at: isCompleted ? new Date().toISOString() : mission.completed_at,
        updated_at: new Date().toISOString()
      };

      // Tentar atualizar progresso no banco
      try {
        // Verificar se já existe progresso para esta missão
        const { data: existingProgress } = await supabase
          .from('mission_progress')
          .select('id')
          .eq('user_id', user.id)
          .eq('mission_id', missionId)
          .single();

        if (existingProgress) {
          // Atualizar progresso existente
          await supabase
            .from('mission_progress')
            .update({
              progress: clampedProgress,
              status: updatedMission.status,
              completed_at: updatedMission.completed_at,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProgress.id);
        } else {
          // Criar novo progresso
          await supabase
            .from('mission_progress')
            .insert({
              user_id: user.id,
              mission_id: missionId,
              progress: clampedProgress,
              status: updatedMission.status,
              completed_at: updatedMission.completed_at
            });
        }
      } catch (dbError) {
        console.warn('Erro ao atualizar progresso no banco:', dbError);
      }

      // Atualizar cache
      const updatedMissions = missions.map(m => 
        m.id === missionId ? updatedMission : m
      );
      setCachedMissions(updatedMissions);

      // Se completou a missão, atualizar pontos
      if (isCompleted && mission.status !== 'completed') {
        await completeMission(missionId);
      }

    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [user?.id, safeMissions, setCachedMissions, completeMission]);

  // Função para gerar missões personalizadas
  const generatePersonalizedMissions = useCallback(async (): Promise<Mission[]> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Gerar missões básicas se não conseguir personalizar
      const defaultMissions = generateDefaultMissions(user.id);
      
      // Tentar inserir no banco
      try {
        const { data: insertedMissions } = await supabase
          .from('missions')
          .insert(defaultMissions)
          .select();

        const finalMissions = insertedMissions || defaultMissions;
        setCachedMissions([...safeMissions, ...finalMissions]);
        
        return finalMissions;
      } catch (dbError) {
        console.warn('Erro ao inserir missões no banco:', dbError);
        setCachedMissions([...safeMissions, ...defaultMissions]);
        return defaultMissions;
      }
    } catch (error) {
      console.error('Erro ao gerar missões personalizadas:', error);
      throw error;
    }
  }, [user?.id, safeMissions, setCachedMissions]);

  // Funções auxiliares
  const getDailyMissions = useCallback(() => {
    return safeMissions.filter(m => m.type === 'daily');
  }, [safeMissions]);

  const getWeeklyMissions = useCallback(() => {
    return safeMissions.filter(m => m.type === 'weekly');
  }, [safeMissions]);

  const getAvailableMissions = useCallback(() => {
    return safeMissions.filter(m => m.status === 'active');
  }, [safeMissions]);

  const getCompletedMissions = useCallback(() => {
    return safeMissions.filter(m => m.status === 'completed');
  }, [safeMissions]);

  const getContextualMissions = useCallback(() => {
    return safeMissions.filter(m => m.type === 'achievement' || m.type === 'challenge');
  }, [safeMissions]);

  const calculateMissionProgress = useCallback((missionId: string) => {
    const mission = safeMissions.find(m => m.id === missionId);
    if (!mission) return 0;
    return Math.min((mission.current_progress / mission.target_value) * 100, 100);
  }, [safeMissions]);

  const isMissionCompleted = useCallback((missionId: string) => {
    const mission = safeMissions.find(m => m.id === missionId);
    return mission?.status === 'completed';
  }, [safeMissions]);

  const isMissionStarted = useCallback((missionId: string) => {
    const mission = safeMissions.find(m => m.id === missionId);
    return mission?.status === 'active' && mission.current_progress > 0;
  }, [safeMissions]);

  const getMissionsByType = useCallback((type: string) => {
    return safeMissions.filter(m => m.type === type);
  }, [safeMissions]);

  const getMissionsByEnvironment = useCallback((environment: MissionEnvironment) => {
    return safeMissions.filter(mission => mission.environment === environment);
  }, [safeMissions]);

  return {
    missions: safeMissions,
    dailyMissions: safeMissions.filter(m => m.type === 'daily'),
    weeklyMissions: safeMissions.filter(m => m.type === 'weekly'),
    contextualMissions: safeMissions.filter(m => m.type === 'achievement' || m.type === 'challenge'),
    activeMissions: safeMissions.filter(m => m.status === 'active'),
    loading: isLoading,
    error,
    completeMission,
    updateProgress,
    generatePersonalizedMissions,
    refreshMissions,
    startMission: async (missionId: string) => {
      // Implementar lógica de iniciar missão
      console.log('Starting mission:', missionId);
    },
    isUpdating,
    // Funções auxiliares
    getDailyMissions,
    getWeeklyMissions,
    getAvailableMissions,
    getCompletedMissions,
    getContextualMissions,
    calculateMissionProgress,
    isMissionCompleted,
    isMissionStarted,
    getMissionsByType,
    getMissionsByEnvironment,
    // Estados do terminal (compatibilidade)
    terminalState: {
      isOpen: false,
      currentMission: null,
      code: '',
      output: '',
      isRunning: false,
      errors: [],
      currentCheckpoint: 0,
      chatbotActive: false
    },
    openMissionTerminal: (missionId: string) => {
      console.log('Opening terminal for mission:', missionId);
    },
    closeMissionTerminal: () => {
      console.log('Closing mission terminal');
    }
  };
}

// Função para gerar missões padrão
function generateDefaultMissions(userId: string): Mission[] {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(23, 59, 59, 999);

  return [
    {
      id: `daily_${Date.now()}_1`,
      user_id: userId,
      title: 'Rotina SOC: Check matinal',
      description: 'Execute o checklist diário do SOC para manter a detecção ativa.',
      type: 'daily',
      category: 'operacoes-soc',
      difficulty: 'easy',
      points: 10,
      target_value: 1,
      current_progress: 0,
      status: 'active',
      expires_at: tomorrow.toISOString(),
      requirements: ['Acessar o painel de eventos críticos'],
      hints: ['Revise alertas não triados e confirme status dos sensores'],
      estimated_time: 20,
      tags: ['soc', 'rotina'],
      environment: MISSION_ENVIRONMENTS.INCIDENT_RESPONSE,
      delivery_mode: MISSION_DELIVERY_MODES.TERMINAL,
      xp_reward: 10,
      badge_reward: 'Guardião Matinal',
      lives_required: 0,
      unlock_requirement: undefined,
      flag_hint: 'Valide a integridade do agente EDR',
      metadata: {},
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: `weekly_${Date.now()}_1`,
      user_id: userId,
      title: 'Firewall Sentinel',
      description: 'Analise tráfego malicioso e ajuste regras para conter ataques de força bruta.',
      type: 'weekly',
      category: 'firewall',
      difficulty: 'medium',
      points: 80,
      target_value: 3,
      current_progress: 0,
      status: 'active',
      expires_at: nextWeek.toISOString(),
      requirements: ['Bloquear IPs suspeitos', 'Aplicar regra com tempo de expiração'],
      hints: ['Priorize portas expostas e monitore tentativas em sequência'],
      estimated_time: 45,
      tags: ['firewall', 'config'],
      environment: MISSION_ENVIRONMENTS.FIREWALL,
      delivery_mode: MISSION_DELIVERY_MODES.CONFIG_PANEL,
      xp_reward: 80,
      badge_reward: 'Firewall Sentinel',
      lives_required: 1,
      unlock_requirement: 'Badge Cloud Defender',
      flag_hint: 'Ajuste listas de bloqueio dinâmicas para encontrar o flag',
      metadata: {},
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: `incident_${Date.now()}_1`,
      user_id: userId,
      title: 'Resposta a Incidente: Ransomware',
      description: 'Isolar host comprometido e restaurar serviços críticos via terminal.',
      type: 'challenge',
      category: 'incident-response',
      difficulty: 'hard',
      points: 120,
      target_value: 4,
      current_progress: 0,
      status: 'active',
      expires_at: nextWeek.toISOString(),
      requirements: ['Identificar processo malicioso', 'Restaurar backup seguro'],
      hints: ['Use ferramentas forenses para listar arquivos criptografados'],
      estimated_time: 60,
      tags: ['terminal', 'shell', 'ransomware'],
      environment: MISSION_ENVIRONMENTS.INCIDENT_RESPONSE,
      delivery_mode: MISSION_DELIVERY_MODES.TERMINAL,
      xp_reward: 120,
      badge_reward: 'Incident Wrangler',
      lives_required: 2,
      unlock_requirement: 'Completar 3 missões SOC',
      flag_hint: 'Recupere o arquivo README_FOR_FLAG.txt após limpar o host',
      metadata: {},
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: `forensics_${Date.now()}_1`,
      user_id: userId,
      title: 'Forense Digital: Vazamento em Nuvem',
      description: 'Investigue logs para encontrar exfiltração e gerar relatório executivo.',
      type: 'achievement',
      category: 'forense',
      difficulty: 'medium',
      points: 90,
      target_value: 1,
      current_progress: 0,
      status: 'active',
      expires_at: nextWeek.toISOString(),
      requirements: ['Identificar bucket exposto', 'Documentar evidências no relatório'],
      hints: ['Cruze logs de API Gateway com eventos IAM'],
      estimated_time: 50,
      tags: ['forense', 'cloud', 'relatorio'],
      environment: MISSION_ENVIRONMENTS.FORENSICS,
      delivery_mode: MISSION_DELIVERY_MODES.HYBRID,
      xp_reward: 90,
      badge_reward: 'Cloud Investigator',
      lives_required: 1,
      unlock_requirement: 'Score > 70% em simulado de certificação cloud',
      flag_hint: 'Flag escondido em log de download suspeito',
      metadata: {},
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }
  ];
}

// Hook para missão específica
export function useMission(missionId: string) {
  const { missions, loading: isLoading, error, updateProgress, completeMission } = useMissions();
  
  const mission = missions.find(m => m.id === missionId);
  
  return {
    mission: mission || null,
    isLoading,
    error,
    updateProgress: (progress: number) => updateProgress(missionId, progress),
    complete: () => completeMission(missionId),
    exists: !!mission
  };
}