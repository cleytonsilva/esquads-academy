import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  Achievement, 
  UserBadge, 
  AchievementProgress, 
  AchievementStats,
  AchievementNotification 
} from '@/types/achievements';

export function useAchievements() {
  // ==================== ESTADOS ====================
  
  const { user } = useAuth();
  
  // Estados principais
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [showOnlyEarned, setShowOnlyEarned] = useState(false);
  
  // Estados de estatísticas
  const [stats, setStats] = useState<AchievementStats>({
    total: 0,
    earned: 0,
    progress: 0,
    points: 0,
    categories: {},
    rarities: {},
    recentEarned: []
  });

  // ==================== EFEITOS ====================
  
  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      loadAchievements();
      loadUserBadges();
      loadAchievementProgress();
    }
  }, [user]);

  // Recalcular estatísticas quando dados mudarem
  useEffect(() => {
    calculateStats();
  }, [achievements, userBadges, achievementProgress]);

  // ==================== FUNÇÕES DE CARREGAMENTO ====================
  
  // Carregar todos os achievements
  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('points', { ascending: false });

      if (error) throw error;

      setAchievements(data || []);
    } catch (err) {
      console.error('Error loading achievements:', err);
      setError('Erro ao carregar achievements');
      toast.error('Erro ao carregar achievements');
    } finally {
      setLoading(false);
    }
  };

  // Carregar badges do usuário
  const loadUserBadges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      setUserBadges(data || []);
    } catch (err) {
      console.error('Error loading user badges:', err);
      toast.error('Erro ao carregar badges do usuário');
    }
  };

  // Carregar progresso dos achievements
  const loadAchievementProgress = async () => {
    if (!user) return;

    try {
      // Buscar progresso atual do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('points, level')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Buscar estatísticas de missões
      const { data: missionStats, error: missionError } = await supabase
        .from('mission_attempts')
        .select('mission_id, status, completed_at')
        .eq('user_id', user.id);

      if (missionError) throw missionError;

      // Calcular progresso para cada achievement
      const progressData: AchievementProgress[] = achievements.map(achievement => {
        let currentValue = 0;
        let maxValue = 0;

        switch (achievement.type) {
          case 'missions_completed':
            currentValue = missionStats?.filter(m => m.status === 'completed').length || 0;
            maxValue = achievement.criteria.required_count;
            break;
          case 'points':
            currentValue = profile?.points || 0;
            maxValue = achievement.criteria.required_points;
            break;
          case 'level':
            currentValue = profile?.level || 1;
            maxValue = achievement.criteria.required_level;
            break;
          case 'streak':
            // TODO: Implementar cálculo de streak
            currentValue = 0;
            maxValue = achievement.criteria.required_days;
            break;
          case 'category':
            const categoryMissions = missionStats?.filter(m => 
              m.status === 'completed' && 
              // TODO: Adicionar filtro por categoria quando disponível
              true
            ).length || 0;
            currentValue = categoryMissions;
            maxValue = achievement.criteria.required_count;
            break;
        }

        const progress = Math.min((currentValue / maxValue) * 100, 100);
        const isCompleted = currentValue >= maxValue;

        return {
          achievement_id: achievement.id,
          user_id: user.id,
          current_value: currentValue,
          max_value: maxValue,
          progress: Math.round(progress),
          is_completed: isCompleted,
          updated_at: new Date().toISOString()
        };
      });

      setAchievementProgress(progressData);
    } catch (err) {
      console.error('Error loading achievement progress:', err);
      toast.error('Erro ao carregar progresso dos achievements');
    }
  };

  // ==================== FUNÇÕES DE CÁLCULO ====================
  
  // Calcular estatísticas
  const calculateStats = useCallback(() => {
    const total = achievements.length;
    const earned = userBadges.length;
    const progressPercentage = total > 0 ? Math.round((earned / total) * 100) : 0;
    const totalPoints = userBadges.reduce((sum, badge) => 
      sum + (badge.achievement?.points || 0), 0
    );

    // Estatísticas por categoria
    const categories = achievements.reduce((acc, achievement) => {
      const category = achievement.category;
      if (!acc[category]) {
        acc[category] = { total: 0, earned: 0 };
      }
      acc[category].total++;
      
      const isEarned = userBadges.some(badge => badge.achievement_id === achievement.id);
      if (isEarned) {
        acc[category].earned++;
      }
      
      return acc;
    }, {} as Record<string, { total: number; earned: number }>);

    // Estatísticas por raridade
    const rarities = achievements.reduce((acc, achievement) => {
      const rarity = achievement.rarity;
      if (!acc[rarity]) {
        acc[rarity] = { total: 0, earned: 0 };
      }
      acc[rarity].total++;
      
      const isEarned = userBadges.some(badge => badge.achievement_id === achievement.id);
      if (isEarned) {
        acc[rarity].earned++;
      }
      
      return acc;
    }, {} as Record<string, { total: number; earned: number }>);

    // Achievements recentes (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentEarned = userBadges
      .filter(badge => new Date(badge.earned_at) > sevenDaysAgo)
      .slice(0, 5);

    setStats({
      total,
      earned,
      progress: progressPercentage,
      points: totalPoints,
      categories,
      rarities,
      recentEarned
    });
  }, [achievements, userBadges]);

  // ==================== FUNÇÕES DE AÇÃO ====================
  
  // Conceder achievement
  const awardAchievement = async (achievementId: string, reason?: string) => {
    if (!user) return;

    try {
      // Verificar se já possui o achievement
      const existingBadge = userBadges.find(badge => badge.achievement_id === achievementId);
      if (existingBadge) {
        return existingBadge;
      }

      // Buscar dados do achievement
      const achievement = achievements.find(a => a.id === achievementId);
      if (!achievement) {
        throw new Error('Achievement não encontrado');
      }

      // Conceder o badge
      const { data, error } = await supabase
        .from('user_badges')
        .insert([{
          user_id: user.id,
          achievement_id: achievementId,
          earned_at: new Date().toISOString()
        }])
        .select(`
          *,
          achievement:achievements(*)
        `)
        .single();

      if (error) throw error;

      // Atualizar estado local
      setUserBadges(prev => [...prev, data]);

      // Notificar usuário
      toast.success(`🏆 Achievement desbloqueado: ${achievement.name}!`);

      // Criar notificação
      await createAchievementNotification({
        achievement_id: achievementId,
        achievement_name: achievement.name,
        points: achievement.points,
        reason: reason
      });

      return data;
    } catch (err) {
      console.error('Error awarding achievement:', err);
      toast.error('Erro ao conceder achievement');
      throw err;
    }
  };

  // Verificar achievements automáticos
  const checkAutoAchievements = async (context: {
    missionsCompleted?: number;
    totalPoints?: number;
    userLevel?: number;
    streakDays?: number;
    categoryProgress?: Record<string, number>;
  }) => {
    if (!user) return;

    try {
      const eligibleAchievements = achievements.filter(achievement => {
        // Verificar se já possui o achievement
        const alreadyEarned = userBadges.some(badge => badge.achievement_id === achievement.id);
        if (alreadyEarned) return false;

        // Verificar critérios
        const criteria = achievement.criteria;
        
        switch (achievement.type) {
          case 'missions_completed':
            return (context.missionsCompleted || 0) >= criteria.required_count;
          case 'points':
            return (context.totalPoints || 0) >= criteria.required_points;
          case 'level':
            return (context.userLevel || 1) >= criteria.required_level;
          case 'streak':
            return (context.streakDays || 0) >= criteria.required_days;
          case 'category':
            const categoryCount = context.categoryProgress?.[criteria.category] || 0;
            return categoryCount >= criteria.required_count;
          default:
            return false;
        }
      });

      // Conceder achievements elegíveis
      for (const achievement of eligibleAchievements) {
        await awardAchievement(achievement.id, 'Auto-achievement');
      }

      return eligibleAchievements;
    } catch (err) {
      console.error('Error checking auto achievements:', err);
    }
  };

  // Criar notificação de achievement
  const createAchievementNotification = async (data: AchievementNotification) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          type: 'achievement',
          title: 'Achievement Desbloqueado!',
          message: `Você conquistou: ${data.achievement_name}`,
          data: data,
          is_read: false
        }]);

      if (error) throw error;
    } catch (err) {
      console.error('Error creating achievement notification:', err);
    }
  };

  // ==================== FUNÇÕES DE FILTRO E BUSCA ====================
  
  // Filtrar achievements
  const getFilteredAchievements = useCallback(() => {
    let filtered = achievements;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(achievement =>
        achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(achievement => achievement.category === selectedCategory);
    }

    // Filtro por raridade
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(achievement => achievement.rarity === selectedRarity);
    }

    // Filtro por conquistados
    if (showOnlyEarned) {
      filtered = filtered.filter(achievement =>
        userBadges.some(badge => badge.achievement_id === achievement.id)
      );
    }

    return filtered;
  }, [achievements, searchTerm, selectedCategory, selectedRarity, showOnlyEarned, userBadges]);

  // ==================== FUNÇÕES DE CONSULTA ====================
  
  // Verificar se achievement foi conquistado
  const isAchievementEarned = useCallback((achievementId: string) => {
    return userBadges.some(badge => badge.achievement_id === achievementId);
  }, [userBadges]);

  // Obter progresso de um achievement
  const getAchievementProgress = useCallback((achievementId: string) => {
    return achievementProgress.find(progress => progress.achievement_id === achievementId);
  }, [achievementProgress]);

  // Obter achievements por categoria
  const getAchievementsByCategory = useCallback((category: string) => {
    return achievements.filter(achievement => achievement.category === category);
  }, [achievements]);

  // Obter achievements por raridade
  const getAchievementsByRarity = useCallback((rarity: string) => {
    return achievements.filter(achievement => achievement.rarity === rarity);
  }, [achievements]);

  // Obter próximos achievements (mais próximos de serem conquistados)
  const getUpcomingAchievements = useCallback(() => {
    return achievementProgress
      .filter(progress => !progress.is_completed && progress.progress > 0)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5)
      .map(progress => {
        const achievement = achievements.find(a => a.id === progress.achievement_id);
        return achievement ? { ...achievement, progress } : null;
      })
      .filter(Boolean);
  }, [achievementProgress, achievements]);

  // Obter categorias disponíveis
  const getAvailableCategories = useCallback(() => {
    const categories = [...new Set(achievements.map(a => a.category))];
    return categories.sort();
  }, [achievements]);

  // Obter raridades disponíveis
  const getAvailableRarities = useCallback(() => {
    const rarities = [...new Set(achievements.map(a => a.rarity))];
    return rarities.sort();
  }, [achievements]);

  // Obter achievements conquistados
  const getEarnedAchievements = useCallback(() => {
    return achievements.filter(achievement =>
      userBadges.some(badge => badge.achievement_id === achievement.id)
    );
  }, [achievements, userBadges]);

  // Obter achievements disponíveis (não conquistados)
  const getAvailableAchievements = useCallback(() => {
    return achievements.filter(achievement =>
      !userBadges.some(badge => badge.achievement_id === achievement.id)
    );
  }, [achievements, userBadges]);

  // Obter estatísticas do usuário
  const getUserAchievementStats = useCallback(() => {
    const totalCount = achievements.length;
    const earnedCount = userBadges.length;
    const totalPoints = userBadges.reduce((sum, badge) => 
      sum + (badge.achievement?.points || 0), 0
    );
    const completionRate = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;
    const averageProgress = achievementProgress.length > 0
      ? Math.round(achievementProgress.reduce((sum, p) => sum + p.progress, 0) / achievementProgress.length)
      : 0;

    return {
      totalCount,
      earnedCount,
      totalPoints,
      completionRate,
      averageProgress
    };
  }, [achievements, userBadges, achievementProgress]);

  // ==================== RETORNO DO HOOK ====================
  
  return {
    // ===== DADOS =====
    achievements: getFilteredAchievements(),
    allAchievements: achievements,
    userBadges,
    progress: achievementProgress,
    stats: getUserAchievementStats(),
    
    // ===== ESTADOS =====
    loading,
    error,
    
    // ===== FILTROS =====
    searchTerm,
    setSearchTerm,
    categoryFilter: selectedCategory,
    setCategoryFilter: setSelectedCategory,
    rarityFilter: selectedRarity,
    setRarityFilter: setSelectedRarity,
    earnedFilter: showOnlyEarned ? 'earned' : 'all',
    setEarnedFilter: (value: string) => setShowOnlyEarned(value === 'earned'),
    
    // ===== AÇÕES =====
    loadAchievements,
    loadUserBadges,
    loadAchievementProgress,
    awardAchievement,
    checkAutoAchievements,
    createAchievementNotification,
    
    // ===== CONSULTAS =====
    isAchievementEarned,
    getAchievementProgress: (achievementId: string) => {
      const progress = getAchievementProgress(achievementId);
      return progress ? progress.progress : 0;
    },
    getAchievementsByCategory,
    getAchievementsByRarity,
    getUpcomingAchievements,
    getAvailableCategories,
    getAvailableRarities,
    getFilteredAchievements,
    getEarnedAchievements,
    getAvailableAchievements,
    getUserAchievementStats,
    
    // ===== UTILITÁRIOS =====
    refreshData: () => {
      loadAchievements();
      loadUserBadges();
      loadAchievementProgress();
    }
  };
}