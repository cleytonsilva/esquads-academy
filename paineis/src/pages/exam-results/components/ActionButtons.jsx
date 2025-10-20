import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActionButtons = ({ 
  examType = "CompTIA Security+",
  isPassed = true,
  canRetake = true,
  hasStudyPlan = true,
  onShare
}) => {
  const navigate = useNavigate();

  const handleRetakeExam = () => {
    navigate('/certification-selector', { 
      state: { 
        selectedExam: examType,
        retakeMode: true 
      } 
    });
  };

  const handleStudyRecommendations = () => {
    navigate('/mission-selection', { 
      state: { 
        fromExamResults: true,
        examType: examType 
      } 
    });
  };

  const handleContinueLearning = () => {
    navigate('/mission-selection');
  };

  const handleBackToCertifications = () => {
    navigate('/certification-selector');
  };

  const handleShareResults = () => {
    if (onShare) {
      onShare();
    } else {
      // Default share functionality
      if (navigator.share) {
        navigator.share({
          title: 'Esquads - Resultado do Exame',
          text: `Acabei de completar o exame ${examType} na plataforma Esquads! ${isPassed ? '✅ Aprovado!' : '📚 Vou estudar mais e tentar novamente!'}`,
          url: window.location?.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        const text = `Acabei de completar o exame ${examType} na plataforma Esquads! ${isPassed ? '✅ Aprovado!' : '📚 Vou estudar mais e tentar novamente!'} ${window.location?.href}`;
        navigator.clipboard?.writeText(text);
        // You could show a toast notification here
      }
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="Zap" size={20} color="var(--color-accent)" />
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Próximos Passos
          </h3>
          <p className="text-sm text-muted-foreground">
            Continue sua jornada de aprendizado
          </p>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Retake Exam */}
        {canRetake && (
          <Button
            variant={isPassed ? "outline" : "primary"}
            size="lg"
            onClick={handleRetakeExam}
            iconName="RotateCcw"
            iconPosition="left"
            fullWidth
          >
            {isPassed ? "Refazer Exame" : "Tentar Novamente"}
          </Button>
        )}

        {/* Study Recommendations */}
        {hasStudyPlan && (
          <Button
            variant={isPassed ? "primary" : "secondary"}
            size="lg"
            onClick={handleStudyRecommendations}
            iconName="BookOpen"
            iconPosition="left"
            fullWidth
          >
            Plano de Estudos
          </Button>
        )}
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Button
          variant="outline"
          onClick={handleContinueLearning}
          iconName="Target"
          iconPosition="left"
          fullWidth
        >
          Explorar Missões
        </Button>

        <Button
          variant="outline"
          onClick={handleBackToCertifications}
          iconName="FileText"
          iconPosition="left"
          fullWidth
        >
          Outros Exames
        </Button>

        <Button
          variant="outline"
          onClick={handleShareResults}
          iconName="Share2"
          iconPosition="left"
          fullWidth
        >
          Compartilhar
        </Button>
      </div>

      {/* Achievement Celebration */}
      {isPassed && (
        <div className="p-4 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg border border-success/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-success to-primary rounded-full flex items-center justify-center">
                <Icon name="Trophy" size={24} color="white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Parabéns pela aprovação! 🎉
                </p>
                <p className="text-sm text-muted-foreground">
                  Você demonstrou excelente conhecimento em {examType}
                </p>
              </div>
            </div>
            
            <Button
              variant="success"
              size="sm"
              onClick={handleShareResults}
              iconName="Share2"
              iconPosition="left"
            >
              Celebrar
            </Button>
          </div>
        </div>
      )}

      {/* Improvement Motivation */}
      {!isPassed && (
        <div className="p-4 bg-gradient-to-r from-warning/10 to-accent/10 rounded-lg border border-warning/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-warning to-accent rounded-full flex items-center justify-center">
                <Icon name="TrendingUp" size={24} color="white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Continue se esforçando! 💪
                </p>
                <p className="text-sm text-muted-foreground">
                  Use as recomendações para melhorar e tente novamente
                </p>
              </div>
            </div>
            
            <Button
              variant="warning"
              size="sm"
              onClick={handleStudyRecommendations}
              iconName="BookOpen"
              iconPosition="left"
            >
              Estudar
            </Button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">Exames Realizados</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">89%</p>
            <p className="text-xs text-muted-foreground">Taxa de Aprovação</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">2.4k</p>
            <p className="text-xs text-muted-foreground">XP Total</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;