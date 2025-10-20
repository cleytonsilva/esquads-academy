import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const MissionCard = ({ mission, userPlan = 'free' }) => {
  const navigate = useNavigate();

  const handleStartMission = () => {
    if (mission?.isPremium && userPlan === 'free') {
      // Show upgrade prompt - for now just return
      return;
    }
    if (mission?.isLocked) {
      return;
    }
    navigate('/mission-gameplay', { state: { missionId: mission?.id } });
  };

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

  const getDifficultyBg = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'iniciante':
        return 'bg-success/10 border-success/20';
      case 'intermediário':
        return 'bg-warning/10 border-warning/20';
      case 'avançado':
        return 'bg-error/10 border-error/20';
      default:
        return 'bg-muted/10 border-muted/20';
    }
  };

  return (
    <div className={`
      relative bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg
      ${mission?.isLocked ? 'opacity-60' : 'hover:border-primary/30'}
      ${mission?.isPremium && userPlan === 'free' ? 'ring-2 ring-accent/20' : ''}
    `}>
      {/* Premium Badge */}
      {mission?.isPremium && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Icon name="Crown" size={12} />
            <span>Premium</span>
          </div>
        </div>
      )}
      {/* Lock Overlay */}
      {mission?.isLocked && (
        <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center">
          <div className="bg-card border border-border rounded-full p-3">
            <Icon name="Lock" size={24} color="var(--color-muted-foreground)" />
          </div>
        </div>
      )}
      {/* Mission Image */}
      <div className="relative h-40 overflow-hidden">
        <Image
          src={mission?.image}
          alt={mission?.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Progress Bar */}
        {mission?.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div 
              className="h-full bg-success transition-all duration-300"
              style={{ width: `${mission?.progress}%` }}
            />
          </div>
        )}

        {/* Completion Badge */}
        {mission?.progress === 100 && (
          <div className="absolute top-3 left-3">
            <div className="bg-success text-success-foreground rounded-full p-1.5">
              <Icon name="Check" size={16} />
            </div>
          </div>
        )}
      </div>
      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Title and Category */}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Icon name={mission?.categoryIcon} size={16} color="var(--color-primary)" />
            <span className="text-xs font-medium text-primary">{mission?.category}</span>
          </div>
          <h3 className="font-semibold text-foreground text-lg leading-tight">
            {mission?.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {mission?.description}
        </p>

        {/* Mission Stats */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            {/* Difficulty */}
            <div className={`px-2 py-1 rounded-full border ${getDifficultyBg(mission?.difficulty)}`}>
              <span className={`font-medium ${getDifficultyColor(mission?.difficulty)}`}>
                {mission?.difficulty}
              </span>
            </div>
            
            {/* Duration */}
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Icon name="Clock" size={12} />
              <span>{mission?.duration}</span>
            </div>
          </div>

          {/* XP Reward */}
          <div className="flex items-center space-x-1 text-accent font-medium">
            <Icon name="Zap" size={12} />
            <span>{mission?.xpReward} XP</span>
          </div>
        </div>

        {/* Tools Required */}
        {mission?.tools && mission?.tools?.length > 0 && (
          <div className="flex items-center space-x-2">
            <Icon name="Wrench" size={12} className="text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {mission?.tools?.slice(0, 3)?.map((tool, index) => (
                <span key={index} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                  {tool}
                </span>
              ))}
              {mission?.tools?.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{mission?.tools?.length - 3} mais
                </span>
              )}
            </div>
          </div>
        )}

        {/* Badges Preview */}
        {mission?.badges && mission?.badges?.length > 0 && (
          <div className="flex items-center space-x-2">
            <Icon name="Award" size={12} className="text-muted-foreground" />
            <div className="flex space-x-1">
              {mission?.badges?.slice(0, 3)?.map((badge, index) => (
                <div key={index} className="w-6 h-6 bg-gradient-to-br from-accent to-warning rounded-full flex items-center justify-center">
                  <Icon name={badge?.icon} size={10} color="white" />
                </div>
              ))}
              {mission?.badges?.length > 3 && (
                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    +{mission?.badges?.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prerequisites */}
        {mission?.prerequisites && mission?.prerequisites?.length > 0 && (
          <div className="flex items-center space-x-2">
            <Icon name="GitBranch" size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Requer: {mission?.prerequisites?.join(', ')}
            </span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {mission?.isPremium && userPlan === 'free' ? (
            <Button
              variant="outline"
              fullWidth
              iconName="Crown"
              iconPosition="left"
              onClick={handleStartMission}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              Upgrade para Premium
            </Button>
          ) : mission?.isLocked ? (
            <Button
              variant="outline"
              fullWidth
              disabled
              iconName="Lock"
              iconPosition="left"
            >
              Bloqueado
            </Button>
          ) : mission?.progress === 100 ? (
            <Button
              variant="secondary"
              fullWidth
              iconName="RotateCcw"
              iconPosition="left"
              onClick={handleStartMission}
            >
              Repetir Missão
            </Button>
          ) : mission?.progress > 0 ? (
            <Button
              variant="default"
              fullWidth
              iconName="Play"
              iconPosition="left"
              onClick={handleStartMission}
            >
              Continuar ({mission?.progress}%)
            </Button>
          ) : (
            <Button
              variant="default"
              fullWidth
              iconName="Play"
              iconPosition="left"
              onClick={handleStartMission}
            >
              Iniciar Missão
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionCard;