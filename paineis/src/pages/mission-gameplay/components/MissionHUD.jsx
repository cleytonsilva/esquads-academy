import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const MissionHUD = ({ 
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
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
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Mission Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Icon name="Target" size={20} color="white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{missionData?.title}</h3>
                <p className="text-xs text-muted-foreground">{missionData?.category}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="hidden md:flex items-center space-x-2">
              <Icon name="Activity" size={16} className="text-muted-foreground" />
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
              <Icon name="Zap" size={16} color="var(--color-accent)" />
              <span className="font-semibold text-foreground text-sm">
                {currentXP?.toLocaleString()} XP
              </span>
            </div>

            {/* Lives (Free Plan Only) */}
            {userPlan === 'free' && (
              <div className="flex items-center space-x-2">
                <Icon name="Heart" size={16} color="var(--color-error)" />
                <div className="flex space-x-1">
                  {Array.from({ length: maxLives }, (_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index < livesRemaining ? 'bg-error' : 'bg-muted'
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
              <Icon name="Clock" size={16} className="text-muted-foreground" />
              <span className="font-mono text-sm font-medium text-foreground">
                {formatTime(displayTime)}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onPause}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title={isPaused ? 'Continuar' : 'Pausar'}
              >
                <Icon 
                  name={isPaused ? "Play" : "Pause"} 
                  size={16} 
                  className="text-muted-foreground hover:text-foreground" 
                />
              </button>
              <button
                onClick={handleExitClick}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Sair da Missão"
              >
                <Icon name="X" size={16} className="text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden mt-3 flex items-center space-x-2">
          <Icon name="Activity" size={14} className="text-muted-foreground" />
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
      </div>
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-warning bg-opacity-20 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} color="var(--color-warning)" />
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
              <button
                onClick={cancelExit}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Icon name="Pause" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Missão Pausada</h3>
            <p className="text-muted-foreground mb-6">Clique em continuar quando estiver pronto</p>
            <button
              onClick={onPause}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
              Continuar Missão
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MissionHUD;