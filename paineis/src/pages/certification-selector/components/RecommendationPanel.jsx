import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecommendationPanel = ({ 
  selectedCertification,
  userLevel = 'intermediario',
  completedMissions = [],
  className = '' 
}) => {
  if (!selectedCertification) {
    return null;
  }

  // Mock recommendations based on selected certification
  const getRecommendations = () => {
    const recommendations = {
      missions: [
        {
          id: 1,
          title: "Análise de Logs de Firewall",
          difficulty: "intermediario",
          xp: 150,
          duration: "45 min",
          relevance: 95,
          isCompleted: completedMissions?.includes(1)
        },
        {
          id: 2,
          title: "Configuração de IDS/IPS",
          difficulty: "avancado",
          xp: 200,
          duration: "60 min",
          relevance: 88,
          isCompleted: completedMissions?.includes(2)
        },
        {
          id: 3,
          title: "Investigação de Malware",
          difficulty: "intermediario",
          xp: 175,
          duration: "50 min",
          relevance: 82,
          isCompleted: completedMissions?.includes(3)
        }
      ],
      studyMaterials: [
        {
          title: "Guia Oficial CompTIA Security+",
          type: "document",
          relevance: 98,
          isPremium: false
        },
        {
          title: "Laboratório Virtual de Redes",
          type: "lab",
          relevance: 85,
          isPremium: true
        },
        {
          title: "Flashcards de Conceitos",
          type: "flashcards",
          relevance: 75,
          isPremium: false
        }
      ]
    };

    return recommendations;
  };

  const recommendations = getRecommendations();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'iniciante': return 'text-success';
      case 'intermediario': return 'text-warning';
      case 'avancado': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'document': return 'FileText';
      case 'lab': return 'Monitor';
      case 'flashcards': return 'Layers';
      default: return 'BookOpen';
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-accent to-warning rounded-lg flex items-center justify-center">
          <Icon name="Lightbulb" size={20} color="white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Preparação Recomendada
          </h3>
          <p className="text-sm text-muted-foreground">
            Para {selectedCertification?.name}
          </p>
        </div>
      </div>
      {/* Recommended Missions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">Missões Recomendadas</h4>
          <Button
            variant="ghost"
            size="sm"
            iconName="ArrowRight"
            iconPosition="right"
          >
            Ver Todas
          </Button>
        </div>
        
        <div className="space-y-3">
          {recommendations?.missions?.map((mission) => (
            <div 
              key={mission?.id}
              className={`
                p-4 border rounded-lg transition-all duration-200 hover:shadow-md
                ${mission?.isCompleted 
                  ? 'border-success bg-success/5' :'border-border hover:border-primary/50'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={mission?.isCompleted ? "CheckCircle" : "Target"} 
                    size={16} 
                    className={mission?.isCompleted ? "text-success" : "text-primary"} 
                  />
                  <h5 className="font-medium text-foreground text-sm">
                    {mission?.title}
                  </h5>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                    {mission?.relevance}% relevante
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <span className={getDifficultyColor(mission?.difficulty)}>
                    {mission?.difficulty}
                  </span>
                  <span>{mission?.duration}</span>
                  <span>{mission?.xp} XP</span>
                </div>
                {!mission?.isCompleted && (
                  <Button
                    variant="outline"
                    size="xs"
                    iconName="Play"
                    iconPosition="left"
                  >
                    Iniciar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Study Materials */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">Material de Estudo</h4>
          <Button
            variant="ghost"
            size="sm"
            iconName="ExternalLink"
            iconPosition="right"
          >
            Biblioteca
          </Button>
        </div>
        
        <div className="space-y-3">
          {recommendations?.studyMaterials?.map((material, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icon 
                  name={getTypeIcon(material?.type)} 
                  size={16} 
                  className="text-muted-foreground" 
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground text-sm">
                      {material?.title}
                    </span>
                    {material?.isPremium && (
                      <Icon name="Crown" size={12} className="text-accent" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {material?.relevance}% relevante para o exame
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="xs"
                iconName="ArrowRight"
                disabled={material?.isPremium}
              >
                {material?.isPremium ? 'Premium' : 'Acessar'}
              </Button>
            </div>
          ))}
        </div>
      </div>
      {/* Study Plan Suggestion */}
      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Calendar" size={16} className="text-primary mt-0.5" />
          <div>
            <h5 className="font-medium text-foreground text-sm mb-1">
              Plano de Estudos Sugerido
            </h5>
            <p className="text-xs text-muted-foreground">
              Complete as 3 missões recomendadas e estude o material oficial. 
              Tempo estimado: 2-3 semanas de preparação intensiva.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationPanel;