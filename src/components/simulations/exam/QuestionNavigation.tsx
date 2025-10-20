import React from 'react';
import { Flag, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface QuestionNavigationProps {
  currentQuestion?: number;
  totalQuestions?: number;
  answeredQuestions?: number[];
  flaggedQuestions?: number[];
  onNavigateToQuestion?: (questionNumber: number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onToggleFlag?: (questionNumber: number) => void;
  onFinishExam?: () => void;
  className?: string;
}

const QuestionNavigation: React.FC<QuestionNavigationProps> = ({ 
  currentQuestion = 1, 
  totalQuestions = 50, 
  answeredQuestions = [], 
  flaggedQuestions = [], 
  onNavigateToQuestion, 
  onPrevious, 
  onNext, 
  onToggleFlag,
  onFinishExam,
  className = '' 
}) => {
  const isFirstQuestion = currentQuestion === 1;
  const isLastQuestion = currentQuestion === totalQuestions;
  const isCurrentFlagged = flaggedQuestions.includes(currentQuestion);
  const answeredCount = answeredQuestions.length;
  const completionPercentage = Math.round((answeredCount / totalQuestions) * 100);

  const getQuestionStatus = (questionNumber: number): 'answered' | 'current' | 'unanswered' => {
    if (answeredQuestions.includes(questionNumber)) {
      return 'answered';
    }
    if (questionNumber === currentQuestion) {
      return 'current';
    }
    return 'unanswered';
  };

  const getQuestionButtonClass = (questionNumber: number): string => {
    const status = getQuestionStatus(questionNumber);
    const isFlagged = flaggedQuestions.includes(questionNumber);
    
    let baseClass = 'w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 relative ';
    
    switch (status) {
      case 'current':
        baseClass += 'bg-primary text-primary-foreground shadow-md ';
        break;
      case 'answered':
        baseClass += 'bg-green-500 text-white ';
        break;
      default:
        baseClass += 'bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-muted ';
    }
    
    return baseClass;
  };

  return (
    <Card className={className}>
      {/* Progress Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Navegação</h3>
          <span className="text-sm text-muted-foreground">
            {answeredCount}/{totalQuestions} respondidas
          </span>
        </div>
        
        {/* Progress Bar */}
        <Progress value={completionPercentage} className="h-2" />
        <div className="text-xs text-muted-foreground mt-1">
          {completionPercentage}% completo
        </div>
      </div>

      {/* Question Grid */}
      <div className="p-4">
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const questionNumber = index + 1;
            const isFlagged = flaggedQuestions.includes(questionNumber);
            
            return (
              <Button
                key={questionNumber}
                variant="outline"
                size="sm"
                onClick={() => onNavigateToQuestion?.(questionNumber)}
                className={getQuestionButtonClass(questionNumber)}
                title={`Questão ${questionNumber}${isFlagged ? ' (Marcada)' : ''}`}
              >
                {questionNumber}
                {isFlagged && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Flag className="w-2 h-2 text-white" />
                  </div>
                )}
              </Button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Respondida</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Atual</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-muted rounded"></div>
              <span>Pendente</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Flag className="w-3 h-3 text-yellow-500" />
            <span>{flaggedQuestions.length} marcadas</span>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={isFirstQuestion}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={isLastQuestion}
              className="flex-1"
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <Button
            variant={isCurrentFlagged ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleFlag?.(currentQuestion)}
            className="w-full"
          >
            <Flag className="w-4 h-4 mr-2" />
            {isCurrentFlagged ? 'Desmarcar' : 'Marcar para Revisão'}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onFinishExam}
            className="w-full"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Finalizar Exame
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QuestionNavigation;
