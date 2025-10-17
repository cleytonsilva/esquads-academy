import type { Course, CourseModule, ModuleLesson } from './database';

export type { Course, CourseModule, ModuleLesson };

// Tipos estendidos para funcionalidades específicas
export interface CourseWithModules extends Course {
  modules: CourseModuleWithLessons[];
}

export interface CourseModuleWithLessons extends CourseModule {
  lessons: ModuleLesson[];
}

export interface LessonWithProgress extends ModuleLesson {
  progress?: {
    is_completed: boolean;
    time_spent: number;
    completed_at?: string;
  };
}

export interface CourseProgress {
  course_id: string;
  user_id: string;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  time_spent: number;
  last_accessed_at: string;
}
