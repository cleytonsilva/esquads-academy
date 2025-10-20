/**
 * Mission Hub - Componente principal para exibição de missões
 * Implementa o hub unificado de missões conforme especificado no plano
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Target, 
  Trophy, 
  Search, 
  Filter, 
  Star,
  CheckCircle,
  Clock,
  Zap,
  Terminal,
  Award,
  AlertCircle,
  Loader2,
  Heart,
  Shield,
  Bot,
  Gamepad2,
  Code,
  Network,
  Eye,
  Bug,
  Play
} from 'lucide-react'
import { 
  Mission, 
  MissionCategory, 
  DifficultyLevel 
} from '@/types/gamification'
import { MISSION_STATUS, MISSION_TYPES } from '@/utils/constants'
import { useAuth } from '@/contexts/AuthContext'
import { getAllMissions, getUserProgress, startMission } from '@/services/missionService'
import { toast } from 'sonner'

interface MissionHubProps {
  className?: string
}

export const MissionHub: React.FC<MissionHubProps> = ({ className }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [missions, setMissions] = useState<Mission[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('available')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [recommendedMissions, setRecommendedMissions] = useState<Mission[]>([])

  // Carregar missões do Supabase
  useEffect(() => {
    const loadMissions = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)
        
        console.log('🔄 Carregando missões do Supabase...')
        
        // Carregar missões, progresso do usuário e perfil
        const [missionsData, progressData] = await Promise.all([
          getAllMissions(),
          getUserProgress(user.id)
        ])

        console.log('📊 Missões carregadas:', missionsData.length)
        console.log('📈 Progresso carregado:', progressData.length)

        // Mapear progresso para as missões
        const missionsWithProgress = missionsData.map(mission => {
          const progress = progressData.find(p => p.missionId === mission.id)
          return {
            ...mission,
            status: progress?.status || MISSION_STATUS.NOT_STARTED,
            progress: progress?.progress || 0
          }
        })

        setMissions(missionsWithProgress)
        
        // Gerar recomendações personalizadas
        generateRecommendations(missionsWithProgress, progressData)
        
        console.log('✅ Missões processadas:', missionsWithProgress.length)
        
      } catch (error) {
        console.error('❌ Erro ao carregar missões:', error)
        setError('Erro ao carregar missões. Tente novamente.')
        toast.error('Erro ao carregar missões')
      } finally {
        setLoading(false)
      }
    }

    loadMissions()
  }, [user])

  // Função para gerar recomendações personalizadas
  const generateRecommendations = (missions: Mission[], progressData: any[]) => {
    const completedMissions = missions.filter(m => m.status === MISSION_STATUS.COMPLETED)
    const availableMissions = missions.filter(m => m.status === MISSION_STATUS.NOT_STARTED)
    
    // Algoritmo de recomendação simples baseado em:
    // 1. Dificuldade progressiva
    // 2. Categorias não exploradas
    // 3. Missões com maior XP
    
    const recommendations = availableMissions
      .sort((a, b) => {
        // Priorizar missões de dificuldade média se completou fáceis
        const hasCompletedEasy = completedMissions.some(m => m.difficulty === DifficultyLevel.Easy)
        const hasCompletedMedium = completedMissions.some(m => m.difficulty === DifficultyLevel.Medium)
        
        if (hasCompletedEasy && !hasCompletedMedium && a.difficulty === DifficultyLevel.Medium) {
          return -1
        }
        if (hasCompletedMedium && !hasCompletedEasy && a.difficulty === DifficultyLevel.Easy) {
          return -1
        }
        
        // Priorizar por XP
        return (b.xpReward || 0) - (a.xpReward || 0)
      })
      .slice(0, 3) // Top 3 recomendações
    
    setRecommendedMissions(recommendations)
  }

  // Filtros
  const categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: MissionCategory.Firewall, label: 'Firewall' },
    { value: MissionCategory.CloudSecurity, label: 'Segurança na Nuvem' },
    { value: MissionCategory.Forensics, label: 'Forense Digital' },
    { value: MissionCategory.NetworkSecurity, label: 'Segurança de Rede' },
    { value: MissionCategory.PenetrationTesting, label: 'Teste de Penetração' },
    { value: MissionCategory.IncidentResponse, label: 'Resposta a Incidentes' }
  ]

  const difficulties = [
    { value: 'all', label: 'Todas as Dificuldades' },
    { value: DifficultyLevel.Easy, label: 'Fácil' },
    { value: DifficultyLevel.Medium, label: 'Médio' },
    { value: DifficultyLevel.Hard, label: 'Difícil' },
    { value: DifficultyLevel.Expert, label: 'Expert' }
  ]

  const types = [
    { value: 'all', label: 'Todos os Tipos' },
    { value: MISSION_TYPES.TERMINAL, label: 'Terminal CLI' },
    { value: MISSION_TYPES.WEB_INTERFACE, label: 'Interface Web' },
    { value: MISSION_TYPES.CHAT_TEXTUAL, label: 'Chat Textual' }
  ]

  // Filtrar missões
  const filteredMissions = missions.filter(mission => {
    const matchesSearch = mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mission.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || mission.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || mission.difficulty === selectedDifficulty
    const matchesType = selectedType === 'all' || mission.mission_type === selectedType
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesType
  })

  // Agrupar missões por status
  const availableMissions = filteredMissions.filter(m => m.status === MISSION_STATUS.NOT_STARTED)
  const inProgressMissions = filteredMissions.filter(m => m.status === MISSION_STATUS.IN_PROGRESS)
  const completedMissions = filteredMissions.filter(m => m.status === MISSION_STATUS.COMPLETED)

  // Estatísticas
  const stats = {
    total: missions.length,
    available: availableMissions.length,
    inProgress: inProgressMissions.length,
    completed: completedMissions.length,
    totalXP: completedMissions.reduce((sum, m) => sum + (m.xpReward || 0), 0)
  }

  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case MISSION_TYPES.TERMINAL:
        return <Terminal className="w-4 h-4" />
      case MISSION_TYPES.WEB_INTERFACE:
        return <Network className="w-4 h-4" />
      case MISSION_TYPES.CHAT_TEXTUAL:
        return <Bot className="w-4 h-4" />
      default:
        return <Gamepad2 className="w-4 h-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case DifficultyLevel.Easy:
        return 'bg-green-100 text-green-800'
      case DifficultyLevel.Medium:
        return 'bg-yellow-100 text-yellow-800'
      case DifficultyLevel.Hard:
        return 'bg-orange-100 text-orange-800'
      case DifficultyLevel.Expert:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStartMission = async (mission: Mission) => {
    if (!user) return

    setActionLoading(true)
    try {
      console.log('🚀 Iniciando missão:', mission.title)
      
      // Iniciar missão no Supabase
      await startMission(user.id, mission.id)
      
      // Atualizar status da missão localmente
      setMissions(prev => prev.map(m => 
        m.id === mission.id 
          ? { ...m, status: MISSION_STATUS.IN_PROGRESS }
          : m
      ))
      
      toast.success(`Missão "${mission.title}" iniciada!`)
      
      // Navegar para a página de gameplay da missão
      navigate(`/student/missions/${mission.id}/play`)
    } catch (error) {
      console.error('❌ Erro ao iniciar missão:', error)
      toast.error('Erro ao iniciar missão. Tente novamente.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleContinueMission = (mission: Mission) => {
    navigate(`/student/missions/${mission.id}/play`)
  }

  // Loading state
  if (loading) {
    return (
      <div className={`p-6 space-y-6 ${className || ''}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando missões...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`p-6 space-y-6 ${className || ''}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Missões</h1>
          <p className="text-gray-600">Complete missões para ganhar XP e avançar no seu aprendizado</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Trophy className="w-3 h-3 mr-1" />
            {stats.totalXP} XP
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Award className="w-3 h-3 mr-1" />
            {stats.completed} Concluídas
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Heart className="w-3 h-3 mr-1 text-red-500" />
            3 Vidas
          </Badge>
        </div>
      </div>

      {/* Recomendações Personalizadas */}
      {recommendedMissions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg text-blue-900">Recomendadas para Você</CardTitle>
            </div>
            <p className="text-sm text-blue-700">Missões selecionadas baseadas no seu progresso</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedMissions.map(mission => (
                <Card key={mission.id} className="hover:shadow-md transition-shadow cursor-pointer border-blue-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getMissionTypeIcon(mission.mission_type || MISSION_TYPES.TERMINAL)}
                        <CardTitle className="text-sm">{mission.title}</CardTitle>
                      </div>
                      <Badge className={getDifficultyColor(mission.difficulty)}>
                        {mission.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-gray-600 line-clamp-2">{mission.description}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        <span>{mission.xpReward || 100} XP</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span>{mission.estimatedDuration || 30}min</span>
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleStartMission(mission)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-3 h-3 mr-1" />
                          Iniciar
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                <p className="text-xl font-bold">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Em Progresso</p>
                <p className="text-xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total XP</p>
                <p className="text-xl font-bold">{stats.totalXP}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar missões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {types.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mission Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Disponíveis ({stats.available})</TabsTrigger>
          <TabsTrigger value="progress">Em Progresso ({stats.inProgress})</TabsTrigger>
          <TabsTrigger value="completed">Concluídas ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableMissions.map(mission => (
              <Card key={mission.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getMissionTypeIcon(mission.mission_type || MISSION_TYPES.TERMINAL)}
                      <CardTitle className="text-lg">{mission.title}</CardTitle>
                    </div>
                    <Badge className={getDifficultyColor(mission.difficulty)}>
                      {mission.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{mission.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span>{mission.xpReward || 100} XP</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{mission.estimatedDuration || 30}min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {mission.category}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => handleStartMission(mission)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-1" />
                          Iniciar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {availableMissions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma missão disponível encontrada</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressMissions.map(mission => (
              <Card key={mission.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getMissionTypeIcon(mission.mission_type || MISSION_TYPES.TERMINAL)}
                      <CardTitle className="text-lg">{mission.title}</CardTitle>
                    </div>
                    <Badge className={getDifficultyColor(mission.difficulty)}>
                      {mission.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{mission.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progresso</span>
                      <span>{mission.progress || 0}%</span>
                    </div>
                    <Progress value={mission.progress || 0} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {mission.category}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => handleContinueMission(mission)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {inProgressMissions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma missão em progresso</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedMissions.map(mission => (
              <Card key={mission.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getMissionTypeIcon(mission.mission_type || MISSION_TYPES.TERMINAL)}
                      <CardTitle className="text-lg">{mission.title}</CardTitle>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Concluída
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{mission.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span>{mission.xpReward || 100} XP</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {mission.category}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleContinueMission(mission)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {completedMissions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma missão concluída ainda</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MissionHub
