import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExamHeader = ({ 
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
    <div className={`bg-card border-b border-border ${className}`}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Exam Info */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center">
            <Icon name="FileText" size={20} color="white" />
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
              <Icon name="Pause" size={14} className="text-warning" />
              <span className="text-sm font-medium text-warning">Pausado</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPauseExam}
              iconName={isPaused ? "Play" : "Pause"}
              iconPosition="left"
            >
              {isPaused ? 'Retomar' : 'Pausar'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onExitExam}
              iconName="X"
              className="text-muted-foreground hover:text-destructive"
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamHeader;