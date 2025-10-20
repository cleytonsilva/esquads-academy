/**
 * Página de Resultados de Missão
 * Mostra performance, XP ganho e badges conquistadas
 */

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { missionService } from '@/services/missionService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Star,
  Clock,
  Zap,
  Target,
  TrendingUp,
  Share2,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { Mission, MissionResult as MissionResultType } from '@/types/gamification'

export const MissionResult: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [mission, setMission] = useState<Mission | null>(null)
  const [result, setResult] = useState<MissionResultType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadResults = async () => {
      if (!id || !user) return

      try {
        setLoading(true)
        
        // Carregar missão
        const missionData = await missionService.getMissionById(id)
        setMission(missionData)

        // Buscar progresso/resultado
        const progress = await missionService.getMissionProgress(user.id, id)
        
        if (progress && progress.completedAt) {
          // Criar resultado mockado baseado no progresso
          const mockResult: MissionResultType = {
            missionId: id,
            userId: user.id,
            score: progress.score,
            maxScore: 100,
            percentage: progress.score,
            timeSpent: progress.timeSpentMinutes,
            xpEarned: progress.xpEarned,
            badgesEarned: [], // TODO: Integrar com sistema de badges
            objectivesCompleted: progress.objectivesCompleted.length,
            totalObjectives: missionData.objectives.length,
            performance: {
              accuracy: 85, // Mock
              efficiency: 90, // Mock
              exploration: 15, // Mock
              hints: 2, // Mock
            },
            completedAt: progress.completedAt,
          }
          
          setResult(mockResult)

          // TODO: Adicionar confetti quando canvas-confetti estiver instalado
          // if (progress.score >= 70) {
          //   confetti({
          //     particleCount: 100,
          //     spread: 70,
          //     origin: { y: 0.6 },
          //   })
          // }
        }
      } catch (error) {
        console.error('Erro ao carregar resultados:', error)
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [id, user])

  const handleRetry = () => {
    navigate(`/student/missions/${id}/play`)
  }

  const handleNextMission = () => {
    navigate('/student/missions')
  }

  const handleShare = () => {
    // TODO: Implementar compartilhamento
    console.log('Compartilhar resultado')
  }

  if (loading || !mission || !result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando resultados...</p>
        </div>
      </div>
    )
  }

  const isPassed = result.percentage >= 70
  const isExcellent = result.percentage >= 90

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      {/* Celebration Header */}
      <Card className={`${isPassed ? 'border-green-500' : 'border-amber-500'}`}>
        <CardContent className="pt-8 pb-6 text-center">
          <div
            className={`w-20 h-20 rounded-full ${
              isPassed ? 'bg-green-500' : 'bg-amber-500'
            } mx-auto mb-4 flex items-center justify-center`}
          >
            {isExcellent ? (
              <Trophy className="h-10 w-10 text-white" />
            ) : isPassed ? (
              <CheckCircle2 className="h-10 w-10 text-white" />
            ) : (
              <Star className="h-10 w-10 text-white" />
            )}
          </div>

          <h1 className="text-3xl font-bold mb-2">
            {isExcellent ? 'Desempenho Excepcional!' : isPassed ? 'Missão Completada!' : 'Boa Tentativa!'}
          </h1>
          <p className="text-muted-foreground text-lg">{mission.title}</p>

          <div className="flex items-center justify-center space-x-8 mt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{result.percentage.toFixed(0)}%</div>
              <p className="text-sm text-muted-foreground">Pontuação Final</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600">{result.xpEarned}</div>
              <p className="text-sm text-muted-foreground">XP Ganho</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Performance</CardTitle>
          <CardDescription>Veja como você se saiu em cada aspecto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Accuracy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Precisão dos Comandos</span>
              <span className="text-sm text-muted-foreground">{result.performance.accuracy}%</span>
            </div>
            <Progress value={result.performance.accuracy} />
          </div>

          {/* Efficiency */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Eficiência de Tempo</span>
              <span className="text-sm text-muted-foreground">{result.performance.efficiency}%</span>
            </div>
            <Progress value={result.performance.efficiency} />
          </div>

          {/* Exploration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Exploração</span>
              <span className="text-sm text-muted-foreground">
                {result.performance.exploration} comandos únicos
              </span>
            </div>
            <Progress value={(result.performance.exploration / 20) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Target className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">{result.objectivesCompleted}/{result.totalObjectives}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">Objetivos</p>
            <p className="text-xs text-muted-foreground">Completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">{result.timeSpent}min</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">Tempo</p>
            <p className="text-xs text-muted-foreground">Gasto na missão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">{result.performance.hints}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">Dicas</p>
            <p className="text-xs text-muted-foreground">Utilizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">{result.score.toFixed(0)}pts</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">Pontuação</p>
            <p className="text-xs text-muted-foreground">Total alcançada</p>
          </CardContent>
        </Card>
      </div>

      {/* Badges Earned */}
      {result.badgesEarned.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conquistas Desbloqueadas</CardTitle>
            <CardDescription>Parabéns pelas novas badges!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {result.badgesEarned.map((badgeId) => (
                <div
                  key={badgeId}
                  className="p-4 border rounded-lg text-center hover:border-primary transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 mx-auto mb-2 flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm font-medium">Nova Badge</p>
                  <p className="text-xs text-muted-foreground">{badgeId}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={handleRetry} className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
        <Button variant="outline" onClick={handleShare} className="flex-1">
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar Resultado
        </Button>
        <Button onClick={handleNextMission} className="flex-1">
          <ArrowRight className="h-4 w-4 mr-2" />
          Próxima Missão
        </Button>
      </div>
    </div>
  )
}

