/**
 * Hook para gerenciamento de missões
 * Baseado em paineis/src/hooks/index.ts
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Mission,
  MissionFilters,
  MissionWithProgress,
  DifficultyLevel,
} from '@/types/gamification'
import { MISSION_STATUS } from '@/utils/constants'
import { UserMissionProgress } from '@/types/missions'
import { missionService } from '@/services/missionService'
import { useToast } from '@/hooks/use-toast'

interface UseMissionsReturn {
  missions: Mission[]
  filteredMissions: MissionWithProgress[]
  filters: MissionFilters
  setFilters: (filters: MissionFilters) => void
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getMissionProgress: (missionId: string) => UserMissionProgress | undefined
}

export const useMissions = (userId?: string): UseMissionsReturn => {
  const [missions, setMissions] = useState<Mission[]>([])
  const [userProgress, setUserProgress] = useState<Record<string, UserMissionProgress>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [filters, setFilters] = useState<MissionFilters>({
    search: '',
    category: 'all',
    difficulty: 'all',
    status: 'all',
    sortBy: 'recommended',
  })

  // Função para buscar missões
  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar lista de missões
      const fetchedMissions = await missionService.getAllMissions()
      setMissions(fetchedMissions)

      // Buscar progresso do usuário de forma resiliente
      if (userId) {
        try {
          const progress = await missionService.getUserProgress(userId)
          const progressMap = progress.reduce(
            (acc, item) => {
              acc[item.missionId] = item
              return acc
            },
            {} as Record<string, UserMissionProgress>
          )
          setUserProgress(progressMap)
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Falha ao carregar progresso do usuário'
          console.warn('[useMissions] Ignorando erro ao buscar progresso:', errorMessage)
          // Não propagar erro para evitar quebrar a UI; apenas manter progresso vazio
          setUserProgress({})
        }
      } else {
        setUserProgress({})
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar missões'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [userId]) // Remover toast da dependência

  // Carregar missões ao montar
  useEffect(() => {
    fetchMissions()
  }, [fetchMissions])

  // Função para obter progresso de uma missão
  const getMissionProgress = useCallback(
    (missionId: string) => {
      return userProgress[missionId]
    },
    [userProgress]
  )

  // Função auxiliar para determinar status de missão
  const getMissionStatus = useCallback(
    (mission: Mission): string => {
      const progress = userProgress[mission.id]

      if (mission.isLocked) return MISSION_STATUS.LOCKED
      if (!progress) return MISSION_STATUS.NOT_STARTED
      return progress.status
    },
    [userProgress]
  )

  // Filtrar e ordenar missões
  const filteredMissions = useMemo(() => {
    let filtered = missions.map((mission) => ({
      ...mission,
      progress: userProgress[mission.id],
    }))

    // Filtro de busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (mission) =>
          mission.title.toLowerCase().includes(searchTerm) ||
          mission.description.toLowerCase().includes(searchTerm) ||
          mission.tools.some((tool) => tool.toLowerCase().includes(searchTerm)
          )
      )
    }

    // Filtro de categoria
    if (filters.category !== 'all') {
      filtered = filtered.filter((mission) => mission.category === filters.category)
    }

    // Filtro de dificuldade
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter((mission) => mission.difficultyLevel === filters.difficulty)
    }

    // Filtro de status
    if (filters.status !== 'all') {
      filtered = filtered.filter((mission) => {
        const status = getMissionStatus(mission)
        return status === filters.status
      })
    }

    // Filtro de premium
    if (filters.isPremium !== undefined) {
      filtered = filtered.filter((mission) => mission.isPremium === filters.isPremium)
    }

    // Filtro de pré-requisitos
    if (filters.hasPrerequisites !== undefined) {
      filtered = filtered.filter(
        (mission) => (mission.prerequisites.length > 0) === filters.hasPrerequisites
      )
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'difficulty-asc':
          return getDifficultyOrder(a.difficultyLevel) - getDifficultyOrder(b.difficultyLevel)
        case 'difficulty-desc':
          return getDifficultyOrder(b.difficultyLevel) - getDifficultyOrder(a.difficultyLevel)
        case 'xp-asc':
          return a.xpReward - b.xpReward
        case 'xp-desc':
          return b.xpReward - a.xpReward
        case 'duration-asc':
          return a.durationMinutes - b.durationMinutes
        case 'duration-desc':
          return b.durationMinutes - a.durationMinutes
        case 'recommended':
        default: {
          // Recomendado: disponíveis primeiro, depois por dificuldade
          const aLocked = a.isLocked ? 1 : 0
          const bLocked = b.isLocked ? 1 : 0
          if (aLocked !== bLocked) return aLocked - bLocked

          // Priorizar missões em progresso
          const aInProgress = a.progress?.status === MISSION_STATUS.IN_PROGRESS ? 0 : 1
          const bInProgress = b.progress?.status === MISSION_STATUS.IN_PROGRESS ? 0 : 1
          if (aInProgress !== bInProgress) return aInProgress - bInProgress

          // Ordenar por dificuldade
          return getDifficultyOrder(a.difficultyLevel) - getDifficultyOrder(b.difficultyLevel)
        }
      }
    })

    return filtered
  }, [missions, userProgress, filters, getMissionStatus])

  return {
    missions,
    filteredMissions,
    filters,
    setFilters,
    loading,
    error,
    refetch: fetchMissions,
    getMissionProgress,
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

const getDifficultyOrder = (difficulty: DifficultyLevel): number => {
  const order: Record<DifficultyLevel, number> = {
    [DifficultyLevel.Basic]: 1,
    [DifficultyLevel.Intermediate]: 2,
    [DifficultyLevel.Advanced]: 3,
    [DifficultyLevel.Expert]: 4,
  }
  return order[difficulty] || 0
}

