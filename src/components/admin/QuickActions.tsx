import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Plus,
  UserPlus,
  FileText,
  Award,
  MessageSquare,
  Download,
  Upload,
  RefreshCw,
  Zap,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { QuickAction } from '@/types/admin';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  actions?: QuickAction[];
  userPermissions?: string[];
  onActionClick?: (action: QuickAction) => void;
  className?: string;
}

interface ActionCardProps {
  action: QuickAction;
  onClick?: () => void;
  disabled?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ action, onClick, disabled = false }) => {
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'users': <Users className="h-5 w-5" />,
      'user-plus': <UserPlus className="h-5 w-5" />,
      'book-open': <BookOpen className="h-5 w-5" />,
      'plus': <Plus className="h-5 w-5" />,
      'bar-chart-3': <BarChart3 className="h-5 w-5" />,
      'settings': <Settings className="h-5 w-5" />,
      'file-text': <FileText className="h-5 w-5" />,
      'award': <Award className="h-5 w-5" />,
      'message-square': <MessageSquare className="h-5 w-5" />,
      'download': <Download className="h-5 w-5" />,
      'upload': <Upload className="h-5 w-5" />,
      'refresh-cw': <RefreshCw className="h-5 w-5" />,
      'zap': <Zap className="h-5 w-5" />
    };
    
    return iconMap[iconName] || <Zap className="h-5 w-5" />;
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      'blue': 'bg-blue-500 hover:bg-blue-600 text-white',
      'green': 'bg-green-500 hover:bg-green-600 text-white',
      'purple': 'bg-purple-500 hover:bg-purple-600 text-white',
      'orange': 'bg-orange-500 hover:bg-orange-600 text-white',
      'red': 'bg-red-500 hover:bg-red-600 text-white',
      'gray': 'bg-gray-500 hover:bg-gray-600 text-white',
      'indigo': 'bg-indigo-500 hover:bg-indigo-600 text-white',
      'pink': 'bg-pink-500 hover:bg-pink-600 text-white'
    };
    
    return colorMap[color] || 'bg-blue-500 hover:bg-blue-600 text-white';
  };

  return (
    <Card className={cn(
      'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105',
      disabled && 'opacity-50 cursor-not-allowed'
    )}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={cn(
            'p-3 rounded-lg transition-colors',
            getColorClasses(action.color)
          )}>
            {getIcon(action.icon)}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {action.description}
            </p>
          </div>
          
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
};

const defaultActions: QuickAction[] = [
  {
    id: 'create-user',
    title: 'Criar Usuário',
    description: 'Adicionar novo usuário à plataforma',
    icon: 'user-plus',
    url: '/admin/users/new',
    color: 'blue',
    permissions: ['users.create']
  },
  {
    id: 'create-course',
    title: 'Criar Curso',
    description: 'Desenvolver novo curso na plataforma',
    icon: 'plus',
    url: '/admin/courses/new',
    color: 'green',
    permissions: ['courses.create']
  },
  {
    id: 'manage-users',
    title: 'Gerenciar Usuários',
    description: 'Visualizar e editar usuários',
    icon: 'users',
    url: '/admin/users',
    color: 'purple',
    permissions: ['users.read']
  },
  {
    id: 'view-analytics',
    title: 'Analytics',
    description: 'Visualizar relatórios e métricas',
    icon: 'bar-chart-3',
    url: '/admin/analytics',
    color: 'orange',
    permissions: ['analytics.read']
  },
  {
    id: 'system-settings',
    title: 'Configurações',
    description: 'Configurar sistema e preferências',
    icon: 'settings',
    url: '/admin/settings',
    color: 'gray',
    permissions: ['system.configure']
  },
  {
    id: 'create-report',
    title: 'Gerar Relatório',
    description: 'Criar relatórios personalizados',
    icon: 'file-text',
    url: '/admin/reports/new',
    color: 'indigo',
    permissions: ['reports.create']
  },
  {
    id: 'manage-badges',
    title: 'Gerenciar Badges',
    description: 'Configurar badges e conquistas',
    icon: 'award',
    url: '/admin/badges',
    color: 'pink',
    permissions: ['gamification.manage']
  },
  {
    id: 'bulk-communication',
    title: 'Comunicação em Massa',
    description: 'Enviar mensagens para múltiplos usuários',
    icon: 'message-square',
    url: '/admin/communication',
    color: 'blue',
    permissions: ['communication.send']
  },
  {
    id: 'export-data',
    title: 'Exportar Dados',
    description: 'Baixar dados da plataforma',
    icon: 'download',
    url: '/admin/export',
    color: 'green',
    permissions: ['data.export']
  },
  {
    id: 'import-data',
    title: 'Importar Dados',
    description: 'Carregar dados em lote',
    icon: 'upload',
    url: '/admin/import',
    color: 'purple',
    permissions: ['data.import']
  },
  {
    id: 'system-maintenance',
    title: 'Manutenção',
    description: 'Executar tarefas de manutenção',
    icon: 'refresh-cw',
    url: '/admin/maintenance',
    color: 'orange',
    permissions: ['system.maintain']
  },
  {
    id: 'ai-insights',
    title: 'Insights IA',
    description: 'Visualizar análises de IA',
    icon: 'zap',
    url: '/admin/ai-insights',
    color: 'indigo',
    permissions: ['ai.insights']
  }
];

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions = defaultActions,
  userPermissions = [],
  onActionClick,
  className
}) => {
  const navigate = useNavigate();
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const hasPermission = (requiredPermissions?: string[]) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  };

  const filteredActions = actions.filter(action => hasPermission(action.permissions));

  const handleActionClick = (action: QuickAction) => {
    if (onActionClick) {
      onActionClick(action);
    } else {
      // Navegação padrão
      if (action.url.startsWith('http')) {
        window.open(action.url, '_blank');
      } else {
        navigate(action.url);
      }
    }
  };

  const groupedActions = {
    primary: filteredActions.slice(0, 4),
    secondary: filteredActions.slice(4, 8),
    advanced: filteredActions.slice(8)
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Ações Rápidas
          </h2>
          <p className="text-sm text-muted-foreground">
            Acesso rápido às funcionalidades mais utilizadas
          </p>
        </div>
        
        <Badge variant="secondary" className="text-sm">
          {filteredActions.length} ações disponíveis
        </Badge>
      </div>

      {/* Ações Primárias */}
      {groupedActions.primary.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Ações Principais
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {groupedActions.primary.map((action) => (
              <div
                key={action.id}
                onClick={() => handleActionClick(action)}
                onMouseEnter={() => setHoveredAction(action.id)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <ActionCard action={action} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações Secundárias */}
      {groupedActions.secondary.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Gerenciamento
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {groupedActions.secondary.map((action) => (
              <Card
                key={action.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleActionClick(action)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'p-2 rounded-md',
                      `bg-${action.color}-100 text-${action.color}-600`
                    )}>
                      {(() => {
                        const iconMap: Record<string, React.ReactNode> = {
                          'users': <Users className="h-4 w-4" />,
                          'bar-chart-3': <BarChart3 className="h-4 w-4" />,
                          'settings': <Settings className="h-4 w-4" />,
                          'file-text': <FileText className="h-4 w-4" />,
                          'award': <Award className="h-4 w-4" />,
                          'message-square': <MessageSquare className="h-4 w-4" />
                        };
                        return iconMap[action.icon] || <Zap className="h-4 w-4" />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ações Avançadas */}
      {groupedActions.advanced.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-muted-foreground" />
            Ferramentas Avançadas
          </h3>
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
            {groupedActions.advanced.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="justify-start h-auto p-3"
                onClick={() => handleActionClick(action)}
              >
                <div className="flex items-center space-x-2 w-full">
                  {(() => {
                    const iconMap: Record<string, React.ReactNode> = {
                      'download': <Download className="h-4 w-4" />,
                      'upload': <Upload className="h-4 w-4" />,
                      'refresh-cw': <RefreshCw className="h-4 w-4" />,
                      'zap': <Zap className="h-4 w-4" />
                    };
                    return iconMap[action.icon] || <Zap className="h-4 w-4" />;
                  })()}
                  <div className="text-left">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem quando não há ações disponíveis */}
      {filteredActions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma ação disponível</h3>
            <p className="text-muted-foreground">
              Você não tem permissões para executar ações rápidas no momento.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dica de uso */}
      {filteredActions.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Dica</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Use as ações rápidas para acessar rapidamente as funcionalidades mais utilizadas. 
                  As ações disponíveis dependem das suas permissões no sistema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickActions;