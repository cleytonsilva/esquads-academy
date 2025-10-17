import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Search, 
  Filter,
  Clock,
  User,
  Bell,
  BellOff,
  Archive,
  Trash2,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { SystemAlert } from '@/types/admin';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SystemAlertsProps {
  alerts?: SystemAlert[];
  isLoading?: boolean;
  onAcknowledge?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  onDelete?: (alertId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface AlertCardProps {
  alert: SystemAlert;
  onAcknowledge?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  onDelete?: (alertId: string) => void;
  onView?: (alert: SystemAlert) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onAcknowledge,
  onDismiss,
  onDelete,
  onView
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertBadgeVariant = () => {
    switch (alert.type) {
      case 'critical':
        return 'destructive' as const;
      case 'warning':
        return 'secondary' as const;
      case 'info':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  const getAlertBadgeClass = () => {
    switch (alert.type) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return '';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  return (
    <>
      <Card className={cn(
        'transition-all hover:shadow-md',
        alert.acknowledged ? 'opacity-75 border-green-200 bg-green-50/30' : '',
        alert.type === 'critical' && !alert.acknowledged ? 'border-red-200 bg-red-50/30' : ''
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between space-x-4">
            <div className="flex items-start space-x-3 flex-1">
              {getAlertIcon()}
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={getAlertBadgeVariant()}
                    className={cn('capitalize', getAlertBadgeClass())}
                  >
                    {alert.type}
                  </Badge>
                  {alert.acknowledged && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Reconhecido
                    </Badge>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {alert.message}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(alert.timestamp)}</span>
                  </div>
                  {alert.acknowledgedBy && (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>por {alert.acknowledgedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(alert)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </DropdownMenuItem>
                {!alert.acknowledged && (
                  <DropdownMenuItem onClick={() => onAcknowledge?.(alert.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Reconhecer
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDismiss?.(alert.id)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Arquivar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Alerta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este alerta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.(alert.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const AlertDetailModal: React.FC<{
  alert: SystemAlert | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ alert, isOpen, onClose }) => {
  if (!alert) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            {alert.type === 'critical' && <AlertTriangle className="h-5 w-5 text-red-500" />}
            {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
            {alert.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
            <span>{alert.title}</span>
          </AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Mensagem</h4>
            <p className="text-sm text-muted-foreground">{alert.message}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Tipo</h4>
              <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                {alert.type}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data/Hora</h4>
              <p className="text-sm">{alert.timestamp.toLocaleString()}</p>
            </div>
          </div>
          
          {alert.acknowledgedBy && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Reconhecido por</h4>
                <p className="text-sm">{alert.acknowledgedBy}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Reconhecido em</h4>
                <p className="text-sm">{alert.acknowledgedAt?.toLocaleString()}</p>
              </div>
            </div>
          )}
          
          {alert.metadata && Object.keys(alert.metadata).length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Metadados</h4>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(alert.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Fechar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const SystemAlerts: React.FC<SystemAlertsProps> = ({
  alerts = [],
  isLoading = false,
  onAcknowledge,
  onDismiss,
  onDelete,
  onRefresh,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'acknowledged' | 'unacknowledged'>('all');
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'acknowledged' && alert.acknowledged) ||
                         (filterStatus === 'unacknowledged' && !alert.acknowledged);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const alertCounts = {
    total: alerts.length,
    critical: alerts.filter(a => a.type === 'critical' && !a.acknowledged).length,
    warning: alerts.filter(a => a.type === 'warning' && !a.acknowledged).length,
    info: alerts.filter(a => a.type === 'info' && !a.acknowledged).length,
    acknowledged: alerts.filter(a => a.acknowledged).length
  };

  const handleViewAlert = (alert: SystemAlert) => {
    setSelectedAlert(alert);
    setShowDetailModal(true);
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Alertas do Sistema
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie alertas e notificações da plataforma
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <Bell className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas dos Alertas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{alertCounts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{alertCounts.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Avisos</p>
                <p className="text-2xl font-bold text-yellow-600">{alertCounts.warning}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Informativos</p>
                <p className="text-2xl font-bold text-blue-600">{alertCounts.info}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Reconhecidos</p>
                <p className="text-2xl font-bold text-green-600">{alertCounts.acknowledged}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alertas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={filterType} onValueChange={(value) => setFilterType(value as any)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="critical">Críticos</TabsTrigger>
            <TabsTrigger value="warning">Avisos</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="unacknowledged">Pendentes</TabsTrigger>
            <TabsTrigger value="acknowledged">Reconhecidos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum alerta encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Não há alertas no momento.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={onAcknowledge}
              onDismiss={onDismiss}
              onDelete={onDelete}
              onView={handleViewAlert}
            />
          ))
        )}
      </div>

      {/* Modal de Detalhes */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};

export default SystemAlerts;