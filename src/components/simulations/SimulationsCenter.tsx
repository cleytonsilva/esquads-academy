// Esquads Academy - Centro de Simulações Principal
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  BookOpen, 
  Trophy,
  Target,
  TrendingUp,
  Play,
  Clock,
  Award,
  Zap
} from 'lucide-react';
import { CertificationCard } from './CertificationCard';
import { SimulationStats } from './SimulationStats';
import { GamificationPanel } from '@/components/gamification';
import { useSimulations } from '@/hooks/useSimulations';
import { useGamification } from '@/hooks/useGamification';
import type { SimulationFilters, SimulationConfig } from '@/types/simulations';

interface SimulationsCenterProps {
  className?: string;
}

export const SimulationsCenter: React.FC<SimulationsCenterProps> = ({
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<SimulationFilters>({});
  const [activeTab, setActiveTab] = useState('overview');

  const {
    certifications,
    userStats,
    certificationProgress,
    certificationsLoading,
    statsLoading,
    progressLoading,
    startSimulation,
    isStartingSimulation,
    getActiveSession
  } = useSimulations();

  const { userStats: gamificationStats } = useGamification();

  const activeSession = getActiveSession();

  const handleStartSimulation = (certificationId: string) => {
    const config: SimulationConfig = {
      certification_id: certificationId,
      total_questions: 65,
      time_limit: 90, // 90 minutos
      passing_score: 70,
      difficulty_distribution: {
        beginner: 30,
        intermediate: 50,
        advanced: 20
      },
      randomize_questions: true,
      randomize_options: true,
      show_results_immediately: false
    };

    startSimulation(config);
  };

  const handleViewProgress = (certificationId: string) => {
    // TODO: Implementar navegação para página de progresso detalhado
    console.log('View progress for certification:', certificationId);
  };

  const filteredCertifications = certifications.filter(cert => {
    if (filters.search && !cert.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getCertificationProgress = (certificationId: string) => {
    return certificationProgress.find(p => p.certification_id === certificationId);
  };

  if (certificationsLoading || statsLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Carregando simulações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com Gamificação */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-white mb-2">
              Centro de Simulações
            </h1>
            <p className="text-gray-400">
              Pratique com simulações realistas de certificações em tecnologia
            </p>
          </div>

          {/* Sessão Ativa */}
          {activeSession && (
            <Card className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/30 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Play className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Simulação em Andamento</h3>
                      <p className="text-sm text-gray-400">
                        Continue sua simulação de onde parou
                      </p>
                    </div>
                  </div>
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Painel de Gamificação */}
        <div className="lg:w-80">
          <GamificationPanel 
            userStats={gamificationStats}
            compact={true}
          />
        </div>
      </div>

      {/* Tabs de Navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="certifications"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
          >
            <Award className="w-4 h-4 mr-2" />
            Certificações
          </TabsTrigger>
          <TabsTrigger 
            value="progress"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Progresso
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-4 text-center">
                <div className="p-3 bg-cyan-900/20 rounded-lg w-fit mx-auto mb-3">
                  <Target className="w-6 h-6 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {userStats?.completed_sessions || 0}
                </p>
                <p className="text-sm text-gray-400">Simulações Concluídas</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-4 text-center">
                <div className="p-3 bg-yellow-900/20 rounded-lg w-fit mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {userStats?.average_score || 0}%
                </p>
                <p className="text-sm text-gray-400">Pontuação Média</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-4 text-center">
                <div className="p-3 bg-green-900/20 rounded-lg w-fit mx-auto mb-3">
                  <Award className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {userStats?.certifications_passed || 0}
                </p>
                <p className="text-sm text-gray-400">Certificações Aprovadas</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-4 text-center">
                <div className="p-3 bg-purple-900/20 rounded-lg w-fit mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {Math.round((userStats?.total_time_spent || 0) / 3600)}h
                </p>
                <p className="text-sm text-gray-400">Tempo de Estudo</p>
              </CardContent>
            </Card>
          </div>

          {/* Certificações em Destaque */}
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">
                Certificações Populares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCertifications.slice(0, 6).map(certification => (
                  <CertificationCard
                    key={certification.id}
                    certification={certification}
                    progress={getCertificationProgress(certification.id)}
                    onStartSimulation={handleStartSimulation}
                    onViewProgress={handleViewProgress}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificações */}
        <TabsContent value="certifications" className="space-y-6">
          {/* Filtros e Busca */}
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar certificações..."
                      value={filters.search || ''}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                  
                  <div className="flex border border-gray-600 rounded-lg overflow-hidden">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-none border-0"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-none border-0"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Certificações */}
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }
          `}>
            {filteredCertifications.map(certification => (
              <CertificationCard
                key={certification.id}
                certification={certification}
                progress={getCertificationProgress(certification.id)}
                onStartSimulation={handleStartSimulation}
                onViewProgress={handleViewProgress}
                className={viewMode === 'list' ? 'flex-row' : ''}
              />
            ))}
          </div>

          {filteredCertifications.length === 0 && (
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhuma certificação encontrada
                </h3>
                <p className="text-gray-400">
                  Tente ajustar os filtros de busca
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Progresso */}
        <TabsContent value="progress" className="space-y-6">
          {userStats && (
            <SimulationStats stats={userStats} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};