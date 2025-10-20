import { supabase } from '@/integrations/supabase/client';
import { cache, CACHE_KEYS, cacheWithFallback } from '@/utils/cache';
import { normalizeUserProfileData, safeArray, safeJoin } from '@/utils/vibeCheck';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  learning_goals?: string[];
  preferred_categories?: string[];
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  timezone?: string;
  language?: string;
  notification_preferences?: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  // Campos adicionais para recomendações
  current_skills?: string[];
  desired_skills?: string[];
  experience_level?: string;
  available_time_hours?: number;
  budget_range?: number;
  preferred_difficulty?: string;
  career_stage?: string;
  industry_experience_years?: number;
  certification_goals?: boolean;
  project_based_learning?: boolean;
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  created_at: string;
  updated_at: string;
  // Campos legados para compatibilidade
  interests?: string[];
  preferred_duration?: 'short' | 'medium' | 'long';
  completed_courses?: string[];
  current_courses?: string[];
  favorite_categories?: string[];
  time_availability?: 'low' | 'medium' | 'high';
}

export interface CourseRecommendation {
  course_id: string;
  title: string;
  description: string;
  created_by: string;
  category: string;
  difficulty_level: string;
  duration_hours: number;
  rating: number;
  student_count: number;
  price: number;
  thumbnail_url?: string;
  skills: string[];
  recommendation_score: number;
  recommendation_reasons: string[];
  match_percentage: number;
  estimated_completion_time: string;
}

export interface RecommendationFilters {
  categories?: string[];
  difficulty_levels?: string[];
  max_duration?: number;
  max_price?: number;
  min_rating?: number;
  skills?: string[];
  exclude_completed?: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: CourseRecommendation[];
  total_duration: number;
  difficulty_progression: string[];
  estimated_completion: string;
  skills_acquired: string[];
  path_score: number;
}

export interface TrendingData {
  course_id: string;
  title: string;
  category: string;
  enrollment_growth: number;
  completion_rate: number;
  trending_score: number;
}

export class RecommendationService {
  // Obter perfil do usuário com cache e fallbacks robustos
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    return cacheWithFallback(
      `${CACHE_KEYS.USER_PROFILE}_${userId}`,
      async () => {
        try {
          // Primeiro tentar user_profiles
          let profile = await this.tryGetUserProfileFromTable(userId);
          
          // Se não encontrou, tentar users table
          if (!profile) {
            profile = await this.tryGetUserProfileFromUsersTable(userId);
          }
          
          // Se ainda não encontrou, criar perfil padrão
          if (!profile) {
            profile = this.createDefaultUserProfile(userId);
            // Tentar salvar o perfil padrão
            await this.saveDefaultProfile(userId, profile);
          }

          return profile;
        } catch (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
          // Retornar perfil padrão em caso de erro
          return this.createDefaultUserProfile(userId);
        }
      },
      2 * 60 * 1000 // Cache por 2 minutos
    );
  }

  // Tentar buscar perfil na tabela user_profiles
  private static async tryGetUserProfileFromTable(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Não encontrado
        throw error;
      }
      // Normalizar dados para evitar null em arrays e strings
      return normalizeUserProfileData(data);
    } catch (error: any) {
      if (error.message?.includes('relation "user_profiles" does not exist')) {
        console.log('Tabela user_profiles não existe, tentando users');
        return null;
      }
      throw error;
    }
  }

  // Tentar buscar perfil na tabela user_profiles (fallback)
  private static async tryGetUserProfileFromUsersTable(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Não encontrado
        throw error;
      }
      
      // Normalizar dados de users também
      return normalizeUserProfileData(data);
    } catch (error) {
      console.error('Erro ao buscar perfil na tabela users:', error);
      return null;
    }
  }

  // Criar perfil padrão para usuário
  private static createDefaultUserProfile(userId: string): UserProfile {
    return {
      id: userId,
      email: '',
      full_name: '',
      avatar_url: undefined,
      bio: undefined,
      learning_goals: [],
      preferred_categories: [],
      skill_level: 'beginner',
      timezone: undefined,
      language: undefined,
      notification_preferences: undefined,
      current_skills: [],
      desired_skills: [],
      experience_level: undefined,
      available_time_hours: undefined,
      budget_range: undefined,
      preferred_difficulty: undefined,
      career_stage: undefined,
      industry_experience_years: undefined,
      certification_goals: undefined,
      project_based_learning: undefined,
      learning_style: 'visual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Campos legados para compatibilidade
      interests: [],
      preferred_duration: 'medium',
      completed_courses: [],
      current_courses: [],
      favorite_categories: [],
      time_availability: 'medium'
    };
  }

  // Salvar perfil padrão no banco
  private static async saveDefaultProfile(userId: string, profile: UserProfile): Promise<void> {
    try {
      // Tentar salvar na tabela user_profiles primeiro
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({ user_id: userId, ...profile });
      
      if (profileError && !profileError.message?.includes('relation "user_profiles" does not exist')) {
        console.error('Erro ao salvar perfil padrão:', profileError);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil padrão:', error);
    }
  }

  // Atualizar perfil do usuário com tratamento robusto
  static async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<boolean> {
    try {
      // Limpar cache antes de atualizar
      cache.delete(`${CACHE_KEYS.USER_PROFILE}_${userId}`);
      
      // Primeiro tentar user_profiles
      const profileUpdated = await this.tryUpdateUserProfileTable(userId, profile);
      
      // Se não conseguiu atualizar user_profiles, tentar users
      if (!profileUpdated) {
        const usersUpdated = await this.tryUpdateUsersTable(userId, profile);
        if (!usersUpdated) {
          console.error('Não foi possível atualizar perfil em nenhuma tabela');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  }

  // Tentar atualizar na tabela user_profiles
  private static async tryUpdateUserProfileTable(userId: string, profile: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ 
          user_id: userId, 
          ...profile,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        if (error.message?.includes('relation "user_profiles" does not exist')) {
          console.log('Tabela user_profiles não existe');
          return false;
        }
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar user_profiles:', error);
      return false;
    }
  }

  // Tentar atualizar na tabela users (fallback)
  private static async tryUpdateUsersTable(userId: string, profile: Partial<UserProfile>): Promise<boolean> {
    try {
      // Remover campos específicos de user_profiles que não existem em user_profiles
      const { ...userFields } = profile;
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...userFields,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar users:', error);
      return false;
    }
  }

  // Gerar recomendações personalizadas com fallbacks robustos
  static async getPersonalizedRecommendations(
    userId: string,
    filters?: RecommendationFilters,
    limit: number = 10
  ): Promise<CourseRecommendation[]> {
    try {
      const profile = await this.getUserProfile(userId);
      
      // Se não conseguiu obter perfil, usar cursos populares como fallback
      if (!profile) {
        console.log('Perfil não encontrado, usando cursos populares como fallback');
        return await this.getPopularCourses(limit);
      }

      // Buscar cursos disponíveis
      let query = supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          created_by,
          difficulty,
          duration_hours,
          cover_image_url
        `)
        .eq('is_published', true);

      // Aplicar filtros
      if (filters?.categories?.length) {
        query = query.in('category', filters.categories);
      }
      if (filters?.difficulty_levels?.length) {
        query = query.in('difficulty_level', filters.difficulty_levels);
      }
      if (filters?.max_duration) {
        query = query.lte('duration_hours', filters.max_duration);
      }
      if (filters?.max_price) {
        query = query.lte('price', filters.max_price);
      }
      if (filters?.min_rating) {
        query = query.gte('rating', filters.min_rating);
      }

      // Excluir cursos já completados
      const completedIds = safeArray(profile.completed_courses);
      if (filters?.exclude_completed !== false && completedIds.length > 0) {
        const list = safeJoin(completedIds.map((id) => String(id)));
        if (list) {
          query = query.not('id', 'in', `(${list})`);
        }
      }

      const { data: courses, error } = await query;
      if (error) throw error;

      // Calcular scores de recomendação
      const recommendations = courses.map(course => {
        const score = this.calculateRecommendationScore(course, profile);
        const reasons = this.generateRecommendationReasons(course, profile);
        const matchPercentage = Math.round(score * 100);
        const estimatedTime = this.estimateCompletionTime(course.duration_hours, profile.time_availability);

        return {
          course_id: course.id,
          title: course.title,
          description: course.description,
          created_by: course.created_by,
          category: 'General', // Default category
          difficulty_level: course.difficulty,
          duration_hours: course.duration_hours,
          rating: 4.5, // Default rating
          student_count: 0, // Default count
          price: 0, // Free by default
          thumbnail_url: course.cover_image_url,
          skills: [], // Default skills
          recommendation_score: score,
          recommendation_reasons: reasons,
          match_percentage: matchPercentage,
          estimated_completion_time: estimatedTime
        };
      });

      // Ordenar por score e retornar top N
      return recommendations
        .sort((a, b) => b.recommendation_score - a.recommendation_score)
        .slice(0, limit);

    } catch (error) {
      console.error('Erro ao gerar recomendações personalizadas:', error);
      
      // Fallback para cursos populares em caso de erro
      try {
        console.log('Tentando fallback para cursos populares');
        return await this.getPopularCourses(limit);
      } catch (fallbackError) {
        console.error('Erro no fallback para cursos populares:', fallbackError);
        return [];
      }
    }
  }

  // Calcular score de recomendação
  private static calculateRecommendationScore(course: any, profile: UserProfile): number {
    let score = 0;

    // Score base pela popularidade
    score += Math.min(course.rating / 5, 1) * 0.2;
    score += Math.min(Math.log10(course.student_count + 1) / 4, 1) * 0.1;

    // Score por interesses
    const categoryMatch = profile.interests.includes(course.category) ? 0.3 : 0;
    score += categoryMatch;

    // Score por categorias favoritas
    const favCategoryMatch = profile.favorite_categories.includes(course.category) ? 0.2 : 0;
    score += favCategoryMatch;

    // Score por nível de habilidade
    const skillLevelMatch = this.getSkillLevelMatch(course.difficulty_level, profile.skill_level);
    score += skillLevelMatch * 0.25;

    // Score por duração preferida
    const durationMatch = this.getDurationMatch(course.duration_hours, profile.preferred_duration);
    score += durationMatch * 0.15;

    // Score por skills
    const skillsMatch = this.getSkillsMatch(course.skills || [], profile.learning_goals);
    score += skillsMatch * 0.2;

    // Penalizar se muito caro (assumindo orçamento limitado)
    if (course.price > 200) {
      score *= 0.8;
    }

    // Bonus para cursos altamente avaliados
    if (course.rating >= 4.5) {
      score *= 1.1;
    }

    return Math.min(score, 1);
  }

  // Gerar razões da recomendação
  private static generateRecommendationReasons(course: any, profile: UserProfile): string[] {
    const reasons: string[] = [];

    if (profile.interests.includes(course.category)) {
      reasons.push(`Corresponde ao seu interesse em ${course.category}`);
    }

    if (profile.favorite_categories.includes(course.category)) {
      reasons.push('Categoria favorita');
    }

    if (course.rating >= 4.5) {
      reasons.push('Curso altamente avaliado');
    }

    if (course.student_count > 1000) {
      reasons.push('Popular entre estudantes');
    }

    const skillLevelMatch = this.getSkillLevelMatch(course.difficulty_level, profile.skill_level);
    if (skillLevelMatch > 0.8) {
      reasons.push('Nível adequado para você');
    }

    const durationMatch = this.getDurationMatch(course.duration_hours, profile.preferred_duration);
    if (durationMatch > 0.8) {
      reasons.push('Duração ideal para seu perfil');
    }

    if (course.skills) {
      const matchingSkills = course.skills.filter((skill: string) => 
        profile.learning_goals.some(goal => 
          goal.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (matchingSkills.length > 0) {
        reasons.push(`Desenvolve habilidades em ${matchingSkills.slice(0, 2).join(', ')}`);
      }
    }

    return reasons.slice(0, 3); // Máximo 3 razões
  }

  // Auxiliares para cálculo de score
  private static getSkillLevelMatch(courseDifficulty: string, userLevel: string): number {
    const difficultyMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    const userLevelNum = difficultyMap[userLevel as keyof typeof difficultyMap] || 1;
    const courseLevelNum = difficultyMap[courseDifficulty as keyof typeof difficultyMap] || 1;

    const diff = Math.abs(userLevelNum - courseLevelNum);
    if (diff === 0) return 1;
    if (diff === 1) return 0.7;
    return 0.3;
  }

  private static getDurationMatch(courseDuration: number, preferredDuration: string): number {
    switch (preferredDuration) {
      case 'short':
        return courseDuration <= 5 ? 1 : courseDuration <= 10 ? 0.6 : 0.2;
      case 'medium':
        return courseDuration >= 5 && courseDuration <= 20 ? 1 : 0.5;
      case 'long':
        return courseDuration >= 15 ? 1 : courseDuration >= 10 ? 0.7 : 0.3;
      default:
        return 0.5;
    }
  }

  private static getSkillsMatch(courseSkills: string[], learningGoals: string[]): number {
    if (!courseSkills.length || !learningGoals.length) return 0;

    const matches = courseSkills.filter(skill =>
      learningGoals.some(goal =>
        goal.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(goal.toLowerCase())
      )
    );

    return matches.length / Math.max(courseSkills.length, learningGoals.length);
  }

  private static estimateCompletionTime(duration: number, availability: string): string {
    const hoursPerWeek = {
      'low': 3,
      'medium': 8,
      'high': 15
    };

    const weeklyHours = hoursPerWeek[availability as keyof typeof hoursPerWeek] || 5;
    const weeks = Math.ceil(duration / weeklyHours);

    if (weeks <= 1) return 'Esta semana';
    if (weeks <= 4) return `${weeks} semanas`;
    if (weeks <= 12) return `${Math.ceil(weeks / 4)} meses`;
    return `${Math.ceil(weeks / 12)} anos`;
  }

  // Obter cursos populares (fallback) com cache
  static async getPopularCourses(limit: number = 10): Promise<CourseRecommendation[]> {
    return cacheWithFallback(
      `${CACHE_KEYS.POPULAR_COURSES}_${limit}`,
      async () => {
        try {
          const { data: courses, error } = await supabase
            .from('courses')
            .select(`
              id,
              title,
              description,
              created_by,
              difficulty,
              duration_hours,
              cover_image_url
            `)
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .limit(limit);

          if (error) throw error;

          return courses.map(course => ({
            course_id: course.id,
            title: course.title,
            description: course.description,
            created_by: course.created_by,
            category: 'General', // Default category
            difficulty_level: course.difficulty,
            duration_hours: course.duration_hours,
            rating: 4.5, // Default rating
            student_count: 0, // Default count
            price: 0, // Free by default
            thumbnail_url: course.cover_image_url,
            skills: [], // Default skills
            recommendation_score: 0.5,
            recommendation_reasons: ['Curso popular'],
            match_percentage: 50,
            estimated_completion_time: 'Varia'
          }));
        } catch (error) {
          console.error('Erro ao buscar cursos populares:', error);
          return [];
        }
      },
      10 * 60 * 1000 // Cache por 10 minutos
    );
  }

  // Gerar trilhas de aprendizado
  static async generateLearningPaths(
    userId: string,
    targetSkill: string,
    limit: number = 3
  ): Promise<LearningPath[]> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return [];

      // Buscar cursos relacionados à skill
      const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .ilike('skills', `%${targetSkill}%`);

      if (error) throw error;

      // Agrupar por dificuldade e criar trilhas
      const beginnerCourses = courses.filter(c => c.difficulty_level === 'beginner');
      const intermediateCourses = courses.filter(c => c.difficulty_level === 'intermediate');
      const advancedCourses = courses.filter(c => c.difficulty_level === 'advanced');

      const paths: LearningPath[] = [];

      // Trilha completa (beginner -> advanced)
      if (beginnerCourses.length && intermediateCourses.length && advancedCourses.length) {
        const pathCourses = [
          beginnerCourses[0],
          intermediateCourses[0],
          advancedCourses[0]
        ].map(course => ({
          course_id: course.id,
          title: course.title,
          description: course.description,
          instructor_name: course.instructor_name,
          category: course.category,
          difficulty_level: course.difficulty_level,
          duration_hours: course.duration_hours,
          rating: course.rating,
          student_count: course.student_count,
          price: course.price,
          thumbnail_url: course.thumbnail_url,
          skills: course.skills || [],
          recommendation_score: 0.8,
          recommendation_reasons: ['Parte da trilha de aprendizado'],
          match_percentage: 80,
          estimated_completion_time: 'Varia'
        }));

        paths.push({
          id: `path-complete-${targetSkill}`,
          title: `Trilha Completa: ${targetSkill}`,
          description: `Do básico ao avançado em ${targetSkill}`,
          courses: pathCourses,
          total_duration: pathCourses.reduce((sum, c) => sum + c.duration_hours, 0),
          difficulty_progression: ['beginner', 'intermediate', 'advanced'],
          estimated_completion: this.estimateCompletionTime(
            pathCourses.reduce((sum, c) => sum + c.duration_hours, 0),
            profile.time_availability
          ),
          skills_acquired: [...new Set(pathCourses.flatMap(c => c.skills))],
          path_score: 0.9
        });
      }

      return paths.slice(0, limit);
    } catch (error) {
      console.error('Erro ao gerar trilhas:', error);
      return [];
    }
  }

  // Obter cursos em tendência
  static async getTrendingCourses(limit: number = 5): Promise<TrendingData[]> {
    try {
      // Simular dados de tendência (em produção, viria de analytics)
      const { data: courses, error } = await supabase
        .from('courses')
        .select('id, title, category, student_count, rating')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit * 2);

      if (error) throw error;

      return courses.slice(0, limit).map((course, index) => ({
        course_id: course.id,
        title: course.title,
        category: course.category,
        enrollment_growth: Math.random() * 50 + 10, // Simular crescimento
        completion_rate: Math.random() * 30 + 70, // Simular taxa de conclusão
        trending_score: (limit - index) / limit // Score baseado na posição
      }));
    } catch (error) {
      console.error('Erro ao buscar tendências:', error);
      return [];
    }
  }

  // Obter recomendações baseadas em cursos similares
  static async getSimilarCourses(courseId: string, limit: number = 5): Promise<CourseRecommendation[]> {
    try {
      // Buscar o curso de referência
      const { data: refCourse, error: refError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (refError) throw refError;

      // Buscar cursos similares (mesma categoria, skills similares)
      const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .eq('category', refCourse.category)
        .neq('id', courseId)
        .limit(limit * 2);

      if (error) throw error;

      // Calcular similaridade e retornar os mais similares
      const similar = courses
        .map(course => {
          const similarity = this.calculateSimilarity(refCourse, course);
          return {
            course_id: course.id,
            title: course.title,
            description: course.description,
            instructor_name: course.created_by,
            category: 'General',
            difficulty_level: course.difficulty,
            duration_hours: course.duration_hours,
            rating: 4.5,
            student_count: 0,
            price: 0,
            thumbnail_url: course.cover_image_url,
            skills: [],
            recommendation_score: similarity,
            recommendation_reasons: ['Curso similar'],
            match_percentage: Math.round(similarity * 100),
            estimated_completion_time: 'Varia'
          };
        })
        .sort((a, b) => b.recommendation_score - a.recommendation_score)
        .slice(0, limit);

      return similar;
    } catch (error) {
      console.error('Erro ao buscar cursos similares:', error);
      return [];
    }
  }

  // Calcular similaridade entre cursos
  private static calculateSimilarity(course1: any, course2: any): number {
    let similarity = 0;

    // Mesma categoria
    if (course1.category === course2.category) similarity += 0.3;

    // Mesmo nível de dificuldade
    if (course1.difficulty_level === course2.difficulty_level) similarity += 0.2;

    // Duração similar
    const durationDiff = Math.abs(course1.duration_hours - course2.duration_hours);
    const durationSimilarity = Math.max(0, 1 - durationDiff / Math.max(course1.duration_hours, course2.duration_hours));
    similarity += durationSimilarity * 0.2;

    // Skills similares
    const skills1 = course1.skills || [];
    const skills2 = course2.skills || [];
    const commonSkills = skills1.filter((skill: string) => skills2.includes(skill));
    const skillsSimilarity = commonSkills.length / Math.max(skills1.length, skills2.length, 1);
    similarity += skillsSimilarity * 0.3;

    return Math.min(similarity, 1);
  }
}
