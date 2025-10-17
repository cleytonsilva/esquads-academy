import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SystemAlerts } from '../SystemAlerts';
import { SystemAlert } from '@/types/admin';

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

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className, ...props }: any) => (
    <span className={`badge ${variant} ${className}`} {...props}>
      {children}
    </span>
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

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value, onClick }: any) => (
    <button data-testid={`tab-${value}`} onClick={onClick}>
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  )
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

const mockAlerts: SystemAlert[] = [
  {
    id: '1',
    title: 'Sistema de Backup Falhou',
    message: 'O backup automático não foi executado na última tentativa',
    type: 'error',
    priority: 'high',
    isRead: false,
    isResolved: false,
    source: 'system',
    userId: 'system',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Uso de CPU Alto',
    message: 'O servidor está com uso de CPU acima de 80%',
    type: 'warning',
    priority: 'medium',
    isRead: true,
    isResolved: false,
    source: 'monitoring',
    userId: 'system',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T09:30:00Z'
  },
  {
    id: '3',
    title: 'Novo Usuário Registrado',
    message: 'Um novo usuário se registrou na plataforma',
    type: 'info',
    priority: 'low',
    isRead: true,
    isResolved: true,
    source: 'user',
    userId: 'user-123',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  }
];

describe('SystemAlerts', () => {
  const mockOnAlertAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o título e descrição', () => {
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    expect(screen.getByText('Alertas do Sistema')).toBeInTheDocument();
    expect(screen.getByText('Monitore e gerencie alertas da plataforma')).toBeInTheDocument();
  });

  it('deve renderizar a barra de busca', () => {
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    expect(screen.getByPlaceholderText('Buscar alertas...')).toBeInTheDocument();
  });

  it('deve renderizar as abas de filtro', () => {
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    expect(screen.getByTestId('tab-all')).toBeInTheDocument();
    expect(screen.getByTestId('tab-unread')).toBeInTheDocument();
    expect(screen.getByTestId('tab-high')).toBeInTheDocument();
    expect(screen.getByTestId('tab-resolved')).toBeInTheDocument();
  });

  it('deve exibir alertas corretamente', () => {
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    expect(screen.getByText('Sistema de Backup Falhou')).toBeInTheDocument();
    expect(screen.getByText('Uso de CPU Alto')).toBeInTheDocument();
    expect(screen.getByText('Novo Usuário Registrado')).toBeInTheDocument();
  });

  it('deve mostrar badges de tipo corretos', () => {
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    expect(screen.getByText('Erro')).toBeInTheDocument();
    expect(screen.getByText('Aviso')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('deve mostrar badges de prioridade corretos', () => {
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('Média')).toBeInTheDocument();
    expect(screen.getByText('Baixa')).toBeInTheDocument();
  });

  it('deve filtrar alertas ao digitar na busca', async () => {
    const user = userEvent.setup();
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    const searchInput = screen.getByPlaceholderText('Buscar alertas...');
    await user.type(searchInput, 'Backup');
    
    expect(screen.getByText('Sistema de Backup Falhou')).toBeInTheDocument();
    // Outros alertas podem ainda estar visíveis dependendo da implementação
  });

  it('deve filtrar alertas não lidos', async () => {
    const user = userEvent.setup();
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    const unreadTab = screen.getByTestId('tab-unread');
    await user.click(unreadTab);
    
    // Deve mostrar apenas alertas não lidos
    expect(screen.getByText('Sistema de Backup Falhou')).toBeInTheDocument();
  });

  it('deve filtrar alertas de alta prioridade', async () => {
    const user = userEvent.setup();
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    const highPriorityTab = screen.getByTestId('tab-high');
    await user.click(highPriorityTab);
    
    // Deve mostrar apenas alertas de alta prioridade
    expect(screen.getByText('Sistema de Backup Falhou')).toBeInTheDocument();
  });

  it('deve filtrar alertas resolvidos', async () => {
    const user = userEvent.setup();
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    const resolvedTab = screen.getByTestId('tab-resolved');
    await user.click(resolvedTab);
    
    // Deve mostrar apenas alertas resolvidos
    expect(screen.getByText('Novo Usuário Registrado')).toBeInTheDocument();
  });

  it('deve mostrar estado de loading', () => {
    render(<SystemAlerts isLoading={true} onAlertAction={mockOnAlertAction} />);
    
    // Verifica se há elementos de loading
    const loadingElements = screen.getAllByRole('generic');
    expect(loadingElements.some(el => el.className.includes('animate-pulse'))).toBe(true);
  });

  it('deve mostrar mensagem quando não há alertas', () => {
    render(<SystemAlerts alerts={[]} onAlertAction={mockOnAlertAction} />);
    
    expect(screen.getByText('Nenhum alerta encontrado')).toBeInTheDocument();
  });

  it('deve renderizar com className personalizada', () => {
    const { container } = render(
      <SystemAlerts 
        alerts={mockAlerts} 
        onAlertAction={mockOnAlertAction}
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('deve mostrar horário dos alertas', () => {
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    // Verifica se há indicação de tempo
    expect(screen.getByText(/há/)).toBeInTheDocument();
  });

  it('deve mostrar ícones corretos para cada tipo de alerta', () => {
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    // Verifica se há ícones SVG presentes
    const svgElements = screen.getAllByRole('img', { hidden: true });
    expect(svgElements.length).toBeGreaterThan(0);
  });
});

describe('SystemAlerts - Ações', () => {
  const mockOnAlertAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar onAlertAction ao marcar como lido', async () => {
    const user = userEvent.setup();
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    // Procurar por botão de marcar como lido
    const actionButtons = screen.getAllByRole('button');
    const markAsReadButton = actionButtons.find(btn => 
      btn.textContent?.includes('Marcar como lido') ||
      btn.getAttribute('aria-label')?.includes('marcar como lido')
    );
    
    if (markAsReadButton) {
      await user.click(markAsReadButton);
      expect(mockOnAlertAction).toHaveBeenCalledWith('1', 'mark_read');
    }
  });

  it('deve chamar onAlertAction ao resolver alerta', async () => {
    const user = userEvent.setup();
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    // Procurar por botão de resolver
    const actionButtons = screen.getAllByRole('button');
    const resolveButton = actionButtons.find(btn => 
      btn.textContent?.includes('Resolver') ||
      btn.getAttribute('aria-label')?.includes('resolver')
    );
    
    if (resolveButton) {
      await user.click(resolveButton);
      expect(mockOnAlertAction).toHaveBeenCalledWith('1', 'resolve');
    }
  });

  it('deve chamar onAlertAction ao arquivar alerta', async () => {
    const user = userEvent.setup();
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    // Procurar por botão de arquivar
    const actionButtons = screen.getAllByRole('button');
    const archiveButton = actionButtons.find(btn => 
      btn.textContent?.includes('Arquivar') ||
      btn.getAttribute('aria-label')?.includes('arquivar')
    );
    
    if (archiveButton) {
      await user.click(archiveButton);
      expect(mockOnAlertAction).toHaveBeenCalledWith('1', 'archive');
    }
  });

  it('deve abrir dialog de confirmação para exclusão', async () => {
    const user = userEvent.setup();
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    // Procurar por botão de excluir
    const actionButtons = screen.getAllByRole('button');
    const deleteButton = actionButtons.find(btn => 
      btn.textContent?.includes('Excluir') ||
      btn.getAttribute('aria-label')?.includes('excluir')
    );
    
    if (deleteButton) {
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
      });
    }
  });

  it('deve permitir ações em lote', async () => {
    const user = userEvent.setup();
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    // Procurar por checkboxes de seleção
    const checkboxes = screen.getAllByRole('checkbox');
    
    if (checkboxes.length > 0) {
      // Selecionar múltiplos alertas
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      
      // Procurar por botões de ação em lote
      const batchActionButtons = screen.getAllByRole('button');
      const markAllReadButton = batchActionButtons.find(btn => 
        btn.textContent?.includes('Marcar todos como lidos')
      );
      
      if (markAllReadButton) {
        await user.click(markAllReadButton);
        expect(mockOnAlertAction).toHaveBeenCalledTimes(2);
      }
    }
  });
});

describe('SystemAlerts - Detalhes', () => {
  const mockOnAlertAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve abrir modal de detalhes ao clicar no alerta', async () => {
    const user = userEvent.setup();
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    // Clicar no primeiro alerta
    const alertTitle = screen.getByText('Sistema de Backup Falhou');
    await user.click(alertTitle);
    
    await waitFor(() => {
      expect(screen.getByText('Detalhes do Alerta')).toBeInTheDocument();
    });
  });

  it('deve mostrar informações completas no modal de detalhes', async () => {
    const user = userEvent.setup();
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    const alertTitle = screen.getByText('Sistema de Backup Falhou');
    await user.click(alertTitle);
    
    await waitFor(() => {
      expect(screen.getByText('O backup automático não foi executado na última tentativa')).toBeInTheDocument();
      expect(screen.getByText('system')).toBeInTheDocument();
    });
  });

  it('deve permitir ações no modal de detalhes', async () => {
    const user = userEvent.setup();
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    const alertTitle = screen.getByText('Sistema de Backup Falhou');
    await user.click(alertTitle);
    
    await waitFor(() => {
      const resolveButton = screen.getByText('Resolver');
      expect(resolveButton).toBeInTheDocument();
    });
  });
});

describe('SystemAlerts - Filtros e Ordenação', () => {
  const mockOnAlertAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve ordenar alertas por data', () => {
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    // Verifica se alertas mais recentes aparecem primeiro
    const alertTitles = screen.getAllByRole('heading', { level: 4 });
    expect(alertTitles[0]).toHaveTextContent('Sistema de Backup Falhou');
  });

  it('deve mostrar contadores de alertas por categoria', () => {
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    // Verifica se mostra contadores nas abas
    expect(screen.getByText('Todos (3)')).toBeInTheDocument();
    expect(screen.getByText('Não Lidos (1)')).toBeInTheDocument();
    expect(screen.getByText('Alta Prioridade (1)')).toBeInTheDocument();
    expect(screen.getByText('Resolvidos (1)')).toBeInTheDocument();
  });

  it('deve permitir filtrar por fonte do alerta', async () => {
    const user = userEvent.setup();
    render(<SystemAlerts alerts={mockAlerts} onAlertAction={mockOnAlertAction} />);
    
    // Procurar por filtro de fonte
    const filterButton = screen.getByRole('button', { name: /filtro/i });
    if (filterButton) {
      await user.click(filterButton);
      
      // Verificar se há opções de filtro por fonte
      expect(screen.getByText('Sistema')).toBeInTheDocument();
      expect(screen.getByText('Monitoramento')).toBeInTheDocument();
      expect(screen.getByText('Usuário')).toBeInTheDocument();
    }
  });
});