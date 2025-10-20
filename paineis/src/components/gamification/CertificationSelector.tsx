// ============================================================================
// COMPONENTE CERTIFICATION SELECTOR MELHORADO COM GAMIFICAÇÃO
// ============================================================================

import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CertificationExam, 
  UserProfile, 
  CertificationFilters,
  ExamConfig,
  CertificationProvider,
  DifficultyLevel,
  UserPlan
} from '../../types'
import { useCertifications, useUserProfile } from '../../hooks'
import Button from '../ui/Button'
import Icon from '../AppIcon'

// ============================================================================
// INTERFACES DE PROPS
// ============================================================================

interface CertificationSelectorProps {
  userId: string
  className?: string
}

interface CertificationCardProps {
  certification: CertificationExam
  onSelect?: (certification: CertificationExam) => void
  isSelected?: boolean
  userPlan: UserPlan
  userLevel: number
  className?: string
}

interface ExamConfigPanelProps {
  selectedCertification: CertificationExam | null
  config: ExamConfig
  onConfigChange: (config: ExamConfig) => void
  onStartExam: () => void
  isLoading: boolean
  userLevel: number
  className?: string
}

interface FilterPanelProps {
  filters: CertificationFilters
  onFiltersChange: (filters: CertificationFilters) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  className?: string
}

interface PerformanceHistoryProps {
  history: any[]
  isCollapsed: boolean
  onToggleCollapse: () => void
  className?: string
}

interface RecommendationPanelProps {
  selectedCertification: CertificationExam | null
  userLevel: number
  completedMissions: string[]
  className?: string
}

// ============================================================================
// COMPONENTE PRINCIPAL CERTIFICATION SELECTOR
// ============================================================================

export const CertificationSelector: React.FC<CertificationSelectorProps> = ({ 
  userId, 
  className = "" 
}) => {
  const navigate = useNavigate()
  const { userProfile, loading: userLoading } = useUserProfile(userId)
  const { 
    certifications, 
    filteredCertifications, 
    filters, 
    setFilters, 
    loading: certificationsLoading 
  } = useCertifications(userId)

  const [selectedCertification, setSelectedCertification] = useState<CertificationExam | null>(null)
  const [examConfig, setExamConfig] = useState<ExamConfig>({
    difficulty: DifficultyLevel.Intermediate,
    questionCount: 50,
    mode: 'timed',
    topicFocus: 'all',
    timeLimit: 90,
    showExplanations: true,
    allowSkip: false
  })
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true)
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Mock performance history - substituir por dados reais
  const performanceHistory = [
    {
      certificationName: "CompTIA Security+",
      date: "2024-09-25",
      score: 85,
      questionCount: 50,
      duration: "45 min"
    },
    {
      certificationName: "AWS Security",
      date: "2024-09-20",
      score: 72,
      questionCount: 30,
      duration: "35 min"
    }
  ]

  const handleCertificationSelect = (certification: CertificationExam) => {
    setSelectedCertification(certification)
    setExamConfig(prev => ({
      ...prev,
      questionCount: certification.questionCount,
      timeLimit: certification.duration
    }))
  }

  const handleStartExam = async () => {
    if (!selectedCertification) return
    
    setIsLoading(true)
    
    // Simular carregamento
    setTimeout(() => {
      navigate('/exam-interface', {
        state: {
          certification: selectedCertification,
          config: examConfig
        }
      })
    }, 1500)
  }

  const handleFilterChange = (newFilters: Partial<CertificationFilters>) => {
    setFilters({ ...filters, ...newFilters })
  }

  if (userLoading.isLoading || certificationsLoading.isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <Icon name="AlertCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Erro ao carregar perfil
        </h3>
        <p className="text-muted-foreground">
          Não foi possível carregar o perfil do usuário
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Simulados de Certificação
            </h1>
            <p className="text-muted-foreground">
              Prepare-se para exames de certificação com simulados realistas e feedback detalhado
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Nível atual</div>
              <div className="text-lg font-semibold text-foreground">
                {userProfile.currentLevel}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">XP Total</div>
              <div className="text-lg font-semibold text-primary">
                {userProfile.totalXP}
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative max-w-md">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <input
              type="text"
              placeholder="Buscar certificações..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Filters & History */}
        <div className="space-y-6">
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFilterChange}
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
              {filteredCertifications.length} encontrada{filteredCertifications.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredCertifications.length === 0 ? (
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
                onClick={() => setFilters({
                  search: '',
                  provider: 'all',
                  difficulty: 'all',
                  careerPath: 'all',
                  showPremiumOnly: false,
                  showFreeOnly: false,
                  hasPrerequisites: false,
                  sortBy: 'recommended'
                })}
              >
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[800px] overflow-y-auto">
              {filteredCertifications.map((certification) => (
                <CertificationCard
                  key={certification.id}
                  certification={certification}
                  onSelect={handleCertificationSelect}
                  isSelected={selectedCertification?.id === certification.id}
                  userPlan={userProfile.currentPlan}
                  userLevel={userProfile.currentLevel}
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
            userLevel={userProfile.currentLevel}
          />
          
          <RecommendationPanel
            selectedCertification={selectedCertification}
            userLevel={userProfile.currentLevel}
            completedMissions={userProfile.completedMissions}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE CERTIFICATION CARD
// ============================================================================

export const CertificationCard: React.FC<CertificationCardProps> = ({
  certification,
  onSelect,
  isSelected,
  userPlan,
  userLevel,
  className = ""
}) => {
  const getProviderColor = (provider: CertificationProvider): string => {
    const colors = {
      [CertificationProvider.AWS]: "bg-orange-100 text-orange-600",
      [CertificationProvider.Azure]: "bg-blue-100 text-blue-600",
      [CertificationProvider.GCP]: "bg-green-100 text-green-600",
      [CertificationProvider.CompTIA]: "bg-purple-100 text-purple-600",
      [CertificationProvider.Cisco]: "bg-cyan-100 text-cyan-600",
      [CertificationProvider.ISC2]: "bg-red-100 text-red-600",
      [CertificationProvider.ECCOUNCIL]: "bg-emerald-100 text-emerald-600",
      [CertificationProvider.ISACA]: "bg-indigo-100 text-indigo-600"
    }
    return colors[provider] || colors[CertificationProvider.CompTIA]
  }

  const getDifficultyColor = (difficulty: DifficultyLevel): string => {
    const colors = {
      [DifficultyLevel.Basic]: "text-green-600 bg-green-100",
      [DifficultyLevel.Intermediate]: "text-yellow-600 bg-yellow-100",
      [DifficultyLevel.Advanced]: "text-orange-600 bg-orange-100",
      [DifficultyLevel.Expert]: "text-red-600 bg-red-100"
    }
    return colors[difficulty] || colors[DifficultyLevel.Basic]
  }

  const getDifficultyLabel = (difficulty: DifficultyLevel): string => {
    const labels = {
      [DifficultyLevel.Basic]: "Básico",
      [DifficultyLevel.Intermediate]: "Intermediário",
      [DifficultyLevel.Advanced]: "Avançado",
      [DifficultyLevel.Expert]: "Especialista"
    }
    return labels[difficulty] || labels[DifficultyLevel.Basic]
  }

  const isLocked = certification.difficultyLevel === DifficultyLevel.Expert && userLevel < 5
  const canAccess = !certification.isPremium || userPlan !== UserPlan.Free

  return (
    <div 
      className={`bg-card border border-border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      } ${isLocked ? 'opacity-50' : ''} ${className}`}
      onClick={() => !isLocked && onSelect?.(certification)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name={certification.icon} size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{certification.title}</h3>
            <p className="text-sm text-muted-foreground">{certification.provider}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProviderColor(certification.provider)}`}>
            {certification.provider}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(certification.difficultyLevel)}`}>
            {getDifficultyLabel(certification.difficultyLevel)}
          </span>
          {certification.isPremium && (
            <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
              Premium
            </span>
          )}
        </div>
      </div>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {certification.description}
      </p>

      {/* Informações da Certificação */}
      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center space-x-1">
          <Icon name="FileText" size={16} />
          <span>{certification.questionCount} questões</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Clock" size={16} />
          <span>{certification.duration} min</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Target" size={16} />
          <span>{certification.passPercentage}% aprovação</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Star" size={16} />
          <span>{certification.xpReward} XP</span>
        </div>
      </div>

      {/* Taxa de Sucesso */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>Taxa de sucesso</span>
          <span>{certification.successRate}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              certification.successRate >= 80 ? 'bg-green-500' :
              certification.successRate >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${certification.successRate}%` }}
          />
        </div>
      </div>

      {/* Tópicos */}
      {certification.topics.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Tópicos principais:</p>
          <div className="flex flex-wrap gap-1">
            {certification.topics.slice(0, 3).map((topic, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
              >
                {topic}
              </span>
            ))}
            {certification.topics.length > 3 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                +{certification.topics.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Prerequisites */}
      {certification.prerequisites.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Pré-requisitos:</p>
          <div className="flex flex-wrap gap-1">
            {certification.prerequisites.map((prereq, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs"
              >
                {prereq}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Status de Acesso */}
      <div className="flex items-center justify-between">
        {isLocked ? (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon name="Lock" size={16} />
            <span className="text-sm">Nível {userLevel} necessário</span>
          </div>
        ) : !canAccess ? (
          <div className="flex items-center space-x-2 text-purple-600">
            <Icon name="Crown" size={16} />
            <span className="text-sm">Upgrade para Pro</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-green-600">
            <Icon name="Check" size={16} />
            <span className="text-sm">Disponível</span>
          </div>
        )}
        
        {isSelected && (
          <div className="flex items-center space-x-1 text-primary">
            <Icon name="CheckCircle" size={16} />
            <span className="text-sm font-medium">Selecionada</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE EXAM CONFIG PANEL
// ============================================================================

export const ExamConfigPanel: React.FC<ExamConfigPanelProps> = ({
  selectedCertification,
  config,
  onConfigChange,
  onStartExam,
  isLoading,
  userLevel,
  className = ""
}) => {
  if (!selectedCertification) {
    return (
      <div className={`bg-card border border-border rounded-lg p-6 text-center ${className}`}>
        <Icon name="Award" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Selecione uma Certificação
        </h3>
        <p className="text-muted-foreground">
          Escolha uma certificação para configurar e iniciar o exame
        </p>
      </div>
    )
  }

  const isLocked = selectedCertification.difficultyLevel === DifficultyLevel.Expert && userLevel < 5

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Configuração do Exame
      </h3>

      <div className="space-y-4">
        {/* Número de Questões */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Número de Questões
          </label>
          <select
            value={config.questionCount}
            onChange={(e) => onConfigChange({ ...config, questionCount: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={25}>25 questões</option>
            <option value={50}>50 questões</option>
            <option value={75}>75 questões</option>
            <option value={selectedCertification.questionCount}>
              Todas ({selectedCertification.questionCount})
            </option>
          </select>
        </div>

        {/* Modo do Exame */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Modo do Exame
          </label>
          <select
            value={config.mode}
            onChange={(e) => onConfigChange({ ...config, mode: e.target.value as 'timed' | 'practice' | 'review' })}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="timed">Cronometrado</option>
            <option value="practice">Prática</option>
            <option value="review">Revisão</option>
          </select>
        </div>

        {/* Foco em Tópicos */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Foco em Tópicos
          </label>
          <select
            value={config.topicFocus}
            onChange={(e) => onConfigChange({ ...config, topicFocus: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos os tópicos</option>
            {selectedCertification.topics.map((topic, index) => (
              <option key={index} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        {/* Opções Adicionais */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.showExplanations}
              onChange={(e) => onConfigChange({ ...config, showExplanations: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground">Mostrar explicações</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.allowSkip}
              onChange={(e) => onConfigChange({ ...config, allowSkip: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground">Permitir pular questões</span>
          </label>
        </div>

        {/* Botão de Início */}
        <Button
          onClick={onStartExam}
          disabled={isLocked || isLoading}
          loading={isLoading}
          fullWidth
          className="mt-6"
        >
          {isLocked ? (
            <>
              <Icon name="Lock" size={16} className="mr-2" />
              Nível Insuficiente
            </>
          ) : isLoading ? (
            'Preparando Exame...'
          ) : (
            <>
              <Icon name="Play" size={16} className="mr-2" />
              Iniciar Exame
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE FILTER PANEL
// ============================================================================

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  isCollapsed,
  onToggleCollapse,
  className = ""
}) => {
  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      <button
        onClick={onToggleCollapse}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <h3 className="font-semibold text-foreground">Filtros</h3>
        <Icon 
          name={isCollapsed ? "ChevronDown" : "ChevronUp"} 
          size={20} 
          className="text-muted-foreground" 
        />
      </button>

      {!isCollapsed && (
        <div className="p-4 pt-0 space-y-4">
          {/* Provider Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Provedor
            </label>
            <select
              value={filters.provider}
              onChange={(e) => onFiltersChange({ ...filters, provider: e.target.value as CertificationProvider | "all" })}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos os provedores</option>
              <option value={CertificationProvider.AWS}>AWS</option>
              <option value={CertificationProvider.Azure}>Azure</option>
              <option value={CertificationProvider.GCP}>GCP</option>
              <option value={CertificationProvider.CompTIA}>CompTIA</option>
              <option value={CertificationProvider.Cisco}>Cisco</option>
              <option value={CertificationProvider.ISC2}>(ISC)²</option>
              <option value={CertificationProvider.ECCOUNCIL}>EC-Council</option>
              <option value={CertificationProvider.ISACA}>ISACA</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Dificuldade
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => onFiltersChange({ ...filters, difficulty: e.target.value as DifficultyLevel | "all" })}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todas as dificuldades</option>
              <option value={DifficultyLevel.Basic}>Básico</option>
              <option value={DifficultyLevel.Intermediate}>Intermediário</option>
              <option value={DifficultyLevel.Advanced}>Avançado</option>
              <option value={DifficultyLevel.Expert}>Especialista</option>
            </select>
          </div>

          {/* Premium/Free Filters */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.showPremiumOnly}
                onChange={(e) => onFiltersChange({ ...filters, showPremiumOnly: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">Apenas Premium</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.showFreeOnly}
                onChange={(e) => onFiltersChange({ ...filters, showFreeOnly: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">Apenas Gratuitas</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.hasPrerequisites}
                onChange={(e) => onFiltersChange({ ...filters, hasPrerequisites: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">Com pré-requisitos</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTE PERFORMANCE HISTORY
// ============================================================================

export const PerformanceHistory: React.FC<PerformanceHistoryProps> = ({
  history,
  isCollapsed,
  onToggleCollapse,
  className = ""
}) => {
  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      <button
        onClick={onToggleCollapse}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <h3 className="font-semibold text-foreground">Histórico de Performance</h3>
        <Icon 
          name={isCollapsed ? "ChevronDown" : "ChevronUp"} 
          size={20} 
          className="text-muted-foreground" 
        />
      </button>

      {!isCollapsed && (
        <div className="p-4 pt-0">
          {history.length === 0 ? (
            <div className="text-center py-4">
              <Icon name="BarChart3" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhum exame realizado ainda
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((exam, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {exam.certificationName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {exam.date} • {exam.questionCount} questões
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      exam.score >= 80 ? 'text-green-600' :
                      exam.score >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {exam.score}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {exam.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTE RECOMMENDATION PANEL
// ============================================================================

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  selectedCertification,
  userLevel,
  completedMissions,
  className = ""
}) => {
  const recommendations = useMemo(() => {
    if (!selectedCertification) return []

    const recs: Array<{
      type: 'warning' | 'info' | 'success'
      icon: string
      title: string
      message: string
    }> = []
    
    // Recomendação baseada no nível
    if (selectedCertification.difficultyLevel === DifficultyLevel.Expert && userLevel < 5) {
      recs.push({
        type: 'warning',
        icon: 'AlertTriangle',
        title: 'Nível Recomendado',
        message: 'Complete mais missões para atingir o nível 5 antes de tentar esta certificação.'
      })
    }

    // Recomendação baseada em missões completadas
    if (selectedCertification.prerequisites.length > 0) {
      recs.push({
        type: 'info',
        icon: 'Info',
        title: 'Pré-requisitos',
        message: 'Certifique-se de ter completado as missões relacionadas antes de iniciar o exame.'
      })
    }

    return recs
  }, [selectedCertification, userLevel, completedMissions])

  if (!selectedCertification) {
    return (
      <div className={`bg-card border border-border rounded-lg p-6 text-center ${className}`}>
        <Icon name="Lightbulb" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Recomendações
        </h3>
        <p className="text-muted-foreground">
          Selecione uma certificação para ver recomendações personalizadas
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Recomendações
      </h3>

      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div key={index} className={`p-3 rounded-lg border ${
            rec.type === 'warning' ? 'bg-orange-50 border-orange-200' :
            rec.type === 'info' ? 'bg-blue-50 border-blue-200' :
            'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-start space-x-2">
              <Icon 
                name={rec.icon} 
                size={16} 
                className={`mt-0.5 ${
                  rec.type === 'warning' ? 'text-orange-600' :
                  rec.type === 'info' ? 'text-blue-600' :
                  'text-green-600'
                }`} 
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {rec.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {rec.message}
                </p>
              </div>
            </div>
          </div>
        ))}

        {recommendations.length === 0 && (
          <div className="text-center py-4">
            <Icon name="CheckCircle" size={32} className="text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Você está pronto para esta certificação!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CertificationSelector
