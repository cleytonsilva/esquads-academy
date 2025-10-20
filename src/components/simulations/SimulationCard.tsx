/**
 * Card de Simulação
 * Baseado no MissionCard para manter consistência visual
 * Integrado com tipos de simulação e progresso do usuário
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Shield,
  Cloud,
  Search,
  Network,
  Target,
  AlertTriangle,
  Bug,
  Clock,
  Zap,
  Lock,
  Crown,
  Check,
  Play,
  Terminal,
  Code,
  Trophy,
  CheckCircle,
  Users,
  Flag,
} from 'lucide-react'
import {
  Simulation,
  UserSimulationProgress,
  SimulationStatus,
  SimulationType
} from '@/types/simulations'
import { UserPlan, UserPlanType } from '@/types/gamification'

interface SimulationCardProps {
  simulation: Simulation & {
    progress?: UserSimulationProgress
    status?: SimulationStatus
  }
  userPlan: UserPlan
  onStart?: (simulation: Simulation) => void
  onContinue?: (simulation: Simulation) => void
  onViewReport?: (simulation: Simulation) => void
}

const TYPE_ICONS: Record<SimulationType, any> = {
  [SimulationType.CTF]: Flag,
  [SimulationType.Lab]: Terminal,
  [SimulationType.Scenario]: Target,
  [SimulationType.Challenge]: Trophy,
  [SimulationType.Team]: Users,
}

const TYPE_COLORS: Record<SimulationType, string> = {
  [SimulationType.CTF]: 'text-purple-600 dark:text-purple-400',
  [SimulationType.Lab]: 'text-blue-600 dark:text-blue-400',
  [SimulationType.Scenario]: 'text-green-600 dark:text-green-400',
  [SimulationType.Challenge]: 'text-orange-600 dark:text-orange-400',
  [SimulationType.Team]: 'text-red-600 dark:text-red-400',
}

export const SimulationCard: React.FC<SimulationCardProps> = ({ 
  simulation, 
  userPlan, 
  onStart, 
  onContinue, 
  onViewReport 
}) => {
  const navigate = useNavigate()

  const handleStartSimulation = () => {
    if (simulation.isPremium && userPlan.type === UserPlanType.Free) {
      // TODO: Mostrar modal de upgrade
      return
    }

    if (onStart) {
      onStart(simulation)
    } else {
      navigate(`/student/simulations/${simulation.id}/play`)
    }
  }

  const handleContinueSimulation = () => {
    if (onContinue) {
      onContinue(simulation)
    } else {
      navigate(`/student/simulations/${simulation.id}/play`)
    }
  }

  const handleViewReport = () => {
    if (onViewReport) {
      onViewReport(simulation)
    } else {
      navigate(`/student/simulations/${simulation.id}/results`)
    }
  }

  const getDifficultyColor = (difficulty: string | undefined | null): string => {
    if (!difficulty) {
      return 'text-gray-600'
    }
    
    switch (difficulty.toLowerCase()) {
      case 'iniciante':
      case 'beginner':
        return 'text-green-600 dark:text-green-400'
      case 'intermediário':
      case 'intermediate':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'avançado':
      case 'advanced':
        return 'text-orange-600 dark:text-orange-400'
      case 'expert':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600'
    }
  }

  const getDifficultyBg = (difficulty: string | undefined | null): string => {
    if (!difficulty) {
      return 'bg-gray-100 border-gray-200'
    }
    
    switch (difficulty.toLowerCase()) {
      case 'iniciante':
      case 'beginner':
        return 'bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'intermediário':
      case 'intermediate':
        return 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'avançado':
      case 'advanced':
        return 'bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
      case 'expert':
        return 'bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      default:
        return 'bg-gray-100 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    const status = simulation.status || simulation.progress?.status

    if (!status || status === SimulationStatus.NotStarted) {
      return <Play className="h-4 w-4" />
    }

    if (status === SimulationStatus.Completed) {
      return <Check className="h-4 w-4" />
    }

    if (status === SimulationStatus.InProgress) {
      return <Terminal className="h-4 w-4" />
    }

    return <Play className="h-4 w-4" />
  }

  const getButtonText = () => {
    const status = simulation.status || simulation.progress?.status

    if (simulation.isPremium && userPlan.type === UserPlanType.Free) {
      return 'Upgrade para Premium'
    }

    if (!status || status === SimulationStatus.NotStarted) {
      return 'Iniciar Simulação'
    }

    if (status === SimulationStatus.Completed) {
      return 'Ver Relatório'
    }

    if (status === SimulationStatus.InProgress) {
      const progress = simulation.progress
      const percentage = progress ? progress.progressPercentage : 0
      return `Continuar (${percentage}%)`
    }

    return 'Iniciar Simulação'
  }

  const getButtonVariant = () => {
    const status = simulation.status || simulation.progress?.status

    if (simulation.isPremium && userPlan.type === UserPlanType.Free) {
      return 'outline'
    }

    if (status === SimulationStatus.Completed) {
      return 'secondary'
    }

    return 'default'
  }

  const getButtonAction = () => {
    const status = simulation.status || simulation.progress?.status

    if (status === SimulationStatus.Completed) {
      return handleViewReport
    }

    if (status === SimulationStatus.InProgress) {
      return handleContinueSimulation
    }

    return handleStartSimulation
  }

  const TypeIcon = TYPE_ICONS[simulation.type] || Terminal
  const progress = simulation.progress
  const progressPercentage = progress ? progress.progressPercentage : 0

  return (
    <div
      className={`
      relative bg-card border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg
      hover:border-primary/30
      ${simulation.isPremium && userPlan.type === UserPlanType.Free ? 'ring-2 ring-amber-500/20' : ''}
      ${simulation.status === SimulationStatus.Completed ? 'border-green-200 bg-green-50/50' : ''}
      ${simulation.status === SimulationStatus.InProgress ? 'border-orange-200 bg-orange-50/50' : ''}
    `}
    >
      {/* Premium Badge */}
      {simulation.isPremium && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-amber-500 text-white">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </div>
      )}

      {/* Simulation Image/Icon */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        {simulation.imageUrl ? (
          <img src={simulation.imageUrl} alt={simulation.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon className="h-20 w-20 text-primary/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Progress Bar */}
        {progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        {/* Completion Badge */}
        {simulation.status === SimulationStatus.Completed && (
          <div className="absolute top-3 left-3">
            <div className="bg-green-500 text-white rounded-full p-1.5">
              <Check className="h-4 w-4" />
            </div>
          </div>
        )}

        {/* In Progress Badge */}
        {simulation.status === SimulationStatus.InProgress && (
          <div className="absolute top-3 left-3">
            <div className="bg-orange-500 text-white rounded-full p-1.5">
              <Clock className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Title and Type */}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <TypeIcon className={`h-4 w-4 ${TYPE_COLORS[simulation.type]}`} />
            <span className={`text-xs font-medium ${TYPE_COLORS[simulation.type]}`}>
              {simulation.type}
            </span>
          </div>
          <h3 className="font-semibold text-foreground text-lg leading-tight">{simulation.title}</h3>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">{simulation.description}</p>

        {/* Simulation Stats */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{simulation.estimatedDuration} min</span>
          </div>
          <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-medium">
            <Zap className="h-3 w-3" />
            <span>{simulation.xpReward} XP</span>
          </div>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Target className="h-3 w-3" />
            <span>{simulation.scenario?.objectives?.length || 0} objetivos</span>
          </div>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Code className="h-3 w-3" />
            <span>{simulation.scenario?.tools?.length || 0} ferramentas</span>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex items-center justify-between">
          <div className={`px-2 py-1 rounded-full border ${getDifficultyBg(simulation.difficulty)}`}>
            <span className={`text-xs font-medium ${getDifficultyColor(simulation.difficulty)}`}>
              {simulation.difficulty}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant="outline" className="text-xs">
              {simulation.environment}
            </Badge>
          </div>
        </div>

        {/* Tags */}
        {simulation.tags && simulation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {simulation.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {simulation.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{simulation.tags.length - 3} mais</span>
            )}
          </div>
        )}

        {/* Progress for In Progress simulations */}
        {simulation.status === SimulationStatus.InProgress && progressPercentage > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progresso</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button
            className={`w-full ${simulation.isPremium && userPlan.type === UserPlanType.Free ? 'border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white' : ''}`}
            variant={getButtonVariant()}
            onClick={getButtonAction()}
          >
            {simulation.isPremium && userPlan.type === UserPlanType.Free && <Crown className="h-4 w-4 mr-2" />}
            {getStatusIcon()}
            <span className="ml-2">{getButtonText()}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}