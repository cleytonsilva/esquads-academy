import React, { useState, useEffect } from 'react';
import { Heart, Clock } from 'lucide-react';
import { LifeSystem } from '@/types/gamification';

interface LifeCounterProps {
  lifeSystem: LifeSystem;
  className?: string;
}

export function LifeCounter({ lifeSystem, className = '' }: LifeCounterProps) {
  const [timeToRegen, setTimeToRegen] = useState<string>('');

  useEffect(() => {
    if (lifeSystem.current >= lifeSystem.max) return;

    const interval = setInterval(() => {
      const lastUsed = new Date(lifeSystem.lastUsed);
      const now = new Date();
      const timeSinceLastUse = now.getTime() - lastUsed.getTime();
      const regenTimeMs = lifeSystem.regenTime * 60 * 1000;
      const timeUntilRegen = regenTimeMs - (timeSinceLastUse % regenTimeMs);

      if (timeUntilRegen <= 0) {
        setTimeToRegen('Regenerando...');
      } else {
        const minutes = Math.floor(timeUntilRegen / (1000 * 60));
        const seconds = Math.floor((timeUntilRegen % (1000 * 60)) / 1000);
        setTimeToRegen(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lifeSystem]);

  return (
    <div className={`bg-gray-900 border-2 border-red-400 p-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-red-400 font-mono text-sm font-bold">VIDAS</span>
        <span className="text-red-300 font-mono text-xs">
          {lifeSystem.current}/{lifeSystem.max}
        </span>
      </div>
      
      {/* Corações 8-bit */}
      <div className="flex gap-1 mb-2">
        {Array.from({ length: lifeSystem.max }).map((_, i) => (
          <div key={i} className="relative">
            <Heart 
              className={`w-6 h-6 ${
                i < lifeSystem.current 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-gray-600 fill-gray-600'
              }`}
              style={{
                filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.8))',
                imageRendering: 'pixelated'
              }}
            />
            
            {/* Efeito de brilho para vidas ativas */}
            {i < lifeSystem.current && (
              <div className="absolute inset-0 animate-pulse">
                <Heart className="w-6 h-6 text-red-300 fill-red-300 opacity-50" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Timer de regeneração */}
      {lifeSystem.current < lifeSystem.max && (
        <div className="flex items-center gap-2 text-red-300 font-mono text-xs">
          <Clock className="w-3 h-3" />
          <span>Próxima vida: {timeToRegen}</span>
        </div>
      )}
      
      {/* Status completo */}
      {lifeSystem.current >= lifeSystem.max && (
        <div className="text-green-400 font-mono text-xs text-center">
          ✨ VIDAS COMPLETAS ✨
        </div>
      )}
    </div>
  );
}