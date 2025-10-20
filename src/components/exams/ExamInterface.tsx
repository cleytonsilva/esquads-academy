/**
 * Exam Interface Component
 * Interface principal para realização de exames
 * Baseado na arquitetura técnica de Arquitetura_Tecnica_Missoes_Simulados.md
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Pause,
  Play,
  Send,
  Eye,
  EyeOff
} from 'lucide-react'
import { QuestionDisplay } from './QuestionDisplay'
import {
  Exam,
  ExamQuestion,
  ExamAnswer,
  ExamAttempt,
  ExamSession,
  ExamStatus,
  QuestionDisplayProps
} from '@/types/exams'

export interface ExamInterfaceProps {
  exam: Exam
  attempt: ExamAttempt
  session: ExamSession
  questions: ExamQuestion[]
  answers: Record<string, ExamAnswer>
  currentQuestionIndex: number
  timeRemaining: number
  isPaused: boolean
  isSubmitting: boolean
  onAnswerSelect: (questionId: string, answer: string) => void
  onQuestionNavigate: (index: number) => void
  onFlagQuestion: (questionId: string) => void
  onPauseExam: () => void
  onResumeExam: () => void
  onSubmitExam: () => void
  onPreviousQuestion: () => void
  onNextQuestion: () => void
  className?: string
}

export const ExamInterface: React.FC<ExamInterfaceProps> = ({
  exam,
  attempt,
  session,
  questions,
  answers,
  currentQuestionIndex,
  timeRemaining,
  isPaused,
  isSubmitting,
  onAnswerSelect,
  onQuestionNavigate,
  onFlagQuestion,
  onPauseExam,
  onResumeExam,
  onSubmitExam,
  onPreviousQuestion,
  onNextQuestion,
  className = ''
}) => {
  const [showSidebar, setShowSidebar] = useState(true)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined

  // Estatísticas do progresso
  const answeredCount = Object.keys(answers).length
  const progressPercentage = (answeredCount / questions.length) * 100

  // Formatação do tempo
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Verificar se o tempo está acabando (últimos 5 minutos)
  const isTimeRunningOut = timeRemaining <= 300

  const handleFlagQuestion = (questionId: string) => {
    const newFlagged = new Set(flaggedQuestions)
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId)
    } else {
      newFlagged.add(questionId)
    }
    setFlaggedQuestions(newFlagged)
    onFlagQuestion(questionId)
  }

  const getQuestionStatus = (question: ExamQuestion) => {
    const isAnswered = answers[question.id]
    const isFlagged = flaggedQuestions.has(question.id)
    const isCurrent = questions[currentQuestionIndex]?.id === question.id

    if (isCurrent) return 'current'
    if (isAnswered && isFlagged) return 'answered-flagged'
    if (isAnswered) return 'answered'
    if (isFlagged) return 'flagged'
    return 'unanswered'
  }

  const getQuestionStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-blue-600 text-white border-blue-600'
      case 'answered':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'flagged':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'answered-flagged':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300'
    }
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Carregando questão...</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header do Exame */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
              <p className="text-sm text-gray-600">
                Questão {currentQuestionIndex + 1} de {questions.length}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className="flex items-center space-x-2">
                <Clock className={`w-5 h-5 ${isTimeRunningOut ? 'text-red-600' : 'text-gray-600'}`} />
                <span className={`font-mono text-lg ${isTimeRunningOut ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {/* Progresso */}
              <Badge variant="outline">
                {answeredCount}/{questions.length} respondidas
              </Badge>

              {/* Controles */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showSidebar ? () => setShowSidebar(false) : () => setShowSidebar(true)}
                >
                  {showSidebar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isPaused ? onResumeExam : onPauseExam}
                  disabled={isSubmitting}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onSubmitExam}
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Enviando...' : 'Finalizar'}
                </Button>
              </div>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="mt-3">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      {/* Alerta de Tempo */}
      {isTimeRunningOut && (
        <Alert className="mx-6 mt-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Atenção! Restam apenas {formatTime(timeRemaining)} para finalizar o exame.
          </AlertDescription>
        </Alert>
      )}

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Questão Principal */}
          <div className={showSidebar ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <QuestionDisplay
              question={currentQuestion}
              selectedAnswer={currentAnswer?.selectedOptions[0]}
              onAnswerSelect={(answer) => onAnswerSelect(currentQuestion.id, answer)}
              isReviewMode={false}
              showExplanation={false}
            />

            {/* Controles de Navegação */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={onPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                
                <Button
                  variant={flaggedQuestions.has(currentQuestion.id) ? "default" : "outline"}
                  onClick={() => handleFlagQuestion(currentQuestion.id)}
                >
                  <Flag className="w-4 h-4 mr-2" />
                  {flaggedQuestions.has(currentQuestion.id) ? 'Marcada' : 'Marcar'}
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={onNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar - Navegação de Questões */}
          {showSidebar && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-sm">Navegação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Estatísticas */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Respondidas:</span>
                      <span className="font-medium">{answeredCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marcadas:</span>
                      <span className="font-medium">{flaggedQuestions.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Restantes:</span>
                      <span className="font-medium">{questions.length - answeredCount}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Grid de Questões */}
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((question, index) => {
                      const status = getQuestionStatus(question)
                      return (
                        <Button
                          key={question.id}
                          variant="outline"
                          size="sm"
                          onClick={() => onQuestionNavigate(index)}
                          className={`
                            h-8 w-8 p-0 text-xs font-medium border-2
                            ${getQuestionStatusColor(status)}
                          `}
                        >
                          {index + 1}
                        </Button>
                      )
                    })}
                  </div>

                  {/* Legenda */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-600 rounded"></div>
                      <span>Atual</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                      <span>Respondida</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                      <span>Marcada</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                      <span>Não respondida</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Botão de Finalizar */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onSubmitExam}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Enviando...' : 'Finalizar Exame'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}