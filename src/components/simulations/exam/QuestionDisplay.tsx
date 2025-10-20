import React from 'react';
import { Star, Check, X, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuestionOption {
  id: string;
  text: string;
  description?: string;
  isCorrect?: boolean;
}

interface Question {
  number: number;
  total: number;
  text: string;
  type?: 'scenario' | 'code' | 'standard';
  scenario?: string;
  code?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  points?: number;
  options: QuestionOption[];
  explanation?: string;
}

interface QuestionDisplayProps {
  question?: Question;
  selectedAnswer?: string;
  onAnswerSelect?: (optionId: string) => void;
  isReviewMode?: boolean;
  className?: string;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ 
  question, 
  selectedAnswer, 
  onAnswerSelect, 
  isReviewMode = false,
  className = '' 
}) => {
  if (!question) return null;

  const handleOptionSelect = (optionId: string) => {
    if (!isReviewMode && onAnswerSelect) {
      onAnswerSelect(optionId);
    }
  };

  const renderQuestionContent = () => {
    if (question.type === 'scenario') {
      return (
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg border-l-4 border-primary">
            <h4 className="font-medium text-foreground mb-2">Cenário:</h4>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {question.scenario}
            </p>
          </div>
          <div>
            <p className="text-foreground leading-relaxed">
              {question.text}
            </p>
          </div>
        </div>
      );
    }

    if (question.type === 'code') {
      return (
        <div className="space-y-4">
          <p className="text-foreground leading-relaxed">
            {question.text}
          </p>
          <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
            <pre className="text-green-400 text-sm font-mono">
              <code>{question.code}</code>
            </pre>
          </div>
        </div>
      );
    }

    return (
      <p className="text-foreground leading-relaxed">
        {question.text}
      </p>
    );
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'hard': return 'bg-red-500/10 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyText = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return '';
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      {/* Question Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
            {question.number}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">
                Questão {question.number} de {question.total}
              </span>
              {question.difficulty && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                  {getDifficultyText(question.difficulty)}
                </span>
              )}
            </div>
            {question.category && (
              <span className="text-xs text-muted-foreground">
                {question.category}
              </span>
            )}
          </div>
        </div>
        
        {question.points && (
          <div className="flex items-center space-x-1 text-accent">
            <Star className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{question.points} pts</span>
          </div>
        )}
      </div>

      {/* Question Content */}
      <div className="mb-6">
        {renderQuestionContent()}
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <Button
            key={option.id}
            variant="outline"
            onClick={() => handleOptionSelect(option.id)}
            disabled={isReviewMode}
            className={`
              w-full text-left p-4 h-auto justify-start
              ${selectedAnswer === option.id
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
              ${isReviewMode ? 'cursor-default' : 'cursor-pointer'}
              ${isReviewMode && option.isCorrect ? 'border-green-500 bg-green-500/5' : ''}
              ${isReviewMode && selectedAnswer === option.id && !option.isCorrect ? 'border-red-500 bg-red-500/5' : ''}
            `}
          >
            <div className="flex items-start space-x-3 w-full">
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0
                ${selectedAnswer === option.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground'
                }
                ${isReviewMode && option.isCorrect ? 'border-green-500 bg-green-500 text-white' : ''}
                ${isReviewMode && selectedAnswer === option.id && !option.isCorrect ? 'border-red-500 bg-red-500 text-white' : ''}
              `}>
                {selectedAnswer === option.id && (
                  <>
                    {isReviewMode && !option.isCorrect ? (
                      <X className="w-3 h-3" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                  </>
                )}
                {isReviewMode && option.isCorrect && selectedAnswer !== option.id && (
                  <Check className="w-3 h-3" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-muted-foreground text-sm">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-foreground">
                    {option.text}
                  </span>
                </div>
                {option.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Review Mode Explanation */}
      {isReviewMode && question.explanation && (
        <div className="mt-6 p-4 bg-muted rounded-lg border-l-4 border-accent">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-4 h-4 text-accent" />
            <span className="font-medium text-foreground">Explicação</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </Card>
  );
};

export default QuestionDisplay;