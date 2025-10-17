// Esquads Academy - Gerador de Missões com IA

import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  level: number;
  points: number;
  streak: number;
  preferred_categories: string[];
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  difficulty_preference: 'easy' | 'medium' | 'hard';
  activity_pattern: 'morning' | 'afternoon' | 'evening' | 'night';
  completed_courses: number;
  current_courses: number;
  last_activity: string;
}

export interface CourseProgress {
  course_id: string;
  course_title: string;
  category: string;
  progress_percentage: number;
  lessons_completed: number;
  total_lessons: number;
  last_accessed: string;
  difficulty_level: string;
  time_spent: number;
}

export interface GeneratedMission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement' | 'challenge';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points_reward: number;
  target_value: number;
  current_progress: number;
  expires_at: string;
  requirements: string[];
  hints: string[];
  related_courses?: string[];
  estimated_time: number; // em minutos
  tags: string[];
}

class AIMissionGenerator {
  private difficultyMultipliers = {
    easy: 1,
    medium: 1.5,
    hard: 2.5
  };

  private basePoints = {
    daily: 50,
    weekly: 200,
    achievement: 100,
    challenge: 300
  };

  private missionTemplates = {
    study_streak: {
      titles: [
        'Mantenha o Foco',
        'Consistência é a Chave',
        'Ritmo de Estudos',
        'Disciplina Diária'
      ],
      descriptions: [
        'Estude por {target} dias consecutivos para manter seu ritmo de aprendizado',
        'Mantenha uma sequência de {target} dias de estudos para fortalecer o hábito',
        'Complete lições por {target} dias seguidos e desenvolva disciplina'
      ]
    },
    course_completion: {
      titles: [
        'Finalizador de Cursos',
        'Meta de Conclusão',
        'Jornada Completa',
        'Objetivo Alcançado'
      ],
      descriptions: [
        'Complete {target} curso(s) na categoria {category}',
        'Finalize {target} curso(s) para expandir seus conhecimentos em {category}',
        'Conclua {target} curso(s) e torne-se especialista em {category}'
      ]
    },
    lesson_marathon: {
      titles: [
        'Maratona de Lições',
        'Intensivo de Estudos',
        'Foco Total',
        'Aprendizado Acelerado'
      ],
      descriptions: [
        'Complete {target} lições em um dia',
        'Faça uma maratona de {target} lições para acelerar seu progresso',
        'Dedique-se e complete {target} lições hoje'
      ]
    },
    category_explorer: {
      titles: [
        'Explorador de Conhecimento',
        'Diversificação',
        'Ampliando Horizontes',
        'Novo Território'
      ],
      descriptions: [
        'Explore {target} categorias diferentes de cursos',
        'Diversifique seus estudos em {target} áreas do conhecimento',
        'Amplie seus horizontes estudando {target} categorias distintas'
      ]
    },
    time_investment: {
      titles: [
        'Investimento em Tempo',
        'Dedicação Total',
        'Foco Intenso',
        'Tempo de Qualidade'
      ],
      descriptions: [
        'Dedique {target} minutos aos estudos hoje',
        'Invista {target} minutos do seu tempo em aprendizado',
        'Concentre-se por {target} minutos em seus cursos'
      ]
    }
  };

  async generatePersonalizedMissions(
    userProfile: UserProfile,
    courseProgress: CourseProgress[],
    existingMissions: GeneratedMission[] = []
  ): Promise<GeneratedMission[]> {
    const missions: GeneratedMission[] = [];

    // Gerar missão diária baseada no padrão de atividade
    const dailyMission = this.generateDailyMission(userProfile, courseProgress);
    if (dailyMission) missions.push(dailyMission);

    // Gerar missão semanal baseada no progresso
    const weeklyMission = this.generateWeeklyMission(userProfile, courseProgress);
    if (weeklyMission) missions.push(weeklyMission);

    // Gerar missão de conquista baseada no nível
    const achievementMission = this.generateAchievementMission(userProfile, courseProgress);
    if (achievementMission) missions.push(achievementMission);

    // Gerar desafio personalizado
    const challengeMission = this.generateChallengeMission(userProfile, courseProgress);
    if (challengeMission) missions.push(challengeMission);

    return missions.filter(mission => 
      !existingMissions.some(existing => 
        existing.type === mission.type && existing.category === mission.category
      )
    );
  }

  private generateDailyMission(
    userProfile: UserProfile,
    courseProgress: CourseProgress[]
  ): GeneratedMission | null {
    const templates = this.missionTemplates;
    const currentCourses = courseProgress.filter(cp => cp.progress_percentage < 100);
    
    if (currentCourses.length === 0) return null;

    // Escolher tipo de missão baseado no perfil
    let missionType: keyof typeof templates;
    
    if (userProfile.streak < 3) {
      missionType = 'study_streak';
    } else if (currentCourses.some(cp => cp.progress_percentage > 80)) {
      missionType = 'course_completion';
    } else {
      missionType = 'lesson_marathon';
    }

    const template = templates[missionType];
    const title = this.getRandomItem(template.titles);
    const description = this.getRandomItem(template.descriptions);

    let targetValue: number;
    let category = '';

    switch (missionType) {
      case 'study_streak':
        targetValue = Math.min(userProfile.streak + 1, 7);
        break;
      case 'course_completion':
        targetValue = 1;
        category = this.getMostProgressedCategory(currentCourses);
        break;
      case 'lesson_marathon':
        targetValue = this.calculateOptimalLessonTarget(userProfile);
        break;
      default:
        targetValue = 1;
    }

    const difficulty = this.calculateDifficulty(userProfile, targetValue, missionType);
    const points = this.calculatePoints('daily', difficulty, targetValue);

    return {
      id: this.generateId(),
      title,
      description: description.replace('{target}', targetValue.toString()).replace('{category}', category),
      type: 'daily',
      category: category || 'geral',
      difficulty,
      points_reward: points,
      target_value: targetValue,
      current_progress: 0,
      expires_at: this.getEndOfDay(),
      requirements: this.generateRequirements(missionType, targetValue),
      hints: this.generateHints(missionType, userProfile),
      estimated_time: this.estimateTime(missionType, targetValue),
      tags: this.generateTags(missionType, category)
    };
  }

  private generateWeeklyMission(
    userProfile: UserProfile,
    courseProgress: CourseProgress[]
  ): GeneratedMission | null {
    const templates = this.missionTemplates;
    
    // Missões semanais focam em objetivos maiores
    const missionType = userProfile.completed_courses < 3 ? 'course_completion' : 'category_explorer';
    const template = templates[missionType];
    
    const title = this.getRandomItem(template.titles);
    const description = this.getRandomItem(template.descriptions);

    let targetValue: number;
    let category = '';

    if (missionType === 'course_completion') {
      targetValue = Math.min(Math.floor(userProfile.level / 5) + 1, 3);
      category = this.getPreferredCategory(userProfile);
    } else {
      targetValue = Math.min(userProfile.preferred_categories.length + 1, 5);
    }

    const difficulty = this.calculateDifficulty(userProfile, targetValue, missionType);
    const points = this.calculatePoints('weekly', difficulty, targetValue);

    return {
      id: this.generateId(),
      title,
      description: description.replace('{target}', targetValue.toString()).replace('{category}', category),
      type: 'weekly',
      category: category || 'geral',
      difficulty,
      points_reward: points,
      target_value: targetValue,
      current_progress: 0,
      expires_at: this.getEndOfWeek(),
      requirements: this.generateRequirements(missionType, targetValue),
      hints: this.generateHints(missionType, userProfile),
      estimated_time: this.estimateTime(missionType, targetValue) * 7,
      tags: this.generateTags(missionType, category)
    };
  }

  private generateAchievementMission(
    userProfile: UserProfile,
    courseProgress: CourseProgress[]
  ): GeneratedMission | null {
    // Missões de conquista baseadas no nível e progresso
    const achievements = [
      {
        condition: () => userProfile.level >= 5 && userProfile.streak < 10,
        type: 'study_streak',
        target: 10,
        category: 'disciplina'
      },
      {
        condition: () => userProfile.completed_courses >= 3 && courseProgress.length < 5,
        type: 'course_completion',
        target: 2,
        category: this.getPreferredCategory(userProfile)
      },
      {
        condition: () => userProfile.points >= 1000,
        type: 'time_investment',
        target: 120,
        category: 'dedicação'
      }
    ];

    const availableAchievement = achievements.find(a => a.condition());
    if (!availableAchievement) return null;

    const template = this.missionTemplates[availableAchievement.type as keyof typeof this.missionTemplates];
    const title = this.getRandomItem(template.titles);
    const description = this.getRandomItem(template.descriptions);

    const difficulty = this.calculateDifficulty(userProfile, availableAchievement.target, availableAchievement.type);
    const points = this.calculatePoints('achievement', difficulty, availableAchievement.target);

    return {
      id: this.generateId(),
      title: `🏆 ${title}`,
      description: description
        .replace('{target}', availableAchievement.target.toString())
        .replace('{category}', availableAchievement.category),
      type: 'achievement',
      category: availableAchievement.category,
      difficulty,
      points_reward: points,
      target_value: availableAchievement.target,
      current_progress: 0,
      expires_at: this.getEndOfMonth(),
      requirements: this.generateRequirements(availableAchievement.type, availableAchievement.target),
      hints: this.generateHints(availableAchievement.type, userProfile),
      estimated_time: this.estimateTime(availableAchievement.type, availableAchievement.target),
      tags: ['conquista', 'especial', ...this.generateTags(availableAchievement.type, availableAchievement.category)]
    };
  }

  private generateChallengeMission(
    userProfile: UserProfile,
    courseProgress: CourseProgress[]
  ): GeneratedMission | null {
    // Desafios são missões especiais e difíceis
    const challenges = [
      {
        title: '🔥 Maratona Intensiva',
        description: 'Complete 5 lições em diferentes cursos no mesmo dia',
        type: 'lesson_marathon',
        target: 5,
        category: 'intensivo'
      },
      {
        title: '🎯 Especialista Focado',
        description: 'Dedique 3 horas consecutivas a um único curso',
        type: 'time_investment',
        target: 180,
        category: 'foco'
      },
      {
        title: '🌟 Explorador Completo',
        description: 'Inicie cursos em 3 categorias diferentes esta semana',
        type: 'category_explorer',
        target: 3,
        category: 'exploração'
      }
    ];

    const challenge = this.getRandomItem(challenges);
    const difficulty = 'hard';
    const points = this.calculatePoints('challenge', difficulty, challenge.target);

    return {
      id: this.generateId(),
      title: challenge.title,
      description: challenge.description,
      type: 'challenge',
      category: challenge.category,
      difficulty,
      points_reward: points,
      target_value: challenge.target,
      current_progress: 0,
      expires_at: this.getEndOfWeek(),
      requirements: this.generateRequirements(challenge.type, challenge.target),
      hints: this.generateHints(challenge.type, userProfile),
      estimated_time: this.estimateTime(challenge.type, challenge.target),
      tags: ['desafio', 'especial', 'difícil']
    };
  }

  // Métodos auxiliares
  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getMostProgressedCategory(courses: CourseProgress[]): string {
    const categoryProgress = courses.reduce((acc, course) => {
      acc[course.category] = (acc[course.category] || 0) + course.progress_percentage;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryProgress)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'geral';
  }

  private getPreferredCategory(userProfile: UserProfile): string {
    return userProfile.preferred_categories[0] || 'geral';
  }

  private calculateOptimalLessonTarget(userProfile: UserProfile): number {
    const baseTarget = Math.floor(userProfile.level / 3) + 2;
    return Math.min(Math.max(baseTarget, 2), 8);
  }

  private calculateDifficulty(
    userProfile: UserProfile,
    targetValue: number,
    missionType: string
  ): 'easy' | 'medium' | 'hard' {
    const userLevel = userProfile.level;
    const preference = userProfile.difficulty_preference;

    // Ajustar baseado no tipo de missão e valor alvo
    let baseDifficulty = 'medium';

    if (missionType === 'study_streak' && targetValue <= 3) baseDifficulty = 'easy';
    if (missionType === 'lesson_marathon' && targetValue >= 6) baseDifficulty = 'hard';
    if (missionType === 'time_investment' && targetValue >= 120) baseDifficulty = 'hard';

    // Ajustar baseado no nível do usuário
    if (userLevel < 5 && baseDifficulty === 'hard') baseDifficulty = 'medium';
    if (userLevel >= 15 && baseDifficulty === 'easy') baseDifficulty = 'medium';

    // Considerar preferência do usuário
    if (preference === 'easy' && baseDifficulty === 'hard') baseDifficulty = 'medium';
    if (preference === 'hard' && baseDifficulty === 'easy') baseDifficulty = 'medium';

    return baseDifficulty as 'easy' | 'medium' | 'hard';
  }

  private calculatePoints(
    type: 'daily' | 'weekly' | 'achievement' | 'challenge',
    difficulty: 'easy' | 'medium' | 'hard',
    targetValue: number
  ): number {
    const basePoints = this.basePoints[type];
    const difficultyMultiplier = this.difficultyMultipliers[difficulty];
    const targetMultiplier = Math.max(1, Math.log2(targetValue));

    return Math.round(basePoints * difficultyMultiplier * targetMultiplier);
  }

  private generateRequirements(missionType: string, targetValue: number): string[] {
    const requirements: Record<string, string[]> = {
      study_streak: [
        'Acesse a plataforma diariamente',
        'Complete pelo menos uma lição por dia',
        'Mantenha a sequência sem interrupções'
      ],
      course_completion: [
        'Complete todas as lições do curso',
        'Realize todas as atividades práticas',
        'Obtenha nota mínima de 70% nas avaliações'
      ],
      lesson_marathon: [
        'Complete as lições em sequência',
        'Mantenha foco durante toda a sessão',
        'Não pule conteúdos obrigatórios'
      ],
      category_explorer: [
        'Explore diferentes áreas de conhecimento',
        'Inicie pelo menos uma lição em cada categoria',
        'Diversifique seus estudos'
      ],
      time_investment: [
        'Dedique tempo contínuo aos estudos',
        'Evite distrações durante o período',
        'Foque em conteúdo de qualidade'
      ]
    };

    return requirements[missionType] || ['Complete a missão conforme descrito'];
  }

  private generateHints(missionType: string, userProfile: UserProfile): string[] {
    const hints: Record<string, string[]> = {
      study_streak: [
        'Defina um horário fixo para estudar',
        'Use lembretes para manter a consistência',
        'Comece com sessões curtas se necessário'
      ],
      course_completion: [
        'Organize seu tempo de estudo',
        'Faça anotações durante as lições',
        'Pratique os exercícios regularmente'
      ],
      lesson_marathon: [
        'Prepare um ambiente livre de distrações',
        'Faça pausas curtas entre as lições',
        'Mantenha água e lanches saudáveis por perto'
      ],
      category_explorer: [
        'Comece pelas categorias que mais te interessam',
        'Explore cursos introdutórios primeiro',
        'Varie entre teoria e prática'
      ],
      time_investment: [
        'Use a técnica Pomodoro para manter o foco',
        'Elimine notificações durante o estudo',
        'Escolha conteúdo adequado ao seu nível'
      ]
    };

    const baseHints = hints[missionType] || ['Mantenha o foco e seja consistente'];
    
    // Adicionar dicas personalizadas baseadas no perfil
    if (userProfile.activity_pattern === 'morning') {
      baseHints.push('Aproveite sua energia matinal para estudar');
    }
    
    if (userProfile.learning_style === 'visual') {
      baseHints.push('Foque em cursos com conteúdo visual rico');
    }

    return baseHints;
  }

  private estimateTime(missionType: string, targetValue: number): number {
    const timeEstimates: Record<string, number> = {
      study_streak: 30, // 30 min por dia
      course_completion: 180, // 3 horas por curso
      lesson_marathon: 20, // 20 min por lição
      category_explorer: 45, // 45 min por categoria
      time_investment: 1 // 1 min por minuto alvo
    };

    const baseTime = timeEstimates[missionType] || 30;
    return baseTime * targetValue;
  }

  private generateTags(missionType: string, category: string): string[] {
    const typeTags: Record<string, string[]> = {
      study_streak: ['consistência', 'hábito', 'disciplina'],
      course_completion: ['conclusão', 'objetivo', 'progresso'],
      lesson_marathon: ['intensivo', 'foco', 'produtividade'],
      category_explorer: ['exploração', 'diversidade', 'conhecimento'],
      time_investment: ['dedicação', 'tempo', 'comprometimento']
    };

    const tags = [...(typeTags[missionType] || [])];
    if (category && category !== 'geral') {
      tags.push(category);
    }

    return tags;
  }

  private generateId(): string {
    // Use crypto.randomUUID if available, otherwise fallback to timestamp + random
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `mission_${crypto.randomUUID()}`;
    }
    
    // Enhanced fallback with microseconds and longer random string
    const timestamp = Date.now();
    const microseconds = performance.now().toString().replace('.', '');
    const randomStr = Math.random().toString(36).substr(2, 12);
    return `mission_${timestamp}_${microseconds}_${randomStr}`;
  }

  private getEndOfDay(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }

  private getEndOfWeek(): string {
    const endOfWeek = new Date();
    const daysUntilSunday = 7 - endOfWeek.getDay();
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek.toISOString();
  }

  private getEndOfMonth(): string {
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    return endOfMonth.toISOString();
  }
}

// Instância singleton do gerador
export const aiMissionGenerator = new AIMissionGenerator();

// Funções auxiliares com fallbacks robustos
async function getUserProfileWithFallback(userId: string): Promise<any> {
  try {
    // Tentar buscar na tabela user_profiles primeiro
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profile && !error) {
      return profile;
    }

    // Se não encontrou ou tabela não existe, tentar users
    console.log('user_profiles não encontrado, tentando users table');
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userProfile && !userError) {
      // Mapear dados do users para o formato esperado
      return {
        user_id: userId,
        level: userProfile.level || 1,
        points: userProfile.points || 0,
        streak: userProfile.learning_streak || 0,
        preferred_categories: userProfile.favorite_categories || [],
        learning_style: userProfile.learning_style || 'visual',
        difficulty_preference: userProfile.skill_level || 'medium',
        activity_pattern: userProfile.time_availability || 'evening',
        completed_courses: userProfile.completed_courses?.length || 0,
        last_activity: userProfile.updated_at || new Date().toISOString()
      };
    }

    // Se nenhuma tabela funcionou, criar perfil padrão
    console.log('Criando perfil padrão para usuário:', userId);
    return createDefaultProfile(userId);

  } catch (error: any) {
    console.error('Erro ao buscar perfil do usuário:', error);
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.log('Tabela não existe, criando perfil padrão');
    }
    return createDefaultProfile(userId);
  }
}

async function getCourseProgressWithFallback(userId: string): Promise<any[]> {
  try {
    // Tentar buscar na tabela course_enrollments primeiro
    const { data: enrollments, error } = await supabase
      .from('course_enrollments')
      .select(`
        course_id,
        progress_percentage,
        courses (
          title,
          category,
          difficulty_level
        )
      `)
      .eq('user_id', userId);

    if (enrollments && !error) {
      return enrollments;
    }

    // Fallback para user_courses se course_enrollments não existir
    console.log('course_enrollments não encontrado, tentando user_courses');
    const { data: userCourses, error: userCoursesError } = await supabase
      .from('user_courses')
      .select(`
        course_id,
        progress_percentage,
        courses (
          title,
          category,
          difficulty_level
        )
      `)
      .eq('user_id', userId);

    if (userCourses && !userCoursesError) {
      return userCourses;
    }

    // Se nenhuma tabela funcionou, retornar array vazio
    console.log('Nenhuma tabela de progresso encontrada, retornando array vazio');
    return [];

  } catch (error: any) {
    console.error('Erro ao buscar progresso dos cursos:', error);
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.log('Tabela de progresso não existe');
    }
    return [];
  }
}

async function getExistingMissionsWithFallback(userId: string): Promise<any[]> {
  try {
    // Tentar buscar missões existentes
    const { data: missions, error } = await supabase
      .from('missions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (missions && !error) {
      return missions;
    }

    // Se tabela não existe ou erro, retornar array vazio
    console.log('Tabela missions não encontrada ou erro, retornando array vazio');
    return [];

  } catch (error: any) {
    console.error('Erro ao buscar missões existentes:', error);
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.log('Tabela missions não existe');
    }
    return [];
  }
}

function createDefaultProfile(userId: string): any {
  return {
    user_id: userId,
    level: 1,
    points: 0,
    streak: 0,
    preferred_categories: ['programação', 'tecnologia'],
    learning_style: 'visual',
    difficulty_preference: 'medium',
    activity_pattern: 'evening',
    completed_courses: 0,
    last_activity: new Date().toISOString()
  };
}

// Função principal para gerar missões personalizadas com fallbacks robustos
export async function generatePersonalizedMissions(userId: string): Promise<GeneratedMission[]> {
  try {
    // Buscar perfil do usuário com fallbacks
    const profile = await getUserProfileWithFallback(userId);
    
    // Buscar progresso dos cursos com fallbacks
    const courseProgress = await getCourseProgressWithFallback(userId);

    // Buscar missões existentes com fallbacks
    const existingMissions = await getExistingMissionsWithFallback(userId);

    // Transformar dados para o formato esperado com validações
    const userProfile: UserProfile = {
      id: userId,
      level: Math.max(profile?.level || 1, 1),
      points: Math.max(profile?.points || 0, 0),
      streak: Math.max(profile?.streak || 0, 0),
      preferred_categories: Array.isArray(profile?.preferred_categories) ? profile.preferred_categories : ['programação'],
      learning_style: profile?.learning_style || 'visual',
      difficulty_preference: profile?.difficulty_preference || 'medium',
      activity_pattern: profile?.activity_pattern || 'evening',
      completed_courses: Math.max(profile?.completed_courses || 0, 0),
      current_courses: Array.isArray(courseProgress) ? courseProgress.length : 0,
      last_activity: profile?.last_activity || new Date().toISOString()
    };

    const formattedCourseProgress: CourseProgress[] = Array.isArray(courseProgress) 
      ? courseProgress.map(cp => ({
          course_id: cp?.course_id || '',
          course_title: cp?.courses?.title || 'Curso sem título',
          category: cp?.courses?.category || 'geral',
          progress_percentage: Math.max(Math.min(cp?.progress_percentage || 0, 100), 0),
          lessons_completed: 0, // Seria necessário calcular
          total_lessons: 0, // Seria necessário calcular
          last_accessed: new Date().toISOString(),
          difficulty_level: cp?.courses?.difficulty_level || 'medium',
          time_spent: 0 // Seria necessário calcular
        })).filter(cp => cp.course_id) // Filtrar cursos sem ID
      : [];

    const formattedExistingMissions: GeneratedMission[] = Array.isArray(existingMissions)
      ? existingMissions.map(mission => ({
          id: mission?.id || '',
          title: mission?.title || 'Missão sem título',
          description: mission?.description || 'Descrição não disponível',
          type: mission?.type || 'daily',
          category: mission?.category || 'geral',
          difficulty: mission?.difficulty || 'medium',
          points_reward: Math.max(mission?.points_reward || 50, 0),
          target_value: Math.max(mission?.target_value || 1, 1),
          current_progress: Math.max(mission?.current_progress || 0, 0),
          expires_at: mission?.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          requirements: Array.isArray(mission?.requirements) ? mission.requirements : [],
          hints: Array.isArray(mission?.hints) ? mission.hints : [],
          related_courses: Array.isArray(mission?.related_courses) ? mission.related_courses : [],
          estimated_time: Math.max(mission?.estimated_time || 30, 1),
          tags: Array.isArray(mission?.tags) ? mission.tags : []
        })).filter(mission => mission.id) // Filtrar missões sem ID
      : [];

    // Gerar missões personalizadas com tratamento de erro
    try {
      const generatedMissions = await aiMissionGenerator.generatePersonalizedMissions(
        userProfile,
        formattedCourseProgress,
        formattedExistingMissions
      );

      // Validar missões geradas
      return Array.isArray(generatedMissions) ? generatedMissions : [];

    } catch (generationError) {
      console.error('Erro na geração de missões:', generationError);
      
      // Fallback: gerar missões básicas
      return generateBasicFallbackMissions(userId);
    }

  } catch (error) {
    console.error('Erro geral ao gerar missões personalizadas:', error);
    
    // Fallback final: gerar missões básicas
    try {
      return generateBasicFallbackMissions(userId);
    } catch (fallbackError) {
      console.error('Erro no fallback de missões básicas:', fallbackError);
      return [];
    }
  }
}

// Função de fallback para gerar missões básicas
function generateBasicFallbackMissions(userId: string): GeneratedMission[] {
  const basicMissions: GeneratedMission[] = [
    {
      id: `fallback_daily_${Date.now()}`,
      title: 'Estudo Diário',
      description: 'Complete uma lição hoje para manter seu progresso',
      type: 'daily',
      category: 'geral',
      difficulty: 'easy',
      points_reward: 50,
      target_value: 1,
      current_progress: 0,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      requirements: ['Complete pelo menos uma lição'],
      hints: ['Escolha um curso que você já começou', 'Dedique 15-30 minutos aos estudos'],
      estimated_time: 30,
      tags: ['básico', 'diário', 'progresso']
    },
    {
      id: `fallback_weekly_${Date.now()}`,
      title: 'Meta Semanal',
      description: 'Complete 3 lições esta semana',
      type: 'weekly',
      category: 'geral',
      difficulty: 'medium',
      points_reward: 150,
      target_value: 3,
      current_progress: 0,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      requirements: ['Complete 3 lições em qualquer curso'],
      hints: ['Distribua as lições ao longo da semana', 'Mantenha consistência nos estudos'],
      estimated_time: 90,
      tags: ['semanal', 'meta', 'consistência']
    }
  ];

  return basicMissions;
}
