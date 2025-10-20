/**
 * Terminal Principal para Missões
 * Baseado em paineis/src/pages/mission-gameplay/components/SimulatorTerminal.jsx
 */

import React, { useState, useEffect } from 'react'
import { TerminalCommand } from './terminal/TerminalCommand'
import { Mission, MissionCategory } from '@/types/gamification'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Target, 
  Zap, 
  Clock, 
  Trophy, 
  AlertCircle,
  CheckCircle,
  Play,
  RotateCcw
} from 'lucide-react'

interface MissionTerminalProps {
  mission: Mission
  onMissionComplete: (score: number, timeSpent: number) => void
  onMissionProgress: (progress: number) => void
  className?: string
}

export const MissionTerminal: React.FC<MissionTerminalProps> = ({
  mission,
  onMissionComplete,
  onMissionProgress,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [totalScore, setTotalScore] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])

  // Inicializar tempo quando a missão começar
  useEffect(() => {
    if (!startTime) {
      setStartTime(new Date())
    }
  }, [])

  const handleCommandExecute = (command: string, isCorrect: boolean, output: string, points: number) => {
    // Adicionar comando ao histórico
    setCommandHistory(prev => [...prev, command])
    
    // Se o comando está correto, marcar passo como completo
    if (isCorrect && !completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep])
      setTotalScore(prev => prev + points)
      
      // Avançar para o próximo passo
      if (currentStep < mission.objectives.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        // Missão completa
        setIsCompleted(true)
        const timeSpent = startTime ? (Date.now() - startTime.getTime()) / 1000 : 0
        onMissionComplete(totalScore + points, timeSpent)
      }
      
      // Atualizar progresso
      const progress = ((completedSteps.length + 1) / mission.objectives.length) * 100
      onMissionProgress(progress)
    }
  }

  const resetMission = () => {
    setCurrentStep(0)
    setCompletedSteps([])
    setTotalScore(0)
    setStartTime(new Date())
    setIsCompleted(false)
    setCommandHistory([])
  }

  const getCurrentObjective = () => {
    return mission.objectives[currentStep] || mission.objectives[0]
  }

  const getProgressPercentage = () => {
    return (completedSteps.length / mission.objectives.length) * 100
  }

  const getTimeSpent = () => {
    if (!startTime) return 0
    return Math.floor((Date.now() - startTime.getTime()) / 1000)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mission Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>{mission.title}</span>
                {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{mission.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {mission.category.replace(/_/g, ' ')}
              </Badge>
              <Badge variant="outline">
                {mission.difficulty}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso da Missão</span>
                <span className="text-sm text-muted-foreground">
                  {completedSteps.length}/{mission.objectives.length} objetivos
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-amber-600 dark:text-amber-400">
                  <Zap className="h-4 w-4" />
                  <span className="font-semibold">{totalScore}</span>
                </div>
                <p className="text-xs text-muted-foreground">XP Ganho</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-blue-600 dark:text-blue-400">
                  <Clock className="h-4 w-4" />
                  <span className="font-semibold">{formatTime(getTimeSpent())}</span>
                </div>
                <p className="text-xs text-muted-foreground">Tempo</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-green-600 dark:text-green-400">
                  <Trophy className="h-4 w-4" />
                  <span className="font-semibold">{commandHistory.length}</span>
                </div>
                <p className="text-xs text-muted-foreground">Comandos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Objective */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <span>Objetivo Atual</span>
            <Badge variant="outline">
              {currentStep + 1}/{mission.objectives.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h4 className="font-medium">{getCurrentObjective().title}</h4>
            <p className="text-sm text-muted-foreground">{getCurrentObjective().description}</p>
            {getCurrentObjective().expectedCommand && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Comando esperado:</p>
                <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                  {getCurrentObjective().expectedCommand}
                </code>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Terminal */}
      <Card className="h-96">
        <CardContent className="p-0 h-full">
          <TerminalCommand
            missionCategory={mission.category}
            onCommandExecute={handleCommandExecute}
            currentStep={currentStep}
            totalSteps={mission.objectives.length}
            className="h-full"
          />
        </CardContent>
      </Card>

      {/* Mission Complete */}
      {isCompleted && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                  Missão Concluída!
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {totalScore}
                  </div>
                  <p className="text-sm text-muted-foreground">XP Ganho</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatTime(getTimeSpent())}
                  </div>
                  <p className="text-sm text-muted-foreground">Tempo Total</p>
                </div>
              </div>
              <div className="flex justify-center space-x-2">
                <Button onClick={resetMission} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Repetir Missão
                </Button>
                <Button onClick={() => window.history.back()} size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Nova Missão
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
