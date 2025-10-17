import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useRealtimeUpdates } from '../useRealtimeUpdates'
import { createMockMetric, createMockKPI, createMockAlert } from '@/test/utils'

// Mock do Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  })),
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}))

describe('useRealtimeUpdates', () => {
  const mockMetrics = [
    createMockMetric({ name: 'Total Users', value: 1250 }),
    createMockMetric({ name: 'Active Courses', value: 45 }),
  ]

  const mockKPIs = [
    createMockKPI({ name: 'Monthly Revenue', value: 50000 }),
    createMockKPI({ name: 'Course Completion', value: 85 }),
  ]

  const mockAlerts = [
    createMockAlert({ title: 'System Maintenance', is_read: false }),
    createMockAlert({ title: 'Backup Complete', is_read: true }),
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock das respostas iniciais
    mockSupabase.from().select().mockImplementation((table) => {
      if (table === 'admin_dashboard_metrics') {
        return Promise.resolve({ data: mockMetrics, error: null })
      }
      if (table === 'admin_kpis') {
        return Promise.resolve({ data: mockKPIs, error: null })
      }
      if (table === 'system_alerts') {
        return Promise.resolve({ data: mockAlerts, error: null })
      }
      if (table === 'system_activities') {
        return Promise.resolve({ data: [], error: null })
      }
      if (table === 'users') {
        return Promise.resolve({ data: [], error: null })
      }
      return Promise.resolve({ data: [], error: null })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deve carregar dados iniciais corretamente', async () => {
    const { result } = renderHook(() => useRealtimeUpdates())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.metrics).toEqual(mockMetrics)
    expect(result.current.kpis).toEqual(mockKPIs)
    expect(result.current.alerts).toEqual(mockAlerts)
    expect(result.current.error).toBeNull()
  })

  it('deve configurar canais de tempo real', async () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    }

    mockSupabase.channel.mockReturnValue(mockChannel)

    renderHook(() => useRealtimeUpdates())

    await waitFor(() => {
      expect(mockSupabase.channel).toHaveBeenCalledWith('admin-dashboard')
    })

    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'admin_dashboard_metrics' },
      expect.any(Function)
    )

    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'admin_kpis' },
      expect.any(Function)
    )

    expect(mockChannel.subscribe).toHaveBeenCalled()
  })

  it('deve atualizar métricas em tempo real', async () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    }

    let metricsCallback: Function

    mockChannel.on.mockImplementation((event, config, callback) => {
      if (config.table === 'admin_dashboard_metrics') {
        metricsCallback = callback
      }
      return mockChannel
    })

    mockSupabase.channel.mockReturnValue(mockChannel)

    const { result } = renderHook(() => useRealtimeUpdates())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Simula atualização em tempo real
    const newMetric = createMockMetric({ name: 'New Metric', value: 999 })
    
    act(() => {
      metricsCallback({
        eventType: 'INSERT',
        new: newMetric,
        old: null,
      })
    })

    expect(result.current.metrics).toContainEqual(newMetric)
  })

  it('deve permitir marcar alerta como lido', async () => {
    mockSupabase.from().update().mockResolvedValue({
      data: [{ ...mockAlerts[0], is_read: true }],
      error: null,
    })

    const { result } = renderHook(() => useRealtimeUpdates())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.markAlertAsRead(mockAlerts[0].id)
    })

    expect(mockSupabase.from().update).toHaveBeenCalledWith({
      is_read: true,
      updated_at: expect.any(String),
    })
  })

  it('deve permitir dispensar alerta', async () => {
    mockSupabase.from().update().mockResolvedValue({
      data: [{ ...mockAlerts[0], is_dismissed: true }],
      error: null,
    })

    const { result } = renderHook(() => useRealtimeUpdates())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.dismissAlert(mockAlerts[0].id)
    })

    expect(mockSupabase.from().update).toHaveBeenCalledWith({
      is_dismissed: true,
      updated_at: expect.any(String),
    })
  })

  it('deve permitir atualizar dados manualmente', async () => {
    const { result } = renderHook(() => useRealtimeUpdates())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Limpa os mocks para verificar se são chamados novamente
    vi.clearAllMocks()
    
    mockSupabase.from().select().mockResolvedValue({
      data: [createMockMetric({ name: 'Updated Metric', value: 2000 })],
      error: null,
    })

    await act(async () => {
      await result.current.refreshData()
    })

    expect(mockSupabase.from().select).toHaveBeenCalled()
  })

  it('deve lidar com erros de carregamento', async () => {
    mockSupabase.from().select().mockRejectedValue(new Error('Erro de rede'))

    const { result } = renderHook(() => useRealtimeUpdates())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Erro ao carregar dados do dashboard')
    expect(result.current.metrics).toEqual([])
    expect(result.current.kpis).toEqual([])
    expect(result.current.alerts).toEqual([])
  })

  it('deve limpar subscriptions ao desmontar', async () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    }

    mockSupabase.channel.mockReturnValue(mockChannel)

    const { unmount } = renderHook(() => useRealtimeUpdates())

    await waitFor(() => {
      expect(mockChannel.subscribe).toHaveBeenCalled()
    })

    unmount()

    expect(mockChannel.unsubscribe).toHaveBeenCalled()
  })

  it('deve calcular usuários online corretamente', async () => {
    const mockUsers = [
      { id: '1', last_login: new Date(Date.now() - 5 * 60 * 1000).toISOString() }, // 5 min atrás
      { id: '2', last_login: new Date(Date.now() - 20 * 60 * 1000).toISOString() }, // 20 min atrás
      { id: '3', last_login: new Date(Date.now() - 2 * 60 * 1000).toISOString() }, // 2 min atrás
    ]

    mockSupabase.from().select().mockImplementation((table) => {
      if (table === 'users') {
        return Promise.resolve({ data: mockUsers, error: null })
      }
      return Promise.resolve({ data: [], error: null })
    })

    const { result } = renderHook(() => useRealtimeUpdates())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Usuários online são aqueles com last_login nos últimos 15 minutos
    expect(result.current.onlineUsers).toBe(2)
  })
})