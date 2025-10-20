import React from 'react';
import { LevelProgress } from '@/types/gamification';

interface XPBarProps {
  levelProgress: LevelProgress;
  className?: string;
}

export function XPBar({ levelProgress, className = '' }: XPBarProps) {
  return (
    <div className={`bg-gray-900 border-2 border-green-400 p-3 ${className}`}>
      {/* Header com nível */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-green-400 font-mono text-sm font-bold">
          NÍVEL {levelProgress.currentLevel}
        </span>
        <span className="text-green-300 font-mono text-xs">
          {levelProgress.currentXP}/{levelProgress.totalXPForNextLevel} XP
        </span>
      </div>
      
      {/* Barra de progresso 8-bit */}
      <div className="relative h-4 bg-gray-800 border border-green-600">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 ease-out"
          style={{ width: `${levelProgress.progress}%` }}
        />
        
        {/* Efeito pixelado na barra */}
        <div className="absolute inset-0 opacity-30">
          <div className="grid grid-cols-20 h-full">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className={`border-r border-green-600 ${
                  i < Math.floor(levelProgress.progress / 5) ? 'bg-green-300' : ''
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Brilho animado */}
        <div 
          className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"
          style={{ 
            left: `${Math.max(0, levelProgress.progress - 10)}%`,
            display: levelProgress.progress > 0 ? 'block' : 'none'
          }}
        />
      </div>
      
      {/* Próximo nível */}
      <div className="mt-2 text-center">
        <span className="text-green-300 font-mono text-xs">
          {levelProgress.xpForNextLevel} XP para o próximo nível
        </span>
      </div>
    </div>
  );
}