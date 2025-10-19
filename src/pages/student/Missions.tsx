import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMissions } from '@/hooks/useMissionsRobust'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import MissionTerminal from '@/components/MissionTerminal'
import {
  Target,
  Trophy,
  Clock,
  Star,
  Search,
  Play,
  CheckCircle,
  Calendar,
  Zap,
  Code,
  MessageCircle,
  Terminal,
  Shield,
  Fingerprint,
  Layers,
  Heart
} from 'lucide-react'
import { MISSION_DELIVERY_MODES, MISSION_ENVIRONMENTS } from '@/utils/constants'

const StudentMissions: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    loading,
    error,
    missions,
    activeMissions,
    getAvailableMissions,
    getCompletedMissions,
    getDailyMissions,
    getWeeklyMissions,
    getContextualMissions,
    startMission,
    calculateMissionProgress,
    isMissionCompleted,
    isMissionStarted,
    getMissionsByType,
    terminalState,
    openMissionTerminal,
    closeMissionTerminal,
    updateTerminalCode,
    runCodeInTerminal,
    startChatbotSession,
    sendChatMessage
  } = useMissions()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('active')
  const [selectedMission, setSelectedMission] = useState<any>(null)
  const [showMissionDetail, setShowMissionDetail] = useState(false)
  const [selectedEnvironment, setSelectedEnvironment] = useState<'all' | typeof MISSION_ENVIRONMENTS[keyof typeof MISSION_ENVIRONMENTS]>(MISSION_ENVIRONMENTS.INCIDENT_RESPONSE)

  const plan = (user?.user_metadata?.plan as string) || 'free'
  const baseLives = 3
  const livesRemaining = plan === 'free'
    ? Math.max(0, baseLives - activeMissions.filter((mission: any) => mission.environment === MISSION_ENVIRONMENTS.INCIDENT_RESPONSE).length)
    : Number.POSITIVE_INFINITY
  const livesLabel = livesRemaining === Number.POSITIVE_INFINITY ? '∞ vidas' : `${livesRemaining} vidas`
  const planLabel = plan === 'free' ? 'Plano Free' : `Plano ${plan.charAt(0).toUpperCase()}${plan.slice(1)}`

  const available = getAvailableMissions()
  const completed = getCompletedMissions()
  const dailyMissions = getDailyMissions()
  const weeklyMissions = getWeeklyMissions()
  const contextualMissions = getContextualMissions()

  const selectedMissionXp = selectedMission ? (selectedMission.xp_reward ?? selectedMission.points_reward ?? selectedMission.points ?? 0) : 0

  const missionTypes = [
    { value: 'all', label: 'Todas' },
    { value: 'course_completion', label: 'Conclusão de Curso' },
    { value: 'lesson_completion', label: 'Conclusão de Lição' },
    { value: 'points_earned', label: 'Pontos Ganhos' },
    { value: 'streak', label: 'Sequência' },
    { value: 'quiz_score', label: 'Pontuação Quiz' },
    { value: 'time_spent', label: 'Tempo Gasto' },
    { value: 'terminal_scenario', label: 'Cenário de Terminal' }
  ]

  const categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'cybersecurity', label: 'Cybersegurança', color: 'bg-red-100 text-red-800' },
    { value: 'programming', label: 'Programação', color: 'bg-blue-100 text-blue-800' },
    { value: 'data-science', label: 'Ciência de Dados', color: 'bg-purple-100 text-purple-800' },
    { value: 'web-development', label: 'Desenvolvimento Web', color: 'bg-green-100 text-green-800' },
    { value: 'mobile', label: 'Desenvolvimento Mobile', color: 'bg-orange-100 text-orange-800' },
    { value: 'devops', label: 'DevOps', color: 'bg-gray-100 text-gray-800' }
  ]

  const difficulties = [
    { value: 'all', label: 'Todas' },
    { value: 'easy', label: 'Fácil', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'hard', label: 'Difícil', color: 'bg-orange-100 text-orange-800' },
    { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800' }
  ]

  const environmentOptions = [
    {
      value: 'all' as const,
      label: 'Todos os Ambientes',
      description: 'Combine firewall, terminal e forense em uma só progressão',
      Icon: Layers,
      previewClass: 'from-slate-900 via-slate-800 to-slate-900'
    },
    {
      value: MISSION_ENVIRONMENTS.FIREWALL,
      label: 'Firewall Ops',
      description: 'Interface 8-bit para ajustar regras e políticas de acesso',
      Icon: Shield,
      previewClass: 'from-orange-500 to-amber-600'
    },
    {
      value: MISSION_ENVIRONMENTS.INCIDENT_RESPONSE,
      label: 'Terminal SOC',
      description: 'Shell interativa para neutralizar incidentes em tempo real',
      Icon: Terminal,
      previewClass: 'from-blue-600 to-indigo-700'
    },
    {
      value: MISSION_ENVIRONMENTS.FORENSICS,
      label: 'Forense Digital',
      description: 'Laboratório gamificado para análise de evidências',
      Icon: Fingerprint,
      previewClass: 'from-emerald-500 to-teal-500'
    }
  ]

  const environmentLabels: Record<typeof MISSION_ENVIRONMENTS[keyof typeof MISSION_ENVIRONMENTS], string> = {
    [MISSION_ENVIRONMENTS.FIREWALL]: 'Firewall Ops',
    [MISSION_ENVIRONMENTS.INCIDENT_RESPONSE]: 'Terminal SOC',
    [MISSION_ENVIRONMENTS.FORENSICS]: 'Forense Digital'
  }

  const deliveryLabels: Record<typeof MISSION_DELIVERY_MODES[keyof typeof MISSION_DELIVERY_MODES], string> = {
    [MISSION_DELIVERY_MODES.CONFIG_PANEL]: 'Painel de Configuração',
    [MISSION_DELIVERY_MODES.TERMINAL]: 'Shell Interativa',
    [MISSION_DELIVERY_MODES.HYBRID]: 'Ambiente Híbrido'
  }

  const formatLives = (value?: number) => {
    if (!value || value <= 0) return 'Sem custo de vidas'
    return `${value} vida${value > 1 ? 's' : ''}`
  }

  const filterMissions = (missionList: any[]) => {
    return missionList.filter(mission => {
      const matchesSearch = mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mission.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || mission.type === selectedType
      const matchesDifficulty = selectedDifficulty === 'all' || mission.difficulty === selectedDifficulty
      const matchesCategory = selectedCategory === 'all' || mission.category === selectedCategory
      const matchesEnvironment = selectedEnvironment === 'all' || mission.environment === selectedEnvironment

      return matchesSearch && matchesType && matchesDifficulty && matchesCategory && matchesEnvironment
    })
  }

  const getCategoryBadge = (category: string) => {
    const categoryConfig = categories.find(c => c.value === category)
    return categoryConfig && categoryConfig.color ? (
      <Badge className={categoryConfig.color}>
        {categoryConfig.label}
      </Badge>
    ) : null
  }

  const getDifficultyBadge = (difficulty: string) => {
    const difficultyConfig = difficulties.find(d => d.value === difficulty)
    return difficultyConfig && difficultyConfig.color ? (
      <Badge className={difficultyConfig.color}>
        {difficultyConfig.label}
      </Badge>
    ) : null
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'coding': return <Code className="w-4 h-4" />
      case 'learning': return <Star className="w-4 h-4" />
      case 'social': return <MessageCircle className="w-4 h-4" />
      case 'terminal_scenario':
      case 'challenge':
        return <Terminal className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const handleMissionClick = (mission: any) => {
    setSelectedMission(mission)
    setShowMissionDetail(true)
  }

  const handleStartMission = async (mission: any) => {
    try {
      await startMission(mission.id)
      setShowMissionDetail(false)
      if (mission.type === 'coding' || mission.delivery_mode === MISSION_DELIVERY_MODES.TERMINAL) {
        openMissionTerminal(mission.id)
      }
      navigate(`/student/missions/${mission.id}`)
    } catch (error) {
      console.error('Erro ao iniciar missão:', error)
    }
  }

  // Handlers para o MissionTerminal
  const handleSubmitCode = async (code: string) => {
    try {
      // Implementar lógica de submissão de código
      const result = await runCodeInTerminal(code)
      return result
    } catch (error) {
      console.error('Erro ao submeter código:', error)
      return { success: false, error: 'Erro ao submeter código' }
    }
  }

  const handleRunCode = async (code: string) => {
    try {
      const result = await runCodeInTerminal(code)
      return result
    } catch (error) {
      console.error('Erro ao executar código:', error)
      return { success: false, error: 'Erro ao executar código' }
    }
  }

  const handleSendMessage = async (message: string) => {
    try {
      const response = await sendChatMessage(message)
      return response
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      return 'Desculpe, ocorreu um erro ao processar sua mensagem.'
    }
  }

  const MissionCard = ({ mission, showProgress = false, isCompleted = false }: any) => {
    const progress = showProgress ? calculateMissionProgress(mission.id) : 0
    const isStarted = isMissionStarted(mission.id)
    const completed = isMissionCompleted(mission.id)
    const xpValue = mission.xp_reward ?? mission.points_reward ?? mission.points ?? 0

    return (
      <Card
        className={`hover:shadow-lg transition-all cursor-pointer ${completed ? 'border-green-200 bg-green-50' : ''}`}
        onClick={() => handleMissionClick(mission)}
      >
        <CardHeader className="pb-3 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {getTypeIcon(mission.type)}
              <CardTitle className="text-base">{mission.title}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {getDifficultyBadge(mission.difficulty)}
              {mission.is_daily && <Badge variant="outline">Diária</Badge>}
              {completed && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
              {environmentLabels[mission.environment] || 'Ambiente Dinâmico'}
            </Badge>
            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
              {deliveryLabels[mission.delivery_mode] || 'Modo Interativo'}
            </Badge>
            {mission.badge_reward && (
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                Badge: {mission.badge_reward}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 line-clamp-2">{mission.description}</p>

          {mission.category && (
            <div className="flex items-center space-x-2">
              {getCategoryBadge(mission.category)}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-emerald-600">
              <Zap className="w-4 h-4" />
              <span className="font-medium">{xpValue} XP</span>
            </div>
            {mission.lives_required ? (
              <div className="flex items-center gap-2 text-rose-500">
                <Heart className="w-4 h-4" />
                <span>{formatLives(mission.lives_required)}</span>
              </div>
            ) : null}
          </div>

          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{mission.estimated_time || '30min'}</span>
            </div>
            
            {!completed && (
              <Button 
                size="sm" 
                variant={isStarted ? "outline" : "default"}
                onClick={(e) => {
                  e.stopPropagation()
                  if (isStarted) {
                    navigate(`/student/missions/${mission.id}`)
                  } else {
                    handleStartMission(mission)
                  }
                }}
              >
                {isStarted ? (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Continuar
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 mr-1" />
                    Iniciar
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Missões</h1>
          <p className="text-gray-600">Complete missões para ganhar pontos e avançar no seu aprendizado</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {planLabel}
          </Badge>
          <Badge variant="outline" className="text-sm flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-500" />
            {livesLabel}
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">{String(error)}</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs uppercase tracking-wide text-indigo-300">Ambientes Gamificados</div>
            <h2 className="text-2xl font-semibold">Firewall 8-bit, Terminal SOC e Forense Digital conectados à sua progressão</h2>
            <p className="text-sm text-indigo-100">
              Cada missão combina narrativa com validação automática: ajuste regras em uma interface retro, opere shells de recuperação e analise evidências simuladas para desbloquear badges profissionais.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs uppercase text-indigo-300">Vidas disponíveis</div>
              <div className="text-3xl font-bold">{livesRemaining === Number.POSITIVE_INFINITY ? '∞' : livesRemaining}</div>
            </div>
            {plan === 'free' && (
              <Button
                variant="secondary"
                onClick={() => navigate('/student/profile')}
                className="bg-white text-slate-900 hover:bg-slate-100"
              >
                Melhorar Plano
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ativas</p>
                <p className="text-xl font-bold">{activeMissions.length}</p>
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
                <p className="text-xl font-bold">{completed.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Diárias</p>
                <p className="text-xl font-bold">{dailyMissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                <p className="text-xl font-bold">{available.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 bg-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Layers className="w-5 h-5 text-indigo-600" /> Escolha o ambiente da missão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {environmentOptions.map((option) => {
              const isActive = selectedEnvironment === option.value
              const Icon = option.Icon
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setSelectedEnvironment(option.value)}
                  className={`rounded-xl p-4 text-left transition border ${
                    isActive
                      ? 'border-indigo-500 ring-2 ring-indigo-300 bg-white shadow-lg'
                      : 'border-slate-200 bg-slate-100 hover:bg-white'
                  }`}
                >
                  <div className={`h-24 rounded-lg bg-gradient-to-br ${option.previewClass} mb-4 flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="font-semibold text-slate-900">{option.label}</div>
                  <p className="text-xs text-slate-600 mt-2">{option.description}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

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
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {missionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-48">
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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
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
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Carregando missões...</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="active">Em Andamento</TabsTrigger>
            <TabsTrigger value="available">Disponíveis</TabsTrigger>
            <TabsTrigger value="daily">Diárias</TabsTrigger>
            <TabsTrigger value="weekly">Semanais</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {filterMissions(activeMissions).length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhuma missão em andamento</p>
                  <p className="text-sm text-gray-400">Inicie uma nova missão para começar!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterMissions(activeMissions).map((mission: any) => (
                  <MissionCard key={mission.id} mission={mission} showProgress={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            {filterMissions(available).length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhuma missão disponível</p>
                  <p className="text-sm text-gray-400">Complete missões atuais para desbloquear novas!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterMissions(available).map((mission: any) => (
                  <MissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            {filterMissions(dailyMissions).length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhuma missão diária disponível</p>
                  <p className="text-sm text-gray-400">Volte amanhã para novas missões diárias!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterMissions(dailyMissions).map((mission: any) => (
                  <MissionCard key={mission.id} mission={mission} showProgress={isMissionStarted(mission.id)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            {filterMissions(weeklyMissions).length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhuma missão semanal disponível</p>
                  <p className="text-sm text-gray-400">Novas missões semanais chegam toda segunda-feira!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterMissions(weeklyMissions).map((mission: any) => (
                  <MissionCard key={mission.id} mission={mission} showProgress={isMissionStarted(mission.id)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filterMissions(completed).length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhuma missão concluída ainda</p>
                  <p className="text-sm text-gray-400">Complete suas primeiras missões para vê-las aqui!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterMissions(completed).map((mission: any) => (
                  <MissionCard key={mission.id} mission={mission} isCompleted={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Mission Detail Dialog */}
      <Dialog open={showMissionDetail} onOpenChange={setShowMissionDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedMission && getTypeIcon(selectedMission.type)}
              <span>{selectedMission?.title}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedMission && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {getDifficultyBadge(selectedMission.difficulty)}
                {selectedMission.is_daily && <Badge variant="outline">Diária</Badge>}
                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                  {environmentLabels[selectedMission.environment] || 'Ambiente Dinâmico'}
                </Badge>
                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
                  {deliveryLabels[selectedMission.delivery_mode] || 'Modo Interativo'}
                </Badge>
                <Badge variant="secondary">
                  <Trophy className="w-3 h-3 mr-1" />
                  {selectedMissionXp} XP
                </Badge>
                {selectedMission.badge_reward && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                    Badge: {selectedMission.badge_reward}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Zap className="w-4 h-4" />
                  <span>Recompensa dinâmica de {selectedMissionXp} XP</span>
                </div>
                {selectedMission.lives_required ? (
                  <div className="flex items-center gap-2 text-rose-500">
                    <Heart className="w-4 h-4" />
                    <span>{formatLives(selectedMission.lives_required)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Heart className="w-4 h-4" />
                    <span>Sem custo de vidas</span>
                  </div>
                )}
                {selectedMission.unlock_requirement && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Layers className="w-4 h-4" />
                    <span>{selectedMission.unlock_requirement}</span>
                  </div>
                )}
              </div>

              <p className="text-gray-600">{selectedMission.description}</p>

              {selectedMission.objective && (
                <div>
                  <h4 className="font-semibold mb-2">Objetivo:</h4>
                  <p className="text-sm text-gray-600">{selectedMission.objective}</p>
                </div>
              )}

              {selectedMission.steps && selectedMission.steps.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Passos:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {selectedMission.steps.map((step: any, index: number) => (
                      <li key={index} className="text-sm text-gray-600">{step.description}</li>
                    ))}
                  </ol>
                </div>
              )}

              {selectedMission.flag_hint && (
                <div className="rounded-lg bg-slate-100 border border-slate-200 p-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">Dica de Flag:</span> {selectedMission.flag_hint}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                {selectedMission.type === 'coding' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      openMissionTerminal(selectedMission.id)
                      setShowMissionDetail(false)
                    }}
                  >
                    <Terminal className="w-4 h-4 mr-2" />
                    Abrir Terminal
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    startChatbotSession(selectedMission.id)
                    setShowMissionDetail(false)
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ajuda IA
                </Button>
                <Button onClick={() => handleStartMission(selectedMission)}>
                  <Play className="w-4 h-4 mr-2" />
                  {isMissionStarted(selectedMission.id) ? 'Continuar' : 'Iniciar'} Missão
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mission Terminal */}
      <MissionTerminal
        mission={terminalState.currentMission}
        isOpen={terminalState.isOpen}
        onClose={closeMissionTerminal}
        onSubmitCode={handleSubmitCode}
        onRunCode={handleRunCode}
        onSendMessage={handleSendMessage}
      />
    </div>
  )
}

export default StudentMissions
