import React from 'react';
import { TrendingUp, TrendingDown, Clock, Target, Zap, AlertCircle } from 'lucide-react';

interface PerformanceMetric {
  category: string;
  score: number;
  maxScore: number;
  improvement: number; // percentage change from last attempt
  details: string[];
}

interface PerformanceBreakdownProps {
  metrics: PerformanceMetric[];
  overallScore: number;
  previousScore?: number;
  recommendations: string[];
}

const PerformanceBreakdown: React.FC<PerformanceBreakdownProps> = ({ 
  metrics, 
  overallScore, 
  previousScore,
  recommendations 
}) => {
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getImprovementIcon = (improvement: number) => {
    if (improvement > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (improvement < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Target className="w-4 h-4 text-muted-foreground" />;
  };

  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return 'text-green-500';
    if (improvement < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Desempenho Geral</h3>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-accent" />
            <span className="text-2xl font-bold text-foreground">{overallScore}%</span>
          </div>
        </div>

        {/* Overall Score Bar */}
        <div className="w-full bg-muted rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getScoreBg(overallScore, 100)}`}
            style={{ width: `${overallScore}%` }}
          />
        </div>

        {/* Previous Score Comparison */}
        {previousScore !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Comparado à tentativa anterior:</span>
            <div className={`flex items-center space-x-1 ${getImprovementColor(overallScore - previousScore)}`}>
              {getImprovementIcon(overallScore - previousScore)}
              <span className="font-medium">
                {overallScore - previousScore > 0 ? '+' : ''}{overallScore - previousScore}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Metrics */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Análise Detalhada</h3>
        
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">{metric.category}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-bold ${getScoreColor(metric.score, metric.maxScore)}`}>
                    {metric.score}/{metric.maxScore}
                  </span>
                  {getImprovementIcon(metric.improvement)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getScoreBg(metric.score, metric.maxScore)}`}
                  style={{ width: `${(metric.score / metric.maxScore) * 100}%` }}
                />
              </div>

              {/* Details */}
              <div className="space-y-2">
                {metric.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-start space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{detail}</span>
                  </div>
                ))}
              </div>

              {/* Improvement */}
              {metric.improvement !== 0 && (
                <div className={`mt-3 text-sm ${getImprovementColor(metric.improvement)}`}>
                  <div className="flex items-center space-x-1">
                    {getImprovementIcon(metric.improvement)}
                    <span>
                      {metric.improvement > 0 ? 'Melhorou' : 'Piorou'} {Math.abs(metric.improvement)}% 
                      em relação à última tentativa
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">Recomendações de Melhoria</h3>
          </div>
          
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-foreground">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Analysis */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-foreground">Análise de Tempo</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-foreground">2:34</div>
            <div className="text-sm text-muted-foreground">Tempo Médio</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-500">1:45</div>
            <div className="text-sm text-muted-foreground">Seu Melhor</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-500">-22%</div>
            <div className="text-sm text-muted-foreground">vs. Anterior</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceBreakdown;
