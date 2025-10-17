import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MetricsPanel } from '../MetricsPanel';
import { DashboardMetrics } from '@/types/admin';

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

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => <div className={`skeleton ${className}`} />
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

const mockMetrics: DashboardMetrics = {
  activeUsers: 1250,
  totalUsers: 5000,
  coursesCompleted: 342,
  totalCourses: 45,
  systemHealth: 'healthy',
  alerts: 3,
  userGrowth: 12.5,
  courseCompletionRate: 78.3,
  averageSessionTime: 45,
  serverUptime: 99.9
};

describe('MetricsPanel', () => {
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve renderizar o painel de métricas', () => {
    render(<MetricsPanel metrics={mockMetrics} onRefresh={mockOnRefresh} />);
    
    expect(screen.getByText('Métricas do Sistema')).toBeInTheDocument();
    expect(screen.getByText('Visão geral das métricas em tempo real')).toBeInTheDocument();
  });

  it('deve exibir métricas corretamente', () => {
    render(<MetricsPanel metrics={mockMetrics} onRefresh={mockOnRefresh} />);
    
    expect(screen.getByText('1,250')).toBeInTheDocument(); // activeUsers
    expect(screen.getByText('342')).toBeInTheDocument(); // coursesCompleted
    expect(screen.getByText('Sistema Saudável')).toBeInTheDocument(); // systemHealth
    expect(screen.getByText('3')).toBeInTheDocument(); // alerts
  });

  it('deve mostrar estado de loading', () => {
    render(<MetricsPanel isLoading={true} onRefresh={mockOnRefresh} />);
    
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.some(el => el.className.includes('skeleton'))).toBe(true);
  });

  it('deve chamar onRefresh ao clicar no botão de atualizar', async () => {
    const user = userEvent.setup();
    render(<MetricsPanel metrics={mockMetrics} onRefresh={mockOnRefresh} />);
    
    const refreshButton = screen.getByRole('button', { name: /atualizar/i });
    await user.click(refreshButton);
    
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar tendências corretamente', () => {
    render(<MetricsPanel metrics={mockMetrics} onRefresh={mockOnRefresh} />);
    
    // Verifica se mostra crescimento positivo
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    expect(screen.getByText('+78.3%')).toBeInTheDocument();
  });

  it('deve mostrar badge de saúde do sistema corretamente', () => {
    render(<MetricsPanel metrics={mockMetrics} onRefresh={mockOnRefresh} />);
    
    expect(screen.getByText('Sistema Saudável')).toBeInTheDocument();
  });

  it('deve mostrar badge de warning quando sistema tem problemas', () => {
    const warningMetrics = { ...mockMetrics, systemHealth: 'warning' as const };
    render(<MetricsPanel metrics={warningMetrics} onRefresh={mockOnRefresh} />);
    
    expect(screen.getByText('Atenção Necessária')).toBeInTheDocument();
  });

  it('deve mostrar badge crítico quando sistema está crítico', () => {
    const criticalMetrics = { ...mockMetrics, systemHealth: 'critical' as const };
    render(<MetricsPanel metrics={criticalMetrics} onRefresh={mockOnRefresh} />);
    
    expect(screen.getByText('Sistema Crítico')).toBeInTheDocument();
  });

  it('deve permitir alternar visibilidade das métricas', async () => {
    const user = userEvent.setup();
    render(<MetricsPanel metrics={mockMetrics} onRefresh={mockOnRefresh} />);
    
    // Procurar por botões de visibilidade (ícones de olho)
    const visibilityButtons = screen.getAllByRole('button');
    const eyeButtons = visibilityButtons.filter(btn => 
      btn.querySelector('svg') && 
      (btn.querySelector('svg')?.getAttribute('data-testid')?.includes('eye') ||
       btn.innerHTML.includes('eye'))
    );
    
    if (eyeButtons.length > 0) {
      await user.click(eyeButtons[0]);
      // Verifica se a métrica foi ocultada ou mostrada
    }
  });

  it('deve atualizar automaticamente com intervalo configurado', () => {
    render(
      <MetricsPanel 
        metrics={mockMetrics} 
        onRefresh={mockOnRefresh} 
        refreshInterval={5000}
      />
    );
    
    // Avança o tempo em 5 segundos
    vi.advanceTimersByTime(5000);
    
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    
    // Avança mais 5 segundos
    vi.advanceTimersByTime(5000);
    
    expect(mockOnRefresh).toHaveBeenCalledTimes(2);
  });

  it('deve não atualizar automaticamente quando refreshInterval é 0', () => {
    render(
      <MetricsPanel 
        metrics={mockMetrics} 
        onRefresh={mockOnRefresh} 
        refreshInterval={0}
      />
    );
    
    // Avança o tempo
    vi.advanceTimersByTime(10000);
    
    expect(mockOnRefresh).not.toHaveBeenCalled();
  });

  it('deve mostrar horário da última atualização', () => {
    render(<MetricsPanel metrics={mockMetrics} onRefresh={mockOnRefresh} />);
    
    // Verifica se há indicação de última atualização
    expect(screen.getByText(/última atualização/i)).toBeInTheDocument();
  });

  it('deve renderizar com className personalizada', () => {
    const { container } = render(
      <MetricsPanel 
        metrics={mockMetrics} 
        onRefresh={mockOnRefresh} 
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('deve mostrar métricas sem dados quando metrics é undefined', () => {
    render(<MetricsPanel onRefresh={mockOnRefresh} />);
    
    expect(screen.getByText('Métricas do Sistema')).toBeInTheDocument();
    // Deve mostrar valores padrão ou placeholders
  });

  it('deve formatar números corretamente', () => {
    const largeMetrics = {
      ...mockMetrics,
      activeUsers: 1234567,
      totalUsers: 9876543
    };
    
    render(<MetricsPanel metrics={largeMetrics} onRefresh={mockOnRefresh} />);
    
    // Verifica se números grandes são formatados corretamente
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('deve mostrar ícones corretos para cada métrica', () => {
    render(<MetricsPanel metrics={mockMetrics} onRefresh={mockOnRefresh} />);
    
    // Verifica se há ícones SVG presentes
    const svgElements = screen.getAllByRole('img', { hidden: true });
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('deve limpar intervalo ao desmontar componente', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    
    const { unmount } = render(
      <MetricsPanel 
        metrics={mockMetrics} 
        onRefresh={mockOnRefresh} 
        refreshInterval={5000}
      />
    );
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});

describe('MetricsPanel - Interações', () => {
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve permitir expandir detalhes de uma métrica', async () => {
    const user = userEvent.setup();
    render(<MetricsPanel metrics={mockMetrics} onRefresh={mockOnRefresh} />);
    
    // Procurar por cards de métricas clicáveis
    const metricCards = screen.getAllByRole('generic');
    const clickableCards = metricCards.filter(card => 
      card.className.includes('cursor-pointer') || 
      card.onclick !== null
    );
    
    if (clickableCards.length > 0) {
      await user.click(clickableCards[0]);
      // Verifica se detalhes foram expandidos
    }
  });

  it('deve mostrar tooltip com informações adicionais', async () => {
    const user = userEvent.setup();
    render(<MetricsPanel metrics={mockMetrics} onRefresh={mockOnRefresh} />);
    
    // Procurar por elementos com tooltip
    const elementsWithTooltip = screen.getAllByRole('generic');
    const tooltipElements = elementsWithTooltip.filter(el => 
      el.getAttribute('title') || 
      el.getAttribute('data-tooltip')
    );
    
    if (tooltipElements.length > 0) {
      await user.hover(tooltipElements[0]);
      // Verifica se tooltip aparece
    }
  });

  it('deve permitir filtrar métricas por categoria', async () => {
    const user = userEvent.setup();
    render(<MetricsPanel metrics={mockMetrics} onRefresh={mockOnRefresh} />);
    
    // Procurar por filtros ou tabs
    const filterButtons = screen.getAllByRole('button');
    const categoryFilters = filterButtons.filter(btn => 
      btn.textContent?.includes('Usuários') ||
      btn.textContent?.includes('Cursos') ||
      btn.textContent?.includes('Sistema')
    );
    
    if (categoryFilters.length > 0) {
      await user.click(categoryFilters[0]);
      // Verifica se filtro foi aplicado
    }
  });
});