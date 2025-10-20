import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuestionNavigation = ({ 
  currentQuestion, 
  totalQuestions, 
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
  const isCurrentFlagged = flaggedQuestions?.includes(currentQuestion);
  const answeredCount = answeredQuestions?.length;
  const completionPercentage = Math.round((answeredCount / totalQuestions) * 100);

  const getQuestionStatus = (questionNumber) => {
    if (answeredQuestions?.includes(questionNumber)) {
      return 'answered';
    }
    if (questionNumber === currentQuestion) {
      return 'current';
    }
    return 'unanswered';
  };

  const getQuestionButtonClass = (questionNumber) => {
    const status = getQuestionStatus(questionNumber);
    const isFlagged = flaggedQuestions?.includes(questionNumber);
    
    let baseClass = 'w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 relative ';
    
    switch (status) {
      case 'current':
        baseClass += 'bg-primary text-primary-foreground shadow-md ';
        break;
      case 'answered':
        baseClass += 'bg-success text-success-foreground ';
        break;
      default:
        baseClass += 'bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-muted ';
    }
    
    return baseClass;
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Progress Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Navegação</h3>
          <span className="text-sm text-muted-foreground">
            {answeredCount}/{totalQuestions} respondidas
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="h-2 bg-success rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {completionPercentage}% completo
        </div>
      </div>
      {/* Question Grid */}
      <div className="p-4">
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const questionNumber = index + 1;
            const isFlagged = flaggedQuestions?.includes(questionNumber);
            
            return (
              <button
                key={questionNumber}
                onClick={() => onNavigateToQuestion(questionNumber)}
                className={getQuestionButtonClass(questionNumber)}
                title={`Questão ${questionNumber}${isFlagged ? ' (Marcada)' : ''}`}
              >
                {questionNumber}
                {isFlagged && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full flex items-center justify-center">
                    <Icon name="Flag" size={8} color="white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-success rounded"></div>
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
            <Icon name="Flag" size={12} className="text-warning" />
            <span>{flaggedQuestions?.length} marcadas</span>
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
              iconName="ChevronLeft"
              iconPosition="left"
              className="flex-1"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={isLastQuestion}
              iconName="ChevronRight"
              iconPosition="right"
              className="flex-1"
            >
              Próxima
            </Button>
          </div>

          <Button
            variant={isCurrentFlagged ? "warning" : "outline"}
            size="sm"
            onClick={onToggleFlag}
            iconName="Flag"
            iconPosition="left"
            fullWidth
          >
            {isCurrentFlagged ? 'Desmarcar' : 'Marcar para Revisão'}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onFinishExam}
            iconName="CheckCircle"
            iconPosition="left"
            fullWidth
          >
            Finalizar Exame
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigation;