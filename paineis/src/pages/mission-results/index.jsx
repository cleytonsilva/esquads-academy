import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import UserStatusPanel from '../../components/ui/UserStatusPanel';
import QuickActionButton from '../../components/ui/QuickActionButton';
import CelebrationHeader from './components/CelebrationHeader';
import BadgeShowcase from './components/BadgeShowcase';
import PerformanceBreakdown from './components/PerformanceBreakdown';
import ProgressIndicators from './components/ProgressIndicators';
import ActionButtons from './components/ActionButtons';
import SocialSharing from './components/SocialSharing';

const MissionResults = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [missionData, setMissionData] = useState(null);

  // Mock mission result data
  const mockMissionResult = {
    missionId: "firewall-config-01",
    missionTitle: "Configuração de Firewall Básico",
    category: "Firewall",
    difficulty: "Intermediário",
    completedAt: new Date(),
    performance: {
      xpEarned: 250,
      accuracy: 92,
      completionTime: "4:32",
      masteryLevel: "Expert",
      hintsUsed: 2,
      commandsExecuted: 15,
      correctCommands: 14,
      baseXP: 100,
      accuracyBonus: 100,
      timeBonus: 50
    },
    badges: [
      {
        id: 'firewall-expert',
        name: 'Especialista em Firewall',
        description: 'Configurou regras de firewall com 95% de precisão',
        icon: 'Shield',
        rarity: 'epic',
        isNew: true
      },
      {
        id: 'speed-demon',
        name: 'Demônio da Velocidade',
        description: 'Completou a missão em menos de 5 minutos',
        icon: 'Zap',
        rarity: 'rare',
        isNew: true
      }
    ],
    nextMission: {
      id: "firewall-advanced-01",
      title: "Configuração Avançada de Firewall",
      available: true
    },
    canRetry: true
  };

  useEffect(() => {
    // Simulate loading mission results
    const timer = setTimeout(() => {
      const resultData = location?.state?.missionResult || mockMissionResult;
      setMissionData(resultData);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [location?.state]);

  const breadcrumbItems = [
    { label: 'Missões', path: '/mission-selection', icon: 'Target' },
    { label: 'Gameplay', path: '/mission-gameplay', icon: 'Play' },
    { label: 'Resultados', icon: 'BarChart3' }
  ];

  const quickActions = [
    {
      label: 'Próxima Missão',
      icon: 'ArrowRight',
      onClick: () => console.log('Next mission'),
      disabled: !missionData?.nextMission?.available
    },
    {
      label: 'Tentar Novamente',
      icon: 'RotateCcw',
      onClick: () => console.log('Retry mission'),
      disabled: !missionData?.canRetry
    },
    {
      label: 'Compartilhar',
      icon: 'Share2',
      onClick: () => console.log('Share results')
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-nav">
          <div className="container mx-auto px-section py-content">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <div className="w-8 h-8 bg-primary-foreground rounded-full"></div>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Processando Resultados...
                </h2>
                <p className="text-muted-foreground">
                  Calculando sua performance e conquistas
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!missionData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-nav">
          <div className="container mx-auto px-section py-content">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Resultados não encontrados
              </h1>
              <p className="text-muted-foreground mb-6">
                Não foi possível carregar os resultados da missão.
              </p>
              <ActionButtons />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-nav">
        <div className="container mx-auto px-section py-content">
          {/* Navigation */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <Breadcrumb items={breadcrumbItems} />
            <UserStatusPanel 
              xp={1247 + missionData?.performance?.xpEarned}
              lives={3}
              badges={missionData?.badges}
              compact={true}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Main Results */}
            <div className="xl:col-span-2 space-y-8">
              {/* Celebration Header */}
              <CelebrationHeader
                missionTitle={missionData?.missionTitle}
                xpEarned={missionData?.performance?.xpEarned}
                accuracy={missionData?.performance?.accuracy}
                completionTime={missionData?.performance?.completionTime}
                masteryLevel={missionData?.performance?.masteryLevel}
              />

              {/* Badge Showcase */}
              <BadgeShowcase
                newBadges={missionData?.badges}
                showAnimation={true}
              />

              {/* Performance Breakdown */}
              <PerformanceBreakdown
                accuracy={missionData?.performance?.accuracy}
                completionTime={missionData?.performance?.completionTime}
                hintsUsed={missionData?.performance?.hintsUsed}
                commandsExecuted={missionData?.performance?.commandsExecuted}
                correctCommands={missionData?.performance?.correctCommands}
                timeBonus={missionData?.performance?.timeBonus}
                accuracyBonus={missionData?.performance?.accuracyBonus}
                baseXP={missionData?.performance?.baseXP}
              />

              {/* Action Buttons */}
              <ActionButtons
                missionId={missionData?.missionId}
                canRetry={missionData?.canRetry}
                hasNextMission={missionData?.nextMission?.available}
                nextMissionId={missionData?.nextMission?.id}
              />
            </div>

            {/* Right Column - Progress & Social */}
            <div className="space-y-8">
              {/* Progress Indicators */}
              <ProgressIndicators
                currentLevel={12}
                currentXP={1247 + missionData?.performance?.xpEarned}
                nextLevelXP={1500}
                totalMissionsCompleted={25}
                totalMissions={50}
                weeklyProgress={85}
              />

              {/* Social Sharing */}
              <SocialSharing
                missionTitle={missionData?.missionTitle}
                xpEarned={missionData?.performance?.xpEarned}
                accuracy={missionData?.performance?.accuracy}
                masteryLevel={missionData?.performance?.masteryLevel}
                badges={missionData?.badges}
              />
            </div>
          </div>
        </div>
      </main>
      {/* Quick Action Button */}
      <QuickActionButton
        actions={quickActions}
        context="results"
        position="bottom-right"
      />
    </div>
  );
};

export default MissionResults;