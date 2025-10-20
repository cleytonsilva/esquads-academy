import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import ExamTimer from './ExamTimer';
import QuestionNavigation from './QuestionNavigation';

const ExamSidebar = ({ 
  examData,
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  flaggedQuestions,
  timeRemaining,
  isPaused,
  onNavigateToQuestion,
  onPrevious,
  onNext,
  onToggleFlag,
  onFinishExam,
  onTimeUp,
  className = '' 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isCollapsed) {
    return (
      <div className={`w-16 bg-card border-r border-border flex flex-col ${className}`}>
        <button
          onClick={toggleCollapsed}
          className="p-4 hover:bg-muted transition-colors border-b border-border"
        >
          <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
        </button>
        <div className="flex-1 flex flex-col items-center py-4 space-y-4">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
            {currentQuestion}
          </div>
          
          <div className="text-xs text-center text-muted-foreground">
            <div>{answeredQuestions?.length}</div>
            <div>de {totalQuestions}</div>
          </div>
          
          {flaggedQuestions?.length > 0 && (
            <div className="relative">
              <Icon name="Flag" size={16} className="text-warning" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning text-white rounded-full flex items-center justify-center text-xs">
                {flaggedQuestions?.length}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-80 bg-card border-r border-border flex flex-col ${className}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Painel de Controle</h2>
        <button
          onClick={toggleCollapsed}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <Icon name="ChevronLeft" size={16} className="text-muted-foreground" />
        </button>
      </div>
      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Timer */}
          <ExamTimer
            totalTimeMinutes={examData?.duration || 90}
            onTimeUp={onTimeUp}
            isPaused={isPaused}
          />

          {/* Question Navigation */}
          <QuestionNavigation
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            answeredQuestions={answeredQuestions}
            flaggedQuestions={flaggedQuestions}
            onNavigateToQuestion={onNavigateToQuestion}
            onPrevious={onPrevious}
            onNext={onNext}
            onToggleFlag={onToggleFlag}
            onFinishExam={onFinishExam}
          />
        </div>
      </div>
      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span>Progresso:</span>
            <span>{Math.round((answeredQuestions?.length / totalQuestions) * 100)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Marcadas:</span>
            <span>{flaggedQuestions?.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Restantes:</span>
            <span>{totalQuestions - answeredQuestions?.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSidebar;