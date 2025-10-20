/**
 * Question Display Component
 * Componente para exibir questões de exames
 * Migrado de paineis/src/pages/exam-interface/components/QuestionDisplay.jsx
 */

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Check, 
  X, 
  Info, 
  Code, 
  FileText,
  AlertCircle 
} from 'lucide-react'
import { 
  ExamQuestion, 
  QuestionOption, 
  QuestionType, 
  QuestionDifficulty,
  QuestionDisplayProps 
} from '@/types/exams'

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  isReviewMode = false,
  showExplanation = false,
  className = '',
}) => {
  if (!question) return null

  const handleOptionSelect = (optionId: string) => {
    if (!isReviewMode && onAnswerSelect) {
      onAnswerSelect(optionId)
    }
  }

  const getDifficultyColor = (difficulty: QuestionDifficulty): string => {
    switch (difficulty) {
      case QuestionDifficulty.Easy:
        return 'bg-green-100 text-green-800 border-green-200'
      case QuestionDifficulty.Medium:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case QuestionDifficulty.Hard:
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifficultyLabel = (difficulty: QuestionDifficulty): string => {
    switch (difficulty) {
      case QuestionDifficulty.Easy:
        return 'Fácil'
      case QuestionDifficulty.Medium:
        return 'Médio'
      case QuestionDifficulty.Hard:
        return 'Difícil'
      default:
        return 'Normal'
    }
  }

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case QuestionType.Code:
        return <Code className="h-4 w-4" />
      case QuestionType.Scenario:
        return <FileText className="h-4 w-4" />
      case QuestionType.Multiple:
      case QuestionType.TrueFalse:
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const renderQuestionContent = () => {
    if (question.type === QuestionType.Scenario && question.scenario) {
      return (
        <div className="space-y-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium text-gray-900">Cenário:</h4>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {question.scenario.description}
              </div>
              {question.scenario.resources && question.scenario.resources.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-xs font-medium text-gray-600 mb-2">Recursos:</h5>
                  <div className="space-y-1">
                    {question.scenario.resources.map((resource, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        • {resource.name}: {resource.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div>
            <p className="text-gray-900 leading-relaxed">
              {question.text}
            </p>
          </div>
        </div>
      )
    }

    if (question.type === QuestionType.Code && question.codeSnippet) {
      return (
        <div className="space-y-4">
          <p className="text-gray-900 leading-relaxed">
            {question.text}
          </p>
          <Card className="bg-gray-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400 font-mono">
                    {question.codeSnippet.language || 'code'}
                  </span>
                </div>
              </div>
              <pre className="text-green-400 text-sm font-mono overflow-x-auto">
                <code>{question.codeSnippet.code}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <p className="text-gray-900 leading-relaxed">
          {question.text}
        </p>
        {question.imageUrl && (
          <div className="mt-4">
            <img 
              src={question.imageUrl} 
              alt="Question illustration"
              className="max-w-full h-auto rounded-lg border"
            />
          </div>
        )}
      </div>
    )
  }

  const getOptionStatus = (option: QuestionOption) => {
    if (!isReviewMode) {
      return selectedAnswer === option.id ? 'selected' : 'default'
    }

    if (option.isCorrect) {
      return 'correct'
    }

    if (selectedAnswer === option.id && !option.isCorrect) {
      return 'incorrect'
    }

    return 'default'
  }

  const getOptionStyles = (status: string) => {
    switch (status) {
      case 'selected':
        return 'border-blue-500 bg-blue-50 shadow-sm'
      case 'correct':
        return 'border-green-500 bg-green-50'
      case 'incorrect':
        return 'border-red-500 bg-red-50'
      default:
        return 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
    }
  }

  const getOptionIconStyles = (status: string) => {
    switch (status) {
      case 'selected':
        return 'border-blue-500 bg-blue-500 text-white'
      case 'correct':
        return 'border-green-500 bg-green-500 text-white'
      case 'incorrect':
        return 'border-red-500 bg-red-500 text-white'
      default:
        return 'border-gray-300'
    }
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {question.orderIndex + 1}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-600">
                  Questão {question.orderIndex + 1}
                </span>
                {question.difficulty && (
                  <Badge 
                    variant="outline" 
                    className={getDifficultyColor(question.difficulty)}
                  >
                    {getDifficultyLabel(question.difficulty)}
                  </Badge>
                )}
                <div className="flex items-center space-x-1 text-gray-500">
                  {getQuestionTypeIcon(question.type)}
                  <span className="text-xs">
                    {question.type.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              </div>
              {question.topic && (
                <span className="text-xs text-gray-500">
                  {question.topic}
                </span>
              )}
            </div>
          </div>
          
          {question.points && (
            <div className="flex items-center space-x-1 text-amber-600">
              <Star className="h-4 w-4" />
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
          {question.options.map((option, index) => {
            const status = getOptionStatus(option)
            
            return (
              <Button
                key={option.id}
                variant="ghost"
                onClick={() => handleOptionSelect(option.id)}
                disabled={isReviewMode}
                className={`
                  w-full text-left p-4 h-auto rounded-lg border-2 transition-all duration-200
                  ${getOptionStyles(status)}
                  ${isReviewMode ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0
                    ${getOptionIconStyles(status)}
                  `}>
                    {status === 'selected' && !isReviewMode && (
                      <Check className="h-3 w-3" />
                    )}
                    {status === 'correct' && isReviewMode && (
                      <Check className="h-3 w-3" />
                    )}
                    {status === 'incorrect' && isReviewMode && (
                      <X className="h-3 w-3" />
                    )}
                    {status === 'default' && isReviewMode && option.isCorrect && selectedAnswer !== option.id && (
                      <Check className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-600 text-sm">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-900">
                        {option.text}
                      </span>
                    </div>
                    {option.explanation && isReviewMode && (
                      <p className="text-sm text-gray-600 mt-1">
                        {option.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>

        {/* Review Mode Explanation */}
        {isReviewMode && showExplanation && question.explanation && (
          <Card className="mt-6 border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-gray-900">Explicação</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {question.explanation}
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}