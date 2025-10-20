import React, { useState, useEffect } from 'react';
import { Target, Activity, Zap, Heart, Clock, Play, Pause, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

interface MissionHUDProps {
  missionData?: {
    title: string;
    category: string;
  };
  currentXP?: number;
  livesRemaining?: number;
  maxLives?: number;
  missionProgress?: number;
  timeElapsed?: number;
  isPaused?: boolean;
  onPause?: () => void;
  onExit?: () => void;
  userPlan?: 'free' | 'premium';
}

const MissionHUD: React.FC<MissionHUDProps> = ({ 
  missionData, 
  currentXP = 1247, 
  livesRemaining = 3, 
  maxLives = 5,
  missionProgress = 0,
  timeElapsed = 0,
  isPaused = false,
  onPause,
  onExit,
  userPlan = 'free' 
}) => {
  const [displayTime, setDisplayTime] = useState(timeElapsed);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setDisplayTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (missionProgress < 25) return 'bg-red-500';
    if (missionProgress < 50) return 'bg-yellow-500';
    if (missionProgress < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const handleExitClick = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    if (onExit) {
      onExit();
    }
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  return (
    <>
      {/* Main HUD */}
      <Card className="p-4 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Mission Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{missionData?.title}</h3>
                <p className="text-xs text-muted-foreground">{missionData?.category}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="hidden md:flex items-center space-x-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <div className="w-32 bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                  style={{ width: `${missionProgress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground min-w-[3rem]">
                {Math.round(missionProgress)}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6">
            {/* XP Display */}
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="font-semibold text-foreground text-sm">
                {currentXP?.toLocaleString()} XP
              </span>
            </div>

            {/* Lives (Free Plan Only) */}
            {userPlan === 'free' && (
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <div className="flex space-x-1">
                  {Array.from({ length: maxLives }, (_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index < livesRemaining ? 'bg-red-500' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {livesRemaining}
                </span>
              </div>
            )}

            {/* Timer */}
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-sm font-medium text-foreground">
                {formatTime(displayTime)}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPause}
                className="p-2"
                title={isPaused ? 'Continuar' : 'Pausar'}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExitClick}
                className="p-2"
                title="Sair da Missão"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden mt-3 flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-muted-foreground" />
          <div className="flex-1 bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${missionProgress}%` }}
            />
          </div>
          <span className="text-xs font-medium text-foreground">
            {Math.round(missionProgress)}%
          </span>
        </div>
      </Card>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-warning bg-opacity-20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Sair da Missão?</h3>
                <p className="text-sm text-muted-foreground">Seu progresso será perdido</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Você tem certeza que deseja sair desta missão? Todo o progresso atual será perdido e você precisará recomeçar do início.
            </p>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={cancelExit}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmExit}
                className="flex-1"
              >
                Sair
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
          <Card className="p-8 text-center">
            <Pause className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Missão Pausada</h3>
            <p className="text-muted-foreground mb-6">Clique em continuar quando estiver pronto</p>
            <Button
              onClick={onPause}
              className="px-6 py-2"
            >
              Continuar Missão
            </Button>
          </Card>
        </div>
      )}
    </>
  );
};

export default MissionHUD;