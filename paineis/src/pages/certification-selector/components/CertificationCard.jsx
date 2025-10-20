import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CertificationCard = ({ 
  certification, 
  onSelect, 
  isSelected = false,
  userPlan = 'free' 
}) => {
  const isPremium = certification?.isPremium;
  const isLocked = isPremium && userPlan === 'free';

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'iniciante':
        return 'text-success';
      case 'intermediário':
        return 'text-warning';
      case 'avançado':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'iniciante':
        return 'CircleDot';
      case 'intermediário':
        return 'Circle';
      case 'avançado':
        return 'AlertTriangle';
      default:
        return 'Circle';
    }
  };

  return (
    <div 
      className={`
        relative bg-card border rounded-lg p-6 transition-all duration-200 cursor-pointer
        ${isSelected 
          ? 'border-primary shadow-lg ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/50 hover:shadow-md'
        }
        ${isLocked ? 'opacity-60' : ''}
      `}
      onClick={() => !isLocked && onSelect(certification)}
    >
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-1 px-2 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium">
            <Icon name="Crown" size={12} />
            <span>Premium</span>
          </div>
        </div>
      )}
      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-muted/80 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Icon name="Lock" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Premium</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Icon name={certification?.icon} size={24} color="white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{certification?.name}</h3>
            <p className="text-sm text-muted-foreground">{certification?.provider}</p>
          </div>
        </div>
      </div>
      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {certification?.description}
      </p>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Icon name={getDifficultyIcon(certification?.difficulty)} size={16} className={getDifficultyColor(certification?.difficulty)} />
            <span className="text-sm font-medium text-foreground">{certification?.difficulty}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{certification?.duration}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Icon name="FileText" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{certification?.questionCount} questões</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="TrendingUp" size={16} className="text-success" />
            <span className="text-sm text-success">{certification?.successRate}% aprovação</span>
          </div>
        </div>
      </div>
      {/* Topics */}
      <div className="mb-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">PRINCIPAIS TÓPICOS</p>
        <div className="flex flex-wrap gap-1">
          {certification?.topics?.slice(0, 3)?.map((topic, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
            >
              {topic}
            </span>
          ))}
          {certification?.topics?.length > 3 && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
              +{certification?.topics?.length - 3}
            </span>
          )}
        </div>
      </div>
      {/* Action Button */}
      <Button
        variant={isSelected ? "default" : "outline"}
        fullWidth
        disabled={isLocked}
        iconName={isSelected ? "Check" : "ArrowRight"}
        iconPosition="right"
      >
        {isSelected ? 'Selecionado' : 'Selecionar'}
      </Button>
    </div>
  );
};

export default CertificationCard;