import React from 'react';
import { Trophy, Clock, Zap, Target, Star } from 'lucide-react';

interface MissionResult {
  missionId: string;
  missionTitle: string;
  category: string;
  completedAt: Date;
  timeSpent: number; // in seconds
  xpEarned: number;
  accuracy: number; // percentage
  objectivesCompleted: number;
  totalObjectives: number;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  rating: number; // 1-5 stars
}

interface ResultsHeaderProps {
  result: MissionResult;
  onRetry?: () => void;
  onNextMission?: () => void;
  onShare?: () => void;
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({ 
  result, 
  onRetry, 
  onNextMission, 
  onShare 
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'iniciante':
        return 'text-green-500';
      case 'intermediário':
        return 'text-yellow-500';
      case 'avançado':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPerformanceMessage = (accuracy: number) => {
    if (accuracy >= 90) return 'Excelente trabalho! 🎉';
    if (accuracy >= 75) return 'Muito bem! ⭐';
    if (accuracy >= 60) return 'Bom trabalho! 👍';
    return 'Continue praticando! 💪';
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-border rounded-lg p-6 mb-6">
      {/* Main Result */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Missão Concluída!
        </h1>
        
        <h2 className="text-xl font-semibold text-primary mb-2">
          {result.missionTitle}
        </h2>
        
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className={`text-sm font-medium ${getDifficultyColor(result.difficulty)}`}>
            {result.difficulty}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{result.category}</span>
        </div>

        <p className="text-lg text-foreground font-medium">
          {getPerformanceMessage(result.accuracy)}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{formatTime(result.timeSpent)}</div>
          <div className="text-sm text-muted-foreground">Tempo</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">+{result.xpEarned}</div>
          <div className="text-sm text-muted-foreground">XP Ganho</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{result.accuracy}%</div>
          <div className="text-sm text-muted-foreground">Precisão</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Star className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{result.objectivesCompleted}/{result.totalObjectives}</div>
          <div className="text-sm text-muted-foreground">Objetivos</div>
        </div>
      </div>

      {/* Rating */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-1 mb-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              className={`w-6 h-6 ${
                index < result.rating 
                  ? 'text-yellow-500 fill-current' 
                  : 'text-muted-foreground'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Avaliação: {result.rating}/5 estrelas
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium"
        >
          Repetir Missão
        </button>
        
        <button
          onClick={onNextMission}
          className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg transition-colors font-medium"
        >
          Próxima Missão
        </button>
        
        <button
          onClick={onShare}
          className="px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg transition-colors font-medium"
        >
          Compartilhar
        </button>
      </div>

      {/* Completion Time */}
      <div className="text-center mt-4 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Concluído em {result.completedAt.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

export default ResultsHeader;
