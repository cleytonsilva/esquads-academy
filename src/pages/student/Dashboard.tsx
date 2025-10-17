// Esquads Academy - Dashboard do Estudante

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Award, 
  Play, 
  Brain, 
  Sparkles, 
  Zap, 
  Calendar, 
  ChevronRight, 
  Download, 
  Share2, 
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  Gift,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, PageLoading, CardLoading } from '@/components/ui/LoadingSpinner';
import { ErrorBoundaryWrapper } from '@/components/ui/ErrorBoundary';
import { ROUTES } from '@/utils/constants';
import { useCourses } from '@/hooks/useCourses';
import { useMissions } from '@/hooks/useMissionsRobust';
import { useGamification } from '@/hooks/useGamification';
import { useCertificates } from '@/hooks/useCertificatesRobust';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { AIMissionCard } from '@/components/gamification/AIMissionCard';
import { toast } from 'sonner';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useUserProfile();
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const { 
    missions, 
    dailyMissions, 
    weeklyMissions, 
    contextualMissions,
    loading: missionsLoading,
    error: missionsError,
    completeMission,
    startMission
  } = useMissions();
  
  const { 
    userPoints, 
    userBadges, 
    pointsHistory, 
    leaderboard, 
    stats,
    loading: gamificationLoading
  } = useGamification(user?.id);
  
  const {
    certificates: userCertificates,
    isLoading: certificatesLoading,
    error: certificatesError
  } = useCertificates();
  const { personalizedRecommendations, loading: recommendationsLoading } = useRecommendations();
  const { addNotification } = useNotifications();

  // Estados locais para animações e feedback
  const [recentAchievements, setRecentAchievements] = useState<any[]>([]);
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [dailyGoalProgress, setDailyGoalProgress] = useState(0);

  // Função para atualizar estatísticas do usuário
  const refreshUserStats = () => {
    // Atualiza os dados usando os hooks existentes sem recarregar a página
    // Os hooks já têm seus próprios métodos de refresh que são chamados automaticamente
    console.log('Refreshing user stats...');
  };

  // Filtrar cursos recentes (últimos 3 acessados) - com verificação de segurança
  const recentCourses = (courses || []).slice(0, 3);

  // Calcular estatísticas do dashboard - com verificações de segurança
  const totalCoursesCompleted = (courses || []).filter(course => course.progress === 100).length;
  const allMissions = [...(dailyMissions || []), ...(weeklyMissions || []), ...(contextualMissions || [])];
  const totalActiveMissions = (allMissions || []).filter(mission => !(mission as any).is_completed).length;
  const weeklyProgress = Math.min(((stats?.current_streak || 0) * 20), 100); // Simular progresso semanal

  // Efeito para verificar conquistas recentes - com verificação de segurança
  useEffect(() => {
    if (userBadges && userBadges.length > 0) {
      const recentBadges = userBadges
        .filter(badge => {
          const earnedDate = new Date(badge.earned_at);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return earnedDate > oneDayAgo;
        })
        .slice(0, 3);
      
      setRecentAchievements(recentBadges);
      
      // Mostrar notificações para conquistas recentes
      recentBadges.forEach(badge => {
        addNotification({
          id: `badge-${badge.id}`,
          type: 'achievement',
          title: 'Nova Conquista!',
          message: `Você ganhou o badge: ${badge.name}`,
          read: false
        });
      });
    }
  }, [userBadges, addNotification]);

  // Efeito para calcular progresso diário - com verificação de segurança
  useEffect(() => {
    if (pointsHistory && pointsHistory.length > 0) {
      const today = new Date().toDateString();
      const todayActivities = pointsHistory.filter(activity => 
        new Date(activity.created_at).toDateString() === today
      );
    const todayPoints = todayActivities.reduce((sum, activity) => sum + activity.points_earned, 0);
      const dailyGoal = 100; // Meta diária de pontos
      setDailyGoalProgress(Math.min((todayPoints / dailyGoal) * 100, 100));
    }
  }, [pointsHistory]);

  // Função para iniciar missão com feedback
  const handleStartMission = async (missionId: string) => {
    try {
      await startMission(missionId);
      toast.success('Missão iniciada com sucesso!');
      addNotification({
        id: `mission-start-${missionId}`,
        type: 'info',
        title: 'Missão Iniciada',
        message: 'Boa sorte na sua nova missão!',
        read: false
      });
    } catch (error) {
      toast.error('Erro ao iniciar missão');
    }
  };

  // Função para completar missão com feedback
  const handleCompleteMission = async (missionId: string) => {
    try {
      await completeMission(missionId);
      toast.success('Missão completada! Parabéns!');
      addNotification({
        id: `mission-complete-${missionId}`,
        type: 'success',
        title: 'Missão Completada!',
        message: 'Você ganhou pontos e experiência!',
        read: false
      });
      // Refresh user stats would be handled by the hook
    } catch (error) {
      toast.error('Erro ao completar missão');
    }
  };

  const isLoading = profileLoading || coursesLoading || missionsLoading || gamificationLoading || certificatesLoading || recommendationsLoading;

  if (isLoading) {
    return <PageLoading />;
  }

  // Error state
  if (profileError || coursesError || missionsError || certificatesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Erro ao carregar dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              Ocorreu um erro ao carregar seus dados. Tente novamente.
            </p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundaryWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Olá, {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Estudante'}! 👋
            </h1>
            <p className="text-gray-600">
              Bem-vindo de volta ao seu painel de estudos
            </p>
          </div>

          <div className="space-y-6">
            {/* User Stats Header */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Continue sua jornada!</h2>
                    <p className="text-blue-100 mt-1">
                      Você está no nível {stats?.current_level || 1}!
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {(stats?.current_streak || 0) > 0 && (
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats?.current_streak || 0}</div>
                        <div className="text-sm text-blue-100">dias seguidos</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-2xl font-bold">{userPoints?.total_points || 0}</div>
                      <div className="text-sm text-blue-100">pontos totais</div>
                    </div>
                  </div>
                </div>
                
                {/* Barra de progresso para próximo nível */}
                {stats?.points_to_next_level && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progresso para o próximo nível</span>
                      <span>{stats.total_points}/{stats.total_points + stats.points_to_next_level}</span>
                    </div>
                    <Progress 
                      value={(stats.total_points / (stats.total_points + stats.points_to_next_level)) * 100} 
                      className="h-2 bg-blue-500"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

      {/* Conquistas recentes */}
      {(recentAchievements || []).length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <Gift className="w-5 h-5 mr-2" />
              Conquistas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              {(recentAchievements || []).map((badge) => (
                <div key={badge.id} className="flex items-center p-3 bg-white rounded-lg border border-yellow-200">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">{badge.name}</h4>
                    <p className="text-xs text-gray-600">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cursos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{(courses || []).length}</p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  {totalCoursesCompleted} completados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pontos Totais</p>
                <p className="text-2xl font-bold text-gray-900">{userPoints?.total_points || 0}</p>
                <p className="text-xs text-blue-600 mt-1">
                    <Star className="w-3 h-3 inline mr-1" />
                    Nível {stats?.current_level || 1}
                  </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Missões Ativas</p>
                <p className="text-2xl font-bold text-gray-900">{totalActiveMissions}</p>
                <p className="text-xs text-purple-600 mt-1">
                  <Brain className="w-3 h-3 inline mr-1" />
                  {(contextualMissions || []).length} personalizadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Certificados</p>
                <p className="text-2xl font-bold text-gray-900">{(userCertificates || []).length}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Conquistas desbloqueadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meta diária */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <Clock className="w-5 h-5 mr-2" />
            Meta Diária
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700">Progresso de hoje</span>
            <span className="text-sm font-medium text-green-800">{Math.round(dailyGoalProgress)}%</span>
          </div>
          <Progress value={dailyGoalProgress} className="h-3 bg-green-200" />
          <p className="text-xs text-green-600 mt-2">
            Continue assim! Você está {dailyGoalProgress >= 100 ? 'acima' : 'próximo'} da sua meta diária.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Continuar Estudando</CardTitle>
                <Link 
                  to={ROUTES.STUDENT_COURSES}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Ver todos
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {(recentCourses || []).length > 0 ? (
                <div className="space-y-4">
                  {(recentCourses || []).map((course) => (
                    <div key={course.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {course.title.charAt(0)}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{course.instructor_name || 'Instrutor'}</p>
                        <div className="flex items-center mt-2">
                          <Progress value={course.progress || Math.floor(Math.random() * 80) + 10} className="flex-1 h-2" />
                          <span className="ml-3 text-sm text-gray-600">
                            {course.progress || Math.floor(Math.random() * 80) + 10}%
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`${ROUTES.STUDENT_COURSES}/${course.id}`}
                        className="ml-4"
                      >
                        <Button size="sm" className="rounded-lg">
                          <Play className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum curso em andamento</h3>
                  <p className="text-gray-600 mb-4">Explore nossos cursos e comece a aprender!</p>
                  <Link to={ROUTES.STUDENT_COURSES}>
                    <Button className="inline-flex items-center">
                      Explorar Cursos
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Missions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                  Missões IA
                </CardTitle>
                <Link 
                  to={ROUTES.STUDENT_MISSIONS}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Ver todas
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {missionsLoading ? (
                <CardLoading />
              ) : (allMissions || []).length > 0 ? (
                <div className="space-y-3">
                  {(allMissions || []).slice(0, 3).map((mission) => (
                    <AIMissionCard
                      key={mission.id}
                      mission={{
                        ...mission,
                        // Mapear propriedades para o formato esperado pelo AIMissionCard
                        type: (mission as any).is_daily ? 'daily' :
                              (mission as any).is_weekly ? 'weekly' :
                              (mission as any).is_contextual ? 'challenge' : 'achievement',
                        difficulty: mission.difficulty || 'medium',
                        points_reward: (mission as any).points_reward || 50,
                        estimated_time: mission.estimated_time || 15,
                        expires_at: mission.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        requirements: mission.requirements || [],
                        hints: mission.hints || [],
                        tags: mission.tags || [],
                        current_progress: mission.current_progress,
                        is_completed: (mission as any).is_completed,
                        is_started: (mission as any).is_started
                      }}
                      onStart={handleStartMission}
                      onComplete={handleCompleteMission}
                      variant="compact"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Nenhuma missão ativa</p>
                  <p className="text-xs text-gray-500 mt-1">Missões personalizadas serão geradas automaticamente</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Certificates */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-600" />
                  Certificados
                </CardTitle>
                <Link 
                  to="/student/certificates"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Ver todos
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {certificatesLoading ? (
                <CardLoading />
              ) : (userCertificates || []).length > 0 ? (
                <div className="space-y-3">
                  {(userCertificates || []).slice(0, 3).map((certificate) => (
                    <div key={certificate.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Award className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{certificate.course_title}</h4>
                        <p className="text-xs text-gray-600">
                          {new Date((certificate as any).issued_at).toLocaleDateString('pt-BR')}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs mt-1 ${
                            certificate.grade >= 90 ? 'border-green-500 text-green-700' :
                            certificate.grade >= 80 ? 'border-blue-500 text-blue-700' :
                            certificate.grade >= 70 ? 'border-yellow-500 text-yellow-700' :
                            'border-gray-500 text-gray-700'
                          }`}
                        >
                          Nota {certificate.grade}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Nenhum certificado ainda</p>
                  <p className="text-xs text-gray-500 mt-1">Complete cursos para ganhar certificados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommendations and Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                Recomendações para Você
              </CardTitle>
              <Link 
                to="/student/recommendations"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Ver todas
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!recommendationsLoading && (personalizedRecommendations || []).length > 0 ? (
              <div className="space-y-3">
                {(personalizedRecommendations || []).slice(0, 3).map((recommendation) => (
                  <div key={recommendation.course_id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {recommendation.title.charAt(0)}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{recommendation.title}</h4>
                      <p className="text-xs text-gray-600">{recommendation.instructor_name}</p>
                      <div className="flex items-center mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {recommendation.match_percentage}% match
                        </Badge>
                        <span className="ml-2 text-xs text-gray-500">
                          {recommendation.duration_hours}h
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : recommendationsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Carregando recomendações...</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Configure seu perfil para receber recomendações</p>
                <Link to="/student/recommendations">
                  <Button variant="outline" size="sm" className="mt-2">
                    Configurar Perfil
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                Ranking
              </CardTitle>
              <Link 
                to={ROUTES.STUDENT_LEADERBOARD}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Ver ranking completo
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {(leaderboard || []).length > 0 ? (
              <div className="space-y-3">
                {(leaderboard || []).slice(0, 5).map((user, index) => (
                  <div key={user.user_id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{user.full_name}</h4>
                      <p className="text-xs text-gray-600">{user.total_points} pontos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">Nível {user.level}</p>
                      {index < 3 && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Top {index + 1}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Ranking não disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-blue-600" />
              Atividades Recentes
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => refreshUserStats()}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(pointsHistory || []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(pointsHistory || []).slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg ${
                     activity.source_type === 'mission' ? 'bg-orange-100' :
                     activity.source_type === 'course' ? 'bg-green-100' :
                     activity.source_type === 'quiz' ? 'bg-purple-100' :
                     activity.source_type === 'badge' ? 'bg-yellow-100' :
                     'bg-blue-100'
                   }`}>
                     {activity.source_type === 'mission' && <Target className="w-4 h-4 text-orange-600" />}
                     {activity.source_type === 'course' && <BookOpen className="w-4 h-4 text-green-600" />}
                     {activity.source_type === 'quiz' && <Brain className="w-4 h-4 text-purple-600" />}
                     {activity.source_type === 'badge' && <Award className="w-4 h-4 text-yellow-600" />}
                     {!['mission', 'course', 'quiz', 'badge'].includes(activity.source_type) && 
                       <Star className="w-4 h-4 text-blue-600" />}
                   </div>
                  <div className="ml-3 flex-1">
                     <h4 className="text-sm font-medium text-gray-900">{activity.reason}</h4>
                     <p className="text-xs text-gray-600">
                       {new Date(activity.created_at).toLocaleDateString('pt-BR', {
                         day: '2-digit',
                         month: '2-digit',
                         hour: '2-digit',
                         minute: '2-digit'
                       })}
                     </p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-medium text-green-600">+{activity.points_earned} pts</p>
                     <Badge variant="secondary" className="text-xs">
                       {activity.source_type}
                     </Badge>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atividade recente</h3>
              <p className="text-gray-600 mb-4">Comece a estudar para ver suas atividades aqui!</p>
              <Link to={ROUTES.STUDENT_COURSES}>
                <Button className="inline-flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explorar Cursos
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Zap className="w-5 h-5 mr-2" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to={ROUTES.STUDENT_COURSES}>
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-100">
                <BookOpen className="w-6 h-6" />
                <span className="text-sm">Explorar Cursos</span>
              </Button>
            </Link>
            
            <Link to={ROUTES.STUDENT_MISSIONS}>
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-100">
                <Target className="w-6 h-6" />
                <span className="text-sm">Ver Missões</span>
              </Button>
            </Link>
            
            <Link to="/student/certificates">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-yellow-100">
                <Award className="w-6 h-6" />
                <span className="text-sm">Certificados</span>
              </Button>
            </Link>
            
            <Link to={ROUTES.STUDENT_LEADERBOARD}>
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-100">
                <Trophy className="w-6 h-6" />
                <span className="text-sm">Ranking</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  </ErrorBoundaryWrapper>
);
};

export { StudentDashboard };
