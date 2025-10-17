// Esquads Academy - Player de Quiz

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Trophy,
  AlertCircle,
  BookOpen
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
}

interface QuizAttempt {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  timeSpent: number;
}

interface QuizPlayerProps {
  questions: QuizQuestion[];
  title: string;
  description?: string;
  timeLimit?: number; // em minutos
  allowRetry?: boolean;
  onComplete: (attempts: QuizAttempt[], score: number, totalPoints: number) => void;
  onExit?: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  questions,
  title,
  description,
  timeLimit,
  allowRetry = true,
  onComplete,
  onExit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Timer para limite de tempo
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isCompleted]);

  // Reset answer quando muda de questão
  useEffect(() => {
    setCurrentAnswer('');
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleTimeUp = () => {
    // Auto-submit quiz quando o tempo acaba
    const remainingQuestions = questions.slice(currentQuestionIndex);
    const emptyAttempts: QuizAttempt[] = remainingQuestions.map(q => ({
      questionId: q.id,
      answer: '',
      isCorrect: false,
      timeSpent: 0
    }));

    const allAttempts = [...attempts, ...emptyAttempts];
    const { score, totalPoints } = calculateScore(allAttempts);
    
    setAttempts(allAttempts);
    setIsCompleted(true);
    setShowResults(true);
    onComplete(allAttempts, score, totalPoints);
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = checkAnswer(currentQuestion, currentAnswer);

    const attempt: QuizAttempt = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      isCorrect,
      timeSpent
    };

    const newAttempts = [...attempts, attempt];
    setAttempts(newAttempts);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz completo
      const { score, totalPoints } = calculateScore(newAttempts);
      setIsCompleted(true);
      setShowResults(true);
      onComplete(newAttempts, score, totalPoints);
    }
  };

  const checkAnswer = (question: QuizQuestion, answer: string): boolean => {
    if (question.type === 'text') {
      // Para respostas abertas, aceitar se contém palavras-chave da resposta correta
      const correctWords = question.correct_answer.toLowerCase().split(' ');
      const answerWords = answer.toLowerCase().split(' ');
      return correctWords.some(word => answerWords.includes(word));
    }
    
    return answer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
  };

  const calculateScore = (attempts: QuizAttempt[]) => {
    const score = attempts.reduce((total, attempt) => {
      if (attempt.isCorrect) {
        const question = questions.find(q => q.id === attempt.questionId);
        return total + (question?.points || 1);
      }
      return total;
    }, 0);

    const totalPoints = questions.reduce((total, question) => total + question.points, 0);
    
    return { score, totalPoints };
  };

  const getScorePercentage = () => {
    const { score, totalPoints } = calculateScore(attempts);
    return Math.round((score / totalPoints) * 100);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAttempts([]);
    setCurrentAnswer('');
    setShowResults(false);
    setIsCompleted(false);
    setTimeRemaining(timeLimit ? timeLimit * 60 : null);
    setQuestionStartTime(Date.now());
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Restaurar resposta anterior se existir
      const previousAttempt = attempts[currentQuestionIndex - 1];
      if (previousAttempt) {
        setCurrentAnswer(previousAttempt.answer);
      }
    }
  };

  if (showResults) {
    const { score, totalPoints } = calculateScore(attempts);
    const percentage = getScorePercentage();

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {percentage >= 80 ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : percentage >= 60 ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">Quiz Concluído!</CardTitle>
            <div className="space-y-2">
              <div className={`text-4xl font-bold ${getScoreColor(percentage)}`}>
                {score}/{totalPoints} pontos
              </div>
              <div className={`text-xl ${getScoreColor(percentage)}`}>
                {percentage}% de acerto
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">
                  {attempts.filter(a => a.isCorrect).length}
                </div>
                <div className="text-sm text-gray-600">Respostas Corretas</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-red-600">
                  {attempts.filter(a => !a.isCorrect).length}
                </div>
                <div className="text-sm text-gray-600">Respostas Incorretas</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-600">
                  {formatTime(attempts.reduce((total, a) => total + a.timeSpent, 0))}
                </div>
                <div className="text-sm text-gray-600">Tempo Total</div>
              </div>
            </div>

            {/* Revisão das respostas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Revisão das Respostas</h3>
              {questions.map((question, index) => {
                const attempt = attempts.find(a => a.questionId === question.id);
                return (
                  <Card key={question.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {index + 1}. {question.question}
                          </h4>
                        </div>
                        <Badge
                          variant={attempt?.isCorrect ? "default" : "destructive"}
                          className="ml-2"
                        >
                          {attempt?.isCorrect ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {attempt?.isCorrect ? 'Correto' : 'Incorreto'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Sua resposta: </span>
                          <span className={attempt?.isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {attempt?.answer || 'Não respondida'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Resposta correta: </span>
                          <span className="text-green-600">{question.correct_answer}</span>
                        </div>
                        {question.explanation && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <span className="font-medium">Explicação: </span>
                            {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-4 justify-center">
              {allowRetry && (
                <Button onClick={handleRetry} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              )}
              {onExit && (
                <Button onClick={onExit}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Voltar ao Curso
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header do Quiz */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-xl truncate">{title}</CardTitle>
              {description && (
                <p className="text-gray-600 mt-1 text-sm">{description}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {timeRemaining !== null && (
                <Badge variant={timeRemaining < 300 ? "destructive" : "secondary"} className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {formatTime(timeRemaining)}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {currentQuestionIndex + 1} de {totalQuestions}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Questão Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Questão {currentQuestionIndex + 1}
          </CardTitle>
          <p className="text-gray-700">{currentQuestion.question}</p>
          <Badge variant="secondary" className="w-fit">
            {currentQuestion.points} {currentQuestion.points === 1 ? 'ponto' : 'pontos'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestion.type === 'multiple_choice' && (
            <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === 'true_false' && (
            <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="cursor-pointer">Verdadeiro</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="cursor-pointer">Falso</Label>
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="text-answer">Sua resposta:</Label>
              <Textarea
                id="text-answer"
                placeholder="Digite sua resposta aqui..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={4}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {onExit && (
                <Button variant="ghost" onClick={onExit}>
                  Sair do Quiz
                </Button>
              )}
              <Button
                onClick={handleAnswerSubmit}
                disabled={!currentAnswer.trim()}
              >
                {currentQuestionIndex === totalQuestions - 1 ? 'Finalizar' : 'Próxima'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avisos */}
      {timeRemaining !== null && timeRemaining < 300 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Atenção! Restam apenas {formatTime(timeRemaining)} para concluir o quiz.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
