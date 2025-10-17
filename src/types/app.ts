// User types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'student';
  profile_data: any;
  avatar_url?: string;
  total_points: number;
  current_level: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  interests: string[];
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  learning_goals: string[];
  preferred_duration: 'short' | 'medium' | 'long';
  completed_courses: string[];
  preferred_categories: string[];
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  availability: 'weekdays' | 'weekends' | 'flexible';
  created_at: string;
  updated_at: string;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description?: string;
  instructor_id?: string;
  content_structure: any;
  status: 'draft' | 'published' | 'archived';
  total_points: number;
  estimated_duration?: number;
  difficulty_level: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  content: any;
  is_published: boolean;
  created_at: string;
}

export interface ModuleLesson {
  id: string;
  module_id: string;
  title: string;
  content?: string;
  lesson_type: string;
  order_index: number;
  points_value: number;
  created_at: string;
}

// Gamification types
export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  criteria: any;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points_required: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface UserPoints {
  id: string;
  user_id: string;
  points: number;
  activity_type: string;
  description?: string;
  reference_id?: string;
  earned_at: string;
}

// Mission types
export interface Mission {
  id: string;
  title: string;
  description?: string;
  phases: any;
  total_points: number;
  difficulty: string;
  created_at: string;
}

export interface MissionProgress {
  id: string;
  user_id: string;
  mission_id: string;
  current_phase: number;
  progress_data: any;
  status: string;
  started_at: string;
  completed_at?: string;
  mission?: Mission;
}

// Enrollment types
export interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  progress_percentage: number;
  enrolled_at: string;
  completed_at?: string;
  course?: Course;
}

// Certificate types
export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_url: string;
  issued_at: string;
  course?: Course;
}

// Exam types
export interface Exam {
  id: string;
  title: string;
  description?: string;
  scenarios: any;
  time_limit: number;
  created_at: string;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  responses: any;
  score: number;
  time_taken: number;
  started_at: string;
  completed_at?: string;
  exam?: Exam;
}

// AI Course Creation types
export interface AIGenerationRequest {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  learning_objectives: string[];
  target_audience: string;
  content_type: 'theoretical' | 'practical' | 'mixed';
}

export interface AIGenerationResponse {
  course_structure: {
    title: string;
    description: string;
    modules: {
      title: string;
      description: string;
      lessons: {
        title: string;
        content: string;
        type: string;
        duration: number;
      }[];
    }[];
  };
  estimated_points: number;
  suggested_assessments: any[];
}

// Analytics types
export interface DashboardStats {
  total_users: number;
  total_courses: number;
  active_students: number;
  completion_rate: number;
  total_points_awarded: number;
  monthly_enrollments: number[];
  top_courses: Course[];
  recent_activities: any[];
}

// Admin Dashboard types
export interface AdminDashboardMetrics {
  activeUsers: number;
  coursesCompleted: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  alerts: SystemAlert[];
  kpis: ExecutiveKPIs;
  lastUpdated: string;
}

export interface ExecutiveKPIs {
  userEngagement: number;
  completionRate: number;
  revenue: number;
  growthRate: number;
  averageSessionTime: number;
  monthlyActiveUsers: number;
  courseCompletions: number;
  certificatesIssued: number;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface DashboardWidget {
  id: string;
  type: 'metrics' | 'chart' | 'table' | 'alert';
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: Record<string, any>;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  refreshInterval: number;
}

// User Management types
export interface ExtendedUser extends User {
  department?: Department;
  customRole?: CustomRole;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  employeeId?: string;
  phone?: string;
  jobTitle?: string;
  managerId?: string;
  hireDate?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  costCenter?: string;
  location?: string;
  userCount: number;
  children?: Department[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystemRole: boolean;
  organizationId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface UserGroup {
  id: string;
  name: string;
  description?: string;
  criteria?: Record<string, any>;
  memberCount: number;
  createdBy: string;
  createdAt: string;
}

export interface BulkOperation {
  id: string;
  type: 'role_change' | 'department_move' | 'status_change' | 'delete';
  userIds: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  results?: BulkOperationResult[];
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

export interface BulkOperationResult {
  userId: string;
  success: boolean;
  error?: string;
}

// User Management Forms
export interface UserFormData {
  email: string;
  fullName: string;
  roleId?: string;
  departmentId?: string;
  employeeId?: string;
  phone?: string;
  jobTitle?: string;
  managerId?: string;
  hireDate?: string;
  sendInvitation: boolean;
}

export interface DepartmentFormData {
  name: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  costCenter?: string;
  location?: string;
}

export interface RoleFormData {
  name: string;
  description?: string;
  permissions: string[];
}

// Search and Filter types
export interface UserSearchFilters {
  search?: string;
  department?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'pending';
  lastLoginBefore?: string;
  lastLoginAfter?: string;
  createdBefore?: string;
  createdAfter?: string;
}

export interface UserSearchResult {
  users: ExtendedUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: UserSearchFilters;
}

// Auth types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  roles?: ('admin' | 'student')[];
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  full_name: string;
  role: 'student' | 'admin';
}

export interface CourseForm {
  title: string;
  description: string;
  difficulty_level: string;
  estimated_duration: number;
  thumbnail_url?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Real-time types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface MetricsUpdate {
  activeUsers?: number;
  coursesCompleted?: number;
  systemHealth?: 'healthy' | 'warning' | 'critical';
  newAlerts?: SystemAlert[];
}

// Export types
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  fields: string[];
  filters?: Record<string, any>;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ExportJob {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}
