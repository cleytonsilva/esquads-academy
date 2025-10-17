import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import Dashboard from '@/pages/admin/Dashboard'
import { 
  createMockMetric, 
  createMockKPI, 
  createMockAlert,
  mockUseRealtimeUpdates 
} from '@/test/utils'

// Mock dos hooks
vi.mock('@/hooks/useRealtimeUpdates', () => ({
  useRealtimeUpdates: vi.fn(),
}))

vi.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    isConnected: true,
    connectionState: 'connected',
    lastMessage: null,
    sendMessage: vi.fn(),
    reconnect: vi.fn(),
  }),
}))

describe('Dashboard', () => {
  const mockRealtimeUpdates = mockUseRealtimeUpdates()

  beforeEach(() => {
    vi.clearAllMocks()
    const { useRealtimeUpdates } = require('@/hooks/useRealtimeUpdates')
    useRealtimeUpdates.mockReturnValue(mockRealtimeUpdates)
  })

  it('deve renderizar o dashboard com métricas', async () => {
    render(<Dashboard />)

    // Verifica se o título está presente
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()

    // Verifica se as abas estão presentes
    expect(screen.getByText('Métricas')).toBeInTheDocument()
    expect(screen.getByText('KPIs')).toBeInTheDocument()
    expect(screen.getByText('Alertas')).toBeInTheDocument()
    expect(screen.getByText('Atividades')).toBeInTheDocument()
  })

  it('deve exibir métricas corretamente', async () => {
    const mockMetrics = [
      createMockMetric({ name: 'Total Users', value: 1250, change_percentage: 4.17 }),
      createMockMetric({ name: 'Active Courses', value: 45, change_percentage: -2.3 }),
    ]

    const { useRealtimeUpdates } = require('@/hooks/useRealtimeUpdates')
    useRealtimeUpdates.mockReturnValue({
      ...mockRealtimeUpdates,
      metrics: mockMetrics,
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('1,250')).toBeInTheDocument()
      expect(screen.getByText('+4.17%')).toBeInTheDocument()
    })
  })

  it('deve exibir KPIs corretamente', async () => {
    const mockKPIs = [
      createMockKPI({ 
        name: 'Monthly Revenue', 
        value: 50000, 
        target: 60000, 
        unit: 'BRL' 
      }),
    ]

    const { useRealtimeUpdates } = require('@/hooks/useRealtimeUpdates')
    useRealtimeUpdates.mockReturnValue({
      ...mockRealtimeUpdates,
      kpis: mockKPIs,
    })

    render(<Dashboard />)

    // Clica na aba KPIs
    fireEvent.click(screen.getByText('KPIs'))

    await waitFor(() => {
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument()
      expect(screen.getByText('R$ 50.000')).toBeInTheDocument()
      expect(screen.getByText('Meta: R$ 60.000')).toBeInTheDocument()
    })
  })

  it('deve exibir alertas com badges corretos', async () => {
    const mockAlerts = [
      createMockAlert({ 
        title: 'System Maintenance', 
        type: 'warning', 
        priority: 'high',
        is_read: false 
      }),
      createMockAlert({ 
        title: 'Backup Complete', 
        type: 'success', 
        priority: 'low',
        is_read: true 
      }),
    ]

    const { useRealtimeUpdates } = require('@/hooks/useRealtimeUpdates')
    useRealtimeUpdates.mockReturnValue({
      ...mockRealtimeUpdates,
      alerts: mockAlerts,
    })

    render(<Dashboard />)

    // Clica na aba Alertas
    fireEvent.click(screen.getByText('Alertas'))

    await waitFor(() => {
      expect(screen.getByText('System Maintenance')).toBeInTheDocument()
      expect(screen.getByText('Backup Complete')).toBeInTheDocument()
    })

    // Verifica se o badge de alertas não lidos está presente
    const alertsTab = screen.getByText('Alertas').closest('button')
    expect(alertsTab).toHaveTextContent('1') // 1 alerta não lido
  })

  it('deve permitir marcar alertas como lidos', async () => {
    const mockAlert = createMockAlert({ 
      title: 'Test Alert', 
      is_read: false 
    })

    const mockMarkAsRead = vi.fn()
    const { useRealtimeUpdates } = require('@/hooks/useRealtimeUpdates')
    useRealtimeUpdates.mockReturnValue({
      ...mockRealtimeUpdates,
      alerts: [mockAlert],
      markAlertAsRead: mockMarkAsRead,
    })

    render(<Dashboard />)

    // Clica na aba Alertas
    fireEvent.click(screen.getByText('Alertas'))

    await waitFor(() => {
      expect(screen.getByText('Test Alert')).toBeInTheDocument()
    })

    // Clica no botão de marcar como lido
    const markAsReadButton = screen.getByLabelText('Marcar como lido')
    fireEvent.click(markAsReadButton)

    expect(mockMarkAsRead).toHaveBeenCalledWith(mockAlert.id)
  })

  it('deve permitir dispensar alertas', async () => {
    const mockAlert = createMockAlert({ 
      title: 'Test Alert', 
      is_dismissed: false 
    })

    const mockDismissAlert = vi.fn()
    const { useRealtimeUpdates } = require('@/hooks/useRealtimeUpdates')
    useRealtimeUpdates.mockReturnValue({
      ...mockRealtimeUpdates,
      alerts: [mockAlert],
      dismissAlert: mockDismissAlert,
    })

    render(<Dashboard />)

    // Clica na aba Alertas
    fireEvent.click(screen.getByText('Alertas'))

    await waitFor(() => {
      expect(screen.getByText('Test Alert')).toBeInTheDocument()
    })

    // Clica no botão de dispensar
    const dismissButton = screen.getByLabelText('Dispensar')
    fireEvent.click(dismissButton)

    expect(mockDismissAlert).toHaveBeenCalledWith(mockAlert.id)
  })

  it('deve exibir indicador de conexão em tempo real', () => {
    render(<Dashboard />)

    // Verifica se o indicador de tempo real está presente
    expect(screen.getByText('Conectado')).toBeInTheDocument()
  })

  it('deve permitir atualizar dados manualmente', async () => {
    const mockRefreshData = vi.fn()
    const { useRealtimeUpdates } = require('@/hooks/useRealtimeUpdates')
    useRealtimeUpdates.mockReturnValue({
      ...mockRealtimeUpdates,
      refreshData: mockRefreshData,
    })

    render(<Dashboard />)

    // Clica no botão de atualizar
    const refreshButton = screen.getByLabelText('Atualizar dados')
    fireEvent.click(refreshButton)

    expect(mockRefreshData).toHaveBeenCalled()
  })

  it('deve exibir estado de carregamento', () => {
    const { useRealtimeUpdates } = require('@/hooks/useRealtimeUpdates')
    useRealtimeUpdates.mockReturnValue({
      ...mockRealtimeUpdates,
      isLoading: true,
    })

    render(<Dashboard />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('deve exibir mensagem de erro quando houver falha', () => {
    const { useRealtimeUpdates } = require('@/hooks/useRealtimeUpdates')
    useRealtimeUpdates.mockReturnValue({
      ...mockRealtimeUpdates,
      error: 'Erro ao carregar dados',
    })

    render(<Dashboard />)

    expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument()
  })
})