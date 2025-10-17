import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { ROUTES } from '@/utils/constants';

interface BaseLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function BaseLayout({ children, sidebar }: BaseLayoutProps) {
  const { user, signOut } = useAuth();
  const { stats } = useNotifications();
  const navigate = useNavigate();
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const role = user?.role === 'student' ? 'Estudante' : 
               user?.role === 'admin' ? 'Administrador' : 
               user?.role === 'student' ? 'Estudante' : 'Usuário';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Esquads Academy</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={() => setIsNotificationCenterOpen(true)}
              >
                <Bell className="h-5 w-5" />
                {stats.unread > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {stats.unread > 9 ? '9+' : stats.unread}
                  </Badge>
                )}
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 h-auto p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500">{role}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate(user?.role === 'admin' ? ROUTES.ADMIN_PROFILE : ROUTES.STUDENT_PROFILE)}>
                    <User className="h-4 w-4 mr-3" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(user?.role === 'admin' ? ROUTES.ADMIN_SETTINGS : '/settings')}>
                    <Settings className="h-4 w-4 mr-3" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-3" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <aside className="w-64 bg-white shadow-sm min-h-screen">
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </div>
  );
}
