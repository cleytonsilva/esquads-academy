import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MissionRecommendations = ({ 
  weakAreas = [
    {
      topic: "Cryptography",
      score: 65,
      missions: [
        {
          id: 1,
          title: "Implementação de Hash Seguro",
          difficulty: "Médio",
          xp: 150,
          duration: "25 min",
          description: "Aprenda a implementar funções hash seguras com salt para proteção de senhas.",
          category: "Hands-on"
        },
        {
          id: 2,
          title: "Criptografia Simétrica vs Assimétrica",
          difficulty: "Básico",
          xp: 100,
          duration: "15 min",
          description: "Entenda as diferenças e aplicações de cada tipo de criptografia.",
          category: "Teórico"
        }
      ]
    },
    {
      topic: "Identity & Access",
      score: 70,
      missions: [
        {
          id: 3,
          title: "Configuração de Active Directory",
          difficulty: "Avançado",
          xp: 200,
          duration: "40 min",
          description: "Configure políticas de acesso e autenticação em ambiente corporativo.",
          category: "Simulação"
        }
      ]
    }
  ]
}) => {
  const navigate = useNavigate();

  const handleStartMission = (missionId) => {
    navigate('/mission-gameplay', { state: { missionId } });
  };

  const handleViewAllMissions = () => {
    navigate('/mission-selection');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Básico':
        return 'var(--color-success)';
      case 'Médio':
        return 'var(--color-warning)';
      case 'Avançado':
        return 'var(--color-error)';
      default:
        return 'var(--color-muted-foreground)';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Hands-on':
        return 'Code';
      case 'Teórico':
        return 'BookOpen';
      case 'Simulação':
        return 'Monitor';
      default:
        return 'Target';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Target" size={20} color="var(--color-primary)" />
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Missões Recomendadas
            </h3>
            <p className="text-sm text-muted-foreground">
              Baseado nas áreas que precisam de melhoria
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewAllMissions}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Ver Todas
        </Button>
      </div>
      {/* Weak Areas with Missions */}
      <div className="space-y-6">
        {weakAreas?.map((area, areaIndex) => (
          <div key={areaIndex} className="border border-border rounded-lg p-4">
            {/* Area Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-warning rounded-full" />
                <div>
                  <h4 className="font-medium text-foreground">{area?.topic}</h4>
                  <p className="text-xs text-muted-foreground">
                    Pontuação atual: {area?.score}% - Precisa melhorar
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-semibold text-warning">{area?.score}%</p>
                <p className="text-xs text-muted-foreground">Abaixo do ideal</p>
              </div>
            </div>

            {/* Recommended Missions */}
            <div className="space-y-3">
              {area?.missions?.map((mission, missionIndex) => (
                <div 
                  key={mission?.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      <Icon name={getCategoryIcon(mission?.category)} size={20} color="white" />
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="font-medium text-foreground">{mission?.title}</h5>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {mission?.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Icon name="Zap" size={12} color="var(--color-accent)" />
                          <span className="text-xs font-medium text-foreground">
                            {mission?.xp} XP
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Icon name="Clock" size={12} color="var(--color-muted-foreground)" />
                          <span className="text-xs text-muted-foreground">
                            {mission?.duration}
                          </span>
                        </div>
                        
                        <span 
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ 
                            backgroundColor: `${getDifficultyColor(mission?.difficulty)}20`,
                            color: getDifficultyColor(mission?.difficulty)
                          }}
                        >
                          {mission?.difficulty}
                        </span>
                        
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {mission?.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartMission(mission?.id)}
                    iconName="Play"
                    iconPosition="left"
                  >
                    Iniciar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Call to Action */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="TrendingUp" size={20} color="var(--color-primary)" />
            <div>
              <p className="font-medium text-foreground">
                Melhore seu desempenho
              </p>
              <p className="text-sm text-muted-foreground">
                Complete as missões recomendadas para fortalecer seus conhecimentos
              </p>
            </div>
          </div>
          
          <Button
            variant="primary"
            onClick={handleViewAllMissions}
            iconName="Target"
            iconPosition="left"
          >
            Explorar Missões
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MissionRecommendations;