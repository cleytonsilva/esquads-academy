import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { BaseLayout } from './BaseLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/utils/constants';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Settings, 
  Award,
  Trophy,
  FileText,
  Target,
  Shield,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Terminal,
  ClipboardList,
  Brain,
  HelpCircle,
  Route
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  
  const navigationItems = [
    { icon: BarChart3, label: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD },
    { icon: Users, label: 'Usuários', href: ROUTES.ADMIN_USERS },
    { icon: BookOpen, label: 'Cursos', href: ROUTES.ADMIN_COURSES },
    { icon: Route, label: 'Trilhas', href: ROUTES.ADMIN_PATHS },
    { icon: Target, label: 'Missões', href: ROUTES.ADMIN_MISSIONS },
    { icon: HelpCircle, label: 'Banco de Questões', href: ROUTES.ADMIN_QUESTIONS },
    { icon: Brain, label: 'Gerador de Simulados', href: ROUTES.ADMIN_SIMULATION_GENERATOR },
    { icon: ClipboardList, label: 'Exames', href: ROUTES.ADMIN_EXAMS },
    { icon: Terminal, label: 'Simulados', href: ROUTES.ADMIN_SIMULATORS },
    { icon: Award, label: 'Badges', href: ROUTES.ADMIN_BADGES },
    { icon: Trophy, label: 'Conquistas', href: ROUTES.ADMIN_ACHIEVEMENTS },
    { icon: BarChart3, label: 'Analytics', href: ROUTES.ADMIN_ANALYTICS },
    { icon: FileText, label: 'Relatórios', href: ROUTES.ADMIN_REPORTS },
    { icon: Settings, label: 'Configurações', href: ROUTES.ADMIN_SETTINGS },
  ];

  const quickActions = [
    { icon: Database, label: 'Backup Sistema', action: () => console.log('Backup sistema') },
    { icon: Users, label: 'Gerenciar Usuários', action: () => console.log('Gerenciar usuários') },
    { icon: Shield, label: 'Logs Segurança', action: () => console.log('Logs segurança') },
  ];

  const sidebar = (
    <div className="space-y-6">
      {/* Navigation */}
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Button
              key={item.label}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link to={item.href} className="flex items-center space-x-3">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* System Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Servidor</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Database</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">OK</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Storage</span>
            </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">85%</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Platform Stats */}
      <Card className="bg-gradient-to-br from-red-50 to-pink-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Estatísticas da Plataforma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">Usuários Ativos</span>
            </div>
            <Badge variant="secondary">2,847</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Cursos Ativos</span>
            </div>
            <Badge variant="secondary">156</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-600">Sessões Hoje</span>
            </div>
            <Badge variant="secondary">1,234</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              size="sm"
              onClick={action.action}
              className="w-full justify-start h-8"
            >
              <action.icon className="h-3 w-3 mr-2" />
              {action.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <BaseLayout sidebar={sidebar}>
      {children}
    </BaseLayout>
  );
}
