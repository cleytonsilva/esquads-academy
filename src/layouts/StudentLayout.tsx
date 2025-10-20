import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { BaseLayout } from '@/layouts/BaseLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/utils/constants';
import { 
  Home, 
  BookOpen, 
  Target, 
  Trophy, 
  Users, 
  User,
  Award,
  Terminal,
  MessageCircle,
  Route
} from 'lucide-react';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export function StudentLayout({ children }: StudentLayoutProps) {
  const location = useLocation();
  
  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: ROUTES.STUDENT_DASHBOARD },
    { icon: BookOpen, label: 'Cursos', href: ROUTES.STUDENT_COURSES },
    { icon: Route, label: 'Trilhas', href: ROUTES.STUDENT_PATHS },
    { icon: Target, label: 'Missões', href: ROUTES.STUDENT_MISSIONS },
    { icon: Terminal, label: 'Simulados', href: ROUTES.STUDENT_SIMULATIONS },
    { icon: MessageCircle, label: 'Social', href: ROUTES.STUDENT_SOCIAL },
    { icon: Trophy, label: 'Conquistas', href: ROUTES.STUDENT_ACHIEVEMENTS },
    { icon: Users, label: 'Ranking', href: ROUTES.STUDENT_LEADERBOARD },
    { icon: User, label: 'Perfil', href: ROUTES.STUDENT_PROFILE },
  ];

  const sidebar = (
    <div className="p-6">
      {/* Navigation */}
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                isActive ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''
              }`}
              asChild
            >
              <Link to={item.href}>
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* Progress Summary */}
      <Card className="mt-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Progresso Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Nível 5</span>
                <span>2,450 / 3,000 XP</span>
              </div>
              <Progress value={82} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Cursos</span>
            </div>
            <Badge variant="secondary">3/12</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">Missões</span>
            </div>
            <Badge variant="secondary">8/10</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Badges</span>
            </div>
            <Badge variant="secondary">15</Badge>
          </div>
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

