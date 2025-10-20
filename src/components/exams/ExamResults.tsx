/**
 * Exam Results Component
 * Componente para exibir resultados de exames
 * Baseado na arquitetura técnica de Arquitetura_Tecnica_Missoes_Simulados.md
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  TrendingUp,
  TrendingDown,
  Award,
  Download,
  Share2,
  RotateCcw,
  Eye,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react'
import { QuestionDisplay } from './QuestionDisplay'
import {
  Exam,
  ExamAttempt,
  ExamQuestion,
  ExamAnswer,
  ExamResult,
  QuestionAnalysis,
  TimeDistribution,
  CertificationType
} from '@/types/exams'

export interface ExamResultsProps {
  exam: Exam
  attempt: ExamAttempt
  result: ExamResult
  questions: ExamQuestion[]
  answers: Record<string, ExamAnswer>
  questionAnalysis: QuestionAnalysis[]
  timeDistribution: TimeDistribution
  onRetakeExam?: () => void
  onDownloadCertificate?: () => void
  onShareResult?: () => void
  className?: string
}

export const ExamResults: React.FC<ExamResultsProps> = ({
  exam,
  attempt,
  result,
  questions,
  answers,
  questionAnalysis,
  timeDistribution,
  onRetakeExam,
  onDownloadCertificate,
  onShareResult,
  className = ''
}) => {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null)

  // Estatísticas calculadas
  const correctAnswers = questionAnalysis.filter(q => q.isCorrect).length
  const incorrectAnswers = questionAnalysis.filter(q => !q.isCorrect).length
  const totalQuestions = questions.length
  const accuracyPercentage = (correctAnswers / totalQuestions) * 100

  // Formatação de tempo
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  // Determinar status do resultado
  const getResultStatus = () => {
    if (result.passed) {
      return {
        status: 'passed',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <Trophy className="w-8 h-8 text-green-600" />
      }
    } else {
      return {
        status: 'failed',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <Target className="w-8 h-8 text-red-600" />
      }
    }
  }

  const resultStatus = getResultStatus()

  // Análise por categoria/tópico
  const categoryAnalysis = questionAnalysis.reduce((acc, analysis) => {
    const category = questions.find(q => q.id === analysis.questionId)?.topic || 'Geral'
    if (!acc[category]) {
      acc[category] = { correct: 0, total: 0 }
    }
    acc[category].total++
    if (analysis.isCorrect) {
      acc[category].correct++
    }
    return acc
  }, {} as Record<string, { correct: number; total: number }>)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header de Resultado */}
      <Card className={`${resultStatus.bgColor} ${resultStatus.borderColor} border-2`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {resultStatus.icon}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {result.passed ? 'Parabéns! Você foi aprovado!' : 'Não foi desta vez'}
                </h1>
                <p className="text-gray-600">
                  {exam.title} - Tentativa {attempt.attemptNumber}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {result.percentage.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">
                Nota mínima: {exam.passingScore}%
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
                <p className="text-sm font-medium text-gray-600">Corretas</p>
                <p className="text-2xl font-bold text-gray-900">{correctAnswers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Incorretas</p>
                <p className="text-2xl font-bold text-gray-900">{incorrectAnswers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(attempt.timeSpent * 60)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Precisão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accuracyPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-center space-x-4">
        {result.passed && onDownloadCertificate && (
          <Button onClick={onDownloadCertificate} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Baixar Certificado
          </Button>
        )}
        
        {onShareResult && (
          <Button variant="outline" onClick={onShareResult}>
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        )}

        {onRetakeExam && attempt.attemptNumber < exam.maxAttempts && (
          <Button variant="outline" onClick={onRetakeExam}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        )}
      </div>

      {/* Análise Detalhada */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="questions">Questões</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progresso Geral */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progresso Geral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Questões Corretas</span>
                    <span>{correctAnswers}/{totalQuestions}</span>
                  </div>
                  <Progress value={accuracyPercentage} className="h-3" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Nota Obtida</span>
                    <span>{result.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={result.percentage} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Nota Mínima</span>
                    <span>{exam.passingScore}%</span>
                  </div>
                  <Progress value={exam.passingScore} className="h-3 bg-gray-200" />
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Tempo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribuição de Tempo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Respostas Rápidas (&lt; 30s)</span>
                    <Badge variant="outline">{timeDistribution.fastAnswers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Respostas Normais (30s - 2min)</span>
                    <Badge variant="outline">{timeDistribution.normalAnswers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Respostas Lentas (&gt; 2min)</span>
                    <Badge variant="outline">{timeDistribution.slowAnswers}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-sm">Tempo Médio por Questão</span>
                    <span className="text-sm">{formatTime(timeDistribution.averageTime)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revisão de Questões */}
        <TabsContent value="questions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Lista de Questões */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Questões</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {questions.map((question, index) => {
                    const analysis = questionAnalysis.find(a => a.questionId === question.id)
                    const isSelected = selectedQuestionIndex === index
                    
                    return (
                      <Button
                        key={question.id}
                        variant={isSelected ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedQuestionIndex(index)}
                        className={`
                          w-full justify-start text-left h-auto p-3
                          ${analysis?.isCorrect ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}
                        `}
                      >
                        <div className="flex items-center space-x-2 w-full">
                          {analysis?.isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm">Questão {index + 1}</span>
                        </div>
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Questão Selecionada */}
            <div className="lg:col-span-3">
              {selectedQuestionIndex !== null && (
                <QuestionDisplay
                  question={questions[selectedQuestionIndex]}
                  selectedAnswer={answers[questions[selectedQuestionIndex].id]?.selectedOptions[0]}
                  onAnswerSelect={() => {}} // Readonly no modo de revisão
                  isReviewMode={true}
                  showExplanation={true}
                />
              )}
              {selectedQuestionIndex === null && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Selecione uma questão para revisar
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Comparação com Média */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comparação com a Média</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sua Nota</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{result.percentage.toFixed(1)}%</span>
                      {result.percentage > 75 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Média Geral</span>
                    <span className="text-gray-600">72.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Seu Tempo</span>
                    <span className="font-medium">{formatTime(attempt.timeSpent * 60)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tempo Médio</span>
                    <span className="text-gray-600">{formatTime(exam.duration * 60 * 0.8)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Tentativas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Tentativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                    <div>
                      <p className="font-medium">Tentativa {attempt.attemptNumber}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(attempt.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{result.percentage.toFixed(1)}%</p>
                      <Badge variant={result.passed ? "default" : "destructive"}>
                        {result.passed ? "Aprovado" : "Reprovado"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Análise por Categoria */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryAnalysis).map(([category, stats]) => {
                  const percentage = (stats.correct / stats.total) * 100
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category}</span>
                        <span className="text-sm text-gray-600">
                          {stats.correct}/{stats.total} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}