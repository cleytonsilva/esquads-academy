import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock do Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
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
  })),
}))

// Mock do WebSocket
global.WebSocket = vi.fn(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  send: vi.fn(),
  close: vi.fn(),
  readyState: 1,
})) as any

// Mock do window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock do ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock do IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock Radix UI components that cause issues in tests
vi.mock('@radix-ui/react-select', () => ({
  Root: vi.fn(({ children }) => children),
  Trigger: vi.fn(({ children }) => children),
  Content: vi.fn(({ children }) => children),
  Item: vi.fn(({ children }) => children),
  Value: vi.fn(({ placeholder }) => placeholder || ''),
  Group: vi.fn(({ children }) => children),
  Label: vi.fn(({ children }) => children),
  Separator: vi.fn(() => null),
  ScrollUpButton: vi.fn(() => null),
  ScrollDownButton: vi.fn(() => null),
  Portal: vi.fn(({ children }) => children),
  Viewport: vi.fn(({ children }) => children),
  Icon: vi.fn(({ children }) => children),
  ItemText: vi.fn(({ children }) => children),
  ItemIndicator: vi.fn(({ children }) => children),
}))

vi.mock('@radix-ui/react-dialog', () => ({
  Root: vi.fn(({ children }) => children),
  Trigger: vi.fn(({ children }) => children),
  Content: vi.fn(({ children }) => children),
  Header: vi.fn(({ children }) => children),
  Title: vi.fn(({ children }) => children),
  Description: vi.fn(({ children }) => children),
  Footer: vi.fn(({ children }) => children),
  Portal: vi.fn(({ children }) => children),
  Close: vi.fn(({ children }) => children),
  Overlay: vi.fn(({ children }) => children),
}))

vi.mock('@radix-ui/react-tabs', () => ({
  Root: vi.fn(({ children }) => children),
  List: vi.fn(({ children }) => children),
  Trigger: vi.fn(({ children }) => children),
  Content: vi.fn(({ children }) => children),
}))

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock das variáveis de ambiente
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
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
  },
}))