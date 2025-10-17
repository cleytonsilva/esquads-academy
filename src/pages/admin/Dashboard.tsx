// Esquads Academy - Dashboard do Administrador

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/constants';
import { formatPercentage, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign,
  Award,
  Target,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  UserPlus,
  BookPlus,
  RefreshCw,
  Layout,
  Star,
  Settings,
  Plus
} from 'lucide-react';
import { MetricsPanel } from '@/components/admin/MetricsPanel';
import { KPIOverview } from '@/components/admin/KPIOverview';
import { SystemAlerts } from '@/components/admin/SystemAlerts';
import { QuickActions } from '@/components/admin/QuickActions';
import { RealtimeIndicator, OnlineUsersIndicator } from '@/components/admin/RealtimeIndicator';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { DashboardMetrics, ExecutiveKPIs, SystemAlert, AdminDashboardProps } from '@/types/admin';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Hook para atualizações em tempo real
  const {
    isConnected,
    connectionStatus,
    metrics: realtimeMetrics,
    alerts: realtimeAlerts,
    activities: realtimeActivities,
    users: realtimeUsers,
    onlineUsers,
    refreshData,
    markAlertAsRead,
    dismissAlert
  } = useRealtimeUpdates();

  // Mock data - In real app, this would come from API
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalCourses: 89,
    totalRevenue: 125430,
    activeUsers: 892,
    newUsersToday: 23,
    coursesPublishedToday: 3,
    totalInstructors: 45,
    totalStudents: 1202,
    completionRate: 87,
    averageRating: 4.6
  });

  // Mock data for new components
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    activeUsers: 892,
    coursesCompleted: 1456,
    systemHealth: 'healthy',
    alerts: [
      {
        id: '1',
        type: 'warning',
        title: 'Alto uso de CPU',
        message: 'O servidor está com 85% de uso de CPU',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        acknowledged: false
      },
      {
        id: '2',
        type: 'info',
        title: 'Backup concluído',
        message: 'Backup diário executado com sucesso',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acknowledged: true,
        acknowledgedBy: 'Admin',
        acknowledgedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ],
    kpis: {
      userEngagement: 78.5,
      completionRate: 82.3,
      revenue: 89750,
      monthlyGrowth: 15.2,
      averageRating: 4.6,
      totalUsers: 1234,
      totalCourses: 56,
      activeInstructors: 23
    },
    lastUpdated: new Date()
  });

  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'critical',
      title: 'Falha no sistema de pagamento',
      message: 'O gateway de pagamento está indisponível. Transações podem falhar.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      acknowledged: false,
      metadata: { service: 'payment-gateway', error_code: 'PG_001' }
    },
    {
      id: '2',
      type: 'warning',
      title: 'Alto uso de CPU',
      message: 'O servidor principal está com 85% de uso de CPU',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      acknowledged: false,
      metadata: { server: 'main-server', cpu_usage: 85 }
    },
    {
      id: '3',
      type: 'info',
      title: 'Backup concluído',
      message: 'Backup diário executado com sucesso às 02:00',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      acknowledged: true,
      acknowledgedBy: 'Sistema',
      acknowledgedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      metadata: { backup_size: '2.5GB', duration: '45min' }
    },
    {
      id: '4',
      type: 'warning',
      title: 'Limite de usuários próximo',
      message: 'Plano atual suporta até 1500 usuários. Atualmente: 1234',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      acknowledged: false,
      metadata: { current_users: 1234, limit: 1500 }
    }
  ]);

  const handleRefreshMetrics = async () => {
    setIsLoading(true);
    try {
      await refreshData();
      setDashboardMetrics({
        ...dashboardMetrics,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    await markAlertAsRead(alertId);
    setSystemAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            acknowledged: true, 
            acknowledgedBy: 'Admin',
            acknowledgedAt: new Date()
          }
        : alert
    ));
  };

  const handleDismissAlert = async (alertId: string) => {
    await dismissAlert(alertId);
    setSystemAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleDeleteAlert = async (alertId: string) => {
    await dismissAlert(alertId);
    setSystemAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'user_registration',
      message: 'Novo usuário registrado: João Silva',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      icon: UserPlus,
      color: 'green'
    },
    {
      id: 2,
      type: 'course_published',
      message: 'Curso "React Avançado" foi publicado',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      icon: BookPlus,
      color: 'blue'
    },
    {
      id: 3,
      type: 'system_alert',
      message: 'Uso de storage em 75%',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      icon: AlertTriangle,
      color: 'yellow'
    },
    {
      id: 4,
      type: 'milestone',
      message: '1000+ usuários registrados!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      icon: Award,
      color: 'purple'
    }
  ]);

  const [topCourses, setTopCourses] = useState([
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      instructor: 'Maria Santos',
      students: 234,
      rating: 4.8,
      revenue: 15600
    },
    {
      id: 2,
      title: 'React para Iniciantes',
      instructor: 'Pedro Lima',
      students: 189,
      rating: 4.7,
      revenue: 12350
    },
    {
      id: 3,
      title: 'Node.js Backend',
      instructor: 'Ana Costa',
      students: 156,
      rating: 4.9,
      revenue: 10920
    }
  ]);

  const getActivityIcon = (activity: any) => {
    const Icon = activity.icon;
    const colorClasses = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600'
    };
    
    return (
      <div className={`p-2 rounded-lg ${colorClasses[activity.color as keyof typeof colorClasses]}`}>
        <Icon className="w-4 h-4" />
      </div>
    );
  };

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) {
      return `${minutes} min atrás`;
    } else {
      return `${hours}h atrás`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com indicadores de tempo real */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {user?.name || 'Administrador'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Indicadores de tempo real */}
          <div className="flex items-center gap-4">
            <RealtimeIndicator
              isConnected={isConnected}
              connectionStatus={connectionStatus}
              lastUpdate={realtimeMetrics[0]?.recorded_at}
            />
            
            <OnlineUsersIndicator
              onlineUsers={onlineUsers}
              totalUsers={realtimeUsers.length}
            />
          </div>

          <Button variant="outline" size="sm" onClick={handleRefreshMetrics}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button asChild>
            <Link to="/admin/users/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/courses/new">
              <BookPlus className="mr-2 h-4 w-4" />
              Novo Curso
            </Link>
          </Button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="metrics">
            Métricas
            {realtimeMetrics.length > 0 && (
              <span className="ml-2 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas
            {realtimeAlerts.filter(alert => !alert.is_acknowledged).length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {realtimeAlerts.filter(alert => !alert.is_acknowledged).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="actions">Ações Rápidas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  Painel Administrativo 🛡️
                </h1>
                <p className="text-red-100 mt-1">
                  Monitore e gerencie toda a plataforma Esquads Academy
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.activeUsers}</div>
                <div className="text-red-100">usuários ativos</div>
              </div>
            </div>
          </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">+{stats.newUsersToday} hoje</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Cursos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              <p className="text-xs text-green-600 mt-1">+{stats.coursesPublishedToday} hoje</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">R$ {stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">+12% este mês</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              <p className="text-xs text-green-600 mt-1">+3% este mês</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Instrutores</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalInstructors}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estudantes</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
              <p className="text-xl font-bold text-gray-900">{stats.averageRating}/5</p>
            </div>
            <Award className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Courses */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Cursos Mais Populares</h2>
                <Link 
                  to={ROUTES.ADMIN_COURSES}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Ver todos
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topCourses.map((course, index) => (
                  <div key={course.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600">por {course.instructor}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{course.students} estudantes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4" />
                          <span>{course.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>R$ {course.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`${ROUTES.ADMIN_COURSES}/${course.id}`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Atividade Recente</h2>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    {getActivityIcon(activity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ações Rápidas</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to={ROUTES.ADMIN_USERS}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <span className="font-medium text-gray-900">Gerenciar Usuários</span>
            </Link>
            
            <Link
              to={ROUTES.ADMIN_COURSES}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="w-6 h-6 text-green-600 mr-3" />
              <span className="font-medium text-gray-900">Gerenciar Cursos</span>
            </Link>
            
            <Link
              to={ROUTES.ADMIN_ANALYTICS}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="w-6 h-6 text-purple-600 mr-3" />
              <span className="font-medium text-gray-900">Ver Analytics</span>
            </Link>
            
            <Link
              to={ROUTES.ADMIN_SETTINGS}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Activity className="w-6 h-6 text-orange-600 mr-3" />
              <span className="font-medium text-gray-900">Configurações</span>
            </Link>
          </div>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="metrics">
          <MetricsPanel
            metrics={dashboardMetrics}
            isLoading={isLoading}
            onRefresh={handleRefreshMetrics}
            refreshInterval={30000}
            showDetailed={true}
          />
        </TabsContent>

        <TabsContent value="kpis">
          <KPIOverview
            kpis={dashboardMetrics.kpis}
            isLoading={isLoading}
            timeframe="monthly"
            showDetailed={true}
          />
        </TabsContent>

        <TabsContent value="alerts">
          <SystemAlerts
            alerts={realtimeAlerts}
            isLoading={isLoading}
            onAcknowledge={handleAcknowledgeAlert}
            onDismiss={handleDismissAlert}
            onDelete={handleDeleteAlert}
            onRefresh={() => {
              // Simulate refresh alerts
              console.log('Refreshing alerts...');
            }}
            showFilters={true}
          />
        </TabsContent>

        <TabsContent value="actions">
          <QuickActions
            userPermissions={[
              'users.create',
              'users.read',
              'courses.create',
              'analytics.read',
              'system.configure',
              'reports.create',
              'gamification.manage',
              'communication.send',
              'data.export',
              'data.import',
              'system.maintain',
              'ai.insights'
            ]}
          />
        </TabsContent>
      </Tabs>

      {/* Atividades recentes em tempo real */}
      {realtimeActivities.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>
          <div className="space-y-2">
            {realtimeActivities.slice(0, 5).map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">{activity.activity_description}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(activity.created_at).toLocaleTimeString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
