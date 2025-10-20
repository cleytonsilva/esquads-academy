/**
 * Hook for Exams Management with Supabase Integration
 * Hook para gerenciamento de exames com integração Supabase
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { recordEvent } from '@/services/gamificationService'
import { 
  Exam, 
  ExamStatus, 
  ExamDifficulty,
  ExamAttempt,
  ExamResult,
  ExamStats,
  Question,
  QuestionType
} from '@/types/exams'

export interface UseExamsOptions {
  difficulty?: ExamDifficulty
  status?: ExamStatus
  provider?: string
  search?: string
  limit?: number
  offset?: number
}

export interface UseExamsReturn {
  exams: Exam[]
  loading: boolean
  error: string | null
  totalCount: number
  hasMore: boolean
  stats: ExamStats | null
  loadMore: () => void
  refresh: () => void
  startExam: (examId: string) => Promise<ExamAttempt | null>
  submitAnswer: (attemptId: string, questionId: string, answer: string | string[]) => Promise<void>
  completeExam: (attemptId: string) => Promise<ExamResult | null>
  getExamQuestions: (examId: string) => Promise<Question[]>
}

export const useExams = (options: UseExamsOptions = {}): UseExamsReturn => {
  const { user } = useAuth()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [stats, setStats] = useState<ExamStats | null>(null)

  const {
    difficulty,
    status,
    provider,
    search,
    limit = 20,
    offset = 0
  } = options

  const loadExams = useCallback(async (isLoadMore = false) => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('generated_simulations')
        .select(`
          *,
          simulation_attempts!left (
            id,
            score,
            started_at,
            completed_at,
            time_spent
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (difficulty) {
        query = query.eq('difficulty', difficulty)
      }
      if (provider) {
        query = query.eq('provider', provider)
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      // Paginação
      const currentOffset = isLoadMore ? exams.length : offset
      query = query.range(currentOffset, currentOffset + limit - 1)

      const { data, error: queryError, count } = await query

      if (queryError) throw queryError

      const examsWithStatus = data?.map(exam => {
        const userAttempts = exam.simulation_attempts?.filter(
          (attempt: any) => attempt.user_id === user.id
        ) || []
        
        const completedAttempts = userAttempts.filter((a: any) => a.completed_at !== null)
        const inProgressAttempt = userAttempts.find((a: any) => a.completed_at === null)

        let examStatus = ExamStatus.Available
        if (inProgressAttempt) {
          examStatus = ExamStatus.InProgress
        } else if (completedAttempts.length > 0) {
          examStatus = ExamStatus.Completed
        }

        const bestScore = completedAttempts.length > 0
          ? Math.max(...completedAttempts.map((a: any) => a.score || 0))
          : 0

        return {
          ...exam,
          status: examStatus,
          userProgress: {
            attempts: userAttempts.length,
            bestScore,
            lastAttempt: userAttempts[0]?.started_at,
            inProgress: !!inProgressAttempt,
            currentAttemptId: inProgressAttempt?.id
          }
        }
      }) || []

      if (isLoadMore) {
        setExams(prev => [...prev, ...examsWithStatus])
      } else {
        setExams(examsWithStatus)
      }

      setTotalCount(count || 0)
      setHasMore((currentOffset + limit) < (count || 0))

    } catch (err) {
      console.error('Erro ao carregar exames:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [user, difficulty, provider, search, limit, offset, exams.length])

  const loadStats = useCallback(async () => {
    if (!user) return

    try {
      const { data: attempts, error } = await supabase
        .from('simulation_attempts')
        .select(`
          *,
          generated_simulations (
            difficulty,
            certification,
            question_count
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      const completedAttempts = attempts?.filter(a => a.status === 'completed') || []
      const inProgressAttempts = attempts?.filter(a => a.status === 'in_progress') || []

      const averageScore = completedAttempts.length > 0
        ? completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / completedAttempts.length
        : 0

      const totalTimeSpent = completedAttempts.reduce((sum, attempt) => {
        return sum + (attempt.time_spent || 0)
      }, 0)

      // Calcular provedor favorito
      const providerCount: Record<string, number> = {}
      completedAttempts.forEach(attempt => {
        const provider = attempt.generated_simulations?.certification
        if (provider) {
          providerCount[provider] = (providerCount[provider] || 0) + 1
        }
      })

      const favoriteProvider = Object.entries(providerCount).reduce(
        (max, [provider, count]) => count > max.count ? { provider, count } : max,
        { provider: 'CompTIA', count: 0 }
      ).provider

      const examStats: ExamStats = {
        totalExams: attempts?.length || 0,
        completedExams: completedAttempts.length,
        inProgressExams: inProgressAttempts.length,
        averageScore,
        totalTimeSpent,
        favoriteProvider,
        completionRate: attempts?.length ? (completedAttempts.length / attempts.length) * 100 : 0,
        streakDays: 0, // TODO: Implementar cálculo de streak
        lastActivity: attempts?.[0]?.started_at || new Date().toISOString()
      }

      setStats(examStats)

    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }, [user])

  const getExamQuestions = useCallback(async (examId: string): Promise<Question[]> => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', examId)
        .order('order_index')

      if (error) throw error

      return data || []

    } catch (err) {
      console.error('Erro ao carregar questões:', err)
      return []
    }
  }, [])

  const startExam = useCallback(async (examId: string): Promise<ExamAttempt | null> => {
    if (!user) return null

    try {
      // Verificar se já existe uma tentativa em progresso
      const { data: existingAttempt } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', examId)
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .single()

      if (existingAttempt) {
        return existingAttempt
      }

      // Buscar informações do exame
      const { data: exam } = await supabase
        .from('exams')
        .select('title, time_limit')
        .eq('id', examId)
        .single()

      // Criar nova tentativa
      const { data: newAttempt, error } = await supabase
        .from('exam_attempts')
        .insert({
          exam_id: examId,
          user_id: user.id,
          status: 'in_progress',
          score: 0,
          started_at: new Date().toISOString(),
          time_limit: exam?.time_limit || 60
        })
        .select()
        .single()

      if (error) throw error

      // Registrar evento de gamificação
      try {
        await recordEvent(user.id, 'mission_started', {
          exam_id: examId,
          exam_title: exam?.title || 'Exame',
          attempt_id: newAttempt.id,
          source: 'exam'
        })
      } catch (gamificationError) {
        console.error('Erro ao registrar evento de gamificação:', gamificationError)
      }

      // Atualizar lista de exames
      await loadExams()

      return newAttempt

    } catch (err) {
      console.error('Erro ao iniciar exame:', err)
      setError(err instanceof Error ? err.message : 'Erro ao iniciar exame')
      return null
    }
  }, [user, loadExams])

  const submitAnswer = useCallback(async (
    attemptId: string,
    questionId: string,
    answer: string | string[]
  ): Promise<void> => {
    if (!user) return

    try {
      // Verificar se já existe uma resposta para esta questão
      const { data: existingAnswer } = await supabase
        .from('exam_answers')
        .select('id')
        .eq('attempt_id', attemptId)
        .eq('question_id', questionId)
        .single()

      if (existingAnswer) {
        // Atualizar resposta existente
        const { error } = await supabase
          .from('exam_answers')
          .update({
            answer: Array.isArray(answer) ? answer : [answer],
            answered_at: new Date().toISOString()
          })
          .eq('id', existingAnswer.id)

        if (error) throw error
      } else {
        // Criar nova resposta
        const { error } = await supabase
          .from('exam_answers')
          .insert({
            attempt_id: attemptId,
            question_id: questionId,
            answer: Array.isArray(answer) ? answer : [answer],
            answered_at: new Date().toISOString()
          })

        if (error) throw error
      }

    } catch (err) {
      console.error('Erro ao submeter resposta:', err)
      setError(err instanceof Error ? err.message : 'Erro ao submeter resposta')
    }
  }, [user])

  const completeExam = useCallback(async (attemptId: string): Promise<ExamResult | null> => {
    if (!user) return null

    try {
      // Calcular pontuação
      const { data: answers } = await supabase
        .from('exam_answers')
        .select(`
          *,
          questions (
            correct_answer,
            points,
            type
          )
        `)
        .eq('attempt_id', attemptId)

      let totalScore = 0
      let correctAnswers = 0
      const totalQuestions = answers?.length || 0

      answers?.forEach(answer => {
        const question = answer.questions
        if (question) {
          const userAnswer = answer.answer
          const correctAnswer = question.correct_answer

          let isCorrect = false
          if (question.type === QuestionType.Multiple) {
            isCorrect = userAnswer.length === 1 && userAnswer[0] === correctAnswer[0]
          } else if (question.type === QuestionType.Multiple) {
            isCorrect = userAnswer.length === correctAnswer.length &&
                      userAnswer.every((ans: string) => correctAnswer.includes(ans))
          } else if (question.type === QuestionType.TrueFalse) {
            isCorrect = userAnswer[0] === correctAnswer[0]
          }

          if (isCorrect) {
            totalScore += question.points || 1
            correctAnswers++
          }
        }
      })

      const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
      const passed = percentage >= 70 // Critério de aprovação padrão

      // Buscar dados do exame para gamificação
      const { data: examData } = await supabase
        .from('exam_attempts')
        .select(`
          exam_id,
          exams (
            title,
            difficulty
          )
        `)
        .eq('id', attemptId)
        .single()

      // Atualizar tentativa
      const { error: updateError } = await supabase
        .from('exam_attempts')
        .update({
          status: 'completed',
          score: totalScore,
          percentage,
          completed_at: new Date().toISOString()
        })
        .eq('id', attemptId)

      if (updateError) throw updateError

      // Criar resultado
      const { data: result, error: resultError } = await supabase
        .from('exam_results')
        .insert({
          attempt_id: attemptId,
          exam_id: examData?.exam_id,
          user_id: user.id,
          score: totalScore,
          percentage,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          passed
        })
        .select()
        .single()

      if (resultError) throw resultError

      // Registrar evento de gamificação
      try {
        const eventType = passed ? 'exam_passed' : 'exam_failed'
        await recordEvent(user.id, eventType, {
          exam_id: examData?.exam_id,
          exam_title: examData?.exams?.title || 'Exame',
          attempt_id: attemptId,
          score: totalScore,
          percentage,
          difficulty: examData?.exams?.difficulty,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          passed
        })
      } catch (gamificationError) {
        console.error('Erro ao registrar evento de gamificação:', gamificationError)
      }

      // Recarregar dados
      await Promise.all([loadExams(), loadStats()])

      return result

    } catch (err) {
      console.error('Erro ao completar exame:', err)
      setError(err instanceof Error ? err.message : 'Erro ao completar exame')
      return null
    }
  }, [user, loadExams, loadStats])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadExams(true)
    }
  }, [loading, hasMore, loadExams])

  const refresh = useCallback(() => {
    loadExams(false)
    loadStats()
  }, [loadExams, loadStats])

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      loadExams()
      loadStats()
    }
  }, [user, loadExams, loadStats])

  return {
    exams,
    loading,
    error,
    totalCount,
    hasMore,
    stats,
    loadMore,
    refresh,
    startExam,
    submitAnswer,
    completeExam,
    getExamQuestions
  }
}

export default useExams