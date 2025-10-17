import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useWebSocket, useAdminDashboardWebSocket } from '../useWebSocket'

// Mock do WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  constructor(public url: string) {
    // Simula conexão bem-sucedida após um pequeno delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      if (this.onopen) {
        this.onopen(new Event('open'))
      }
    }, 10)
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open')
    }
  }

  close() {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close'))
    }
  }

  // Métodos para simular eventos nos testes
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { 
        data: JSON.stringify(data) 
      }))
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }

  simulateClose() {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close'))
    }
  }
}

global.WebSocket = MockWebSocket as any

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deve conectar ao WebSocket corretamente', async () => {
    const { result } = renderHook(() => 
      useWebSocket('ws://localhost:8080')
    )

    expect(result.current.connectionState).toBe('connecting')
    expect(result.current.isConnected).toBe(false)

    await waitFor(() => {
      expect(result.current.connectionState).toBe('connected')
      expect(result.current.isConnected).toBe(true)
    })
  })

  it('deve receber mensagens corretamente', async () => {
    const { result } = renderHook(() => 
      useWebSocket('ws://localhost:8080')
    )

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })

    const testMessage = { type: 'test', data: 'hello' }
    
    // Simula recebimento de mensagem
    act(() => {
      const ws = (result.current as any).ws
      ws.simulateMessage(testMessage)
    })

    expect(result.current.lastMessage).toEqual(testMessage)
  })

  it('deve enviar mensagens corretamente', async () => {
    const { result } = renderHook(() => 
      useWebSocket('ws://localhost:8080')
    )

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })

    const testMessage = { type: 'ping', data: 'test' }
    
    // Mock do método send
    const ws = (result.current as any).ws
    const sendSpy = vi.spyOn(ws, 'send')

    act(() => {
      result.current.sendMessage(testMessage)
    })

    expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(testMessage))
  })

  it('deve lidar com erros de conexão', async () => {
    const { result } = renderHook(() => 
      useWebSocket('ws://localhost:8080')
    )

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })

    // Simula erro
    act(() => {
      const ws = (result.current as any).ws
      ws.simulateError()
    })

    expect(result.current.connectionState).toBe('error')
    expect(result.current.isConnected).toBe(false)
  })

  it('deve tentar reconectar automaticamente', async () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => 
      useWebSocket('ws://localhost:8080', { 
        reconnectAttempts: 3,
        reconnectInterval: 1000 
      })
    )

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })

    // Simula desconexão
    act(() => {
      const ws = (result.current as any).ws
      ws.simulateClose()
    })

    expect(result.current.connectionState).toBe('disconnected')

    // Avança o timer para trigger da reconexão
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.connectionState).toBe('reconnecting')

    vi.useRealTimers()
  })

  it('deve parar de tentar reconectar após limite de tentativas', async () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => 
      useWebSocket('ws://localhost:8080', { 
        reconnectAttempts: 2,
        reconnectInterval: 1000 
      })
    )

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })

    // Simula múltiplas desconexões
    for (let i = 0; i < 3; i++) {
      act(() => {
        const ws = (result.current as any).ws
        ws.simulateClose()
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })
    }

    expect(result.current.connectionState).toBe('failed')

    vi.useRealTimers()
  })

  it('deve permitir reconexão manual', async () => {
    const { result } = renderHook(() => 
      useWebSocket('ws://localhost:8080')
    )

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })

    // Simula desconexão
    act(() => {
      const ws = (result.current as any).ws
      ws.simulateClose()
    })

    expect(result.current.connectionState).toBe('disconnected')

    // Reconecta manualmente
    act(() => {
      result.current.reconnect()
    })

    expect(result.current.connectionState).toBe('connecting')

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })
  })

  it('deve fechar conexão ao desmontar', async () => {
    const { result, unmount } = renderHook(() => 
      useWebSocket('ws://localhost:8080')
    )

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })

    const ws = (result.current as any).ws
    const closeSpy = vi.spyOn(ws, 'close')

    unmount()

    expect(closeSpy).toHaveBeenCalled()
  })
})

describe('useAdminDashboardWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve processar mensagens de métricas', async () => {
    const onMetricUpdate = vi.fn()
    
    const { result } = renderHook(() => 
      useAdminDashboardWebSocket({
        onMetricUpdate,
        onAlertUpdate: vi.fn(),
        onActivityUpdate: vi.fn(),
      })
    )

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })

    const metricMessage = {
      type: 'metric_update',
      data: {
        id: 'metric-1',
        name: 'Total Users',
        value: 1500,
        change_percentage: 5.2,
      }
    }

    // Simula recebimento de mensagem
    act(() => {
      const ws = (result.current as any).ws
      ws.simulateMessage(metricMessage)
    })

    expect(onMetricUpdate).toHaveBeenCalledWith(metricMessage.data)
  })

  it('deve processar mensagens de alertas', async () => {
    const onAlertUpdate = vi.fn()
    
    const { result } = renderHook(() => 
      useAdminDashboardWebSocket({
        onMetricUpdate: vi.fn(),
        onAlertUpdate,
        onActivityUpdate: vi.fn(),
      })
    )

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })

    const alertMessage = {
      type: 'alert_update',
      data: {
        id: 'alert-1',
        title: 'New Alert',
        type: 'warning',
        priority: 'high',
      }
    }

    // Simula recebimento de mensagem
    act(() => {
      const ws = (result.current as any).ws
      ws.simulateMessage(alertMessage)
    })

    expect(onAlertUpdate).toHaveBeenCalledWith(alertMessage.data)
  })

  it('deve processar mensagens de atividades', async () => {
    const onActivityUpdate = vi.fn()
    
    const { result } = renderHook(() => 
      useAdminDashboardWebSocket({
        onMetricUpdate: vi.fn(),
        onAlertUpdate: vi.fn(),
        onActivityUpdate,
      })
    )

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })

    const activityMessage = {
      type: 'activity_update',
      data: {
        id: 'activity-1',
        user_id: 'user-1',
        action: 'login',
        timestamp: new Date().toISOString(),
      }
    }

    // Simula recebimento de mensagem
    act(() => {
      const ws = (result.current as any).ws
      ws.simulateMessage(activityMessage)
    })

    expect(onActivityUpdate).toHaveBeenCalledWith(activityMessage.data)
  })

  it('deve ignorar mensagens de tipo desconhecido', async () => {
    const onMetricUpdate = vi.fn()
    const onAlertUpdate = vi.fn()
    const onActivityUpdate = vi.fn()
    
    const { result } = renderHook(() => 
      useAdminDashboardWebSocket({
        onMetricUpdate,
        onAlertUpdate,
        onActivityUpdate,
      })
    )

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })

    const unknownMessage = {
      type: 'unknown_type',
      data: { test: 'data' }
    }

    // Simula recebimento de mensagem
    act(() => {
      const ws = (result.current as any).ws
      ws.simulateMessage(unknownMessage)
    })

    expect(onMetricUpdate).not.toHaveBeenCalled()
    expect(onAlertUpdate).not.toHaveBeenCalled()
    expect(onActivityUpdate).not.toHaveBeenCalled()
  })
})