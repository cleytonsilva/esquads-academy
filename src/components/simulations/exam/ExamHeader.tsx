import React from 'react';
import { FileText, Pause, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ExamHeaderProps {
  examTitle?: string;
  examCode?: string;
  totalQuestions?: number;
  currentQuestion?: number;
  onPauseExam?: () => void;
  onExitExam?: () => void;
  isPaused?: boolean;
  className?: string;
}

const ExamHeader: React.FC<ExamHeaderProps> = ({ 
  examTitle = "Certificação em Segurança Cibernética", 
  examCode = "CISSP-001", 
  totalQuestions = 50,
  currentQuestion = 1,
  onPauseExam,
  onExitExam,
  isPaused = false,
  className = '' 
}) => {
  return (
    <Card className={`border-b ${className}`}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Exam Info */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {examTitle}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Código: {examCode}</span>
              <span>•</span>
              <span>Questão {currentQuestion} de {totalQuestions}</span>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-4">
          {isPaused && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-lg">
              <Pause className="w-3.5 h-3.5 text-warning" />
              <span className="text-sm font-medium text-warning">Pausado</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPauseExam}
            >
              {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {isPaused ? 'Retomar' : 'Pausar'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onExitExam}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExamHeader;