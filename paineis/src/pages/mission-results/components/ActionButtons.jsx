import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ActionButtons = ({ 
  missionId = "firewall-config-01",
  canRetry = true,
  hasNextMission = true,
  nextMissionId = "firewall-advanced-01",
  className = ""
}) => {
  const navigate = useNavigate();
  const [isSharing, setIsSharing] = useState(false);

  const handleRetryMission = () => {
    navigate('/mission-gameplay', { 
      state: { 
        missionId, 
        retry: true 
      } 
    });
  };

  const handleNextMission = () => {
    if (hasNextMission) {
      navigate('/mission-gameplay', { 
        state: { 
          missionId: nextMissionId 
        } 
      });
    } else {
      navigate('/mission-selection');
    }
  };

  const handleReturnToDashboard = () => {
    navigate('/mission-selection');
  };

  const handleViewProfile = () => {
    // Navigate to student profile when implemented
    console.log('Navigate to student profile');
  };

  const handleShareResults = async () => {
    setIsSharing(true);
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Esquads - Missão Concluída!',
          text: 'Acabei de completar uma missão de cybersegurança no Esquads! 🎯',
          url: window.location?.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard?.writeText(
          `Acabei de completar uma missão de cybersegurança no Esquads! 🎯\n${window.location?.href}`
        );
        // You could show a toast notification here
        alert('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const primaryActions = [
    {
      id: 'next',
      label: hasNextMission ? 'Próxima Missão' : 'Explorar Missões',
      icon: hasNextMission ? 'ArrowRight' : 'Compass',
      variant: 'default',
      onClick: handleNextMission,
      primary: true
    },
    {
      id: 'retry',
      label: 'Tentar Novamente',
      icon: 'RotateCcw',
      variant: 'outline',
      onClick: handleRetryMission,
      disabled: !canRetry
    }
  ];

  const secondaryActions = [
    {
      id: 'dashboard',
      label: 'Voltar ao Menu',
      icon: 'Home',
      variant: 'ghost',
      onClick: handleReturnToDashboard
    },
    {
      id: 'profile',
      label: 'Ver Perfil',
      icon: 'User',
      variant: 'ghost',
      onClick: handleViewProfile
    },
    {
      id: 'share',
      label: 'Compartilhar',
      icon: 'Share2',
      variant: 'ghost',
      onClick: handleShareResults,
      loading: isSharing
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {primaryActions?.map((action) => (
          <Button
            key={action?.id}
            variant={action?.variant}
            size="lg"
            onClick={action?.onClick}
            disabled={action?.disabled}
            iconName={action?.icon}
            iconPosition="left"
            className={`${action?.primary ? 'sm:flex-1' : ''} justify-center`}
          >
            {action?.label}
          </Button>
        ))}
      </div>
      {/* Secondary Actions */}
      <div className="flex flex-wrap gap-2 justify-center">
        {secondaryActions?.map((action) => (
          <Button
            key={action?.id}
            variant={action?.variant}
            size="sm"
            onClick={action?.onClick}
            loading={action?.loading}
            iconName={action?.icon}
            iconPosition="left"
            className="flex-shrink-0"
          >
            {action?.label}
          </Button>
        ))}
      </div>
      {/* Mission Navigation Hint */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground mb-2">
          Continue sua jornada de aprendizado
        </p>
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="Target" size={12} />
            <span>24 missões completas</span>
          </div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
          <div className="flex items-center space-x-1">
            <Icon name="Award" size={12} />
            <span>12 conquistas</span>
          </div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
          <div className="flex items-center space-x-1">
            <Icon name="TrendingUp" size={12} />
            <span>Nível 12</span>
          </div>
        </div>
      </div>
      {/* Quick Tips */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={20} color="var(--color-primary)" />
          <div>
            <h4 className="font-semibold text-foreground mb-1">Dica do Especialista</h4>
            <p className="text-sm text-muted-foreground">
              {hasNextMission 
                ? "A próxima missão aborda configurações avançadas. Revise os conceitos de estados de conexão antes de continuar."
                : "Explore diferentes categorias de missões para desenvolver habilidades diversificadas em cybersegurança."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;