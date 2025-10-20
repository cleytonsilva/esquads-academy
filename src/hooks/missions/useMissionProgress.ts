/**
 * Hook para gerenciamento de progresso de missões
 */

import { useState, useCallback } from 'react'
import {
  CommandExecutionLog,
  MissionResult,
} from '@/types/gamification'
import { MISSION_STATUS } from '@/utils/constants'
import { UserMissionProgress } from '@/types/missions'
import { missionService } from '@/services/missionService'
import { useToast } from '@/hooks/use-toast'

interface UseMissionProgressReturn {
  progress: UserMissionProgress | null
  loading: boolean
  error: string | null
  startMission: (missionId: string) => Promise<void>
  executeCommand: (command: string, output: string, isCorrect: boolean, points: number) => Promise<void>
  completeObjective: (objectiveId: string) => Promise<void>
  completeMission: (score: number) => Promise<MissionResult>
  abandonMission: () => Promise<void>
}

export const useMissionProgress = (
  userId: string,
  missionId: string
): UseMissionProgressReturn => {
  const [progress, setProgress] = useState<UserMissionProgress | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Iniciar missão
  const startMission = useCallback(async (mId: string) => {
    try {
      setLoading(true)
      setError(null)

      const newProgress = await missionService.startMission(userId, mId)
      setProgress(newProgress)

      toast({
        title: 'Missão iniciada!',
        description: 'Boa sorte na sua missão!',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao iniciar missão'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [userId, toast])

  // Executar comando
  const executeCommand = useCallback(async (
    command: string,
    output: string,
    isCorrect: boolean,
    points: number
  ) => {
    if (!progress) return

    try {
      const commandLog: CommandExecutionLog = {
        command,
        timestamp: new Date(),
        output,
        isCorrect,
        pointsEarned: isCorrect ? points : 0,
      }

      const updatedProgress = await missionService.logCommand(
        userId,
        missionId,
        commandLog
      )

      setProgress(updatedProgress)

      if (isCorrect && points > 0) {
        toast({
          title: 'Comando correto!',
          description: `+${points} pontos`,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao executar comando'
      console.error(errorMessage, err)
    }
  }, [userId, missionId, progress, toast])

  // Completar objetivo
  const completeObjective = useCallback(async (objectiveId: string) => {
    if (!progress) return

    try {
      const updatedProgress = await missionService.completeObjective(
        userId,
        missionId,
        objectiveId
      )

      setProgress(updatedProgress)

      toast({
        title: 'Objetivo completado!',
        description: 'Continue assim!',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao completar objetivo'
      console.error(errorMessage, err)
    }
  }, [userId, missionId, progress, toast])

  // Completar missão
  const completeMission = useCallback(async (score: number): Promise<MissionResult> => {
    if (!progress) {
      throw new Error('Nenhum progresso encontrado')
    }

    try {
      setLoading(true)

      const result = await missionService.completeMission(userId, missionId, score)

      setProgress((prev) =>
        prev
          ? {
              ...prev,
              status: MISSION_STATUS.COMPLETED,
              score,
              completedAt: new Date(),
            }
          : null
      )

      toast({
        title: 'Missão completada!',
        description: `Você ganhou ${result.xpEarned} XP!`,
      })

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao completar missão'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [userId, missionId, progress, toast])

  // Abandonar missão
  const abandonMission = useCallback(async () => {
    if (!progress) return

    try {
      await missionService.abandonMission(userId, missionId)

      setProgress((prev) =>
        prev
          ? {
              ...prev,
              status: MISSION_STATUS.NOT_STARTED,
            }
          : null
      )

      toast({
        title: 'Missão abandonada',
        description: 'Você pode tentar novamente quando quiser.',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao abandonar missão'
      console.error(errorMessage, err)
    }
  }, [userId, missionId, progress, toast])

  return {
    progress,
    loading,
    error,
    startMission,
    executeCommand,
    completeObjective,
    completeMission,
    abandonMission,
  }
}

