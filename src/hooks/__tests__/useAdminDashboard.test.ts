import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAdminDashboard } from '../useAdminDashboard';
import { adminDashboardService } from '@/services/adminDashboardService';
import { toast } from 'sonner';
import type { SystemAlert } from '@/types/app';

// Mock do serviço
vi.mock('@/services/adminDashboardService', () => ({
  adminDashboardService: {
    getMetrics: vi.fn(),
    getKPIs: vi.fn(),
    getAlerts: vi.fn(),
    getRecentActivities: vi.fn(),
    getQuickActions: vi.fn(),
    getWidgets: vi.fn(),
    getLayout: vi.fn(),
    acknowledgeAlert: vi.fn(),
    dismissAlert: vi.fn(),
    markAlertAsRead: vi.fn(),
    updateLayout: vi.fn(),
    resetLayout: vi.fn(),
    toggleWidget: vi.fn(),
    reorderWidgets: vi.fn(),
    exportMetrics: vi.fn(),
    subscribeToRealtimeUpdates: vi.fn()
  }
}));

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

const mockMetrics = {
  totalUsers: 1250,
  activeUsers: 980,
  totalCourses: 45,
  activeCourses: 38,
  totalEnrollments: 3420,
  completedEnrollments: 2156,
  systemHealth: {
    cpu: 45,
    memory: 62,
    disk: 78,
    network: 92
  },
  userGrowth: 12.5,
  courseCompletionRate: 63.1,
  averageSessionDuration: 28.5,
  serverUptime: 99.8
};

const mockKPIs = {
  revenue: {
    current: 125000,
    previous: 118000,
    growth: 5.9,
    target: 130000
  },
  userAcquisition: {
    current: 245,
    previous: 198,
    growth: 23.7,
    target: 250
  },
  courseCompletion: {
    current: 63.1,
    previous: 58.9,
    growth: 7.1,
    target: 65.0
  },
  userEngagement: {
    current: 78.5,
    previous: 75.2,
    growth: 4.4,
    target: 80.0
  },
  customerSatisfaction: {
    current: 4.6,
    previous: 4.4,
    growth: 4.5,
    target: 4.8
  }
};

const mockAlerts = [
  {
    id: '1',
    type: 'warning' as const,
    title: 'Alto uso de CPU',
    message: 'CPU está em 85% de uso',
    timestamp: '2024-01-15T10:30:00Z',
    isRead: false,
    isAcknowledged: false,
    severity: 'medium' as const
  },
  {
    id: '2',
    type: 'error' as const,
    title: 'Falha no backup',
    message: 'Backup automático falhou',
    timestamp: '2024-01-15T09:15:00Z',
    isRead: false,
    isAcknowledged: false,
    severity: 'high' as const
  }
];

const mockActivities = [
  {
    id: '1',
    type: 'user_created' as const,
    description: 'Novo usuário registrado',
    user: 'João Silva',
    timestamp: '2024-01-15T11:00:00Z',
    metadata: { userId: 'user123' }
  },
  {
    id: '2',
    type: 'course_completed' as const,
    description: 'Curso concluído',
    user: 'Maria Santos',
    timestamp: '2024-01-15T10:45:00Z',
    metadata: { courseId: 'course456' }
  }
];

const mockQuickActions = [
  {
    id: '1',
    title: 'Criar Usuário',
    description: 'Adicionar novo usuário ao sistema',
    icon: 'UserPlus',
    action: 'create_user',
    color: 'blue'
  },
  {
    id: '2',
    title: 'Backup Manual',
    description: 'Executar backup do sistema',
    icon: 'Download',
    action: 'manual_backup',
    color: 'green'
  }
];

const mockWidgets = [
  {
    id: 'metrics',
    title: 'Métricas Gerais',
    type: 'metrics' as const,
    position: { x: 0, y: 0, w: 6, h: 4 },
    isVisible: true,
    config: {}
  },
  {
    id: 'kpis',
    title: 'KPIs Executivos',
    type: 'kpis' as const,
    position: { x: 6, y: 0, w: 6, h: 4 },
    isVisible: true,
    config: {}
  }
];

const mockLayout = {
  id: 'default',
  name: 'Layout Padrão',
  widgets: mockWidgets,
  isDefault: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z'
};

describe('useAdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(adminDashboardService.getMetrics).mockResolvedValue(mockMetrics);
    vi.mocked(adminDashboardService.getKPIs).mockResolvedValue(mockKPIs);
    vi.mocked(adminDashboardService.getAlerts).mockResolvedValue(mockAlerts);
    vi.mocked(adminDashboardService.getRecentActivities).mockResolvedValue(mockActivities);
    vi.mocked(adminDashboardService.getQuickActions).mockResolvedValue(mockQuickActions);
    vi.mocked(adminDashboardService.getWidgets).mockResolvedValue(mockWidgets);
    vi.mocked(adminDashboardService.getLayout).mockResolvedValue(mockLayout);
    vi.mocked(adminDashboardService.subscribeToRealtimeUpdates).mockReturnValue(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Inicialização', () => {
    it('deve carregar dados iniciais corretamente', async () => {
      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.metrics).toEqual(mockMetrics);
      expect(result.current.kpis).toEqual(mockKPIs);
      expect(result.current.alerts).toEqual(mockAlerts);
      expect(result.current.recentActivities).toEqual(mockActivities);
      expect(result.current.quickActions).toEqual(mockQuickActions);
      expect(result.current.widgets).toEqual(mockWidgets);
      expect(result.current.layout).toEqual(mockLayout);
    });

    it('deve limpar recursos ao desmontar', async () => {
      const { result, unmount } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      unmount();

      // Verificar se os recursos foram limpos
      expect(result.current).toBeDefined();
    });
  });

  describe('Atualização de dados', () => {
    it('deve atualizar métricas', async () => {
      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshData();
      });

      expect(adminDashboardService.getMetrics).toHaveBeenCalledTimes(2);
      expect(adminDashboardService.getKPIs).toHaveBeenCalledTimes(2);
      expect(toast.success).toHaveBeenCalledWith('Dados atualizados');
    });

    it('deve atualizar KPIs', async () => {
      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshKPIs();
      });

      expect(adminDashboardService.getKPIs).toHaveBeenCalledTimes(2);
    });

    it('deve atualizar alertas', async () => {
      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshAlerts();
      });

      expect(adminDashboardService.getAlerts).toHaveBeenCalledTimes(2);
    });

    it('deve atualizar atividades', async () => {
      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshActivities();
      });

      expect(adminDashboardService.getRecentActivities).toHaveBeenCalledTimes(2);
    });
  });

  describe('Gerenciamento de alertas', () => {
    it('deve reconhecer alerta', async () => {
      vi.mocked(adminDashboardService.acknowledgeAlert).mockResolvedValue();

      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.acknowledgeAlert('1');
      });

      expect(adminDashboardService.acknowledgeAlert).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Alerta reconhecido');
    });

    it('deve dispensar alerta', async () => {
      vi.mocked(adminDashboardService.dismissAlert).mockResolvedValue();

      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.dismissAlert('1');
      });

      expect(adminDashboardService.dismissAlert).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Alerta dispensado');
    });

    it('deve marcar alerta como lido', async () => {
      vi.mocked(adminDashboardService.markAlertAsRead).mockResolvedValue();

      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markAlertAsRead('1');
      });

      expect(adminDashboardService.markAlertAsRead).toHaveBeenCalledWith('1');
    });

    it('deve marcar todos os alertas como lidos', async () => {
      vi.mocked(adminDashboardService.markAlertAsRead).mockResolvedValue();

      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markAllAlertsAsRead();
      });

      expect(adminDashboardService.markAlertAsRead).toHaveBeenCalledTimes(2);
      expect(toast.success).toHaveBeenCalledWith('Todos os alertas marcados como lidos');
    });
  });

  describe('Gerenciamento de layout', () => {
    it('deve atualizar layout', async () => {
      const updatedLayout = { ...mockLayout, name: 'Layout Atualizado' };
      vi.mocked(adminDashboardService.updateLayout).mockResolvedValue(updatedLayout);

      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateLayout(updatedLayout);
      });

      expect(adminDashboardService.updateLayout).toHaveBeenCalledWith('test-org', updatedLayout);
      expect(result.current.layout).toEqual(updatedLayout);
      expect(toast.success).toHaveBeenCalledWith('Layout atualizado');
    });

    it('deve resetar layout', async () => {
      vi.mocked(adminDashboardService.resetLayout).mockResolvedValue(mockLayout);

      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.resetLayout();
      });

      expect(adminDashboardService.resetLayout).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Layout resetado para o padrão');
    });
  });

  describe('Gerenciamento de widgets', () => {
    it('deve alternar visibilidade do widget', async () => {
      vi.mocked(adminDashboardService.toggleWidget).mockResolvedValue();

      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleWidget('metrics', false);
      });

      expect(adminDashboardService.toggleWidget).toHaveBeenCalledWith('metrics', false);
      expect(toast.success).toHaveBeenCalledWith('Widget atualizado');
    });

    it('deve reordenar widgets', async () => {
      const newOrder = ['kpis', 'metrics'];
      vi.mocked(adminDashboardService.reorderWidgets).mockResolvedValue();

      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.reorderWidgets(newOrder);
      });

      expect(adminDashboardService.reorderWidgets).toHaveBeenCalledWith(newOrder);
      expect(toast.success).toHaveBeenCalledWith('Ordem dos widgets atualizada');
    });
  });

  describe('Exportação de métricas', () => {
    it('deve exportar métricas', async () => {
      const downloadUrl = 'https://example.com/download/metrics.csv';
      vi.mocked(adminDashboardService.exportMetrics).mockResolvedValue(downloadUrl);

      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let exportResult: string;
      await act(async () => {
        exportResult = await result.current.exportMetrics('csv', '2024-01-01', '2024-01-31');
      });

      expect(adminDashboardService.exportMetrics).toHaveBeenCalledWith('test-org', 'csv', '2024-01-01', '2024-01-31');
      expect(toast.success).toHaveBeenCalledWith('Métricas exportadas em CSV');
      expect(exportResult!).toBe(downloadUrl);
    });
  });

  describe('Controle de tempo real', () => {
    it('deve pausar atualizações em tempo real', async () => {
      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.pauseRealtimeUpdates();
      });

      expect(result.current.isRealtimePaused).toBe(true);
    });

    it('deve retomar atualizações em tempo real', async () => {
      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.pauseRealtimeUpdates();
      });

      expect(result.current.isRealtimePaused).toBe(true);

      act(() => {
        result.current.resumeRealtimeUpdates();
      });

      expect(result.current.isRealtimePaused).toBe(false);
    });
  });

  describe('Estados de loading', () => {
    it('deve gerenciar estados de loading corretamente', async () => {
      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      // Estado inicial deve ser loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.isExporting).toBe(false);

      // Aguardar o carregamento inicial
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Contadores de alertas', () => {
    it('deve calcular contadores de alertas corretamente', async () => {
      // Mock alerts data
      const mockAlertsWithDifferentSeverities = [
        { id: '1', severity: 'high', isRead: false } as SystemAlert,
        { id: '2', severity: 'medium', isRead: false } as SystemAlert,
        { id: '3', severity: 'critical', isRead: true } as SystemAlert,
      ];

      vi.mocked(adminDashboardService.getAlerts).mockResolvedValue(mockAlertsWithDifferentSeverities);

      const { result } = renderHook(() => useAdminDashboard({ organizationId: 'test-org' }));

      // Aguardar o carregamento inicial dos alertas
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.unreadAlertsCount).toBe(2);
      expect(result.current.criticalAlertsCount).toBe(2); // high + critical
    });
  });
});