/**
 * Página Unificada de Resultados
 * Combina resultados de missões e simulados com análise por IA
 */

import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Award,
  Download,
  Share2,
  RotateCcw,
  ArrowRight,
  Brain,
  Lightbulb,
  BookOpen,
  Users,
  Star,
  Zap,
  Heart,
  BarChart3,
  PieChart,
  Calendar,
  MessageCircle,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

interface ResultsData {
  type: 'mission' | 'simulation'
  id: string
  title: string
  score: number
  maxScore: number
  percentage: number
  passed: boolean
  timeSpent: number
  xpEarned: number
  badgesEarned: string[]
  completedAt: string
  questions?: any[]
  answers?: Record<string, any>
  performance?: {
    accuracy: number
    efficiency: number
    exploration: number
    hints: number
  }
}

interface AIAnalysis {
  overallPerformance: 'excellent' | 'good' | 'needs_improvement'
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  nextSteps: string[]
  personalizedTips: string[]
}

interface SocialShare {
  type: 'badge' | 'certificate' | 'achievement'
  title: string
  description: string
  imageUrl?: string
  shareUrl: string
}

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [resultsData, setResultsData] = useState<ResultsData | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [socialShares, setSocialShares] = useState<SocialShare[]>([])
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    const loadResults = async () => {
      if (!id || !user) return

      try {
        setLoading(true)

        // Obter dados dos resultados da navegação
        const stateData = location.state as any
        if (stateData) {
          const data: ResultsData = {
            type: stateData.type || 'simulation',
            id: id,
            title: stateData.title || 'Exame',
            score: stateData.score || 0,
            maxScore: stateData.totalQuestions || 100,
            percentage: stateData.score || 0,
            passed: stateData.passed || false,
            timeSpent: stateData.timeSpent || 0,
            xpEarned: stateData.xpEarned || 0,
            badgesEarned: stateData.badgesEarned || [],
            completedAt: new Date().toISOString(),
            questions: stateData.questions || [],
            answers: stateData.answers || {},
            performance: stateData.performance || {
              accuracy: stateData.score || 0,
              efficiency: 85,
              exploration: 10,
              hints: 2
            }
          }

          setResultsData(data)

          // Gerar análise por IA (simulada por enquanto)
          const analysis = await generateAIAnalysis(data)
          setAiAnalysis(analysis)

          // Gerar opções de compartilhamento social
          const shares = generateSocialShares(data)
          setSocialShares(shares)

        } else {
          // Fallback: carregar dados do banco se não vierem da navegação
          // TODO: Implementar carregamento do banco de dados
          toast.error('Dados de resultados não encontrados')
          navigate('/student')
        }

      } catch (error) {
        console.error('Erro ao carregar resultados:', error)
        toast.error('Erro ao carregar resultados')
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [id, user, location.state, navigate])

  const generateAIAnalysis = async (data: ResultsData): Promise<AIAnalysis> => {
    // Simular análise por IA
    await new Promise(resolve => setTimeout(resolve, 1000))

    const performance = data.percentage >= 90 ? 'excellent' : 
                       data.percentage >= 70 ? 'good' : 'needs_improvement'

    return {
      overallPerformance: performance,
      strengths: [
        'Demonstrou boa compreensão dos conceitos fundamentais',
        'Manteve foco durante toda a atividade',
        'Utilizou estratégias eficientes de resolução'
      ],
      weaknesses: [
        'Pode melhorar na gestão de tempo',
        'Alguns conceitos avançados precisam de mais prática',
        'Considere revisar os tópicos com menor desempenho'
      ],
      recommendations: [
        'Pratique exercícios similares para consolidar o aprendizado',
        'Revise os materiais de estudo dos tópicos com menor pontuação',
        'Experimente diferentes estratégias de resolução de problemas'
      ],
      nextSteps: [
        'Complete a próxima missão da trilha',
        'Participe de simulados de certificação',
        'Explore recursos adicionais de aprendizado'
      ],
      personalizedTips: [
        'Você tem potencial para alcançar níveis mais altos!',
        'Continue praticando regularmente para manter o progresso',
        'Considere formar grupos de estudo para trocar experiências'
      ]
    }
  }

  const generateSocialShares = (data: ResultsData): SocialShare[] => {
    const shares: SocialShare[] = []

    if (data.badgesEarned.length > 0) {
      shares.push({
        type: 'badge',
        title: 'Nova Badge Conquistada!',
        description: `Acabei de conquistar uma nova badge no Esquads Academy!`,
        shareUrl: `${window.location.origin}/badge/${data.badgesEarned[0]}`
      })
    }

    if (data.passed) {
      shares.push({
        type: 'certificate',
        title: 'Certificação Conquistada!',
        description: `Acabei de passar no exame "${data.title}" com ${data.percentage}%!`,
        shareUrl: `${window.location.origin}/certificate/${data.id}`
      })
    }

    shares.push({
      type: 'achievement',
      title: 'Progresso no Esquads!',
      description: `Acabei de completar "${data.title}" e ganhei ${data.xpEarned} XP!`,
      shareUrl: `${window.location.origin}/achievement/${data.id}`
    })

    return shares
  }

  const handleRetry = () => {
    if (resultsData?.type === 'mission') {
      navigate(`/student/missions/${id}/play`)
    } else {
      navigate(`/student/simulations/exam/${id}`)
    }
  }

  const handleNext = () => {
    if (resultsData?.type === 'mission') {
      navigate('/student/missions')
    } else {
      navigate('/student/simulations')
    }
  }

  const handleShare = async (share: SocialShare) => {
    try {
      setSharing(true)

      if (navigator.share) {
        await navigator.share({
          title: share.title,
          text: share.description,
          url: share.shareUrl
        })
      } else {
        // Fallback para copiar para clipboard
        await navigator.clipboard.writeText(`${share.title}\n${share.description}\n${share.shareUrl}`)
        toast.success('Link copiado para a área de transferência!')
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
      toast.error('Erro ao compartilhar')
    } finally {
      setSharing(false)
    }
  }

  const handleDownloadCertificate = () => {
    // TODO: Implementar geração de certificado
    toast.info('Funcionalidade de certificado em desenvolvimento')
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analisando resultados...</p>
        </div>
      </div>
    )
  }

  if (!resultsData || !aiAnalysis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Resultados não encontrados</h2>
          <p className="text-muted-foreground mb-4">Não foi possível carregar os dados dos resultados.</p>
          <Button onClick={() => navigate('/student')}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const isExcellent = resultsData.percentage >= 90
  const isPassed = resultsData.percentage >= 70

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      {/* Header de Resultado */}
      <Card className={`${isPassed ? 'border-green-500' : 'border-amber-500'} border-2`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full ${
                isPassed ? 'bg-green-500' : 'bg-amber-500'
              } flex items-center justify-center`}>
                {isExcellent ? (
                  <Trophy className="h-8 w-8 text-white" />
                ) : isPassed ? (
                  <CheckCircle className="h-8 w-8 text-white" />
                ) : (
                  <Target className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isExcellent ? 'Desempenho Excepcional!' : 
                   isPassed ? 'Parabéns! Você foi aprovado!' : 'Boa tentativa!'}
                </h1>
                <p className="text-gray-600 text-lg">{resultsData.title}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant={isPassed ? "default" : "secondary"}>
                    {resultsData.type === 'mission' ? 'Missão' : 'Simulação'}
                  </Badge>
                  <Badge variant="outline">
                    {resultsData.xpEarned} XP ganho
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">
                {resultsData.percentage.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">
                {resultsData.score}/{resultsData.maxScore} pontos
              </p>
              <p className="text-sm text-gray-600">
                Tempo: {formatTime(resultsData.timeSpent)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pontuação</p>
                <p className="text-2xl font-bold text-gray-900">{resultsData.percentage.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">XP Ganho</p>
                <p className="text-2xl font-bold text-gray-900">{resultsData.xpEarned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo</p>
                <p className="text-2xl font-bold text-gray-900">{formatTime(resultsData.timeSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Badges</p>
                <p className="text-2xl font-bold text-gray-900">{resultsData.badgesEarned.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise por IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>Análise Inteligente por IA</span>
          </CardTitle>
          <CardDescription>
            Insights personalizados baseados no seu desempenho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="strengths">Pontos Fortes</TabsTrigger>
              <TabsTrigger value="improvements">Melhorias</TabsTrigger>
              <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Geral</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Desempenho</span>
                      <Badge variant={
                        aiAnalysis.overallPerformance === 'excellent' ? 'default' :
                        aiAnalysis.overallPerformance === 'good' ? 'secondary' : 'destructive'
                      }>
                        {aiAnalysis.overallPerformance === 'excellent' ? 'Excelente' :
                         aiAnalysis.overallPerformance === 'good' ? 'Bom' : 'Precisa Melhorar'}
                      </Badge>
                    </div>
                    <Progress 
                      value={
                        aiAnalysis.overallPerformance === 'excellent' ? 100 :
                        aiAnalysis.overallPerformance === 'good' ? 75 : 50
                      } 
                      className="h-3" 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Próximos Passos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {aiAnalysis.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600" />
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="strengths" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <span>Seus Pontos Fortes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiAnalysis.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="improvements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>Áreas para Melhorar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiAnalysis.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                        <span className="text-sm">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      <span>Recomendações de Estudo</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiAnalysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                          <BookOpen className="w-5 h-5 text-purple-600 mt-0.5" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <span>Dicas Personalizadas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiAnalysis.personalizedTips.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <MessageCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <span className="text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Badges Conquistadas */}
      {resultsData.badgesEarned.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span>Conquistas Desbloqueadas</span>
            </CardTitle>
            <CardDescription>Parabéns pelas novas badges!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {resultsData.badgesEarned.map((badgeId) => (
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

      {/* Compartilhamento Social */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <span>Compartilhar Conquista</span>
          </CardTitle>
          <CardDescription>Compartilhe seu progresso com a comunidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {socialShares.map((share, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  {share.type === 'badge' && <Award className="w-5 h-5 text-yellow-600" />}
                  {share.type === 'certificate' && <Trophy className="w-5 h-5 text-green-600" />}
                  {share.type === 'achievement' && <Star className="w-5 h-5 text-blue-600" />}
                  <h3 className="font-medium">{share.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{share.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(share)}
                  disabled={sharing}
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        {resultsData.passed && (
          <Button onClick={handleDownloadCertificate} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Baixar Certificado
          </Button>
        )}
        
        <Button variant="outline" onClick={handleRetry} className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
        
        <Button onClick={handleNext} className="flex-1">
          <ArrowRight className="h-4 w-4 mr-2" />
          {resultsData.type === 'mission' ? 'Próxima Missão' : 'Próximo Simulado'}
        </Button>
      </div>
    </div>
  )
}
