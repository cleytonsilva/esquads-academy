/**
 * Serviço para gerenciamento de missões
 * Integração com Supabase
 */

import { supabase } from '@/integrations/supabase/client'
import {
  Mission,
  CommandExecutionLog,
  MissionResult,
  CreateMissionInput,
  UpdateMissionInput,
} from '@/types/gamification'
import { MISSION_STATUS } from '@/utils/constants'
import { UserMissionProgress } from '@/types/missions'

class MissionService {
  // ========================================================================
  // CRUD DE MISSÕES (ADMIN)
  // ========================================================================

  /**
   * Buscar todas as missões
   */
  async getAllMissions(): Promise<Mission[]> {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return this.mapMissions(data || [])
  }

  /**
   * Buscar missão por ID
   */
  async getMissionById(id: string): Promise<Mission> {
    const { data, error } = await supabase.from('missions').select('*').eq('id', id).single()

    if (error) throw error
    return this.mapMission(data)
  }

  /**
   * Criar nova missão (Admin)
   */
  async createMission(mission: CreateMissionInput, createdBy: string): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .insert([
        {
          ...mission,
          created_by: createdBy,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return this.mapMission(data)
  }

  /**
   * Atualizar missão (Admin)
   */
  async updateMission(id: string, updates: UpdateMissionInput): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapMission(data)
  }

  /**
   * Deletar missão (Admin)
   */
  async deleteMission(id: string): Promise<void> {
    const { error } = await supabase.from('missions').delete().eq('id', id)

    if (error) throw error
  }

  // ========================================================================
  // PROGRESSO DO USUÁRIO (STUDENT)
  // ========================================================================

  /**
   * Buscar progresso do usuário em todas as missões
   */
  async getUserProgress(userId: string): Promise<UserMissionProgress[]> {
    const { data, error } = await supabase
      .from('mission_attempts')
      .select('*')
      .eq('user_id', userId)

    // Tratar tabela inexistente (404) ou relação ausente
    if (error) {
      const msg = (error as any)?.message || ''
      const status = (error as any)?.status
      if (status === 404 || msg.includes('does not exist') || msg.includes('relation')) {
        console.warn('Tabela mission_attempts ausente; retornando progresso vazio')
        return []
      }
      throw error
    }

    return this.mapUserProgress(data || [])
  }

  /**
   * Buscar progresso do usuário em uma missão específica
   */
  async getMissionProgress(userId: string, missionId: string): Promise<UserMissionProgress | null> {
    const { data, error } = await supabase
      .from('mission_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .maybeSingle()

    if (error) {
      const msg = (error as any)?.message || ''
      const status = (error as any)?.status
      if ((error as any)?.code === 'PGRST116' || status === 404 || msg.includes('does not exist')) return null // Não encontrado ou tabela ausente
      throw error
    }

    return data ? this.mapUserProgressItem(data) : null
  }

  /**
   * Iniciar missão
   */
  async startMission(userId: string, missionId: string): Promise<UserMissionProgress> {
    // Primeiro, verificar se já existe progresso para esta missão
    const existingProgress = await this.getMissionProgress(userId, missionId)
    
    if (existingProgress) {
      // Se já existe, apenas atualizar o status para InProgress
      return this.updateMissionProgress(userId, missionId, {
        status: MISSION_STATUS.IN_PROGRESS,
      })
    }

    // Se não existe, criar novo registro
    const { data, error } = await supabase
      .from('mission_attempts')
      .insert({
        user_id: userId,
        mission_id: missionId,
        status: MISSION_STATUS.IN_PROGRESS,
        score: 0,
        xp_earned: 0,
        progress_data: {
          current_step: 0,
          objectives_completed: [],
          hints_used: 0,
          commands_executed: [],
          last_checkpoint: null,
          time_spent: 0
        },
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return this.mapUserProgressItem(data)
  }

  /**
   * Atualizar progresso da missão
   */
  async updateMissionProgress(
    userId: string,
    missionId: string,
    progress: Partial<UserMissionProgress>
  ): Promise<UserMissionProgress> {
    const { data, error } = await supabase
      .from('mission_attempts')
      .update({
        // Campos que existem na tabela mission_attempts
        status: progress.status as any,
        score: (progress as any).score ?? undefined,
        xp_earned: (progress as any).xpEarned ?? undefined,
        progress_data: (progress as any).progressData ?? undefined,
        completed_at: (progress as any).completedAt ? new Date().toISOString() : undefined,
      })
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[updateMissionProgress] Falha ao atualizar alguns campos, tentando fallback:', error?.message)
      // Fallback: atualizar apenas campos seguros
      const { data: safeData, error: safeErr } = await supabase
        .from('mission_attempts')
        .update({
          status: progress.status as any,
        })
        .eq('user_id', userId)
        .eq('mission_id', missionId)
        .select()
        .maybeSingle()

      if (safeErr) throw safeErr
      return this.mapUserProgressItem(safeData as any)
    }

    return this.mapUserProgressItem(data as any)
  }

  /**
   * Completar objetivo (append em objectives_completed)
   */
  async completeObjective(userId: string, missionId: string, objectiveId: string): Promise<UserMissionProgress> {
    // Buscar progresso atual
    const { data: existing, error: getErr } = await supabase
      .from('mission_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .maybeSingle()

    if (getErr) throw getErr

    const prevObjectives: string[] = (existing as any)?.progress_data?.objectives_completed || []
    const updatedObjectives = Array.from(new Set([...prevObjectives, objectiveId]))

    // Tentar atualizar objetivos no progress_data
    const { data, error } = await supabase
      .from('mission_attempts')
      .update({
        progress_data: {
          ...(existing as any)?.progress_data || {},
          objectives_completed: updatedObjectives
        },
      })
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[completeObjective] Campo progress_data pode não existir, ignorando:', error?.message)
      // Fallback: apenas retornar o progresso atual
      return this.mapUserProgressItem(existing as any)
    }

    return this.mapUserProgressItem(data as any)
  }

  /**
   * Registrar execução de comando no terminal e acumular pontuação
   */
  async logCommand(userId: string, missionId: string, log: CommandExecutionLog): Promise<UserMissionProgress> {
    // Buscar progresso atual
    const { data: existing, error: getErr } = await supabase
      .from('mission_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .maybeSingle()

    if (getErr) throw getErr

    const prevLogs: CommandExecutionLog[] = (existing as any)?.progress_data?.commands_executed || []
    const prevScore: number = (existing as any)?.score || 0

    const updatedLogs = [...prevLogs, log]
    const updatedScore = prevScore + (log.isCorrect ? (log.pointsEarned || 0) : 0)

    // Tentar atualizar logs e score
    const { data, error } = await supabase
      .from('mission_attempts')
      .update({
        score: updatedScore,
        progress_data: {
          ...(existing as any)?.progress_data || {},
          commands_executed: updatedLogs
        },
      })
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[logCommand] Alguns campos podem não existir, aplicando fallback:', error?.message)
      // Fallback: atualizar apenas score
      const { data: safeData, error: safeErr } = await supabase
        .from('mission_attempts')
        .update({ score: updatedScore })
        .eq('user_id', userId)
        .eq('mission_id', missionId)
        .select()
        .maybeSingle()
      if (safeErr) throw safeErr
      // Retornar objeto com score atualizado em memória
      const mapped = this.mapUserProgressItem(safeData as any)
      mapped.score = updatedScore
      mapped.commandsExecuted = updatedLogs
      return mapped
    }

    return this.mapUserProgressItem(data as any)
  }

  /**
   * Finalizar missão
   */
  async completeMission(userId: string, missionId: string, score: number): Promise<MissionResult> {
    // Atualizar status da missão
    const { data, error } = await supabase
      .from('mission_attempts')
      .update({
        status: MISSION_STATUS.COMPLETED,
        score: score,
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[completeMission] Falha ao atualizar alguns campos; continuando com cálculo de resultado:', error?.message)
    }

    // Buscar missão para calcular XP (fallback para 100 xp)
    let xp = 100
    let totalObjectives = 0
    try {
      const mission = await this.getMissionById(missionId)
      xp = mission.xpReward || xp
      totalObjectives = mission.objectives?.length || 0
    } catch {}

    // Montar resultado
    const result: MissionResult = {
      missionId,
      userId,
      score,
      maxScore: 100,
      percentage: Math.min(100, Math.max(0, score)),
      timeSpent: (data as any)?.progress_data?.time_spent || 0,
      xpEarned: xp,
      badgesEarned: [],
      objectivesCompleted: (data as any)?.progress_data?.objectives_completed?.length || 0,
      totalObjectives,
      performance: {
        accuracy: 100,
        efficiency: 100,
        exploration: 100,
        hints: 0,
      },
      completedAt: new Date(),
    }

    return result
  }

  /**
   * Abandonar missão
   */
  async abandonMission(userId: string, missionId: string): Promise<void> {
    const { error } = await supabase
      .from('mission_attempts')
      .update({
        status: MISSION_STATUS.NOT_STARTED,
      })
      .eq('user_id', userId)
      .eq('mission_id', missionId)

    if (error) throw error
  }

  // ========================================================================
  // LOGS E MÉTRICAS
  // ========================================================================

  /**
   * Registrar execução de comando no terminal
   */
  async logCommandExecution(userId: string, missionId: string, log: CommandExecutionLog): Promise<void> {
    await this.logCommand(userId, missionId, log)
  }

  // ========================================================================
  // MAPEAMENTO
  // ========================================================================

  private mapMission(row: any): Mission {
    return {
      id: row.id,
      title: row.title,
      description: row.description || '',
      category: row.category,
      categoryIcon: this.getCategoryIcon(row.category),
      difficultyLevel: this.mapDifficultyLevel(row.difficulty),
      difficulty: row.difficulty || 'Iniciante',
      xpReward: row.xp_reward || row.experience_reward || 0,
      requiredBadge: row.required_badge,
      isLocked: !!row.is_locked,
      badgeOnCompletion: row.badge_on_completion || row.badge_reward || '',
      duration: this.formatDuration(row.duration_minutes || row.estimated_time || 30),
      durationMinutes: row.duration_minutes || row.estimated_time || 30,
      tools: row.tools || [],
      prerequisites: row.prerequisites || [],
      isPremium: !!row.is_premium,
      image: row.image_url,
      progress: 0,
      status: 'not_started' as any,
      objectives: row.objectives || [],
      terminalCommands: row.terminal_commands || [],
      badges: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  private getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'cybersecurity': '🛡️',
      'Firewall': '🔥',
      'Cloud Security': '☁️',
      'Forensics': '🔍',
      'Network Security': '🌐',
      'Penetration Testing': '🎯',
      'Incident Response': '🚨',
      'programming': '💻',
      'design': '🎨',
      'business': '💼',
      'marketing': '📈',
      'general': '📚'
    }
    return icons[category] || '📚'
  }

  private mapDifficultyLevel(difficulty: string): any {
    const mapping: Record<string, string> = {
      'easy': 'BEGINNER',
      'medium': 'INTERMEDIATE', 
      'hard': 'ADVANCED',
      'intermediate': 'INTERMEDIATE',
      'advanced': 'ADVANCED',
      'expert': 'EXPERT',
      'Iniciante': 'BEGINNER',
      'Intermediário': 'INTERMEDIATE',
      'Avançado': 'ADVANCED'
    }
    return mapping[difficulty] || 'BEGINNER'
  }

  private formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) return `${hours}h`
    return `${hours}h ${remainingMinutes}min`
  }

  private mapMissions(rows: any[]): Mission[] {
    return rows.map((r) => this.mapMission(r))
  }

  private mapUserProgressItem(row: any): UserMissionProgress {
    return {
      id: row.id,
      userId: row.user_id,
      missionId: row.mission_id,
      status: row.status,
      score: row.score || 0,
      maxScore: 100, // Valor padrão
      timeSpentMinutes: row.progress_data?.time_spent || 0,
      xpEarned: 0, // Não existe na tabela atual
      startedAt: row.started_at,
      completedAt: row.completed_at,
      attempts: 1, // Valor padrão
      bestScore: row.score || 0,
      objectivesCompleted: row.progress_data?.objectives_completed || [],
      commandsExecuted: row.progress_data?.commands_executed || [],
      createdAt: row.started_at, // Usar started_at como fallback
      updatedAt: row.completed_at || row.started_at, // Usar completed_at ou started_at como fallback
    }
  }

  private mapUserProgress(rows: any[]): UserMissionProgress[] {
    return rows.map((r) => this.mapUserProgressItem(r))
  }
}

export const missionService = new MissionService()


export const getAllMissions = () => missionService.getAllMissions()
export const getUserProgress = (userId: string) => missionService.getUserProgress(userId)
export const startMission = (userId: string, missionId: string) => missionService.startMission(userId, missionId)
export const getMissionById = (id: string) => missionService.getMissionById(id)
export const updateMissionProgress = (userId: string, missionId: string, progress: Partial<UserMissionProgress>) => 
  missionService.updateMissionProgress(userId, missionId, progress)
export const completeMission = (userId: string, missionId: string, score: number) => 
  missionService.completeMission(userId, missionId, score)
export const logCommandExecution = (userId: string, missionId: string, log: CommandExecutionLog) => 
  missionService.logCommandExecution(userId, missionId, log)

export default missionService

