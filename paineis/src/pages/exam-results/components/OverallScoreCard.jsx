import React from 'react';
import Icon from '../../../components/AppIcon';

const OverallScoreCard = ({ 
  score = 85, 
  totalQuestions = 50, 
  correctAnswers = 42, 
  passingScore = 70, 
  examType = "CompTIA Security+",
  timeSpent = "45 min",
  maxTime = "90 min"
}) => {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const isPassed = percentage >= passingScore;
  const scoreColor = isPassed ? 'var(--color-success)' : 'var(--color-error)';

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">
            Resultado do Exame
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {examType}
          </p>
        </div>
        <div className={`
          px-4 py-2 rounded-full text-sm font-medium
          ${isPassed 
            ? 'bg-success/10 text-success border border-success/20' :'bg-error/10 text-error border border-error/20'
          }
        `}>
          {isPassed ? 'APROVADO' : 'REPROVADO'}
        </div>
      </div>

      {/* Score Display */}
      <div className="text-center mb-6">
        <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
          {/* Circular Progress */}
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="var(--color-muted)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke={scoreColor}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(percentage / 100) * 314} 314`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">
              {percentage}%
            </span>
            <span className="text-xs text-muted-foreground">
              {correctAnswers}/{totalQuestions}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground">
            Pontuação: {score} pontos
          </p>
          <p className="text-sm text-muted-foreground">
            Nota mínima para aprovação: {passingScore}%
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Icon name="Clock" size={16} color="var(--color-accent)" />
            <span className="text-sm font-medium text-foreground">Tempo</span>
          </div>
          <p className="text-lg font-bold text-foreground">{timeSpent}</p>
          <p className="text-xs text-muted-foreground">de {maxTime}</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Icon name="Target" size={16} color="var(--color-primary)" />
            <span className="text-sm font-medium text-foreground">Precisão</span>
          </div>
          <p className="text-lg font-bold text-foreground">{percentage}%</p>
          <p className="text-xs text-muted-foreground">de acertos</p>
        </div>
      </div>
    </div>
  );
};

export default OverallScoreCard;