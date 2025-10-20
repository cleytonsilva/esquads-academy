/**
 * Serviço para gerenciamento de exames/certificações
 * Integração com Supabase
 */

import { supabase } from '@/integrations/supabase/client'
import {
  CertificationExam,
  ExamQuestion,
  ExamSession,
  ExamResult,
  ExamConfig,
  CreateExamInput,
  UpdateExamInput,
  CreateQuestionInput,
  calculateExamScore,
  isExamPassed,
  calculateXPEarned,
} from '@/types/exams'

class ExamService {
  // ========================================================================
  // CRUD DE EXAMES (ADMIN)
  // ========================================================================

  /**
   * Buscar todos os exames
   */
  async getAllExams(): Promise<CertificationExam[]> {
    const { data, error } = await supabase
      .from('generated_simulations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return this.mapExams(data || [])
  }

  /**
   * Buscar exame por ID
   */
  async getExamById(id: string): Promise<CertificationExam> {
    const { data, error } = await supabase
      .from('generated_simulations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return this.mapExam(data)
  }

  /**
   * Criar novo exame (Admin)
   */
  async createExam(exam: CreateExamInput, createdBy: string): Promise<CertificationExam> {
    const { data, error } = await supabase
      .from('certification_exams')
      .insert([
        {
          ...exam,
          created_by: createdBy,
          success_rate: 0,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return this.mapExam(data)
  }

  /**
   * Atualizar exame (Admin)
   */
  async updateExam(exam: UpdateExamInput): Promise<CertificationExam> {
    const { id, ...updates } = exam

    const { data, error } = await supabase
      .from('certification_exams')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapExam(data)
  }

  /**
   * Deletar exame (Admin)
   */
  async deleteExam(id: string): Promise<void> {
    const { error } = await supabase.from('certification_exams').delete().eq('id', id)

    if (error) throw error
  }

  // ========================================================================
  // QUESTÕES (ADMIN)
  // ========================================================================

  /**
   * Buscar questões de um exame
   */
  async getExamQuestions(examId: string): Promise<ExamQuestion[]> {
    const { data, error } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('exam_id', examId)
      .order('order_index')

    if (error) throw error
    return this.mapQuestions(data || [])
  }

  /**
   * Criar questão
   */
  async createQuestion(question: CreateQuestionInput): Promise<ExamQuestion> {
    const { data, error } = await supabase
      .from('exam_questions')
      .insert([question])
      .select()
      .single()

    if (error) throw error
    return this.mapQuestion(data)
  }

  /**
   * Atualizar questão
   */
  async updateQuestion(questionId: string, updates: Partial<CreateQuestionInput>): Promise<ExamQuestion> {
    const { data, error } = await supabase
      .from('exam_questions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select()
      .single()

    if (error) throw error
    return this.mapQuestion(data)
  }

  /**
   * Deletar questão
   */
  async deleteQuestion(questionId: string): Promise<void> {
    const { error } = await supabase.from('exam_questions').delete().eq('id', questionId)

    if (error) throw error
  }

  // ========================================================================
  // SESSÕES DE EXAME (STUDENT)
  // ========================================================================

  /**
   * Criar sessão de exame
   */
  async createExamSession(
    userId: string,
    examId: string,
    config: ExamConfig
  ): Promise<ExamSession> {
    const exam = await this.getExamById(examId)

    const { data, error } = await supabase
      .from('user_exam_sessions')
      .insert([
        {
          user_id: userId,
          exam_id: examId,
          config,
          time_remaining_seconds: config.timeLimit ? config.timeLimit * 60 : null,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return this.mapSession(data)
  }

  /**
   * Buscar sessão ativa
   */
  async getActiveSession(userId: string, examId: string): Promise<ExamSession | null> {
    const { data, error } = await supabase
      .from('simulation_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('simulation_id', examId)
      .eq('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return this.mapSession(data)
  }

  /**
   * Atualizar resposta na sessão
   */
  async updateSessionAnswer(
    sessionId: string,
    questionId: string,
    answer: string | string[]
  ): Promise<ExamSession> {
    // Buscar sessão atual
    const { data: session, error: fetchError } = await supabase
      .from('simulation_attempts')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError) throw fetchError

    const updatedAnswers = {
      ...session.answers,
      [questionId]: answer,
    }

    const { data, error } = await supabase
      .from('simulation_attempts')
      .update({
        answers: updatedAnswers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return this.mapSession(data)
  }

  /**
   * Atualizar progresso da sessão (índice da questão)
   */
  async updateSessionProgress(
    sessionId: string,
    currentQuestionIndex: number,
    timeRemaining?: number
  ): Promise<ExamSession> {
    const updates: any = {
      current_question_index: currentQuestionIndex,
      updated_at: new Date().toISOString(),
    }

    if (timeRemaining !== undefined) {
      updates.time_remaining_seconds = timeRemaining
    }

    const { data, error } = await supabase
      .from('simulation_attempts')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return this.mapSession(data)
  }

  /**
   * Finalizar sessão e calcular resultado
   */
  async completeExamSession(sessionId: string): Promise<ExamResult> {
    // Buscar sessão
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_exam_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError) throw sessionError

    const session = this.mapSession(sessionData)

    // Buscar exame e questões
    const exam = await this.getExamById(session.examId)
    const questions = await this.getExamQuestions(session.examId)

    // Calcular resultado
    const result = this.calculateExamResult(session, exam, questions)

    // Salvar resultado
    const { data, error } = await supabase
      .from('user_exam_results')
      .insert([
        {
          user_id: session.userId,
          exam_id: session.examId,
          session_id: sessionId,
          total_questions: result.totalQuestions,
          correct_answers: result.correctAnswers,
          incorrect_answers: result.incorrectAnswers,
          score: result.score,
          pass_percentage: result.passPercentage,
          passed: result.passed,
          time_spent_minutes: result.timeSpentMinutes,
          xp_earned: result.xpEarned,
          performance_by_topic: result.performanceByTopic,
          attempts: result.attempts,
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Marcar sessão como completada
    await supabase
      .from('user_exam_sessions')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    // Registrar evento de gamificação
    if (result.passed) {
      await this.recordGamificationEvent(
        session.userId,
        session.examId,
        result.xpEarned,
        result.score
      )
    }

    return this.mapResult(data)
  }

  // ========================================================================
  // RESULTADOS (STUDENT)
  // ========================================================================

  /**
   * Buscar resultados do usuário
   */
  async getUserResults(userId: string): Promise<ExamResult[]> {
    const { data, error } = await supabase
      .from('user_exam_results')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (error) throw error
    return this.mapResults(data || [])
  }

  /**
   * Buscar resultados de um exame específico
   */
  async getExamResults(userId: string, examId: string): Promise<ExamResult[]> {
    const { data, error } = await supabase
      .from('user_exam_results')
      .select('*')
      .eq('user_id', userId)
      .eq('exam_id', examId)
      .order('completed_at', { ascending: false })

    if (error) throw error
    return this.mapResults(data || [])
  }

  // ========================================================================
  // FUNÇÕES AUXILIARES PRIVADAS
  // ========================================================================

  private mapExams(data: any[]): CertificationExam[] {
    return data.map((item) => this.mapExam(item))
  }

  private mapExam(data: any): CertificationExam {
    return {
      id: data.id,
      provider: data.provider,
      title: data.title,
      description: data.description,
      questionCount: data.question_count,
      difficultyLevel: data.difficulty_level,
      durationMinutes: data.duration_minutes,
      passPercentage: data.pass_percentage,
      xpReward: data.xp_reward,
      isPremium: data.is_premium || false,
      topics: data.topics || [],
      prerequisites: data.prerequisites || [],
      iconUrl: data.icon_url,
      successRate: data.success_rate || 0,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  private mapQuestions(data: any[]): ExamQuestion[] {
    return data.map((item) => this.mapQuestion(item))
  }

  private mapQuestion(data: any): ExamQuestion {
    return {
      id: data.id,
      examId: data.exam_id,
      type: data.type,
      text: data.text,
      options: data.options || [],
      correctAnswer: data.correct_answer,
      explanation: data.explanation,
      topic: data.topic,
      difficulty: data.difficulty,
      orderIndex: data.order_index,
      imageUrl: data.image_url,
      codeSnippet: data.code_snippet,
      points: data.points || 1,
    }
  }

  private mapSession(data: any): ExamSession {
    return {
      id: data.id,
      userId: data.user_id,
      examId: data.exam_id,
      config: data.config,
      startedAt: new Date(data.started_at),
      currentQuestionIndex: data.current_question_index || 0,
      answers: data.answers || {},
      timeRemainingSeconds: data.time_remaining_seconds,
      isCompleted: data.is_completed || false,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  private mapResults(data: any[]): ExamResult[] {
    return data.map((item) => this.mapResult(item))
  }

  private mapResult(data: any): ExamResult {
    return {
      id: data.id,
      userId: data.user_id,
      examId: data.exam_id,
      sessionId: data.session_id,
      totalQuestions: data.total_questions,
      correctAnswers: data.correct_answers,
      incorrectAnswers: data.incorrect_answers,
      skippedAnswers: data.skipped_answers || 0,
      score: data.score,
      passPercentage: data.pass_percentage,
      passed: data.passed,
      timeSpentMinutes: data.time_spent_minutes,
      xpEarned: data.xp_earned,
      performanceByTopic: data.performance_by_topic || {},
      attempts: data.attempts || 1,
      completedAt: new Date(data.completed_at),
      createdAt: new Date(data.created_at),
    }
  }

  private calculateExamResult(
    session: ExamSession,
    exam: CertificationExam,
    questions: ExamQuestion[]
  ): Omit<ExamResult, 'id' | 'createdAt'> {
    let correctAnswers = 0
    let incorrectAnswers = 0
    let skippedAnswers = 0
    const performanceByTopic: Record<string, any> = {}

    // Calcular respostas corretas e performance por tópico
    questions.forEach((question) => {
      const userAnswer = session.answers[question.id]

      if (!userAnswer) {
        skippedAnswers++
        return
      }

      const isCorrect = this.checkAnswer(question, userAnswer)
      if (isCorrect) {
        correctAnswers++
      } else {
        incorrectAnswers++
      }

      // Performance por tópico
      if (!performanceByTopic[question.topic]) {
        performanceByTopic[question.topic] = {
          topic: question.topic,
          totalQuestions: 0,
          correctAnswers: 0,
          percentage: 0,
        }
      }
      performanceByTopic[question.topic].totalQuestions++
      if (isCorrect) {
        performanceByTopic[question.topic].correctAnswers++
      }
    })

    // Calcular porcentagens por tópico
    Object.values(performanceByTopic).forEach((topic: any) => {
      topic.percentage = (topic.correctAnswers / topic.totalQuestions) * 100
    })

    const score = calculateExamScore(correctAnswers, questions.length)
    const passed = isExamPassed(score, exam.passPercentage)
    const xpEarned = calculateXPEarned(exam, score, passed)

    const timeSpentMinutes = Math.floor(
      (new Date().getTime() - new Date(session.startedAt).getTime()) / 60000
    )

    // Buscar tentativas anteriores
    const attempts = 1 // TODO: Implementar contagem real de tentativas

    return {
      userId: session.userId,
      examId: session.examId,
      sessionId: session.id,
      totalQuestions: questions.length,
      correctAnswers,
      incorrectAnswers,
      skippedAnswers,
      score,
      passPercentage: exam.passPercentage,
      passed,
      timeSpentMinutes,
      xpEarned,
      performanceByTopic,
      attempts,
      completedAt: new Date(),
    }
  }

  private checkAnswer(question: ExamQuestion, userAnswer: string | string[]): boolean {
    const correctAnswer = question.correctAnswer

    if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
      // Múltiplas respostas
      if (correctAnswer.length !== userAnswer.length) return false
      return correctAnswer.every((answer) => userAnswer.includes(answer))
    }

    // Resposta única
    return correctAnswer === userAnswer
  }

  private async recordGamificationEvent(
    userId: string,
    examId: string,
    xpEarned: number,
    score: number
  ): Promise<void> {
    try {
      await supabase.from('xp_events').insert([
        {
          user_id: userId,
          amount: xpEarned,
          source_type: 'exam',
          source_id: examId,
          description: `Exame concluído com ${score}% de aproveitamento`,
        },
      ])
    } catch (error) {
      console.error('Erro ao registrar evento de gamificação:', error)
    }
  }
}

export const examService = new ExamService()

