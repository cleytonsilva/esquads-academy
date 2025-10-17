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
  Filter, 
  Play, 
  CheckCircle, 
  Calendar,
  Zap,
  Code,
  MessageCircle,
  Terminal
} from 'lucide-react'

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

  const available = getAvailableMissions()
  const completed = getCompletedMissions()
  const dailyMissions = getDailyMissions()
  const weeklyMissions = getWeeklyMissions()
  const contextualMissions = getContextualMissions()

  const missionTypes = [
    { value: 'all', label: 'Todas' },
    { value: 'course_completion', label: 'Conclusão de Curso' },
    { value: 'lesson_completion', label: 'Conclusão de Lição' },
    { value: 'points_earned', label: 'Pontos Ganhos' },
    { value: 'streak', label: 'Sequência' },
    { value: 'quiz_score', label: 'Pontuação Quiz' },
    { value: 'time_spent', label: 'Tempo Gasto' },
    { value: 'terminal', label: 'Terminal' }
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

  const filterMissions = (missionList: any[]) => {
    return missionList.filter(mission => {
      const matchesSearch = mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mission.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || mission.type === selectedType
      const matchesDifficulty = selectedDifficulty === 'all' || mission.difficulty === selectedDifficulty
      const matchesCategory = selectedCategory === 'all' || mission.category === selectedCategory
      
      return matchesSearch && matchesType && matchesDifficulty && matchesCategory
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
      if (mission.type === 'coding') {
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

    return (
      <Card 
        className={`hover:shadow-lg transition-all cursor-pointer ${completed ? 'border-green-200 bg-green-50' : ''}`}
        onClick={() => handleMissionClick(mission)}
      >
        <CardHeader className="pb-3">
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
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 line-clamp-2">{mission.description}</p>
          
          {mission.category && (
            <div className="flex items-center space-x-2">
              {getCategoryBadge(mission.category)}
            </div>
          )}
          
          {mission.points_reward && (
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">{mission.points_reward} pontos</span>
            </div>
          )}

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
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Trophy className="w-3 h-3 mr-1" />
            {user?.points || 0} pontos
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
              <div className="flex items-center space-x-2">
                {getDifficultyBadge(selectedMission.difficulty)}
                {selectedMission.is_daily && <Badge variant="outline">Diária</Badge>}
                <Badge variant="secondary">
                  <Trophy className="w-3 h-3 mr-1" />
                  {selectedMission.points_reward} pontos
                </Badge>
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
