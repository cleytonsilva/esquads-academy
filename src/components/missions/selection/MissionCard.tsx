import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, Check, Clock, Zap, Wrench, Award, GitBranch, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryIcon: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  duration: string;
  xpReward: number;
  image: string;
  progress: number;
  isLocked: boolean;
  isPremium: boolean;
  tools: string[];
  badges: Array<{
    name: string;
    icon: string;
  }>;
  prerequisites: string[];
}

interface MissionCardProps {
  mission: Mission;
  userPlan?: 'free' | 'premium';
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, userPlan = 'free' }) => {
  const navigate = useNavigate();

  const handleStartMission = () => {
    if (mission.isPremium && userPlan === 'free') {
      // Show upgrade prompt - for now just return
      return;
    }
    if (mission.isLocked) {
      return;
    }
    navigate('/student/missions/play', { state: { missionId: mission.id } });
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

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'iniciante':
        return 'bg-green-500/10 border-green-500/20';
      case 'intermediário':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'avançado':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-muted/10 border-muted/20';
    }
  };

  return (
    <div className={`
      relative bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg
      ${mission.isLocked ? 'opacity-60' : 'hover:border-primary/30'}
      ${mission.isPremium && userPlan === 'free' ? 'ring-2 ring-accent/20' : ''}
    `}>
      {/* Premium Badge */}
      {mission.isPremium && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Crown className="w-3 h-3" />
            <span>Premium</span>
          </div>
        </div>
      )}

      {/* Lock Overlay */}
      {mission.isLocked && (
        <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center">
          <div className="bg-card border border-border rounded-full p-3">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Mission Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={mission.image}
          alt={mission.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Progress Bar */}
        {mission.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${mission.progress}%` }}
            />
          </div>
        )}

        {/* Completion Badge */}
        {mission.progress === 100 && (
          <div className="absolute top-3 left-3">
            <div className="bg-green-500 text-white rounded-full p-1.5">
              <Check className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Title and Category */}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-medium text-primary">{mission.category}</span>
          </div>
          <h3 className="font-semibold text-foreground text-lg leading-tight">
            {mission.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {mission.description}
        </p>

        {/* Mission Stats */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            {/* Difficulty */}
            <div className={`px-2 py-1 rounded-full border ${getDifficultyBg(mission.difficulty)}`}>
              <span className={`font-medium ${getDifficultyColor(mission.difficulty)}`}>
                {mission.difficulty}
              </span>
            </div>
            
            {/* Duration */}
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{mission.duration}</span>
            </div>
          </div>

          {/* XP Reward */}
          <div className="flex items-center space-x-1 text-accent font-medium">
            <Zap className="w-3 h-3" />
            <span>{mission.xpReward} XP</span>
          </div>
        </div>

        {/* Tools Required */}
        {mission.tools && mission.tools.length > 0 && (
          <div className="flex items-center space-x-2">
            <Wrench className="w-3 h-3 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {mission.tools.slice(0, 3).map((tool, index) => (
                <span key={index} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                  {tool}
                </span>
              ))}
              {mission.tools.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{mission.tools.length - 3} mais
                </span>
              )}
            </div>
          </div>
        )}

        {/* Badges Preview */}
        {mission.badges && mission.badges.length > 0 && (
          <div className="flex items-center space-x-2">
            <Award className="w-3 h-3 text-muted-foreground" />
            <div className="flex space-x-1">
              {mission.badges.slice(0, 3).map((badge, index) => (
                <div key={index} className="w-6 h-6 bg-gradient-to-br from-accent to-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">🏆</span>
                </div>
              ))}
              {mission.badges.length > 3 && (
                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    +{mission.badges.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prerequisites */}
        {mission.prerequisites && mission.prerequisites.length > 0 && (
          <div className="flex items-center space-x-2">
            <GitBranch className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Requer: {mission.prerequisites.join(', ')}
            </span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {mission.isPremium && userPlan === 'free' ? (
            <Button
              variant="outline"
              className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              onClick={handleStartMission}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade para Premium
            </Button>
          ) : mission.isLocked ? (
            <Button
              variant="outline"
              className="w-full"
              disabled
            >
              <Lock className="w-4 h-4 mr-2" />
              Bloqueado
            </Button>
          ) : mission.progress === 100 ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleStartMission}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Repetir Missão
            </Button>
          ) : mission.progress > 0 ? (
            <Button
              variant="default"
              className="w-full"
              onClick={handleStartMission}
            >
              <Play className="w-4 h-4 mr-2" />
              Continuar ({mission.progress}%)
            </Button>
          ) : (
            <Button
              variant="default"
              className="w-full"
              onClick={handleStartMission}
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar Missão
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionCard;
