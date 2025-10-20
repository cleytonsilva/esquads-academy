import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedLayout } from '@/layouts/UnifiedLayout';
import { 
  Monitor, 
  Award, 
  Clock, 
  Target, 
  TrendingUp, 
  Play, 
  CheckCircle,
  Star,
  Filter,
  Search,
  BarChart3,
  Trophy,
  Timer,
  Brain,
  Cloud,
  Shield,
  Database,
  Code,
  Cpu,
  BookOpen,
  Users,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Certification {
  id: string;
  name: string;
  provider: 'AWS' | 'Azure' | 'CompTIA' | 'Google Cloud' | 'Cisco';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  total_questions: number;
  passing_score: number;
  time_limit: number;
  category: string;
  tags: string[];
  icon: string;
  color: string;
}

interface UserStats {
  total_simulations: number;
  average_score: number;
  best_score: number;
  time_spent: number;
  certifications_attempted: number;
  certifications_passed: number;
}

interface RecentSession {
  id: string;
  certification_name: string;
  score: number;
  total_questions: number;
  time_taken: number;
  status: 'completed' | 'in_progress' | 'abandoned';
  created_at: string;
}

const SimulationsCenter: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total_simulations: 0,
    average_score: 0,
    best_score: 0,
    time_spent: 0,
    certifications_attempted: 0,
    certifications_passed: 0
  });
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadCertifications();
      loadUserStats();
      loadRecentSessions();
    }
  }, [user]);

  const loadCertifications = async () => {
    try {
      // Carregar certificações do banco de dados
      const { data: certificationsData, error } = await supabase
        .from('certifications')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      // Se não há certificações no banco, criar dados de exemplo
      if (!certificationsData || certificationsData.length === 0) {
        const mockCertifications: Certification[] = [
          {
            id: '1',
            name: 'AWS Certified Solutions Architect - Associate',
            provider: 'AWS',
            description: 'Valide sua capacidade de projetar e implementar sistemas distribuídos na AWS.',
            difficulty: 'intermediate',
            total_questions: 65,
            passing_score: 720,
            time_limit: 130,
            category: 'Cloud Architecture',
            tags: ['aws', 'architecture', 'cloud'],
            icon: 'cloud',
            color: 'orange'
          },
          {
            id: '2',
            name: 'AWS Certified Developer - Associate',
            provider: 'AWS',
            description: 'Demonstre proficiência no desenvolvimento de aplicações na AWS.',
            difficulty: 'intermediate',
            total_questions: 65,
            passing_score: 720,
            time_limit: 130,
            category: 'Development',
            tags: ['aws', 'development', 'serverless'],
            icon: 'code',
            color: 'orange'
          },
          {
            id: '3',
            name: 'Microsoft Azure Fundamentals',
            provider: 'Azure',
            description: 'Fundamentos dos serviços de nuvem do Microsoft Azure.',
            difficulty: 'beginner',
            total_questions: 40,
            passing_score: 700,
            time_limit: 85,
            category: 'Cloud Fundamentals',
            tags: ['azure', 'fundamentals', 'cloud'],
            icon: 'cloud',
            color: 'blue'
          },
          {
            id: '4',
            name: 'Azure Solutions Architect Expert',
            provider: 'Azure',
            description: 'Expertise em design de soluções que rodam no Microsoft Azure.',
            difficulty: 'advanced',
            total_questions: 60,
            passing_score: 700,
            time_limit: 120,
            category: 'Cloud Architecture',
            tags: ['azure', 'architecture', 'expert'],
            icon: 'shield',
            color: 'blue'
          },
          {
            id: '5',
            name: 'CompTIA Security+',
            provider: 'CompTIA',
            description: 'Certificação fundamental em segurança cibernética.',
            difficulty: 'intermediate',
            total_questions: 90,
            passing_score: 750,
            time_limit: 90,
            category: 'Cybersecurity',
            tags: ['security', 'comptia', 'cybersecurity'],
            icon: 'shield',
            color: 'purple'
          },
          {
            id: '6',
            name: 'CompTIA Network+',
            provider: 'CompTIA',
            description: 'Fundamentos de networking e infraestrutura de rede.',
            difficulty: 'beginner',
            total_questions: 90,
            passing_score: 720,
            time_limit: 90,
            category: 'Networking',
            tags: ['networking', 'comptia', 'infrastructure'],
            icon: 'cpu',
            color: 'purple'
          }
        ];
        setCertifications(mockCertifications);
      } else {
        setCertifications(certificationsData);
      }

    } catch (error) {
      console.error('Erro ao carregar certificações:', error);
      toast.error('Erro ao carregar certificações');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Carregar estatísticas do usuário
      const { data: sessionsData } = await supabase
        .from('simulation_sessions')
        .select('score, total_questions, time_taken, status')
        .eq('user_id', user?.id);

      if (sessionsData && sessionsData.length > 0) {
        const completedSessions = sessionsData.filter(s => s.status === 'completed');
        const totalTime = sessionsData.reduce((sum, s) => sum + (s.time_taken || 0), 0);
        const avgScore = completedSessions.length > 0 
          ? completedSessions.reduce((sum, s) => sum + s.score, 0) / completedSessions.length 
          : 0;
        const bestScore = completedSessions.length > 0 
          ? Math.max(...completedSessions.map(s => s.score)) 
          : 0;

        setUserStats({
          total_simulations: sessionsData.length,
          average_score: Math.round(avgScore),
          best_score: Math.round(bestScore),
          time_spent: Math.round(totalTime / 60), // em minutos
          certifications_attempted: new Set(sessionsData.map(s => s.certification_id)).size,
          certifications_passed: completedSessions.filter(s => s.score >= 70).length
        });
      } else {
        // Dados simulados se não há sessões
        setUserStats({
          total_simulations: 12,
          average_score: 78,
          best_score: 92,
          time_spent: 480, // 8 horas
          certifications_attempted: 4,
          certifications_passed: 2
        });
      }

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadRecentSessions = async () => {
    try {
      const { data: sessionsData } = await supabase
        .from('simulation_attempts')
        .select(`
          id,
          score,
          time_spent,
          completed_at,
          started_at,
          generated_simulations(certification, question_count)
        `)
        .eq('user_id', user?.id)
        .order('started_at', { ascending: false })
        .limit(5);

      if (sessionsData && sessionsData.length > 0) {
        const formattedSessions: RecentSession[] = sessionsData.map(session => ({
          id: session.id,
          certification_name: session.generated_simulations?.certification || 'Certificação Desconhecida',
          score: session.score || 0,
          total_questions: session.generated_simulations?.question_count || 0,
          time_taken: session.time_spent || 0,
          status: session.completed_at ? 'completed' : 'in_progress' as RecentSession['status'],
          created_at: session.started_at
        }));
        setRecentSessions(formattedSessions);
      } else {
        // Dados simulados se não há sessões
        const mockSessions: RecentSession[] = [
          {
            id: '1',
            certification_name: 'AWS Solutions Architect',
            score: 85,
            total_questions: 65,
            time_taken: 120,
            status: 'completed',
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '2',
            certification_name: 'Azure Fundamentals',
            score: 92,
            total_questions: 40,
            time_taken: 75,
            status: 'completed',
            created_at: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: '3',
            certification_name: 'CompTIA Security+',
            score: 0,
            total_questions: 90,
            time_taken: 45,
            status: 'in_progress',
            created_at: new Date(Date.now() - 259200000).toISOString()
          }
        ];
        setRecentSessions(mockSessions);
      }

    } catch (error) {
      console.error('Erro ao carregar sessões recentes:', error);
    }
  };

  const providers = [
    { value: 'all', label: 'Todos os Provedores', icon: Target },
    { value: 'AWS', label: 'Amazon AWS', icon: Cloud },
    { value: 'Azure', label: 'Microsoft Azure', icon: Shield },
    { value: 'CompTIA', label: 'CompTIA', icon: Award },
    { value: 'Google Cloud', label: 'Google Cloud', icon: Cloud },
    { value: 'Cisco', label: 'Cisco', icon: Cpu }
  ];

  const difficulties = [
    { value: 'all', label: 'Todas as Dificuldades' },
    { value: 'beginner', label: 'Iniciante', color: 'text-green-400' },
    { value: 'intermediate', label: 'Intermediário', color: 'text-yellow-400' },
    { value: 'advanced', label: 'Avançado', color: 'text-red-400' }
  ];

  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesProvider = selectedProvider === 'all' || cert.provider === selectedProvider;
    const matchesDifficulty = selectedDifficulty === 'all' || cert.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesProvider && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 border-green-400';
      case 'intermediate': return 'text-yellow-400 border-yellow-400';
      case 'advanced': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'AWS': return 'text-orange-400 border-orange-400';
      case 'Azure': return 'text-blue-400 border-blue-400';
      case 'CompTIA': return 'text-purple-400 border-purple-400';
      case 'Google Cloud': return 'text-green-400 border-green-400';
      case 'Cisco': return 'text-cyan-400 border-cyan-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'AWS': return <Cloud className="w-5 h-5 text-orange-400" />;
      case 'Azure': return <Shield className="w-5 h-5 text-blue-400" />;
      case 'CompTIA': return <Award className="w-5 h-5 text-purple-400" />;
      case 'Google Cloud': return <Cloud className="w-5 h-5 text-green-400" />;
      case 'Cisco': return <Cpu className="w-5 h-5 text-cyan-400" />;
      default: return <Target className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleStartSimulation = (certification: Certification) => {
    // Navegar para a simulação específica
    navigate(`/simulations/${certification.id}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  if (loading) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse text-2xl mb-4 text-green-400">LOADING SIMULATIONS...</div>
            <p className="text-cyan-400 text-lg">Carregando centro de simulações...</p>
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
                CENTRO DE SIMULAÇÕES
              </h1>
              <p className="text-gray-400">
                Simulações de certificação para acelerar sua carreira
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                {userStats.certifications_passed} Aprovações
              </Badge>
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                {userStats.total_simulations} Simulações
              </Badge>
            </div>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-900 border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Monitor className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Simulações</p>
                    <p className="text-xl font-bold text-blue-400">{userStats.total_simulations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Média</p>
                    <p className="text-xl font-bold text-yellow-400">{userStats.average_score}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-8 h-8 text-orange-400" />
                  <div>
                    <p className="text-sm text-gray-400">Melhor Score</p>
                    <p className="text-xl font-bold text-orange-400">{userStats.best_score}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Timer className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Tempo Total</p>
                    <p className="text-xl font-bold text-purple-400">{userStats.time_spent}h</p>
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
                    placeholder="Buscar certificações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-gray-200"
                  />
                </div>

                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                    <SelectValue placeholder="Provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div className="flex items-center space-x-2">
                          <provider.icon className="w-4 h-4" />
                          <span>{provider.label}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certifications Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-green-400 mb-4">Certificações Disponíveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCertifications.map((certification) => (
                <Card 
                  key={certification.id} 
                  className="bg-gray-900 border-green-800 transition-all hover:scale-105 hover:border-green-600"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getProviderIcon(certification.provider)}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getProviderColor(certification.provider)}`}
                        >
                          {certification.provider}
                        </Badge>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDifficultyColor(certification.difficulty)}`}
                      >
                        {certification.difficulty.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-gray-200 line-clamp-2">
                      {certification.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400 line-clamp-3">
                      {certification.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Certification Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400">{certification.total_questions} questões</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">{certification.passing_score} pts</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400">{certification.time_limit}min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400">{certification.category}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {certification.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {certification.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={() => handleStartSimulation(certification)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar Simulação
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCertifications.length === 0 && (
              <div className="text-center py-12">
                <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  Nenhuma certificação encontrada
                </h3>
                <p className="text-gray-500">
                  Tente ajustar os filtros para encontrar certificações disponíveis.
                </p>
              </div>
            )}
          </div>

          {/* Recent Sessions Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-green-400 mb-4">Sessões Recentes</h2>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <Card key={session.id} className="bg-gray-900 border-green-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-200 line-clamp-2">
                        {session.certification_name}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          session.status === 'completed' 
                            ? 'text-green-400 border-green-400'
                            : session.status === 'in_progress'
                            ? 'text-yellow-400 border-yellow-400'
                            : 'text-red-400 border-red-400'
                        }`}
                      >
                        {session.status === 'completed' ? 'Concluída' : 
                         session.status === 'in_progress' ? 'Em Progresso' : 'Abandonada'}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs text-gray-400">
                      {session.status === 'completed' && (
                        <div className="flex items-center justify-between">
                          <span>Score:</span>
                          <span className={`font-bold ${
                            session.score >= 70 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {session.score}%
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Questões:</span>
                        <span className="text-blue-400">{session.total_questions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Tempo:</span>
                        <span className="text-yellow-400">{Math.round(session.time_taken)}min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Data:</span>
                        <span className="text-purple-400">{formatTimeAgo(session.created_at)}</span>
                      </div>
                    </div>

                    {session.status === 'completed' && session.score >= 70 && (
                      <div className="mt-3 flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400 font-semibold">Aprovado!</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {recentSessions.length === 0 && (
                <Card className="bg-gray-900 border-green-800">
                  <CardContent className="p-6 text-center">
                    <Monitor className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">
                      Nenhuma simulação realizada ainda.
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Inicie sua primeira simulação!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SimulationsCenter;