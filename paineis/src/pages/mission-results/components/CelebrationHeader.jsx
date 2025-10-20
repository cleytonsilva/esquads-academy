import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const CelebrationHeader = ({ 
  missionTitle = "Firewall Configuration Challenge",
  xpEarned = 250,
  accuracy = 92,
  completionTime = "4:32",
  masteryLevel = "Expert"
}) => {
  const [animationPhase, setAnimationPhase] = useState('initial');
  const [displayXP, setDisplayXP] = useState(0);

  useEffect(() => {
    // Animation sequence
    const timer1 = setTimeout(() => setAnimationPhase('celebration'), 500);
    const timer2 = setTimeout(() => setAnimationPhase('xp-count'), 1500);
    
    // XP counter animation
    const timer3 = setTimeout(() => {
      let current = 0;
      const increment = xpEarned / 30;
      const counter = setInterval(() => {
        current += increment;
        if (current >= xpEarned) {
          setDisplayXP(xpEarned);
          clearInterval(counter);
        } else {
          setDisplayXP(Math.floor(current));
        }
      }, 50);
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [xpEarned]);

  const getMasteryColor = () => {
    switch (masteryLevel?.toLowerCase()) {
      case 'expert':
        return 'var(--color-success)';
      case 'advanced':
        return 'var(--color-primary)';
      case 'intermediate':
        return 'var(--color-accent)';
      default:
        return 'var(--color-secondary)';
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 text-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-8 gap-4 h-full">
          {Array.from({ length: 32 }, (_, i) => (
            <div key={i} className="bg-primary rounded-sm"></div>
          ))}
        </div>
      </div>
      {/* Celebration Animation */}
      {animationPhase !== 'initial' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-accent rounded-full animate-bounce`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 100}ms`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      )}
      {/* Success Icon */}
      <div className={`
        inline-flex items-center justify-center w-20 h-20 rounded-full mb-6
        bg-success text-success-foreground transition-all duration-500
        ${animationPhase !== 'initial' ? 'animate-achievement scale-110' : 'scale-100'}
      `}>
        <Icon name="Trophy" size={40} />
      </div>
      {/* Mission Complete */}
      <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
        Missão Concluída!
      </h1>
      <p className="text-lg text-muted-foreground mb-6">
        {missionTitle}
      </p>
      {/* XP Display */}
      <div className={`
        inline-flex items-center space-x-3 px-6 py-4 rounded-xl mb-6
        bg-accent/20 border-2 border-accent/30 transition-all duration-500
        ${animationPhase === 'xp-count' ? 'animate-glow' : ''}
      `}>
        <Icon name="Zap" size={32} color="var(--color-accent)" />
        <div className="text-left">
          <div className="text-3xl font-bold text-foreground">
            +{displayXP?.toLocaleString()} XP
          </div>
          <div className="text-sm text-muted-foreground">
            Experiência Ganha
          </div>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{accuracy}%</div>
          <div className="text-xs text-muted-foreground">Precisão</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{completionTime}</div>
          <div className="text-xs text-muted-foreground">Tempo</div>
        </div>
        <div className="text-center">
          <div 
            className="text-2xl font-bold"
            style={{ color: getMasteryColor() }}
          >
            {masteryLevel}
          </div>
          <div className="text-xs text-muted-foreground">Nível</div>
        </div>
      </div>
    </div>
  );
};

export default CelebrationHeader;