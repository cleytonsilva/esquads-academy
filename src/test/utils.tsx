import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import type { User, AdminDashboardMetric, AdminKPI, SystemAlert } from '@/types/database'

// Provider wrapper para testes
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

// Função customizada de render
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock data factories
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  role: 'user',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  department_id: 'dept-1',
  role_id: 'role-1',
  phone: '+1234567890',
  location: 'São Paulo, SP',
  hire_date: '2024-01-01',
  last_login: '2024-01-15T10:00:00Z',
  is_active: true,
  custom_permissions: [],
  ...overrides,
})

export const createMockAdminUser = (overrides?: Partial<User>): User => 
  createMockUser({
    role: 'admin',
    full_name: 'Admin User',
    email: 'admin@example.com',
    ...overrides,
  })

export const createMockMetric = (overrides?: Partial<AdminDashboardMetric>): AdminDashboardMetric => ({
  id: 'metric-123',
  name: 'Total Users',
  value: 1250,
  previous_value: 1200,
  change_percentage: 4.17,
  category: 'users',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  ...overrides,
})

export const createMockKPI = (overrides?: Partial<AdminKPI>): AdminKPI => ({
  id: 'kpi-123',
  name: 'Monthly Revenue',
  value: 50000,
  target: 60000,
  unit: 'BRL',
  period: 'monthly',
  category: 'financial',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  ...overrides,
})

export const createMockAlert = (overrides?: Partial<SystemAlert>): SystemAlert => ({
  id: 'alert-123',
  title: 'System Maintenance',
  message: 'Scheduled maintenance will occur tonight',
  type: 'info',
  priority: 'medium',
  is_read: false,
  is_dismissed: false,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  ...overrides,
})

// Mock hooks
export const mockUseRealtimeUpdates = () => ({
  metrics: [createMockMetric()],
  kpis: [createMockKPI()],
  alerts: [createMockAlert()],
  activities: [],
  users: [createMockUser()],
  onlineUsers: 5,
  isLoading: false,
  error: null,
  refreshData: vi.fn(),
  markAlertAsRead: vi.fn(),
  dismissAlert: vi.fn(),
})

export const mockUseWebSocket = () => ({
  isConnected: true,
  connectionState: 'connected' as const,
  lastMessage: null,
  sendMessage: vi.fn(),
  reconnect: vi.fn(),
})

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }