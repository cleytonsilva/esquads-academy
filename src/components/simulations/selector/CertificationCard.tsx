import React from 'react';
import { Crown, Lock, Clock, FileText, TrendingUp, Check, ArrowRight, CircleDot, Circle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Certification {
  id: string;
  name: string;
  provider: string;
  description: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  duration: string;
  questionCount: number;
  successRate: number;
  topics: string[];
  icon: string;
  isPremium: boolean;
}

interface CertificationCardProps {
  certification: Certification;
  onSelect: (certification: Certification) => void;
  isSelected?: boolean;
  userPlan?: 'free' | 'premium';
}

const CertificationCard: React.FC<CertificationCardProps> = ({ 
  certification, 
  onSelect, 
  isSelected = false,
  userPlan = 'free' 
}) => {
  const isPremium = certification.isPremium;
  const isLocked = isPremium && userPlan === 'free';

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

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'iniciante':
        return CircleDot;
      case 'intermediário':
        return Circle;
      case 'avançado':
        return AlertTriangle;
      default:
        return Circle;
    }
  };

  const DifficultyIcon = getDifficultyIcon(certification.difficulty);

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
            <Crown className="w-3 h-3" />
            <span>Premium</span>
          </div>
        </div>
      )}

      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-muted/80 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Premium</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">{certification.provider.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{certification.name}</h3>
            <p className="text-sm text-muted-foreground">{certification.provider}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {certification.description}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <DifficultyIcon className={`w-4 h-4 ${getDifficultyColor(certification.difficulty)}`} />
            <span className="text-sm font-medium text-foreground">{certification.difficulty}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{certification.duration}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{certification.questionCount} questões</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500">{certification.successRate}% aprovação</span>
          </div>
        </div>
      </div>

      {/* Topics */}
      <div className="mb-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">PRINCIPAIS TÓPICOS</p>
        <div className="flex flex-wrap gap-1">
          {certification.topics.slice(0, 3).map((topic, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
            >
              {topic}
            </span>
          ))}
          {certification.topics.length > 3 && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
              +{certification.topics.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant={isSelected ? "default" : "outline"}
        className="w-full"
        disabled={isLocked}
        onClick={() => !isLocked && onSelect(certification)}
      >
        {isSelected ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Selecionado
          </>
        ) : (
          <>
            Selecionar
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default CertificationCard;
