// ============================================================================
// HOOKS PERSONALIZADOS PARA GAMIFICAÇÃO ESQUADS
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  UserProfile, 
  Mission, 
  MissionProgress, 
  CertificationExam, 
  ExamResult,
  RankingEntry,
  MissionFilters,
  CertificationFilters,
  ExamConfig,
  LoadingState,
  ApiResponse,
  PaginatedResponse,
  XPTransaction,
  Badge,
  Achievement,
  Streak,
  MissionCategory,
  DifficultyLevel,
  MissionStatus,
  CertificationProvider,
  UserPlan,
  BadgeType
} from '../types'

// ============================================================================
// HOOK DE PERFIL DE USUÁRIO
// ============================================================================

export interface UseUserProfileReturn {
  userProfile: UserProfile | null
  loading: LoadingState
  updateXP: (amount: number, source: string, description: string) => Promise<void>
  addBadge: (badge: Badge) => Promise<void>
  updateLevel: () => void
  refreshProfile: () => Promise<void>
}

export const useUserProfile = (userId: string): UseUserProfileReturn => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true })

  const refreshProfile = useCallback(async () => {
    try {
      setLoading({ isLoading: true })
      
      // Simulação de API call - substituir por chamada real
      const mockProfile: UserProfile = {
        id: userId,
        username: "cybersecurity_student",
        email: "student@esquads.com",
        totalXP: 1247,
        currentLevel: 2,
        completedMissions: ["mission_1", "mission_3"],
        badges: [
          {
            id: "badge_1",
            name: "Primeiro Firewall",
            description: "Completou sua primeira missão de firewall",
            icon: "Shield",
            type: BadgeType.Mission,
            xpReward: 50,
            earnedAt: new Date(),
            isNew: false,
            rarity: "COMMON" as const
          }
        ],
        lives: 3,
        maxLives: 5,
        currentPlan: UserPlan.Free,
        globalRanking: 42,
        createdAt: new Date(),
        lastActiveAt: new Date(),
        preferences: {
          theme: "system" as const,
          language: "pt" as const,
          notifications: {
            email: true,
            push: true,
            achievements: true,
            ranking: true
          },
          difficulty: DifficultyLevel.Intermediate,
          autoSave: true
        }
      }

      setUserProfile(mockProfile)
      setLoading({ isLoading: false })
    } catch (error) {
      setLoading({ isLoading: false, error: error instanceof Error ? error.message : 'Erro desconhecido' })
    }
  }, [userId])

  const updateXP = useCallback(async (amount: number, source: string, description: string) => {
    if (!userProfile) return

    try {
      const newXP = userProfile.totalXP + amount
      const newLevel = calculateLevel(newXP)
      
      setUserProfile(prev => prev ? {
        ...prev,
        totalXP: newXP,
        currentLevel: newLevel
      } : null)

      // Registrar transação XP
      const transaction: XPTransaction = {
        id: `xp_${Date.now()}`,
        userId: userProfile.id,
        amount,
        type: "MISSION_COMPLETION" as const,
        source,
        description,
        createdAt: new Date()
      }

      // Aqui seria feita a chamada para salvar no backend
      console.log('XP Transaction:', transaction)
    } catch (error) {
      console.error('Erro ao atualizar XP:', error)
    }
  }, [userProfile])

  const addBadge = useCallback(async (badge: Badge) => {
    if (!userProfile) return

    try {
      setUserProfile(prev => prev ? {
        ...prev,
        badges: [...prev.badges, { ...badge, earnedAt: new Date(), isNew: true }]
      } : null)

      // Aqui seria feita a chamada para salvar no backend
      console.log('Badge adicionado:', badge)
    } catch (error) {
      console.error('Erro ao adicionar badge:', error)
    }
  }, [userProfile])

  const updateLevel = useCallback(() => {
    if (!userProfile) return

    const newLevel = calculateLevel(userProfile.totalXP)
    if (newLevel > userProfile.currentLevel) {
      setUserProfile(prev => prev ? {
        ...prev,
        currentLevel: newLevel
      } : null)
    }
  }, [userProfile])

  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

  return {
    userProfile,
    loading,
    updateXP,
    addBadge,
    updateLevel,
    refreshProfile
  }
}

// ============================================================================
// HOOK DE MISSÕES
// ============================================================================

export interface UseMissionsReturn {
  missions: Mission[]
  loading: LoadingState
  filteredMissions: Mission[]
  filters: MissionFilters
  setFilters: (filters: MissionFilters) => void
  startMission: (missionId: string) => Promise<void>
  completeMission: (missionId: string, score: number, timeSpent: number) => Promise<void>
  getMissionProgress: (missionId: string) => MissionProgress | null
}

export const useMissions = (userId: string): UseMissionsReturn => {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true })
  const [filters, setFilters] = useState<MissionFilters>({
    search: '',
    category: 'all',
    difficulty: 'all',
    status: 'all',
    sortBy: 'recommended'
  })

  const filteredMissions = useMemo(() => {
    let filtered = [...missions]

    // Filtro de busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(mission =>
        mission.title.toLowerCase().includes(searchTerm) ||
        mission.description.toLowerCase().includes(searchTerm) ||
        mission.tools.some(tool => tool.toLowerCase().includes(searchTerm))
      )
    }

    // Filtro de categoria
    if (filters.category !== 'all') {
      filtered = filtered.filter(mission => mission.category === filters.category)
    }

    // Filtro de dificuldade
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(mission => mission.difficultyLevel === filters.difficulty)
    }

    // Filtro de status
    if (filters.status !== 'all') {
      filtered = filtered.filter(mission => mission.status === filters.status)
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
          return a.duration - b.duration
        case 'duration-desc':
          return b.duration - a.duration
        case 'recommended':
        default:
          // Recomendado: disponíveis primeiro, depois por dificuldade
          if (a.isLocked !== b.isLocked) return a.isLocked ? 1 : -1
          return getDifficultyOrder(a.difficultyLevel) - getDifficultyOrder(b.difficultyLevel)
      }
    })

    return filtered
  }, [missions, filters])

  const startMission = useCallback(async (missionId: string) => {
    try {
      // Aqui seria feita a chamada para iniciar a missão no backend
      console.log('Iniciando missão:', missionId)
    } catch (error) {
      console.error('Erro ao iniciar missão:', error)
    }
  }, [])

  const completeMission = useCallback(async (missionId: string, score: number, timeSpent: number) => {
    try {
      // Aqui seria feita a chamada para completar a missão no backend
      console.log('Completando missão:', { missionId, score, timeSpent })
    } catch (error) {
      console.error('Erro ao completar missão:', error)
    }
  }, [])

  const getMissionProgress = useCallback((missionId: string): MissionProgress | null => {
    // Simulação - substituir por chamada real
    return null
  }, [])

  useEffect(() => {
    const loadMissions = async () => {
      try {
        setLoading({ isLoading: true })
        
        // Simulação de dados - substituir por chamada real
        const mockMissions: Mission[] = [
          {
            id: "mission_1",
            title: "Configuração Básica de Firewall",
            description: "Aprenda os fundamentos de configuração de firewall",
            category: MissionCategory.Firewall,
            difficultyLevel: DifficultyLevel.Basic,
            xpReward: 100,
            isLocked: false,
            badgeOnCompletion: "firewall_basics",
            duration: 15,
            tools: ["iptables", "pfSense"],
            prerequisites: [],
            isPremium: false,
            status: MissionStatus.NotStarted,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]

        setMissions(mockMissions)
        setLoading({ isLoading: false })
      } catch (error) {
        setLoading({ isLoading: false, error: error instanceof Error ? error.message : 'Erro desconhecido' })
      }
    }

    loadMissions()
  }, [])

  return {
    missions,
    loading,
    filteredMissions,
    filters,
    setFilters,
    startMission,
    completeMission,
    getMissionProgress
  }
}

// ============================================================================
// HOOK DE CERTIFICAÇÕES
// ============================================================================

export interface UseCertificationsReturn {
  certifications: CertificationExam[]
  loading: LoadingState
  filteredCertifications: CertificationExam[]
  filters: CertificationFilters
  setFilters: (filters: CertificationFilters) => void
  startExam: (examId: string, config: ExamConfig) => Promise<void>
  getExamResults: (examId: string) => ExamResult[]
  getCertificationStats: (examId: string) => any
}

export const useCertifications = (userId: string): UseCertificationsReturn => {
  const [certifications, setCertifications] = useState<CertificationExam[]>([])
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true })
  const [filters, setFilters] = useState<CertificationFilters>({
    search: '',
    provider: 'all',
    difficulty: 'all',
    careerPath: 'all',
    showPremiumOnly: false,
    showFreeOnly: false,
    hasPrerequisites: false,
    sortBy: 'recommended'
  })

  const filteredCertifications = useMemo(() => {
    let filtered = [...certifications]

    // Aplicar filtros
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(cert =>
        cert.title.toLowerCase().includes(searchTerm) ||
        cert.provider.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.provider !== 'all') {
      filtered = filtered.filter(cert => cert.provider === filters.provider)
    }

    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(cert => cert.difficultyLevel === filters.difficulty)
    }

    if (filters.showPremiumOnly) {
      filtered = filtered.filter(cert => cert.isPremium)
    }

    if (filters.showFreeOnly) {
      filtered = filtered.filter(cert => !cert.isPremium)
    }

    if (filters.hasPrerequisites) {
      filtered = filtered.filter(cert => cert.prerequisites.length > 0)
    }

    return filtered
  }, [certifications, filters])

  const startExam = useCallback(async (examId: string, config: ExamConfig) => {
    try {
      console.log('Iniciando exame:', { examId, config })
    } catch (error) {
      console.error('Erro ao iniciar exame:', error)
    }
  }, [])

  const getExamResults = useCallback((examId: string): ExamResult[] => {
    // Simulação - substituir por chamada real
    return []
  }, [])

  const getCertificationStats = useCallback((examId: string) => {
    // Simulação - substituir por chamada real
    return null
  }, [])

  useEffect(() => {
    const loadCertifications = async () => {
      try {
        setLoading({ isLoading: true })
        
        // Simulação de dados - substituir por chamada real
        const mockCertifications: CertificationExam[] = [
          {
            id: "cert_1",
            provider: CertificationProvider.AWS,
            title: "AWS Security Specialty",
            description: "Certificação especializada em segurança AWS",
            questionCount: 65,
            difficultyLevel: DifficultyLevel.Intermediate,
            duration: 170,
            passPercentage: 70,
            questions: [],
            xpReward: 300,
            isPremium: true,
            topics: ["IAM", "CloudTrail", "GuardDuty"],
            prerequisites: ["AWS Cloud Practitioner"],
            successRate: 75,
            icon: "Cloud",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]

        setCertifications(mockCertifications)
        setLoading({ isLoading: false })
      } catch (error) {
        setLoading({ isLoading: false, error: error instanceof Error ? error.message : 'Erro desconhecido' })
      }
    }

    loadCertifications()
  }, [])

  return {
    certifications,
    loading,
    filteredCertifications,
    filters,
    setFilters,
    startExam,
    getExamResults,
    getCertificationStats
  }
}

// ============================================================================
// HOOK DE RANKING
// ============================================================================

export interface UseRankingReturn {
  globalRanking: RankingEntry[]
  loading: LoadingState
  userRank: number
  refreshRanking: () => Promise<void>
  getLeaderboard: (type: 'GLOBAL' | 'MONTHLY' | 'WEEKLY') => Promise<RankingEntry[]>
}

export const useRanking = (userId: string): UseRankingReturn => {
  const [globalRanking, setGlobalRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true })
  const [userRank, setUserRank] = useState<number>(0)

  const refreshRanking = useCallback(async () => {
    try {
      setLoading({ isLoading: true })
      
      // Simulação de dados - substituir por chamada real
      const mockRanking: RankingEntry[] = [
        {
          userId: "user_1",
          username: "cyber_master",
          totalXP: 5000,
          level: 10,
          badges: [],
          completedMissions: 25,
          completedExams: 8,
          rank: 1,
          lastActiveAt: new Date()
        }
      ]

      setGlobalRanking(mockRanking)
      setUserRank(42)
      setLoading({ isLoading: false })
    } catch (error) {
      setLoading({ isLoading: false, error: error instanceof Error ? error.message : 'Erro desconhecido' })
    }
  }, [])

  const getLeaderboard = useCallback(async (type: 'GLOBAL' | 'MONTHLY' | 'WEEKLY'): Promise<RankingEntry[]> => {
    try {
      // Simulação - substituir por chamada real
      return globalRanking
    } catch (error) {
      console.error('Erro ao buscar leaderboard:', error)
      return []
    }
  }, [globalRanking])

  useEffect(() => {
    refreshRanking()
  }, [refreshRanking])

  return {
    globalRanking,
    loading,
    userRank,
    refreshRanking,
    getLeaderboard
  }
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

const calculateLevel = (xp: number): number => {
  if (xp < 500) return 1
  if (xp < 1000) return 2
  if (xp < 1500) return 3
  if (xp < 2000) return 4
  if (xp < 2500) return 5
  if (xp < 3000) return 6
  if (xp < 3500) return 7
  if (xp < 4000) return 8
  if (xp < 4500) return 9
  return 10
}

const getDifficultyOrder = (difficulty: string): number => {
  const order = { 'BASIC': 1, 'INTERMEDIATE': 2, 'ADVANCED': 3, 'EXPERT': 4 }
  return order[difficulty as keyof typeof order] || 0
}
