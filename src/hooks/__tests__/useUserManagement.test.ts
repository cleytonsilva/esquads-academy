import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUserManagement } from '../useUserManagement';
import { userManagementService } from '@/services/userManagementService';
import { toast } from 'sonner';

// Mock do serviço
vi.mock('@/services/userManagementService', () => ({
  userManagementService: {
    getUsers: vi.fn(),
    getDepartments: vi.fn(),
    getRoles: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    resetPassword: vi.fn(),
    bulkUpdateUsers: vi.fn(),
    bulkDeleteUsers: vi.fn(),
    createDepartment: vi.fn(),
    updateDepartment: vi.fn(),
    deleteDepartment: vi.fn(),
    createRole: vi.fn(),
    updateRole: vi.fn(),
    deleteRole: vi.fn(),
    getUserActivityLogs: vi.fn(),
    exportUsers: vi.fn(),
    importUsers: vi.fn()
  }
}));

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockUsers = [
  {
    id: '1',
    email: 'user1@test.com',
    full_name: 'User One',
    role: 'student' as const,
    status: 'active' as const,
    created_at: '2024-01-01T00:00:00Z',
    department: { id: 'dept1', name: 'IT' },
    customRole: { id: 'role1', name: 'Developer' }
  },
  {
    id: '2',
    email: 'user2@test.com',
    full_name: 'User Two',
    role: 'admin' as const,
    status: 'active' as const,
    created_at: '2024-01-02T00:00:00Z',
    department: { id: 'dept2', name: 'HR' },
    customRole: { id: 'role2', name: 'Manager' }
  }
];

const mockDepartments = [
  { id: 'dept1', name: 'IT', description: 'Information Technology' },
  { id: 'dept2', name: 'HR', description: 'Human Resources' }
];

const mockRoles = [
  { id: 'role1', name: 'Developer', description: 'Software Developer' },
  { id: 'role2', name: 'Manager', description: 'Team Manager' }
];

const mockSearchResult = {
  users: mockUsers,
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasMore: false
};

describe('useUserManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(userManagementService.getUsers).mockResolvedValue(mockSearchResult);
    vi.mocked(userManagementService.getDepartments).mockResolvedValue(mockDepartments);
    vi.mocked(userManagementService.getRoles).mockResolvedValue(mockRoles);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Inicialização', () => {
    it('deve carregar dados iniciais corretamente', async () => {
      const { result } = renderHook(() => useUserManagement());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.users).toEqual(mockUsers);
      expect(result.current.departments).toEqual(mockDepartments);
      expect(result.current.roles).toEqual(mockRoles);
      expect(result.current.searchResult).toEqual(mockSearchResult);
    });

    it('deve lidar com erro na inicialização', async () => {
      const error = new Error('Erro de rede');
      vi.mocked(userManagementService.getUsers).mockRejectedValue(error);

      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar dados iniciais');
    });
  });

  describe('Operações de usuário', () => {
    it('deve criar usuário com sucesso', async () => {
      const newUser = {
        id: '3',
        email: 'newuser@test.com',
        full_name: 'New User',
        role: 'student' as const,
        status: 'active' as const,
        created_at: '2024-01-03T00:00:00Z'
      };

      vi.mocked(userManagementService.createUser).mockResolvedValue(newUser);

      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const userData = {
          email: 'newuser@test.com',
          full_name: 'New User',
          role: 'student' as const,
          password: 'password123'
        };
        await result.current.createUser(userData);
      });

      expect(userManagementService.createUser).toHaveBeenCalledWith({
        email: 'newuser@test.com',
        full_name: 'New User',
        role: 'student',
        password: 'password123'
      });
      expect(toast.success).toHaveBeenCalledWith('Usuário criado com sucesso');
      expect(result.current.users).toContainEqual(newUser);
    });

    it('deve atualizar usuário com sucesso', async () => {
      const updatedUser = {
        ...mockUsers[0],
        full_name: 'Updated User'
      };

      vi.mocked(userManagementService.updateUser).mockResolvedValue(updatedUser);

      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateUser('1', { full_name: 'Updated User' });
      });

      expect(userManagementService.updateUser).toHaveBeenCalledWith('1', { full_name: 'Updated User' });
      expect(toast.success).toHaveBeenCalledWith('Usuário atualizado com sucesso');
    });

    it('deve excluir usuário com sucesso', async () => {
      vi.mocked(userManagementService.deleteUser).mockResolvedValue();

      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteUser('1');
      });

      expect(userManagementService.deleteUser).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Usuário excluído com sucesso');
      expect(result.current.users).not.toContainEqual(mockUsers[0]);
    });

    it('deve alternar status do usuário', async () => {
      const updatedUser = {
        ...mockUsers[0],
        status: 'inactive' as const
      };

      vi.mocked(userManagementService.updateUser).mockResolvedValue(updatedUser);

      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleUserStatus('1');
      });

      expect(userManagementService.updateUser).toHaveBeenCalledWith('1', { status: 'inactive' });
    });

    it('deve redefinir senha do usuário', async () => {
      vi.mocked(userManagementService.resetPassword).mockResolvedValue();

      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.resetUserPassword('1');
      });

      expect(userManagementService.resetPassword).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Email de redefinição de senha enviado');
    });
  });

  describe('Seleção de usuários', () => {
    it('deve selecionar/deselecionar usuário individual', async () => {
      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.selectUser('1');
      });

      expect(result.current.selectedUsers).toContain('1');

      act(() => {
        result.current.selectUser('1');
      });

      expect(result.current.selectedUsers).not.toContain('1');
    });

    it('deve selecionar/deselecionar todos os usuários', async () => {
      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.selectAllUsers(true);
      });

      expect(result.current.selectedUsers).toEqual(['1', '2']);

      act(() => {
        result.current.selectAllUsers(false);
      });

      expect(result.current.selectedUsers).toEqual([]);
    });
  });

  describe('Operações em lote', () => {
    it('deve atualizar status em lote', async () => {
      vi.mocked(userManagementService.bulkUpdateUsers).mockResolvedValue();

      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.selectAllUsers(true);
      });

      await act(async () => {
        await result.current.bulkUpdateStatus(['1', '2'], 'inactive');
      });

      expect(userManagementService.bulkUpdateUsers).toHaveBeenCalledWith(['1', '2'], { status: 'inactive' });
      expect(toast.success).toHaveBeenCalledWith('Status de 2 usuário(s) atualizado');
      expect(result.current.selectedUsers).toEqual([]);
    });

    it('deve excluir usuários em lote', async () => {
      vi.mocked(userManagementService.bulkDeleteUsers).mockResolvedValue();

      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.bulkDeleteUsers(['1', '2']);
      });

      expect(userManagementService.bulkDeleteUsers).toHaveBeenCalledWith(['1', '2']);
      expect(toast.success).toHaveBeenCalledWith('2 usuário(s) excluído(s)');
    });
  });

  describe('Busca e filtros', () => {
    it('deve buscar usuários com filtros', async () => {
      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const filters = {
        search: 'test',
        role: 'student' as const,
        status: 'active' as const
      };

      act(() => {
        result.current.setFilters(filters);
      });

      await act(async () => {
        await result.current.searchUsers(filters);
      });

      expect(userManagementService.getUsers).toHaveBeenCalledWith({
        ...filters,
        limit: 20
      });
    });
  });

  describe('Departamentos', () => {
    it('deve criar departamento', async () => {
      const newDepartment = { id: 'dept3', name: 'Finance', description: 'Finance Department' };
      vi.mocked(userManagementService.createDepartment).mockResolvedValue(newDepartment);

      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createDepartment({ name: 'Finance', description: 'Finance Department' });
      });

      expect(userManagementService.createDepartment).toHaveBeenCalledWith({ name: 'Finance', description: 'Finance Department' });
      expect(toast.success).toHaveBeenCalledWith('Departamento criado com sucesso');
      expect(result.current.departments).toContainEqual(newDepartment);
    });
  });

  describe('Roles', () => {
    it('deve criar role', async () => {
      const newRole = { id: 'role3', name: 'Analyst', description: 'Data Analyst' };
      vi.mocked(userManagementService.createRole).mockResolvedValue(newRole);

      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createRole({ name: 'Analyst', description: 'Data Analyst' });
      });

      expect(userManagementService.createRole).toHaveBeenCalledWith({ name: 'Analyst', description: 'Data Analyst' });
      expect(toast.success).toHaveBeenCalledWith('Função criada com sucesso');
      expect(result.current.roles).toContainEqual(newRole);
    });
  });

  describe('Export/Import', () => {
    it('deve exportar usuários', async () => {
      const downloadUrl = 'https://example.com/download/users.csv';
      vi.mocked(userManagementService.exportUsers).mockResolvedValue(downloadUrl);

      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let exportResult: string;
      await act(async () => {
        exportResult = await result.current.exportUsers();
      });

      expect(userManagementService.exportUsers).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Exportação iniciada');
      expect(exportResult!).toBe(downloadUrl);
    });

    it('deve importar usuários', async () => {
      const file = new File(['user data'], 'users.csv', { type: 'text/csv' });
      vi.mocked(userManagementService.importUsers).mockResolvedValue();

      const { result } = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.importUsers(file);
      });

      expect(userManagementService.importUsers).toHaveBeenCalledWith(file);
      expect(toast.success).toHaveBeenCalledWith('Importação concluída com sucesso');
    });
  });

  describe('Estados de loading', () => {
    it('deve gerenciar estados de loading corretamente', async () => {
      const { result } = renderHook(() => useUserManagement());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);
      expect(result.current.isBulkOperating).toBe(false);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});