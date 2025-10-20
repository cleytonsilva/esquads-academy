import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { simulationService } from '@/services/simulationService'
import { certificationQuestionService } from '@/services/certificationQuestionService'
import ExamHeader from '@/components/simulations/exam/ExamHeader'
import ExamSidebar from '@/components/simulations/exam/ExamSidebar'
import QuestionDisplay from '@/components/simulations/exam/QuestionDisplay'
import ExamTimer from '@/components/simulations/exam/ExamTimer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Flag,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  CertificationQuestion, 
  SimulationSession, 
  SimulationConfig,
  QuestionOption 
} from '@/types/certifications'

interface ExamState {
  currentQuestionIndex: number
  answers: Record<number, string | string[]>
  flaggedQuestions: Set<number>
  timeRemaining: number
  isPaused: boolean
  showReview: boolean
  isSubmitted: boolean
}

export const ExamInterface: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { toast } = useToast()

  // Estado do exame
  const [examState, setExamState] = useState<ExamState>({
    currentQuestionIndex: 0,
    answers: {},
    flaggedQuestions: new Set(),
    timeRemaining: 0,
    isPaused: false,
    showReview: false,
    isSubmitted: false
  })

  // Dados do exame
  const [questions, setQuestions] = useState<CertificationQuestion[]>([])
  const [session, setSession] = useState<SimulationSession | null>(null)
  const [config, setConfig] = useState<SimulationConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados do exame
  useEffect(() => {
    const loadExam = async () => {
      try {
        setLoading(true)
        setError(null)

        // Obter configuração da URL
        const configFromUrl = location.state?.config as SimulationConfig
        if (!configFromUrl) {
          throw new Error('Configuração do exame não encontrada')
        }
        setConfig(configFromUrl)

        // Buscar questões baseadas na configuração
        const questionsData = await certificationQuestionService.getQuestions({
          certification_provider: configFromUrl.provider,
          difficulty_level: configFromUrl.difficulty,
          limit: configFromUrl.questionCount
        })

        if (!questionsData || questionsData.length === 0) {
          throw new Error('Nenhuma questão encontrada para esta configuração')
        }

        // Embaralhar questões
        const shuffledQuestions = shuffleArray([...questionsData])
        setQuestions(shuffledQuestions)

        // Calcular tempo total (2 minutos por questão)
        const totalTime = configFromUrl.questionCount * 2 * 60
        setExamState(prev => ({
          ...prev,
          timeRemaining: totalTime
        }))

        // Criar sessão temporária para o exame
        const tempSession: SimulationSession = {
          id: `temp-${Date.now()}`,
          userId: user?.id || '',
          config: configFromUrl,
          questions: shuffledQuestions,
          answers: {},
          startTime: new Date().toISOString(),
          status: 'active'
        }

        setSession(tempSession)

      } catch (err) {
        console.error('Erro ao carregar exame:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o exame',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    if (user && id) {
      loadExam()
    }
  }, [user, id, location.state, toast])

  // Timer do exame
  useEffect(() => {
    if (examState.isPaused || examState.isSubmitted || examState.timeRemaining <= 0) {
      return
    }

    const timer = setInterval(() => {
      setExamState(prev => {
        if (prev.timeRemaining <= 1) {
          // Tempo esgotado - submeter automaticamente
          handleSubmitExam()
          return { ...prev, timeRemaining: 0 }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examState.isPaused, examState.isSubmitted])

  // Função para embaralhar array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Navegação entre questões
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setExamState(prev => ({ ...prev, currentQuestionIndex: index }))
    }
  }

  const nextQuestion = () => {
    if (examState.currentQuestionIndex < questions.length - 1) {
      goToQuestion(examState.currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (examState.currentQuestionIndex > 0) {
      goToQuestion(examState.currentQuestionIndex - 1)
    }
  }

  // Resposta às questões
  const handleAnswerChange = (questionId: number, answer: string | string[]) => {
    setExamState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }))
  }

  // Marcar/desmarcar questão
  const toggleFlag = (questionIndex: number) => {
    setExamState(prev => {
      const newFlagged = new Set(prev.flaggedQuestions)
      if (newFlagged.has(questionIndex)) {
        newFlagged.delete(questionIndex)
      } else {
        newFlagged.add(questionIndex)
      }
      return { ...prev, flaggedQuestions: newFlagged }
    })
  }

  // Pausar/retomar exame
  const togglePause = () => {
    setExamState(prev => ({ ...prev, isPaused: !prev.isPaused }))
  }

  // Submeter exame
  const handleSubmitExam = async () => {
    if (examState.isSubmitted) return

    try {
      setExamState(prev => ({ ...prev, isSubmitted: true }))

      // Calcular pontuação
      let correctAnswersCount = 0
      const totalQuestions = questions.length

      questions.forEach((question, index) => {
        const userAnswer = examState.answers[question.id]
        if (userAnswer && question.correct_answer) {
          if (question.question_type === 'multiple_choice') {
            if (userAnswer === question.correct_answer) {
              correctAnswersCount++
            }
          } else if (question.question_type === 'multiple_select') {
            const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
            const correctAnswers = Array.isArray(question.correct_answer) 
              ? question.correct_answer 
              : [question.correct_answer]
            
            if (userAnswers.length === correctAnswers.length &&
                userAnswers.every(answer => correctAnswers.includes(answer))) {
              correctAnswersCount++
            }
          }
        }
      })

      const score = Math.round((correctAnswersCount / totalQuestions) * 100)
      const passed = score >= 70 // 70% para aprovação

      // Navegar para resultados
      navigate(`/student/results/${session?.id}`, {
        state: {
          type: 'simulation',
          title: config?.provider || 'Simulação',
          score,
          passed,
          totalQuestions,
          correctAnswers: correctAnswersCount,
          timeSpent: config ? (config.questionCount * 2 * 60) - examState.timeRemaining : 0,
          xpEarned: Math.round(score * 0.5), // XP baseado na pontuação
          badgesEarned: passed ? ['simulation-passer'] : [],
          answers: examState.answers,
          questions
        }
      })

    } catch (err) {
      console.error('Erro ao submeter exame:', err)
      toast({
        title: 'Erro',
        description: 'Não foi possível submeter o exame',
        variant: 'destructive'
      })
      setExamState(prev => ({ ...prev, isSubmitted: false }))
    }
  }

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

  // Calcular progresso
  const progress = questions.length > 0 
    ? ((examState.currentQuestionIndex + 1) / questions.length) * 100 
    : 0

  // Verificar se questão foi respondida
  const isQuestionAnswered = (questionId: number): boolean => {
    const answer = examState.answers[questionId]
    return answer !== undefined && answer !== '' && answer !== null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando exame...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erro no Exame</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/student/simulations')}
              className="w-full mt-4"
            >
              Voltar aos Simulados
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!questions.length || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-600">Nenhuma questão disponível</p>
            <Button 
              onClick={() => navigate('/student/simulations')}
              className="mt-4"
            >
              Voltar aos Simulados
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[examState.currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header do Exame */}
      <ExamHeader
        title={config.provider}
        examCode={`${config.provider}-${config.difficulty}`}
        currentQuestion={examState.currentQuestionIndex + 1}
        totalQuestions={questions.length}
        onPause={togglePause}
        onExit={() => navigate('/student/simulations')}
        isPaused={examState.isPaused}
      />

      {/* Timer */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-mono text-lg font-semibold">
                {formatTime(examState.timeRemaining)}
              </span>
            </div>
            <Badge variant={examState.timeRemaining < 300 ? "destructive" : "default"}>
              {examState.timeRemaining < 300 ? "Tempo Crítico" : "Tempo Normal"}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExamState(prev => ({ ...prev, showReview: !prev.showReview }))}
            >
              {examState.showReview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {examState.showReview ? 'Ocultar' : 'Revisar'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleFlag(examState.currentQuestionIndex)}
            >
              <Flag className={`h-4 w-4 ${examState.flaggedQuestions.has(examState.currentQuestionIndex) ? 'text-red-500 fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Barra de Progresso */}
        <div className="mt-3">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>Questão {examState.currentQuestionIndex + 1} de {questions.length}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* Sidebar de Navegação */}
        <ExamSidebar
          questions={questions}
          currentQuestionIndex={examState.currentQuestionIndex}
          answers={examState.answers}
          flaggedQuestions={examState.flaggedQuestions}
          onQuestionSelect={goToQuestion}
          showReview={examState.showReview}
        />

        {/* Área Principal - Questão */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={examState.currentQuestionIndex + 1}
              totalQuestions={questions.length}
              userAnswer={examState.answers[currentQuestion.id]}
              onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
              showReview={examState.showReview}
            />
          </div>

          {/* Navegação e Controles */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={examState.currentQuestionIndex === 0}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  onClick={nextQuestion}
                  disabled={examState.currentQuestionIndex === questions.length - 1}
                >
                  Próxima
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {isQuestionAnswered(currentQuestion.id) ? (
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                  ) : (
                    <div className="h-3 w-3 mr-1 rounded-full border border-gray-400" />
                  )}
                  {isQuestionAnswered(currentQuestion.id) ? 'Respondida' : 'Não Respondida'}
                </Badge>

                <Button
                  onClick={handleSubmitExam}
                  disabled={examState.isSubmitted}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {examState.isSubmitted ? 'Submetendo...' : 'Finalizar Exame'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Submissão */}
      {examState.isSubmitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Submetendo Exame</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processando suas respostas...</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ExamInterface
