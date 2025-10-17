// Esquads Academy - Hook para gerenciar progresso das lições

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { LessonProgress, ModuleLesson } from '@/types/database';

interface LessonProgressWithLesson {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
  watch_time: number;
  is_completed?: boolean;
  time_spent?: number;
  lesson: ModuleLesson;
}

export const useLessonProgress = (courseId?: string) => {
  const { user } = useAuth();
  const [lessonProgress, setLessonProgress] = useState<LessonProgressWithLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && courseId) {
      fetchLessonProgress();
    }
  }, [user, courseId]);

  const fetchLessonProgress = async () => {
    if (!user || !courseId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('lesson_progress')
        .select(`
          *,
          lesson:module_lessons(
            *,
            module:course_modules(course_id)
          )
        `)
        .eq('user_id', user.id)
        .eq('lesson.module.course_id', courseId);

      if (error) throw error;
      setLessonProgress(data || []);
    } catch (err) {
      console.error('Error fetching lesson progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch lesson progress');
    } finally {
      setLoading(false);
    }
  };

  const markLessonAsStarted = async (lessonId: string) => {
    if (!user) return;

    try {
      // Verificar se já existe progresso para esta lição
      const existingProgress = lessonProgress.find(lp => lp.lesson_id === lessonId);
      
      if (existingProgress) {
        return existingProgress;
      }

      const { data, error } = await supabase
        .from('lesson_progress')
        .insert([{
          user_id: user.id,
          lesson_id: lessonId,
          is_completed: false,
          started_at: new Date().toISOString()
        }])
        .select(`
          *,
          lesson:module_lessons(*)
        `)
        .single();

      if (error) throw error;

      // Atualizar a lista local
      setLessonProgress(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error marking lesson as started:', err);
      throw err;
    }
  };

  const markLessonAsCompleted = async (lessonId: string) => {
    if (!user) return;

    try {
      const existingProgress = lessonProgress.find(lp => lp.lesson_id === lessonId);

      if (existingProgress) {
        // Atualizar progresso existente
        const { data, error } = await supabase
          .from('lesson_progress')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id)
          .select(`
            *,
            lesson:module_lessons(*)
          `)
          .single();

        if (error) throw error;

        // Atualizar a lista local
        setLessonProgress(prev => prev.map(lp => 
          lp.id === existingProgress.id ? data : lp
        ));

        return data;
      } else {
        // Criar novo progresso já completado
        const { data, error } = await supabase
          .from('lesson_progress')
          .insert([{
            user_id: user.id,
            lesson_id: lessonId,
            is_completed: true,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          }])
          .select(`
            *,
            lesson:module_lessons(*)
          `)
          .single();

        if (error) throw error;

        // Atualizar a lista local
        setLessonProgress(prev => [...prev, data]);
        return data;
      }
    } catch (err) {
      console.error('Error marking lesson as completed:', err);
      throw err;
    }
  };

  const updateLessonTime = async (lessonId: string, timeSpent: number) => {
    if (!user) return;

    try {
      const existingProgress = lessonProgress.find(lp => lp.lesson_id === lessonId);
      
      if (!existingProgress) {
        // Criar progresso se não existir
        await markLessonAsStarted(lessonId);
        return;
      }

      const newTimeSpent = (existingProgress.time_spent || 0) + timeSpent;

      const { data, error } = await supabase
        .from('lesson_progress')
        .update({
          time_spent: newTimeSpent,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id)
        .select(`
          *,
          lesson:module_lessons(*)
        `)
        .single();

      if (error) throw error;

      // Atualizar a lista local
      setLessonProgress(prev => prev.map(lp => 
        lp.id === existingProgress.id ? data : lp
      ));

      return data;
    } catch (err) {
      console.error('Error updating lesson time:', err);
      throw err;
    }
  };

  const getLessonProgress = (lessonId: string) => {
    return lessonProgress.find(lp => lp.lesson_id === lessonId);
  };

  const isLessonCompleted = (lessonId: string) => {
    const progress = getLessonProgress(lessonId);
    return progress?.is_completed || false;
  };

  const isLessonStarted = (lessonId: string) => {
    const progress = getLessonProgress(lessonId);
    return !!progress;
  };

  const getCompletedLessonsCount = () => {
    return lessonProgress.filter(lp => lp.is_completed).length;
  };

  const getTotalTimeSpent = () => {
    return lessonProgress.reduce((total, lp) => total + (lp.time_spent || 0), 0);
  };

  const getModuleProgress = (moduleId: string) => {
    const moduleProgress = lessonProgress.filter(lp => 
      lp.lesson.module_id === moduleId
    );
    
    const completedLessons = moduleProgress.filter(lp => lp.is_completed).length;
    const totalLessons = moduleProgress.length;
    
    return {
      completed: completedLessons,
      total: totalLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    };
  };

  return {
    lessonProgress,
    loading,
    error,
    markLessonAsStarted,
    markLessonAsCompleted,
    updateLessonTime,
    getLessonProgress,
    isLessonCompleted,
    isLessonStarted,
    getCompletedLessonsCount,
    getTotalTimeSpent,
    getModuleProgress,
    refetch: fetchLessonProgress
  };
};
