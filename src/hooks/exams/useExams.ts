/**
 * Hook para gerenciamento de exames/certificações
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  CertificationExam,
  CertificationFilters,
  ExamResult,
  CertificationWithResults,
  ExamDifficultyLevel,
  CertificationProvider,
} from '@/types/exams'
import { examService } from '@/services/examService'
import { useToast } from '@/hooks/use-toast'

interface UseExamsReturn {
  exams: CertificationExam[]
  filteredExams: CertificationWithResults[]
  filters: CertificationFilters
  setFilters: (filters: CertificationFilters) => void
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getUserResults: (examId: string) => ExamResult[]
}

export const useExams = (userId?: string): UseExamsReturn => {
  const [exams, setExams] = useState<CertificationExam[]>([])
  const [userResults, setUserResults] = useState<Record<string, ExamResult[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [filters, setFilters] = useState<CertificationFilters>({
    search: '',
    provider: 'all',
    difficulty: 'all',
    careerPath: 'all',
    showPremiumOnly: false,
    showFreeOnly: false,
    hasPrerequisites: false,
    sortBy: 'recommended',
  })

  // Função para buscar exames
  const fetchExams = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const fetchedExams = await examService.getAllExams()
      setExams(fetchedExams)

      // Se tiver userId, buscar resultados
      if (userId) {
        const results = await examService.getUserResults(userId)
        const resultsMap = results.reduce(
          (acc, result) => {
            if (!acc[result.examId]) {
              acc[result.examId] = []
            }
            acc[result.examId].push(result)
            return acc
          },
          {} as Record<string, ExamResult[]>
        )
        setUserResults(resultsMap)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar exames'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [userId, toast])

  // Carregar exames ao montar
  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  // Função para obter resultados de um exame
  const getUserResults = useCallback(
    (examId: string) => {
      return userResults[examId] || []
    },
    [userResults]
  )

  // Filtrar e ordenar exames
  const filteredExams = useMemo(() => {
    let filtered = exams.map((exam) => {
      const results = userResults[exam.id] || []
      const bestScore = results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0

      return {
        ...exam,
        lastResult: results[results.length - 1],
        attempts: results.length,
        bestScore,
      }
    })

    // Filtro de busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (exam) =>
          exam.title.toLowerCase().includes(searchTerm) ||
          exam.provider.toLowerCase().includes(searchTerm) ||
          exam.description.toLowerCase().includes(searchTerm) ||
          exam.topics.some((topic) => topic.toLowerCase().includes(searchTerm))
      )
    }

    // Filtro de provider
    if (filters.provider !== 'all') {
      filtered = filtered.filter((exam) => exam.provider === filters.provider)
    }

    // Filtro de dificuldade
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter((exam) => exam.difficultyLevel === filters.difficulty)
    }

    // Filtro de premium
    if (filters.showPremiumOnly) {
      filtered = filtered.filter((exam) => exam.isPremium)
    }

    if (filters.showFreeOnly) {
      filtered = filtered.filter((exam) => !exam.isPremium)
    }

    // Filtro de pré-requisitos
    if (filters.hasPrerequisites) {
      filtered = filtered.filter((exam) => exam.prerequisites.length > 0)
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'difficulty':
          return getDifficultyOrder(a.difficultyLevel) - getDifficultyOrder(b.difficultyLevel)
        case 'success-rate':
          return b.successRate - a.successRate
        case 'duration':
          return a.durationMinutes - b.durationMinutes
        case 'recommended':
        default: {
          // Recomendado: baseado em sucesso e tentativas
          const aScore = a.successRate * 0.7 + (a.attempts > 0 ? 30 : 0)
          const bScore = b.successRate * 0.7 + (b.attempts > 0 ? 30 : 0)
          return bScore - aScore
        }
      }
    })

    return filtered
  }, [exams, userResults, filters])

  return {
    exams,
    filteredExams,
    filters,
    setFilters,
    loading,
    error,
    refetch: fetchExams,
    getUserResults,
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

const getDifficultyOrder = (difficulty: ExamDifficultyLevel): number => {
  const order: Record<ExamDifficultyLevel, number> = {
    [ExamDifficultyLevel.Basic]: 1,
    [ExamDifficultyLevel.Intermediate]: 2,
    [ExamDifficultyLevel.Advanced]: 3,
    [ExamDifficultyLevel.Expert]: 4,
  }
  return order[difficulty] || 0
}

