/**
 * Página de Gameplay de Missão
 * Interface completa para executar missões com terminal e bot
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { missionService } from '@/services/missionService'
import { useMissionProgress } from '@/hooks/missions/useMissionProgress'
import { MissionTerminal } from '@/components/missions/MissionTerminal'
import { BotGuidancePanel } from '@/components/missions/BotGuidancePanel'
import MissionHUD from '@/components/missions/gameplay/MissionHUD'
import SimulatorTerminal from '@/components/missions/gameplay/SimulatorTerminal'
import ObjectiveTracker from '@/components/missions/gameplay/ObjectiveTracker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Target,
  Clock,
  Zap,
  CheckCircle2,
  Circle,
  AlertCircle,
  Trophy,
} from 'lucide-react'
import { Mission, MissionObjective } from '@/types/gamification'
import { MISSION_TYPES } from '@/utils/constants'
import { useToast } from '@/hooks/use-toast'

export const MissionPlay: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [lastCommand, setLastCommand] = useState<string>()
  const [commandResult, setCommandResult] = useState<{ isCorrect: boolean; output: string }>()

  const {
    progress,
    startMission,
    executeCommand,
    completeObjective,
    completeMission,
    abandonMission,
  } = useMissionProgress(user?.id || '', id || '')

  // Carregar missão
  useEffect(() => {
    const loadMission = async () => {
      if (!id) return

      try {
        setLoading(true)
        const missionData = await missionService.getMissionById(id)
        setMission(missionData)

        // Se não tiver progresso, iniciar missão
        if (!progress) {
          await startMission(id)
        }
      } catch (error) {
        console.error('Erro ao carregar missão:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a missão',
          variant: 'destructive',
        })
        navigate('/student/missions')
      } finally {
        setLoading(false)
      }
    }

    loadMission()
  }, [id])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleCommandExecute = async (
    command: string,
    isCorrect: boolean,
    output: string,
    points: number
  ) => {
    setLastCommand(command)
    setCommandResult({ isCorrect, output })

    if (isCorrect && points > 0) {
      await executeCommand(command, output, isCorrect, points)

      // Verificar se completou um objetivo
      const currentObjective = mission?.objectives[currentStep - 1]
      if (currentObjective) {
        await completeObjective(currentObjective.id)
        
        // Avançar para próximo passo
        if (currentStep < (mission?.objectives.length || 0)) {
          setCurrentStep((prev) => prev + 1)
        } else {
          // Missão completada
          await handleMissionComplete()
        }
      }
    }
  }

  const handleMissionComplete = async () => {
    if (!mission || !progress) return

    try {
      const finalScore = Math.round((progress.score / mission.objectives.reduce((sum, obj) => sum + (obj.criteria?.points || 0), 0)) * 100)
      
      const result = await completeMission(finalScore)

      toast({
        title: 'Missão Completada! 🎉',
        description: `Você ganhou ${result.xpEarned} XP!`,
      })

      // Navegar para página de resultados
      navigate(`/student/missions/${mission.id}/result`)
    } catch (error) {
      console.error('Erro ao completar missão:', error)
    }
  }

  const handleMissionProgress = (progressPercentage: number) => {
    console.log('Progress:', progressPercentage)
    // TODO: Implementar lógica de progresso se necessário
  }

  const handleAbandon = async () => {
    if (!confirm('Tem certeza que deseja abandonar esta missão? O progresso será perdido.')) {
      return
    }

    await abandonMission()
    navigate('/student/missions')
  }

  const handleHintRequest = (step: number) => {
    // TODO: Integrar com sistema de dicas IA
    console.log('Dica solicitada para passo:', step)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const calculateProgress = (): number => {
    if (!mission || !progress) return 0
    const totalPoints = mission.objectives.reduce((sum, obj) => sum + (obj.criteria?.points || 0), 0)
    return totalPoints > 0 ? (progress.score / totalPoints) * 100 : 0
  }

  if (loading || !mission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando missão...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Mission HUD - Sempre presente */}
      <MissionHUD
        missionData={{
          title: mission.title,
          category: mission.category
        }}
        currentXP={progress?.score || 0}
        livesRemaining={3}
        maxLives={5}
        missionProgress={calculateProgress()}
        timeElapsed={timeElapsed}
        isPaused={false}
        onPause={() => {/* TODO: Implementar pausa */}}
        onExit={() => navigate('/student/missions')}
        userPlan="free"
      />

      {/* Main Gameplay Area - Adaptativa baseada no tipo */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Objectives (sempre presente) */}
        <div className="w-80 bg-white border-r border-gray-200 p-4">
          <ObjectiveTracker
            objectives={mission.objectives}
            currentStep={currentStep}
            completedObjectives={progress?.objectivesCompleted || []}
            onHintRequest={handleHintRequest}
          />
        </div>

        {/* Center - Interface Adaptativa */}
        <div className="flex-1 flex flex-col">
          {renderMissionInterface()}
        </div>

        {/* Right Sidebar - Bot Guidance (sempre presente) */}
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <BotGuidancePanel
            mission={mission}
            currentStep={currentStep}
            lastCommand={lastCommand}
            commandResult={commandResult}
            userProgress={calculateProgress()}
            onHintRequest={handleHintRequest}
          />
        </div>
      </div>
    </div>
  )

  // Função para renderizar interface baseada no tipo da missão
  function renderMissionInterface() {
    const missionType = mission.mission_type || MISSION_TYPES.TERMINAL

    switch (missionType) {
      case MISSION_TYPES.TERMINAL:
        return (
          <div className="flex-1 bg-black text-green-400 font-mono">
            <SimulatorTerminal
              missionData={{
                title: mission.title,
                category: mission.category
              }}
              onCommandExecute={handleCommandExecute}
              onProgressUpdate={handleMissionProgress}
              currentStep={currentStep}
              isLoading={actionLoading}
            />
          </div>
        )

      case MISSION_TYPES.WEB_INTERFACE:
        return (
          <div className="flex-1 bg-white p-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Interface Web - {mission.title}</CardTitle>
                <CardDescription>
                  Configure os parâmetros conforme os objetivos da missão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">🌐</div>
                    <h3 className="text-xl font-semibold mb-2">Interface Web</h3>
                    <p>Esta missão será implementada em breve</p>
                    <p className="text-sm">Tipo: {mission.mission_type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case MISSION_TYPES.CHAT_TEXTUAL:
        return (
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 p-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Chat Textual - {mission.title}</CardTitle>
                <CardDescription>
                  Interaja com a IA para completar esta missão narrativa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-semibold mb-2">Chat Textual</h3>
                    <p>Esta missão será implementada em breve</p>
                    <p className="text-sm">Tipo: {mission.mission_type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return (
          <div className="flex-1 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-xl font-semibold mb-2">Tipo de Missão Desconhecido</h3>
              <p>Tipo: {missionType}</p>
            </div>
          </div>
        )
    }
  }
}

