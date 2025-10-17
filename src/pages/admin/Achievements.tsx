import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Trophy, 
  Medal, 
  Award, 
  Users,
  Star,
  Target,
  Zap,
  Crown,
  Filter,
  Download,
  Upload,
  BarChart3
} from 'lucide-react'

// Hooks
import { useAchievements } from '@/hooks/useAchievements'

// Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LoadingState, { CardLoadingState } from '@/components/LoadingState'
import ErrorState, { ServerErrorState } from '@/components/ErrorState'

// Types
import type { Achievement, AchievementCriteria } from '@/types/achievements'

interface AchievementFormData {
  name: string
  description: string
  key: string
  points: number
  category: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon_url: string
  is_active: boolean
  criteria: AchievementCriteria
}

const categories = [
  { value: 'missions', label: 'Missões' },
  { value: 'courses', label: 'Cursos' },
  { value: 'social', label: 'Social' },
  { value: 'progress', label: 'Progresso' },
  { value: 'special', label: 'Especial' },
  { value: 'time', label: 'Tempo' },
  { value: 'streak', label: 'Sequência' }
]

const difficulties = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Médio' },
  { value: 'hard', label: 'Difícil' },
  { value: 'expert', label: 'Expert' }
]

const rarities = [
  { value: 'common', label: 'Comum' },
  { value: 'rare', label: 'Raro' },
  { value: 'epic', label: 'Épico' },
  { value: 'legendary', label: 'Lendário' }
]

export default function AdminAchievements() {
  const navigate = useNavigate()
  
  // Hook personalizado para achievements
  const {
    // Estados
    achievements,
    userBadges,
    achievementProgress,
    loading,
    error,
    stats,
    
    // Filtros
    searchTerm,
    categoryFilter,
    rarityFilter,
    earnedFilter,
    setSearchTerm,
    setCategoryFilter,
    setRarityFilter,
    setEarnedFilter,
    
    // Ações
    awardAchievement,
    checkAutoAchievements,
    createAchievementNotification,
    
    // Queries
    getFilteredAchievements,
    getAchievementsByCategory,
    getAchievementsByRarity,
    getUserAchievementStats,
    getTopAchievers,
    refreshData
  } = useAchievements()

  // Estados locais
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('achievements')

  // Form data
  const [formData, setFormData] = useState<AchievementFormData>({
    name: '',
    description: '',
    key: '',
    points: 0,
    category: 'missions',
    difficulty: 'easy',
    rarity: 'common',
    icon_url: '',
    is_active: true,
    criteria: {
      type: 'count',
      target: 1,
      conditions: {}
    }
  })

  // Filtros aplicados
  const filteredAchievements = getFilteredAchievements()

  // Handlers
  const handleCreateAchievement = async (data: AchievementFormData) => {
    setIsSubmitting(true)
    try {
      // Aqui você implementaria a criação via Supabase
      // const { error } = await supabase.from('achievements').insert([data])
      // if (error) throw error
      
      toast.success('Achievement criado com sucesso!')
      setIsCreateDialogOpen(false)
      resetForm()
      refreshData()
    } catch (error: any) {
      toast.error('Erro ao criar achievement: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditAchievement = async (data: AchievementFormData) => {
    if (!selectedAchievement) return
    
    setIsSubmitting(true)
    try {
      // Aqui você implementaria a edição via Supabase
      // const { error } = await supabase
      //   .from('achievements')
      //   .update(data)
      //   .eq('id', selectedAchievement.id)
      // if (error) throw error
      
      toast.success('Achievement atualizado com sucesso!')
      setIsEditDialogOpen(false)
      resetForm()
      refreshData()
    } catch (error: any) {
      toast.error('Erro ao atualizar achievement: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAchievement = async (achievementId: string) => {
    try {
      // Aqui você implementaria a exclusão via Supabase
      // const { error } = await supabase
      //   .from('achievements')
      //   .delete()
      //   .eq('id', achievementId)
      // if (error) throw error
      
      toast.success('Achievement excluído com sucesso!')
      refreshData()
    } catch (error: any) {
      toast.error('Erro ao excluir achievement: ' + error.message)
    }
  }

  const openEditDialog = (achievement: Achievement) => {
    setSelectedAchievement(achievement)
    setFormData({
      name: achievement.name,
      description: achievement.description,
      key: achievement.key,
      points: achievement.points,
      category: achievement.category,
      difficulty: achievement.difficulty,
      rarity: achievement.rarity,
      icon_url: achievement.icon_url || '',
      is_active: achievement.is_active,
      criteria: achievement.criteria
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      key: '',
      points: 0,
      category: 'missions',
      difficulty: 'easy',
      rarity: 'common',
      icon_url: '',
      is_active: true,
      criteria: {
        type: 'count',
        target: 1,
        conditions: {}
      }
    })
    setSelectedAchievement(null)
  }

  const getDifficultyBadge = (difficulty: string) => {
    const variants = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800'
    }
    return (
      <Badge className={variants[difficulty as keyof typeof variants] || variants.easy}>
        {difficulties.find(d => d.value === difficulty)?.label || difficulty}
      </Badge>
    )
  }

  const getRarityBadge = (rarity: string) => {
    const variants = {
      common: 'bg-gray-100 text-gray-800',
      rare: 'bg-blue-100 text-blue-800',
      epic: 'bg-purple-100 text-purple-800',
      legendary: 'bg-yellow-100 text-yellow-800'
    }
    return (
      <Badge className={variants[rarity as keyof typeof variants] || variants.common}>
        {rarities.find(r => r.value === rarity)?.label || rarity}
      </Badge>
    )
  }

  // Loading state
  if (loading) {
    return <LoadingState type="spinner" size="lg" message="Carregando achievements..." fullScreen />
  }

  // Error state
  if (error) {
    return (
      <ServerErrorState 
        onRetry={refreshData}
        onSupport={() => navigate('/support')}
      />
    )
  }

  // Form Component
  const AchievementForm = ({ onSubmit, submitText }: { 
    onSubmit: (data: AchievementFormData) => void
    submitText: string 
  }) => (
    <form onSubmit={(e) => {
      e.preventDefault()
      onSubmit(formData)
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nome do achievement"
            required
          />
        </div>
        <div>
          <Label htmlFor="key">Chave</Label>
          <Input
            id="key"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            placeholder="achievement_key"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição do achievement"
          required
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="points">Pontos</Label>
          <Input
            id="points"
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
            min="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
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
        <div>
          <Label htmlFor="difficulty">Dificuldade</Label>
          <Select value={formData.difficulty} onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map(difficulty => (
                <SelectItem key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="rarity">Raridade</Label>
          <Select value={formData.rarity} onValueChange={(value: any) => setFormData({ ...formData, rarity: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rarities.map(rarity => (
                <SelectItem key={rarity.value} value={rarity.value}>
                  {rarity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="icon_url">URL do Ícone</Label>
        <Input
          id="icon_url"
          value={formData.icon_url}
          onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
          placeholder="https://exemplo.com/icone.png"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        />
        <Label htmlFor="is_active">Ativo</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitText}
        </Button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
          <p className="text-gray-600">Gerencie achievements, badges e certificados</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Achievement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Achievement</DialogTitle>
              </DialogHeader>
              <AchievementForm onSubmit={handleCreateAchievement} submitText="Criar Achievement" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Achievements</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAchievements}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Medal className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ativos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeAchievements}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conquistados</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.earnedAchievements}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Usuários com Badges</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.usersWithBadges}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar achievements..."
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
                    <SelectItem value="all">Todas as categorias</SelectItem>
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
                    <SelectItem value="all">Todas as raridades</SelectItem>
                    {rarities.map(rarity => (
                      <SelectItem key={rarity.value} value={rarity.value}>
                        {rarity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Achievements List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAchievements.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">Nenhum achievement encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAchievements.map((achievement) => (
                    <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {achievement.icon_url ? (
                              <img
                                src={achievement.icon_url}
                                alt={achievement.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                              <p className="text-sm text-gray-600">{achievement.key}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(achievement)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Achievement</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir este achievement? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteAchievement(achievement.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getDifficultyBadge(achievement.difficulty)}
                            {getRarityBadge(achievement.rarity)}
                            <Badge variant="outline">{achievement.points} pts</Badge>
                          </div>
                          <Badge variant={achievement.is_active ? "default" : "secondary"}>
                            {achievement.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics de Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">Analytics em desenvolvimento...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Usuários e Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">Gestão de usuários em desenvolvimento...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Achievement</DialogTitle>
          </DialogHeader>
          <AchievementForm onSubmit={handleEditAchievement} submitText="Atualizar Achievement" />
        </DialogContent>
      </Dialog>
    </div>
  )
}