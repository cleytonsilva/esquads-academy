import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ROUTES } from '@/utils/constants';
import { 
  Home, 
  Target, 
  Monitor, 
  User, 
  Trophy, 
  Users, 
  Award,
  Heart,
  Zap,
  Star,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface UnifiedLayoutProps {
  children: React.ReactNode;
}

interface UserStats {
  total_xp: number;
  lives_remaining: number;
  level: number;
  missions_completed: number;
  simulations_completed: number;
  achievements_count: number;
}

export const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userStats, setUserStats] = useState<UserStats>({
    total_xp: 0,
    lives_remaining: 3,
    level: 1,
    missions_completed: 0,
    simulations_completed: 0,
    achievements_count: 0
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar estatísticas do usuário
  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('total_xp, lives_remaining')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      // Calcular nível baseado no XP
      const level = Math.floor((userData?.total_xp || 0) / 100) + 1;

      // Buscar missões completadas
      const { count: missionsCount } = await supabase
        .from('mission_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'completed');

      // Buscar simulações completadas
      const { count: simulationsCount } = await supabase
        .from('simulation_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'completed');

      // Buscar conquistas
      const { count: achievementsCount } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      setUserStats({
        total_xp: userData?.total_xp || 0,
        lives_remaining: userData?.lives_remaining || 3,
        level,
        missions_completed: missionsCount || 0,
        simulations_completed: simulationsCount || 0,
        achievements_count: achievementsCount || 0
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(ROUTES.LOGIN);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: Home,
      path: ROUTES.DASHBOARD,
      description: 'Centro de comando'
    },
    {
      label: 'Missões',
      icon: Target,
      path: ROUTES.MISSIONS,
      description: 'Desafios gamificados'
    },
    {
      label: 'Simulações',
      icon: Monitor,
      path: ROUTES.SIMULATIONS,
      description: 'Certificações práticas'
    },
    {
      label: 'Perfil',
      icon: User,
      path: ROUTES.PROFILE,
      description: 'Dados pessoais'
    },
    {
      label: 'Conquistas',
      icon: Trophy,
      path: ROUTES.ACHIEVEMENTS,
      description: 'Badges e troféus'
    },
    {
      label: 'Ranking',
      icon: Users,
      path: ROUTES.LEADERBOARD,
      description: 'Classificação global'
    },
    {
      label: 'Certificados',
      icon: Award,
      path: ROUTES.CERTIFICATIONS,
      description: 'Certificações obtidas'
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <header className="border-b border-green-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-cyan-400">
                ESQUADS
              </div>
              <div className="hidden md:block text-sm text-gray-500">
                v2.0 UNIFIED
              </div>
            </div>

            {/* Stats Bar - Desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400">{userStats.total_xp} XP</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400">Nível {userStats.level}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-red-400">{userStats.lives_remaining}/3</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400">{userStats.achievements_count}</span>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <div className="text-sm text-cyan-400">{user?.email}</div>
                <div className="text-xs text-gray-500">
                  {userStats.missions_completed} missões | {userStats.simulations_completed} simulações
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-green-400 hover:text-green-300"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hidden lg:flex items-center space-x-2 text-red-400 hover:text-red-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-green-800 bg-gray-900">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400">{userStats.total_xp} XP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400">Nível {userStats.level}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">{userStats.lives_remaining}/3</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400">{userStats.achievements_count}</span>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isActivePath(item.path)
                          ? 'bg-green-900 text-green-300 border border-green-700'
                          : 'text-gray-400 hover:text-green-400 hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Logout */}
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full flex items-center space-x-2 text-red-400 hover:text-red-300 justify-start"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Navigation Bar - Desktop */}
      <nav className="hidden lg:block border-b border-green-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    isActivePath(item.path)
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-gray-400 hover:text-green-400 hover:border-green-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-pulse text-2xl mb-4 text-green-400">LOADING...</div>
              <p className="text-cyan-400 text-lg">Carregando dados do usuário...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-green-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-sm text-gray-500">
              © 2025 Esquads Academy. Sistema Unificado v2.0
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Terminal Mode: ON</span>
              <span>•</span>
              <span>Gamification: ACTIVE</span>
              <span>•</span>
              <span>AI: ENABLED</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};