// Esquads Academy - Hook para Gestão de Cursos

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Course, CourseModule, ModuleLesson } from '@/types/course';

interface UseCoursesReturn {
  courses: Course[];
  loading: boolean;
  error: string | null;
  createCourse: (courseData: Partial<Course>) => Promise<Course>;
  updateCourse: (id: string, courseData: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  getCourse: (id: string) => Promise<Course>;
  publishCourse: (id: string) => Promise<void>;
  unpublishCourse: (id: string) => Promise<void>;
  refreshCourses: () => Promise<void>;
}

export const useCourses = (instructorId?: string): UseCoursesReturn => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('courses')
        .select(`
          *,
          course_modules (
            id,
            title,
            order_index,
            module_lessons (
              id,
              title,
              order_index
            )
          ),
          user_courses (
            id,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      // Se instructorId for fornecido, filtrar apenas cursos do instrutor
      if (instructorId) {
        query = query.eq('instructor_id', instructorId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setCourses(data || []);
    } catch (err) {
      console.error('Erro ao buscar cursos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar cursos');
    } finally {
      setLoading(false);
    }
  };

  const getCourse = async (id: string): Promise<Course> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_modules (
            id,
            title,
            description,
            order_index,
            module_lessons (
              id,
              title,
              description,
              content_type,
              content_url,
              duration,
              order_index,
              is_free
            )
          ),
          user_courses (
            id,
            user_id,
            enrolled_at,
            progress_percentage,
            completed_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Curso não encontrado');

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar curso';
      setError(message);
      throw new Error(message);
    }
  };

  const createCourse = async (courseData: Partial<Course>): Promise<Course> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('courses')
        .insert([{
          ...courseData,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setCourses(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar curso';
      setError(message);
      throw new Error(message);
    }
  };

  const updateCourse = async (id: string, courseData: Partial<Course>): Promise<void> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('courses')
        .update({
          ...courseData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setCourses(prev => 
        prev.map(course => 
          course.id === id 
            ? { ...course, ...courseData, updated_at: new Date().toISOString() }
            : course
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar curso';
      setError(message);
      throw new Error(message);
    }
  };

  const deleteCourse = async (id: string): Promise<void> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCourses(prev => prev.filter(course => course.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir curso';
      setError(message);
      throw new Error(message);
    }
  };

  const publishCourse = async (id: string): Promise<void> => {
    await updateCourse(id, { status: 'published' });
  };

  const unpublishCourse = async (id: string): Promise<void> => {
    await updateCourse(id, { status: 'draft' });
  };

  const refreshCourses = async (): Promise<void> => {
    await fetchCourses();
  };

  useEffect(() => {
    fetchCourses();
  }, [instructorId]);

  return {
    courses,
    loading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourse,
    publishCourse,
    unpublishCourse,
    refreshCourses
  };
};
