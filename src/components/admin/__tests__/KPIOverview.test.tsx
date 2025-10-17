import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { KPIOverview } from '../KPIOverview';
import { ExecutiveKPIs } from '@/types/admin';

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

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div className={`progress ${className}`} data-value={value}>
      <div style={{ width: `${value}%` }} />
    </div>
  )
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

const mockKPIs: ExecutiveKPIs = {
  userEngagement: 0.75,
  completionRate: 0.82,
  revenue: 125000,
  monthlyGrowth: 0.15,
  averageRating: 4.2,
  totalUsers: 5000,
  totalCourses: 45,
  activeInstructors: 25
};

describe('KPIOverview', () => {
  const mockOnTimeframeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o título e descrição', () => {
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    expect(screen.getByText('KPIs Executivos')).toBeInTheDocument();
    expect(screen.getByText('Indicadores chave de performance da plataforma')).toBeInTheDocument();
  });

  it('deve renderizar as abas de timeframe', () => {
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    expect(screen.getByTestId('tab-daily')).toBeInTheDocument();
    expect(screen.getByTestId('tab-weekly')).toBeInTheDocument();
    expect(screen.getByTestId('tab-monthly')).toBeInTheDocument();
    expect(screen.getByTestId('tab-quarterly')).toBeInTheDocument();
  });

  it('deve renderizar as abas de conteúdo', () => {
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('Metas')).toBeInTheDocument();
  });

  it('deve exibir KPIs corretamente na aba Visão Geral', () => {
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    expect(screen.getByText('Engajamento de Usuários')).toBeInTheDocument();
    expect(screen.getByText('Taxa de Conclusão')).toBeInTheDocument();
    expect(screen.getByText('Receita')).toBeInTheDocument();
    expect(screen.getByText('Crescimento Mensal')).toBeInTheDocument();
  });

  it('deve formatar valores corretamente', () => {
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    // Verifica formatação de percentual
    expect(screen.getByText('75%')).toBeInTheDocument(); // userEngagement
    expect(screen.getByText('82%')).toBeInTheDocument(); // completionRate
    
    // Verifica formatação de moeda
    expect(screen.getByText('R$ 125.000')).toBeInTheDocument(); // revenue
    
    // Verifica formatação de números
    expect(screen.getByText('5.000')).toBeInTheDocument(); // totalUsers
  });

  it('deve mostrar tendências corretamente', () => {
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    // Verifica se mostra mudanças positivas
    expect(screen.getByText('+15%')).toBeInTheDocument();
    expect(screen.getByText('+8%')).toBeInTheDocument();
    expect(screen.getByText('+22%')).toBeInTheDocument();
  });

  it('deve mostrar estado de loading', () => {
    render(<KPIOverview isLoading={true} onTimeframeChange={mockOnTimeframeChange} />);
    
    // Verifica se há elementos de loading (skeleton)
    const loadingElements = screen.getAllByRole('generic');
    expect(loadingElements.some(el => el.className.includes('animate-pulse'))).toBe(true);
  });

  it('deve chamar onTimeframeChange ao alterar timeframe', async () => {
    const user = userEvent.setup();
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    const weeklyTab = screen.getByTestId('tab-weekly');
    await user.click(weeklyTab);
    
    expect(mockOnTimeframeChange).toHaveBeenCalledWith('weekly');
  });

  it('deve usar timeframe padrão quando não especificado', () => {
    render(<KPIOverview kpis={mockKPIs} />);
    
    // Verifica se timeframe padrão é 'monthly'
    const tabsContainer = screen.getByTestId('tabs');
    expect(tabsContainer).toHaveAttribute('data-value', 'monthly');
  });

  it('deve renderizar com className personalizada', () => {
    const { container } = render(
      <KPIOverview 
        kpis={mockKPIs} 
        onTimeframeChange={mockOnTimeframeChange}
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('deve mostrar valores padrão quando kpis é undefined', () => {
    render(<KPIOverview onTimeframeChange={mockOnTimeframeChange} />);
    
    expect(screen.getByText('KPIs Executivos')).toBeInTheDocument();
    // Deve mostrar valores 0 ou placeholders
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('deve mostrar ícones corretos para cada KPI', () => {
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    // Verifica se há ícones SVG presentes
    const svgElements = screen.getAllByRole('img', { hidden: true });
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('deve mostrar descrições dos KPIs', () => {
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    expect(screen.getByText('Taxa de usuários ativos mensalmente')).toBeInTheDocument();
    expect(screen.getByText('Percentual de cursos concluídos')).toBeInTheDocument();
    expect(screen.getByText('Receita total do período')).toBeInTheDocument();
  });
});

describe('KPIOverview - Aba Performance', () => {
  const mockOnTimeframeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve mostrar indicadores de performance', async () => {
    const user = userEvent.setup();
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    // Navegar para aba Performance
    const performanceTab = screen.getByText('Performance');
    await user.click(performanceTab);
    
    await waitFor(() => {
      expect(screen.getByText('Indicadores de Performance')).toBeInTheDocument();
      expect(screen.getByText('Distribuição de Atividades')).toBeInTheDocument();
    });
  });

  it('deve mostrar barras de progresso na aba Performance', async () => {
    const user = userEvent.setup();
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    const performanceTab = screen.getByText('Performance');
    await user.click(performanceTab);
    
    await waitFor(() => {
      const progressBars = screen.getAllByRole('generic');
      expect(progressBars.some(el => el.className.includes('progress'))).toBe(true);
    });
  });

  it('deve mostrar métricas específicas de performance', async () => {
    const user = userEvent.setup();
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    const performanceTab = screen.getByText('Performance');
    await user.click(performanceTab);
    
    await waitFor(() => {
      expect(screen.getByText('Usuários Ativos Diários')).toBeInTheDocument();
      expect(screen.getByText('Taxa de Retenção')).toBeInTheDocument();
      expect(screen.getByText('Tempo Médio na Plataforma')).toBeInTheDocument();
    });
  });
});

describe('KPIOverview - Aba Metas', () => {
  const mockOnTimeframeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve mostrar metas e progresso', async () => {
    const user = userEvent.setup();
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    // Navegar para aba Metas
    const targetsTab = screen.getByText('Metas');
    await user.click(targetsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Progresso das Metas')).toBeInTheDocument();
      expect(screen.getByText('Metas Trimestrais')).toBeInTheDocument();
    });
  });

  it('deve mostrar barras de progresso das metas', async () => {
    const user = userEvent.setup();
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    const targetsTab = screen.getByText('Metas');
    await user.click(targetsTab);
    
    await waitFor(() => {
      const progressBars = screen.getAllByRole('generic');
      expect(progressBars.some(el => el.className.includes('progress'))).toBe(true);
    });
  });

  it('deve mostrar metas específicas', async () => {
    const user = userEvent.setup();
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    const targetsTab = screen.getByText('Metas');
    await user.click(targetsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Receita Mensal')).toBeInTheDocument();
      expect(screen.getByText('Novos Usuários')).toBeInTheDocument();
      expect(screen.getByText('Avaliação Média')).toBeInTheDocument();
    });
  });
});

describe('KPIOverview - Formatação e Cálculos', () => {
  const mockOnTimeframeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve calcular percentuais corretamente', () => {
    const kpisWithDecimals = {
      ...mockKPIs,
      userEngagement: 0.7534,
      completionRate: 0.8267
    };
    
    render(<KPIOverview kpis={kpisWithDecimals} onTimeframeChange={mockOnTimeframeChange} />);
    
    expect(screen.getByText('75%')).toBeInTheDocument(); // Arredondado
    expect(screen.getByText('83%')).toBeInTheDocument(); // Arredondado
  });

  it('deve formatar valores monetários corretamente', () => {
    const kpisWithLargeRevenue = {
      ...mockKPIs,
      revenue: 1234567
    };
    
    render(<KPIOverview kpis={kpisWithLargeRevenue} onTimeframeChange={mockOnTimeframeChange} />);
    
    expect(screen.getByText('R$ 1.234.567')).toBeInTheDocument();
  });

  it('deve mostrar valores de meta quando fornecidos', () => {
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    // Verifica se mostra metas para avaliação
    expect(screen.getByText('Meta: 4,5')).toBeInTheDocument();
  });

  it('deve calcular progresso em relação às metas', () => {
    render(<KPIOverview kpis={mockKPIs} onTimeframeChange={mockOnTimeframeChange} />);
    
    // Avaliação atual: 4.2, Meta: 4.5 = 93% de progresso
    const progressBars = screen.getAllByRole('generic');
    const ratingProgress = progressBars.find(el => 
      el.getAttribute('data-value') === '93'
    );
    expect(ratingProgress).toBeInTheDocument();
  });
});