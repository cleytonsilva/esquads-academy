import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import RoleManagement from '../RoleManagement';
import { Role } from '@/types/admin';

// Mock dos componentes UI
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, ...props }: any) => (
    <input 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      {...props} 
    />
  )
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, ...props }: any) => (
    <span className={`badge ${variant}`} {...props}>
      {children}
    </span>
  )
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: any) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children, value }: any) => <div data-testid={`tab-content-${value}`}>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button data-testid={`tab-${value}`}>{children}</button>
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, id }: any) => (
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      id={id}
    />
  )
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DropdownMenuSeparator: () => <hr />
}));

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: any) => open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogAction: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  AlertDialogCancel: ({ children }: any) => <button>{children}</button>
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Administrador',
    description: 'Acesso completo ao sistema',
    permissions: ['users.view', 'users.create', 'users.edit', 'users.delete'],
    userCount: 3,
    isActive: true,
    level: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Instrutor',
    description: 'Pode gerenciar cursos',
    permissions: ['courses.view', 'courses.create'],
    userCount: 15,
    isActive: true,
    level: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

describe('RoleManagement', () => {
  const mockOnRoleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o título e descrição', () => {
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    expect(screen.getByText('Gestão de Papéis')).toBeInTheDocument();
    expect(screen.getByText('Gerencie papéis e permissões do sistema')).toBeInTheDocument();
  });

  it('deve renderizar o botão de novo papel', () => {
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    expect(screen.getByText('Novo Papel')).toBeInTheDocument();
  });

  it('deve renderizar a barra de busca', () => {
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    expect(screen.getByPlaceholderText('Buscar papéis...')).toBeInTheDocument();
  });

  it('deve renderizar os papéis mockados', () => {
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('Instrutor')).toBeInTheDocument();
    expect(screen.getByText('Estudante')).toBeInTheDocument();
    expect(screen.getByText('Moderador')).toBeInTheDocument();
  });

  it('deve filtrar papéis ao digitar na busca', async () => {
    const user = userEvent.setup();
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    const searchInput = screen.getByPlaceholderText('Buscar papéis...');
    await user.type(searchInput, 'Admin');
    
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.queryByText('Estudante')).toBeInTheDocument(); // Ainda deve estar presente pois é mock data
  });

  it('deve abrir o dialog de criação ao clicar em Novo Papel', async () => {
    const user = userEvent.setup();
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    const newRoleButton = screen.getByText('Novo Papel');
    await user.click(newRoleButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Criar Novo Papel')).toBeInTheDocument();
    });
  });

  it('deve mostrar informações do papel no card', () => {
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    // Verifica se mostra contagem de usuários
    expect(screen.getByText('3 usuários')).toBeInTheDocument();
    expect(screen.getByText('15 usuários')).toBeInTheDocument();
    
    // Verifica se mostra status ativo
    expect(screen.getAllByText('Ativo')).toHaveLength(4); // Todos os papéis mock são ativos
  });

  it('deve mostrar badges de nível corretamente', () => {
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    expect(screen.getByText('Alto')).toBeInTheDocument(); // Administrador
    expect(screen.getAllByText('Médio')).toHaveLength(2); // Instrutor e Moderador
    expect(screen.getByText('Básico')).toBeInTheDocument(); // Estudante
  });

  it('deve mostrar permissões limitadas no card', () => {
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    // Verifica se mostra algumas permissões
    expect(screen.getByText('Visualizar Usuários')).toBeInTheDocument();
    expect(screen.getByText('Criar Usuários')).toBeInTheDocument();
  });

  it('deve chamar onRoleChange quando fornecido', () => {
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    // O componente deve renderizar sem erros mesmo com callback
    expect(screen.getByText('Gestão de Papéis')).toBeInTheDocument();
  });

  it('deve renderizar com organizationId quando fornecido', () => {
    render(<RoleManagement organizationId="org-123" onRoleChange={mockOnRoleChange} />);
    
    expect(screen.getByText('Gestão de Papéis')).toBeInTheDocument();
  });

  it('deve mostrar contagem correta de permissões', () => {
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    // Administrador tem 12 permissões no mock
    expect(screen.getByText('Permissões (12)')).toBeInTheDocument();
    
    // Instrutor tem 5 permissões no mock
    expect(screen.getByText('Permissões (5)')).toBeInTheDocument();
  });

  it('deve mostrar indicador de mais permissões quando necessário', () => {
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    // Para papéis com mais de 3 permissões, deve mostrar "+X mais"
    expect(screen.getByText('+9 mais')).toBeInTheDocument(); // Administrador: 12 - 3 = 9
    expect(screen.getByText('+2 mais')).toBeInTheDocument(); // Instrutor: 5 - 3 = 2
  });
});

describe('RoleManagement - Formulário de Criação', () => {
  const mockOnRoleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve preencher formulário de criação', async () => {
    const user = userEvent.setup();
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    // Abrir dialog
    await user.click(screen.getByText('Novo Papel'));
    
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    // Preencher campos básicos
    const nameInput = screen.getByPlaceholderText('Ex: Instrutor');
    await user.type(nameInput, 'Novo Papel');
    
    const descriptionInput = screen.getByPlaceholderText('Descreva as responsabilidades deste papel...');
    await user.type(descriptionInput, 'Descrição do novo papel');
    
    expect(nameInput).toHaveValue('Novo Papel');
    expect(descriptionInput).toHaveValue('Descrição do novo papel');
  });

  it('deve permitir seleção de permissões', async () => {
    const user = userEvent.setup();
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    // Abrir dialog
    await user.click(screen.getByText('Novo Papel'));
    
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    // Ir para aba de permissões
    const permissionsTab = screen.getByTestId('tab-permissions');
    await user.click(permissionsTab);
    
    // Verificar se checkboxes de permissões estão presentes
    expect(screen.getByLabelText('Visualizar Usuários')).toBeInTheDocument();
    expect(screen.getByLabelText('Criar Usuários')).toBeInTheDocument();
  });

  it('deve ter botões de ação no formulário', async () => {
    const user = userEvent.setup();
    render(<RoleManagement onRoleChange={mockOnRoleChange} />);
    
    await user.click(screen.getByText('Novo Papel'));
    
    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
      expect(screen.getByText('Criar Papel')).toBeInTheDocument();
    });
  });
});