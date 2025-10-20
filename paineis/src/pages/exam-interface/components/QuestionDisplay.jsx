import React from 'react';
import Icon from '../../../components/AppIcon';


const QuestionDisplay = ({ 
  question, 
  selectedAnswer, 
  onAnswerSelect, 
  isReviewMode = false,
  className = '' 
}) => {
  if (!question) return null;

  const handleOptionSelect = (optionId) => {
    if (!isReviewMode) {
      onAnswerSelect(optionId);
    }
  };

  const renderQuestionContent = () => {
    if (question?.type === 'scenario') {
      return (
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg border-l-4 border-primary">
            <h4 className="font-medium text-foreground mb-2">Cenário:</h4>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {question?.scenario}
            </p>
          </div>
          <div>
            <p className="text-foreground leading-relaxed">
              {question?.text}
            </p>
          </div>
        </div>
      );
    }

    if (question?.type === 'code') {
      return (
        <div className="space-y-4">
          <p className="text-foreground leading-relaxed">
            {question?.text}
          </p>
          <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
            <pre className="text-green-400 text-sm font-mono">
              <code>{question?.code}</code>
            </pre>
          </div>
        </div>
      );
    }

    return (
      <p className="text-foreground leading-relaxed">
        {question?.text}
      </p>
    );
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      {/* Question Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
            {question?.number}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">
                Questão {question?.number} de {question?.total}
              </span>
              {question?.difficulty && (
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${question?.difficulty === 'easy' ? 'bg-success/10 text-success' : ''}
                  ${question?.difficulty === 'medium' ? 'bg-warning/10 text-warning' : ''}
                  ${question?.difficulty === 'hard' ? 'bg-error/10 text-error' : ''}
                `}>
                  {question?.difficulty === 'easy' ? 'Fácil' : 
                   question?.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                </span>
              )}
            </div>
            {question?.category && (
              <span className="text-xs text-muted-foreground">
                {question?.category}
              </span>
            )}
          </div>
        </div>
        
        {question?.points && (
          <div className="flex items-center space-x-1 text-accent">
            <Icon name="Star" size={14} />
            <span className="text-sm font-medium">{question?.points} pts</span>
          </div>
        )}
      </div>
      {/* Question Content */}
      <div className="mb-6">
        {renderQuestionContent()}
      </div>
      {/* Answer Options */}
      <div className="space-y-3">
        {question?.options?.map((option) => (
          <button
            key={option?.id}
            onClick={() => handleOptionSelect(option?.id)}
            disabled={isReviewMode}
            className={`
              w-full text-left p-4 rounded-lg border-2 transition-all duration-200
              ${selectedAnswer === option?.id
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
              ${isReviewMode ? 'cursor-default' : 'cursor-pointer'}
              ${isReviewMode && option?.isCorrect ? 'border-success bg-success/5' : ''}
              ${isReviewMode && selectedAnswer === option?.id && !option?.isCorrect ? 'border-error bg-error/5' : ''}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0
                ${selectedAnswer === option?.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground'
                }
                ${isReviewMode && option?.isCorrect ? 'border-success bg-success text-success-foreground' : ''}
                ${isReviewMode && selectedAnswer === option?.id && !option?.isCorrect ? 'border-error bg-error text-error-foreground' : ''}
              `}>
                {selectedAnswer === option?.id && (
                  <Icon 
                    name={isReviewMode && !option?.isCorrect ? "X" : "Check"} 
                    size={12} 
                  />
                )}
                {isReviewMode && option?.isCorrect && selectedAnswer !== option?.id && (
                  <Icon name="Check" size={12} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-muted-foreground text-sm">
                    {String.fromCharCode(65 + question?.options?.indexOf(option))}
                  </span>
                  <span className="text-foreground">
                    {option?.text}
                  </span>
                </div>
                {option?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {option?.description}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      {/* Review Mode Explanation */}
      {isReviewMode && question?.explanation && (
        <div className="mt-6 p-4 bg-muted rounded-lg border-l-4 border-accent">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Info" size={16} className="text-accent" />
            <span className="font-medium text-foreground">Explicação</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {question?.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;