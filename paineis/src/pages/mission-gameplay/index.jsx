import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActionButton from '../../components/ui/QuickActionButton';
import SimulatorTerminal from './components/SimulatorTerminal';
import BotGuidancePanel from './components/BotGuidancePanel';
import MissionHUD from './components/MissionHUD';
import ObjectiveTracker from './components/ObjectiveTracker';

const MissionGameplay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get mission data from navigation state or use default
  const missionData = location?.state?.mission || {
    id: 1,
    title: "Configuração Básica de Firewall",
    category: "Firewall",
    difficulty: "Iniciante",
    xpReward: 150,
    estimatedTime: "15 min",
    description: "Aprenda a configurar regras básicas de firewall para proteger um servidor web."
  };

  // Game state
  const [currentStep, setCurrentStep] = useState(1);
  const [missionProgress, setMissionProgress] = useState(0);
  const [currentXP, setCurrentXP] = useState(1247);
  const [livesRemaining, setLivesRemaining] = useState(3);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [commandResult, setCommandResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mission objectives based on category
  const objectives = [
    {
      title: "Verificar status atual do sistema",
      description: "Use comandos de listagem para entender o ambiente atual",
      xpReward: 25,
      hint: "Tente usar \'ls\' ou \'help\' para começar"
    },
    {
      title: "Analisar configurações de rede",
      description: "Examine as conexões e portas ativas no sistema",
      xpReward: 30,
      hint: "Comandos como 'netstat' podem ser úteis aqui"
    },
    {
      title: "Implementar regras de firewall",
      description: "Configure as regras necessárias para proteger o servidor",
      xpReward: 50,
      hint: "Use \'iptables\' ou \'ufw\' para configurar o firewall"
    },
    {
      title: "Validar configurações",
      description: "Verifique se as regras foram aplicadas corretamente",
      xpReward: 30,
      hint: "Teste as configurações com comandos de verificação"
    },
    {
      title: "Documentar resultado",
      description: "Finalize a missão salvando as configurações",
      xpReward: 15,
      hint: "Use comandos de backup ou documentação"
    }
  ];

  // Update progress based on current step
  useEffect(() => {
    const progress = ((currentStep - 1) / objectives?.length) * 100;
    setMissionProgress(progress);
  }, [currentStep, objectives?.length]);

  const handleCommandExecute = (command, isCorrect, response) => {
    setLastCommand(command);
    setCommandResult({ isCorrect, response });
    
    if (isCorrect) {
      // Award XP for correct command
      const xpGain = Math.floor(Math.random() * 20) + 10;
      setCurrentXP(prev => prev + xpGain);
      
      // Progress to next step if command was significant
      if (command !== 'help' && command !== 'clear' && command !== 'ls') {
        if (currentStep < objectives?.length) {
          setTimeout(() => {
            setCurrentStep(prev => prev + 1);
          }, 1000);
        }
      }
    } else {
      // Lose a life for incorrect command (Free plan only)
      setLivesRemaining(prev => Math.max(0, prev - 1));
    }
  };

  const handleProgressUpdate = (step, progress) => {
    setCurrentStep(step);
    setMissionProgress(progress);
  };

  const handleHintRequest = (step) => {
    // Small XP penalty for requesting hints
    setCurrentXP(prev => Math.max(0, prev - 5));
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleExit = () => {
    navigate('/mission-selection');
  };

  const handleMissionComplete = () => {
    // Calculate final XP bonus
    const timeBonus = Math.max(0, 300 - timeElapsed); // Bonus for completing quickly
    const accuracyBonus = Math.floor((livesRemaining / 5) * 50); // Bonus for accuracy
    const totalXP = missionData?.xpReward + timeBonus + accuracyBonus;
    
    navigate('/mission-results', {
      state: {
        mission: missionData,
        results: {
          completed: true,
          timeElapsed,
          xpEarned: totalXP,
          livesUsed: 5 - livesRemaining,
          accuracy: Math.round((livesRemaining / 5) * 100),
          objectives: objectives?.map((obj, index) => ({
            ...obj,
            completed: index < currentStep,
            completedAt: index < currentStep ? `${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60)?.toString()?.padStart(2, '0')}` : null
          }))
        }
      }
    });
  };

  // Check if mission is complete
  useEffect(() => {
    if (currentStep > objectives?.length) {
      setTimeout(handleMissionComplete, 2000);
    }
  }, [currentStep]);

  // Quick actions for the floating button
  const quickActions = [
    {
      label: 'Pausar Missão',
      icon: isPaused ? 'Play' : 'Pause',
      onClick: handlePause
    },
    {
      label: 'Sair da Missão',
      icon: 'X',
      onClick: handleExit
    }
  ];

  const breadcrumbItems = [
    { label: 'Missões', path: '/mission-selection', icon: 'Target' },
    { label: missionData?.title, icon: 'Play' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-nav">
        {/* Breadcrumb */}
        <div className="px-section py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Mission HUD */}
        <div className="px-section mb-4">
          <MissionHUD
            missionData={missionData}
            currentXP={currentXP}
            livesRemaining={livesRemaining}
            maxLives={5}
            missionProgress={missionProgress}
            timeElapsed={timeElapsed}
            isPaused={isPaused}
            onPause={handlePause}
            onExit={handleExit}
            userPlan="free"
          />
        </div>

        {/* Main Gameplay Area */}
        <div className="px-section pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-280px)]">
            {/* Simulator Terminal - Main Area */}
            <div className="lg:col-span-2 order-1 lg:order-1">
              <SimulatorTerminal
                missionData={missionData}
                onCommandExecute={handleCommandExecute}
                onProgressUpdate={handleProgressUpdate}
                currentStep={currentStep}
                isLoading={isLoading}
              />
            </div>

            {/* Bot Guidance Panel */}
            <div className="lg:col-span-1 order-3 lg:order-2">
              <BotGuidancePanel
                missionData={missionData}
                currentStep={currentStep}
                lastCommand={lastCommand}
                commandResult={commandResult}
                onHintRequest={handleHintRequest}
                userProgress={missionProgress}
              />
            </div>

            {/* Objectives Tracker */}
            <div className="lg:col-span-1 order-2 lg:order-3">
              <ObjectiveTracker
                objectives={objectives}
                currentStep={currentStep}
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout Adjustments */}
        <div className="lg:hidden px-section pb-20">
          {/* Mobile-specific spacing for floating action button */}
        </div>
      </main>

      {/* Quick Action Button */}
      <QuickActionButton
        actions={quickActions}
        context="mission"
        position="bottom-right"
      />
    </div>
  );
};

export default MissionGameplay;