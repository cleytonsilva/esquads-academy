import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BookOpen, 
  Star,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { ExecutiveKPIs } from '@/types/admin';
import { cn } from '@/lib/utils';

interface KPIOverviewProps {
  kpis?: ExecutiveKPIs;
  isLoading?: boolean;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  onTimeframeChange?: (timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly') => void;
  className?: string;
}

interface KPICardProps {
  title: string;
  value: string | number;
  target?: number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
  description?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  target,
  change,
  icon,
  trend = 'neutral',
  format = 'number',
  description
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    if (change === undefined) return null;
    
    const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
    
    return (
      <div className={cn('flex items-center text-sm', getTrendColor())}>
        <TrendIcon className="h-4 w-4 mr-1" />
        {Math.abs(change)}%
      </div>
    );
  };

  const getTargetProgress = () => {
    if (!target || typeof value !== 'number') return null;
    
    const progress = (value / target) * 100;
    const isOnTarget = progress >= 90;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Meta: {formatValue(target)}</span>
          <span className={cn(
            'font-medium',
            isOnTarget ? 'text-green-600' : progress >= 70 ? 'text-yellow-600' : 'text-red-600'
          )}>
            {progress.toFixed(1)}%
          </span>
        </div>
        <Progress 
          value={Math.min(progress, 100)} 
          className={cn(
            'h-2',
            isOnTarget ? 'bg-green-100' : progress >= 70 ? 'bg-yellow-100' : 'bg-red-100'
          )}
        />
      </div>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {formatValue(value)}
          </div>
          {getTrendIcon()}
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        {getTargetProgress()}
      </CardContent>
    </Card>
  );
};

const PerformanceIndicator: React.FC<{
  label: string;
  value: number;
  target: number;
  unit?: string;
}> = ({ label, value, target, unit = '' }) => {
  const percentage = (value / target) * 100;
  const status = percentage >= 90 ? 'excellent' : percentage >= 70 ? 'good' : 'needs-improvement';
  
  const getStatusColor = () => {
    switch (status) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'excellent':
        return 'Excelente';
      case 'good':
        return 'Bom';
      default:
        return 'Precisa Melhorar';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-1">
        <p className="font-medium">{label}</p>
        <p className="text-2xl font-bold">
          {value.toLocaleString()}{unit}
        </p>
        <p className="text-sm text-muted-foreground">
          Meta: {target.toLocaleString()}{unit}
        </p>
      </div>
      <div className="text-right space-y-2">
        <Badge className={cn('text-white', getStatusColor())}>
          {getStatusText()}
        </Badge>
        <div className="text-sm font-medium">
          {percentage.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

export const KPIOverview: React.FC<KPIOverviewProps> = ({
  kpis,
  isLoading = false,
  timeframe = 'monthly',
  onTimeframeChange,
  className
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            KPIs Executivos
          </h2>
          <p className="text-sm text-muted-foreground">
            Indicadores chave de performance da plataforma
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Tabs value={timeframe} onValueChange={onTimeframeChange}>
            <TabsList>
              <TabsTrigger value="daily">Diário</TabsTrigger>
              <TabsTrigger value="weekly">Semanal</TabsTrigger>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="quarterly">Trimestral</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="targets">Metas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Engajamento de Usuários"
              value={kpis?.userEngagement ?? 0}
              change={15}
              trend="up"
              format="percentage"
              icon={<Activity className="h-4 w-4" />}
              description="Taxa de usuários ativos mensalmente"
            />
            
            <KPICard
              title="Taxa de Conclusão"
              value={kpis?.completionRate ?? 0}
              change={8}
              trend="up"
              format="percentage"
              icon={<Target className="h-4 w-4" />}
              description="Percentual de cursos concluídos"
            />
            
            <KPICard
              title="Receita"
              value={kpis?.revenue ?? 0}
              change={22}
              trend="up"
              format="currency"
              icon={<DollarSign className="h-4 w-4" />}
              description="Receita total do período"
            />
            
            <KPICard
              title="Crescimento Mensal"
              value={kpis?.monthlyGrowth ?? 0}
              change={5}
              trend="up"
              format="percentage"
              icon={<TrendingUp className="h-4 w-4" />}
              description="Crescimento em relação ao mês anterior"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Avaliação Média"
              value={kpis?.averageRating ?? 0}
              target={4.5}
              icon={<Star className="h-4 w-4" />}
              description="Avaliação média dos cursos"
            />
            
            <KPICard
              title="Total de Usuários"
              value={kpis?.totalUsers ?? 0}
              change={12}
              trend="up"
              icon={<Users className="h-4 w-4" />}
              description="Usuários registrados na plataforma"
            />
            
            <KPICard
              title="Total de Cursos"
              value={kpis?.totalCourses ?? 0}
              change={3}
              trend="up"
              icon={<BookOpen className="h-4 w-4" />}
              description="Cursos disponíveis na plataforma"
            />
            
            <KPICard
              title="Instrutores Ativos"
              value={kpis?.activeInstructors ?? 0}
              change={7}
              trend="up"
              icon={<Users className="h-4 w-4" />}
              description="Instrutores com atividade recente"
            />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Indicadores de Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PerformanceIndicator
                  label="Usuários Ativos Diários"
                  value={kpis?.userEngagement ? Math.round(kpis.userEngagement * 100) : 0}
                  target={1000}
                />
                <PerformanceIndicator
                  label="Taxa de Retenção"
                  value={85}
                  target={90}
                  unit="%"
                />
                <PerformanceIndicator
                  label="Tempo Médio na Plataforma"
                  value={45}
                  target={60}
                  unit=" min"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuição de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Assistindo Vídeos</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fazendo Exercícios</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lendo Material</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="targets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Metas Mensais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Novos Usuários</span>
                    <span className="text-sm font-medium">500 / 600</span>
                  </div>
                  <Progress value={83} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Cursos Concluídos</span>
                    <span className="text-sm font-medium">1200 / 1000</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Receita</span>
                    <span className="text-sm font-medium">R$ 45.000 / R$ 50.000</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Metas Trimestrais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Crescimento de Usuários</span>
                    <span className="text-sm font-medium">25% / 30%</span>
                  </div>
                  <Progress value={83} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Satisfação do Cliente</span>
                    <span className="text-sm font-medium">4.2 / 4.5</span>
                  </div>
                  <Progress value={93} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">ROI da Plataforma</span>
                    <span className="text-sm font-medium">180% / 200%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KPIOverview;