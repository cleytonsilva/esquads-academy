// ============================================================================
// EXEMPLO DE USO DOS COMPONENTES TYPESCRIPT DO ESQUADS
// ============================================================================

import React from 'react'
import { MissionDashboard } from '@/components/gamification/MissionDashboard'
import { CertificationSelector } from '@/components/gamification/CertificationSelector'
import { 
  useUserProfile, 
  useMissions, 
  useCertifications, 
  useRanking 
} from '@/hooks'
import { 
  Mission, 
  CertificationExam, 
  UserProfile, 
  RankingEntry,
  MissionFilters,
  CertificationFilters,
  ExamConfig,
  DifficultyLevel,
  MissionCategory,
  CertificationProvider,
  MissionStatus,
  UserPlan,
  BadgeType
} from '@/types'

// ============================================================================
// EXEMPLO DE COMPONENTE PRINCIPAL
// ============================================================================

interface EsquadsAppProps {
  userId: string
}

export const EsquadsApp: React.FC<EsquadsAppProps> = ({ userId }) => {
  const { userProfile, loading: userLoading } = useUserProfile(userId)
  const { missions, filteredMissions, filters, setFilters } = useMissions(userId)
  const { certifications, filteredCertifications } = useCertifications(userId)
  const { globalRanking, userRank } = useRanking(userId)

  if (userLoading.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Erro ao carregar perfil
          </h2>
          <p className="text-muted-foreground">
            Não foi possível carregar o perfil do usuário
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header com informações do usuário */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Bem-vindo, {userProfile.username}!
                </h1>
                <p className="text-muted-foreground">
                  Nível {userProfile.currentLevel} • {userProfile.totalXP} XP • Ranking #{userProfile.globalRanking}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {userProfile.badges.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Badges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userProfile.completedMissions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Missões</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userProfile.lives}
                  </div>
                  <div className="text-sm text-muted-foreground">Vidas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard de Missões */}
          <MissionDashboard userId={userId} />

          {/* Seletor de Certificações */}
          <CertificationSelector userId={userId} />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXEMPLO DE USO DOS HOOKS
// ============================================================================

export const ExampleHooksUsage: React.FC = () => {
  const userId = "user_123"

  // Hook de perfil do usuário
  const { 
    userProfile, 
    loading: userLoading, 
    updateXP, 
    addBadge, 
    updateLevel 
  } = useUserProfile(userId)

  // Hook de missões
  const { 
    missions, 
    filteredMissions, 
    filters, 
    setFilters, 
    startMission, 
    completeMission 
  } = useMissions(userId)

  // Hook de certificações
  const { 
    certifications, 
    filteredCertifications, 
    startExam, 
    getExamResults 
  } = useCertifications(userId)

  // Hook de ranking
  const { 
    globalRanking, 
    userRank, 
    refreshRanking, 
    getLeaderboard 
  } = useRanking(userId)

  // Exemplo de uso dos hooks
  const handleCompleteMission = async (missionId: string) => {
    try {
      await completeMission(missionId, 85, 15) // score: 85, timeSpent: 15 min
      await updateXP(100, missionId, "Missão completada com sucesso!")
      updateLevel()
    } catch (error) {
      console.error('Erro ao completar missão:', error)
    }
  }

  const handleStartExam = async (examId: string) => {
    const config: ExamConfig = {
      difficulty: DifficultyLevel.Intermediate,
      questionCount: 50,
      mode: 'timed',
      topicFocus: 'all',
      timeLimit: 90,
      showExplanations: true,
      allowSkip: false
    }

    try {
      await startExam(examId, config)
    } catch (error) {
      console.error('Erro ao iniciar exame:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Exemplo de filtros de missões */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Filtros de Missões</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ 
              ...filters, 
              category: e.target.value as MissionCategory | "all" 
            })}
            className="px-3 py-2 border border-border rounded-md"
          >
            <option value="all">Todas as categorias</option>
            <option value={MissionCategory.Firewall}>Firewall</option>
            <option value={MissionCategory.CloudSecurity}>Segurança Cloud</option>
            <option value={MissionCategory.Forensics}>Forense</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ 
              ...filters, 
              difficulty: e.target.value as DifficultyLevel | "all" 
            })}
            className="px-3 py-2 border border-border rounded-md"
          >
            <option value="all">Todas as dificuldades</option>
            <option value={DifficultyLevel.Basic}>Básico</option>
            <option value={DifficultyLevel.Intermediate}>Intermediário</option>
            <option value={DifficultyLevel.Advanced}>Avançado</option>
          </select>

          <input
            type="text"
            placeholder="Buscar missões..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-3 py-2 border border-border rounded-md"
          />
        </div>
      </div>

      {/* Exemplo de lista de missões */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Missões Disponíveis ({filteredMissions.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMissions.map((mission) => (
            <div key={mission.id} className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">{mission.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{mission.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {mission.xpReward} XP • {mission.duration} min
                </span>
                <button
                  onClick={() => handleCompleteMission(mission.id)}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                >
                  Completar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exemplo de lista de certificações */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Certificações Disponíveis ({filteredCertifications.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCertifications.map((certification) => (
            <div key={certification.id} className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">{certification.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{certification.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {certification.provider} • {certification.questionCount} questões
                </span>
                <button
                  onClick={() => handleStartExam(certification.id)}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                >
                  Iniciar Exame
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exemplo de ranking */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Ranking Global (Sua posição: #{userRank})
        </h3>
        <div className="space-y-2">
          {globalRanking.slice(0, 10).map((entry, index) => (
            <div key={entry.userId} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span className="font-medium text-foreground">{entry.username}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {entry.totalXP} XP • Nível {entry.level}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXEMPLO DE CRIAÇÃO DE DADOS MOCK
// ============================================================================

export const createMockData = () => {
  const mockUserProfile: UserProfile = {
    id: "user_123",
    username: "cybersecurity_student",
    email: "student@esquads.com",
    totalXP: 1247,
    currentLevel: 2,
    completedMissions: ["mission_1", "mission_3"],
    badges: [
      {
        id: "badge_1",
        name: "Primeiro Firewall",
        description: "Completou sua primeira missão de firewall",
        icon: "Shield",
        type: BadgeType.Mission,
        xpReward: 50,
        earnedAt: new Date(),
        isNew: false,
        rarity: "COMMON"
      }
    ],
    lives: 3,
    maxLives: 5,
    currentPlan: UserPlan.Free,
    globalRanking: 42,
    createdAt: new Date(),
    lastActiveAt: new Date(),
    preferences: {
      theme: "system",
      language: "pt",
      notifications: {
        email: true,
        push: true,
        achievements: true,
        ranking: true
      },
      difficulty: DifficultyLevel.Intermediate,
      autoSave: true
    }
  }

  const mockMission: Mission = {
    id: "mission_1",
    title: "Configuração Básica de Firewall",
    description: "Aprenda os fundamentos de configuração de firewall",
    category: MissionCategory.Firewall,
    difficultyLevel: DifficultyLevel.Basic,
    xpReward: 100,
    isLocked: false,
    badgeOnCompletion: "firewall_basics",
    duration: 15,
    tools: ["iptables", "pfSense"],
    prerequisites: [],
    isPremium: false,
    status: MissionStatus.NotStarted,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockCertification: CertificationExam = {
    id: "cert_1",
    provider: CertificationProvider.AWS,
    title: "AWS Security Specialty",
    description: "Certificação especializada em segurança AWS",
    questionCount: 65,
    difficultyLevel: DifficultyLevel.Intermediate,
    duration: 170,
    passPercentage: 70,
    questions: [],
    xpReward: 300,
    isPremium: true,
    topics: ["IAM", "CloudTrail", "GuardDuty"],
    prerequisites: ["AWS Cloud Practitioner"],
    successRate: 75,
    icon: "Cloud",
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockRankingEntry: RankingEntry = {
    userId: "user_1",
    username: "cyber_master",
    totalXP: 5000,
    level: 10,
    badges: [],
    completedMissions: 25,
    completedExams: 8,
    rank: 1,
    lastActiveAt: new Date()
  }

  return {
    mockUserProfile,
    mockMission,
    mockCertification,
    mockRankingEntry
  }
}

export default EsquadsApp
