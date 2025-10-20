import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedLayout } from '@/layouts/UnifiedLayout';
import { ROUTES } from '@/utils/constants';
import { 
  Target, 
  Monitor, 
  Trophy, 
  Users, 
  Award,
  Heart,
  Zap,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Play,
  BookOpen,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface DashboardStats {
  total_xp: number;
  lives_remaining: number;
  level: number;
  missions_completed: number;
  simulations_completed: number;
  achievements_count: number;
  current_streak: number;
  next_level_xp: number;
}

interface RecentActivity {
  id: string;
  type: 'mission' | 'simulation' | 'achievement';
  title: string;
  description: string;
  xp_gained: number;
  completed_at: string;
  status: 'completed' | 'failed' | 'in_progress';
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  color: string;
  bgColor: string;
  count?: number;
}

const UnifiedDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    total_xp: 0,
    lives_remaining: 3,
    level: 1,
    missions_completed: 0,
    simulations_completed: 0,
    achievements_count: 0,
    current_streak: 0,
    next_level_xp: 100
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('total_xp, lives_remaining')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      const currentXP = userData?.total_xp || 0;
      const level = Math.floor(currentXP / 100) + 1;
      const nextLevelXP = level * 100;

      // Carregar estatísticas de missões
      const { count: missionsCount } = await supabase
        .from('mission_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'completed');

      // Carregar estatísticas de simulações
      const { count: simulationsCount } = await supabase
        .from('simulation_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'completed');

      // Carregar conquistas
      const { count: achievementsCount } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Carregar atividade recente (simulada por enquanto)
      const mockRecentActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'mission',
          title: 'Fundamentos de Cloud Computing',
          description: 'Missão completada com sucesso',
          xp_gained: 50,
          completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'simulation',
          title: 'AWS Solutions Architect - Prática 1',
          description: 'Simulação finalizada - 85% de acerto',
          xp_gained: 75,
          completed_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: '3',
          type: 'achievement',
          title: 'Primeira Certificação',
          description: 'Conquistou sua primeira badge',
          xp_gained: 100,
          completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        }
      ];

      setStats({
        total_xp: currentXP,
        lives_remaining: userData?.lives_remaining || 3,
        level,
        missions_completed: missionsCount || 0,
        simulations_completed: simulationsCount || 0,
        achievements_count: achievementsCount || 0,
        current_streak: 5, // Simulado
        next_level_xp: nextLevelXP
      });

      setRecentActivity(mockRecentActivity);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Missões Ativas',
      description: 'Continue sua jornada de aprendizado',
      icon: Target,
      path: ROUTES.MISSIONS,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20 border-blue-700',
      count: 12
    },
    {
      title: 'Simulações',
      description: 'Pratique para certificações',
      icon: Monitor,
      path: ROUTES.SIMULATIONS,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20 border-purple-700',
      count: 8
    },
    {
      title: 'Conquistas',
      description: 'Veja seus troféus e badges',
      icon: Trophy,
      path: ROUTES.ACHIEVEMENTS,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20 border-yellow-700',
      count: stats.achievements_count
    },
    {
      title: 'Ranking',
      description: 'Compare seu progresso',
      icon: Users,
      path: ROUTES.LEADERBOARD,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20 border-green-700'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mission': return Target;
      case 'simulation': return Monitor;
      case 'achievement': return Trophy;
      default: return CheckCircle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'mission': return 'text-blue-400';
      case 'simulation': return 'text-purple-400';
      case 'achievement': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return `${Math.floor(diffInHours / 24)}d atrás`;
  };

  const levelProgress = ((stats.total_xp % 100) / 100) * 100;

  if (loading) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse text-2xl mb-4 text-green-400">LOADING DASHBOARD...</div>
            <p className="text-cyan-400 text-lg">Carregando dados...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-400 mb-2">
                CENTRO DE COMANDO
              </h1>
              <p className="text-gray-400">
                Bem-vindo de volta, <span className="text-cyan-400">{user?.email}</span>
              </p>
            </div>
            <div className="hidden md:block">
              <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                Sistema Unificado v2.0
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* XP e Nível */}
          <Card className="bg-gray-900 border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-yellow-400">
                <Zap className="w-5 h-5" />
                <span>Experiência</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-yellow-400">{stats.total_xp}</span>
                  <span className="text-sm text-gray-400">XP Total</span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Nível {stats.level}</span>
                    <span className="text-sm text-gray-400">{stats.next_level_xp} XP</span>
                  </div>
                  <Progress value={levelProgress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vidas */}
          <Card className="bg-gray-900 border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-red-400">
                <Heart className="w-5 h-5" />
                <span>Vidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-400">{stats.lives_remaining}</span>
                  <span className="text-sm text-gray-400">de 3</span>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3].map((life) => (
                    <Heart
                      key={life}
                      className={`w-6 h-6 ${
                        life <= stats.lives_remaining
                          ? 'text-red-400 fill-current'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Missões */}
          <Card className="bg-gray-900 border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-blue-400">
                <Target className="w-5 h-5" />
                <span>Missões</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-400">{stats.missions_completed}</span>
                  <span className="text-sm text-gray-400">Completadas</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(ROUTES.MISSIONS)}
                  className="w-full text-blue-400 border-blue-700 hover:bg-blue-900/20"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Simulações */}
          <Card className="bg-gray-900 border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-purple-400">
                <Monitor className="w-5 h-5" />
                <span>Simulações</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-400">{stats.simulations_completed}</span>
                  <span className="text-sm text-gray-400">Finalizadas</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(ROUTES.SIMULATIONS)}
                  className="w-full text-purple-400 border-purple-700 hover:bg-purple-900/20"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Praticar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-green-800">
              <CardHeader>
                <CardTitle className="text-green-400">Ações Rápidas</CardTitle>
                <CardDescription className="text-gray-400">
                  Continue sua jornada de aprendizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <div
                        key={action.path}
                        onClick={() => navigate(action.path)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${action.bgColor}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Icon className={`w-8 h-8 ${action.color}`} />
                          {action.count !== undefined && (
                            <Badge variant="secondary" className="text-xs">
                              {action.count}
                            </Badge>
                          )}
                        </div>
                        <h3 className={`font-semibold mb-1 ${action.color}`}>
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                          {action.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-400">
                          <span>Acessar</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="bg-gray-900 border-green-800">
              <CardHeader>
                <CardTitle className="text-green-400">Atividade Recente</CardTitle>
                <CardDescription className="text-gray-400">
                  Suas últimas conquistas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.type);
                    
                    return (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/50">
                        <Icon className={`w-5 h-5 mt-0.5 ${colorClass}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-400 mb-1">
                            {activity.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-yellow-400">
                              +{activity.xp_gained} XP
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(activity.completed_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTES.PROFILE)}
                  className="w-full mt-4 text-cyan-400 hover:text-cyan-300"
                >
                  Ver histórico completo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-8">
          <Card className="bg-gray-900 border-green-800">
            <CardHeader>
              <CardTitle className="text-green-400">Resumo de Progresso</CardTitle>
              <CardDescription className="text-gray-400">
                Sua evolução na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    {stats.current_streak}
                  </div>
                  <p className="text-sm text-gray-400">Dias consecutivos</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">
                    {stats.achievements_count}
                  </div>
                  <p className="text-sm text-gray-400">Conquistas desbloqueadas</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {Math.round(((stats.missions_completed + stats.simulations_completed) / 20) * 100)}%
                  </div>
                  <p className="text-sm text-gray-400">Progresso geral</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default UnifiedDashboard;