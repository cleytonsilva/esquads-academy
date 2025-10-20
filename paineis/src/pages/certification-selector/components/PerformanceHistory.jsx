import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PerformanceHistory = ({ 
  history = [], 
  isCollapsed = true, 
  onToggleCollapse 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return 'CheckCircle';
    if (score >= 60) return 'AlertCircle';
    return 'XCircle';
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredHistory = history?.filter(attempt => {
    if (selectedPeriod === 'all') return true;
    const attemptDate = new Date(attempt.date);
    const now = new Date();
    const daysAgo = Math.floor((now - attemptDate) / (1000 * 60 * 60 * 24));
    
    switch (selectedPeriod) {
      case '7d': return daysAgo <= 7;
      case '30d': return daysAgo <= 30;
      case '90d': return daysAgo <= 90;
      default: return true;
    }
  });

  const averageScore = filteredHistory?.length > 0 
    ? Math.round(filteredHistory?.reduce((sum, attempt) => sum + attempt?.score, 0) / filteredHistory?.length)
    : 0;

  const bestScore = filteredHistory?.length > 0 
    ? Math.max(...filteredHistory?.map(attempt => attempt?.score))
    : 0;

  const totalAttempts = filteredHistory?.length;

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center space-x-3">
          <Icon name="BarChart3" size={20} className="text-muted-foreground" />
          <div>
            <h3 className="font-medium text-foreground">Histórico de Performance</h3>
            <p className="text-xs text-muted-foreground">
              {totalAttempts} tentativa{totalAttempts !== 1 ? 's' : ''} registrada{totalAttempts !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Icon 
          name={isCollapsed ? "ChevronDown" : "ChevronUp"} 
          size={16} 
          className="text-muted-foreground" 
        />
      </div>
      {/* Content */}
      {!isCollapsed && (
        <div className="px-4 pb-4 border-t border-border">
          {history?.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium text-foreground mb-2">
                Nenhum Histórico Encontrado
              </h4>
              <p className="text-sm text-muted-foreground">
                Complete seu primeiro exame simulado para ver seu histórico de performance
              </p>
            </div>
          ) : (
            <>
              {/* Period Filter */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm font-medium text-foreground">Período:</span>
                <div className="flex space-x-1">
                  {[
                    { value: 'all', label: 'Todos' },
                    { value: '7d', label: '7 dias' },
                    { value: '30d', label: '30 dias' },
                    { value: '90d', label: '90 dias' }
                  ]?.map(period => (
                    <button
                      key={period?.value}
                      onClick={() => setSelectedPeriod(period?.value)}
                      className={`
                        px-3 py-1 text-xs rounded-md transition-colors
                        ${selectedPeriod === period?.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-muted'
                        }
                      `}
                    >
                      {period?.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-foreground">{averageScore}%</div>
                  <div className="text-xs text-muted-foreground">Média</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-foreground">{bestScore}%</div>
                  <div className="text-xs text-muted-foreground">Melhor</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-foreground">{totalAttempts}</div>
                  <div className="text-xs text-muted-foreground">Tentativas</div>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredHistory?.map((attempt, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon 
                        name={getScoreIcon(attempt?.score)} 
                        size={20} 
                        className={getScoreColor(attempt?.score)} 
                      />
                      <div>
                        <div className="font-medium text-foreground text-sm">
                          {attempt?.certificationName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(attempt?.date)} • {attempt?.questionCount} questões
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-sm ${getScoreColor(attempt?.score)}`}>
                        {attempt?.score}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {attempt?.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              {history?.length > 5 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="ArrowRight"
                    iconPosition="right"
                  >
                    Ver Histórico Completo
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceHistory;