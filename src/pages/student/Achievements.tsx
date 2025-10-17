import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAchievements } from '@/hooks/useAchievements'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import LoadingState from '@/components/LoadingState'
import ErrorState from '@/components/ErrorState'
import { 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  Search, 
  Filter, 
  Calendar,
  Target,
  CheckCircle,
  Lock,
  Gift,
  Download,
  Share2,
  TrendingUp,
  RefreshCw
} from 'lucide-react'

export default function StudentAchievements() {
  const { user } = useAuth()
  const {
    // Estados principais
    achievements,
    userBadges,
    progress,
    loading,
    error,
    
    // Filtros
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    rarityFilter,
    setRarityFilter,
    earnedFilter,
    setEarnedFilter,
    
    // Estatísticas
    stats,
    
    // Ações
    awardAchievement,
    checkAutoAchievements,
    createAchievementNotification,
    refreshData,
    
    // Funções de consulta
    getFilteredAchievements,
    getAchievementProgress,
    isAchievementEarned,
    getEarnedAchievements,
    getAvailableAchievements,
    getAchievementsByCategory,
    getAchievementsByRarity,
    getUserAchievementStats
  } = useAchievements()

  const [activeTab, setActiveTab] = useState('achievements')
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null)
  const [showAchievementDetail, setShowAchievementDetail] = useState(false)

  useEffect(() => {
    // Verificar conquistas automáticas ao carregar a página
    checkAutoAchievements()
  }, [checkAutoAchievements])

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'learning', label: 'Aprendizado' },
    { value: 'social', label: 'Social' },
    { value: 'completion', label: 'Conclusão' },
    { value: 'streak', label: 'Sequência' },
    { value: 'special', label: 'Especial' }
  ]

  const rarityOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'common', label: 'Comum', color: 'bg-gray-100 text-gray-800' },
    { value: 'rare', label: 'Raro', color: 'bg-blue-100 text-blue-800' },
    { value: 'epic', label: 'Épico', color: 'bg-purple-100 text-purple-800' },
    { value: 'legendary', label: 'Lendário', color: 'bg-yellow-100 text-yellow-800' }
  ]

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'earned', label: 'Conquistados' },
    { value: 'available', label: 'Disponíveis' },
    { value: 'locked', label: 'Bloqueados' }
  ]

  const handleAchievementClick = (achievement: any) => {
    setSelectedAchievement(achievement)
    setShowAchievementDetail(true)
  }

  const handleGenerateCertificate = async (achievementId: string) => {
    try {
      // Implementar geração de certificado
      await createAchievementNotification(
        achievementId,
        'certificate_generated',
        'Certificado gerado com sucesso!'
      )
    } catch (error) {
      console.error('Erro ao gerar certificado:', error)
    }
  }

  const getRarityBadge = (rarity: string) => {
    const rarityConfig = rarityOptions.find(r => r.value === rarity)
    return rarityConfig && rarityConfig.color ? (
      <Badge className={rarityConfig.color}>
        {rarityConfig.label}
      </Badge>
    ) : null
  }

  const AchievementCard = ({ achievement }: any) => {
    const progressValue = getAchievementProgress(achievement.id)
    const isEarned = isAchievementEarned(achievement.id)

    return (
      <Card 
        className={`hover:shadow-lg transition-all cursor-pointer ${
          isEarned ? 'border-yellow-200 bg-yellow-50' : 
          progressValue > 0 ? 'border-blue-200 bg-blue-50' : 
          'border-gray-200 opacity-75'
        }`}
        onClick={() => handleAchievementClick(achievement)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {achievement.icon_url ? (
                <img
                  src={achievement.icon_url}
                  alt={achievement.name}
                  className={`w-12 h-12 rounded-full object-cover ${!isEarned && progressValue === 0 ? 'grayscale' : ''}`}
                />
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isEarned ? 'bg-yellow-100' : progressValue > 0 ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {isEarned ? (
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  ) : progressValue > 0 ? (
                    <Target className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              )}
              <div>
                <CardTitle className="text-base">{achievement.name}</CardTitle>
                <p className="text-sm text-gray-600">{achievement.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEarned && <CheckCircle className="w-5 h-5 text-green-600" />}
              {getRarityBadge(achievement.rarity)}
              <Badge variant={isEarned ? "default" : progressValue > 0 ? "secondary" : "outline"}>
                {achievement.points} pts
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">{achievement.description}</p>
          
          {(progressValue > 0 || isEarned) && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progresso</span>
                <span>{Math.min(progressValue, 100)}%</span>
              </div>
              <Progress value={Math.min(progressValue, 100)} className="h-2" />
            </div>
          )}

          {isEarned && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Conquistado</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  handleGenerateCertificate(achievement.id)
                }}
              >
                <Download className="w-3 h-3 mr-1" />
                Certificado
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const BadgeCard = ({ badge }: any) => (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          {badge.icon_url ? (
            <img
              src={badge.icon_url}
              alt={badge.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: badge.color || '#6B7280' }}
            >
              {badge.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{badge.name}</h3>
            <p className="text-sm text-gray-600">{badge.description}</p>
            {badge.earned_at && (
              <p className="text-xs text-gray-400 mt-1">
                Conquistado em {new Date(badge.earned_at).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return <LoadingState message="Carregando conquistas..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar conquistas"
        message={error}
        onRetry={refreshData}
      />
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conquistas</h1>
          <p className="text-gray-600">Acompanhe seu progresso e desbloqueie conquistas</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Badge variant="outline" className="text-sm">
            <Trophy className="w-3 h-3 mr-1" />
            {stats.totalPoints || 0} pontos
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Conquistas</p>
                <p className="text-xl font-bold">{stats.earnedCount}/{stats.totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Medal className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Badges</p>
                <p className="text-xl font-bold">{userBadges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                <p className="text-xl font-bold">{stats.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Progresso Médio</p>
                <p className="text-xl font-bold">{stats.averageProgress}%</p>
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
                  placeholder="Buscar conquistas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Raridade" />
              </SelectTrigger>
              <SelectContent>
                {rarityOptions.map(rarity => (
                  <SelectItem key={rarity.value} value={rarity.value}>
                    {rarity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={earnedFilter} onValueChange={setEarnedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          {getFilteredAchievements().length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhuma conquista encontrada</p>
                <p className="text-sm text-gray-400">Continue estudando para desbloquear conquistas!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredAchievements().map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          {userBadges.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Medal className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhum badge conquistado ainda</p>
                <p className="text-sm text-gray-400">Complete missões e conquistas para ganhar badges!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Achievement Detail Dialog */}
      <Dialog open={showAchievementDetail} onOpenChange={setShowAchievementDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>{selectedAchievement?.name}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedAchievement && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {selectedAchievement.icon_url ? (
                  <img
                    src={selectedAchievement.icon_url}
                    alt={selectedAchievement.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-yellow-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{selectedAchievement.name}</h3>
                  <p className="text-gray-600">{selectedAchievement.category}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getRarityBadge(selectedAchievement.rarity)}
                    <Badge variant="secondary">
                      {selectedAchievement.points} pontos
                    </Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600">{selectedAchievement.description}</p>
              
              {selectedAchievement.requirements && (
                <div>
                  <h4 className="font-semibold mb-2">Requisitos:</h4>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {JSON.stringify(selectedAchievement.requirements, null, 2)}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{getAchievementProgress(selectedAchievement.id)}%</span>
                </div>
                <Progress value={getAchievementProgress(selectedAchievement.id)} />
              </div>

              {isAchievementEarned(selectedAchievement.id) && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateCertificate(selectedAchievement.id)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Certificado
                  </Button>
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
