import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AdminDashboardMetrics, 
  ExecutiveKPIs, 
  SystemAlert, 
  RecentActivity, 
  QuickAction,
  DashboardWidget,
  DashboardLayout
} from '@/types/app';
import { adminDashboardService } from '@/services/adminDashboardService';
import { toast } from 'sonner';

export interface UseAdminDashboardOptions {
  organizationId?: string;
  refreshInterval?: number; // in milliseconds
  enableRealtime?: boolean;
}

export interface UseAdminDashboardReturn {
  // Data
  metrics: AdminDashboardMetrics | null;
  kpis: ExecutiveKPIs | null;
  alerts: SystemAlert[];
  recentActivities: RecentActivity[];
  quickActions: QuickAction[];
  widgets: DashboardWidget[];
  layout: DashboardLayout | null;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isUpdatingLayout: boolean;
  isExporting: boolean;
  
  // Real-time status
  isConnected: boolean;
  isRealtimeConnected: boolean;
  isRealtimePaused: boolean;
  lastUpdated: Date | null;
  
  // Alert counters
  unreadAlertsCount: number;
  criticalAlertsCount: number;
  
  // Operations
  refreshMetrics: () => Promise<void>;
  refreshKPIs: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
  refreshActivities: () => Promise<void>;
  refreshAll: () => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Alert management
  acknowledgeAlert: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  markAllAlertsAsRead: () => Promise<void>;
  
  // Layout management
  updateLayout: (layout: DashboardLayout) => Promise<void>;
  resetLayout: () => Promise<void>;
  
  // Widget management
  toggleWidget: (widgetId: string, visible: boolean) => Promise<void>;
  reorderWidgets: (widgetIds: string[]) => Promise<void>;
  
  // Export
  exportMetrics: (format: 'csv' | 'pdf' | 'excel', startDate?: string, endDate?: string) => Promise<string>;
  
  // Real-time controls
  startRealtime: () => void;
  stopRealtime: () => void;
  pauseRealtimeUpdates: () => void;
  resumeRealtimeUpdates: () => void;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export function useAdminDashboard(options: UseAdminDashboardOptions = {}): UseAdminDashboardReturn {
  const { 
    organizationId, 
    refreshInterval = 30000, // 30 seconds
    enableRealtime = true 
  } = options;
  
  // State
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [kpis, setKPIs] = useState<ExecutiveKPIs | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [layout, setLayout] = useState<DashboardLayout | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingLayout, setIsUpdatingLayout] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Real-time status
  const [isConnected, setIsConnected] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [isRealtimePaused, setIsRealtimePaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  
  // Computed values
  const unreadAlertsCount = alerts.filter(alert => !alert.isRead).length;
  const criticalAlertsCount = alerts.filter(alert => alert.severity === 'high' || alert.severity === 'critical').length;
  
  // Refs for intervals and cleanup
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeConnectionRef = useRef<any>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    
    // Cleanup on unmount
    return () => {
      stopRealtime();
    };
  }, [organizationId]);

  // Setup real-time updates
  useEffect(() => {
    if (enableRealtime) {
      startRealtime();
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [enableRealtime, refreshInterval]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [
        metricsData,
        kpisData,
        alertsData,
        activitiesData,
        actionsData,
        widgetsData,
        layoutData
      ] = await Promise.all([
        adminDashboardService.getMetrics(organizationId),
        adminDashboardService.getKPIs(organizationId),
        adminDashboardService.getAlerts(organizationId),
        adminDashboardService.getRecentActivities(organizationId),
        adminDashboardService.getQuickActions(organizationId),
        adminDashboardService.getWidgets(organizationId),
        adminDashboardService.getLayout(organizationId)
      ]);
      
      setMetrics(metricsData);
      setKPIs(kpisData);
      setAlerts(alertsData);
      setRecentActivities(activitiesData);
      setQuickActions(actionsData);
      setWidgets(widgetsData);
      setLayout(layoutData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Erro ao carregar dados do dashboard');
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMetrics = useCallback(async () => {
    try {
      const metricsData = await adminDashboardService.getMetrics(organizationId);
      setMetrics(metricsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing metrics:', error);
      toast.error('Erro ao atualizar métricas');
    }
  }, [organizationId]);

  const refreshKPIs = useCallback(async () => {
    try {
      const kpisData = await adminDashboardService.getKPIs(organizationId);
      setKPIs(kpisData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing KPIs:', error);
      toast.error('Erro ao atualizar KPIs');
    }
  }, [organizationId]);

  const refreshAlerts = useCallback(async () => {
    try {
      const alertsData = await adminDashboardService.getAlerts(organizationId);
      setAlerts(alertsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing alerts:', error);
      toast.error('Erro ao atualizar alertas');
    }
  }, [organizationId]);

  const refreshActivities = useCallback(async () => {
    try {
      const activitiesData = await adminDashboardService.getRecentActivities(organizationId);
      setRecentActivities(activitiesData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing activities:', error);
      toast.error('Erro ao atualizar atividades');
    }
  }, [organizationId]);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshMetrics(),
        refreshKPIs(),
        refreshAlerts(),
        refreshActivities()
      ]);
      toast.success('Dados atualizados');
    } catch (error) {
      console.error('Error refreshing all data:', error);
      toast.error('Erro ao atualizar dados');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshMetrics, refreshKPIs, refreshAlerts, refreshActivities]);

  const refreshData = refreshAll;

  // Alert management
  const acknowledgeAlert = async (alertId: string): Promise<void> => {
    try {
      await adminDashboardService.acknowledgeAlert(alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true, acknowledgedAt: new Date() }
          : alert
      ));
      toast.success('Alerta reconhecido');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Erro ao reconhecer alerta');
    }
  };

  const dismissAlert = async (alertId: string): Promise<void> => {
    try {
      await adminDashboardService.dismissAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast.success('Alerta dispensado');
    } catch (error) {
      console.error('Error dismissing alert:', error);
      toast.error('Erro ao dispensar alerta');
    }
  };

  const markAlertAsRead = async (alertId: string): Promise<void> => {
    try {
      await adminDashboardService.markAlertAsRead(alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, isRead: true }
          : alert
      ));
      toast.success('Alerta marcado como lido');
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast.error('Erro ao marcar alerta como lido');
    }
  };

  const markAllAlertsAsRead = async (): Promise<void> => {
    try {
      const unreadAlerts = alerts.filter(alert => !alert.isRead);
      await Promise.all(unreadAlerts.map(alert => adminDashboardService.markAlertAsRead(alert.id)));
      setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
      toast.success('Todos os alertas marcados como lidos');
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
      toast.error('Erro ao marcar todos os alertas como lidos');
    }
  };

  // Layout management
  const updateLayout = async (newLayout: DashboardLayout): Promise<void> => {
    setIsUpdatingLayout(true);
    try {
      await adminDashboardService.updateLayout(organizationId, newLayout);
      setLayout(newLayout);
      toast.success('Layout atualizado');
    } catch (error) {
      console.error('Error updating layout:', error);
      toast.error('Erro ao atualizar layout');
    } finally {
      setIsUpdatingLayout(false);
    }
  };

  const resetLayout = async (): Promise<void> => {
    setIsUpdatingLayout(true);
    try {
      const defaultLayout = await adminDashboardService.getDefaultLayout();
      await adminDashboardService.updateLayout(organizationId, defaultLayout);
      setLayout(defaultLayout);
      toast.success('Layout resetado para padrão');
    } catch (error) {
      console.error('Error resetting layout:', error);
      toast.error('Erro ao resetar layout');
    } finally {
      setIsUpdatingLayout(false);
    }
  };

  // Widget management
  const toggleWidget = async (widgetId: string, visible: boolean): Promise<void> => {
    try {
      await adminDashboardService.toggleWidget(widgetId, visible);
      setWidgets(prev => prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, visible }
          : widget
      ));
      toast.success(`Widget ${visible ? 'exibido' : 'ocultado'}`);
    } catch (error) {
      console.error('Error toggling widget:', error);
      toast.error('Erro ao alterar widget');
    }
  };

  const reorderWidgets = async (widgetIds: string[]): Promise<void> => {
    try {
      await adminDashboardService.reorderWidgets(widgetIds);
      setWidgets(prev => {
        const reordered = [...prev];
        reordered.sort((a, b) => widgetIds.indexOf(a.id) - widgetIds.indexOf(b.id));
        return reordered;
      });
    } catch (error) {
      console.error('Error reordering widgets:', error);
      toast.error('Erro ao reordenar widgets');
    }
  };

  // Export
  const exportMetrics = async (
    format: 'csv' | 'pdf' | 'excel',
    startDate?: string,
    endDate?: string
  ): Promise<string> => {
    setIsExporting(true);
    try {
      const downloadUrl = await adminDashboardService.exportMetrics(organizationId, format, startDate, endDate);
      toast.success(`Métricas exportadas em ${format.toUpperCase()}`);
      return downloadUrl;
    } catch (error) {
      console.error('Error exporting metrics:', error);
      toast.error('Erro ao exportar métricas');
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  // Real-time controls
  const startRealtime = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    // Setup periodic refresh
    refreshIntervalRef.current = setInterval(() => {
      if (!isRealtimePaused) {
        refreshAll();
      }
    }, refreshInterval);
    
    // Setup WebSocket connection for real-time updates
    try {
      realtimeConnectionRef.current = adminDashboardService.subscribeToUpdates(
        organizationId,
        {
          onMetricsUpdate: (newMetrics) => {
            if (!isRealtimePaused) {
              setMetrics(newMetrics);
              setLastUpdated(new Date());
            }
          },
          onKPIsUpdate: (newKPIs) => {
            if (!isRealtimePaused) {
              setKPIs(newKPIs);
              setLastUpdated(new Date());
            }
          },
          onAlertsUpdate: (newAlerts) => {
            if (!isRealtimePaused) {
              setAlerts(newAlerts);
              setLastUpdated(new Date());
            }
          },
          onActivitiesUpdate: (newActivities) => {
            if (!isRealtimePaused) {
              setRecentActivities(newActivities);
              setLastUpdated(new Date());
            }
          },
          onConnect: () => {
            setIsConnected(true);
            setIsRealtimeConnected(true);
            console.log('Real-time connection established');
          },
          onDisconnect: () => {
            setIsConnected(false);
            setIsRealtimeConnected(false);
            console.log('Real-time connection lost');
          },
          onError: (error) => {
            console.error('Real-time connection error:', error);
            setIsConnected(false);
            setIsRealtimeConnected(false);
          }
        }
      );
    } catch (error) {
      console.error('Error starting real-time connection:', error);
    }
  }, [organizationId, refreshInterval, refreshAll, isRealtimePaused]);

  const stopRealtime = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    if (realtimeConnectionRef.current) {
      realtimeConnectionRef.current.unsubscribe();
      realtimeConnectionRef.current = null;
    }
    
    setIsConnected(false);
    setIsRealtimeConnected(false);
    setIsRealtimePaused(false);
  }, []);

  const pauseRealtimeUpdates = useCallback(() => {
    setIsRealtimePaused(true);
    toast.info('Atualizações em tempo real pausadas');
  }, []);

  const resumeRealtimeUpdates = useCallback(() => {
    setIsRealtimePaused(false);
    toast.success('Atualizações em tempo real retomadas');
  }, []);

  // Error handling
  const clearError = () => {
    setError(null);
  };

  return {
    // Data
    metrics,
    kpis,
    alerts,
    recentActivities,
    quickActions,
    widgets,
    layout,
    
    // Loading states
    isLoading,
    isRefreshing,
    isUpdatingLayout,
    isExporting,
    
    // Real-time status
    isConnected,
    isRealtimeConnected,
    isRealtimePaused,
    lastUpdated,
    
    // Alert counters
    unreadAlertsCount,
    criticalAlertsCount,
    

    
    // Operations
    refreshMetrics,
    refreshKPIs,
    refreshAlerts,
    refreshActivities,
    refreshAll,
    refreshData,
    
    // Alert management
    acknowledgeAlert,
    dismissAlert,
    markAlertAsRead,
    markAllAlertsAsRead,
    
    // Layout management
    updateLayout,
    resetLayout,
    
    // Widget management
    toggleWidget,
    reorderWidgets,
    
    // Export
    exportMetrics,
    
    // Real-time controls
    startRealtime,
    stopRealtime,
    pauseRealtimeUpdates,
    resumeRealtimeUpdates,
    
    // Error handling
    error,
    clearError
  };
}