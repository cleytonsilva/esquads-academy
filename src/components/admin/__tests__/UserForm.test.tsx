import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserForm } from '../UserForm';
import type { User, Department, Role } from '@/types/admin';

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockDepartments: Department[] = [
  { id: 'dept1', name: 'IT', description: 'Information Technology' },
  { id: 'dept2', name: 'HR', description: 'Human Resources' },
  { id: 'dept3', name: 'Finance', description: 'Finance Department' }
];

const mockRoles: Role[] = [
  { id: 'role1', name: 'Developer', description: 'Software Developer' },
  { id: 'role2', name: 'Manager', description: 'Team Manager' },
  { id: 'role3', name: 'Analyst', description: 'Data Analyst' }
];

const mockUser: User = {
  id: 'user1',
  email: 'john.doe@example.com',
  full_name: 'John Doe',
  role: 'student',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  profile: {
    phone: '+55 11 99999-9999',
    bio: 'Desenvolvedor experiente',
    avatar_url: 'https://example.com/avatar.jpg',
    birth_date: '1990-01-01',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    postal_code: '01234-567',
    emergency_contact: 'Maria Doe - +55 11 88888-8888',
    preferences: {
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      notifications: {
        email: true,
        push: false,
        sms: true
      }
    }
  },
  department: mockDepartments[0],
  customRole: mockRoles[0]
};

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  mode: 'create' as const,
  departments: mockDepartments,
  roles: mockRoles,
  isLoading: false
};

describe('UserForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar formulário de criação corretamente', () => {
      render(<UserForm {...defaultProps} />);

      expect(screen.getByText('Criar Usuário')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criar usuário/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('deve renderizar formulário de edição corretamente', () => {
      render(
        <UserForm 
          {...defaultProps} 
          mode="edit" 
          user={mockUser}
        />
      );

      expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.full_name)).toBeInTheDocument();
      expect(screen.queryByLabelText(/senha/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
    });

    it('deve renderizar abas corretamente', () => {
      render(<UserForm {...defaultProps} />);

      expect(screen.getByRole('tab', { name: /informações básicas/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /perfil/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /permissões/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /preferências/i })).toBeInTheDocument();
    });

    it('deve mostrar estado de loading', () => {
      render(<UserForm {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /criando.../i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Validação de formulário', () => {
    it('deve validar email obrigatório', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
    });

    it('deve validar formato de email', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'email-invalido');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      expect(screen.getByText(/email deve ter um formato válido/i)).toBeInTheDocument();
    });

    it('deve validar nome completo obrigatório', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      expect(screen.getByText(/nome completo é obrigatório/i)).toBeInTheDocument();
    });

    it('deve validar senha obrigatória no modo criação', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });

    it('deve validar tamanho mínimo da senha', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText(/senha/i);
      await user.type(passwordInput, '123');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      expect(screen.getByText(/senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
    });

    it('deve validar formato de telefone', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      // Navegar para aba de perfil
      const profileTab = screen.getByRole('tab', { name: /perfil/i });
      await user.click(profileTab);

      const phoneInput = screen.getByLabelText(/telefone/i);
      await user.type(phoneInput, 'telefone-invalido');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      expect(screen.getByText(/telefone deve ter um formato válido/i)).toBeInTheDocument();
    });
  });

  describe('Interações do usuário', () => {
    it('deve preencher campos básicos corretamente', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      const nameInput = screen.getByLabelText(/nome completo/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(nameInput, 'Test User');
      await user.type(passwordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(nameInput).toHaveValue('Test User');
      expect(passwordInput).toHaveValue('password123');
    });

    it('deve alternar visibilidade da senha', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText(/senha/i);
      const toggleButton = screen.getByRole('button', { name: /mostrar senha/i });

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('deve navegar entre abas', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const profileTab = screen.getByRole('tab', { name: /perfil/i });
      await user.click(profileTab);

      expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/biografia/i)).toBeInTheDocument();

      const permissionsTab = screen.getByRole('tab', { name: /permissões/i });
      await user.click(permissionsTab);

      expect(screen.getByLabelText(/papel do sistema/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/departamento/i)).toBeInTheDocument();
    });

    it('deve selecionar departamento e função', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      // Navegar para aba de permissões
      const permissionsTab = screen.getByRole('tab', { name: /permissões/i });
      await user.click(permissionsTab);

      // Selecionar departamento
      const departmentSelect = screen.getByLabelText(/departamento/i);
      await user.click(departmentSelect);
      
      const departmentOption = screen.getByText('IT');
      await user.click(departmentOption);

      // Selecionar função customizada
      const roleSelect = screen.getByLabelText(/função customizada/i);
      await user.click(roleSelect);
      
      const roleOption = screen.getByText('Developer');
      await user.click(roleOption);
    });

    it('deve configurar preferências de notificação', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      // Navegar para aba de preferências
      const preferencesTab = screen.getByRole('tab', { name: /preferências/i });
      await user.click(preferencesTab);

      const emailNotifications = screen.getByLabelText(/notificações por email/i);
      const pushNotifications = screen.getByLabelText(/notificações push/i);

      await user.click(emailNotifications);
      await user.click(pushNotifications);

      expect(emailNotifications).toBeChecked();
      expect(pushNotifications).toBeChecked();
    });
  });

  describe('Submissão do formulário', () => {
    it('deve submeter formulário válido de criação', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<UserForm {...defaultProps} onSubmit={onSubmit} />);

      // Preencher campos obrigatórios
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/nome completo/i), 'Test User');
      await user.type(screen.getByLabelText(/senha/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          full_name: 'Test User',
          password: 'password123',
          role: 'student',
          status: 'active',
          profile: expect.any(Object)
        });
      });
    });

    it('deve submeter formulário válido de edição', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <UserForm 
          {...defaultProps} 
          mode="edit" 
          user={mockUser}
          onSubmit={onSubmit}
        />
      );

      // Alterar nome
      const nameInput = screen.getByLabelText(/nome completo/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      const submitButton = screen.getByRole('button', { name: /salvar alterações/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            full_name: 'Updated Name'
          })
        );
      });
    });

    it('não deve submeter formulário inválido', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<UserForm {...defaultProps} onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
    });
  });

  describe('Cancelamento', () => {
    it('deve chamar onClose ao cancelar', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<UserForm {...defaultProps} onClose={onClose} />);

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('deve chamar onClose ao fechar modal', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<UserForm {...defaultProps} onClose={onClose} />);

      // Simular clique no X do modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Inicialização com dados do usuário', () => {
    it('deve preencher formulário com dados do usuário em modo edição', () => {
      render(
        <UserForm 
          {...defaultProps} 
          mode="edit" 
          user={mockUser}
        />
      );

      expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.full_name)).toBeInTheDocument();
    });

    it('deve preencher dados do perfil corretamente', async () => {
      const user = userEvent.setup();
      render(
        <UserForm 
          {...defaultProps} 
          mode="edit" 
          user={mockUser}
        />
      );

      // Navegar para aba de perfil
      const profileTab = screen.getByRole('tab', { name: /perfil/i });
      await user.click(profileTab);

      expect(screen.getByDisplayValue(mockUser.profile!.phone!)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.profile!.bio!)).toBeInTheDocument();
    });

    it('deve preencher preferências corretamente', async () => {
      const user = userEvent.setup();
      render(
        <UserForm 
          {...defaultProps} 
          mode="edit" 
          user={mockUser}
        />
      );

      // Navegar para aba de preferências
      const preferencesTab = screen.getByRole('tab', { name: /preferências/i });
      await user.click(preferencesTab);

      const emailNotifications = screen.getByLabelText(/notificações por email/i);
      const pushNotifications = screen.getByLabelText(/notificações push/i);

      expect(emailNotifications).toBeChecked();
      expect(pushNotifications).not.toBeChecked();
    });
  });

  describe('Estados de erro', () => {
    it('deve exibir mensagens de erro de validação', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/nome completo é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });

    it('deve limpar erros ao corrigir campos', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      // Submeter formulário vazio para gerar erros
      const submitButton = screen.getByRole('button', { name: /criar usuário/i });
      await user.click(submitButton);

      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();

      // Preencher email
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      // Erro deve desaparecer
      expect(screen.queryByText(/email é obrigatório/i)).not.toBeInTheDocument();
    });
  });
});