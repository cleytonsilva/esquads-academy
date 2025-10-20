import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProgressIndicator from '../../components/ui/ProgressIndicator';
import UserStatusPanel from '../../components/ui/UserStatusPanel';
import QuickActionButton from '../../components/ui/QuickActionButton';
import OverallScoreCard from './components/OverallScoreCard';
import TopicBreakdownChart from './components/TopicBreakdownChart';
import XPRewardsPanel from './components/XPRewardsPanel';
import DetailedAnalysis from './components/DetailedAnalysis';
import MissionRecommendations from './components/MissionRecommendations';
import ActionButtons from './components/ActionButtons';
import Icon from '../../components/AppIcon';

const ExamResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  // Mock exam results data
  const examResults = {
    examType: "CompTIA Security+ SY0-601",
    score: 85,
    totalQuestions: 50,
    correctAnswers: 42,
    passingScore: 70,
    timeSpent: "45 min",
    maxTime: "90 min",
    isPassed: true,
    completedAt: new Date(),
    
    // XP and rewards
    baseXP: 500,
    accuracyBonus: 150,
    timeBonus: 75,
    streakBonus: 100,
    badges: [
      { id: 1, name: "Primeira Tentativa", icon: "Award", earned: true, xp: 50 },
      { id: 2, name: "Acima de 80%", icon: "Star", earned: true, xp: 100 },
      { id: 3, name: "Tempo Eficiente", icon: "Clock", earned: false, xp: 75 }
    ],
    isNewRecord: true,

    // Topic breakdown
    topicData: [
      { topic: "Network Security", score: 85, total: 10, correct: 8, benchmark: 75 },
      { topic: "Cryptography", score: 70, total: 8, correct: 6, benchmark: 70 },
      { topic: "Risk Management", score: 90, total: 12, correct: 11, benchmark: 80 },
      { topic: "Identity & Access", score: 65, total: 10, correct: 7, benchmark: 75 },
      { topic: "Incident Response", score: 95, total: 10, correct: 9, benchmark: 85 }
    ],

    // Detailed questions
    questions: [
      {
        id: 1,
        question: "Qual é o principal objetivo de um firewall de aplicação web (WAF)?",
        userAnswer: "Filtrar tráfego HTTP/HTTPS malicioso",
        correctAnswer: "Filtrar tráfego HTTP/HTTPS malicioso",
        isCorrect: true,
        topic: "Network Security",
        difficulty: "Médio",
        explanation: `Um WAF (Web Application Firewall) é projetado especificamente para filtrar, monitorar e bloquear tráfego HTTP/HTTPS malicioso de e para uma aplicação web.\n\nEle atua como uma barreira entre a aplicação web e a internet, analisando todas as requisições HTTP antes que cheguem ao servidor.`,
        timeSpent: 45
      },
      {
        id: 2,
        question: "Em criptografia, o que significa 'salt' em hash de senhas?",
        userAnswer: "Um valor aleatório adicionado à senha",
        correctAnswer: "Um valor aleatório adicionado à senha antes do hash",
        isCorrect: false,
        topic: "Cryptography",
        difficulty: "Difícil",
        explanation: `Salt é um valor aleatório que é adicionado à senha antes de aplicar a função hash.\n\nIsso previne ataques de rainbow table e torna cada hash único, mesmo para senhas idênticas.\n\nO salt deve ser único para cada senha e armazenado junto com o hash.`,
        timeSpent: 67
      }
    ],

    // Weak areas for recommendations
    weakAreas: [
      {
        topic: "Cryptography",
        score: 65,
        missions: [
          {
            id: 1,
            title: "Implementação de Hash Seguro",
            difficulty: "Médio",
            xp: 150,
            duration: "25 min",
            description: "Aprenda a implementar funções hash seguras com salt para proteção de senhas.",
            category: "Hands-on"
          },
          {
            id: 2,
            title: "Criptografia Simétrica vs Assimétrica",
            difficulty: "Básico",
            xp: 100,
            duration: "15 min",
            description: "Entenda as diferenças e aplicações de cada tipo de criptografia.",
            category: "Teórico"
          }
        ]
      },
      {
        topic: "Identity & Access",
        score: 70,
        missions: [
          {
            id: 3,
            title: "Configuração de Active Directory",
            difficulty: "Avançado",
            xp: 200,
            duration: "40 min",
            description: "Configure políticas de acesso e autenticação em ambiente corporativo.",
            category: "Simulação"
          }
        ]
      }
    ]
  };

  // User status data
  const userStatus = {
    xp: 2847,
    lives: 4,
    maxLives: 5,
    level: 15,
    nextLevelXp: 3000,
    badges: [
      { name: "Security Expert", icon: "Shield", isNew: true },
      { name: "Quick Learner", icon: "Zap", isNew: false },
      { name: "Perfectionist", icon: "Star", isNew: true }
    ]
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Certificações', path: '/certification-selector', icon: 'FileText' },
    { label: 'Exame', path: '/exam-interface', icon: 'PenTool' },
    { label: 'Resultados', icon: 'BarChart3' }
  ];

  // Quick action buttons
  const quickActions = [
    {
      label: 'Refazer Exame',
      icon: 'RotateCcw',
      onClick: () => navigate('/certification-selector', { 
        state: { selectedExam: examResults?.examType, retakeMode: true } 
      })
    },
    {
      label: 'Estudar Mais',
      icon: 'BookOpen',
      onClick: () => navigate('/mission-selection', { 
        state: { fromExamResults: true, examType: examResults?.examType } 
      })
    },
    {
      label: 'Explorar Missões',
      icon: 'Target',
      onClick: () => navigate('/mission-selection')
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (examResults?.isPassed) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [examResults?.isPassed]);

  const handleShare = () => {
    const shareText = `Acabei de completar o exame ${examResults?.examType} na plataforma Esquads! ${examResults?.isPassed ? '✅ Aprovado com ' + Math.round((examResults?.correctAnswers / examResults?.totalQuestions) * 100) + '%!' : '📚 Vou estudar mais e tentar novamente!'}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Esquads - Resultado do Exame',
        text: shareText,
        url: window.location?.href
      });
    } else {
      navigator.clipboard?.writeText(`${shareText} ${window.location?.href}`);
      // Could show a toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-nav">
          <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium text-foreground">Processando resultados...</p>
              <p className="text-sm text-muted-foreground mt-2">Calculando pontuação e recompensas</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Celebration Overlay */}
      {showCelebration && examResults?.isPassed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100 animate-fade-in">
          <div className="bg-card border border-border rounded-lg p-8 text-center max-w-md mx-4 animate-scale-in">
            <div className="w-20 h-20 bg-gradient-to-br from-success to-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Trophy" size={40} color="white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Parabéns! 🎉</h2>
            <p className="text-muted-foreground mb-4">
              Você foi aprovado no exame {examResults?.examType}!
            </p>
            <p className="text-lg font-semibold text-success">
              {Math.round((examResults?.correctAnswers / examResults?.totalQuestions) * 100)}% de aproveitamento
            </p>
          </div>
        </div>
      )}
      <main className="pt-nav">
        <div className="container mx-auto px-section py-section">
          {/* Header Section */}
          <div className="mb-8">
            <Breadcrumb items={breadcrumbItems} className="mb-4" />
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                  Resultados do Exame
                </h1>
                <p className="text-muted-foreground">
                  Análise completa do seu desempenho em {examResults?.examType}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <UserStatusPanel 
                  {...userStatus}
                  compact={true}
                  className="sm:w-auto"
                />
                <ProgressIndicator
                  currentStep={5}
                  totalSteps={5}
                  context="exam"
                  title="Exame Concluído"
                  className="sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Main Results */}
            <div className="xl:col-span-2 space-y-8">
              {/* Overall Score */}
              <OverallScoreCard
                score={examResults?.score}
                totalQuestions={examResults?.totalQuestions}
                correctAnswers={examResults?.correctAnswers}
                passingScore={examResults?.passingScore}
                examType={examResults?.examType}
                timeSpent={examResults?.timeSpent}
                maxTime={examResults?.maxTime}
              />

              {/* Topic Breakdown */}
              <TopicBreakdownChart topicData={examResults?.topicData} />

              {/* Detailed Analysis */}
              <DetailedAnalysis 
                questions={examResults?.questions}
                averageTime={56}
              />

              {/* Mission Recommendations */}
              <MissionRecommendations weakAreas={examResults?.weakAreas} />
            </div>

            {/* Right Column - Rewards & Actions */}
            <div className="space-y-8">
              {/* XP Rewards */}
              <XPRewardsPanel
                baseXP={examResults?.baseXP}
                accuracyBonus={examResults?.accuracyBonus}
                timeBonus={examResults?.timeBonus}
                streakBonus={examResults?.streakBonus}
                badges={examResults?.badges}
                isNewRecord={examResults?.isNewRecord}
              />

              {/* Action Buttons */}
              <ActionButtons
                examType={examResults?.examType}
                isPassed={examResults?.isPassed}
                canRetake={true}
                hasStudyPlan={true}
                onShare={handleShare}
              />
            </div>
          </div>
        </div>
      </main>
      {/* Quick Action FAB */}
      <QuickActionButton
        actions={quickActions}
        context={examResults?.isPassed ? 'continue' : 'retry'}
        position="bottom-right"
      />
    </div>
  );
};

export default ExamResults;