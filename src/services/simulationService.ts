/**
 * Serviço para Gerenciar Simulados Gerados
 * Implementa criação, execução e análise de simulados
 */

import { supabase } from '@/lib/supabase'
import { 
  GeneratedSimulation,
  SimulationAttempt,
  SimulationConfig,
  SimulationResult,
  CertificationProvider,
  QuestionDifficulty,
  CertificationQuestion
} from '@/types/certifications'
import { certificationQuestionService } from './certificationQuestionService'

export class SimulationService {
  /**
   * Criar novo simulado baseado em configuração
   */
  async createSimulation(
    config: SimulationConfig,
    userId: string
  ): Promise<GeneratedSimulation> {
    // Buscar questões aprovadas
    const questions = await certificationQuestionService.getQuestionsForSimulation(
      config.certification,
      config.question_count,
      config.difficulty as QuestionDifficulty,
      config.topics
    )

    if (questions.length < config.question_count) {
      throw new Error(`Não há questões suficientes disponíveis. Encontradas: ${questions.length}, Necessárias: ${config.question_count}`)
    }

    // Embaralhar questões
    const shuffledQuestions = this.shuffleArray(questions).slice(0, config.question_count)
    const questionIds = shuffledQuestions.map(q => q.id)

    // Criar simulado
    const { data: simulation, error } = await supabase
      .from('generated_simulations')
      .insert({
        certification: config.certification,
        difficulty: config.difficulty as QuestionDifficulty,
        question_count: config.question_count,
        questions: questionIds,
        created_by: userId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      })
      .select()
      .single()

    if (error) throw error
    return this.mapSimulationFromDB(simulation)
  }

  /**
   * Criar sessão de exame
   */
  async createSession(sessionData: {
    user_id: string
    simulation_id: string
    config: any
    questions: string[]
  }): Promise<SimulationAttempt> {
    const { data: attempt, error } = await supabase
      .from('simulation_attempts')
      .insert({
        user_id: sessionData.user_id,
        simulation_id: sessionData.simulation_id,
        answers: {},
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return this.mapAttemptFromDB(attempt)
  }

  /**
   * Iniciar tentativa de simulado
   */
  async startSimulationAttempt(
    simulationId: string,
    userId: string
  ): Promise<SimulationAttempt> {
    const { data: attempt, error } = await supabase
      .from('simulation_attempts')
      .insert({
        user_id: userId,
        simulation_id: simulationId,
        answers: {},
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return this.mapAttemptFromDB(attempt)
  }

  /**
   * Atualizar sessão de exame
   */
  async updateSession(sessionId: string, updateData: {
    status?: string
    score?: number
    answers?: Record<string, any>
    time_spent?: number
  }): Promise<void> {
    const { error } = await supabase
      .from('simulation_attempts')
      .update({
        ...updateData,
        ...(updateData.status === 'completed' && { completed_at: new Date().toISOString() })
      })
      .eq('id', sessionId)

    if (error) throw error
  }

  /**
   * Salvar resposta de questão
   */
  async saveAnswer(
    attemptId: string,
    questionId: string,
    answerId: string,
    userId: string
  ): Promise<void> {
    // Buscar tentativa atual
    const { data: attempt, error: fetchError } = await supabase
      .from('simulation_attempts')
      .select('answers')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single()

    if (fetchError) throw fetchError

    // Atualizar respostas
    const answers = attempt.answers || {}
    answers[questionId] = answerId

    const { error: updateError } = await supabase
      .from('simulation_attempts')
      .update({ answers })
      .eq('id', attemptId)
      .eq('user_id', userId)

    if (updateError) throw updateError
  }

  /**
   * Finalizar simulado e calcular pontuação
   */
  async completeSimulation(
    attemptId: string,
    userId: string
  ): Promise<SimulationResult> {
    // Buscar tentativa e simulado
    const { data: attempt, error: attemptError } = await supabase
      .from('simulation_attempts')
      .select(`
        *,
        generated_simulations (
          certification,
          difficulty,
          question_count,
          questions
        )
      `)
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single()

    if (attemptError) throw attemptError

    const simulation = attempt.generated_simulations
    const answers = attempt.answers || {}
    const questionIds = simulation.questions as string[]

    // Buscar questões para calcular pontuação
    const questions = await Promise.all(
      questionIds.map(id => certificationQuestionService.getQuestionById(id))
    )

    const validQuestions = questions.filter(q => q !== null) as CertificationQuestion[]
    
    // Calcular pontuação
    let correctAnswers = 0
    const topicBreakdown: Record<string, { correct: number; total: number }> = {}
    const difficultyBreakdown: Record<string, { correct: number; total: number }> = {}

    validQuestions.forEach(question => {
      const userAnswer = answers[question.id]
      const isCorrect = userAnswer === question.correct_answer_id

      if (isCorrect) correctAnswers++

      // Breakdown por tópico
      if (!topicBreakdown[question.topic]) {
        topicBreakdown[question.topic] = { correct: 0, total: 0 }
      }
      topicBreakdown[question.topic].total++
      if (isCorrect) topicBreakdown[question.topic].correct++

      // Breakdown por dificuldade
      if (!difficultyBreakdown[question.difficulty]) {
        difficultyBreakdown[question.difficulty] = { correct: 0, total: 0 }
      }
      difficultyBreakdown[question.difficulty].total++
      if (isCorrect) difficultyBreakdown[question.difficulty].correct++

      // Atualizar estatísticas da questão
      certificationQuestionService.updateQuestionUsage(question.id, isCorrect)
    })

    const score = (correctAnswers / validQuestions.length) * 100
    const timeSpent = attempt.time_spent || 0

    // Atualizar tentativa com resultado
    const { error: updateError } = await supabase
      .from('simulation_attempts')
      .update({
        score,
        time_spent: timeSpent,
        completed_at: new Date().toISOString()
      })
      .eq('id', attemptId)

    if (updateError) throw updateError

    // Gerar recomendações
    const recommendations = this.generateRecommendations(
      topicBreakdown,
      difficultyBreakdown,
      score
    )

    return {
      sessionId: attemptId,
      userId,
      certification: simulation.certification,
      score,
      totalQuestions: validQuestions.length,
      correctAnswers,
      timeSpent: Math.round(timeSpent / 60), // converter para minutos
      topicBreakdown: Object.entries(topicBreakdown).map(([topic, stats]) => ({
        topic,
        correct: stats.correct,
        total: stats.total,
        percentage: Math.round((stats.correct / stats.total) * 100)
      })),
      difficultyBreakdown: Object.entries(difficultyBreakdown).map(([difficulty, stats]) => ({
        difficulty: difficulty as QuestionDifficulty,
        correct: stats.correct,
        total: stats.total,
        percentage: Math.round((stats.correct / stats.total) * 100)
      })),
      recommendations,
      isPassing: score >= 70, // Score mínimo para aprovação
      createdAt: new Date().toISOString()
    }
  }

  /**
   * Buscar tentativas do usuário
   */
  async getUserAttempts(userId: string, limit = 20): Promise<SimulationAttempt[]> {
    const { data, error } = await supabase
      .from('simulation_attempts')
      .select(`
        *,
        generated_simulations (
          certification,
          difficulty,
          question_count
        )
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data.map(this.mapAttemptFromDB)
  }

  /**
   * Buscar configurações de simulados disponíveis
   */
  async getSimulationConfigs(): Promise<SimulationConfig[]> {
    const { data, error } = await supabase
      .from('simulation_configs')
      .select('*')
      .eq('is_active', true)
      .order('certification', { ascending: true })

    if (error) throw error
    return data.map(this.mapConfigFromDB)
  }

  /**
   * Buscar configuração por ID
   */
  async getSimulationConfigById(id: string): Promise<SimulationConfig | null> {
    const { data, error } = await supabase
      .from('simulation_configs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return this.mapConfigFromDB(data)
  }

  /**
   * Gerar recomendações baseadas no desempenho
   */
  private generateRecommendations(
    topicBreakdown: Record<string, { correct: number; total: number }>,
    difficultyBreakdown: Record<string, { correct: number; total: number }>,
    score: number
  ): string[] {
    const recommendations: string[] = []

    // Recomendações baseadas na pontuação geral
    if (score >= 90) {
      recommendations.push('Excelente desempenho! Você está pronto para a certificação oficial.')
    } else if (score >= 70) {
      recommendations.push('Bom desempenho! Continue praticando para melhorar ainda mais.')
    } else {
      recommendations.push('Continue estudando os conceitos fundamentais antes de tentar novamente.')
    }

    // Recomendações baseadas em tópicos fracos
    Object.entries(topicBreakdown).forEach(([topic, stats]) => {
      const percentage = (stats.correct / stats.total) * 100
      if (percentage < 60) {
        recommendations.push(`Foque mais nos estudos de ${topic} - sua pontuação foi de ${Math.round(percentage)}%.`)
      }
    })

    // Recomendações baseadas em dificuldade
    Object.entries(difficultyBreakdown).forEach(([difficulty, stats]) => {
      const percentage = (stats.correct / stats.total) * 100
      if (difficulty === 'hard' && percentage < 50) {
        recommendations.push('Pratique mais questões difíceis para melhorar sua confiança.')
      }
    })

    return recommendations
  }

  /**
   * Embaralhar array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Mapear simulado do banco para interface
   */
  private mapSimulationFromDB(data: any): GeneratedSimulation {
    return {
      id: data.id,
      certification: data.certification,
      difficulty: data.difficulty,
      question_count: data.question_count,
      questions: data.questions,
      created_by: data.created_by,
      created_at: data.created_at,
      expires_at: data.expires_at
    }
  }

  /**
   * Mapear tentativa do banco para interface
   */
  private mapAttemptFromDB(data: any): SimulationAttempt {
    return {
      id: data.id,
      user_id: data.user_id,
      simulation_id: data.simulation_id,
      answers: data.answers,
      score: data.score,
      time_spent: data.time_spent,
      completed_at: data.completed_at,
      started_at: data.started_at
    }
  }

  /**
   * Mapear configuração do banco para interface
   */
  private mapConfigFromDB(data: any): SimulationConfig {
    return {
      id: data.id,
      certification: data.certification,
      name: data.name,
      description: data.description,
      question_count: data.question_count,
      time_limit: data.time_limit,
      passing_score: data.passing_score,
      difficulty_distribution: data.difficulty_distribution,
      topics: data.topics,
      is_active: data.is_active,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }
}

export const simulationService = new SimulationService()
