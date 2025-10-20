import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedLayout } from '@/layouts/UnifiedLayout';
import { 
  Target, 
  Heart, 
  Star, 
  Clock, 
  Trophy, 
  Play, 
  Lock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Zap,
  Award,
  Users,
  BookOpen,
  Shield,
  Cloud,
  Database,
  Code,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp_reward: number;
  lives_cost: number;
  estimated_time: number;
  prerequisites: string[];
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  completion_rate: number;
  tags: string[];
}

interface UserProgress {
  lives_remaining: number;
  total_xp: number;
  missions_completed: number;
  current_streak: number;
}

const MissionsHub: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    lives_remaining: 3,
    total_xp: 0,
    missions_completed: 0,
    current_streak: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadMissionsData();
      loadUserProgress();
    }
  }, [user]);

  const loadMissionsData = async () => {
    try {
      // Carregar missões do banco de dados
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: true });

      if (missionsError) throw missionsError;

      // Carregar tentativas do usuário para determinar status
      const { data: attemptsData } = await supabase
        .from('mission_attempts')
        .select('mission_id, status, score')
        .eq('user_id', user?.id);

      // Processar dados das missões
      const processedMissions: Mission[] = (missionsData || []).map((mission) => {
        const userAttempt = attemptsData?.find(attempt => attempt.mission_id === mission.id);
        let status: Mission['status'] = 'available';
        
        if (userAttempt) {
          status = userAttempt.status === 'completed' ? 'completed' : 'in_progress';
        }

        return {
          id: mission.id,
          title: mission.title,
          description: mission.description,
          category: mission.category,
          difficulty: mission.difficulty as Mission['difficulty'],
          xp_reward: mission.xp_reward,
          lives_cost: mission.lives_cost || 1,
          estimated_time: mission.estimated_time || 30,
          prerequisites: mission.prerequisites || [],
          status,
          completion_rate: Math.floor(Math.random() * 100), // Simulado
          tags: mission.tags || []
        };
      });

      // Se não há missões no banco, criar dados de exemplo
      if (processedMissions.length === 0) {
        const mockMissions: Mission[] = [
          {
            id: '1',
            title: 'Fundamentos de Cloud Computing',
            description: 'Aprenda os conceitos básicos de computação em nuvem e seus principais benefícios.',
            category: 'AWS',
            difficulty: 'beginner',
            xp_reward: 100,
            lives_cost: 1,
            estimated_time: 45,
            prerequisites: [],
            status: 'available',
            completion_rate: 85,
            tags: ['cloud', 'fundamentos', 'aws']
          },
          {
            id: '2',
            title: 'Configuração de VPC na AWS',
            description: 'Configure uma Virtual Private Cloud completa com subnets públicas e privadas.',
            category: 'AWS',
            difficulty: 'intermediate',
            xp_reward: 200,
            lives_cost: 2,
            estimated_time: 60,
            prerequisites: ['1'],
            status: 'available',
            completion_rate: 72,
            tags: ['vpc', 'networking', 'aws']
          },
          {
            id: '3',
            title: 'Implementação de Auto Scaling',
            description: 'Implemente grupos de Auto Scaling para alta disponibilidade.',
            category: 'AWS',
            difficulty: 'advanced',
            xp_reward: 300,
            lives_cost: 3,
            estimated_time: 90,
            prerequisites: ['1', '2'],
            status: 'locked',
            completion_rate: 45,
            tags: ['autoscaling', 'ec2', 'aws']
          },
          {
            id: '4',
            title: 'Azure Resource Groups',
            description: 'Organize recursos no Azure usando Resource Groups e tags.',
            category: 'Azure',
            difficulty: 'beginner',
            xp_reward: 120,
            lives_cost: 1,
            estimated_time: 40,
            prerequisites: [],
            status: 'available',
            completion_rate: 90,
            tags: ['azure', 'resource-groups', 'organização']
          },
          {
            id: '5',
            title: 'CompTIA Security+ Basics',
            description: 'Fundamentos de segurança da informação para certificação CompTIA.',
            category: 'CompTIA',
            difficulty: 'beginner',
            xp_reward: 150,
            lives_cost: 1,
            estimated_time: 50,
            prerequisites: [],
            status: 'available',
            completion_rate: 78,
            tags: ['security', 'comptia', 'fundamentos']
          }
        ];
        setMissions(mockMissions);
      } else {
        setMissions(processedMissions);
      }

    } catch (error) {
      console.error('Erro ao carregar missões:', error);
      toast.error('Erro ao carregar missões');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('total_xp, lives_remaining')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      const { count: missionsCount } = await supabase
        .from('mission_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'completed');

      setUserProgress({
        lives_remaining: userData?.lives_remaining || 3,
        total_xp: userData?.total_xp || 0,
        missions_completed: missionsCount || 0,
        current_streak: 5 // Simulado
      });

    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const categories = [
    { value: 'all', label: 'Todas as Categorias', icon: Target },
    { value: 'AWS', label: 'Amazon AWS', icon: Cloud },
    { value: 'Azure', label: 'Microsoft Azure', icon: Shield },
    { value: 'CompTIA', label: 'CompTIA', icon: Award },
    { value: 'DevOps', label: 'DevOps', icon: Code },
    { value: 'Security', label: 'Segurança', icon: Shield }
  ];

  const difficulties = [
    { value: 'all', label: 'Todas as Dificuldades' },
    { value: 'beginner', label: 'Iniciante', color: 'text-green-400' },
    { value: 'intermediate', label: 'Intermediário', color: 'text-yellow-400' },
    { value: 'advanced', label: 'Avançado', color: 'text-red-400' }
  ];

  const filteredMissions = missions.filter(mission => {
    const matchesSearch = mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mission.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || mission.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || mission.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 border-green-400';
      case 'intermediate': return 'text-yellow-400 border-yellow-400';
      case 'advanced': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'locked': return <Lock className="w-5 h-5 text-gray-500" />;
      default: return <Play className="w-5 h-5 text-blue-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AWS': return <Cloud className="w-5 h-5 text-orange-400" />;
      case 'Azure': return <Shield className="w-5 h-5 text-blue-400" />;
      case 'CompTIA': return <Award className="w-5 h-5 text-purple-400" />;
      case 'DevOps': return <Code className="w-5 h-5 text-green-400" />;
      case 'Security': return <Shield className="w-5 h-5 text-red-400" />;
      default: return <Target className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleStartMission = (mission: Mission) => {
    if (mission.status === 'locked') {
      toast.error('Esta missão está bloqueada. Complete os pré-requisitos primeiro.');
      return;
    }

    if (userProgress.lives_remaining < mission.lives_cost) {
      toast.error('Vidas insuficientes para iniciar esta missão.');
      return;
    }

    // Navegar para a missão específica
    navigate(`/missions/${mission.id}`);
  };

  if (loading) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse text-2xl mb-4 text-green-400">LOADING MISSIONS...</div>
            <p className="text-cyan-400 text-lg">Carregando hub de missões...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-green-400 mb-2">
                HUB DE MISSÕES
              </h1>
              <p className="text-gray-400">
                Missões gamificadas para acelerar seu aprendizado
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-mono">
                  {userProgress.lives_remaining}/3
                </span>
              </div>
              <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                {userProgress.missions_completed} Completadas
              </Badge>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-900 border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">XP Total</p>
                    <p className="text-xl font-bold text-yellow-400">{userProgress.total_xp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Target className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Missões</p>
                    <p className="text-xl font-bold text-blue-400">{userProgress.missions_completed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-8 h-8 text-orange-400" />
                  <div>
                    <p className="text-sm text-gray-400">Streak</p>
                    <p className="text-xl font-bold text-orange-400">{userProgress.current_streak}d</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Ranking</p>
                    <p className="text-xl font-bold text-purple-400">#42</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Card className="bg-gray-900 border-green-800">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar missões..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-gray-200"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center space-x-2">
                          <category.icon className="w-4 h-4" />
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                    <SelectValue placeholder="Dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty.value} value={difficulty.value}>
                        <span className={difficulty.color}>{difficulty.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMissions.map((mission) => (
            <Card 
              key={mission.id} 
              className={`bg-gray-900 border-green-800 transition-all hover:scale-105 ${
                mission.status === 'locked' ? 'opacity-60' : 'hover:border-green-600'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(mission.category)}
                    <Badge variant="outline" className="text-xs">
                      {mission.category}
                    </Badge>
                  </div>
                  {getStatusIcon(mission.status)}
                </div>
                <CardTitle className="text-lg text-gray-200 line-clamp-2">
                  {mission.title}
                </CardTitle>
                <CardDescription className="text-gray-400 line-clamp-3">
                  {mission.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Mission Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400">+{mission.xp_reward} XP</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">{mission.lives_cost} vida(s)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400">{mission.estimated_time}min</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400">{mission.completion_rate}%</span>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getDifficultyColor(mission.difficulty)}`}
                  >
                    {mission.difficulty.toUpperCase()}
                  </Badge>
                  {mission.status === 'in_progress' && (
                    <div className="flex items-center space-x-2">
                      <Progress value={65} className="w-16 h-2" />
                      <span className="text-xs text-gray-400">65%</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {mission.tags && Array.isArray(mission.tags) && mission.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {mission.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => handleStartMission(mission)}
                  disabled={mission.status === 'locked'}
                  className={`w-full ${
                    mission.status === 'completed'
                      ? 'bg-green-600 hover:bg-green-700'
                      : mission.status === 'in_progress'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : mission.status === 'locked'
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {mission.status === 'completed' && (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Revisar Missão
                    </>
                  )}
                  {mission.status === 'in_progress' && (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Continuar
                    </>
                  )}
                  {mission.status === 'locked' && (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Bloqueada
                    </>
                  )}
                  {mission.status === 'available' && (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar Missão
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMissions.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Nenhuma missão encontrada
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros para encontrar missões disponíveis.
            </p>
          </div>
        )}
      </div>
    </UnifiedLayout>
  );
};

export default MissionsHub;