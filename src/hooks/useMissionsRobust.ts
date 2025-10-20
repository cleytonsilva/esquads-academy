/**
 * Hook robusto para sistema de missões e gamificação
 * Inclui cache inteligente, fallbacks e tratamento de erros
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCachedUserData, useCache } from '@/hooks/useCache';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TTL } from '@/services/cacheService';

export interface Mission {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement' | 'challenge' | 'coding' | 'terminal' | 'ctf';
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
  updateTerminalCode: (code: string) => void;
  runCodeInTerminal: (code: string) => Promise<any>;
  startChatbotSession: (missionId: string) => Promise<void>;
  sendChatMessage: (message: string) => Promise<string>;
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
          mission_attempts!left (
            user_id,
            status,
            score,
            xp_earned,
            started_at,
            completed_at,
            progress_data
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
        const progress = mission.mission_attempts?.find(p => p.user_id === user.id);
        
        return {
          id: mission.id || '',
          user_id: user.id,
          title: mission.title || 'Missão',
          description: mission.description || 'Descrição da missão',
          type: ['daily', 'weekly', 'achievement', 'challenge', 'coding', 'terminal', 'ctf'].includes(mission.type) 
            ? mission.type 
            : 'daily',
          category: mission.category || 'geral',
          difficulty: ['easy', 'medium', 'hard'].includes(mission.difficulty) 
            ? mission.difficulty 
            : 'easy',
          points: typeof mission.points_reward === 'number' ? mission.points_reward : 
                  typeof mission.points === 'number' ? mission.points : 10,
          target_value: typeof mission.target_value === 'number' ? mission.target_value : 1,
          current_progress: progress?.progress || 0,
          status: progress?.status || 'active',
          expires_at: mission.expires_at || undefined,
          completed_at: progress?.completed_at || undefined,
          requirements: Array.isArray(mission.requirements) ? mission.requirements : [],
          hints: Array.isArray(mission.hints) ? mission.hints : [],
          estimated_time: typeof mission.estimated_time === 'number' ? mission.estimated_time : 30,
          tags: Array.isArray(mission.tags) ? mission.tags : [],
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
          .from('mission_attempts')
          .select('id')
          .eq('user_id', user.id)
          .eq('mission_id', missionId)
          .single();

        if (existingProgress) {
          // Atualizar progresso existente
          await supabase
            .from('mission_attempts')
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
            .from('mission_attempts')
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
          .from('mission_attempts')
          .select('id')
          .eq('user_id', user.id)
          .eq('mission_id', missionId)
          .single();

        if (existingProgress) {
          // Atualizar progresso existente
          await supabase
            .from('mission_attempts')
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
            .from('mission_attempts')
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

  // Estados e handlers do terminal (antes do return)
  const [terminalState, setTerminalState] = useState({
    isOpen: false,
    currentMission: null as Mission | null,
    code: '',
    output: '',
    isRunning: false,
    errors: [] as string[],
    currentCheckpoint: 0,
    chatbotActive: false
  });

  const openMissionTerminal = (missionId: string) => {
    const mission = safeMissions.find(m => m.id === missionId) || null;
    setTerminalState(prev => ({
      ...prev,
      isOpen: true,
      currentMission: mission,
      output: '',
      errors: []
    }));
    console.log('[terminal] aberto para missão', missionId);
  };

  const closeMissionTerminal = () => {
    setTerminalState(prev => ({ ...prev, isOpen: false }));
    console.log('[terminal] fechado');
  };

  const updateTerminalCode = (code: string) => {
    setTerminalState(prev => ({ ...prev, code }));
  };

  const runCodeInTerminal = async (code: string) => {
    setTerminalState(prev => ({ ...prev, isRunning: true, code }));
    try {
      // Simulação de execução
      await new Promise(res => setTimeout(res, 300));
      const result = {
        success: true,
        output: 'Execução simulada concluída.',
        validation: { message: 'Validação ok', passed: true }
      };
      setTerminalState(prev => ({ ...prev, isRunning: false, output: result.output }));
      return result;
    } catch (e) {
      setTerminalState(prev => ({ ...prev, isRunning: false, errors: [...prev.errors, String(e)] }));
      return { success: false, error: 'Falha na execução' };
    }
  };

  const startChatbotSession = async (missionId: string) => {
    const mission = safeMissions.find(m => m.id === missionId) || null;
    setTerminalState(prev => ({ ...prev, chatbotActive: true, isOpen: true, currentMission: mission }));
    console.log('[chatbot] sessão iniciada para missão', missionId);
    
    // Inicializar sessão do chatbot com contexto da missão
    try {
      const { chatbotService } = await import('@/services/chatbotService');
      const context = mission ? {
        missionId: mission.id,
        missionTitle: mission.title,
        difficulty: mission.difficulty,
        category: mission.category,
        objectives: mission.metadata?.objectives || []
      } : {};
      
      chatbotService.startMissionSession(context);
    } catch (error) {
      console.error('[chatbot] erro ao inicializar sessão:', error);
    }
  };

  const sendChatMessage = async (message: string) => {
    console.log('[chatbot] usuário:', message);
    
    try {
      // Importar o serviço de chatbot dinamicamente
      const { chatbotService } = await import('@/services/chatbotService');
      
      const currentMission = terminalState.currentMission;
      const context = currentMission ? {
        missionId: currentMission.id,
        missionTitle: currentMission.title,
        currentStep: terminalState.currentCheckpoint,
        totalSteps: currentMission.metadata?.steps?.length || 5,
        userCode: terminalState.code,
        difficulty: currentMission.difficulty,
        category: currentMission.category,
        objectives: currentMission.metadata?.objectives || []
      } : {};
      
      const response = await chatbotService.generateResponse(message, context);
      console.log('[chatbot] resposta IA:', response.message);
      
      return response.message;
    } catch (error) {
      console.error('[chatbot] erro:', error);
      // Fallback para resposta simples
      return 'Desculpe, estou com dificuldades técnicas. Tente novamente em alguns instantes.';
    }
  };

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
      if (!user?.id) throw new Error('Usuário não autenticado');
      setIsUpdating(true);
      try {
        const mission = safeMissions.find(m => m.id === missionId);
        if (!mission) throw new Error('Missão não encontrada');
        const nowIso = new Date().toISOString();

        // Garantir registro em mission_attempts
        try {
          const { data: existing } = await supabase
            .from('mission_attempts')
            .select('id')
            .eq('user_id', user.id)
            .eq('mission_id', missionId)
            .single();

          if (existing?.id) {
            await supabase
              .from('mission_attempts')
              .update({ 
                status: 'in_progress', 
                progress_data: { current_step: 0, objectives_completed: [], hints_used: 0, commands_executed: [], last_checkpoint: null, time_spent: 0 },
                started_at: nowIso
              })
              .eq('id', existing.id);
          } else {
            await supabase
              .from('mission_attempts')
              .insert([{ 
                user_id: user.id, 
                mission_id: missionId, 
                status: 'in_progress', 
                progress_data: { current_step: 0, objectives_completed: [], hints_used: 0, commands_executed: [], last_checkpoint: null, time_spent: 0 },
                started_at: nowIso
              }]);
          }
        } catch (progressErr) {
          console.error('[startMission] mission_attempts erro', progressErr);
        }

        // Atualiza cache local (status UI)
        const updatedMissions = safeMissions.map(m =>
          m.id === missionId ? { ...m, status: 'active', current_progress: m.current_progress || 0, updated_at: nowIso } : m
        );
        setCachedMissions(updatedMissions);
      } finally {
        setIsUpdating(false);
      }
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

    // Estados do terminal e handlers
    terminalState,
    openMissionTerminal,
    closeMissionTerminal,
    updateTerminalCode,
    runCodeInTerminal,
    startChatbotSession,
    sendChatMessage
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
      title: 'Primeira Lição do Dia',
      description: 'Complete uma lição hoje para manter seu progresso',
      type: 'daily',
      category: 'estudo',
      difficulty: 'easy',
      points: 10,
      target_value: 1,
      current_progress: 0,
      status: 'active',
      expires_at: tomorrow.toISOString(),
      requirements: [],
      hints: ['Escolha um curso e comece uma lição'],
      estimated_time: 30,
      tags: ['iniciante', 'diário'],
      metadata: {},
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: `weekly_${Date.now()}_1`,
      user_id: userId,
      title: 'Explorador Semanal',
      description: 'Complete 5 lições esta semana',
      type: 'weekly',
      category: 'progresso',
      difficulty: 'medium',
      points: 50,
      target_value: 5,
      current_progress: 0,
      status: 'active',
      expires_at: nextWeek.toISOString(),
      requirements: [],
      hints: ['Mantenha uma rotina de estudos consistente'],
      estimated_time: 150,
      tags: ['semanal', 'progresso'],
      metadata: {},
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: `coding_${Date.now()}_intro`,
      user_id: userId,
      title: 'Introdução ao Terminal: Hello World',
      description: 'Escreva um programa simples e execute no terminal embutido.',
      type: 'coding',
      category: 'programming',
      difficulty: 'easy',
      points: 20,
      target_value: 1,
      current_progress: 0,
      status: 'active',
      requirements: [],
      hints: ['Use console.log ou print conforme linguagem do template'],
      estimated_time: 20,
      tags: ['coding', 'terminal', 'intro'],
      metadata: {
        steps: [
          { title: 'Entender objetivo', description: 'Leia o enunciado e veja o template.' },
          { title: 'Editar código', description: 'Altere o código para imprimir sua mensagem.' },
          { title: 'Executar', description: 'Clique em Executar e valide a saída.' }
        ],
        template_code: "// Template JavaScript\nfunction main() {\n  console.log('Hello, Esquads!');\n}\nmain();"
      },
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