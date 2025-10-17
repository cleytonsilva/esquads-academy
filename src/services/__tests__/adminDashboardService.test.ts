import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { adminDashboardService } from '../adminDashboardService';
import { supabase } from '@/integrations/supabase/client';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

// Mock dos dados de resposta
const mockMetrics = {
  activeUsers: 1250,
  totalUsers: 5000,
  coursesCompleted: 342,
  totalCourses: 45,
  systemHealth: 'healthy',
  alerts: 3,
  userGrowth: 12.5,
  courseCompletionRate: 78.3,
  averageSessionTime: 45,
  serverUptime: 99.9
};

const mockKPIs = {
  userEngagement: 0.75,
  completionRate: 0.82,
  revenue: 125000,
  monthlyGrowth: 0.15,
  averageRating: 4.2,
  totalUsers: 5000,
  totalCourses: 45,
  activeInstructors: 25
};

const mockAlerts = [
  {
    id: '1',
    title: 'Sistema de Backup Falhou',
    message: 'O backup automático não foi executado na última tentativa',
    type: 'error',
    priority: 'high',
    isRead: false,
    isResolved: false,
    source: 'system',
    userId: 'system',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

const mockActivities = [
  {
    id: '1',
    type: 'user_login',
    description: 'Usuário João Silva fez login',
    userId: 'user-1',
    userName: 'João Silva',
    timestamp: '2024-01-15T10:00:00Z',
    metadata: {}
  }
];

describe('adminDashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDashboardMetrics', () => {
    it('deve retornar métricas do dashboard com sucesso', async () => {
      const mockSupabaseResponse = {
        data: mockMetrics,
        error: null
      };

      (supabase.rpc as any).mockResolvedValue(mockSupabaseResponse);

      const result = await adminDashboardService.getDashboardMetrics();

      expect(result).toEqual({
        success: true,
        data: mockMetrics
      });
      expect(supabase.rpc).toHaveBeenCalledWith('get_dashboard_metrics');
    });

    it('deve retornar erro quando falha ao buscar métricas', async () => {
      const mockError = { message: 'Database connection failed' };
      const mockSupabaseResponse = {
        data: null,
        error: mockError
      };

      (supabase.rpc as any).mockResolvedValue(mockSupabaseResponse);

      const result = await adminDashboardService.getDashboardMetrics();

      expect(result).toEqual({
        success: false,
        error: 'Database connection failed'
      });
    });

    it('deve retornar erro genérico quando não há mensagem de erro', async () => {
      const mockSupabaseResponse = {
        data: null,
        error: {}
      };

      (supabase.rpc as any).mockResolvedValue(mockSupabaseResponse);

      const result = await adminDashboardService.getDashboardMetrics();

      expect(result).toEqual({
        success: false,
        error: 'Erro ao buscar métricas do dashboard'
      });
    });

    it('deve capturar exceções e retornar erro', async () => {
      (supabase.rpc as any).mockRejectedValue(new Error('Network error'));

      const result = await adminDashboardService.getDashboardMetrics();

      expect(result).toEqual({
        success: false,
        error: 'Network error'
      });
    });
  });

  describe('getExecutiveKPIs', () => {
    it('deve retornar KPIs executivos com sucesso', async () => {
      const mockSupabaseResponse = {
        data: mockKPIs,
        error: null
      };

      (supabase.rpc as any).mockResolvedValue(mockSupabaseResponse);

      const result = await adminDashboardService.getExecutiveKPIs('monthly');

      expect(result).toEqual({
        success: true,
        data: mockKPIs
      });
      expect(supabase.rpc).toHaveBeenCalledWith('get_executive_kpis', {
        timeframe: 'monthly'
      });
    });

    it('deve usar timeframe padrão quando não especificado', async () => {
      const mockSupabaseResponse = {
        data: mockKPIs,
        error: null
      };

      (supabase.rpc as any).mockResolvedValue(mockSupabaseResponse);

      await adminDashboardService.getExecutiveKPIs();

      expect(supabase.rpc).toHaveBeenCalledWith('get_executive_kpis', {
        timeframe: 'monthly'
      });
    });

    it('deve retornar erro quando falha ao buscar KPIs', async () => {
      const mockError = { message: 'Access denied' };
      const mockSupabaseResponse = {
        data: null,
        error: mockError
      };

      (supabase.rpc as any).mockResolvedValue(mockSupabaseResponse);

      const result = await adminDashboardService.getExecutiveKPIs('weekly');

      expect(result).toEqual({
        success: false,
        error: 'Access denied'
      });
    });
  });

  describe('getSystemAlerts', () => {
    it('deve retornar alertas do sistema com sucesso', async () => {
      const mockSupabaseResponse = {
        data: mockAlerts,
        error: null
      };

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockSupabaseResponse)
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      const result = await adminDashboardService.getSystemAlerts();

      expect(result).toEqual({
        success: true,
        data: mockAlerts
      });
      expect(supabase.from).toHaveBeenCalledWith('system_alerts');
    });

    it('deve filtrar alertas por tipo quando especificado', async () => {
      const mockSupabaseResponse = {
        data: mockAlerts.filter(alert => alert.type === 'error'),
        error: null
      };

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockSupabaseResponse)
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      const result = await adminDashboardService.getSystemAlerts('error');

      expect(result).toEqual({
        success: true,
        data: mockAlerts.filter(alert => alert.type === 'error')
      });
      expect(mockFromChain.eq).toHaveBeenCalledWith('type', 'error');
    });

    it('deve retornar erro quando falha ao buscar alertas', async () => {
      const mockError = { message: 'Table not found' };
      const mockSupabaseResponse = {
        data: null,
        error: mockError
      };

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockSupabaseResponse)
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      const result = await adminDashboardService.getSystemAlerts();

      expect(result).toEqual({
        success: false,
        error: 'Table not found'
      });
    });
  });

  describe('getRecentActivities', () => {
    it('deve retornar atividades recentes com sucesso', async () => {
      const mockSupabaseResponse = {
        data: mockActivities,
        error: null
      };

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockSupabaseResponse)
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      const result = await adminDashboardService.getRecentActivities();

      expect(result).toEqual({
        success: true,
        data: mockActivities
      });
      expect(supabase.from).toHaveBeenCalledWith('admin_activities');
      expect(mockFromChain.limit).toHaveBeenCalledWith(50);
    });

    it('deve usar limite personalizado quando especificado', async () => {
      const mockSupabaseResponse = {
        data: mockActivities,
        error: null
      };

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockSupabaseResponse)
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      await adminDashboardService.getRecentActivities(25);

      expect(mockFromChain.limit).toHaveBeenCalledWith(25);
    });

    it('deve retornar erro quando falha ao buscar atividades', async () => {
      const mockError = { message: 'Permission denied' };
      const mockSupabaseResponse = {
        data: null,
        error: mockError
      };

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockSupabaseResponse)
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      const result = await adminDashboardService.getRecentActivities();

      expect(result).toEqual({
        success: false,
        error: 'Permission denied'
      });
    });
  });

  describe('updateAlertStatus', () => {
    it('deve atualizar status do alerta com sucesso', async () => {
      const mockSupabaseResponse = {
        data: { ...mockAlerts[0], isRead: true },
        error: null
      };

      const mockFromChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockSupabaseResponse)
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      const result = await adminDashboardService.updateAlertStatus('1', 'mark_read');

      expect(result).toEqual({
        success: true,
        data: { ...mockAlerts[0], isRead: true }
      });
      expect(supabase.from).toHaveBeenCalledWith('system_alerts');
      expect(mockFromChain.update).toHaveBeenCalledWith({ isRead: true });
      expect(mockFromChain.eq).toHaveBeenCalledWith('id', '1');
    });

    it('deve resolver alerta quando ação é resolve', async () => {
      const mockSupabaseResponse = {
        data: { ...mockAlerts[0], isResolved: true },
        error: null
      };

      const mockFromChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockSupabaseResponse)
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      await adminDashboardService.updateAlertStatus('1', 'resolve');

      expect(mockFromChain.update).toHaveBeenCalledWith({ isResolved: true });
    });

    it('deve arquivar alerta quando ação é archive', async () => {
      const mockSupabaseResponse = {
        data: { ...mockAlerts[0], isArchived: true },
        error: null
      };

      const mockFromChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockSupabaseResponse)
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      await adminDashboardService.updateAlertStatus('1', 'archive');

      expect(mockFromChain.update).toHaveBeenCalledWith({ isArchived: true });
    });

    it('deve retornar erro para ação inválida', async () => {
      const result = await adminDashboardService.updateAlertStatus('1', 'invalid_action' as any);

      expect(result).toEqual({
        success: false,
        error: 'Ação inválida'
      });
    });

    it('deve retornar erro quando falha ao atualizar alerta', async () => {
      const mockError = { message: 'Update failed' };
      const mockSupabaseResponse = {
        data: null,
        error: mockError
      };

      const mockFromChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockSupabaseResponse)
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      const result = await adminDashboardService.updateAlertStatus('1', 'mark_read');

      expect(result).toEqual({
        success: false,
        error: 'Update failed'
      });
    });
  });

  describe('deleteAlert', () => {
    it('deve deletar alerta com sucesso', async () => {
      const mockSupabaseResponse = {
        data: null,
        error: null
      };

      const mockFromChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockSupabaseResponse)
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      const result = await adminDashboardService.deleteAlert('1');

      expect(result).toEqual({
        success: true,
        data: null
      });
      expect(supabase.from).toHaveBeenCalledWith('system_alerts');
      expect(mockFromChain.delete).toHaveBeenCalled();
      expect(mockFromChain.eq).toHaveBeenCalledWith('id', '1');
    });

    it('deve retornar erro quando falha ao deletar alerta', async () => {
      const mockError = { message: 'Delete failed' };
      const mockSupabaseResponse = {
        data: null,
        error: mockError
      };

      const mockFromChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockSupabaseResponse)
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      const result = await adminDashboardService.deleteAlert('1');

      expect(result).toEqual({
        success: false,
        error: 'Delete failed'
      });
    });
  });

  describe('logAdminActivity', () => {
    it('deve registrar atividade admin com sucesso', async () => {
      const mockSupabaseResponse = {
        data: mockActivities[0],
        error: null
      };

      const mockFromChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockSupabaseResponse)
      };

      (supabase.from as any).mockReturnValue(mockFromChain);
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      });

      const activityData = {
        type: 'user_created',
        description: 'Novo usuário criado',
        metadata: { userId: 'new-user-1' }
      };

      const result = await adminDashboardService.logAdminActivity(activityData);

      expect(result).toEqual({
        success: true,
        data: mockActivities[0]
      });
      expect(supabase.from).toHaveBeenCalledWith('admin_activities');
      expect(mockFromChain.insert).toHaveBeenCalledWith({
        ...activityData,
        userId: 'user-1',
        timestamp: expect.any(String)
      });
    });

    it('deve retornar erro quando usuário não está autenticado', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null
      });

      const activityData = {
        type: 'user_created',
        description: 'Novo usuário criado',
        metadata: {}
      };

      const result = await adminDashboardService.logAdminActivity(activityData);

      expect(result).toEqual({
        success: false,
        error: 'Usuário não autenticado'
      });
    });

    it('deve retornar erro quando falha ao registrar atividade', async () => {
      const mockError = { message: 'Insert failed' };
      const mockSupabaseResponse = {
        data: null,
        error: mockError
      };

      const mockFromChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockSupabaseResponse)
      };

      (supabase.from as any).mockReturnValue(mockFromChain);
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      });

      const activityData = {
        type: 'user_created',
        description: 'Novo usuário criado',
        metadata: {}
      };

      const result = await adminDashboardService.logAdminActivity(activityData);

      expect(result).toEqual({
        success: false,
        error: 'Insert failed'
      });
    });
  });
});