/**
 * devAuth.ts
 * 
 * Sistema de autenticação mock para desenvolvimento
 * Permite testar a aplicação sem necessidade de autenticação real
 */

import type { User } from '@/types/database';

export const DEV_MODE = import.meta.env.DEV;

// Usuário admin mock para desenvolvimento
export const MOCK_ADMIN_USER: User = {
  id: '60f5f601-91e3-4ab1-86f6-d76aabd82079',
  full_name: 'Admin Desenvolvimento',
  role: 'admin',
  avatar_url: null,
  bio: 'Usuário administrador para desenvolvimento',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as any;

// Usuário estudante mock para desenvolvimento
export const MOCK_STUDENT_USER: User = {
  id: 'student-dev-123',
  full_name: 'Estudante Desenvolvimento',
  role: 'student',
  avatar_url: null,
  bio: 'Usuário estudante para desenvolvimento',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as any;

// Função para obter usuário mock baseado na URL
export const getMockUserFromRoute = (): User | null => {
  if (!DEV_MODE) return null;
  
  const path = window.location.pathname;
  
  if (path.startsWith('/admin')) {
    return MOCK_ADMIN_USER;
  } else if (path.startsWith('/student') || path.startsWith('/app')) {
    return MOCK_STUDENT_USER;
  }
  
  return null;
};

// Função para verificar se deve usar autenticação mock
export const shouldUseMockAuth = (): boolean => {
  return DEV_MODE && window.location.search.includes('mock=true');
};