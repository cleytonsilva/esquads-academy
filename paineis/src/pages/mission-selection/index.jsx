import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import UserStatusPanel from '../../components/ui/UserStatusPanel';
import ProgressIndicator from '../../components/ui/ProgressIndicator';
import QuickActionButton from '../../components/ui/QuickActionButton';
import MissionFilters from './components/MissionFilters';
import MissionGrid from './components/MissionGrid';
import ProgressionPath from './components/ProgressionPath';


const MissionSelection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // User data
  const [userPlan] = useState('free'); // Could be 'premium'
  const [userProgress] = useState({
    level: 2,
    xp: 1247,
    lives: 3,
    completedMissions: 12,
    badges: [
      { name: 'Primeiro Firewall', icon: 'Shield', isNew: false },
      { name: 'Analista Forense', icon: 'Search', isNew: true },
      { name: 'Especialista Cloud', icon: 'Cloud', isNew: false }
    ]
  });

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    difficulty: 'all',
    status: 'all',
    sortBy: 'recommended'
  });

  // Mock missions data
  const allMissions = [
    {
      id: 1,
      title: "Configuração Básica de Firewall",
      description: "Aprenda os fundamentos de configuração de firewall para proteger redes corporativas contra ameaças externas.",
      category: "Firewall",
      categoryIcon: "Shield",
      difficulty: "Iniciante",
      duration: "15 min",
      xpReward: 100,
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=240&fit=crop",
      progress: 0,
      isLocked: false,
      isPremium: false,
      tools: ["iptables", "pfSense"],
      badges: [
        { name: "Guardião da Rede", icon: "Shield" },
        { name: "Primeiro Firewall", icon: "Award" }
      ],
      prerequisites: []
    },
    {
      id: 2,
      title: "Análise de Logs de Segurança",
      description: "Desenvolva habilidades para identificar padrões suspeitos em logs de sistema e detectar tentativas de invasão.",
      category: "Forense Digital",
      categoryIcon: "Search",
      difficulty: "Intermediário",
      duration: "25 min",
      xpReward: 200,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=240&fit=crop",
      progress: 65,
      isLocked: false,
      isPremium: false,
      tools: ["Splunk", "ELK Stack", "Wireshark"],
      badges: [
        { name: "Analista Forense", icon: "Search" },
        { name: "Caçador de Logs", icon: "FileText" }
      ],
      prerequisites: ["Configuração Básica de Firewall"]
    },
    {
      id: 3,
      title: "Segurança em AWS Cloud",
      description: "Implemente controles de segurança avançados em ambientes de nuvem AWS, incluindo IAM e VPC.",
      category: "Segurança em Nuvem",
      categoryIcon: "Cloud",
      difficulty: "Avançado",
      duration: "45 min",
      xpReward: 350,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=240&fit=crop",
      progress: 100,
      isLocked: false,
      isPremium: true,
      tools: ["AWS CLI", "CloudTrail", "GuardDuty"],
      badges: [
        { name: "Especialista Cloud", icon: "Cloud" },
        { name: "AWS Security Pro", icon: "Award" },
        { name: "Arquiteto de Nuvem", icon: "Crown" }
      ],
      prerequisites: ["Análise de Logs de Segurança"]
    },
    {
      id: 4,
      title: "Teste de Penetração Web",
      description: "Execute testes de penetração em aplicações web para identificar vulnerabilidades OWASP Top 10.",
      category: "Teste de Penetração",
      categoryIcon: "Target",
      difficulty: "Avançado",
      duration: "60 min",
      xpReward: 400,
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=240&fit=crop",
      progress: 0,
      isLocked: true,
      isPremium: true,
      tools: ["Burp Suite", "OWASP ZAP", "Nmap"],
      badges: [
        { name: "Ethical Hacker", icon: "Target" },
        { name: "Web Security Expert", icon: "Globe" }
      ],
      prerequisites: ["Segurança em AWS Cloud", "Análise de Vulnerabilidades"]
    },
    {
      id: 5,
      title: "Resposta a Incidentes",
      description: "Aprenda metodologias de resposta a incidentes de segurança e contenção de ameaças.",
      category: "Resposta a Incidentes",
      categoryIcon: "AlertTriangle",
      difficulty: "Intermediário",
      duration: "35 min",
      xpReward: 250,
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=240&fit=crop",
      progress: 0,
      isLocked: false,
      isPremium: false,
      tools: ["SIEM", "Volatility", "Autopsy"],
      badges: [
        { name: "Respondedor de Incidentes", icon: "AlertTriangle" },
        { name: "Caçador de Ameaças", icon: "Eye" }
      ],
      prerequisites: ["Análise de Logs de Segurança"]
    },
    {
      id: 6,
      title: "Segurança de Rede Avançada",
      description: "Implemente soluções avançadas de segurança de rede incluindo IDS/IPS e monitoramento de tráfego.",
      category: "Segurança de Rede",
      categoryIcon: "Network",
      difficulty: "Avançado",
      duration: "50 min",
      xpReward: 300,
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=240&fit=crop",
      progress: 0,
      isLocked: false,
      isPremium: true,
      tools: ["Snort", "Suricata", "pfSense"],
      badges: [
        { name: "Guardião da Rede", icon: "Network" },
        { name: "IDS/IPS Master", icon: "Shield" }
      ],
      prerequisites: ["Configuração Básica de Firewall"]
    }
  ];

  // Filter and sort missions
  const filteredMissions = useMemo(() => {
    let filtered = [...allMissions];

    // Search filter
    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(mission =>
        mission?.title?.toLowerCase()?.includes(searchTerm) ||
        mission?.description?.toLowerCase()?.includes(searchTerm) ||
        mission?.category?.toLowerCase()?.includes(searchTerm) ||
        mission?.tools?.some(tool => tool?.toLowerCase()?.includes(searchTerm))
      );
    }

    // Category filter
    if (filters?.category !== 'all') {
      filtered = filtered?.filter(mission =>
        mission?.category?.toLowerCase()?.replace(/\s+/g, '-') === filters?.category
      );
    }

    // Difficulty filter
    if (filters?.difficulty !== 'all') {
      filtered = filtered?.filter(mission =>
        mission?.difficulty?.toLowerCase() === filters?.difficulty
      );
    }

    // Status filter
    if (filters?.status !== 'all') {
      filtered = filtered?.filter(mission => {
        switch (filters?.status) {
          case 'available':
            return !mission?.isLocked && mission?.progress === 0;
          case 'in-progress':
            return mission?.progress > 0 && mission?.progress < 100;
          case 'completed':
            return mission?.progress === 100;
          case 'locked':
            return mission?.isLocked;
          default:
            return true;
        }
      });
    }

    // Sort missions
    filtered?.sort((a, b) => {
      const diffOrder = { 'iniciante': 1, 'intermediário': 2, 'avançado': 3 };
      
      switch (filters?.sortBy) {
        case 'difficulty-asc':
          return diffOrder?.[a?.difficulty?.toLowerCase()] - diffOrder?.[b?.difficulty?.toLowerCase()];
        case 'difficulty-desc':
          const diffOrderDesc = { 'iniciante': 3, 'intermediário': 2, 'avançado': 1 };
          return diffOrderDesc?.[a?.difficulty?.toLowerCase()] - diffOrderDesc?.[b?.difficulty?.toLowerCase()];
        case 'xp-asc':
          return a?.xpReward - b?.xpReward;
        case 'xp-desc':
          return b?.xpReward - a?.xpReward;
        case 'duration-asc':
          return parseInt(a?.duration) - parseInt(b?.duration);
        case 'duration-desc':
          return parseInt(b?.duration) - parseInt(a?.duration);
        case 'recommended':
        default:
          // Recommended: available first, then by difficulty, then by XP
          if (a?.isLocked !== b?.isLocked) return a?.isLocked ? 1 : -1;
          if (a?.progress !== b?.progress) return a?.progress - b?.progress;
          return diffOrder?.[a?.difficulty?.toLowerCase()] - diffOrder?.[b?.difficulty?.toLowerCase()];
      }
    });

    return filtered;
  }, [filters, allMissions]);

  // Mission counts for filters
  const missionCounts = useMemo(() => {
    return {
      total: allMissions?.length,
      available: allMissions?.filter(m => !m?.isLocked && m?.progress === 0)?.length,
      completed: allMissions?.filter(m => m?.progress === 100)?.length,
      inProgress: allMissions?.filter(m => m?.progress > 0 && m?.progress < 100)?.length,
      locked: allMissions?.filter(m => m?.isLocked)?.length
    };
  }, [allMissions]);

  // Quick actions
  const quickActions = [
    {
      label: 'Ver Certificações',
      icon: 'Award',
      onClick: () => navigate('/certification-selector')
    },
    {
      label: 'Meus Resultados',
      icon: 'BarChart3',
      onClick: () => navigate('/mission-results')
    }
  ];

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const breadcrumbItems = [
    { label: 'Seleção de Missões', icon: 'Target' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-nav">
        <div className="max-w-7xl mx-auto px-section py-8 space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <Breadcrumb items={breadcrumbItems} />
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Missões de Cybersegurança
                </h1>
                <p className="text-muted-foreground">
                  Escolha uma missão para praticar suas habilidades e ganhar XP
                </p>
              </div>
              
              {/* User Status - Desktop */}
              <div className="hidden lg:block">
                <UserStatusPanel
                  xp={userProgress?.xp}
                  lives={userProgress?.lives}
                  badges={userProgress?.badges}
                  level={userProgress?.level}
                  compact={true}
                />
              </div>
            </div>
          </div>

          {/* Mobile User Status */}
          <div className="lg:hidden">
            <UserStatusPanel
              xp={userProgress?.xp}
              lives={userProgress?.lives}
              badges={userProgress?.badges}
              level={userProgress?.level}
            />
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProgressIndicator
                currentStep={userProgress?.completedMissions}
                totalSteps={allMissions?.length}
                context="mission"
                title="Progresso das Missões"
              />
            </div>
            <div className="hidden lg:block">
              <ProgressionPath
                userProgress={userProgress}
                totalMissions={allMissions?.length}
                completedMissions={userProgress?.completedMissions}
                currentLevel={userProgress?.level}
                nextLevelProgress={65}
              />
            </div>
          </div>

          {/* Mobile Progression Path */}
          <div className="lg:hidden">
            <ProgressionPath
              userProgress={userProgress}
              totalMissions={allMissions?.length}
              completedMissions={userProgress?.completedMissions}
              currentLevel={userProgress?.level}
              nextLevelProgress={65}
            />
          </div>

          {/* Filters */}
          <MissionFilters
            filters={filters}
            onFiltersChange={setFilters}
            missionCounts={missionCounts}
            isMobile={isMobile}
          />

          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-foreground">
                Missões Disponíveis
              </h2>
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {filteredMissions?.length} {filteredMissions?.length === 1 ? 'missão' : 'missões'}
              </div>
            </div>
          </div>

          {/* Mission Grid */}
          <MissionGrid
            missions={filteredMissions}
            loading={loading}
            userPlan={userPlan}
            emptyStateMessage="Nenhuma missão encontrada com os filtros aplicados. Tente ajustar os critérios de busca."
          />

          {/* Quick Actions */}
          <QuickActionButton
            actions={quickActions}
            context="mission"
            position="bottom-right"
          />
        </div>
      </main>
    </div>
  );
};

export default MissionSelection;