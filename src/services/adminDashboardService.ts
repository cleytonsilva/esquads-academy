import { supabase } from '@/integrations/supabase/client';
import { 
  AdminDashboardMetrics, 
  ExecutiveKPIs, 
  SystemAlert, 
  RecentActivity, 
  QuickAction,
  DashboardWidget,
  DashboardLayout
} from '@/types/app';

export interface RealtimeCallbacks {
  onMetricsUpdate?: (metrics: AdminDashboardMetrics) => void;
  onKPIsUpdate?: (kpis: ExecutiveKPIs) => void;
  onAlertsUpdate?: (alerts: SystemAlert[]) => void;
  onActivitiesUpdate?: (activities: RecentActivity[]) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

class AdminDashboardService {
  private realtimeSubscription: any = null;

  /**
   * Buscar métricas do dashboard
   */
  async getMetrics(organizationId?: string): Promise<AdminDashboardMetrics> {
    try {
      // Buscar dados de múltiplas tabelas
      const [
        usersStats,
        coursesStats,
        enrollmentsStats,
        systemStats
      ] = await Promise.all([
        this.getUsersMetrics(organizationId),
        this.getCoursesMetrics(organizationId),
        this.getEnrollmentsMetrics(organizationId),
        this.getSystemMetrics()
      ]);

      return {
        id: 'dashboard-metrics',
        totalUsers: usersStats.total,
        activeUsers: usersStats.active,
        newUsersToday: usersStats.newToday,
        newUsersThisWeek: usersStats.newThisWeek,
        newUsersThisMonth: usersStats.newThisMonth,
        totalCourses: coursesStats.total,
        activeCourses: coursesStats.active,
        coursesPublishedToday: coursesStats.publishedToday,
        coursesPublishedThisWeek: coursesStats.publishedThisWeek,
        coursesPublishedThisMonth: coursesStats.publishedThisMonth,
        totalEnrollments: enrollmentsStats.total,
        activeEnrollments: enrollmentsStats.active,
        completedEnrollments: enrollmentsStats.completed,
        enrollmentsToday: enrollmentsStats.today,
        enrollmentsThisWeek: enrollmentsStats.thisWeek,
        enrollmentsThisMonth: enrollmentsStats.thisMonth,
        systemHealth: systemStats.health,
        serverUptime: systemStats.uptime,
        databaseConnections: systemStats.dbConnections,
        apiResponseTime: systemStats.apiResponseTime,
        errorRate: systemStats.errorRate,
        lastUpdated: new Date(),
        trends: {
          usersGrowth: usersStats.growthRate,
          coursesGrowth: coursesStats.growthRate,
          enrollmentsGrowth: enrollmentsStats.growthRate,
          engagementRate: enrollmentsStats.engagementRate
        }
      };
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      throw new Error('Não foi possível carregar as métricas do dashboard');
    }
  }

  /**
   * Buscar KPIs executivos
   */
  async getKPIs(organizationId?: string): Promise<ExecutiveKPIs> {
    try {
      const [
        revenueData,
        performanceData,
        satisfactionData
      ] = await Promise.all([
        this.getRevenueKPIs(organizationId),
        this.getPerformanceKPIs(organizationId),
        this.getSatisfactionKPIs(organizationId)
      ]);

      return {
        id: 'executive-kpis',
        revenue: {
          total: revenueData.total,
          monthly: revenueData.monthly,
          growth: revenueData.growth,
          target: revenueData.target,
          forecast: revenueData.forecast
        },
        userAcquisition: {
          total: performanceData.userAcquisition.total,
          monthly: performanceData.userAcquisition.monthly,
          cost: performanceData.userAcquisition.cost,
          conversionRate: performanceData.userAcquisition.conversionRate
        },
        courseCompletion: {
          rate: performanceData.courseCompletion.rate,
          average: performanceData.courseCompletion.average,
          trend: performanceData.courseCompletion.trend
        },
        userEngagement: {
          dailyActive: performanceData.userEngagement.dailyActive,
          weeklyActive: performanceData.userEngagement.weeklyActive,
          monthlyActive: performanceData.userEngagement.monthlyActive,
          sessionDuration: performanceData.userEngagement.sessionDuration
        },
        customerSatisfaction: {
          nps: satisfactionData.nps,
          rating: satisfactionData.rating,
          reviews: satisfactionData.reviews,
          complaints: satisfactionData.complaints
        },
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Erro ao buscar KPIs:', error);
      throw new Error('Não foi possível carregar os KPIs executivos');
    }
  }

  /**
   * Buscar alertas do sistema
   */
  async getAlerts(organizationId?: string): Promise<SystemAlert[]> {
    try {
      let query = supabase
        .from('system_alerts')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        source: alert.source,
        timestamp: new Date(alert.created_at),
        acknowledged: alert.acknowledged,
        acknowledgedBy: alert.acknowledged_by,
        acknowledgedAt: alert.acknowledged_at ? new Date(alert.acknowledged_at) : undefined,
        read: alert.read,
        readAt: alert.read_at ? new Date(alert.read_at) : undefined,
        metadata: alert.metadata || {}
      }));
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      throw new Error('Não foi possível carregar os alertas do sistema');
    }
  }

  /**
   * Buscar atividades recentes
   */
  async getRecentActivities(organizationId?: string): Promise<RecentActivity[]> {
    try {
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(activity => ({
        id: activity.id,
        type: activity.type,
        action: activity.action,
        description: activity.description,
        user: activity.user ? {
          id: activity.user.id,
          name: activity.user.full_name,
          avatar: activity.user.avatar_url
        } : undefined,
        timestamp: new Date(activity.created_at),
        metadata: activity.metadata || {}
      }));
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      throw new Error('Não foi possível carregar as atividades recentes');
    }
  }

  /**
   * Buscar ações rápidas
   */
  async getQuickActions(organizationId?: string): Promise<QuickAction[]> {
    try {
      // Retornar ações rápidas padrão (podem ser customizadas por organização)
      return [
        {
          id: 'create-user',
          title: 'Criar Usuário',
          description: 'Adicionar novo usuário ao sistema',
          icon: 'UserPlus',
          action: '/admin/users/new',
          color: 'blue',
          permissions: ['users.create']
        },
        {
          id: 'create-course',
          title: 'Criar Curso',
          description: 'Adicionar novo curso à plataforma',
          icon: 'BookOpen',
          action: '/admin/courses/new',
          color: 'green',
          permissions: ['courses.create']
        },
        {
          id: 'view-reports',
          title: 'Relatórios',
          description: 'Visualizar relatórios detalhados',
          icon: 'BarChart3',
          action: '/admin/reports',
          color: 'purple',
          permissions: ['reports.view']
        },
        {
          id: 'system-settings',
          title: 'Configurações',
          description: 'Gerenciar configurações do sistema',
          icon: 'Settings',
          action: '/admin/settings',
          color: 'gray',
          permissions: ['system.manage']
        },
        {
          id: 'backup-data',
          title: 'Backup',
          description: 'Realizar backup dos dados',
          icon: 'Download',
          action: '/admin/backup',
          color: 'orange',
          permissions: ['system.backup']
        },
        {
          id: 'user-analytics',
          title: 'Analytics',
          description: 'Visualizar analytics de usuários',
          icon: 'TrendingUp',
          action: '/admin/analytics',
          color: 'indigo',
          permissions: ['analytics.view']
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar ações rápidas:', error);
      throw new Error('Não foi possível carregar as ações rápidas');
    }
  }

  /**
   * Buscar widgets do dashboard
   */
  async getWidgets(organizationId?: string): Promise<DashboardWidget[]> {
    try {
      let query = supabase
        .from('dashboard_widgets')
        .select('*')
        .order('order_index');

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(widget => ({
        id: widget.id,
        type: widget.type,
        title: widget.title,
        description: widget.description,
        position: widget.position,
        size: widget.size,
        visible: widget.visible,
        config: widget.config || {},
        data: widget.data || {},
        lastUpdated: new Date(widget.updated_at)
      }));
    } catch (error) {
      console.error('Erro ao buscar widgets:', error);
      // Retornar widgets padrão se não houver configuração personalizada
      return this.getDefaultWidgets();
    }
  }

  /**
   * Buscar layout do dashboard
   */
  async getLayout(organizationId?: string): Promise<DashboardLayout> {
    try {
      let query = supabase
        .from('dashboard_layouts')
        .select('*')
        .eq('active', true)
        .single();

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        layout: data.layout,
        breakpoints: data.breakpoints || {},
        cols: data.cols || { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
        rowHeight: data.row_height || 60,
        margin: data.margin || [10, 10],
        containerPadding: data.container_padding || [10, 10],
        isResizable: data.is_resizable ?? true,
        isDraggable: data.is_draggable ?? true,
        lastUpdated: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Erro ao buscar layout:', error);
      // Retornar layout padrão
      return this.getDefaultLayout();
    }
  }

  /**
   * Gerenciamento de alertas
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_alerts')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao reconhecer alerta:', error);
      throw new Error('Não foi possível reconhecer o alerta');
    }
  }

  async dismissAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_alerts')
        .update({
          active: false,
          dismissed_at: new Date().toISOString(),
          dismissed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao dispensar alerta:', error);
      throw new Error('Não foi possível dispensar o alerta');
    }
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_alerts')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
      throw new Error('Não foi possível marcar o alerta como lido');
    }
  }

  /**
   * Gerenciamento de layout
   */
  async updateLayout(organizationId: string | undefined, layout: DashboardLayout): Promise<void> {
    try {
      const { error } = await supabase
        .from('dashboard_layouts')
        .upsert({
          organization_id: organizationId,
          name: layout.name,
          description: layout.description,
          layout: layout.layout,
          breakpoints: layout.breakpoints,
          cols: layout.cols,
          row_height: layout.rowHeight,
          margin: layout.margin,
          container_padding: layout.containerPadding,
          is_resizable: layout.isResizable,
          is_draggable: layout.isDraggable,
          active: true,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar layout:', error);
      throw new Error('Não foi possível atualizar o layout');
    }
  }

  async getDefaultLayout(): Promise<DashboardLayout> {
    return {
      id: 'default-layout',
      name: 'Layout Padrão',
      description: 'Layout padrão do dashboard administrativo',
      layout: {
        lg: [
          { i: 'metrics', x: 0, y: 0, w: 12, h: 4 },
          { i: 'kpis', x: 0, y: 4, w: 8, h: 6 },
          { i: 'alerts', x: 8, y: 4, w: 4, h: 6 },
          { i: 'activities', x: 0, y: 10, w: 6, h: 8 },
          { i: 'quick-actions', x: 6, y: 10, w: 6, h: 8 }
        ],
        md: [
          { i: 'metrics', x: 0, y: 0, w: 10, h: 4 },
          { i: 'kpis', x: 0, y: 4, w: 6, h: 6 },
          { i: 'alerts', x: 6, y: 4, w: 4, h: 6 },
          { i: 'activities', x: 0, y: 10, w: 5, h: 8 },
          { i: 'quick-actions', x: 5, y: 10, w: 5, h: 8 }
        ],
        sm: [
          { i: 'metrics', x: 0, y: 0, w: 6, h: 4 },
          { i: 'kpis', x: 0, y: 4, w: 6, h: 6 },
          { i: 'alerts', x: 0, y: 10, w: 6, h: 6 },
          { i: 'activities', x: 0, y: 16, w: 6, h: 8 },
          { i: 'quick-actions', x: 0, y: 24, w: 6, h: 8 }
        ]
      },
      breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      rowHeight: 60,
      margin: [10, 10],
      containerPadding: [10, 10],
      isResizable: true,
      isDraggable: true,
      lastUpdated: new Date()
    };
  }

  /**
   * Gerenciamento de widgets
   */
  async toggleWidget(widgetId: string, visible: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('dashboard_widgets')
        .update({ visible })
        .eq('id', widgetId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao alterar widget:', error);
      throw new Error('Não foi possível alterar o widget');
    }
  }

  async reorderWidgets(widgetIds: string[]): Promise<void> {
    try {
      const updates = widgetIds.map((id, index) => ({
        id,
        order_index: index
      }));

      const { error } = await supabase
        .from('dashboard_widgets')
        .upsert(updates);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao reordenar widgets:', error);
      throw new Error('Não foi possível reordenar os widgets');
    }
  }

  /**
   * Export
   */
  async exportMetrics(organizationId: string | undefined, format: 'csv' | 'pdf' | 'excel'): Promise<string> {
    try {
      const response = await fetch('/api/admin/export-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId, format })
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar métricas');
      }

      const result = await response.json();
      return result.downloadUrl;
    } catch (error) {
      console.error('Erro ao exportar métricas:', error);
      throw new Error('Não foi possível exportar as métricas');
    }
  }

  /**
   * Real-time subscriptions
   */
  subscribeToUpdates(organizationId: string | undefined, callbacks: RealtimeCallbacks): any {
    try {
      // Configurar subscription para atualizações em tempo real
      this.realtimeSubscription = supabase
        .channel('admin-dashboard')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'users' 
          }, 
          () => {
            // Atualizar métricas quando usuários mudarem
            this.getMetrics(organizationId).then(callbacks.onMetricsUpdate);
          }
        )
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'system_alerts' 
          }, 
          () => {
            // Atualizar alertas quando houver mudanças
            this.getAlerts(organizationId).then(callbacks.onAlertsUpdate);
          }
        )
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'activity_logs' 
          }, 
          () => {
            // Atualizar atividades quando houver mudanças
            this.getRecentActivities(organizationId).then(callbacks.onActivitiesUpdate);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            callbacks.onConnect?.();
          } else if (status === 'CLOSED') {
            callbacks.onDisconnect?.();
          }
        });

      return {
        unsubscribe: () => {
          if (this.realtimeSubscription) {
            supabase.removeChannel(this.realtimeSubscription);
            this.realtimeSubscription = null;
          }
        }
      };
    } catch (error) {
      console.error('Erro ao configurar real-time:', error);
      callbacks.onError?.(error);
      return { unsubscribe: () => {} };
    }
  }

  // Métodos auxiliares privados
  private async getUsersMetrics(organizationId?: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      { count: total },
      { count: active },
      { count: newToday },
      { count: newThisWeek },
      { count: newThisMonth }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo.toISOString())
    ]);

    return {
      total: total || 0,
      active: active || 0,
      newToday: newToday || 0,
      newThisWeek: newThisWeek || 0,
      newThisMonth: newThisMonth || 0,
      growthRate: total ? ((newThisMonth || 0) / total) * 100 : 0
    };
  }

  private async getCoursesMetrics(organizationId?: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      { count: total },
      { count: active },
      { count: publishedToday },
      { count: publishedThisWeek },
      { count: publishedThisMonth }
    ] = await Promise.all([
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published').gte('published_at', today.toISOString()),
      supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published').gte('published_at', weekAgo.toISOString()),
      supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published').gte('published_at', monthAgo.toISOString())
    ]);

    return {
      total: total || 0,
      active: active || 0,
      publishedToday: publishedToday || 0,
      publishedThisWeek: publishedThisWeek || 0,
      publishedThisMonth: publishedThisMonth || 0,
      growthRate: total ? ((publishedThisMonth || 0) / total) * 100 : 0
    };
  }

  private async getEnrollmentsMetrics(organizationId?: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      { count: total },
      { count: active },
      { count: completed },
      { count: todayCount },
      { count: thisWeek },
      { count: thisMonth }
    ] = await Promise.all([
      supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo.toISOString())
    ]);

    return {
      total: total || 0,
      active: active || 0,
      completed: completed || 0,
      today: todayCount || 0,
      thisWeek: thisWeek || 0,
      thisMonth: thisMonth || 0,
      growthRate: total ? ((thisMonth || 0) / total) * 100 : 0,
      engagementRate: total ? ((active || 0) / total) * 100 : 0
    };
  }

  private async getSystemMetrics() {
    // Simular métricas do sistema (em produção, viria de monitoramento real)
    return {
      health: 'healthy' as const,
      uptime: Date.now() - (24 * 60 * 60 * 1000), // 24 horas
      dbConnections: Math.floor(Math.random() * 50) + 10,
      apiResponseTime: Math.floor(Math.random() * 200) + 50,
      errorRate: Math.random() * 2 // 0-2%
    };
  }

  private async getRevenueKPIs(organizationId?: string) {
    // Simular dados de receita (em produção, viria de sistema de pagamentos)
    return {
      total: 125000,
      monthly: 15000,
      growth: 12.5,
      target: 150000,
      forecast: 140000
    };
  }

  private async getPerformanceKPIs(organizationId?: string) {
    return {
      userAcquisition: {
        total: 1250,
        monthly: 150,
        cost: 25.50,
        conversionRate: 3.2
      },
      courseCompletion: {
        rate: 78.5,
        average: 85.2,
        trend: 'up' as const
      },
      userEngagement: {
        dailyActive: 450,
        weeklyActive: 1200,
        monthlyActive: 2800,
        sessionDuration: 45.5
      }
    };
  }

  private async getSatisfactionKPIs(organizationId?: string) {
    return {
      nps: 72,
      rating: 4.6,
      reviews: 1250,
      complaints: 15
    };
  }

  private getDefaultWidgets(): DashboardWidget[] {
    return [
      {
        id: 'metrics-overview',
        type: 'metrics',
        title: 'Visão Geral das Métricas',
        description: 'Principais métricas do sistema',
        position: { x: 0, y: 0, w: 12, h: 4 },
        size: 'large',
        visible: true,
        config: {},
        data: {},
        lastUpdated: new Date()
      },
      {
        id: 'kpis-executive',
        type: 'kpis',
        title: 'KPIs Executivos',
        description: 'Indicadores chave de performance',
        position: { x: 0, y: 4, w: 8, h: 6 },
        size: 'medium',
        visible: true,
        config: {},
        data: {},
        lastUpdated: new Date()
      },
      {
        id: 'system-alerts',
        type: 'alerts',
        title: 'Alertas do Sistema',
        description: 'Alertas e notificações importantes',
        position: { x: 8, y: 4, w: 4, h: 6 },
        size: 'small',
        visible: true,
        config: {},
        data: {},
        lastUpdated: new Date()
      }
    ];
  }
}

export const adminDashboardService = new AdminDashboardService();