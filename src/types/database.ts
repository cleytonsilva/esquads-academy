// Tipos auxiliares para facilitar o uso
export type User = Database['public']['Tables']['users']['Row'];
export type UserRole = 'admin' | 'student';
export type LessonProgress = Database['public']['Tables']['lesson_progress']['Row'];
export type ModuleLesson = Database['public']['Tables']['module_lessons']['Row'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type CourseModule = Database['public']['Tables']['course_modules']['Row'];
export type Mission = Database['public']['Tables']['missions']['Row'] & {
  is_daily?: boolean;
  is_weekly?: boolean;
  is_contextual?: boolean;
  is_completed?: boolean;
  is_started?: boolean;
  points_reward?: number;
  type?: 'daily' | 'weekly' | 'achievement' | 'challenge';
  title?: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  target_value?: number;
  duration_days?: number;
  is_active?: boolean;
  is_ai_generated?: boolean;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
};
export type Certificate = Database['public']['Tables']['certificates']['Row'] & {
  verification_code?: string;
  issued_at?: string;
  grade?: number;
  course_title?: string;
  certificate_hash?: string;
  blockchain_verified?: boolean;
  skills_acquired?: string[];
  hours_completed?: number;
  student_name?: string;
  skills_learned?: string[];
  is_verified?: boolean;
  verificationCode?: string;
};
export type Badge = Database['public']['Tables']['badges']['Row'];
export type UserBadge = Database['public']['Tables']['user_badges']['Row'];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email?: string;
          full_name: string;
          role: 'admin' | 'student';
          avatar_url?: string;
          bio?: string;
          user_metadata?: any;
          created_at: string;
          updated_at: string;
          mfa_enabled?: boolean;
          mfa_channel?: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: 'admin' | 'instructor' | 'student';
          avatar_url?: string;
          bio?: string;
          created_at?: string;
          updated_at?: string;
          mfa_enabled?: boolean;
          mfa_channel?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: 'admin' | 'instructor' | 'student';
          avatar_url?: string;
          bio?: string;
          created_at?: string;
          updated_at?: string;
          mfa_enabled?: boolean;
          mfa_channel?: string;
        };
      };
      auth_mfa_otp: {
        Row: {
          id: string;
          user_id: string;
          code_hash: string;
          expires_at: string;
          used_at?: string | null;
          channel: string;
          attempt_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code_hash: string;
          expires_at: string;
          used_at?: string | null;
          channel?: string;
          attempt_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code_hash?: string;
          expires_at?: string;
          used_at?: string | null;
          channel?: string;
          attempt_count?: number;
          created_at?: string;
        };
      };
      user_points: {
        Row: {
          id: string;
          user_id: string;
          total_points: number;
          level: number;
          experience_points: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_points?: number;
          level?: number;
          experience_points?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_points?: number;
          level?: number;
          experience_points?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description?: string;
          thumbnail_url?: string;
          instructor_id: string;
          instructor_name?: string;
          status: 'draft' | 'published' | 'archived';
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          estimated_duration?: number;
          points_reward: number;
          price?: number;
          is_free: boolean;
          tags?: string[];
          progress?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          thumbnail_url?: string;
          instructor_id: string;
          status?: 'draft' | 'published' | 'archived';
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          estimated_duration?: number;
          points_reward?: number;
          price?: number;
          is_free?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          thumbnail_url?: string;
          instructor_id?: string;
          status?: 'draft' | 'published' | 'archived';
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          estimated_duration?: number;
          points_reward?: number;
          price?: number;
          is_free?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      course_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description?: string;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string;
          order_index: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      module_lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          content?: string;
          video_url?: string;
          duration?: number;
          order_index: number;
          points_reward: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          content?: string;
          video_url?: string;
          duration?: number;
          order_index: number;
          points_reward?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          content?: string;
          video_url?: string;
          duration?: number;
          order_index?: number;
          points_reward?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_courses: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrolled_at: string;
          completed_at?: string;
          progress_percentage: number;
          last_accessed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrolled_at?: string;
          completed_at?: string;
          progress_percentage?: number;
          last_accessed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          enrolled_at?: string;
          completed_at?: string;
          progress_percentage?: number;
          last_accessed_at?: string;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed_at: string;
          watch_time: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed_at?: string;
          watch_time?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          completed_at?: string;
          watch_time?: number;
        };
      };
      missions: {
        Row: {
          id: string;
          title: string;
          description?: string;
          icon_url?: string;
          points_reward: number;
          requirements?: any;
          is_daily: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          icon_url?: string;
          points_reward?: number;
          requirements?: any;
          is_daily?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          icon_url?: string;
          points_reward?: number;
          requirements?: any;
          is_daily?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
      };
      mission_progress: {
        Row: {
          id: string;
          user_id: string;
          mission_id: string;
          status: 'active' | 'completed' | 'locked';
          progress: number;
          completed_at?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mission_id: string;
          status?: 'active' | 'completed' | 'locked';
          progress?: number;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mission_id?: string;
          status?: 'active' | 'completed' | 'locked';
          progress?: number;
          completed_at?: string;
          created_at?: string;
        };
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          certificate_url?: string;
          issued_at: string;
          verification_code?: string;
          grade?: number;
          course_title?: string;
          certificate_hash?: string;
          blockchain_verified?: boolean;
          skills_acquired?: string[];
          hours_completed?: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          certificate_url?: string;
          issued_at?: string;
          verification_code?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          certificate_url?: string;
          issued_at?: string;
          verification_code?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description?: string;
          icon_url?: string;
          points_required: number;
          color: string;
          course_id?: string;
          category?: string;
          share_text?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          icon_url?: string;
          points_required?: number;
          color?: string;
          course_id?: string;
          category?: string;
          share_text?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon_url?: string;
          points_required?: number;
          color?: string;
          course_id?: string;
          category?: string;
          share_text?: string;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          key: string;
          name: string;
          description?: string;
          points: number;
          icon_url?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          description?: string;
          points?: number;
          icon_url?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          name?: string;
          description?: string;
          points?: number;
          icon_url?: string;
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          earned_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'instructor' | 'student';
      course_status: 'draft' | 'published' | 'archived';
      difficulty_level: 'beginner' | 'intermediate' | 'advanced';
      mission_status: 'active' | 'completed' | 'locked';
    };
  };
}

// Tipos para Admin Dashboard
export interface AdminDashboardMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_type: 'count' | 'percentage' | 'currency' | 'time';
  category: 'users' | 'courses' | 'system' | 'revenue';
  recorded_at: string;
  metadata: Record<string, any>;
}

export interface AdminKPI {
  id: string;
  kpi_name: string;
  current_value: number;
  target_value?: number;
  previous_value?: number;
  period_type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  period_start: string;
  period_end: string;
  trend_direction?: 'up' | 'down' | 'stable';
  created_at: string;
  updated_at: string;
}

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  alert_type: 'info' | 'warning' | 'error' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SystemActivity {
  id: string;
  user_id?: string;
  activity_type: string;
  activity_description: string;
  entity_type?: string;
  entity_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Tipos para User Management
export interface Department {
  id: string;
  name: string;
  description?: string;
  parent_department_id?: string;
  manager_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  is_system_role: boolean;
  is_custom: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  category: string;
  created_at: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  action: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface UserGroup {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserGroupMember {
  id: string;
  user_id: string;
  group_id: string;
  added_by?: string;
  added_at: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  template_type: 'email' | 'sms' | 'push';
  variables: string[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Extensão do tipo User para incluir campos administrativos
export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'instructor' | 'student';
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  // Novos campos administrativos
  department_id?: string;
  role_id?: string;
  phone?: string;
  location?: string;
  hire_date?: string;
  last_login?: string;
  is_active: boolean;
  custom_permissions: string[];
  // Relacionamentos
  department?: Department;
  user_role?: Role;
}
