import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserManagement } from '../UserManagement';
import type { UserManagementProps, User, Department, Role } from '@/types/admin';

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'john.doe@example.com',
    full_name: 'John Doe',
    role: 'student',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-01-15T10:30:00Z',
    department: { id: 'dept1', name: 'IT' },
    customRole: { id: 'role1', name: 'Developer' }
  },
  {
    id: 'user2',
    email: 'jane.smith@example.com',
    full_name: 'Jane Smith',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
    last_login: '2024-01-15T09:15:00Z',
    department: { id: 'dept2', name: 'HR' },
    customRole: { id: 'role2', name: 'Manager' }
  },
  {
    id: 'user3',
    email: 'bob.wilson@example.com',
    full_name: 'Bob Wilson',
    role: 'student',
    status: 'inactive',
    created_at: '2024-01-03T00:00:00Z',
    last_login: null,
    department: { id: 'dept1', name: 'IT' },
    customRole: { id: 'role1', name: 'Developer' }
  }
];

const mockDepartments: Department[] = [
  { id: 'dept1', name: 'IT', description: 'Information Technology' },
  { id: 'dept2', name: 'HR', description: 'Human Resources' }
];

const mockRoles: Role[] = [
  { id: 'role1', name: 'Developer', description: 'Software Developer' },
  { id: 'role2', name: 'Manager', description: 'Team Manager' }
];

const defaultProps: UserManagementProps = {
  currentUser: {
    id: 'current-user',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z'
  },
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canViewDetails: true,
    canManageRoles: true,
    canExport: true,
    canImport: true
  }
};

// Mock do hook useUserManagement
const mockUseUserManagement = {
  users: mockUsers,
  departments: mockDepartments,
  roles: mockRoles,
  selectedUsers: [],
  searchResult: {
    users: mockUsers,
    total: 3,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasMore: false
  },
  filters: {
    search: '',
    department: '',
    role: '',
    status: ''
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isBulkOperating: false,
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  toggleUserStatus: vi.fn(),
  resetUserPassword: vi.fn(),
  selectUser: vi.fn(),
  selectAllUsers: vi.fn(),
  bulkUpdateStatus: vi.fn(),
  bulkUpdateDepartment: vi.fn(),
  bulkUpdateRole: vi.fn(),
  bulkDeleteUsers: vi.fn(),
  createDepartment: vi.fn(),
  updateDepartment: vi.fn(),
  deleteDepartment: vi.fn(),
  createRole: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
  searchUsers: vi.fn(),
  setFilters: vi.fn(),
  getActivityLogs: vi.fn(),
  exportUsers: vi.fn(),
  importUsers: vi.fn()
};

vi.mock('@/hooks/useUserManagement', () => ({
  useUserManagement: () => mockUseUserManagement
}));

describe('UserManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar componente corretamente', () => {
      render(<UserManagement {...defaultProps} />);

      expect(screen.getByText('Gestão de Usuários')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /novo usuário/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /exportar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /importar/i })).toBeInTheDocument();
    });

    it('deve renderizar estatísticas de usuários', () => {
      render(<UserManagement {...defaultProps} />);

      expect(screen.getByText('Total de Usuários')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Usuários Ativos')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Usuários Pendentes')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Departamentos')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('deve renderizar filtros de busca', () => {
      render(<UserManagement {...defaultProps} />);

      expect(screen.getByPlaceholderText(/buscar usuários/i)).toBeInTheDocument();
      expect(screen.getByText('Todos os Departamentos')).toBeInTheDocument();
      expect(screen.getByText('Todas as Funções')).toBeInTheDocument();
      expect(screen.getByText('Todos os Status')).toBeInTheDocument();
    });

    it('deve renderizar tabela de usuários', () => {
      render(<UserManagement {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
      expect(screen.getByText('bob.wilson@example.com')).toBeInTheDocument();
    });

    it('deve renderizar badges de status corretamente', () => {
      render(<UserManagement {...defaultProps} />);

      const activeBadges = screen.getAllByText('Ativo');
      expect(activeBadges).toHaveLength(2);
      
      const inactiveBadge = screen.getByText('Inativo');
      expect(inactiveBadge).toBeInTheDocument();
    });

    it('deve renderizar estado de loading', () => {
      const loadingProps = {
        ...defaultProps
      };
      
      mockUseUserManagement.isLoading = true;
      
      render(<UserManagement {...loadingProps} />);

      expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    });
  });

  describe('Busca e filtros', () => {
    it('deve permitir busca por texto', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/buscar usuários/i);
      await user.type(searchInput, 'John');

      expect(mockUseUserManagement.setFilters).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'John' })
      );
    });

    it('deve permitir filtro por departamento', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const departmentFilter = screen.getByText('Todos os Departamentos');
      await user.click(departmentFilter);

      const itOption = screen.getByText('IT');
      await user.click(itOption);

      expect(mockUseUserManagement.setFilters).toHaveBeenCalledWith(
        expect.objectContaining({ department: 'dept1' })
      );
    });

    it('deve permitir filtro por função', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const roleFilter = screen.getByText('Todas as Funções');
      await user.click(roleFilter);

      const developerOption = screen.getByText('Developer');
      await user.click(developerOption);

      expect(mockUseUserManagement.setFilters).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'role1' })
      );
    });

    it('deve permitir filtro por status', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const statusFilter = screen.getByText('Todos os Status');
      await user.click(statusFilter);

      const activeOption = screen.getByText('Ativo');
      await user.click(activeOption);

      expect(mockUseUserManagement.setFilters).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' })
      );
    });
  });

  describe('Seleção de usuários', () => {
    it('deve permitir seleção individual de usuários', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      const userCheckbox = checkboxes[1]; // Primeiro checkbox é "selecionar todos"

      await user.click(userCheckbox);

      expect(mockUseUserManagement.selectUser).toHaveBeenCalledWith('user1');
    });

    it('deve permitir seleção de todos os usuários', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(selectAllCheckbox);

      expect(mockUseUserManagement.selectAllUsers).toHaveBeenCalledWith(true);
    });

    it('deve mostrar ações em lote quando usuários estão selecionados', () => {
      mockUseUserManagement.selectedUsers = ['user1', 'user2'];
      
      render(<UserManagement {...defaultProps} />);

      expect(screen.getByRole('button', { name: /ativar selecionados/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /desativar selecionados/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /excluir selecionados/i })).toBeInTheDocument();
    });
  });

  describe('Ações de usuário', () => {
    it('deve abrir modal de criação de usuário', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const newUserButton = screen.getByRole('button', { name: /novo usuário/i });
      await user.click(newUserButton);

      expect(screen.getByText('Criar Usuário')).toBeInTheDocument();
    });

    it('deve abrir modal de edição de usuário', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      await user.click(editButtons[0]);

      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    });

    it('deve permitir visualização de detalhes do usuário', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const viewButtons = screen.getAllByRole('button', { name: /visualizar/i });
      await user.click(viewButtons[0]);

      expect(screen.getByText('Detalhes do Usuário')).toBeInTheDocument();
    });

    it('deve permitir exclusão de usuário', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
      await user.click(deleteButtons[0]);

      expect(screen.getByText(/tem certeza que deseja excluir/i)).toBeInTheDocument();

      const confirmButton = screen.getByRole('button', { name: /excluir/i });
      await user.click(confirmButton);

      expect(mockUseUserManagement.deleteUser).toHaveBeenCalledWith('user1');
    });

    it('deve permitir redefinição de senha', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const moreButtons = screen.getAllByRole('button', { name: /mais opções/i });
      await user.click(moreButtons[0]);

      const resetPasswordButton = screen.getByText(/redefinir senha/i);
      await user.click(resetPasswordButton);

      expect(mockUseUserManagement.resetUserPassword).toHaveBeenCalledWith('user1');
    });
  });

  describe('Operações em lote', () => {
    beforeEach(() => {
      mockUseUserManagement.selectedUsers = ['user1', 'user2'];
    });

    it('deve permitir ativação em lote', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const activateButton = screen.getByRole('button', { name: /ativar selecionados/i });
      await user.click(activateButton);

      expect(mockUseUserManagement.bulkUpdateStatus).toHaveBeenCalledWith(['user1', 'user2'], 'active');
    });

    it('deve permitir desativação em lote', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const deactivateButton = screen.getByRole('button', { name: /desativar selecionados/i });
      await user.click(deactivateButton);

      expect(mockUseUserManagement.bulkUpdateStatus).toHaveBeenCalledWith(['user1', 'user2'], 'inactive');
    });

    it('deve permitir exclusão em lote', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: /excluir selecionados/i });
      await user.click(deleteButton);

      expect(screen.getByText(/tem certeza que deseja excluir 2 usuário/i)).toBeInTheDocument();

      const confirmButton = screen.getByRole('button', { name: /excluir/i });
      await user.click(confirmButton);

      expect(mockUseUserManagement.bulkDeleteUsers).toHaveBeenCalledWith(['user1', 'user2']);
    });
  });

  describe('Export/Import', () => {
    it('deve permitir exportação de usuários', async () => {
      const user = userEvent.setup();
      mockUseUserManagement.exportUsers.mockResolvedValue('https://example.com/download.csv');
      
      render(<UserManagement {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /exportar/i });
      await user.click(exportButton);

      expect(mockUseUserManagement.exportUsers).toHaveBeenCalled();
    });

    it('deve permitir importação de usuários', async () => {
      const user = userEvent.setup();
      render(<UserManagement {...defaultProps} />);

      const importButton = screen.getByRole('button', { name: /importar/i });
      await user.click(importButton);

      // Simular seleção de arquivo
      const fileInput = screen.getByLabelText(/selecionar arquivo/i);
      const file = new File(['user data'], 'users.csv', { type: 'text/csv' });
      
      await user.upload(fileInput, file);

      expect(mockUseUserManagement.importUsers).toHaveBeenCalledWith(file);
    });
  });

  describe('Permissões', () => {
    it('deve ocultar botões quando usuário não tem permissões', () => {
      const restrictedProps = {
        ...defaultProps,
        permissions: {
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canViewDetails: true,
          canManageRoles: false,
          canExport: false,
          canImport: false
        }
      };

      render(<UserManagement {...restrictedProps} />);

      expect(screen.queryByRole('button', { name: /novo usuário/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /exportar/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /importar/i })).not.toBeInTheDocument();
    });

    it('deve ocultar ações de edição/exclusão quando usuário não tem permissões', () => {
      const restrictedProps = {
        ...defaultProps,
        permissions: {
          canCreate: true,
          canEdit: false,
          canDelete: false,
          canViewDetails: true,
          canManageRoles: false,
          canExport: true,
          canImport: true
        }
      };

      render(<UserManagement {...restrictedProps} />);

      expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /excluir/i })).not.toBeInTheDocument();
    });
  });

  describe('Estados vazios', () => {
    it('deve mostrar mensagem quando não há usuários', () => {
      mockUseUserManagement.users = [];
      mockUseUserManagement.searchResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasMore: false
      };

      render(<UserManagement {...defaultProps} />);

      expect(screen.getByText(/nenhum usuário encontrado/i)).toBeInTheDocument();
    });

    it('deve mostrar mensagem quando busca não retorna resultados', () => {
      mockUseUserManagement.filters = { search: 'inexistente', department: '', role: '', status: '' };
      mockUseUserManagement.searchResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasMore: false
      };

      render(<UserManagement {...defaultProps} />);

      expect(screen.getByText(/nenhum usuário encontrado/i)).toBeInTheDocument();
    });
  });

  describe('Paginação', () => {
    it('deve mostrar informações de paginação', () => {
      mockUseUserManagement.searchResult = {
        users: mockUsers,
        total: 25,
        page: 1,
        limit: 20,
        totalPages: 2,
        hasMore: true
      };

      render(<UserManagement {...defaultProps} />);

      expect(screen.getByText(/mostrando 1-3 de 25 usuários/i)).toBeInTheDocument();
    });
  });

  describe('Formatação de dados', () => {
    it('deve formatar datas corretamente', () => {
      render(<UserManagement {...defaultProps} />);

      expect(screen.getByText('01/01/2024')).toBeInTheDocument();
      expect(screen.getByText('02/01/2024')).toBeInTheDocument();
    });

    it('deve mostrar "Nunca" para usuários que nunca fizeram login', () => {
      render(<UserManagement {...defaultProps} />);

      expect(screen.getByText('Nunca')).toBeInTheDocument();
    });

    it('deve formatar último login corretamente', () => {
      render(<UserManagement {...defaultProps} />);

      expect(screen.getByText('15/01/2024 10:30')).toBeInTheDocument();
      expect(screen.getByText('15/01/2024 09:15')).toBeInTheDocument();
    });
  });
});