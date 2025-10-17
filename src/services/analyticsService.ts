import { supabase } from '@/integrations/supabase/client';

export interface CourseAnalytics {
  courseId: string;
  courseName: string;
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  averageProgress: number;
  averageRating: number;
  totalRevenue: number;
  engagementScore: number;
  dropoffRate: number;
  averageTimeSpent: number; // em minutos
  popularLessons: LessonAnalytics[];
  studentProgress: StudentProgress[];
  revenueOverTime: RevenueData[];
  engagementOverTime: EngagementData[];
}

export interface LessonAnalytics {
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  viewCount: number;
  completionRate: number;
  averageTimeSpent: number;
  dropoffRate: number;
  rating: number;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrollmentDate: string;
  progress: number;
  lastActivity: string;
  timeSpent: number;
  completedLessons: number;
  totalLessons: number;
  currentLesson?: string;
  status: 'active' | 'inactive' | 'completed' | 'dropped';
}

export interface RevenueData {
  date: string;
  revenue: number;
  enrollments: number;
}

export interface EngagementData {
  date: string;
  activeUsers: number;
  sessionsCount: number;
  averageSessionDuration: number;
  pageViews: number;
}

export interface PlatformAnalytics {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersToday: number;
  coursesPublishedToday: number;
  averageCompletionRate: number;
  averageRating: number;
  topCourses: TopCourse[];
  userGrowth: UserGrowthData[];
  revenueGrowth: RevenueData[];
  categoryDistribution: CategoryData[];
  userEngagement: UserEngagementData;
}

export interface TopCourse {
  id: string;
  title: string;
  instructor: string;
  students: number;
  revenue: number;
  rating: number;
  completionRate: number;
}

export interface UserGrowthData {
  date: string;
  newUsers: number;
  totalUsers: number;
}

export interface CategoryData {
  category: string;
  courseCount: number;
  studentCount: number;
  revenue: number;
}

export interface UserEngagementData {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  retentionRate: number;
}

class AnalyticsService {
  // Obter analytics de um curso específico
  async getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
    try {
      // Buscar informações básicas do curso
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          price,
          created_at,
          course_modules (
            id,
            title,
            module_lessons (
              id,
              title,
              duration
            )
          )
        `)
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      // Buscar matrículas
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('user_courses')
        .select(`
          id,
          user_id,
          enrolled_at,
          progress_percentage,
          completed_at,
          last_accessed_at,
          users (
            id,
            full_name
          )
        `)
        .eq('course_id', courseId);

      if (enrollmentsError) throw enrollmentsError;

      // Buscar progresso das lições
      const { data: lessonProgress, error: progressError } = await supabase
        .from('lesson_progress')
        .select(`
          id,
          user_id,
          lesson_id,
          completed_at,
          watch_time,
          module_lessons (
            id,
            title,
            duration,
            course_modules (
              title
            )
          )
        `)
        .in('lesson_id', course.course_modules.flatMap(m => m.module_lessons.map(l => l.id)));

      if (progressError) throw progressError;

      // Buscar avaliações (tabela não existe ainda)
      const ratings: any[] = [];

      // Calcular métricas
      const totalStudents = enrollments?.length || 0;
      const completedStudents = enrollments?.filter(e => e.completed_at).length || 0;
      const activeStudents = enrollments?.filter(e => {
        const lastActivity = new Date(e.last_accessed_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return lastActivity > weekAgo;
      }).length || 0;

      const completionRate = totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;
      const averageProgress = enrollments?.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / totalStudents || 0;
      const averageRating = ratings?.reduce((sum, r) => sum + r.rating, 0) / (ratings?.length || 1) || 0;
      const totalRevenue = totalStudents * (course.price || 0);

      // Calcular analytics das lições
      const lessonAnalytics: LessonAnalytics[] = course.course_modules.flatMap(module =>
        module.module_lessons.map(lesson => {
          const lessonProgressData = lessonProgress?.filter(lp => lp.lesson_id === lesson.id) || [];
          const viewCount = lessonProgressData.length;
          const completedCount = lessonProgressData.filter(lp => lp.completed_at).length;
          const avgTimeSpent = lessonProgressData.reduce((sum, lp) => sum + (lp.watch_time || 0), 0) / viewCount || 0;

          return {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            moduleTitle: module.title,
            viewCount,
            completionRate: viewCount > 0 ? (completedCount / viewCount) * 100 : 0,
            averageTimeSpent: avgTimeSpent,
            dropoffRate: viewCount > 0 ? ((viewCount - completedCount) / viewCount) * 100 : 0,
            rating: 0 // Implementar avaliações por lição se necessário
          };
        })
      );

      // Calcular progresso dos estudantes
      const studentProgress: StudentProgress[] = enrollments?.map(enrollment => {
        const userLessonProgress = lessonProgress?.filter(lp => lp.user_id === enrollment.user_id) || [];
        const completedLessons = userLessonProgress.filter(lp => lp.completed_at).length;
        const totalLessons = course.course_modules.reduce((sum, m) => sum + m.module_lessons.length, 0);
        const timeSpent = userLessonProgress.reduce((sum, lp) => sum + (lp.watch_time || 0), 0);

        let status: 'active' | 'inactive' | 'completed' | 'dropped' = 'inactive';
        if (enrollment.completed_at) {
          status = 'completed';
        } else if (enrollment.last_accessed_at) {
          const lastActivity = new Date(enrollment.last_accessed_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          status = lastActivity > weekAgo ? 'active' : 'inactive';
          
          // Considerar como dropped se não há atividade há mais de 30 dias
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          if (lastActivity < monthAgo && enrollment.progress_percentage < 10) {
            status = 'dropped';
          }
        }

        return {
          studentId: enrollment.user_id,
          studentName: enrollment.users?.full_name || 'Usuário',
          studentEmail: '', // Não temos email na query atual
          enrollmentDate: enrollment.enrolled_at,
          progress: enrollment.progress_percentage || 0,
          lastActivity: enrollment.last_accessed_at || enrollment.enrolled_at,
          timeSpent,
          completedLessons,
          totalLessons,
          status
        };
      }) || [];

      // Simular dados de receita e engajamento ao longo do tempo
      const revenueOverTime = this.generateRevenueOverTime(enrollments || [], course.price || 0);
      const engagementOverTime = this.generateEngagementOverTime(enrollments || []);

      const engagementScore = this.calculateEngagementScore(
        averageProgress,
        completionRate,
        activeStudents / totalStudents * 100,
        averageRating
      );

      const dropoffRate = totalStudents > 0 ? ((totalStudents - completedStudents) / totalStudents) * 100 : 0;
      const averageTimeSpent = studentProgress.reduce((sum, sp) => sum + sp.timeSpent, 0) / totalStudents || 0;

      return {
        courseId,
        courseName: course.title,
        totalStudents,
        activeStudents,
        completionRate,
        averageProgress,
        averageRating,
        totalRevenue,
        engagementScore,
        dropoffRate,
        averageTimeSpent,
        popularLessons: lessonAnalytics.sort((a, b) => b.viewCount - a.viewCount).slice(0, 5),
        studentProgress,
        revenueOverTime,
        engagementOverTime
      };
    } catch (error) {
      console.error('Erro ao buscar analytics do curso:', error);
      throw error;
    }
  }

  // Obter analytics da plataforma
  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    try {
      // Buscar dados básicos
      const [usersResult, coursesResult, enrollmentsResult, ratingsResult] = await Promise.all([
        supabase.from('users').select('id, created_at'),
        supabase.from('courses').select('id, title, price, category, instructor_id, created_at, users(full_name)'),
        supabase.from('course_enrollments').select('id, course_id, user_id, enrolled_at, progress, completed_at'),
        supabase.from('course_ratings').select('rating, course_id')
      ]);

      const users = usersResult.data || [];
      const courses = coursesResult.data || [];
      const enrollments = enrollmentsResult.data || [];
      const ratings = ratingsResult.data || [];

      // Calcular métricas básicas
      const totalUsers = users.length;
      const totalCourses = courses.length;
      const totalRevenue = enrollments.reduce((sum, e) => {
        const course = courses.find(c => c.id === e.course_id);
        return sum + (course?.price || 0);
      }, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeUsers = users.filter(u => {
        // Simular usuários ativos (usuários criados nos últimos 7 dias)
        const userDate = new Date(u.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return userDate > weekAgo;
      }).length;

      const newUsersToday = users.filter(u => {
        const userDate = new Date(u.created_at);
        return userDate >= today;
      }).length;

      const coursesPublishedToday = courses.filter(c => {
        const courseDate = new Date(c.created_at);
        return courseDate >= today;
      }).length;

      const completedEnrollments = enrollments.filter(e => e.completed_at).length;
      const averageCompletionRate = enrollments.length > 0 ? (completedEnrollments / enrollments.length) * 100 : 0;
      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / (ratings.length || 1);

      // Top cursos
      const courseStats = courses.map(course => {
        const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
        const courseRatings = ratings.filter(r => r.course_id === course.id);
        const courseRevenue = courseEnrollments.length * (course.price || 0);
        const courseCompletions = courseEnrollments.filter(e => e.completed_at).length;
        const courseRating = courseRatings.reduce((sum, r) => sum + r.rating, 0) / (courseRatings.length || 1);

        return {
          id: course.id,
          title: course.title,
          instructor: course.users?.full_name || 'Instrutor',
          students: courseEnrollments.length,
          revenue: courseRevenue,
          rating: courseRating,
          completionRate: courseEnrollments.length > 0 ? (courseCompletions / courseEnrollments.length) * 100 : 0
        };
      });

      const topCourses = courseStats
        .sort((a, b) => b.students - a.students)
        .slice(0, 10);

      // Crescimento de usuários
      const userGrowth = this.generateUserGrowthData(users);
      const revenueGrowth = this.generateRevenueGrowthData(enrollments, courses);

      // Distribuição por categoria
      const categoryDistribution = this.generateCategoryDistribution(courses, enrollments);

      // Engajamento de usuários
      const userEngagement: UserEngagementData = {
        dailyActiveUsers: Math.floor(totalUsers * 0.1), // 10% dos usuários ativos diariamente
        weeklyActiveUsers: Math.floor(totalUsers * 0.3), // 30% semanalmente
        monthlyActiveUsers: Math.floor(totalUsers * 0.6), // 60% mensalmente
        averageSessionDuration: 25, // 25 minutos
        bounceRate: 35, // 35%
        retentionRate: 75 // 75%
      };

      return {
        totalUsers,
        totalCourses,
        totalRevenue,
        activeUsers,
        newUsersToday,
        coursesPublishedToday,
        averageCompletionRate,
        averageRating,
        topCourses,
        userGrowth,
        revenueGrowth,
        categoryDistribution,
        userEngagement
      };
    } catch (error) {
      console.error('Erro ao buscar analytics da plataforma:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  private calculateEngagementScore(
    averageProgress: number,
    completionRate: number,
    activeUserRate: number,
    averageRating: number
  ): number {
    // Fórmula ponderada para calcular score de engajamento
    const progressWeight = 0.3;
    const completionWeight = 0.3;
    const activeWeight = 0.2;
    const ratingWeight = 0.2;

    return (
      (averageProgress * progressWeight) +
      (completionRate * completionWeight) +
      (activeUserRate * activeWeight) +
      ((averageRating / 5) * 100 * ratingWeight)
    );
  }

  private generateRevenueOverTime(enrollments: any[], coursePrice: number): RevenueData[] {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayEnrollments = enrollments.filter(e => 
        e.enrolled_at.startsWith(date)
      );
      
      return {
        date,
        revenue: dayEnrollments.length * coursePrice,
        enrollments: dayEnrollments.length
      };
    });
  }

  private generateEngagementOverTime(enrollments: any[]): EngagementData[] {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayEnrollments = enrollments.filter(e => 
        e.enrolled_at.startsWith(date) || 
        (e.last_activity && e.last_activity.startsWith(date))
      );
      
      return {
        date,
        activeUsers: dayEnrollments.length,
        sessionsCount: Math.floor(dayEnrollments.length * 1.5), // Simular múltiplas sessões
        averageSessionDuration: 20 + Math.random() * 20, // 20-40 minutos
        pageViews: dayEnrollments.length * (3 + Math.floor(Math.random() * 5)) // 3-8 páginas por usuário
      };
    });
  }

  private generateUserGrowthData(users: any[]): UserGrowthData[] {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    let cumulativeUsers = 0;

    return last30Days.map(date => {
      const newUsers = users.filter(u => u.created_at.startsWith(date)).length;
      cumulativeUsers += newUsers;
      
      return {
        date,
        newUsers,
        totalUsers: cumulativeUsers
      };
    });
  }

  private generateRevenueGrowthData(enrollments: any[], courses: any[]): RevenueData[] {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayEnrollments = enrollments.filter(e => e.enrolled_at.startsWith(date));
      const revenue = dayEnrollments.reduce((sum, e) => {
        const course = courses.find(c => c.id === e.course_id);
        return sum + (course?.price || 0);
      }, 0);
      
      return {
        date,
        revenue,
        enrollments: dayEnrollments.length
      };
    });
  }

  private generateCategoryDistribution(courses: any[], enrollments: any[]): CategoryData[] {
    const categories = Array.from(new Set(courses.map(c => c.category)));
    
    return categories.map(category => {
      const categoryCourses = courses.filter(c => c.category === category);
      const categoryEnrollments = enrollments.filter(e => 
        categoryCourses.some(c => c.id === e.course_id)
      );
      const revenue = categoryEnrollments.reduce((sum, e) => {
        const course = categoryCourses.find(c => c.id === e.course_id);
        return sum + (course?.price || 0);
      }, 0);

      return {
        category,
        courseCount: categoryCourses.length,
        studentCount: categoryEnrollments.length,
        revenue
      };
    });
  }
}

export const analyticsService = new AnalyticsService();
