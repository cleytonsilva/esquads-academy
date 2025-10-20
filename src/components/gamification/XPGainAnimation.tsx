import React, { useState, useEffect } from 'react';
import { XPGain } from '@/types/gamification';

interface XPGainAnimationProps {
  xpGain: XPGain;
  onComplete?: () => void;
}

export function XPGainAnimation({ xpGain, onComplete }: XPGainAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'float' | 'exit'>('enter');

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationPhase('float'), 200);
    const timer2 = setTimeout(() => setAnimationPhase('exit'), 1500);
    const timer3 = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 'enter':
        return 'scale-150 opacity-100 translate-y-0';
      case 'float':
        return 'scale-100 opacity-100 -translate-y-8';
      case 'exit':
        return 'scale-75 opacity-0 -translate-y-16';
      default:
        return '';
    }
  };

  const getSourceColor = () => {
    switch (xpGain.source) {
      case 'mission_complete':
        return 'text-green-400';
      case 'simulation_complete':
        return 'text-blue-400';
      case 'streak_bonus':
        return 'text-yellow-400';
      case 'daily_login':
        return 'text-purple-400';
      default:
        return 'text-green-400';
    }
  };

  const getSourceIcon = () => {
    switch (xpGain.source) {
      case 'mission_complete':
        return '🎯';
      case 'simulation_complete':
        return '🧪';
      case 'streak_bonus':
        return '🔥';
      case 'daily_login':
        return '📅';
      default:
        return '⭐';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div 
        className={`
          transform transition-all duration-500 ease-out
          ${getAnimationClasses()}
        `}
      >
        <div className="bg-gray-900 border-2 border-green-400 p-4 rounded-lg shadow-2xl">
          <div className="text-center">
            {/* Ícone da fonte */}
            <div className="text-4xl mb-2">
              {getSourceIcon()}
            </div>
            
            {/* Quantidade de XP */}
            <div className={`font-mono text-2xl font-bold ${getSourceColor()}`}>
              +{xpGain.amount} XP
            </div>
            
            {/* Descrição */}
            <div className="text-green-300 font-mono text-sm mt-1">
              {xpGain.description}
            </div>
          </div>
          
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-10 rounded-lg" />
          
          {/* Partículas animadas */}
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-green-400 rounded-full animate-ping"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${30 + (i % 2) * 40}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}