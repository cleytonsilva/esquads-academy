import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  RecommendationService, 
  CourseRecommendation, 
  UserProfile, 
  RecommendationFilters,
  LearningPath,
  TrendingData
} from '@/services/recommendationService';

export const useRecommendations = () => {
  const { user } = useAuth();
  
  // Estados
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<CourseRecommendation[]>([]);
  const [popularCourses, setPopularCourses] = useState<CourseRecommendation[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [trendingCourses, setTrendingCourses] = useState<TrendingData[]>([]);
  const [similarCourses, setSimilarCourses] = useState<CourseRecommendation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecommendationFilters>({});

  // Carregar perfil do usuário
  const loadUserProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const profile = await RecommendationService.getUserProfile(user.id);
      setUserProfile(profile);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError('Erro ao carregar perfil do usuário');
    }
  }, [user?.id]);

  // Atualizar perfil do usuário
  const updateUserProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!user?.id) return false;

    try {
      setLoading(true);
      const success = await RecommendationService.updateUserProfile(user.id, profileData);
      
      if (success) {
        setUserProfile(prev => prev ? { ...prev, ...profileData } : null);
        // Recarregar recomendações após atualizar perfil
        await loadPersonalizedRecommendations();
      }
      
      return success;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Erro ao atualizar perfil');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Carregar recomendações personalizadas
  const loadPersonalizedRecommendations = useCallback(async (
    customFilters?: RecommendationFilters,
    limit: number = 10
  ) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const appliedFilters = { ...filters, ...customFilters };
      const recommendations = await RecommendationService.getPersonalizedRecommendations(
        user.id,
        appliedFilters,
        limit
      );
      
      setPersonalizedRecommendations(recommendations);
    } catch (err) {
      console.error('Erro ao carregar recomendações:', err);
      setError('Erro ao carregar recomendações personalizadas');
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters]);

  // Carregar cursos populares
  const loadPopularCourses = useCallback(async (limit: number = 10) => {
    try {
      setLoading(true);
      const courses = await RecommendationService.getPopularCourses(limit);
      setPopularCourses(courses);
    } catch (err) {
      console.error('Erro ao carregar cursos populares:', err);
      setError('Erro ao carregar cursos populares');
    } finally {
      setLoading(false);
    }
  }, []);

  // Gerar trilhas de aprendizado
  const generateLearningPaths = useCallback(async (
    targetSkill: string,
    limit: number = 3
  ) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const paths = await RecommendationService.generateLearningPaths(
        user.id,
        targetSkill,
        limit
      );
      setLearningPaths(paths);
    } catch (err) {
      console.error('Erro ao gerar trilhas:', err);
      setError('Erro ao gerar trilhas de aprendizado');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Carregar cursos em tendência
  const loadTrendingCourses = useCallback(async (limit: number = 5) => {
    try {
      setLoading(true);
      const trending = await RecommendationService.getTrendingCourses(limit);
      setTrendingCourses(trending);
    } catch (err) {
      console.error('Erro ao carregar tendências:', err);
      setError('Erro ao carregar cursos em tendência');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar cursos similares
  const loadSimilarCourses = useCallback(async (
    courseId: string,
    limit: number = 5
  ) => {
    try {
      setLoading(true);
      const similar = await RecommendationService.getSimilarCourses(courseId, limit);
      setSimilarCourses(similar);
    } catch (err) {
      console.error('Erro ao carregar cursos similares:', err);
      setError('Erro ao carregar cursos similares');
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: RecommendationFilters) => {
    setFilters(newFilters);
    if (user?.id) {
      loadPersonalizedRecommendations(newFilters);
    }
  }, [user?.id, loadPersonalizedRecommendations]);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
    if (user?.id) {
      loadPersonalizedRecommendations({});
    }
  }, [user?.id, loadPersonalizedRecommendations]);

  // Buscar recomendações por categoria
  const getRecommendationsByCategory = useCallback(async (
    category: string,
    limit: number = 5
  ) => {
    if (!user?.id) return [];

    try {
      const categoryFilters: RecommendationFilters = {
        categories: [category],
        exclude_completed: true
      };
      
      const recommendations = await RecommendationService.getPersonalizedRecommendations(
        user.id,
        categoryFilters,
        limit
      );
      
      return recommendations;
    } catch (err) {
      console.error('Erro ao buscar por categoria:', err);
      return [];
    }
  }, [user?.id]);

  // Buscar recomendações por skill
  const getRecommendationsBySkill = useCallback(async (
    skill: string,
    limit: number = 5
  ) => {
    if (!user?.id) return [];

    try {
      const skillFilters: RecommendationFilters = {
        skills: [skill],
        exclude_completed: true
      };
      
      const recommendations = await RecommendationService.getPersonalizedRecommendations(
        user.id,
        skillFilters,
        limit
      );
      
      return recommendations;
    } catch (err) {
      console.error('Erro ao buscar por skill:', err);
      return [];
    }
  }, [user?.id]);

  // Obter recomendações para iniciantes
  const getBeginnerRecommendations = useCallback(async (limit: number = 5) => {
    if (!user?.id) return [];

    try {
      const beginnerFilters: RecommendationFilters = {
        difficulty_levels: ['beginner'],
        max_duration: 10,
        exclude_completed: true
      };
      
      const recommendations = await RecommendationService.getPersonalizedRecommendations(
        user.id,
        beginnerFilters,
        limit
      );
      
      return recommendations;
    } catch (err) {
      console.error('Erro ao buscar recomendações para iniciantes:', err);
      return [];
    }
  }, [user?.id]);

  // Obter recomendações rápidas (cursos curtos)
  const getQuickRecommendations = useCallback(async (limit: number = 5) => {
    if (!user?.id) return [];

    try {
      const quickFilters: RecommendationFilters = {
        max_duration: 5,
        exclude_completed: true
      };
      
      const recommendations = await RecommendationService.getPersonalizedRecommendations(
        user.id,
        quickFilters,
        limit
      );
      
      return recommendations;
    } catch (err) {
      console.error('Erro ao buscar recomendações rápidas:', err);
      return [];
    }
  }, [user?.id]);

  // Refresh geral
  const refresh = useCallback(async () => {
    if (!user?.id) return;

    await Promise.all([
      loadUserProfile(),
      loadPersonalizedRecommendations(),
      loadPopularCourses(),
      loadTrendingCourses()
    ]);
  }, [
    user?.id,
    loadUserProfile,
    loadPersonalizedRecommendations,
    loadPopularCourses,
    loadTrendingCourses
  ]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Efeitos
  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
      loadPersonalizedRecommendations();
      loadPopularCourses();
      loadTrendingCourses();
    }
  }, [user?.id]);

  // Funções de utilidade
  const getRecommendationsByScore = useCallback((
    recommendations: CourseRecommendation[],
    minScore: number = 0.7
  ) => {
    return recommendations.filter(rec => rec.recommendation_score >= minScore);
  }, []);

  const getRecommendationsByPrice = useCallback((
    recommendations: CourseRecommendation[],
    maxPrice: number
  ) => {
    return recommendations.filter(rec => rec.price <= maxPrice);
  }, []);

  const getRecommendationsByDuration = useCallback((
    recommendations: CourseRecommendation[],
    maxDuration: number
  ) => {
    return recommendations.filter(rec => rec.duration_hours <= maxDuration);
  }, []);

  // Estatísticas
  const getRecommendationStats = useCallback(() => {
    const safePersonalized = Array.isArray(personalizedRecommendations) ? personalizedRecommendations : [];
    const totalRecommendations = safePersonalized.length;
    const highScoreRecommendations = safePersonalized.filter(r => r.recommendation_score >= 0.8).length;
    const averageScore = safePersonalized.reduce((sum, r) => sum + r.recommendation_score, 0) / (totalRecommendations || 1);
    const averageMatchPercentage = safePersonalized.reduce((sum, r) => sum + r.match_percentage, 0) / (totalRecommendations || 1);

    const categoriesCount = safePersonalized.reduce((acc, rec) => {
      acc[rec.category] = (acc[rec.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoriesCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    return {
      totalRecommendations,
      highScoreRecommendations,
      averageScore,
      averageMatchPercentage,
      topCategories
    };
  }, [personalizedRecommendations]);

  return {
    // Estados
    personalizedRecommendations: Array.isArray(personalizedRecommendations) ? personalizedRecommendations : [],
    popularCourses,
    learningPaths,
    trendingCourses,
    similarCourses,
    userProfile,
    loading,
    error,
    filters,

    // Ações principais
    loadPersonalizedRecommendations,
    loadPopularCourses,
    generateLearningPaths,
    loadTrendingCourses,
    loadSimilarCourses,
    updateUserProfile,

    // Filtros
    applyFilters,
    clearFilters,

    // Buscas específicas
    getRecommendationsByCategory,
    getRecommendationsBySkill,
    getBeginnerRecommendations,
    getQuickRecommendations,

    // Utilitários
    getRecommendationsByScore,
    getRecommendationsByPrice,
    getRecommendationsByDuration,
    getRecommendationStats,

    // Controle
    refresh,
    clearError
  };
};
