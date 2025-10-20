/**
 * Dashboard Principal de Missões
 * Baseado em paineis/src/pages/mission-selection/components/MissionDashboard.tsx
 */

import React, { useState, useEffect } from 'react'
import { MissionGrid } from './MissionGrid'
import { MissionFilters as MissionFiltersComponent } from './MissionFilters'
import { Mission, MissionProgress, MissionCategory, MissionFilters } from '@/types/missions'
import { MISSION_STATUS } from '@/utils/constants'

interface MissionWithProgress extends Mission {
  progress?: MissionProgress;
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Target, 
  Zap, 
  Trophy, 
  Clock, 
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  Plus
} from 'lucide-react'

interface MissionDashboardProps {
  missions: MissionWithProgress[]
  userPlan: 'FREE' | 'PRO' | 'ENTERPRISE'
  isLoading?: boolean
  onMissionStart?: (mission: MissionWithProgress) => void
  onMissionContinue?: (mission: MissionWithProgress) => void
  onMissionRepeat?: (mission: MissionWithProgress) => void
  onUpgrade?: () => void
  className?: string
}


export const MissionDashboard: React.FC<MissionDashboardProps> = ({
  missions,
  userPlan,
  isLoading = false,
  onMissionStart,
  onMissionContinue,
  onMissionRepeat,
  onUpgrade,
  className = '',
}) => {
  const [filters, setFilters] = useState<MissionFilters>({
    search: '',
    category: 'all',
    difficulty: 'all',
    status: 'all',
    sortBy: 'recommended'
  })
  const [filteredMissions, setFilteredMissions] = useState<MissionWithProgress[]>(missions)
  const [showFilters, setShowFilters] = useState(false)

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...missions]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(mission =>
        mission.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        mission.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        mission.category.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(mission => mission.category === filters.category)
    }

    // Difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(mission => mission.difficulty === filters.difficulty)
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(mission => {
        if (!mission.progress) return filters.status === MISSION_STATUS.NOT_STARTED
        return mission.progress.status === filters.status
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'difficulty-asc':
          return a.difficulty.localeCompare(b.difficulty)
        case 'difficulty-desc':
          return b.difficulty.localeCompare(a.difficulty)
        case 'xp-asc':
          return a.xp_reward - b.xp_reward
        case 'xp-desc':
          return b.xp_reward - a.xp_reward
        case 'duration-asc':
          return a.duration_minutes - b.duration_minutes
        case 'duration-desc':
          return b.duration_minutes - a.duration_minutes
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        default:
          return 0
      }
    })

    setFilteredMissions(filtered)
  }, [missions, filters])

  const handleFilterChange = (newFilters: Partial<MissionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      difficulty: 'all',
      status: 'all',
      sortBy: 'recommended'
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.category !== 'all') count++
    if (filters.difficulty !== 'all') count++
    if (filters.status !== 'all') count++
    return count
  }

  // Estatísticas
  const stats = {
    total: missions.length,
    available: missions.filter(m => !m.is_locked && (!m.is_premium || userPlan !== 'FREE')).length,
    inProgress: missions.filter(m => m.progress?.status === MISSION_STATUS.IN_PROGRESS).length,
    completed: missions.filter(m => m.progress?.status === MISSION_STATUS.COMPLETED).length,
    totalXP: missions.reduce((sum, m) => sum + m.xp_reward, 0),
    earnedXP: missions
      .filter(m => m.progress?.status === MISSION_STATUS.COMPLETED)
      .reduce((sum, m) => sum + m.xp_reward, 0)
  }

  const handleMissionAction = (mission: MissionWithProgress, action: 'start' | 'continue' | 'repeat' | 'upgrade') => {
    switch (action) {
      case 'start':
        onMissionStart?.(mission)
        break
      case 'continue':
        onMissionContinue?.(mission)
        break
      case 'repeat':
        onMissionRepeat?.(mission)
        break
      case 'upgrade':
        onUpgrade?.()
        break
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Missões</h1>
          <p className="text-muted-foreground">
            Complete missões práticas e ganhe experiência em cibersegurança
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total de Missões</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Disponíveis</p>
                <p className="text-2xl font-bold">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Em Progresso</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-sm font-medium">XP Ganho</p>
                <p className="text-2xl font-bold">{stats.earnedXP}</p>
                <p className="text-xs text-muted-foreground">
                  de {stats.totalXP} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Filtros e Busca</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MissionFiltersComponent
              filters={filters}
              onFiltersChange={handleFilterChange}
              onClearFilters={clearFilters}
              missionCounts={{
                total: stats.total,
                available: stats.available,
                inProgress: stats.inProgress,
                completed: stats.completed
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Mission Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Missões Disponíveis</span>
              <Badge variant="secondary">
                {filteredMissions.length} encontradas
              </Badge>
            </CardTitle>
            {getActiveFiltersCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <MissionGrid
            missions={filteredMissions}
            userPlan={userPlan}
            isLoading={isLoading}
            onMissionStart={(mission) => handleMissionAction(mission, 'start')}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Ações Rápidas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Target className="h-6 w-6" />
              <span>Missões Recomendadas</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Trophy className="h-6 w-6" />
              <span>Minhas Conquistas</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Plus className="h-6 w-6" />
              <span>Criar Missão</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
