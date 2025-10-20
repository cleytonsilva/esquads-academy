// ============================================================================
// COMPONENTE MISSION DASHBOARD COM RANKING COMPETITIVO
// ============================================================================

import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Mission, 
  UserProfile, 
  RankingEntry, 
  MissionFilters,
  MissionStatus,
  DifficultyLevel,
  MissionCategory
} from '../../types'
import { useMissions, useUserProfile, useRanking } from '../../hooks'
import Button from '../ui/Button'
import Icon from '../AppIcon'

// ============================================================================
// INTERFACES DE PROPS
// ============================================================================

interface MissionDashboardProps {
  userId: string
  className?: string
}

interface MissionCardProps {
  mission: Mission
  userXP: number
  onStart?: (mission: Mission) => void
  onViewDetails?: (mission: Mission) => void
  className?: string
}

interface UserRankingProps {
  userProfile: UserProfile
  globalRanking: RankingEntry[]
  showTop?: number
  className?: string
}

interface UserLevelBadgeProps {
  userProfile: UserProfile
  showProgress?: boolean
  className?: string
}

// ============================================================================
// COMPONENTE PRINCIPAL MISSION DASHBOARD
// ============================================================================

export const MissionDashboard: React.FC<MissionDashboardProps> = ({ 
  userId, 
  className = "" 
}) => {
  const navigate = useNavigate()
  const { userProfile, loading: userLoading } = useUserProfile(userId)
  const { missions, filteredMissions, filters, setFilters, loading: missionsLoading } = useMissions(userId)
  const { globalRanking, userRank, loading: rankingLoading } = useRanking(userId)

  const availableMissions = useMemo(() => 
    filteredMissions.filter(mission => 
      !mission.requiredBadge || 
      (userProfile?.badges.some(badge => badge.id === mission.requiredBadge))
    ), 
    [filteredMissions, userProfile?.badges]
  )

  const handleMissionStart = (mission: Mission) => {
    navigate('/mission-gameplay', { 
      state: { mission } 
    })
  }

  const handleViewDetails = (mission: Mission) => {
    // Implementar modal de detalhes ou navegação
    console.log('Ver detalhes da missão:', mission)
  }

  const handleFilterChange = (newFilters: Partial<MissionFilters>) => {
    setFilters({ ...filters, ...newFilters })
  }

  if (userLoading.isLoading || missionsLoading.isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <Icon name="AlertCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Erro ao carregar perfil
        </h3>
        <p className="text-muted-foreground">
          Não foi possível carregar o perfil do usuário
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com Ranking */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Missões de Cibersegurança
            </h1>
            <p className="text-muted-foreground">
              Escolha uma missão para praticar suas habilidades e ganhar XP
            </p>
          </div>
          
          <UserRanking 
            userProfile={userProfile} 
            globalRanking={globalRanking}
            showTop={5}
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar missões..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Categoria
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange({ category: e.target.value as MissionCategory | "all" })}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todas as categorias</option>
              <option value={MissionCategory.Firewall}>Firewall</option>
              <option value={MissionCategory.CloudSecurity}>Segurança Cloud</option>
              <option value={MissionCategory.Forensics}>Forense</option>
              <option value={MissionCategory.NetworkSecurity}>Segurança de Rede</option>
              <option value={MissionCategory.PenetrationTesting}>Teste de Penetração</option>
              <option value={MissionCategory.IncidentResponse}>Resposta a Incidentes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Dificuldade
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange({ difficulty: e.target.value as DifficultyLevel | "all" })}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todas as dificuldades</option>
              <option value={DifficultyLevel.Basic}>Básico</option>
              <option value={DifficultyLevel.Intermediate}>Intermediário</option>
              <option value={DifficultyLevel.Advanced}>Avançado</option>
              <option value={DifficultyLevel.Expert}>Especialista</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange({ status: e.target.value as MissionStatus | "all" })}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos os status</option>
              <option value={MissionStatus.NotStarted}>Não iniciadas</option>
              <option value={MissionStatus.InProgress}>Em progresso</option>
              <option value={MissionStatus.Completed}>Completadas</option>
              <option value={MissionStatus.Locked}>Bloqueadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Missões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableMissions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            userXP={userProfile.totalXP}
            onStart={handleMissionStart}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {/* Estado vazio */}
      {availableMissions.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhuma missão encontrada
          </h3>
          <p className="text-muted-foreground mb-4">
            Tente ajustar os filtros para encontrar missões disponíveis
          </p>
          <Button
            variant="outline"
            onClick={() => setFilters({
              search: '',
              category: 'all',
              difficulty: 'all',
              status: 'all',
              sortBy: 'recommended'
            })}
          >
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTE MISSION CARD
// ============================================================================

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  userXP,
  onStart,
  onViewDetails,
  className = ""
}) => {
  const getDifficultyColor = (difficulty: DifficultyLevel): string => {
    const colors = {
      [DifficultyLevel.Basic]: "text-green-600 bg-green-100",
      [DifficultyLevel.Intermediate]: "text-yellow-600 bg-yellow-100",
      [DifficultyLevel.Advanced]: "text-orange-600 bg-orange-100",
      [DifficultyLevel.Expert]: "text-red-600 bg-red-100"
    }
    return colors[difficulty] || colors[DifficultyLevel.Basic]
  }

  const getDifficultyLabel = (difficulty: DifficultyLevel): string => {
    const labels = {
      [DifficultyLevel.Basic]: "Básico",
      [DifficultyLevel.Intermediate]: "Intermediário",
      [DifficultyLevel.Advanced]: "Avançado",
      [DifficultyLevel.Expert]: "Especialista"
    }
    return labels[difficulty] || labels[DifficultyLevel.Basic]
  }

  const getCategoryIcon = (category: MissionCategory): string => {
    const icons = {
      [MissionCategory.Firewall]: "Shield",
      [MissionCategory.CloudSecurity]: "Cloud",
      [MissionCategory.Forensics]: "Search",
      [MissionCategory.NetworkSecurity]: "Network",
      [MissionCategory.PenetrationTesting]: "Target",
      [MissionCategory.IncidentResponse]: "AlertTriangle",
      [MissionCategory.VulnerabilityAssessment]: "Bug"
    }
    return icons[category] || "Target"
  }

  const isLocked = mission.isLocked || mission.status === MissionStatus.Locked
  const canStart = !isLocked && mission.status === MissionStatus.NotStarted

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      {/* Header da Missão */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon 
                name={getCategoryIcon(mission.category)} 
                size={24} 
                className="text-primary" 
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{mission.title}</h3>
              <p className="text-sm text-muted-foreground">{mission.category}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(mission.difficultyLevel)}`}>
              {getDifficultyLabel(mission.difficultyLevel)}
            </span>
            {mission.isPremium && (
              <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                Premium
              </span>
            )}
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {mission.description}
        </p>

        {/* Informações da Missão */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={16} />
              <span>{mission.duration} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Star" size={16} />
              <span>{mission.xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {mission.status === MissionStatus.InProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progresso</span>
              <span>{mission.progress || 0}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${mission.progress || 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Ferramentas */}
        {mission.tools.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Ferramentas:</p>
            <div className="flex flex-wrap gap-1">
              {mission.tools.slice(0, 3).map((tool, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                >
                  {tool}
                </span>
              ))}
              {mission.tools.length > 3 && (
                <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                  +{mission.tools.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer com Ações */}
      <div className="px-6 py-4 bg-muted/50 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(mission)}
            >
              <Icon name="Eye" size={16} className="mr-1" />
              Detalhes
            </Button>
          </div>
          
          <Button
            variant={canStart ? "default" : "secondary"}
            size="sm"
            disabled={isLocked}
            onClick={() => canStart && onStart?.(mission)}
          >
            {isLocked ? (
              <>
                <Icon name="Lock" size={16} className="mr-1" />
                Bloqueada
              </>
            ) : mission.status === MissionStatus.InProgress ? (
              <>
                <Icon name="Play" size={16} className="mr-1" />
                Continuar
              </>
            ) : mission.status === MissionStatus.Completed ? (
              <>
                <Icon name="Check" size={16} className="mr-1" />
                Completada
              </>
            ) : (
              <>
                <Icon name="Play" size={16} className="mr-1" />
                Iniciar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE USER RANKING
// ============================================================================

export const UserRanking: React.FC<UserRankingProps> = ({
  userProfile,
  globalRanking,
  showTop = 5,
  className = ""
}) => {
  const topRanking = globalRanking.slice(0, showTop)
  const userRankingEntry = globalRanking.find(entry => entry.userId === userProfile.id)

  return (
    <div className={`bg-muted/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Ranking Global</h3>
        <div className="flex items-center space-x-2">
          <Icon name="Trophy" size={16} className="text-yellow-500" />
          <span className="text-sm font-medium text-foreground">
            #{userProfile.globalRanking}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {topRanking.map((entry, index) => (
          <div 
            key={entry.userId}
            className={`flex items-center justify-between p-2 rounded ${
              entry.userId === userProfile.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-orange-500 text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              <span className="text-sm font-medium text-foreground">
                {entry.username}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {entry.totalXP} XP
            </div>
          </div>
        ))}
      </div>

      {userRankingEntry && !topRanking.some(entry => entry.userId === userProfile.id) && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {userRankingEntry.rank}
              </div>
              <span className="text-sm font-medium text-foreground">
                Você
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {userRankingEntry.totalXP} XP
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTE USER LEVEL BADGE
// ============================================================================

export const UserLevelBadge: React.FC<UserLevelBadgeProps> = ({
  userProfile,
  showProgress = true,
  className = ""
}) => {
  const calculateProgress = (): number => {
    // Simulação de cálculo de progresso para o próximo nível
    const currentLevelXP = (userProfile.currentLevel - 1) * 500
    const nextLevelXP = userProfile.currentLevel * 500
    const progressXP = userProfile.totalXP - currentLevelXP
    const totalNeeded = nextLevelXP - currentLevelXP
    
    return Math.min((progressXP / totalNeeded) * 100, 100)
  }

  const progress = calculateProgress()

  return (
    <div className={`bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon name="Star" size={20} className="text-primary" />
          <span className="font-semibold text-foreground">
            Nível {userProfile.currentLevel}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          {userProfile.totalXP} XP
        </div>
      </div>

      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso para o próximo nível</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 text-sm">
        <div className="flex items-center space-x-1">
          <Icon name="Heart" size={16} className="text-red-500" />
          <span className="text-muted-foreground">
            {userProfile.lives}/{userProfile.maxLives} vidas
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Award" size={16} className="text-yellow-500" />
          <span className="text-muted-foreground">
            {userProfile.badges.length} badges
          </span>
        </div>
      </div>
    </div>
  )
}

export default MissionDashboard
