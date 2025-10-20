import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ExamTimer from './ExamTimer';
import QuestionNavigation from './QuestionNavigation';

interface ExamData {
  duration?: number;
  title?: string;
  code?: string;
}

interface ExamSidebarProps {
  examData?: ExamData;
  currentQuestion?: number;
  totalQuestions?: number;
  answeredQuestions?: number[];
  flaggedQuestions?: number[];
  timeRemaining?: number;
  isPaused?: boolean;
  onNavigateToQuestion?: (questionNumber: number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onToggleFlag?: (questionNumber: number) => void;
  onFinishExam?: () => void;
  onTimeUp?: () => void;
  className?: string;
}

const ExamSidebar: React.FC<ExamSidebarProps> = ({ 
  examData,
  currentQuestion = 1,
  totalQuestions = 50,
  answeredQuestions = [],
  flaggedQuestions = [],
  timeRemaining,
  isPaused = false,
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
        <Button
          variant="ghost"
          onClick={toggleCollapsed}
          className="p-4 hover:bg-muted transition-colors border-b border-border"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Button>
        <div className="flex-1 flex flex-col items-center py-4 space-y-4">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
            {currentQuestion}
          </div>
          
          <div className="text-xs text-center text-muted-foreground">
            <div>{answeredQuestions.length}</div>
            <div>de {totalQuestions}</div>
          </div>
          
          {flaggedQuestions.length > 0 && (
            <div className="relative">
              <Flag className="w-4 h-4 text-yellow-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs">
                {flaggedQuestions.length}
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
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="p-1"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </Button>
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
            <span>{Math.round((answeredQuestions.length / totalQuestions) * 100)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Marcadas:</span>
            <span>{flaggedQuestions.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Restantes:</span>
            <span>{totalQuestions - answeredQuestions.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSidebar;