// Admin Dashboard Types - Following OpenSpec specifications

export interface AdminDashboardProps {
  organizationId?: string;
  refreshInterval?: number;
  customLayout?: DashboardLayout;
}

export interface DashboardMetrics {
  activeUsers: number;
  coursesCompleted: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  alerts: SystemAlert[];
  kpis: ExecutiveKPIs;
  lastUpdated: Date;
}

export interface ExecutiveKPIs {
  userEngagement: number;
  completionRate: number;
  revenue: number;
  monthlyGrowth: number;
  averageRating: number;
  totalUsers: number;
  totalCourses: number;
  activeInstructors: number;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  metadata?: Record<string, any>;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  refreshInterval: number;
  theme: 'light' | 'dark';
}

export interface DashboardWidget {
  id: string;
  type: 'metrics' | 'kpi' | 'alerts' | 'activity' | 'charts';
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  visible: boolean;
  config?: Record<string, any>;
}

export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'course_published' | 'system_alert' | 'milestone' | 'course_completion';
  message: string;
  timestamp: Date;
  userId?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  color: string;
  permissions?: string[];
}

// User Management Types
export interface UserManagementProps {
  organizationId?: string;
  currentUser: User;
  permissions: Permission[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  department?: Department;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  employeeId?: string;
  phone?: string;
  jobTitle?: string;
  managerId?: string;
  hireDate?: Date;
  metadata?: Record<string, any>;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  children?: Department[];
  managerId?: string;
  userCount: number;
  costCenter?: string;
  location?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isCustom: boolean;
  isSystemRole: boolean;
  organizationId?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface UserGroup {
  id: string;
  name: string;
  description?: string;
  criteria?: Record<string, any>;
  memberCount: number;
  createdBy: string;
  createdAt: Date;
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
  createdAt: Date;
  completedAt?: Date;
}

export interface BulkOperationResult {
  userId: string;
  success: boolean;
  error?: string;
}

// Search and Filter Types
export interface UserSearchFilters {
  search?: string;
  department?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'pending';
  lastLoginBefore?: Date;
  lastLoginAfter?: Date;
  createdBefore?: Date;
  createdAfter?: Date;
}

export interface UserSearchResult {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: UserSearchFilters;
}

// Communication Types
export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'in_app' | 'both';
  variables: string[];
  isActive: boolean;
}

export interface CommunicationMessage {
  id: string;
  recipients: string[];
  subject: string;
  content: string;
  type: 'email' | 'in_app' | 'both';
  status: 'draft' | 'sending' | 'sent' | 'failed';
  scheduledAt?: Date;
  sentAt?: Date;
  createdBy: string;
  createdAt: Date;
}