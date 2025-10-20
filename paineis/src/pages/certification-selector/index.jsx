import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProgressIndicator from '../../components/ui/ProgressIndicator';
import UserStatusPanel from '../../components/ui/UserStatusPanel';
import QuickActionButton from '../../components/ui/QuickActionButton';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import CertificationCard from './components/CertificationCard';
import ExamConfigPanel from './components/ExamConfigPanel';
import FilterPanel from './components/FilterPanel';
import PerformanceHistory from './components/PerformanceHistory';
import RecommendationPanel from './components/RecommendationPanel';

const CertificationSelector = () => {
  const navigate = useNavigate();
  const [selectedCertification, setSelectedCertification] = useState(null);
  const [examConfig, setExamConfig] = useState({
    difficulty: 'intermediario',
    questionCount: 50,
    mode: 'timed',
    topicFocus: 'all'
  });
  const [filters, setFilters] = useState({
    provider: 'all',
    difficulty: 'all',
    careerPath: 'all',
    showPremiumOnly: false,
    showFreeOnly: false,
    hasPrerequisites: false
  });
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for certifications
  const certifications = [
    {
      id: 1,
      name: "CompTIA Security+",
      provider: "CompTIA",
      description: "Certificação fundamental em segurança cibernética, cobrindo conceitos essenciais de segurança, ameaças, vulnerabilidades e tecnologias de proteção.",
      difficulty: "Iniciante",
      duration: "90 minutos",
      questionCount: 90,
      successRate: 78,
      icon: "Shield",
      isPremium: false,
      topics: ["Ameaças e Vulnerabilidades", "Arquitetura e Design", "Implementação", "Operações e Resposta a Incidentes", "Governança, Risco e Compliance"],
      prerequisites: []
    },
    {
      id: 2,
      name: "CISSP",
      provider: "(ISC)²",
      description: "Certificação avançada para profissionais de segurança da informação com experiência comprovada em design, implementação e gerenciamento de programas de segurança.",
      difficulty: "Avançado",
      duration: "180 minutos",
      questionCount: 125,
      successRate: 65,
      icon: "Crown",
      isPremium: true,
      topics: ["Segurança e Gerenciamento de Riscos", "Segurança de Ativos", "Arquitetura e Engenharia de Segurança", "Comunicação e Segurança de Rede", "Gerenciamento de Identidade e Acesso"],
      prerequisites: ["5 anos de experiência"]
    },
    {
      id: 3,
      name: "CEH",
      provider: "EC-Council",
      description: "Certified Ethical Hacker - certificação focada em técnicas de hacking ético e testes de penetração para identificar vulnerabilidades em sistemas.",
      difficulty: "Intermediário",
      duration: "240 minutos",
      questionCount: 125,
      successRate: 71,
      icon: "Bug",
      isPremium: true,
      topics: ["Footprinting e Reconnaissance", "Scanning Networks", "Enumeration", "Vulnerability Analysis", "System Hacking", "Malware Threats"],
      prerequisites: ["2 anos de experiência em segurança"]
    },
    {
      id: 4,
      name: "CCNA Security",
      provider: "Cisco",
      description: "Certificação Cisco focada em segurança de redes, cobrindo implementação de soluções de segurança em infraestruturas de rede Cisco.",
      difficulty: "Intermediário",
      duration: "90 minutos",
      questionCount: 60,
      successRate: 73,
      icon: "Network",
      isPremium: false,
      topics: ["Fundamentos de Segurança", "Secure Access", "VPN", "Firewalls", "Intrusion Prevention", "Web e Email Security"],
      prerequisites: ["CCNA ou conhecimento equivalente"]
    },
    {
      id: 5,
      name: "CISM",
      provider: "ISACA",
      description: "Certified Information Security Manager - certificação para gerentes de segurança da informação focada em governança e gestão de programas de segurança.",
      difficulty: "Avançado",
      duration: "240 minutos",
      questionCount: 150,
      successRate: 68,
      icon: "Users",
      isPremium: true,
      topics: ["Governança de Segurança da Informação", "Gerenciamento de Riscos", "Desenvolvimento de Programas de Segurança", "Gerenciamento de Incidentes"],
      prerequisites: ["5 anos de experiência em gestão"]
    },
    {
      id: 6,
      name: "AWS Security",
      provider: "Amazon Web Services",
      description: "Certificação especializada em segurança na nuvem AWS, cobrindo implementação de controles de segurança e compliance em ambientes cloud.",
      difficulty: "Intermediário",
      duration: "170 minutos",
      questionCount: 65,
      successRate: 75,
      icon: "Cloud",
      isPremium: true,
      topics: ["Identity and Access Management", "Logging and Monitoring", "Infrastructure Security", "Data Protection", "Incident Response"],
      prerequisites: ["AWS Cloud Practitioner"]
    }
  ];

  // Mock performance history
  const performanceHistory = [
    {
      certificationName: "CompTIA Security+",
      date: "2024-09-25",
      score: 85,
      questionCount: 50,
      duration: "45 min"
    },
    {
      certificationName: "CCNA Security",
      date: "2024-09-20",
      score: 72,
      questionCount: 30,
      duration: "35 min"
    },
    {
      certificationName: "CompTIA Security+",
      date: "2024-09-15",
      score: 68,
      questionCount: 25,
      duration: "28 min"
    }
  ];

  // Mock user data
  const userData = {
    xp: 1247,
    lives: 3,
    maxLives: 5,
    level: 12,
    nextLevelXp: 1500,
    badges: [
      { name: "First Exam", icon: "Award", isNew: false },
      { name: "Security Expert", icon: "Shield", isNew: true },
      { name: "Quick Learner", icon: "Zap", isNew: false }
    ],
    plan: 'free',
    completedMissions: [1, 3]
  };

  // Filter certifications based on current filters and search
  const filteredCertifications = certifications?.filter(cert => {
    // Search filter
    if (searchQuery && !cert?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) && 
        !cert?.provider?.toLowerCase()?.includes(searchQuery?.toLowerCase())) {
      return false;
    }

    // Provider filter
    if (filters?.provider !== 'all' && cert?.provider?.toLowerCase() !== filters?.provider) {
      return false;
    }

    // Difficulty filter
    if (filters?.difficulty !== 'all' && cert?.difficulty?.toLowerCase() !== filters?.difficulty) {
      return false;
    }

    // Premium/Free filters
    if (filters?.showPremiumOnly && !cert?.isPremium) return false;
    if (filters?.showFreeOnly && cert?.isPremium) return false;

    // Prerequisites filter
    if (filters?.hasPrerequisites && cert?.prerequisites?.length === 0) return false;

    return true;
  });

  const handleCertificationSelect = (certification) => {
    setSelectedCertification(certification);
    // Update exam config based on certification defaults
    setExamConfig(prev => ({
      ...prev,
      questionCount: certification?.questionCount
    }));
  };

  const handleStartExam = () => {
    if (!selectedCertification) return;
    
    setIsLoading(true);
    
    // Simulate loading time
    setTimeout(() => {
      navigate('/exam-interface', {
        state: {
          certification: selectedCertification,
          config: examConfig
        }
      });
    }, 1500);
  };

  const quickActions = [
    {
      label: 'Missões Práticas',
      icon: 'Target',
      onClick: () => navigate('/mission-selection')
    },
    {
      label: 'Meus Resultados',
      icon: 'BarChart3',
      onClick: () => navigate('/mission-results')
    }
  ];

  const breadcrumbItems = [
    { label: 'Certificações', path: '/certification-selector', icon: 'Award' }
  ];

  useEffect(() => {
    // Auto-select first certification if none selected
    if (filteredCertifications?.length > 0 && !selectedCertification) {
      setSelectedCertification(filteredCertifications?.[0]);
    }
  }, [filteredCertifications, selectedCertification]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-nav">
        <div className="max-w-7xl mx-auto px-section py-content">
          {/* Header Section */}
          <div className="mb-8">
            <Breadcrumb items={breadcrumbItems} className="mb-4" />
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                  Simulados de Certificação
                </h1>
                <p className="text-muted-foreground">
                  Prepare-se para exames de certificação com simulados realistas e feedback detalhado
                </p>
              </div>
              
              <UserStatusPanel 
                {...userData}
                compact
                className="lg:w-auto"
              />
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Icon 
                name="Search" 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              />
              <input
                type="text"
                placeholder="Buscar certificações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Progress Indicator */}
          <ProgressIndicator
            currentStep={1}
            totalSteps={3}
            context="exam"
            title="Seleção de Certificação"
            className="mb-6"
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Filters & History */}
            <div className="space-y-6">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                isCollapsed={isFilterCollapsed}
                onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
              />
              
              <PerformanceHistory
                history={performanceHistory}
                isCollapsed={isHistoryCollapsed}
                onToggleCollapse={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
              />
            </div>

            {/* Middle Column - Certification Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Certificações Disponíveis
                </h2>
                <span className="text-sm text-muted-foreground">
                  {filteredCertifications?.length} encontrada{filteredCertifications?.length !== 1 ? 's' : ''}
                </span>
              </div>

              {filteredCertifications?.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhuma certificação encontrada
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Tente ajustar os filtros ou termo de busca
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({
                        provider: 'all',
                        difficulty: 'all',
                        careerPath: 'all',
                        showPremiumOnly: false,
                        showFreeOnly: false,
                        hasPrerequisites: false
                      });
                      setSearchQuery('');
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[800px] overflow-y-auto">
                  {filteredCertifications?.map((certification) => (
                    <CertificationCard
                      key={certification?.id}
                      certification={certification}
                      onSelect={handleCertificationSelect}
                      isSelected={selectedCertification?.id === certification?.id}
                      userPlan={userData?.plan}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Configuration & Recommendations */}
            <div className="space-y-6">
              <ExamConfigPanel
                selectedCertification={selectedCertification}
                config={examConfig}
                onConfigChange={setExamConfig}
                onStartExam={handleStartExam}
                isLoading={isLoading}
              />
              
              <RecommendationPanel
                selectedCertification={selectedCertification}
                userLevel="intermediario"
                completedMissions={userData?.completedMissions}
              />
            </div>
          </div>
        </div>
      </main>
      {/* Quick Action Button */}
      <QuickActionButton
        actions={quickActions}
        context="exam"
        position="bottom-right"
      />
    </div>
  );
};

export default CertificationSelector;