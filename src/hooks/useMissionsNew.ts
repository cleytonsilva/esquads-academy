/**
 * Hook para Gerenciar Missões
 * Baseado em paineis/src/hooks/useMissions.js
 */

import { useState, useEffect, useCallback } from 'react'
import { 
  MissionWithProgress, 
  MissionCategory, 
  DifficultyLevel,
  MissionProgress 
} from '@/types/gamification'
import { MISSION_STATUS } from '@/utils/constants'

interface UseMissionsOptions {
  userId?: string
  category?: MissionCategory
  difficulty?: DifficultyLevel
  status?: string
}

interface UseMissionsReturn {
  missions: MissionWithProgress[]
  isLoading: boolean
  error: string | null
  stats: {
    total: number
    available: number
    inProgress: number
    completed: number
    locked: number
    premium: number
  }
  startMission: (missionId: string) => Promise<void>
  completeMission: (missionId: string, score: number, timeSpent: number) => Promise<void>
  resetMission: (missionId: string) => Promise<void>
  refreshMissions: () => Promise<void>
}

export const useMissions = (options: UseMissionsOptions = {}): UseMissionsReturn => {
  const [missions, setMissions] = useState<MissionWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data - em produção, isso viria de uma API
  const mockMissions: MissionWithProgress[] = [
    {
      id: '1',
      title: 'Configuração de Firewall Básico',
      description: 'Aprenda a configurar regras básicas de firewall usando iptables',
      category: MissionCategory.Firewall,
      categoryIcon: 'Shield',
      difficulty: DifficultyLevel.Basic,
      xp_reward: 100,
      isLocked: false,
      badgeOnCompletion: 'Firewall Novice',
      duration: '30 min',
      duration_minutes: 30,
      tools: ['iptables', 'netstat', 'ss'],
      prerequisites: [],
      isPremium: false,
      progress: {
        id: '1',
        missionId: '1',
        userId: options.userId || 'user1',
        status: MISSION_STATUS.NOT_STARTED,
        score: 0,
        timeSpent: 0,
        startedAt: null,
        completedAt: null,
        attempts: 0,
        lastAttemptAt: null
      },
      objectives: [
        {
          id: '1',
          title: 'Verificar status do firewall',
          description: 'Use o comando iptables para verificar as regras atuais',
          expectedCommand: 'iptables -L',
          points: 25,
          isCompleted: false
        },
        {
          id: '2',
          title: 'Adicionar regra para SSH',
          description: 'Permitir conexões SSH na porta 22',
          expectedCommand: 'iptables -A INPUT -p tcp --dport 22 -j ACCEPT',
          points: 25,
          isCompleted: false
        },
        {
          id: '3',
          title: 'Adicionar regra para HTTP',
          description: 'Permitir conexões HTTP na porta 80',
          expectedCommand: 'iptables -A INPUT -p tcp --dport 80 -j ACCEPT',
          points: 25,
          isCompleted: false
        },
        {
          id: '4',
          title: 'Verificar configuração final',
          description: 'Confirme que as regras foram aplicadas corretamente',
          expectedCommand: 'iptables -L',
          points: 25,
          isCompleted: false
        }
      ],
      badges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: MISSION_STATUS.NOT_STARTED
    },
    {
      id: '2',
      title: 'Análise de Vulnerabilidades Web',
      description: 'Identifique vulnerabilidades comuns em aplicações web',
      category: MissionCategory.WebSecurity,
      categoryIcon: 'Bug',
      difficulty: DifficultyLevel.Intermediate,
      xp_reward: 200,
      isLocked: false,
      badgeOnCompletion: 'Web Security Analyst',
      duration: '45 min',
      duration_minutes: 45,
      tools: ['burpsuite', 'sqlmap', 'nikto'],
      prerequisites: ['1'],
      isPremium: true,
      progress: {
        id: '2',
        missionId: '2',
        userId: options.userId || 'user1',
        status: MISSION_STATUS.NOT_STARTED,
        score: 0,
        timeSpent: 0,
        startedAt: null,
        completedAt: null,
        attempts: 0,
        lastAttemptAt: null
      },
      objectives: [
        {
          id: '1',
          title: 'Iniciar Burp Suite',
          description: 'Configure o proxy do Burp Suite para interceptar tráfego',
          expectedCommand: 'burpsuite',
          points: 50,
          isCompleted: false
        },
        {
          id: '2',
          title: 'Escaneamento com Nikto',
          description: 'Execute um scan de vulnerabilidades web',
          expectedCommand: 'nikto -h target.com',
          points: 50,
          isCompleted: false
        },
        {
          id: '3',
          title: 'Teste de SQL Injection',
          description: 'Use SQLMap para testar vulnerabilidades SQL',
          expectedCommand: 'sqlmap -u "http://target.com/page?id=1"',
          points: 50,
          isCompleted: false
        },
        {
          id: '4',
          title: 'Relatório de Vulnerabilidades',
          description: 'Gere um relatório com as vulnerabilidades encontradas',
          expectedCommand: 'burpsuite --generate-report',
          points: 50,
          isCompleted: false
        }
      ],
      badges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: MISSION_STATUS.NOT_STARTED
    },
    {
      id: '3',
      title: 'Forensics Digital Avançado',
      description: 'Análise forense de evidências digitais usando ferramentas especializadas',
      category: MissionCategory.Forensics,
      categoryIcon: 'Search',
      difficulty: DifficultyLevel.Advanced,
      xp_reward: 350,
      isLocked: true,
      badgeOnCompletion: 'Digital Forensics Expert',
      duration: '60 min',
      duration_minutes: 60,
      tools: ['volatility', 'autopsy', 'strings'],
      prerequisites: ['1', '2'],
      isPremium: true,
      progress: {
        id: '3',
        missionId: '3',
        userId: options.userId || 'user1',
        status: MISSION_STATUS.LOCKED,
        score: 0,
        timeSpent: 0,
        startedAt: null,
        completedAt: null,
        attempts: 0,
        lastAttemptAt: null
      },
      objectives: [
        {
          id: '1',
          title: 'Análise de Memória',
          description: 'Use Volatility para analisar dump de memória',
          expectedCommand: 'volatility -f memory.dump pslist',
          points: 87,
          isCompleted: false
        },
        {
          id: '2',
          title: 'Análise de Arquivos',
          description: 'Use Autopsy para análise forense de arquivos',
          expectedCommand: 'autopsy',
          points: 87,
          isCompleted: false
        },
        {
          id: '3',
          title: 'Extração de Strings',
          description: 'Extraia strings de arquivos binários',
          expectedCommand: 'strings suspicious_file.bin',
          points: 87,
          isCompleted: false
        },
        {
          id: '4',
          title: 'Relatório Forense',
          description: 'Gere relatório com evidências encontradas',
          expectedCommand: 'volatility -f memory.dump --profile=Win7SP1x64 --output=json',
          points: 89,
          isCompleted: false
        }
      ],
      badges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: MISSION_STATUS.LOCKED
    }
  ]

  const loadMissions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Aplicar filtros
      let filteredMissions = [...mockMissions]
      
      if (options.category) {
        filteredMissions = filteredMissions.filter(m => m.category === options.category)
      }
      
      if (options.difficulty) {
        filteredMissions = filteredMissions.filter(m => m.difficulty === options.difficulty)
      }
      
      if (options.status) {
        filteredMissions = filteredMissions.filter(m => {
          if (!m.progress) return options.status === MISSION_STATUS.NOT_STARTED
          return m.progress.status === options.status
        })
      }
      
      setMissions(filteredMissions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar missões')
    } finally {
      setIsLoading(false)
    }
  }, [options])

  const startMission = useCallback(async (missionId: string) => {
    try {
      setMissions(prev => prev.map(mission => {
        if (mission.id === missionId) {
          return {
            ...mission,
            progress: {
              ...mission.progress!,
              status: MISSION_STATUS.IN_PROGRESS,
              startedAt: new Date(),
              attempts: (mission.progress?.attempts || 0) + 1,
              lastAttemptAt: new Date()
            },
            status: MISSION_STATUS.IN_PROGRESS
          }
        }
        return mission
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar missão')
    }
  }, [])

  const completeMission = useCallback(async (missionId: string, score: number, timeSpent: number) => {
    try {
      setMissions(prev => prev.map(mission => {
        if (mission.id === missionId) {
          return {
            ...mission,
            progress: {
              ...mission.progress!,
              status: MISSION_STATUS.COMPLETED,
              score,
              timeSpent,
              completedAt: new Date()
            },
            status: MISSION_STATUS.COMPLETED
          }
        }
        return mission
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao completar missão')
    }
  }, [])

  const resetMission = useCallback(async (missionId: string) => {
    try {
      setMissions(prev => prev.map(mission => {
        if (mission.id === missionId) {
          return {
            ...mission,
            progress: {
              ...mission.progress!,
              status: MISSION_STATUS.NOT_STARTED,
              score: 0,
              timeSpent: 0,
              startedAt: null,
              completedAt: null
            },
            status: MISSION_STATUS.NOT_STARTED
          }
        }
        return mission
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao resetar missão')
    }
  }, [])

  const refreshMissions = useCallback(async () => {
    await loadMissions()
  }, [loadMissions])

  // Calcular estatísticas
  const stats = {
    total: missions.length,
    available: missions.filter(m => !m.isLocked).length,
    inProgress: missions.filter(m => m.progress?.status === MISSION_STATUS.IN_PROGRESS).length,
    completed: missions.filter(m => m.progress?.status === MISSION_STATUS.COMPLETED).length,
    locked: missions.filter(m => m.isLocked).length,
    premium: missions.filter(m => m.isPremium).length
  }

  useEffect(() => {
    loadMissions()
  }, [loadMissions])

  return {
    missions,
    isLoading,
    error,
    stats,
    startMission,
    completeMission,
    resetMission,
    refreshMissions
  }
}
