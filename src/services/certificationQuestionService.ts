/**
 * Serviço para Gerenciar Questões de Certificação
 * Implementa CRUD, upload em massa e workflow de aprovação
 */

import { supabase } from '@/lib/supabase'
import { 
  CertificationQuestion, 
  QuestionFormData, 
  QuestionFilter, 
  QuestionStats,
  QuestionUploadResult,
  CertificationProvider,
  QuestionDifficulty,
  QuestionStatus
} from '@/types/certifications'

export class CertificationQuestionService {
  /**
   * Criar nova questão
   */
  async createQuestion(data: QuestionFormData, userId: string): Promise<CertificationQuestion> {
    const { data: question, error } = await supabase
      .from('certification_questions')
      .insert({
        certification: data.certification,
        topic: data.topic,
        difficulty: data.difficulty,
        question_text: data.question_text,
        options: data.options,
        correct_answer_id: data.correct_answer,
        explanation: data.explanation,
        status: data.status,
        created_by: userId
      })
      .select()
      .single()

    if (error) throw error
    return this.mapQuestionFromDB(question)
  }

  /**
   * Buscar questões com filtros
   */
  async getQuestions(filter: QuestionFilter = {}, limit = 50, offset = 0): Promise<CertificationQuestion[]> {
    let query = supabase
      .from('certification_questions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Aplicar filtros
    if (filter.certification) {
      query = query.eq('certification', filter.certification)
    }
    if (filter.topic) {
      query = query.eq('topic', filter.topic)
    }
    if (filter.difficulty) {
      query = query.eq('difficulty', filter.difficulty)
    }
    if (filter.status) {
      query = query.eq('status', filter.status)
    }
    if (filter.searchTerm) {
      query = query.or(`question_text.ilike.%${filter.searchTerm}%,topic.ilike.%${filter.searchTerm}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data.map(this.mapQuestionFromDB)
  }

  /**
   * Buscar questão por ID
   */
  async getQuestionById(id: string): Promise<CertificationQuestion | null> {
    const { data, error } = await supabase
      .from('certification_questions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return this.mapQuestionFromDB(data)
  }

  /**
   * Atualizar questão
   */
  async updateQuestion(id: string, data: Partial<QuestionFormData>, userId: string): Promise<CertificationQuestion> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (data.certification) updateData.certification = data.certification
    if (data.topic) updateData.topic = data.topic
    if (data.difficulty) updateData.difficulty = data.difficulty
    if (data.question_text) updateData.question_text = data.question_text
    if (data.options) updateData.options = data.options
    if (data.correct_answer_id) updateData.correct_answer_id = data.correct_answer_id
    if (data.explanation) updateData.explanation = data.explanation
    if (data.status) updateData.status = data.status

    const { data: question, error } = await supabase
      .from('certification_questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapQuestionFromDB(question)
  }

  /**
   * Aprovar questão
   */
  async approveQuestion(id: string, userId: string, notes?: string): Promise<CertificationQuestion> {
    const { data: question, error } = await supabase
      .from('certification_questions')
      .update({
        status: 'approved',
        approved_by: userId,
        approval_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapQuestionFromDB(question)
  }

  /**
   * Rejeitar questão
   */
  async rejectQuestion(id: string, userId: string, notes: string): Promise<CertificationQuestion> {
    const { data: question, error } = await supabase
      .from('certification_questions')
      .update({
        status: 'archived',
        approved_by: userId,
        approval_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapQuestionFromDB(question)
  }

  /**
   * Deletar questão
   */
  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('certification_questions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Upload em massa de questões (simulado)
   */
  async uploadQuestionsBulk(
    questions: QuestionFormData[], 
    userId: string
  ): Promise<QuestionUploadResult> {
    const startTime = Date.now()
    const result: QuestionUploadResult = {
      success: true,
      questionsCreated: 0,
      questionsSkipped: 0,
      errors: [],
      processingTime: 0
    }

    try {
      for (const questionData of questions) {
        try {
          // Validar questão
          if (!this.validateQuestion(questionData)) {
            result.questionsSkipped++
            result.errors.push(`Questão inválida: ${questionData.questionText.substring(0, 50)}...`)
            continue
          }

          // Verificar se já existe questão similar
          const existing = await this.findSimilarQuestion(questionData)
          if (existing) {
            result.questionsSkipped++
            result.errors.push(`Questão similar já existe: ${questionData.questionText.substring(0, 50)}...`)
            continue
          }

          // Criar questão
          await this.createQuestion(questionData, userId)
          result.questionsCreated++

        } catch (error) {
          result.questionsSkipped++
          result.errors.push(`Erro ao criar questão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        }
      }

      result.processingTime = Date.now() - startTime
      return result

    } catch (error) {
      result.success = false
      result.errors.push(`Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      result.processingTime = Date.now() - startTime
      return result
    }
  }

  /**
   * Obter estatísticas das questões
   */
  async getQuestionStats(): Promise<QuestionStats> {
    const { data, error } = await supabase
      .from('certification_questions')
      .select('certification, difficulty, status, topic, success_rate')

    if (error) throw error

    const stats: QuestionStats = {
      total: data.length,
      byCertification: {} as Record<CertificationProvider, number>,
      byDifficulty: { easy: 0, medium: 0, hard: 0 },
      byStatus: { draft: 0, pending_review: 0, approved: 0, archived: 0 },
      averageSuccessRate: 0,
      mostUsedTopics: []
    }

    // Calcular estatísticas
    const topicCounts: Record<string, number> = {}
    let totalSuccessRate = 0

    data.forEach(question => {
      // Por certificação
      stats.byCertification[question.certification] = (stats.byCertification[question.certification] || 0) + 1
      
      // Por dificuldade
      stats.byDifficulty[question.difficulty]++
      
      // Por status
      stats.byStatus[question.status]++
      
      // Por tópico
      topicCounts[question.topic] = (topicCounts[question.topic] || 0) + 1
      
      // Taxa de sucesso média
      totalSuccessRate += question.success_rate || 0
    })

    stats.averageSuccessRate = data.length > 0 ? totalSuccessRate / data.length : 0
    stats.mostUsedTopics = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return stats
  }

  /**
   * Buscar questões para simulado
   */
  async getQuestionsForSimulation(
    certification: CertificationProvider,
    count: number,
    difficulty?: QuestionDifficulty,
    topics?: string[]
  ): Promise<CertificationQuestion[]> {
    let query = supabase
      .from('certification_questions')
      .select('*')
      .eq('certification', certification)
      .eq('status', 'approved')
      .order('usage_count', { ascending: true }) // Priorizar questões menos usadas

    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    if (topics && topics.length > 0) {
      query = query.in('topic', topics)
    }

    const { data, error } = await query.limit(count)

    if (error) throw error
    return data.map(this.mapQuestionFromDB)
  }

  /**
   * Atualizar estatísticas de uso da questão
   */
  async updateQuestionUsage(questionId: string, isCorrect: boolean): Promise<void> {
    const { data: question, error: fetchError } = await supabase
      .from('certification_questions')
      .select('usage_count, success_rate')
      .eq('id', questionId)
      .single()

    if (fetchError) throw fetchError

    const newUsageCount = question.usage_count + 1
    const currentSuccessRate = question.success_rate || 0
    const newSuccessRate = ((currentSuccessRate * question.usage_count) + (isCorrect ? 100 : 0)) / newUsageCount

    const { error: updateError } = await supabase
      .from('certification_questions')
      .update({
        usage_count: newUsageCount,
        success_rate: newSuccessRate,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId)

    if (updateError) throw updateError
  }

  /**
   * Validar questão
   */
  private validateQuestion(question: QuestionFormData): boolean {
    if (!question.question_text.trim()) return false
    if (!question.explanation.trim()) return false
    if (!question.options || question.options.length < 2) return false
    if (!question.correct_answer_id) return false
    if (!question.topic.trim()) return false
    return true
  }

  /**
   * Buscar questão similar
   */
  private async findSimilarQuestion(question: QuestionFormData): Promise<CertificationQuestion | null> {
    const { data, error } = await supabase
      .from('certification_questions')
      .select('*')
      .eq('certification', question.certification)
      .eq('topic', question.topic)
      .eq('difficulty', question.difficulty)
      .ilike('question_text', `%${question.question_text.substring(0, 50)}%`)
      .limit(1)

    if (error) throw error
    return data.length > 0 ? this.mapQuestionFromDB(data[0]) : null
  }

  /**
   * Mapear questão do banco para interface
   */
  private mapQuestionFromDB(data: any): CertificationQuestion {
    // Converter opções do formato do banco para o formato esperado
    const options = Array.isArray(data.options) ? data.options.map((option: any) => ({
      option_text: option.text || option.option_text,
      is_correct: option.id === data.correct_answer_id || option.is_correct || false
    })) : []

    return {
      id: data.id,
      certification: data.certification,
      topic: data.topic,
      difficulty: data.difficulty,
      question_text: data.question_text,
      question_type: data.question_type || 'multiple_choice', // Default para múltipla escolha
      options: options,
      correct_answer: data.correct_answer_id,
      explanation: data.explanation,
      status: data.status,
      usage_count: data.usage_count,
      success_rate: data.success_rate,
      created_by: data.created_by,
      approved_by: data.approved_by,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }
}

export const certificationQuestionService = new CertificationQuestionService()
