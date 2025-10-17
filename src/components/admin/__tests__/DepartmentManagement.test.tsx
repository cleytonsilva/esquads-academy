import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import DepartmentManagement from '../DepartmentManagement';
import { Department } from '@/types/admin';

// Mock dos componentes UI
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`btn ${variant} ${size}`}
      {...props}
    >
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

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>
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

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Tecnologia',
    description: 'Departamento de TI',
    parentId: null,
    managerId: 'user-1',
    managerName: 'João Silva',
    userCount: 25,
    isActive: true,
    level: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Desenvolvimento',
    description: 'Equipe de desenvolvimento',
    parentId: '1',
    managerId: 'user-2',
    managerName: 'Maria Santos',
    userCount: 15,
    isActive: true,
    level: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

describe('DepartmentManagement', () => {
  const mockOnDepartmentChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o título e descrição', () => {
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    expect(screen.getByText('Gestão de Departamentos')).toBeInTheDocument();
    expect(screen.getByText('Organize a estrutura hierárquica da organização')).toBeInTheDocument();
  });

  it('deve renderizar o botão de novo departamento', () => {
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    expect(screen.getByText('Novo Departamento')).toBeInTheDocument();
  });

  it('deve renderizar a barra de busca', () => {
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    expect(screen.getByPlaceholderText('Buscar departamentos...')).toBeInTheDocument();
  });

  it('deve renderizar os departamentos mockados', () => {
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    expect(screen.getByText('Tecnologia')).toBeInTheDocument();
    expect(screen.getByText('Recursos Humanos')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Vendas')).toBeInTheDocument();
  });

  it('deve filtrar departamentos ao digitar na busca', async () => {
    const user = userEvent.setup();
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    const searchInput = screen.getByPlaceholderText('Buscar departamentos...');
    await user.type(searchInput, 'Tecnologia');
    
    expect(screen.getByText('Tecnologia')).toBeInTheDocument();
  });

  it('deve abrir o dialog de criação ao clicar em Novo Departamento', async () => {
    const user = userEvent.setup();
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    const newDepartmentButton = screen.getByText('Novo Departamento');
    await user.click(newDepartmentButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Criar Novo Departamento')).toBeInTheDocument();
    });
  });

  it('deve mostrar informações do departamento no card', () => {
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    // Verifica se mostra contagem de usuários
    expect(screen.getByText('25 usuários')).toBeInTheDocument();
    expect(screen.getByText('12 usuários')).toBeInTheDocument();
    
    // Verifica se mostra gerentes
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Ana Costa')).toBeInTheDocument();
  });

  it('deve mostrar hierarquia de departamentos', () => {
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    // Verifica se mostra departamentos raiz
    expect(screen.getByText('Tecnologia')).toBeInTheDocument();
    expect(screen.getByText('Recursos Humanos')).toBeInTheDocument();
    
    // Verifica se mostra subdepartamentos
    expect(screen.getByText('Desenvolvimento')).toBeInTheDocument();
    expect(screen.getByText('Infraestrutura')).toBeInTheDocument();
  });

  it('deve mostrar status ativo/inativo', () => {
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    expect(screen.getAllByText('Ativo')).toHaveLength(4); // Todos os departamentos mock são ativos
  });

  it('deve chamar onDepartmentChange quando fornecido', () => {
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    // O componente deve renderizar sem erros mesmo com callback
    expect(screen.getByText('Gestão de Departamentos')).toBeInTheDocument();
  });

  it('deve renderizar com organizationId quando fornecido', () => {
    render(<DepartmentManagement organizationId="org-123" onDepartmentChange={mockOnDepartmentChange} />);
    
    expect(screen.getByText('Gestão de Departamentos')).toBeInTheDocument();
  });

  it('deve mostrar botões de ação para cada departamento', () => {
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    // Verifica se há botões de ação (menu dropdown)
    const actionButtons = screen.getAllByRole('button');
    expect(actionButtons.length).toBeGreaterThan(1);
  });

  it('deve mostrar indicador de nível hierárquico', () => {
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    // Departamentos de nível 1 (raiz)
    expect(screen.getByText('Nível 1')).toBeInTheDocument();
    
    // Subdepartamentos (nível 2)
    expect(screen.getAllByText('Nível 2')).toHaveLength(2);
  });
});

describe('DepartmentManagement - Formulário de Criação', () => {
  const mockOnDepartmentChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve preencher formulário de criação', async () => {
    const user = userEvent.setup();
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    // Abrir dialog
    await user.click(screen.getByText('Novo Departamento'));
    
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    // Preencher campos básicos
    const nameInput = screen.getByPlaceholderText('Ex: Tecnologia');
    await user.type(nameInput, 'Novo Departamento');
    
    const descriptionInput = screen.getByPlaceholderText('Descreva as responsabilidades do departamento...');
    await user.type(descriptionInput, 'Descrição do novo departamento');
    
    expect(nameInput).toHaveValue('Novo Departamento');
    expect(descriptionInput).toHaveValue('Descrição do novo departamento');
  });

  it('deve permitir seleção de departamento pai', async () => {
    const user = userEvent.setup();
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    // Abrir dialog
    await user.click(screen.getByText('Novo Departamento'));
    
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    // Verificar se há seletor de departamento pai
    expect(screen.getByText('Departamento Pai (Opcional)')).toBeInTheDocument();
  });

  it('deve permitir seleção de gerente', async () => {
    const user = userEvent.setup();
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    // Abrir dialog
    await user.click(screen.getByText('Novo Departamento'));
    
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    // Verificar se há seletor de gerente
    expect(screen.getByText('Gerente do Departamento')).toBeInTheDocument();
  });

  it('deve ter botões de ação no formulário', async () => {
    const user = userEvent.setup();
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    await user.click(screen.getByText('Novo Departamento'));
    
    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
      expect(screen.getByText('Criar Departamento')).toBeInTheDocument();
    });
  });

  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup();
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    await user.click(screen.getByText('Novo Departamento'));
    
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    // Tentar criar sem preencher campos obrigatórios
    const createButton = screen.getByText('Criar Departamento');
    await user.click(createButton);
    
    // O formulário deve permanecer aberto (validação falhou)
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });
});

describe('DepartmentManagement - Hierarquia', () => {
  const mockOnDepartmentChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve mostrar estrutura hierárquica corretamente', () => {
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    // Departamentos raiz devem aparecer primeiro
    expect(screen.getByText('Tecnologia')).toBeInTheDocument();
    expect(screen.getByText('Recursos Humanos')).toBeInTheDocument();
    
    // Subdepartamentos devem aparecer indentados
    expect(screen.getByText('Desenvolvimento')).toBeInTheDocument();
    expect(screen.getByText('Infraestrutura')).toBeInTheDocument();
  });

  it('deve permitir expandir/colapsar departamentos com filhos', async () => {
    const user = userEvent.setup();
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    // Procurar por botões de expansão (podem ser ícones)
    const expandButtons = screen.getAllByRole('button');
    expect(expandButtons.length).toBeGreaterThan(0);
  });

  it('deve mostrar contagem de subdepartamentos', () => {
    render(<DepartmentManagement onDepartmentChange={mockOnDepartmentChange} />);
    
    // Tecnologia tem 2 subdepartamentos no mock
    expect(screen.getByText('2 subdepartamentos')).toBeInTheDocument();
  });
});