import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Rocket, 
  Filter, 
  Grid3X3, 
  List, 
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { MissionCard } from './MissionCard';
import { MissionFilters } from './MissionFilters';
import { MissionStats } from './MissionStats';
import { GamificationPanel } from '@/components/gamification/GamificationPanel';
import { useMissions } from '@/hooks';
import { useGamification } from '@/hooks/useGamification';
import { MissionFilters as MissionFiltersType } from '@/types/missions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MissionsHubProps {
  className?: string;
}

export function MissionsHub({ className }: MissionsHubProps) {
  const [filters, setFilters] = useState<MissionFiltersType>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    missions, 
    categories, 
    stats, 
    isLoading, 
    startMission, 
    isStarting,
    filterMissions,
    getMissionProgress
  } = useMissions();

  const { lifeSystem } = useGamification();

  // Filtrar missões baseado nos filtros ativos
  const filteredMissions = useMemo(() => {
    if (!missions) return [];
    return filterMissions(filters);
  }, [missions, filters, filterMissions]);

  const handleStartMission = async (missionId: string) => {
    if (!lifeSystem || lifeSystem.current <= 0) {
      toast.error('Sem vidas disponíveis! Aguarde a regeneração ou adquira mais vidas.');
      return;
    }

    try {
      await startMission(missionId);
    } catch (error) {
      console.error('Erro ao iniciar missão:', error);
    }
  };

  const handleContinueMission = (missionId: string) => {
    // Navegar para a página da missão
    toast.info('Redirecionando para a missão...');
    // TODO: Implementar navegação
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-gray-400">Carregando missões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/20 rounded-lg border border-purple-500/30">
            <Rocket className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Hub de Missões</h1>
            <p className="text-gray-400">
              Complete missões gamificadas e ganhe XP para evoluir suas habilidades
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "border-gray-600 text-gray-300",
              showFilters && "border-purple-500/50 text-purple-400"
            )}
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

      {/* Painel de Gamificação */}
      <GamificationPanel compact />

      {/* Aviso sobre vidas */}
      {lifeSystem && lifeSystem.current <= 0 && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-red-400 font-medium">Sem vidas disponíveis!</p>
                <p className="text-red-300/70 text-sm">
                  Aguarde a regeneração automática ou adquira mais vidas para continuar jogando.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="missions" className="space-y-6">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger value="missions" className="data-[state=active]:bg-purple-600">
            <Rocket className="w-4 h-4 mr-2" />
            Missões
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filtros */}
            {showFilters && (
              <div className="lg:col-span-1">
                <MissionFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={categories}
                />
              </div>
            )}

            {/* Lista de Missões */}
            <div className={cn(
              showFilters ? "lg:col-span-3" : "lg:col-span-4"
            )}>
              {filteredMissions.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <Rocket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                      Nenhuma missão encontrada
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Tente ajustar os filtros ou aguarde novas missões serem adicionadas.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setFilters({})}
                      className="border-gray-600 text-gray-300"
                    >
                      Limpar Filtros
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={cn(
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "space-y-4"
                )}>
                  {filteredMissions.map((mission) => {
                    const progress = getMissionProgress(mission.id);
                    const isLocked = false; // TODO: Implementar lógica de pré-requisitos
                    
                    return (
                      <MissionCard
                        key={mission.id}
                        mission={mission}
                        progress={progress}
                        onStart={() => handleStartMission(mission.id)}
                        onContinue={() => handleContinueMission(mission.id)}
                        isLocked={isLocked}
                        className={viewMode === 'list' ? 'w-full' : ''}
                      />
                    );
                  })}
                </div>
              )}

              {/* Indicador de carregamento */}
              {isStarting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <Card className="bg-gray-900 border-gray-700 p-6">
                    <div className="text-center space-y-4">
                      <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                      <p className="text-white">Iniciando missão...</p>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          {stats ? (
            <MissionStats stats={stats} />
          ) : (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Estatísticas não disponíveis
                </h3>
                <p className="text-gray-400">
                  Complete algumas missões para ver suas estatísticas.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}