import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { DashboardMetrics } from '@/types/admin';
import { cn } from '@/lib/utils';

interface MetricsPanelProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
  onRefresh?: () => void;
  refreshInterval?: number;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  isVisible = true,
  onToggleVisibility
}) => {
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
    
    return (
      <div className={cn('flex items-center text-sm', getTrendColor())}>
        <TrendingUp className={cn('h-4 w-4 mr-1', {
          'rotate-180': trend === 'down'
        })} />
        {Math.abs(change)}%
      </div>
    );
  };

  if (!isVisible) {
    return (
      <Card className="opacity-50 border-dashed">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Métrica oculta</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleVisibility}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {onToggleVisibility && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleVisibility}
              className="h-8 w-8 p-0"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          )}
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {getTrendIcon()}
        </div>
      </CardContent>
    </Card>
  );
};

const SystemHealthBadge: React.FC<{ health: 'healthy' | 'warning' | 'critical' }> = ({ health }) => {
  const getHealthConfig = () => {
    switch (health) {
      case 'healthy':
        return {
          variant: 'default' as const,
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Sistema Saudável',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'warning':
        return {
          variant: 'secondary' as const,
          icon: <AlertTriangle className="h-4 w-4" />,
          text: 'Atenção Necessária',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'critical':
        return {
          variant: 'destructive' as const,
          icon: <AlertTriangle className="h-4 w-4" />,
          text: 'Sistema Crítico',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
    }
  };

  const config = getHealthConfig();

  return (
    <Badge variant={config.variant} className={cn('flex items-center gap-2', config.className)}>
      {config.icon}
      {config.text}
    </Badge>
  );
};

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  metrics,
  isLoading = false,
  onRefresh,
  refreshInterval = 30000,
  className
}) => {
  const [visibleMetrics, setVisibleMetrics] = useState({
    activeUsers: true,
    coursesCompleted: true,
    systemHealth: true,
    alerts: true
  });

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        onRefresh?.();
        setLastRefresh(new Date());
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, onRefresh]);

  const toggleMetricVisibility = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const handleRefresh = () => {
    onRefresh?.();
    setLastRefresh(new Date());
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Métricas da Plataforma
          </h2>
          <p className="text-sm text-muted-foreground">
            Última atualização: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {metrics?.systemHealth && (
            <SystemHealthBadge health={metrics.systemHealth} />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Usuários Ativos"
          value={metrics?.activeUsers ?? 0}
          change={12}
          trend="up"
          icon={<Users className="h-4 w-4" />}
          isVisible={visibleMetrics.activeUsers}
          onToggleVisibility={() => toggleMetricVisibility('activeUsers')}
        />
        
        <MetricCard
          title="Cursos Concluídos"
          value={metrics?.coursesCompleted ?? 0}
          change={8}
          trend="up"
          icon={<BookOpen className="h-4 w-4" />}
          isVisible={visibleMetrics.coursesCompleted}
          onToggleVisibility={() => toggleMetricVisibility('coursesCompleted')}
        />
        
        <MetricCard
          title="Atividade do Sistema"
          value="98.5%"
          change={0.2}
          trend="up"
          icon={<Activity className="h-4 w-4" />}
          isVisible={visibleMetrics.systemHealth}
          onToggleVisibility={() => toggleMetricVisibility('systemHealth')}
        />
        
        <MetricCard
          title="Alertas Ativos"
          value={metrics?.alerts?.length ?? 0}
          change={-15}
          trend="down"
          icon={<AlertTriangle className="h-4 w-4" />}
          isVisible={visibleMetrics.alerts}
          onToggleVisibility={() => toggleMetricVisibility('alerts')}
        />
      </div>

      {metrics?.alerts && metrics.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={alert.type === 'critical' ? 'destructive' : 
                              alert.type === 'warning' ? 'secondary' : 'default'}
                    >
                      {alert.type}
                    </Badge>
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {alert.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MetricsPanel;